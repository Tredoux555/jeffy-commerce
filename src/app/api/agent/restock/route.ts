import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Get all low stock items across all partners
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Get all partner stock with low quantities
  const { data: lowStock } = await supabase
    .from('partner_stock')
    .select(`
      id, quantity, partner_id, product_id,
      partner:zone_partners (id, zone_id, low_stock_threshold),
      product:products (id, name, sku, primary_image_url, source_1688_url)
    `)
    .lte('quantity', 3)
    .order('quantity', { ascending: true });

  // Aggregate by product
  const productNeeds = new Map<string, any>();
  
  lowStock?.forEach(item => {
    const product = item.product as any;
    if (!product) return;
    
    const needed = 10 - item.quantity; // Restock to 10
    
    if (productNeeds.has(product.id)) {
      productNeeds.get(product.id).totalNeeded += needed;
      productNeeds.get(product.id).partners.push({
        partnerId: item.partner_id,
        current: item.quantity,
        needed
      });
    } else {
      productNeeds.set(product.id, {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        image: product.primary_image_url,
        source1688Url: product.source_1688_url,
        totalNeeded: needed,
        partners: [{
          partnerId: item.partner_id,
          current: item.quantity,
          needed
        }]
      });
    }
  });

  return NextResponse.json({
    success: true,
    restockNeeded: Array.from(productNeeds.values()),
    totalProducts: productNeeds.size
  });
}
