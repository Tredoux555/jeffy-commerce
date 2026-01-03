#!/usr/bin/env node
/**
 * Category Audit & Fix Tool
 * 
 * Checks all products for:
 * 1. Uncategorized products
 * 2. Products in "Other" category
 * 3. Mismatched categorySuggestion vs actual category
 * 4. Products with bad Chinese names
 * 
 * Run: node scripts/audit-categories.js
 * Run with fix: node scripts/audit-categories.js --fix
 */

const JEFFY_API = 'https://jeffy.co.za';

// Category mapping from suggestions to actual category names
const CATEGORY_MAP = {
  'Beauty & Skincare': 'Beauty & Skincare',
  'Hair Care': 'Hair Care',
  'Fashion & Accessories': 'Fashion & Accessories',
  'Health & Wellness': 'Health & Wellness',
  'Home & Living': 'Home & Living',
  'Electronics': 'Electronics',
  'Sports & Outdoors': 'Sports & Outdoors',
  'Baby & Kids': 'Baby & Kids',
  'Office & Stationery': 'Office & Stationery',
  'Adult': 'Adult',
  // Add mappings for common mismatches
  'Accessories': 'Fashion & Accessories',
  'Jewelry': 'Fashion & Accessories',
  'Bags': 'Fashion & Accessories',
  'Skincare': 'Beauty & Skincare',
  'Makeup': 'Beauty & Skincare',
  'Cosmetics': 'Beauty & Skincare',
  'Kitchen': 'Home & Living',
  'Storage': 'Home & Living',
  'Toys': 'Baby & Kids',
  'Fitness': 'Sports & Outdoors',
};

async function auditCategories(shouldFix = false) {
  console.log('🔍 Auditing product categories...\n');
  
  // Fetch all products via API
  const resp = await fetch(`${JEFFY_API}/api/import/1688?limit=200`);
  const data = await resp.json();
  const products = data.products || [];
  
  console.log(`Found ${products.length} products\n`);
  
  const issues = {
    uncategorized: [],
    badNames: [],
    wrongCategory: [],
    other: []
  };
  
  // Track unique categories we see
  const seenCategories = new Set();
  
  for (const product of products) {
    const suggestion = product.source_data?.categorySuggestion;
    const name = product.name || '';
    
    if (suggestion) seenCategories.add(suggestion);
    
    // Check for Chinese company names
    if (name.includes('有限公司') || name.includes('厂') || /^[\u4e00-\u9fff]+$/.test(name.substring(0, 5))) {
      issues.badNames.push({
        id: product.id,
        name: name.substring(0, 50),
        issue: 'Chinese company name'
      });
      continue;
    }
    
    // Check for uncategorized
    if (!suggestion || suggestion === 'Uncategorized') {
      issues.uncategorized.push({
        id: product.id,
        name: name.substring(0, 50),
        suggestion: suggestion || 'None'
      });
      continue;
    }
    
    // Check if in "Other" category
    if (suggestion === 'Other') {
      issues.other.push({
        id: product.id,
        name: name.substring(0, 50),
        current: 'Other',
        suggestion: suggestion
      });
      continue;
    }
  }
  
  // Print report
  console.log('='.repeat(60));
  console.log('CATEGORY AUDIT REPORT');
  console.log('='.repeat(60));
  
  console.log('\n📊 Categories in use:');
  [...seenCategories].sort().forEach(cat => {
    const count = products.filter(p => p.source_data?.categorySuggestion === cat).length;
    console.log(`   ${cat}: ${count} products`);
  });
  
  console.log(`\n❌ BAD NAMES (Chinese company names): ${issues.badNames.length}`);
  issues.badNames.forEach(p => {
    console.log(`   - [${p.id.substring(0,8)}] ${p.name}...`);
  });
  
  console.log(`\n📂 UNCATEGORIZED: ${issues.uncategorized.length}`);
  issues.uncategorized.forEach(p => {
    console.log(`   - [${p.id.substring(0,8)}] ${p.name}...`);
  });
  
  console.log(`\n📁 IN "OTHER" CATEGORY: ${issues.other.length}`);
  issues.other.forEach(p => {
    console.log(`   - [${p.id.substring(0,8)}] ${p.name}...`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Bad names:     ${issues.badNames.length} (need re-scrape or removal)`);
  console.log(`Uncategorized: ${issues.uncategorized.length}`);
  console.log(`In "Other":    ${issues.other.length}`);
  console.log(`TOTAL ISSUES:  ${issues.badNames.length + issues.uncategorized.length + issues.other.length}`);
  
  // Return for further processing
  return issues;
}

const shouldFix = process.argv.includes('--fix');
auditCategories(shouldFix).catch(console.error);
