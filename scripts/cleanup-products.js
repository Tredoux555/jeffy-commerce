try{require('dotenv').config({path:'.env.local'})}catch(e){}
#!/usr/bin/env node
/**
 * CLEANUP SCRIPT - Delete bad products and fix categories
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Category mapping for "Other" products
const CATEGORY_FIXES = {
  'concealer': 'Beauty & Skincare',
  'eye shadow': 'Beauty & Skincare',
  'eyeshadow': 'Beauty & Skincare',
  'sunglasses': 'Fashion & Accessories',
  'nail': 'Beauty & Skincare',
  'hairpin': 'Hair Care',
  'hair clip': 'Hair Care',
  'hair accessor': 'Hair Care',
  'wig': 'Hair Care',
  'crochet hair': 'Hair Care',
  'braid': 'Hair Care',
  'tweezers': 'Beauty & Skincare',
  'clip': 'Fashion & Accessories',
};

async function main() {
  const dryRun = !process.argv.includes('--apply');
  
  console.log('🧹 PRODUCT CLEANUP SCRIPT\n');
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - no changes will be made\n');
  }
  
  // Fetch all products
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, source_data, status')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Failed to fetch products:', error);
    return;
  }
  
  console.log(`Found ${products.length} products\n`);
  
  // Find products to delete (Chinese names)
  const toDelete = products.filter(p => 
    p.name && /[\u4e00-\u9fa5]/.test(p.name)
  );
  
  console.log(`\n❌ TO DELETE (Chinese company names): ${toDelete.length}`);
  for (const p of toDelete) {
    console.log(`  - [${p.id.substring(0,8)}] ${p.name.substring(0, 50)}`);
  }
  
  // Find products in "Other" category that need fixing
  const inOther = products.filter(p => {
    const cat = p.source_data?.categorySuggestion;
    return cat === 'Other' || cat === 'Uncategorized' || !cat;
  });
  
  console.log(`\n📂 IN "OTHER"/UNCATEGORIZED: ${inOther.length}`);
  const categoryUpdates = [];
  
  for (const p of inOther) {
    const name = (p.name || '').toLowerCase();
    let newCat = null;
    
    for (const [keyword, category] of Object.entries(CATEGORY_FIXES)) {
      if (name.includes(keyword)) {
        newCat = category;
        break;
      }
    }
    
    if (newCat) {
      console.log(`  ✏️  [${p.id.substring(0,8)}] ${p.name.substring(0, 40)} → ${newCat}`);
      categoryUpdates.push({ id: p.id, category: newCat, sourceData: p.source_data });
    } else {
      console.log(`  ❓ [${p.id.substring(0,8)}] ${p.name.substring(0, 40)} (no match)`);
    }
  }
  
  if (dryRun) {
    console.log('\n💡 To apply changes, run: node scripts/cleanup-products.js --apply');
    return;
  }
  
  // APPLY CHANGES
  console.log('\n🔧 APPLYING CHANGES...\n');
  
  // Delete bad products
  let deleted = 0;
  for (const p of toDelete) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', p.id);
    
    if (error) {
      console.log(`❌ Failed to delete: ${p.name.substring(0, 40)}`);
    } else {
      console.log(`🗑️  Deleted: ${p.name.substring(0, 40)}`);
      deleted++;
    }
  }
  
  // Update categories
  let updated = 0;
  for (const u of categoryUpdates) {
    const newSourceData = {
      ...u.sourceData,
      categorySuggestion: u.category
    };
    
    const { error } = await supabase
      .from('products')
      .update({ source_data: newSourceData })
      .eq('id', u.id);
    
    if (error) {
      console.log(`❌ Failed to update category: ${u.id}`);
    } else {
      console.log(`📂 Updated category: ${u.id.substring(0,8)} → ${u.category}`);
      updated++;
    }
  }
  
  console.log(`\n✅ Deleted: ${deleted}`);
  console.log(`✅ Categories updated: ${updated}`);
}

main().catch(console.error);
