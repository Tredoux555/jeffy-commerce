import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, products: [] });
    }

    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, selling_price_cents, primary_image_url')
      .eq('status', 'active')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(10);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, products: products || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
