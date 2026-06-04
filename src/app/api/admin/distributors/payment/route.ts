import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { maybeGraduate } from '@/lib/distributors/graduation';

// Record a reseller repayment against their consignment balance. Reduces balance_owed,
// writes a 'payment' ledger entry, then re-checks auto-graduation (clearing the debt is
// the trigger). Admin-initiated (e.g. seller paid a deposit / settled their account).
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await request.json();
    const distributorId = body?.distributorId as string | undefined;
    const amountCents = Number(body?.amountCents);
    const note = (body?.note as string) || '';

    if (!distributorId || !Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json({ error: 'distributorId and a positive amountCents are required' }, { status: 400 });
    }

    const { data: dist, error: dErr } = await supabase
      .from('distributors')
      .select('id, balance_owed_cents')
      .eq('id', distributorId)
      .single();
    if (dErr || !dist) return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });

    const newBalance = Math.max((dist.balance_owed_cents || 0) - amountCents, 0);

    await supabase
      .from('distributors')
      .update({ balance_owed_cents: newBalance, updated_at: new Date().toISOString() })
      .eq('id', distributorId);

    await supabase.from('distributor_ledger').insert({
      distributor_id: distributorId,
      entry_type: 'payment',
      amount_cents: -amountCents,
      balance_after_cents: newBalance,
      note: note ? `Payment received — ${note}` : 'Payment received',
    });

    const grad = await maybeGraduate(supabase, distributorId);

    return NextResponse.json({
      success: true,
      balanceOwedCents: newBalance,
      graduated: grad.graduated,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
