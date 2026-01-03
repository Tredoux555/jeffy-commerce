#!/usr/bin/env node
/**
 * JEFFY 1688 AUTO ENRICHMENT v2
 * 
 * Fixed version with better error handling
 */

const BROWSER_API = 'http://127.0.0.1:3688';
const JEFFY_API = process.env.API_URL || 'https://jeffy.co.za';

// Delays
const NAVIGATE_DELAY = 4000;
const SCROLL_DELAY = 800;
const CAPTURE_DELAY = 2000;
const BETWEEN_PRODUCTS = 4000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkBrowserRunning() {
  try {
    const resp = await fetch(`${BROWSER_API}/status`);
    const data = await resp.json();
    return data.status === 'running';
  } catch {
    return false;
  }
}

async function navigateTo(url) {
  const resp = await fetch(`${BROWSER_API}/navigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return resp.json();
}

async function scrollPage(amount = 500) {
  await fetch(`${BROWSER_API}/scroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction: 'down', amount })
  });
}

async function executeJS(code) {
  const resp = await fetch(`${BROWSER_API}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  return resp.json();
}

// Simplified scraper - just get the essentials
async function scrapeProductData() {
  // Simple scraping code - returns object directly
  const code = `(function() {
    var url = window.location.href;
    var productIdMatch = url.match(/offer\\/(\\d+)\\.html/);
    var productId = productIdMatch ? productIdMatch[1] : null;
    
    if (!productId) {
      return { success: false, error: 'Not a product page: ' + url };
    }
    
    // Get title
    var title = document.title || '';
    var h1 = document.querySelector('h1');
    if (h1 && h1.textContent.length > 10) {
      title = h1.textContent.trim();
    }
    
    // Get price
    var priceMin = 0;
    var priceEls = document.querySelectorAll('[class*="price"]');
    for (var i = 0; i < priceEls.length; i++) {
      var nums = priceEls[i].textContent.match(/[0-9.]+/g);
      if (nums && parseFloat(nums[0]) > 0.5 && parseFloat(nums[0]) < 10000) {
        priceMin = parseFloat(nums[0]);
        break;
      }
    }
    
    // Get images
    var images = [];
    var seen = {};
    var allImgs = document.querySelectorAll('img');
    for (var j = 0; j < allImgs.length; j++) {
      var src = allImgs[j].src || allImgs[j].dataset.src || '';
      if (src.indexOf('cbu01.alicdn.com') > -1 || src.indexOf('img.alicdn.com') > -1) {
        // Remove size suffixes
        var full = src.replace(/_[0-9]+x[0-9]+\\./g, '.').replace(/\\.[0-9]+x[0-9]+\\./g, '.');
        if (full.indexOf('//') === 0) full = 'https:' + full;
        if (!seen[full] && full.length > 50) {
          seen[full] = true;
          images.push(full);
        }
      }
    }
    
    // Get variants (simple version)
    var variants = [];
    var skuItems = document.querySelectorAll('[class*="sku-item"], [class*="prop-item"]');
    for (var k = 0; k < Math.min(skuItems.length, 20); k++) {
      var text = skuItems[k].textContent.trim().replace(/\\s+/g, ' ');
      if (text.length > 0 && text.length < 80) {
        var vImg = skuItems[k].querySelector('img');
        variants.push({
          name: text,
          image: vImg ? (vImg.src || vImg.dataset.src) : null
        });
      }
    }
    
    return {
      success: true,
      data: {
        productId: productId,
        url: url,
        title: title.substring(0, 200),
        priceMin: priceMin,
        images: images.slice(0, 15),
        variants: variants,
        scrapedAt: new Date().toISOString()
      }
    };
  })()`;
  
  const result = await executeJS(code);
  
  if (result.result) {
    return result.result;
  } else if (result.error) {
    return { success: false, error: result.error };
  }
  return { success: false, error: 'Unknown response' };
}

async function sendToJeffy(productData) {
  const payload = {
    source: '1688',
    sourceProductId: productData.productId,
    sourceUrl: productData.url,
    titleOriginal: productData.title,
    title: productData.title,
    costPriceCNY: productData.priceMin || 10,
    images: productData.images,
    mainImage: productData.images[0],
    variants: productData.variants,
    capturedAt: productData.scrapedAt
  };
  
  const resp = await fetch(`${JEFFY_API}/api/import/1688/enrich`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  return resp.json();
}

async function getProductsToEnrich(limit = 50) {
  const resp = await fetch(`${JEFFY_API}/api/import/1688?status=draft&limit=${limit}`);
  const data = await resp.json();
  
  if (!data.products) return [];
  
  return data.products.filter(p => {
    return !p.selling_price_cents || p.selling_price_cents === 0 ||
           !p.images || p.images.length === 0 ||
           !p.primary_image_url;
  });
}

async function enrichProduct(product) {
  const url = product.source_1688_url || product.source_url;
  if (!url) {
    console.log(`   ⚠️  No source URL`);
    return { success: false, error: 'No source URL' };
  }
  
  console.log(`   📍 Navigating...`);
  await navigateTo(url);
  await sleep(NAVIGATE_DELAY);
  
  // Scroll to load images
  console.log(`   📜 Loading content...`);
  for (let i = 0; i < 4; i++) {
    await scrollPage(400);
    await sleep(SCROLL_DELAY);
  }
  await sleep(CAPTURE_DELAY);
  
  // Scrape
  console.log(`   🔍 Scraping...`);
  const scraped = await scrapeProductData();
  
  if (!scraped || !scraped.success) {
    console.log(`   ❌ Scrape failed: ${scraped?.error || 'Unknown'}`);
    return { success: false, error: scraped?.error };
  }
  
  const data = scraped.data;
  console.log(`   📸 Images: ${data.images?.length || 0}, Variants: ${data.variants?.length || 0}`);
  console.log(`   💰 Price: ¥${data.priceMin}`);
  
  if (!data.images || data.images.length === 0) {
    console.log(`   ⚠️  No images found`);
    return { success: false, error: 'No images' };
  }
  
  // Send to Jeffy
  console.log(`   📤 Uploading...`);
  const result = await sendToJeffy(data);
  
  if (result.success) {
    console.log(`   ✅ Done! Images: ${result.imagesUploaded || 0}`);
    return { success: true, ...result };
  } else {
    console.log(`   ❌ Upload failed: ${result.error}`);
    return { success: false, error: result.error };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;
  
  console.log('='.repeat(60));
  console.log('🔄 JEFFY 1688 ENRICHMENT v2');
  console.log('='.repeat(60));
  console.log(`Limit: ${limit}`);
  console.log('');
  
  // Check browser
  console.log('🔌 Checking browser...');
  const browserOk = await checkBrowserRunning();
  if (!browserOk) {
    console.error('❌ Browser not running!');
    console.log('Start with: cd jeffy-1688-browser && npm start');
    process.exit(1);
  }
  console.log('✅ Browser connected');
  
  // Get products
  console.log('📋 Fetching products...');
  const products = await getProductsToEnrich(limit);
  console.log(`Found ${products.length} products`);
  
  if (products.length === 0) {
    console.log('✨ All done!');
    return;
  }
  
  const results = { success: 0, failed: 0 };
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n[${i + 1}/${products.length}] ${product.name || product.sku}`);
    
    try {
      const result = await enrichProduct(product);
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.failed++;
    }
    
    if (i < products.length - 1) {
      await sleep(BETWEEN_PRODUCTS);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
}

main().catch(console.error);
