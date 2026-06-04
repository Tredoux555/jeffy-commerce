import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Wholesale-price admin: list products with pricing completeness + bulk-set wholesale prices.
// The two-tier split only records when every line has a wholesale price, so this is the
// guard that keeps the buy-sell margin accurate before go-live.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, selling_price_cents, wholesale_price_cents, landed_cost_cents')
      .order('name', { ascending: true })
      .limit(1000);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const products = (data || []) as Array<{
      id: string;
      name: string;
      selling_price_cents: number | null;
      wholesale_price_cents: number | null;
      landed_cost_cents: number | null;
    }>;

    const missing = products.filter((p) => p.wholesale_price_cents == null).length;

    return NextResponse.json({
      success: true,
      total: products.length,
      missingWholesale: missing,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        sellingPriceCents: p.selling_price_cents ?? null,
        wholesalePriceCents: p.wholesale_price_cents ?? null,
        landedCostCents: p.landed_cost_cents ?? null,
        ok: p.wholesale_price_cents != null,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Body: { updates: { id: string; wholesalePriceCents: number | null }[] }
export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await request.json();
    const updates = (body?.updates || []) as Array<{ id: string; wholesalePriceCents: number | null }>;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    let updated = 0;
    for (const u of updates) {
      if (!u?.id) continue;
      const val = u.wholesalePriceCents;
      if (val != null && (typeof val !== 'number' || !Number.isFinite(val) || val < 0)) continue;
      const { error } = await supabase
        .from('products')
        .update({ wholesale_price_cents: val ?? null })
        .eq('id', u.id);
      if (!error) updated += 1;
    }

    return NextResponse.json({ success: true, updated });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
