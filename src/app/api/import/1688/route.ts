import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// CORS headers for Electron app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Pricing config
const EXCHANGE_RATE = 3.2; // CNY to ZAR
const SHIPPING_PER_KG = 150; // ZAR
const DEFAULT_WEIGHT = 0.5; // kg
const MARKUP = 2.5; // 150% markup

function calculateSellingPrice(costCNY: number): number {
  const costZAR = costCNY * EXCHANGE_RATE;
  const shippingZAR = DEFAULT_WEIGHT * SHIPPING_PER_KG;
  const totalCost = costZAR + shippingZAR;
  const sellingPrice = totalCost * MARKUP;
  // Round to nearest R5
  return Math.ceil(sellingPrice / 500) * 500;
}

function generateSKU(productId: string): string {
  const prefix = 'JEF';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const id = productId?.slice(-6) || Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${id}-${timestamp}`;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      source,
      sourceProductId,
      sourceUrl,
      titleOriginal,
      title,
      descriptionOriginal,
      description,
      costPriceCNY,
      images,
      mainImage,
      moq,
      seller,
      variants,
      capturedAt
    } = body;

    // Validate required fields
    if (!sourceProductId || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sourceProductId and title' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Calculate prices
    const costPriceZAR = Math.round(costPriceCNY * EXCHANGE_RATE * 100); // in cents
    const sellingPrice = calculateSellingPrice(costPriceCNY);
    const comparePrice = Math.round(sellingPrice * 1.3); // 30% higher "was" price
    
    // Generate SKU and slug
    const sku = generateSKU(sourceProductId);
    const slug = generateSlug(title);

    // Check if product already exists
    const { data: existing } = await supabase
      .from('products')
      .select('id, sku')
      .eq('source_product_id', sourceProductId)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Product already exists',
        productId: existing.id,
        sku: existing.sku,
        sellingPrice: sellingPrice
      }, { headers: corsHeaders });
    }

    // Insert product into database
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: title,
        slug: slug,
        description: description || '',
        short_description: description?.substring(0, 160) || '',
        sku: sku,
        price: sellingPrice,
        selling_price_cents: sellingPrice,
        compare_at_price: comparePrice,
        compare_at_price_cents: comparePrice,
        cost_price: costPriceZAR,
        cost_price_cents: costPriceZAR,
        stock: 100,
        quantity: 100,
        stock_quantity: 100,
        images: images || [],
        main_image: mainImage || images?.[0] || null,
        primary_image_url: mainImage || images?.[0] || null,
        source: source || '1688',
        source_product_id: sourceProductId,
        source_url: sourceUrl,
        source_1688_url: sourceUrl,
        source_1688_item_id: sourceProductId,
        source_data: {
          titleOriginal,
          descriptionOriginal,
          costPriceCNY,
          moq,
          seller,
          variants,
          capturedAt,
          importedAt: new Date().toISOString()
        },
        source_1688_data: {
          titleOriginal,
          descriptionOriginal,
          costPriceCNY,
          moq,
          seller,
          variants,
          capturedAt,
          importedAt: new Date().toISOString()
        },
        status: 'draft',
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    // Log the import (ignore errors if table doesn't exist)
    try {
      await supabase.from('import_logs').insert({
        source: '1688',
        source_product_id: sourceProductId,
        product_id: product.id,
        status: 'success',
        data: body,
        created_at: new Date().toISOString()
      });
    } catch {
      // Ignore - table may not exist yet
    }

    return NextResponse.json({
      success: true,
      message: 'Product imported successfully',
      productId: product.id,
      sku: sku,
      slug: slug,
      sellingPrice: sellingPrice,
      comparePrice: comparePrice,
      costPrice: costPriceZAR,
      status: 'draft'
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET - List imported products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    let query = supabase
      .from('products')
      .select('*')
      .eq('source', '1688')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: products, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: products?.length || 0,
      products: products || []
    }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
