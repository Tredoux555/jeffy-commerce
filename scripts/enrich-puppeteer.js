#!/usr/bin/env node
/**
 * JEFFY 1688 ENRICHMENT - PUPPETEER VERSION
 * Uses Puppeteer directly instead of Electron webview
 */

const puppeteer = require('puppeteer');

const JEFFY_API = 'https://jeffy.co.za';
const BETWEEN_PRODUCTS = 5000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getProductsToEnrich(limit = 50) {
  const resp = await fetch(`${JEFFY_API}/api/import/1688?status=draft&limit=${limit}`);
  const data = await resp.json();
  if (!data.products) return [];
  return data.products.filter(p => 
    !p.selling_price_cents || p.selling_price_cents === 0 ||
    !p.images || p.images.length === 0
  );
}

async function scrapeProduct(page, url) {
  console.log(`   📍 Navigating to: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);
  
  // Scroll to load images
  await page.evaluate(() => window.scrollBy(0, 500));
  await sleep(1000);
  await page.evaluate(() => window.scrollBy(0, 500));
  await sleep(1000);
  
  const data = await page.evaluate(() => {
    const url = window.location.href;
    const productIdMatch = url.match(/offer\/(\d+)\.html/);
    const productId = productIdMatch ? productIdMatch[1] : null;
    
    // Get title
    let title = '';
    ['h1', '.title-text', '.d-title'].forEach(sel => {
      if (!title) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim().length > 10) {
          title = el.textContent.trim();
        }
      }
    });
    
    // Get price
    let priceMin = 0;
    document.querySelectorAll('[class*="price"]').forEach(el => {
      if (!priceMin) {
        const nums = el.textContent.match(/[\d.]+/g);
        if (nums && parseFloat(nums[0]) > 0) {
          priceMin = parseFloat(nums[0]);
        }
      }
    });
    
    // Get images
    const images = [];
    document.querySelectorAll('img').forEach(img => {
      const src = img.src || img.dataset.src;
      if (src && src.includes('cbu01.alicdn.com') && !src.includes('placeholder')) {
        let full = src.replace(/_(\d+)x(\d+)\./g, '.').replace(/\.(\d+)x(\d+)\./g, '.');
        if (!images.includes(full)) images.push(full);
      }
    });
    
    // Get variants
    const variants = [];
    document.querySelectorAll('[class*="sku-item"], [class*="prop-item"]').forEach(el => {
      const text = el.textContent.trim();
      const img = el.querySelector('img');
      if (text && text.length < 100) {
        variants.push({
          name: text.replace(/[\n\r]+/g, ' ').trim(),
          image: img ? (img.src || img.dataset.src) : null
        });
      }
    });
    
    return {
      productId,
      url,
      title: title.substring(0, 200),
      priceMin,
      images: images.slice(0, 15),
      variants: variants.slice(0, 20)
    };
  });
  
  return data;
}

async function sendToJeffy(productData) {
  const payload = {
    source: '1688',
    sourceProductId: productData.productId,
    sourceUrl: productData.url,
    titleOriginal: productData.title,
    title: productData.title,
    costPriceCNY: productData.priceMin,
    images: productData.images,
    mainImage: productData.images[0],
    variants: productData.variants,
    capturedAt: new Date().toISOString()
  };
  
  const resp = await fetch(`${JEFFY_API}/api/import/1688/enrich`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  return resp.json();
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;
  
  console.log('='.repeat(60));
  console.log('🔄 JEFFY 1688 ENRICHMENT (Puppeteer)');
  console.log('='.repeat(60));
  console.log(`Limit: ${limit}`);
  console.log('');
  
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  
  // Go to 1688 first so user can login if needed
  console.log('📍 Opening 1688.com - please login if not already logged in');
  await page.goto('https://www.1688.com', { waitUntil: 'networkidle2' });
  
  console.log('');
  console.log('⏳ Waiting 10 seconds for you to login if needed...');
  await sleep(10000);
  
  // Get products
  console.log('📋 Fetching products to enrich...');
  const products = await getProductsToEnrich(limit);
  console.log(`Found ${products.length} products needing enrichment`);
  
  if (products.length === 0) {
    console.log('✨ All products are already enriched!');
    await browser.close();
    return;
  }
  
  const results = { success: 0, failed: 0 };
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const url = product.source_1688_url || product.source_url;
    
    console.log(`\n[${i + 1}/${products.length}] ${product.name}`);
    
    if (!url) {
      console.log('   ⚠️ No URL, skipping');
      results.failed++;
      continue;
    }
    
    try {
      const scraped = await scrapeProduct(page, url);
      console.log(`   📸 Found ${scraped.images.length} images, ${scraped.variants.length} variants`);
      console.log(`   💰 Price: ¥${scraped.priceMin}`);
      
      if (scraped.images.length === 0) {
        console.log('   ⚠️ No images found, skipping');
        results.failed++;
        continue;
      }
      
      console.log('   📤 Sending to Jeffy...');
      const result = await sendToJeffy(scraped);
      
      if (result.success) {
        console.log(`   ✅ Enriched! Images: ${result.imagesUploaded || 0}`);
        results.success++;
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
        results.failed++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.failed++;
    }
    
    if (i < products.length - 1) {
      console.log(`   ⏳ Waiting ${BETWEEN_PRODUCTS / 1000}s...`);
      await sleep(BETWEEN_PRODUCTS);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 ENRICHMENT COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  await browser.close();
}

main().catch(console.error);
