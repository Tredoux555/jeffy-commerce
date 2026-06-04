import type { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/notify/send';

// Low-stock check for a reseller. After a sale settles we look at the seller's
// stock-on-hand; any line at/below the threshold that they've actually been selling
// gets flagged. Best-effort: emails the seller a restock nudge when an email + Resend
// key are present, otherwise just returns the list. Never throws into the caller.
//
//   LOW_STOCK_THRESHOLD   units at/below which to flag   default 3

type SupabaseAdmin = Awaited<ReturnType<typeof createAdminClient>>;

const THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD || 3);

export interface LowStockItem {
  productId: string;
  qtyOnHand: number;
}

export async function checkLowStock(
  supabase: SupabaseAdmin,
  distributorId: string
): Promise<LowStockItem[]> {
  try {
    const { data: stock } = await supabase
      .from('distributor_stock')
      .select('product_id, qty_on_hand, qty_sold_total')
      .eq('distributor_id', distributorId);

    const low = ((stock || []) as { product_id: string; qty_on_hand: number; qty_sold_total: number }[])
      .filter((s) => (s.qty_on_hand || 0) <= THRESHOLD && (s.qty_sold_total || 0) > 0)
      .map((s) => ({ productId: s.product_id, qtyOnHand: s.qty_on_hand || 0 }));

    if (low.length === 0) return [];

    // Resolve product names + the seller's email for the nudge (best-effort).
    const ids = low.map((l) => l.productId);
    const [{ data: products }, { data: dist }] = await Promise.all([
      supabase.from('products').select('id, name').in('id', ids),
      supabase.from('distributors').select('owner_name, email').eq('id', distributorId).single(),
    ]);
    const nameById = new Map(
      ((products || []) as { id: string; name: string }[]).map((p) => [p.id, p.name])
    );

    const sellerEmail = (dist as { email?: string } | null)?.email;
    if (sellerEmail) {
      const rows = low
        .map((l) => `<li>${nameById.get(l.productId) || l.productId} — <strong>${l.qtyOnHand}</strong> left</li>`)
        .join('');
      await sendEmail(
        sellerEmail,
        'Low stock — time to restock',
        `<p>Hi ${(dist as { owner_name?: string } | null)?.owner_name || 'there'},</p>
         <p>You're running low on:</p>
         <ul>${rows}</ul>
         <p>Reply or log in to request a restock so you don't miss sales.</p>
         <p>— Jeffy</p>`
      );
    }

    console.log(`Low stock for distributor ${distributorId}:`, low);
    return low;
  } catch {
    return [];
  }
}
