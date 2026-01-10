#!/usr/bin/env node
/**
 * JEFFY 1688 BULK IMPORTER
 * 
 * Imports products from jeffy_1688_bulk_import_FINAL.json
 * Uses Puppeteer to scrape each 1688 URL and send to Jeffy API
 * 
 * Usage:
 *   node scripts/bulk-import-1688.js                    # Import all (148)
 *   node scripts/bulk-import-1688.js --limit=10         # Import first 10
 *   node scripts/bulk-import-1688.js --category="Nails" # Import specific category
 *   node scripts/bulk-import-1688.js --dry-run          # Test without importing
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const JEFFY_API = 'https://jeffy.co.za';
const IMPORT_FILE = path.join(__dirname, '..', 'jeffy_1688_bulk_import_FINAL.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'import-progress.json');
const BETWEEN_PRODUCTS = 3000; // 3s between products
const PAGE_LOAD_WAIT = 4000;   // 4s for page load

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch {}
  return { imported: [], failed: [], lastRun: null };
}

function saveProgress(progress) {
  progress.lastRun = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function loadProducts(categoryFilter = null, limit = null) {
  const data = JSON.parse(fs.readFileSync(IMPORT_FILE, 'utf-8'));
  const products = [];
  
  for (const category of data.categories) {
    if (categoryFilter && !category.name.toLowerCase().includes(categoryFilter.toLowerCase())) {
      continue;
    }
    
    for (const url of category.products) {
      products.push({
        url,
        category: category.name,
        categorySlug: category.slug
      });
    }
  }
  
  if (limit) {
    return products.slice(0, limit);
  }
  
  return products;
}

async function scrapeProduct(page, url) {
  console.log(`   📍 Loading page...`);
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (err) {
    console.log(`   ⚠️  Navigation slow, waiting for content...`);
  }
  
  await sleep(PAGE_LOAD_WAIT);
  
  // Scroll to load images
  await page.evaluate(() => window.scrollBy(0, 600));
  await sleep(800);
  await page.evaluate(() => window.scrollBy(0, 600));
  await sleep(800);
  
  const data = await page.evaluate(() => {
    const pageUrl = window.location.href;
    const productIdMatch = pageUrl.match(/offer\/(\d+)\.html/);
    const productId = productIdMatch ? productIdMatch[1] : null;
    
    if (!productId) {
      return { success: false, error: 'Not a product page' };
    }
    
    // Get title - multiple fallbacks
    let title = '';
    const titleSelectors = [
      '#productTitle h1',
      '.module-od-title h1',
      'h1.title',
      'h1',
      '.d-title'
    ];
    
    for (const sel of titleSelectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 5) {
        title = el.textContent.trim()
          .replace(/\s+/g, ' ')
          .substring(0, 200);
        break;
      }
    }
    
    // Fallback to document title
    if (!title) {
      title = document.title
        .replace(/\s*-\s*阿里巴巴.*$/, '')
        .replace(/\s*-\s*1688.*$/, '')
        .trim()
        .substring(0, 200);
    }
    
    // Get price
    let priceMin = 0;
    const priceEls = document.querySelectorAll('[class*="price"], [class*="Price"]');
    for (const el of priceEls) {
      const text = el.textContent;
      const match = text.match(/¥?\s*(\d+(?:\.\d{1,2})?)/);
      if (match) {
        const price = parseFloat(match[1]);
        if (price > 0.5 && price < 50000) {
          priceMin = price;
          break;
        }
      }
    }
    
    // Get images - focus on product images
    const imageSet = new Set();
    const imgSelectors = [
      'img.preview-img',
      '.od-gallery-turn-item-wrapper img',
      '.detail-gallery img',
      '[class*="gallery"] img:not([src*="avatar"])',
      '.slider-item img',
      '.sku-image img'
    ];
    
    for (const sel of imgSelectors) {
      document.querySelectorAll(sel).forEach(img => {
        let src = img.dataset.origin || img.dataset.original || img.dataset.src || img.src;
        if (src && (src.includes('cbu01.alicdn.com') || src.includes('img.alicdn.com'))) {
          // Convert to full-size URL
          src = src.split('?')[0]
            .replace(/_\d+x\d+(\.[a-z]+)?$/i, '$1')
            .replace(/\.\d+x\d+\.([a-z]+)$/i, '.$1')
            .replace(/\.jpg_\.webp$/i, '.jpg')
            .replace(/\.png_\.webp$/i, '.png');
          if (src.startsWith('//')) src = 'https:' + src;
          if (src.startsWith('http://')) src = src.replace('http://', 'https://');
          imageSet.add(src);
        }
      });
    }
    
    // Get MOQ
    let moq = null;
    const moqMatch = document.body.innerText.match(/(\d+)\s*件起批/);
    if (moqMatch) moq = parseInt(moqMatch[1]);
    
    return {
      success: true,
      productId,
      url: pageUrl,
      title,
      priceMin,
      images: Array.from(imageSet).slice(0, 12),
      moq
    };
  });
  
  return data;
}

async function sendToJeffy(productData, category, dryRun = false) {
  if (dryRun) {
    console.log(`   🧪 DRY RUN - Would import: ${productData.title.substring(0, 50)}...`);
    return { success: true, dryRun: true };
  }
  
  const payload = {
    source: '1688',
    sourceProductId: productData.productId,
    sourceUrl: productData.url,
    titleOriginal: productData.title,
    title: productData.title,
    costPriceCNY: productData.priceMin || 10,
    images: productData.images,
    mainImage: productData.images[0] || null,
    moq: productData.moq,
    category: category,
    capturedAt: new Date().toISOString()
  };
  
  try {
    const resp = await fetch(`${JEFFY_API}/api/import/1688`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    return await resp.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const categoryArg = args.find(a => a.startsWith('--category='));
  const dryRun = args.includes('--dry-run');
  const resume = args.includes('--resume');
  
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;
  const categoryFilter = categoryArg ? categoryArg.split('=')[1] : null;
  
  console.log('='.repeat(60));
  console.log('🚀 JEFFY 1688 BULK IMPORTER');
  console.log('='.repeat(60));
  console.log(`Limit: ${limit || 'ALL'}`);
  console.log(`Category: ${categoryFilter || 'ALL'}`);
  console.log(`Dry Run: ${dryRun}`);
  console.log(`Resume: ${resume}`);
  console.log('');
  
  // Load progress
  const progress = loadProgress();
  
  // Load products
  let products = loadProducts(categoryFilter, limit);
  console.log(`📦 Found ${products.length} products to import`);
  
  // Filter already imported if resuming
  if (resume && progress.imported.length > 0) {
    const importedSet = new Set(progress.imported);
    products = products.filter(p => !importedSet.has(p.url));
    console.log(`   (${progress.imported.length} already imported, ${products.length} remaining)`);
  }
  
  if (products.length === 0) {
    console.log('✨ Nothing to import!');
    return;
  }
  
  // Launch browser
  console.log('\n🌐 Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // Go to 1688 first
  console.log('📍 Opening 1688.com...');
  try {
    await page.goto('https://www.1688.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (err) {
    console.log('   ⚠️  Initial page load slow, continuing...');
  }
  console.log('⏳ Waiting 3 seconds for any login...');
  await sleep(3000);
  
  const results = { success: 0, failed: 0, skipped: 0 };
  
  console.log('\n' + '='.repeat(60));
  console.log('IMPORTING...');
  console.log('='.repeat(60));
  
  for (let i = 0; i < products.length; i++) {
    const { url, category } = products[i];
    
    console.log(`\n[${i + 1}/${products.length}] ${category}`);
    console.log(`   URL: ${url}`);
    
    try {
      const scraped = await scrapeProduct(page, url);
      
      if (!scraped.success) {
        console.log(`   ❌ Scrape failed: ${scraped.error}`);
        progress.failed.push(url);
        results.failed++;
        continue;
      }
      
      console.log(`   📝 Title: ${scraped.title.substring(0, 50)}...`);
      console.log(`   💰 Price: ¥${scraped.priceMin}`);
      console.log(`   📸 Images: ${scraped.images.length}`);
      
      if (scraped.images.length === 0) {
        console.log(`   ⚠️ No images found, skipping`);
        progress.failed.push(url);
        results.skipped++;
        continue;
      }
      
      console.log(`   📤 Sending to Jeffy...`);
      const result = await sendToJeffy(scraped, category, dryRun);
      
      if (result.success) {
        console.log(`   ✅ Imported! ${dryRun ? '(dry run)' : `SKU: ${result.sku}`}`);
        progress.imported.push(url);
        results.success++;
      } else if (result.message === 'Product already exists') {
        console.log(`   ⏭️  Already exists, skipping`);
        progress.imported.push(url);
        results.skipped++;
      } else {
        console.log(`   ❌ Import failed: ${result.error}`);
        progress.failed.push(url);
        results.failed++;
      }
      
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      progress.failed.push(url);
      results.failed++;
    }
    
    // Save progress after each product
    saveProgress(progress);
    
    // Wait between products
    if (i < products.length - 1) {
      await sleep(BETWEEN_PRODUCTS);
    }
  }
  
  await browser.close();
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${results.success}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`\nProgress saved to: ${PROGRESS_FILE}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
