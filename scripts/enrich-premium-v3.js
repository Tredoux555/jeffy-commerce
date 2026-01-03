#!/usr/bin/env node
/**
 * JEFFY 1688 PREMIUM SCRAPER v3
 * Based on real DOM inspection - Jan 3 2026
 * 
 * KEY FINDINGS:
 * - Product title is in document.title (NOT h1 which has company name)
 * - Prices in .module-od-main-price or .price-component.range-price
 * - Variants in [class*="sku"] [class*="item"] with embedded prices
 * - Images from cbu01.alicdn.com, use _b.jpg for full size
 */

const BROWSER_API = 'http://127.0.0.1:3688';
const JEFFY_API = 'https://jeffy.co.za';
const BETWEEN_PRODUCTS = 4000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function browserRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);
  
  const resp = await fetch(`${BROWSER_API}${endpoint}`, options);
  return resp.json();
}

async function navigateTo(url) {
  return browserRequest('/navigate', 'POST', { url });
}

async function scrollPage() {
  await browserRequest('/scroll', 'POST', { direction: 'down', amount: 500 });
  await sleep(500);
  await browserRequest('/scroll', 'POST', { direction: 'down', amount: 500 });
  await sleep(500);
  await browserRequest('/scroll', 'POST', { direction: 'up', amount: 800 });
}

async function executeJS(code) {
  const result = await browserRequest('/execute', 'POST', { code });
  return result.result;
}

async function scrapeProductData() {
  const code = `
(function() {
  const url = window.location.href;
  const productIdMatch = url.match(/offer\\/(\\d+)\\.html/);
  const productId = productIdMatch ? productIdMatch[1] : null;
  
  if (!productId) {
    return { success: false, error: 'Not a product page' };
  }
  
  // 1. TITLE: Get from document.title, strip suffix
  let title = document.title
    .replace(/\\s*-\\s*阿里巴巴.*$/, '')
    .replace(/\\s*-\\s*Alibaba.*$/i, '')
    .trim();
  
  // 2. PRICES: Look for price range
  let priceMin = 0, priceMax = 0;
  
  // Method 1: Main price module
  const priceModule = document.querySelector('.module-od-main-price');
  if (priceModule) {
    const priceText = priceModule.innerText;
    const prices = priceText.match(/¥\\s*([\\d.]+)/g);
    if (prices && prices.length >= 1) {
      priceMin = parseFloat(prices[0].replace(/[¥\\s]/g, ''));
      if (prices.length >= 2) {
        priceMax = parseFloat(prices[1].replace(/[¥\\s]/g, ''));
      } else {
        priceMax = priceMin;
      }
    }
  }
  
  // Method 2: Fallback to range-price component
  if (!priceMin) {
    const rangePrice = document.querySelector('.price-component.range-price');
    if (rangePrice) {
      const prices = rangePrice.innerText.match(/¥\\s*([\\d.]+)/g);
      if (prices && prices.length >= 1) {
        priceMin = parseFloat(prices[0].replace(/[¥\\s]/g, ''));
        priceMax = prices.length >= 2 ? parseFloat(prices[1].replace(/[¥\\s]/g, '')) : priceMin;
      }
    }
  }
  
  // Method 3: Last resort - find any price element
  if (!priceMin) {
    const allPrices = document.body.innerText.match(/¥([\\d.]+)/g);
    if (allPrices) {
      const nums = allPrices.map(p => parseFloat(p.replace('¥', ''))).filter(n => n > 0.5 && n < 5000);
      if (nums.length > 0) {
        priceMin = Math.min(...nums);
        priceMax = Math.max(...nums);
      }
    }
  }
  
  // 3. IMAGES: Get all product images from cbu01.alicdn.com
  const imageSet = new Set();
  
  function getFullSizeUrl(src) {
    if (!src) return null;
    let full = src
      .replace(/_sum\\.jpg.*$/, '_b.jpg')
      .replace(/_\\d+x\\d+\\.jpg.*$/, '_b.jpg')
      .replace(/\\.jpg_.*$/, '.jpg')
      .replace(/\\.webp.*$/, '.jpg');
    if (full.startsWith('//')) full = 'https:' + full;
    return full;
  }
  
  document.querySelectorAll('img').forEach(img => {
    const src = img.src || img.dataset.src || img.dataset.lazySrc;
    if (src && src.includes('cbu01.alicdn.com') && !src.includes('avatar') && !src.includes('logo')) {
      const fullUrl = getFullSizeUrl(src);
      if (fullUrl) imageSet.add(fullUrl);
    }
  });
  
  const images = [...imageSet].slice(0, 15);
  
  // 4. VARIANTS: Get from SKU items
  const variants = [];
  const seenVariants = new Set();
  
  document.querySelectorAll('[class*="sku"] [class*="item"]').forEach(el => {
    const text = el.innerText.trim();
    const img = el.querySelector('img');
    
    // Skip if just "Color" or just a price
    if (!text || text === 'Color' || text.match(/^¥[\\d.]+$/)) {
      return;
    }
    
    // Skip duplicates (check by name without price)
    const variantName = text.replace(/[\\n\\r]*¥[\\d.]+/g, '').trim();
    if (seenVariants.has(variantName)) {
      return;
    }
    seenVariants.add(variantName);
    
    // Parse variant: "30 inches 1b\\n¥3.29" or "30 inches 1b ¥3.29"
    const priceMatch = text.match(/¥([\\d.]+)/);
    const variantPrice = priceMatch ? parseFloat(priceMatch[1]) : null;
    
    if (variantName && variantName.length > 2 && variantName.length < 80) {
      const variant = {
        name: variantName,
        price: variantPrice,
        image: img ? getFullSizeUrl(img.src || img.dataset.src) : null,
        attributes: {}
      };
      
      // Detect attribute types
      const lower = variantName.toLowerCase();
      
      // Length detection
      const lengthMatch = variantName.match(/(\\d+)\\s*(inch|inches|cm|")/i);
      if (lengthMatch) {
        variant.attributes.length = lengthMatch[0];
      }
      
      // Color detection (including hair color codes like 1b, 613, 99j)
      const colorCodes = ['1b', '2#', '4#', '27#', '30#', '60#', '613', '99j', '350', '900'];
      const colorNames = ['black', 'brown', 'blonde', 'red', 'blue', 'pink', 'purple', 'silver', 'green', 'orange'];
      
      for (const code of colorCodes) {
        if (lower.includes(code.toLowerCase())) {
          variant.attributes.color = code;
          break;
        }
      }
      if (!variant.attributes.color) {
        for (const color of colorNames) {
          if (lower.includes(color)) {
            variant.attributes.color = color;
            break;
          }
        }
      }
      
      seenVariants.add(text);
      variants.push(variant);
    }
  });
  
  // 5. Get MOQ if available
  let moq = 1;
  const moqMatch = document.body.innerText.match(/(\\d+)\\s*PCS起批/);
  if (moqMatch) moq = parseInt(moqMatch[1]);
  
  return {
    success: true,
    data: {
      productId,
      url,
      title,
      priceMin,
      priceMax,
      costPriceCNY: priceMin,
      images,
      mainImage: images[0] || null,
      variants: variants.slice(0, 30),
      moq,
      scrapedAt: new Date().toISOString()
    }
  };
})()
`;
  
  return executeJS(code);
}

