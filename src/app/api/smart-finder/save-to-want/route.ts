import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wantId, product, recommendation, translation, pricing } = body;

    if (!wantId || !product) {
      return NextResponse.json({ success: false, error: 'Missing wantId or product' }, { status: 400 });
    }

    const supabase = await createClient();

    // Update the want with sourced product info
    const { error } = await supabase
      .from('wants')
      .update({
        status: 'sourced',
        sourced_product_url: product.url,
        sourced_product_title: translation?.title || product.title,
        sourced_product_price_cny: product.price,
        sourced_product_price_zar: pricing?.suggestedPrice,
        sourced_at: new Date().toISOString(),
        sourcing_data: {
          product,
          recommendation,
          translation,
          pricing,
        },
      })
      .eq('id', wantId);

    if (error) {
      console.error('Failed to update want:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Want updated successfully' });
  } catch (error: any) {
    console.error('Save to want error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
