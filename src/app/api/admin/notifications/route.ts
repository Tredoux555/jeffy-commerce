import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const lastChecked = request.nextUrl.searchParams.get('since');
    const supabase = await createAdminClient();

    // Find wants that reached threshold recently
    let query = supabase
      .from('wants')
      .select('id, title, creator_name, current_agrees, threshold, updated_at')
      .gte('current_agrees', 10)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(10);

    // If we have a lastChecked timestamp, only get newer ones
    if (lastChecked) {
      query = query.gt('updated_at', lastChecked);
    }

    const { data: newSuccesses, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      newSuccesses: newSuccesses || [],
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
