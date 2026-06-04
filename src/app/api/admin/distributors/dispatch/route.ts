import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Dispatch stock to a reseller on credit (or upfront). Enforces the credit limit for
// consignment-phase sellers: a dispatch can't push their balance owed past the limit.
// This is where retention-of-title stock enters the network and the ledger.
export const dynamic = 'force-dynamic';

interface DispatchItem {
  productId: string;
  quantity: number;
  unitWholesaleCents: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await request.json();
    const distributorId = body?.distributorId as string | undefined;
    const items = (body?.items || []) as DispatchItem[];

    if (!distributorId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'distributorId and items are required' }, { status: 400 });
    }

    const { data: dist, error: distErr } = await supabase
      .from('distributors')
      .select('id, phase, credit_limit_cents, balance_owed_cents')
      .eq('id', distributorId)
      .single();
    if (distErr || !dist) return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });

    let dispatchValue = 0;
    for (const it of items) {
      if (
        !it.productId ||
        !Number.isFinite(it.quantity) || it.quantity <= 0 ||
        !Number.isFinite(it.unitWholesaleCents) || it.unitWholesaleCents < 0
      ) {
        return NextResponse.json({ error: 'Invalid item in dispatch' }, { status: 400 });
      }
      dispatchValue += it.quantity * it.unitWholesaleCents;
    }

    const currentOwed = dist.balance_owed_cents || 0;
    const creditLimit = dist.credit_limit_cents || 0;

    // Consignment-phase sellers are credit-capped; buy_upfront sellers prepay (no cap).
    if (dist.phase === 'consignment' && currentOwed + dispatchValue > creditLimit) {
      return NextResponse.json(
        {
          error: 'Dispatch exceeds available credit',
          availableCreditCents: Math.max(creditLimit - currentOwed, 0),
          requestedCents: dispatchValue,
        },
        { status: 409 }
      );
    }

    // Apply stock-on-hand per line.
    for (const it of items) {
      const { data: existing } = await supabase
        .from('distributor_stock')
        .select('id, qty_on_hand, qty_dispatched_total')
        .eq('distributor_id', distributorId)
        .eq('product_id', it.productId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('distributor_stock')
          .update({
            qty_on_hand: (existing.qty_on_hand || 0) + it.quantity,
            qty_dispatched_total: (existing.qty_dispatched_total || 0) + it.quantity,
            unit_wholesale_cents: it.unitWholesaleCents,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('distributor_stock').insert({
          distributor_id: distributorId,
          product_id: it.productId,
          qty_on_hand: it.quantity,
          qty_dispatched_total: it.quantity,
          qty_sold_total: 0,
          unit_wholesale_cents: it.unitWholesaleCents,
        });
      }
    }

    const newBalance = currentOwed + dispatchValue;
    await supabase
      .from('distributors')
      .update({ balance_owed_cents: newBalance, updated_at: new Date().toISOString() })
      .eq('id', distributorId);

    const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
    await supabase.from('distributor_ledger').insert({
      distributor_id: distributorId,
      entry_type: 'stock_dispatch',
      amount_cents: dispatchValue,
      balance_after_cents: newBalance,
      note: `Stock dispatched — ${totalUnits} unit(s)`,
    });

    return NextResponse.json({
      success: true,
      balanceOwedCents: newBalance,
      dispatchedValueCents: dispatchValue,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
