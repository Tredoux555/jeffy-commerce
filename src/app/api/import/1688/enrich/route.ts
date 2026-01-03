import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Pricing config
const EXCHANGE_RATE = 3.2;
const SHIPPING_PER_KG = 150;
const DEFAULT_WEIGHT = 0.5;
const MARKUP = 2.5;

function calculateSellingPrice(costCNY: number): number {
  const costZAR = costCNY * EXCHANGE_RATE;
  const shippingZAR = DEFAULT_WEIGHT * SHIPPING_PER_KG;
  const totalCost = costZAR + shippingZAR;
  const sellingPrice = totalCost * MARKUP;
  return Math.ceil(sellingPrice / 5) * 5 * 100;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

/**
 * ENRICH existing 1688 products with scraped data
 * PUT /api/import/1688/enrich
 * 
 * Updates existing products with:
 * - Title (translated)
 * - Price (calculated from CNY)
 * - Images (downloaded to Supabase storage)
 * - Description
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      sourceProductId,
      sourceUrl,
      titleOriginal,
      title,
      descriptionOriginal,
      description,
      costPriceCNY,
      images: rawImages,
      mainImage: rawMainImage,
      moq,
      variants,
      scrapedAt
    } = body;

    if (!sourceProductId) {
      return NextResponse.json(
        { success: false, error: 'sourceProductId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find existing product
    const { data: existing, error: findError } = await supabase
      .from('products')
      .select('id, sku, name')
      .eq('source_product_id', sourceProductId)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log(`[enrich] Enriching product ${existing.id} (${sourceProductId})`);

    // Calculate prices
    const costPriceZAR = Math.round((costPriceCNY || 10) * EXCHANGE_RATE * 100);
    const sellingPrice = calculateSellingPrice(costPriceCNY || 10);
    const comparePrice = Math.round(sellingPrice * 1.3);

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
      source_data: {
        titleOriginal,
        descriptionOriginal,
        costPriceCNY,
        moq,
        scrapedAt,
        enrichedAt: new Date().toISOString()
      }
    };

    // Process variants - download variant images too
    let processedVariants: any[] = [];
    if (variants && Array.isArray(variants) && variants.length > 0) {
      console.log(`[enrich] Processing ${variants.length} variants...`);
      const timestamp = Date.now();
      
      for (let i = 0; i < Math.min(variants.length, 30); i++) {
        const v = variants[i];
        const processed: any = {
          name: v.name || `Variant ${i + 1}`,
          sku_suffix: (v.name || '').substring(0, 10).toUpperCase().replace(/[^A-Z0-9]/g, ''),
          price_adjustment: 0,
          attributes: v.attributes || {},
          in_stock: true
        };
        
        // Calculate price adjustment if variant has different price
        if (v.price && costPriceCNY && v.price !== costPriceCNY) {
          const basePriceZAR = calculateSellingPrice(costPriceCNY);
          const variantPriceZAR = calculateSellingPrice(v.price);
          processed.price_adjustment = variantPriceZAR - basePriceZAR;
        }
        
        // Download variant image if available
        if (v.image && !v.image.includes('placeholder')) {
          try {
            const response = await fetch(v.image, {
              headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://detail.1688.com/',
              }
            });
            
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              if (buffer.byteLength > 3000) {
                const contentType = response.headers.get('content-type') || 'image/jpeg';
                let ext = 'jpg';
                if (contentType.includes('png')) ext = 'png';
                else if (contentType.includes('webp')) ext = 'webp';
                
                const fileName = `${existing.id}_var_${timestamp}_${i}.${ext}`;
                const filePath = `products/${fileName}`;
                
                const { error: uploadError } = await supabase.storage
                  .from('product-images')
                  .upload(filePath, buffer, { contentType, upsert: true });
                
                if (!uploadError) {
                  const { data: urlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);
                  if (urlData?.publicUrl) {
                    processed.image = urlData.publicUrl;
                  }
                }
              }
            }
          } catch (e) {
            // Skip failed variant image
          }
        }
        
        processedVariants.push(processed);
      }
      
      updateData.variants = processedVariants;
      console.log(`[enrich] Processed ${processedVariants.length} variants`);
    }

    // Update name/title if provided
    if (title && title.length > 10) {
      updateData.name = title.substring(0, 200);
      updateData.slug = generateSlug(title);
    }

    // Update description if provided
    if (description) {
      updateData.description = description.substring(0, 5000);
      updateData.short_description = description.substring(0, 160);
    }

    // Update prices
    updateData.cost_price = costPriceZAR;
    updateData.cost_price_cents = costPriceZAR;
    updateData.price = sellingPrice;
    updateData.selling_price_cents = sellingPrice;
    updateData.compare_at_price = comparePrice;
    updateData.compare_at_price_cents = comparePrice;

    // Download and store images
    let storedImages: string[] = [];
    let primaryStoredImage: string | null = null;
    const images = rawImages || [];

    if (images.length > 0) {
      console.log(`[enrich] Processing ${images.length} images...`);
      const timestamp = Date.now();
      
      for (let i = 0; i < Math.min(images.length, 10); i++) {
        const url = images[i];
        
        // Skip webp duplicates if we have jpg version
        if (url.endsWith('.webp') && images.some((u: string) => u === url.replace('.webp', ''))) {
          continue;
        }
        
        try {
          console.log(`[enrich] Fetching image ${i}: ${url.substring(0, 80)}...`);
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://detail.1688.com/',
              'Accept': 'image/webp,image/*,*/*'
            }
          });

          if (!response.ok) {
            console.log(`[enrich] Image ${i} fetch failed: ${response.status}`);
            continue;
          }

          const contentType = response.headers.get('content-type') || 'image/jpeg';
          const buffer = await response.arrayBuffer();
          
          // Check minimum size (at least 5KB for a real product image)
          if (buffer.byteLength < 5000) {
            console.log(`[enrich] Image ${i} too small (${buffer.byteLength} bytes)`);
            continue;
          }
          
          let ext = 'jpg';
          if (contentType.includes('png')) ext = 'png';
          else if (contentType.includes('webp')) ext = 'webp';

          const fileName = `${existing.id}_${timestamp}_${i}.${ext}`;
          const filePath = `products/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, buffer, { contentType, upsert: true });

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('product-images')
              .getPublicUrl(filePath);
            if (urlData?.publicUrl) {
              storedImages.push(urlData.publicUrl);
              if (!primaryStoredImage) primaryStoredImage = urlData.publicUrl;
              console.log(`[enrich] Image ${i} saved: ${buffer.byteLength} bytes`);
            }
          } else {
            console.log(`[enrich] Upload error for image ${i}:`, uploadError.message);
          }
        } catch (imgErr: any) {
          console.log(`[enrich] Image ${i} error:`, imgErr.message);
        }
      }
    }

    // Update images if we got any
    if (storedImages.length > 0) {
      updateData.images = storedImages;
      updateData.primary_image_url = primaryStoredImage;
      updateData.main_image = primaryStoredImage;
    }

    // Set status to draft (ready for review)
    updateData.status = 'draft';

    // Update the product
    const { error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', existing.id);

    if (updateError) {
      console.error('[enrich] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product enriched successfully',
      productId: existing.id,
      sku: existing.sku,
      name: updateData.name || existing.name,
      sellingPrice: sellingPrice,
      imagesUploaded: storedImages.length,
      imagesProcessed: images.length,
      variantsProcessed: processedVariants.length
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('[enrich] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET - Get products needing enrichment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Find products with no images or zero price
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, sku, source_product_id, source_url, source_1688_url, selling_price_cents, images, primary_image_url, source_data')
      .eq('source', '1688')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    // Filter to those needing enrichment
    const needsEnrichment = (products || []).filter(p => {
      return !p.selling_price_cents || 
             p.selling_price_cents === 0 ||
             !p.images || 
             p.images.length === 0 ||
             !p.primary_image_url ||
             p.name?.startsWith('1688 Product');
    });

    return NextResponse.json({
      success: true,
      total: products?.length || 0,
      needsEnrichment: needsEnrichment.length,
      products: needsEnrichment
    }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
