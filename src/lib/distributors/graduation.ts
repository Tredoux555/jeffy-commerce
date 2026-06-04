import type { createAdminClient } from '@/lib/supabase/server';

// Auto-graduation: consignment → buy_upfront.
//
// A new seller takes stock on credit (consignment, retention of title). Once they've
// proven the model — cleared their consignment debt and shifted enough volume/value —
// they graduate to buying upfront for bigger margins. This used to be a manual admin
// toggle; this helper lets it happen automatically the moment the thresholds are met
// (e.g. right after a sale is settled or a repayment is recorded).
//
// Thresholds are env-tunable; the defaults are deliberately conservative.
//   GRAD_MIN_SALES         minimum settled sales (count)     default 10
//   GRAD_MIN_SALES_CENTS   minimum lifetime sales value      default 500000 (R5,000)
// A seller only graduates when balance_owed_cents == 0 (consignment debt cleared).

type SupabaseAdmin = Awaited<ReturnType<typeof createAdminClient>>;

const MIN_SALES = Number(process.env.GRAD_MIN_SALES || 10);
const MIN_SALES_CENTS = Number(process.env.GRAD_MIN_SALES_CENTS || 500000);

export interface GraduationResult {
  graduated: boolean;
  reason?: string;
}

export async function maybeGraduate(
  supabase: SupabaseAdmin,
  distributorId: string
): Promise<GraduationResult> {
  try {
    const { data: dist } = await supabase
      .from('distributors')
      .select('id, phase, status, balance_owed_cents')
      .eq('id', distributorId)
      .single();

    if (!dist) return { graduated: false, reason: 'not_found' };
    if (dist.phase !== 'consignment') return { graduated: false, reason: 'already_buy_upfront' };
    if (dist.status !== 'active') return { graduated: false, reason: 'not_active' };
    if ((dist.balance_owed_cents || 0) > 0) return { graduated: false, reason: 'debt_outstanding' };

    // Settled sales = ledger 'sale' entries (amount is negative wholesale; use abs value).
    const { data: sales } = await supabase
      .from('distributor_ledger')
      .select('amount_cents')
      .eq('distributor_id', distributorId)
      .eq('entry_type', 'sale');

    const saleRows = (sales || []) as { amount_cents: number | null }[];
    const salesCount = saleRows.length;
    const salesValueCents = saleRows.reduce((s, r) => s + Math.abs(r.amount_cents || 0), 0);

    if (salesCount < MIN_SALES || salesValueCents < MIN_SALES_CENTS) {
      return { graduated: false, reason: 'thresholds_not_met' };
    }

    await supabase
      .from('distributors')
      .update({ phase: 'buy_upfront', updated_at: new Date().toISOString() })
      .eq('id', distributorId);

    await supabase.from('distributor_ledger').insert({
      distributor_id: distributorId,
      entry_type: 'adjustment',
      amount_cents: 0,
      balance_after_cents: 0,
      note: `Auto-graduated to buy_upfront — ${salesCount} sales / R${(salesValueCents / 100).toFixed(0)} settled, debt cleared`,
    });

    return { graduated: true };
  } catch {
    // Graduation is best-effort; never block the caller's primary flow.
    return { graduated: false, reason: 'error' };
  }
}
