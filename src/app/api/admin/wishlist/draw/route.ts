import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { runWishlistDraw } from '@/lib/wishlist/draw';
import { isAdminLoggedIn } from '@/lib/auth';

// On-demand Wish List draw, triggered by the admin "Draw a winner" button. Runs the same
// uniformly-random pick as the cron, server-side. This route is under /api/admin/* so the
// middleware already gates it, but because each call grants a free product we ALSO check
// the admin session here directly (defense in depth — never rely on a single gate for a
// money-spending action).
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    if (!(await isAdminLoggedIn())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
