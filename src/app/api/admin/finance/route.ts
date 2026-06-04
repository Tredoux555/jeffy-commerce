import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { VAT_REGISTERED } from '@/lib/vat';

// Live finance summary — real revenue, landed COGS, gross margin, and reseller balances.
// Replaces the mock figures in /admin/reports with numbers computed from the database.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createAdminClient();

    // Paid orders + their line items (unit_cost_cents is the landed cost snapshot).
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, total_cents, vat_cents, status, created_at, paid_at, distributor_id, jeffy_wholesale_cents, seller_margin_cents, order_items(unit_cost_cents, quantity, total_cents)')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = (orders || []) as any[];
    const now = Date.now();
    const D30 = 30 * 24 * 60 * 60 * 1000;

    const agg = (list: any[]) => {
      let revenue = 0, cogs = 0;
      for (const o of list) {
        revenue += o.total_cents || 0;
        for (const it of (o.order_items || [])) {
          cogs += (it.unit_cost_cents || 0) * (it.quantity || 0);
        }
      }
      const grossProfit = revenue - cogs;
      return {
        orders: list.length,
        revenueCents: revenue,
        cogsCents: cogs,
        grossProfitCents: grossProfit,
        grossMarginPct: revenue > 0 ? grossProfit / revenue : 0,
        aovCents: list.length > 0 ? Math.round(revenue / list.length) : 0,
      };
    };

    const last30 = rows.filter((o) => {
      const t = new Date(o.paid_at || o.created_at).getTime();
      return now - t <= D30;
    });

    // Reseller balances (working capital out in the network).
    const { data: dists } = await supabase
      .from('distributors')
      .select('id, owner_name, business_name, suburb, status, balance_owed_cents, credit_limit_cents')
      .order('balance_owed_cents', { ascending: false })
      .limit(100);

    const distRows = (dists || []) as any[];
    const totalOwedCents = distRows.reduce((s, d) => s + (d.balance_owed_cents || 0), 0);
    const activeResellers = distRows.filter((d) => d.status === 'active').length;

    return NextResponse.json({
      success: true,
      allTime: agg(rows),
      last30: agg(last30),
      vat: {
        registered: VAT_REGISTERED,
        outputVatAllTimeCents: rows.reduce((s, o) => s + (o.vat_cents || 0), 0),
        outputVatLast30Cents: last30.reduce((s, o) => s + (o.vat_cents || 0), 0),
      },
      resellers: {
        active: activeResellers,
        total: distRows.length,
        totalOwedCents,
        list: distRows.slice(0, 25).map((d) => ({
          name: d.business_name || d.owner_name,
          suburb: d.suburb,
          status: d.status,
          balanceOwedCents: d.balance_owed_cents || 0,
          creditLimitCents: d.credit_limit_cents || 0,
        })),
      },
      recentOrders: rows.slice(0, 20).map((o) => {
        const c = (o.order_items || []).reduce((s: number, it: any) => s + (it.unit_cost_cents || 0) * (it.quantity || 0), 0);
        return {
          orderNumber: o.order_number,
          date: o.paid_at || o.created_at,
          revenueCents: o.total_cents || 0,
          cogsCents: c,
          profitCents: (o.total_cents || 0) - c,
          routed: !!o.distributor_id,
        };
      }),
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
