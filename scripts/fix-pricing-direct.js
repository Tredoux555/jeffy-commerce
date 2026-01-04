#!/usr/bin/env node
/**
 * DIRECT SUPABASE PRICING FIX
 * Bypasses API - works directly with database
 */

const { createClient } = require('@supabase/supabase-js');

// Direct Supabase connection
const supabase = createClient(
  'https://inhrgiakjyprabxluppv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaHJnaWFranlwcmFieGx1cHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ1MjY5MiwiZXhwIjoyMDgxMDI4NjkyfQ.4qTzPRb5UHlISQB5duYcSCryuioEnwaxBwGMILbnrZ4'
);

// Pricing constants - OPTIMIZED FOR SPAZA
const CNY_TO_ZAR = 3.2;
const SEA_FREIGHT_PER_ITEM = 1; // R1 per item
const RETAIL_MARKUP = 2.0;  // 2x markup (was 2.5 - lowered for Spaza appeal)
const COMPARE_AT_MARKUP = 1.4; // Show 40% "discount"

function calculatePrices(costPriceCNY) {
  if (!costPriceCNY || costPriceCNY <= 0) return null;
  
  const landedCost = (costPriceCNY * CNY_TO_ZAR) + SEA_FREIGHT_PER_ITEM;
  const retailRaw = landedCost * RETAIL_MARKUP;
  const retailPrice = Math.ceil(retailRaw / 5) * 5; // Round to R5
  const compareAtPrice = Math.ceil(retailPrice * COMPARE_AT_MARKUP / 5) * 5;
  const wholesalePrice = Math.ceil(landedCost * 1.2); // 20% markup for hustlers
  
  return {
    landedCostCents: Math.round(landedCost * 100),
    retailPriceCents: retailPrice * 100,
    compareAtPriceCents: compareAtPrice * 100,
    wholesalePriceCents: wholesalePrice * 100,
    // For display
    landed: landedCost.toFixed(2),
    retail: retailPrice,
    wholesale: wholesalePrice,
    profit: retailPrice - wholesalePrice
  };
}

async function main() {
  const applyChanges = process.argv.includes('--apply');
  
  console.log('📊 JEFFY PRICING AUDIT\n');
  console.log('Formula:');
  console.log('  Landed = CNY × 3.2 + R1');
  console.log('  Retail = Landed × 2.0 (rounded to R5)');
  console.log('  Wholesale = Landed × 1.2 (hustler buy price)');
  console.log('  Profit = Retail - Wholesale\n');
  
  // Fetch all products
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, selling_price_cents, cost_price_cents, compare_at_price_cents, source_data, status')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Failed to fetch products:', error);
    return;
  }
  
  console.log(`Found ${products.length} products\n`);
  
  // Analyze
  let good = 0;
  let bad = 0;
  let noCNY = 0;
  const updates = [];
  
  console.log('='.repeat(90));
  console.log('Product                                  CNY   Current  →  New     Wholesale  Profit');
  console.log('='.repeat(90));
  
  for (const product of products) {
    const sd = product.source_data || {};
    const costCNY = sd.costPriceCNY;
    const currentRetail = product.selling_price_cents / 100;
    
    // Skip products without CNY
    if (!costCNY || costCNY <= 0) {
      noCNY++;
      continue;
    }
    
    // Skip Chinese company names
    if (product.name && /[\u4e00-\u9fa5]/.test(product.name)) {
      bad++;
      continue;
    }
    
    const prices = calculatePrices(costCNY);
    const change = ((prices.retail - currentRetail) / currentRetail * 100).toFixed(0);
    
    const name = (product.name || 'Unknown').substring(0, 38).padEnd(38);
    const emoji = parseInt(change) < 0 ? '📉' : '📈';
    
    console.log(
      `${name}  ¥${String(costCNY).padStart(3)}  R${String(currentRetail).padStart(5)} → R${String(prices.retail).padStart(5)}  R${String(prices.wholesale).padStart(5)}   R${String(prices.profit).padStart(4)} ${emoji}`
    );
    
    good++;
    updates.push({
      id: product.id,
      name: product.name,
      cost_price_cents: prices.landedCostCents,
      selling_price_cents: prices.retailPriceCents,
      compare_at_price_cents: prices.compareAtPriceCents
    });
  }
  
  console.log('='.repeat(90));
  console.log(`\n✅ Good products: ${good}`);
  console.log(`❌ Bad names (Chinese): ${bad}`);
  console.log(`⚠️  No CNY price: ${noCNY}`);
  console.log(`📦 Total to update: ${updates.length}`);
  
  // Show pricing examples
  console.log('\n📊 SPAZA PRICING EXAMPLES:');
  console.log('  ¥2 CNY  → Retail R15   → Wholesale R8    → Hustler Profit R7');
  console.log('  ¥8 CNY  → Retail R55   → Wholesale R32   → Hustler Profit R23');
  console.log('  ¥15 CNY → Retail R100  → Wholesale R58   → Hustler Profit R42');
  console.log('  ¥30 CNY → Retail R195  → Wholesale R116  → Hustler Profit R79');
  
  if (!applyChanges) {
    console.log('\n💡 To apply changes, run: node scripts/fix-pricing-direct.js --apply');
    return;
  }
  
  // APPLY CHANGES
  console.log('\n🔧 APPLYING CHANGES...\n');
  
  let updated = 0;
  let failed = 0;
  
  for (const update of updates) {
    const { error } = await supabase
      .from('products')
      .update({
        cost_price_cents: update.cost_price_cents,
        selling_price_cents: update.selling_price_cents,
        compare_at_price_cents: update.compare_at_price_cents
      })
      .eq('id', update.id);
    
    if (error) {
      console.log(`❌ Failed: ${update.name.substring(0, 40)}`);
      failed++;
    } else {
      console.log(`✅ ${update.name.substring(0, 50)} → R${update.selling_price_cents/100}`);
      updated++;
    }
  }
  
  console.log(`\n✅ Updated: ${updated}`);
  console.log(`❌ Failed: ${failed}`);
}

main().catch(console.error);
