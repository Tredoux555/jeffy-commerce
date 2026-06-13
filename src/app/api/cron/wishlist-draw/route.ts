import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { runWishlistDraw } from '@/lib/wishlist/draw';

export const dynamic = 'force-dynamic';

// Optional scheduled Wish List draw (CPA s36 promotional competition). The draw is
// normally run on-demand from the admin ("Draw a winner" button); this endpoint lets an
// external scheduler trigger the same logic if you ever want it automated. Protect it with
// a header: `Authorization: Bearer ${CRON_SECRET}`.
export async function GET(request: NextRequest) {
  try {
    // Fail CLOSED: this endpoint grants a free product to a winner, so it must never
    // run unauthenticated. If CRON_SECRET is unset we REFUSE (previously it ran for
    // anyone when the secret was absent). If it's set, the Bearer token must match.
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error('[CRON][SECURITY] CRON_SECRET is not set — refusing wishlist draw. Set CRON_SECRET in Railway to enable scheduled draws.');
      return NextResponse.json({ error: 'Cron not configured' }, { status: 503 });
    }
    if (authHeader !== `Bearer ${cronSecret}`) {
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
