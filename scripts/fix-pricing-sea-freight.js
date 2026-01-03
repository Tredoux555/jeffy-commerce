#!/usr/bin/env node
/**
 * Fix Pricing with Sea Freight Formula
 * 
 * Current issue: Prices use R75/item air freight = crazy markups (8-60x)
 * 
 * New formula:
 * - Landed Cost = CNY × 3.2 + R1 (sea freight per item)
 * - Retail Price = Landed × 2.5 (rounded to nearest R5)
 * - Compare At = Retail × 1.3 (shows "was" price for sales feel)
 * - Wholesale = Landed × 1.3 (for Zone Partners)
 * 
 * Run: node scripts/fix-pricing-sea-freight.js
 */

const JEFFY_API = 'https://jeffy.co.za';

// Pricing constants
const CNY_TO_ZAR = 3.2;
const SEA_FREIGHT_PER_ITEM = 1; // R1 per item sea freight
const RETAIL_MARKUP = 2.5;
const COMPARE_AT_MARKUP = 1.3; // Show 30% "discount"

function calculatePrices(costPriceCNY) {
  if (!costPriceCNY || costPriceCNY <= 0) return null;
  
  // Landed cost in ZAR
  const landedCost = (costPriceCNY * CNY_TO_ZAR) + SEA_FREIGHT_PER_ITEM;
  
  // Retail price (rounded to nearest R5 for clean pricing)
  const retailRaw = landedCost * RETAIL_MARKUP;
  const retailPrice = Math.ceil(retailRaw / 5) * 5;
  
  // Compare at price (for "was R___" display)
  const compareAtPrice = Math.ceil(retailPrice * COMPARE_AT_MARKUP / 5) * 5;
  
  // Wholesale price for Zone Partners (1.3x landed)
  const wholesalePrice = Math.ceil(landedCost * 1.3);
  
  return {
    landedCostCents: Math.round(landedCost * 100),
    retailPriceCents: retailPrice * 100,
    compareAtPriceCents: compareAtPrice * 100,
    wholesalePriceCents: wholesalePrice * 100
  };
}

async function analyzePricing() {
  console.log('📊 Analyzing current pricing...\n');
  console.log('New Formula:');
  console.log('  Landed = CNY × 3.2 + R1 (sea freight)');
  console.log('  Retail = Landed × 2.5 (rounded to R5)');
  console.log('  Compare At = Retail × 1.3');
  console.log('  Wholesale = Landed × 1.3\n');
  
  // Fetch all products
  const resp = await fetch(`${JEFFY_API}/api/import/1688?limit=200`);
  const data = await resp.json();
  const products = data.products || [];
  
  console.log(`Found ${products.length} products\n`);
  console.log('='.repeat(80));
  console.log('PRICING COMPARISON: Current vs New Formula');
  console.log('='.repeat(80));
  console.log('Product                                  CNY   Current   New Retail  Change');
  console.log('-'.repeat(80));
  
  let totalCurrentRevenue = 0;
  let totalNewRevenue = 0;
  let productsWithCNY = 0;
  
  for (const product of products) {
    const costCNY = product.source_data?.costPriceCNY;
    const currentRetail = product.selling_price_cents / 100;
    
    if (!costCNY || costCNY <= 0) continue;
    
    productsWithCNY++;
    const prices = calculatePrices(costCNY);
    const newRetail = prices.retailPriceCents / 100;
    const change = ((newRetail - currentRetail) / currentRetail * 100).toFixed(0);
    
    totalCurrentRevenue += currentRetail;
    totalNewRevenue += newRetail;
    
    const name = product.name.substring(0, 38).padEnd(38);
    const emoji = parseInt(change) < 0 ? '📉' : '📈';
    console.log(`${name}  ¥${String(costCNY).padStart(3)}  R${String(currentRetail).padStart(6)}  R${String(newRetail).padStart(8)}  ${change.padStart(5)}% ${emoji}`);
  }
  
  console.log('-'.repeat(80));
  console.log(`\nProducts with CNY price: ${productsWithCNY}`);
  console.log(`Total current retail value: R${totalCurrentRevenue.toLocaleString()}`);
  console.log(`Total new retail value: R${totalNewRevenue.toLocaleString()}`);
  console.log(`Average change: ${((totalNewRevenue - totalCurrentRevenue) / totalCurrentRevenue * 100).toFixed(0)}%`);
  
  console.log('\n📊 Sample New Prices:');
  console.log('  ¥2 CNY  → Landed R7.40  → Retail R20   → Wholesale R10');
  console.log('  ¥8 CNY  → Landed R26.60 → Retail R70   → Wholesale R35');
  console.log('  ¥25 CNY → Landed R81.00 → Retail R205  → Wholesale R105');
  console.log('  ¥50 CNY → Landed R161   → Retail R405  → Wholesale R210');
  
  console.log('\n💡 To apply new prices, run with --apply flag');
  console.log('   node scripts/fix-pricing-sea-freight.js --apply');
  
  return products;
}

async function applyPricing() {
  console.log('🔧 APPLYING new pricing formula...\n');
  
  // Fetch all products
  const resp = await fetch(`${JEFFY_API}/api/import/1688?limit=200`);
  const data = await resp.json();
  const products = data.products || [];
  
  let updated = 0;
  let skipped = 0;
  
  for (const product of products) {
    const costCNY = product.source_data?.costPriceCNY;
    
    if (!costCNY || costCNY <= 0) {
      skipped++;
      continue;
    }
    
    const prices = calculatePrices(costCNY);
    
    // Update via API
    const updateResp = await fetch(`${JEFFY_API}/api/import/1688/update-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        costPriceCents: prices.landedCostCents,
        sellingPriceCents: prices.retailPriceCents,
        compareAtPriceCents: prices.compareAtPriceCents,
        wholesalePriceCents: prices.wholesalePriceCents
      })
    });
    
    if (updateResp.ok) {
      console.log(`✅ ${product.name.substring(0, 40)}... → R${prices.retailPriceCents/100}`);
      updated++;
    } else {
      console.log(`❌ Failed: ${product.name.substring(0, 40)}...`);
    }
  }
  
  console.log(`\n✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped: ${skipped} (no CNY price)`);
}

const shouldApply = process.argv.includes('--apply');
if (shouldApply) {
  applyPricing().catch(console.error);
} else {
  analyzePricing().catch(console.error);
}