async function sendToJeffy(productData) {
  const payload = {
    source: '1688',
    sourceProductId: productData.productId,
    sourceUrl: productData.url,
    titleOriginal: productData.title,
    title: productData.title,
    costPriceCNY: productData.costPriceCNY || productData.priceMin,
    images: productData.images,
    mainImage: productData.mainImage,
    moq: productData.moq,
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
    // Re-enrich all products since previous data was wrong
    return p.name?.startsWith('1688 Product') || 
           p.name?.includes('有限公司') ||
           !p.selling_price_cents || 
           p.selling_price_cents === 20000; // default price we set
  });
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const testArg = args.includes('--test');
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;
  
  console.log('='.repeat(60));
  console.log('🔄 JEFFY 1688 PREMIUM SCRAPER v3');
  console.log('='.repeat(60));
  console.log('');
  
  // Check browser connection
  console.log('🔌 Checking browser connection...');
  try {
    const status = await browserRequest('/status');
    if (status.status !== 'running') throw new Error('Browser not running');
    console.log('✅ Browser connected');
  } catch (e) {
    console.error('❌ Browser not connected. Start it with:');
    console.log('   cd ~/Desktop/jeffy-mvp/jeffy-1688-browser && npm start');
    process.exit(1);
  }
  
  if (testArg) {
    // Test mode - scrape current page
    console.log('\n🧪 TEST MODE - Scraping current page...');
    await scrollPage();
    await sleep(1000);
    const result = await scrapeProductData();
    console.log('\nScraped data:');
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  
  // Get products to enrich
  console.log(`\n📋 Fetching products to re-enrich (limit: ${limit})...`);
  const products = await getProductsToEnrich(limit);
  console.log(`Found ${products.length} products needing enrichment`);
  
  if (products.length === 0) {
    console.log('✨ No products need enrichment!');
    return;
  }
  
  const results = { success: 0, failed: 0 };
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const url = product.source_1688_url || product.source_url;
    
    console.log(`\n[${i + 1}/${products.length}] ${product.sku || product.id}`);
    
    if (!url) {
      console.log('   ⚠️  No URL, skipping');
      results.failed++;
      continue;
    }
    
    try {
      // Navigate
      console.log('   📍 Navigating...');
      await navigateTo(url);
      await sleep(3000);
      
      // Scroll to load content
      console.log('   📜 Loading content...');
      await scrollPage();
      await sleep(1500);
      
      // Scrape
      console.log('   🔍 Scraping...');
      const scraped = await scrapeProductData();
      
      if (!scraped || !scraped.success) {
        console.log(`   ❌ Scrape failed: ${scraped?.error || 'Unknown'}`);
        results.failed++;
        continue;
      }
      
      const data = scraped.data;
      console.log(`   📦 Title: ${data.title.substring(0, 50)}...`);
      console.log(`   💰 Price: ¥${data.priceMin} - ¥${data.priceMax}`);
      console.log(`   📸 Images: ${data.images.length}, Variants: ${data.variants.length}`);
      
      if (!data.images.length) {
        console.log('   ⚠️  No images found');
      }
      
      // Send to Jeffy
      console.log('   📤 Uploading...');
      const result = await sendToJeffy(data);
      
      if (result.success) {
        console.log(`   ✅ Done! Images: ${result.imagesUploaded || 0}`);
        results.success++;
      } else {
        console.log(`   ❌ Upload failed: ${result.error}`);
        results.failed++;
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.failed++;
    }
    
    // Delay between products
    if (i < products.length - 1) {
      await sleep(BETWEEN_PRODUCTS);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 ENRICHMENT COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
}

main().catch(console.error);
