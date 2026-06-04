import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Independent-reseller dashboard data.
// Lookup by `key` = the reseller's email OR phone (as captured at /distributors/join).
//
// NOTE (Phase D-finish): this endpoint is the data layer for the reseller dashboard.
// Before go-live it must be gated behind the site's existing email/phone magic-link so a
// reseller can only read their OWN row. Today it accepts a key param for build/testing;
// wire the magic-link session check here (replace the `key` lookup with the session identity).

export const dynamic = 'force-dynamic';

function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function GET(request: NextRequest) {
  try {
    const token = (request.nextUrl.searchParams.get('token') || '').trim();
    const key = (request.nextUrl.searchParams.get('key') || '').trim();
    if (!token && !key) {
      return NextResponse.json({ error: 'A login link (token) is required.' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Preferred path: a magic-link token → resolve the reseller's email.
    let tokenEmail: string | null = null;
    if (token) {
      const { data: ml } = await supabase
        .from('magic_links')
        .select('email, expires_at')
        .eq('token', token)
        .maybeSingle();
      if (!ml) return NextResponse.json({ error: 'Invalid or expired link.' }, { status: 401 });
      if (new Date(ml.expires_at) < new Date()) {
        return NextResponse.json({ error: 'This link has expired — request a new one.' }, { status: 410 });
      }
      tokenEmail = String(ml.email).toLowerCase();
    }

    // Resolve the reseller: by token email (secure) or by key (legacy/admin lookup).
    const query = supabase.from('distributors').select('*');
    const { data: distributor, error: dErr } = tokenEmail
      ? await query.eq('email', tokenEmail).maybeSingle()
      : await query.or(`email.eq.${key},phone.eq.${key}`).maybeSingle();

    if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 });
    if (!distributor) {
      return NextResponse.json({ error: 'No reseller found for that email or phone.' }, { status: 404 });
    }

    // Stock on hand, with product names + retail price.
    const { data: stock } = await supabase
      .from('distributor_stock')
      .select('*, products(name, selling_price_cents)')
      .eq('distributor_id', distributor.id);

    // Recent ledger (most recent first).
    const { data: ledger } = await supabase
      .from('distributor_ledger')
      .select('*, products(name)')
      .eq('distributor_id', distributor.id)
      .order('created_at', { ascending: false })
      .limit(100);

    const stockRows = (stock || []) as any[];
    const ledgerRows = (ledger || []) as any[];

    // Today's deliveries = sale entries booked today, grouped by product.
    const today = startOfTodayISO();
    const deliveryMap = new Map<string, { product: string; qty: number; amount_cents: number }>();
    for (const e of ledgerRows) {
      if (e.entry_type === 'sale' && e.created_at >= today) {
        const name = e.products?.name || 'Item';
        const cur = deliveryMap.get(name) || { product: name, qty: 0, amount_cents: 0 };
        cur.qty += Math.abs(e.quantity || 0);
        cur.amount_cents += Math.abs(e.amount_cents || 0);
        deliveryMap.set(name, cur);
      }
    }
    const deliveriesToday = Array.from(deliveryMap.values()).sort((a, b) => b.qty - a.qty);

    // Summary figures.
    const unitsOnHand = stockRows.reduce((s, r) => s + (r.qty_on_hand || 0), 0);
    const stockValueOwedCents = stockRows.reduce(
      (s, r) => s + (r.qty_on_hand || 0) * (r.unit_wholesale_cents || 0), 0);
    const balanceOwedCents = distributor.balance_owed_cents || 0;
    const creditLimitCents = distributor.credit_limit_cents || 0;
    const availableCreditCents = Math.max(creditLimitCents - balanceOwedCents, 0);
    const marginPayableCents = distributor.margin_payable_cents || 0;

    return NextResponse.json({
      success: true,
      distributor: {
        id: distributor.id,
        owner_name: distributor.owner_name,
        business_name: distributor.business_name,
        suburb: distributor.suburb,
        city: distributor.city,
        province: distributor.province,
        status: distributor.status,
        phase: distributor.phase,
        payfastLinked: !!distributor.payfast_merchant_id,
      },
      summary: {
        unitsOnHand,
        stockValueOwedCents,
        balanceOwedCents,
        creditLimitCents,
        availableCreditCents,
        marginPayableCents,
      },
      stock: stockRows.map((r) => ({
        product: r.products?.name || 'Item',
        qty_on_hand: r.qty_on_hand || 0,
        unit_wholesale_cents: r.unit_wholesale_cents || 0,
        retail_cents: r.products?.selling_price_cents || 0,
        margin_cents: Math.max((r.products?.selling_price_cents || 0) - (r.unit_wholesale_cents || 0), 0),
      })),
      deliveriesToday,
      ledger: ledgerRows.slice(0, 50).map((e) => ({
        entry_type: e.entry_type,
        product: e.products?.name || null,
        quantity: e.quantity,
        amount_cents: e.amount_cents,
        balance_after_cents: e.balance_after_cents,
        note: e.note,
        created_at: e.created_at,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
