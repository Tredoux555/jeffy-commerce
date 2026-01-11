import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/admin/products/create
 * Returns form schema/requirements
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'POST product data to create a new product',
    required_fields: ['name', 'price'],
    optional_fields: [
      'slug', 'sku', 'description', 'short_description',
      'category_id', 'images', 'main_image', 'primary_image_url',
      'stock', 'quantity', 'stock_quantity',
      'selling_price_cents', 'compare_at_price_cents', 'cost_price_cents',
      'source', 'source_url', 'source_product_id', 'source_data',
      'status', 'is_active'
    ]
  });
}

/**
 * POST /api/admin/products/create
 * Create a new product from JSON data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = body.slug || body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) + '-' + Date.now().toString(36);

    // Generate SKU if not provided
    const sku = body.sku || `JEF-${Date.now().toString(36).toUpperCase()}`;

    // Parse price - handle both cents and regular price
    const price = body.selling_price_cents || (body.price ? body.price * 100 : 0);
    const comparePrice = body.compare_at_price_cents || (body.compare_at_price ? body.compare_at_price * 100 : null);
    const costPrice = body.cost_price_cents || (body.cost_price ? body.cost_price * 100 : null);

    // Handle images
    const images = body.images || [];
    const mainImage = body.main_image || body.primary_image_url || (images.length > 0 ? images[0] : null);

    // Build product data
    const productData: any = {
      name: body.name,
      slug: slug,
      sku: sku,
      description: body.description || null,
      short_description: body.short_description || null,
      
      // Pricing
      selling_price_cents: price,
      compare_at_price_cents: comparePrice,
      cost_price_cents: costPrice,
      
      // Legacy price fields (some queries use these)
      price: Math.round(price / 100),
      
      // Stock
      stock_quantity: body.stock_quantity || body.quantity || body.stock || 10,
      
      // Images
      images: images,
      primary_image_url: mainImage,
      
      // Category
      category_id: body.category_id || null,
      
      // Source tracking (for 1688 imports)
      source: body.source || null,
      source_url: body.source_url || body.source_1688_url || null,
      source_product_id: body.source_product_id || body.source_1688_item_id || null,
      source_data: body.source_data || null,
      
      // Status
      status: body.status || 'draft',
      is_active: body.is_active ?? false,
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check for duplicate source_product_id
    if (productData.source_product_id) {
      const { data: existing } = await supabase
        .from('products')
        .select('id, name')
        .eq('source_product_id', productData.source_product_id)
        .single();
      
      if (existing) {
        return NextResponse.json({
          success: false,
          error: `Product already exists with this source ID`,
          existing_product: existing
        }, { status: 409 });
      }
    }

    // Insert product
    const { data: product, error } = await supabase
      .from('products')
      .insert(productData)
      .select('id, name, slug, sku, price, status')
      .single();

    if (error) {
      console.error('[create-product] Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Link to category via junction table if needed
    if (body.category_id && product) {
      try {
        await supabase.from('product_categories').insert({
          product_id: product.id,
          category_id: body.category_id
        });
      } catch {
        // Junction table may not exist, ignore
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: product
    });

  } catch (error: any) {
    console.error('[create-product] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
