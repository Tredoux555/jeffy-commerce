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
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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
