import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// CORS headers for Electron app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Extract 1688 product ID from URL
function extract1688ProductId(url: string): string | null {
  // Match patterns like: /offer/581430625604.html
  const match = url.match(/offer\/(\d+)\.html/);
  return match ? match[1] : null;
}

function generateSKU(productId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `JEF-${productId.slice(-6)}-${timestamp}`;
}

/**
 * Bulk import 1688 products
 * Creates stub products that can be enriched later via scraping
 * 
 * POST /api/import/1688/bulk
 * {
 *   "urls": ["https://detail.1688.com/offer/...", ...],
 *   "category_slug": "hair-crochet-braids",
 *   "scrape": false  // if true, attempt to scrape via 1688 browser
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls, category_slug, scrape = false } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'urls array is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get category ID if provided
    let categoryId: string | null = null;
    if (category_slug) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category_slug)
        .single();
      
      if (category) {
        categoryId = category.id;
      } else {
        console.log(`[bulk-import] Category not found: ${category_slug}`);
      }
    }

    const results = {
      total: urls.length,
      imported: 0,
      skipped: 0,
      errors: 0,
      products: [] as any[]
    };

    for (const url of urls) {
      try {
        const productId = extract1688ProductId(url);
        if (!productId) {
          console.log(`[bulk-import] Invalid URL: ${url}`);
          results.errors++;
          continue;
        }

        // Check if already imported
        const { data: existing } = await supabase
          .from('products')
          .select('id, name, sku')
          .eq('source_product_id', productId)
          .single();

        if (existing) {
          results.skipped++;
          results.products.push({
            status: 'skipped',
            reason: 'already_exists',
            productId: existing.id,
            name: existing.name
          });
          continue;
        }

        // If scrape=true, try to get data from 1688 browser
        let scrapedData: any = null;
        if (scrape) {
          try {
            const scrapeResponse = await fetch('http://localhost:3688/api/scrape', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url })
            });
            if (scrapeResponse.ok) {
              scrapedData = await scrapeResponse.json();
            }
          } catch {
            console.log(`[bulk-import] Scraping unavailable for ${url}`);
          }
        }

        const sku = generateSKU(productId);
        const slug = `product-${productId}`;

        // Create stub product
        const productData: any = {
          name: scrapedData?.title || `1688 Product ${productId}`,
          slug: slug,
          description: scrapedData?.description || 'Product details pending import',
          short_description: 'Imported from 1688',
          sku: sku,
          price: scrapedData?.sellingPrice || 0,
          selling_price_cents: scrapedData?.sellingPrice || 0,
          compare_at_price: 0,
          compare_at_price_cents: 0,
          cost_price: 0,
          cost_price_cents: 0,
          stock: 10,
          quantity: 10,
          stock_quantity: 10,
          images: scrapedData?.images || [],
          main_image: scrapedData?.mainImage || null,
          primary_image_url: scrapedData?.mainImage || null,
          source: '1688',
          source_product_id: productId,
          source_url: url,
          source_1688_url: url,
          source_1688_item_id: productId,
          source_data: {
            importedAt: new Date().toISOString(),
            category_slug: category_slug,
            bulk_import: true,
            needs_enrichment: !scrapedData
          },
          status: 'draft', // All imports start as draft
          is_active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Add category if found
        if (categoryId) {
          productData.category_id = categoryId;
        }

        const { data: product, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id, name, sku, status')
          .single();

        if (error) {
          console.error(`[bulk-import] Error for ${url}:`, error.message);
          results.errors++;
          results.products.push({
            status: 'error',
            url: url,
            error: error.message
          });
          continue;
        }

        // Link to category via product_categories junction table if it exists
        if (categoryId && product) {
          try {
            await supabase.from('product_categories').insert({
              product_id: product.id,
              category_id: categoryId
            });
          } catch {
            // Junction table may not exist, ignore
          }
        }

        results.imported++;
        results.products.push({
          status: 'imported',
          productId: product.id,
          name: product.name,
          sku: product.sku,
          needsEnrichment: !scrapedData
        });

      } catch (err: any) {
        console.error(`[bulk-import] Error processing ${url}:`, err);
        results.errors++;
        results.products.push({
          status: 'error',
          url: url,
          error: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${results.imported}/${results.total} products`,
      ...results
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('[bulk-import] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Import all products from the bulk JSON file
 * 
 * GET /api/import/1688/bulk?action=import-all
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'import-all') {
    // This would read the JSON file and import all products
    // For now, return instructions
    return NextResponse.json({
      success: true,
      message: 'Use POST with urls array to bulk import',
      example: {
        urls: ['https://detail.1688.com/offer/123456.html'],
        category_slug: 'hair-crochet-braids',
        scrape: false
      }
    }, { headers: corsHeaders });
  }

  // Default: show import stats
  const { data: stats } = await supabase
    .from('products')
    .select('status, source')
    .eq('source', '1688');

  const grouped = (stats || []).reduce((acc: any, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    success: true,
    total_1688_products: stats?.length || 0,
    by_status: grouped
  }, { headers: corsHeaders });
}

