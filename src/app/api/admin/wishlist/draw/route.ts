import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { runWishlistDraw } from '@/lib/wishlist/draw';

// On-demand Wish List draw, triggered by the admin "Draw a winner" button. Runs the same
// uniformly-random pick as the cron, server-side (admin-only path), so no CRON_SECRET
// header juggling is needed. Click it whenever you're ready to grant the next wish.
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = await createAdminClient();
    const result = await runWishlistDraw(supabase);
    const status = result.success ? 200 : 500;
    return NextResponse.json(result, { status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
