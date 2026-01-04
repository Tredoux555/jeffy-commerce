import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query for active suppliers
    let query = supabase
      .from('suppliers')
      .select('id, name, phone, whatsapp, location_name, categories, bio')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by category if provided
    // Note: This uses array contains - supplier must have this category in their list
    if (category) {
      query = query.contains('categories', [category]);
    }

    // Filter by location if provided (partial match)
    if (location) {
      query = query.ilike('location_name', `%${location}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supplier search error:', error);
      return NextResponse.json(
        { error: 'Failed to search suppliers', suppliers: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      suppliers: data || [],
      count: data?.length || 0,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', suppliers: [] },
      { status: 500 }
    );
  }
}
