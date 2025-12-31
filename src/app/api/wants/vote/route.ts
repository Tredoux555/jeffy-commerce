import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Track a vote/engagement on a want
export async function POST(request: NextRequest) {
  try {
    const { want_id, vote_type } = await request.json();

    if (!want_id) {
      return NextResponse.json({ success: false, error: 'Want ID required' }, { status: 400 });
    }

    // Increment popularity_clicks for engagement tracking
    // In the future, we could have a separate votes table
    if (vote_type === 'up') {
      const { error } = await supabase.rpc('increment_popularity', { want_id_input: want_id });
      
      // Fallback if RPC doesn't exist
      if (error) {
        await supabase
          .from('wants')
          .update({ popularity_clicks: supabase.sql`popularity_clicks + 1` })
          .eq('id', want_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
