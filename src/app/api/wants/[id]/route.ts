import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get a specific want by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Want ID required' }, { status: 400 });
  }

  try {
    const { data: want, error } = await supabase
      .from('wants')
      .select(`
        id,
        product_name,
        description,
        category,
        vote_count,
        verified_count,
        popularity_clicks,
        status,
        creator_referral_code,
        created_at,
        is_public
      `)
      .eq('id', id)
      .single();

    if (error || !want) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product request not found' 
      }, { status: 404 });
    }

    // Don't expose private wants
    if (!want.is_public) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product request not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      want: {
        id: want.id,
        product_name: want.product_name,
        description: want.description,
        category: want.category,
        vote_count: want.vote_count,
        verified_count: want.verified_count || 0,
        popularity_clicks: want.popularity_clicks || 0,
        status: want.status,
        creator_referral_code: want.creator_referral_code,
        created_at: want.created_at,
        remaining: Math.max(0, 10 - (want.verified_count || 0)),
        progress: Math.min(((want.verified_count || 0) / 10) * 100, 100),
      }
    });

  } catch (error) {
    console.error('Get want error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
