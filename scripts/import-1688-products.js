#!/usr/bin/env node
/**
 * JEFFY 1688 BULK IMPORTER
 * 
 * Imports all 148 products from jeffy_1688_bulk_import_FINAL.json
 * 
 * Usage:
 *   cd ~/Desktop/jeffy-mvp
 *   node scripts/import-1688-products.js
 * 
 * Options:
 *   --dry-run    Show what would be imported without doing it
 *   --category   Import only a specific category slug
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE = process.env.API_URL || 'https://jeffy-commerce.up.railway.app';
const JSON_FILE = path.join(__dirname, '..', 'jeffy_1688_bulk_import_FINAL.json');
const BATCH_SIZE = 10;
const DELAY_MS = 1000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function importCategory(category) {
  const { name, slug, products } = category;
  
  console.log(`\n📦 Importing: ${name} (${products.length} products)`);
  console.log(`   Category: ${slug}`);
  
  try {
    const response = await fetch(`${API_BASE}/api/import/1688/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urls: products,
        category_slug: slug,
        scrape: false
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`   ✅ Imported: ${result.imported}/${result.total}`);
      console.log(`   ⏭️  Skipped: ${result.skipped}`);
      if (result.errors > 0) {
        console.log(`   ❌ Errors: ${result.errors}`);
      }
      return result;
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
      return { imported: 0, skipped: 0, errors: products.length };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { imported: 0, skipped: 0, errors: products.length };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const categoryFilter = args.find(a => a.startsWith('--category='))?.split('=')[1];
  
  console.log('='.repeat(60));
  console.log('🚀 JEFFY 1688 BULK IMPORTER');
  console.log('='.repeat(60));
  console.log(`API: ${API_BASE}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE IMPORT'}`);
  if (categoryFilter) console.log(`Filter: ${categoryFilter}`);
  
  // Load JSON
  if (!fs.existsSync(JSON_FILE)) {
    console.error(`❌ File not found: ${JSON_FILE}`);
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  console.log(`\n📊 Total Products: ${data.total_products}`);
  console.log(`📁 Categories: ${data.categories.length}`);
  
  // Filter if needed
  let categories = data.categories;
  if (categoryFilter) {
    categories = categories.filter(c => c.slug === categoryFilter);
    if (categories.length === 0) {
      console.error(`❌ Category not found: ${categoryFilter}`);
      process.exit(1);
    }
  }
  
  // Dry run - just show what would happen
  if (dryRun) {
    console.log('\n📋 Would import:');
    for (const cat of categories) {
      console.log(`   ${cat.name} (${cat.slug}): ${cat.products.length} products`);
    }
    console.log('\nRun without --dry-run to execute import');
    return;
  }
  
  // Live import
  const totals = { imported: 0, skipped: 0, errors: 0 };
  
  for (const category of categories) {
    const result = await importCategory(category);
    totals.imported += result.imported || 0;
    totals.skipped += result.skipped || 0;
    totals.errors += result.errors || 0;
    
    // Delay between categories to avoid rate limits
    await sleep(DELAY_MS);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Imported: ${totals.imported}`);
  console.log(`⏭️  Skipped: ${totals.skipped}`);
  console.log(`❌ Errors: ${totals.errors}`);
  console.log(`📦 Total: ${totals.imported + totals.skipped + totals.errors}`);
}

main().catch(console.error);
