import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/import/1688/update-price
 * Updates a product's pricing (used by pricing fix scripts)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      productId, 
      costPriceCents, 
      sellingPriceCents, 
      compareAtPriceCents,
      wholesalePriceCents 
    } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get current product to merge source_data
    const { data: product } = await supabase
      .from('products')
      .select('source_data')
      .eq('id', productId)
      .single();

    // Update product with new prices
    const { error } = await supabase
      .from('products')
      .update({
        cost_price_cents: costPriceCents,
        selling_price_cents: sellingPriceCents,
        compare_at_price_cents: compareAtPriceCents,
        source_data: {
          ...product?.source_data,
          wholesalePriceCents,
          pricingUpdatedAt: new Date().toISOString(),
          pricingFormula: 'sea_freight_v1'
        }
      })
      .eq('id', productId);

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      productId,
      newPrices: {
        cost: costPriceCents,
        selling: sellingPriceCents,
        compareAt: compareAtPriceCents,
        wholesale: wholesalePriceCents
      }
    });
  } catch (error: any) {
    console.error('Price update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
