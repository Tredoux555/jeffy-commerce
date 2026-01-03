#!/usr/bin/env node
/**
 * JEFFY 1688 PREMIUM SCRAPER v4
 * With Claude AI Copywriting
 * 
 * Pipeline:
 * 1. Scrape raw data from 1688 (title, specs, variants, images)
 * 2. Send to Claude API for copywriting
 * 3. Get polished title, description, features, clean variants
 * 4. Save to Jeffy database
 */

const BROWSER_API = 'http://127.0.0.1:3688';
const JEFFY_API = 'https://jeffy.co.za';
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const BETWEEN_PRODUCTS = 5000; // 5s between products

// You'll need to set this or pass via env
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

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
  await browserRequest('/scroll', 'POST', { direction: 'down', amount: 800 });
  await sleep(500);
  await browserRequest('/scroll', 'POST', { direction: 'down', amount: 800 });
  await sleep(500);
  await browserRequest('/scroll', 'POST', { direction: 'up', amount: 600 });
}

async function executeJS(code) {
  const result = await browserRequest('/execute', 'POST', { code });
  return result.result;
}

// ============================================
// SCRAPE RAW DATA FROM 1688
// ============================================
async function scrapeRawData() {
  const code = `
(function() {
  const url = window.location.href;
  const productIdMatch = url.match(/offer\\/(\\d+)\\.html/);
  const productId = productIdMatch ? productIdMatch[1] : null;
  
  if (!productId) return { success: false, error: 'Not a product page' };
  
  // 1. RAW TITLE from document.title
  const rawTitle = document.title
    .replace(/\\s*-\\s*阿里巴巴.*$/, '')
    .replace(/\\s*-\\s*Alibaba.*$/i, '')
    .trim();
  
  // 2. PRICES
  let priceMin = 0, priceMax = 0;
  const priceModule = document.querySelector('.module-od-main-price');
  if (priceModule) {
    const prices = priceModule.innerText.match(/¥\\s*([\\d.]+)/g);
    if (prices && prices.length >= 1) {
      priceMin = parseFloat(prices[0].replace(/[¥\\s]/g, ''));
      priceMax = prices.length >= 2 ? parseFloat(prices[1].replace(/[¥\\s]/g, '')) : priceMin;
    }
  }
  
  // 3. SPECIFICATIONS TABLE
  const specs = {};
  document.querySelectorAll('[class*="attr"] tr, [class*="attr"] .ant-descriptions-row').forEach(row => {
    const cells = row.querySelectorAll('th, td');
    for (let i = 0; i < cells.length - 1; i += 2) {
      const key = cells[i]?.innerText?.trim();
      const val = cells[i + 1]?.innerText?.trim();
      if (key && val && key.length < 50 && val.length < 200) {
        specs[key] = val;
      }
    }
  });
  
  // 4. IMAGES
  const imageSet = new Set();
  function getFullUrl(src) {
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
      const fullUrl = getFullUrl(src);
      if (fullUrl) imageSet.add(fullUrl);
    }
  });
  const images = [...imageSet].slice(0, 15);
  
  // 5. VARIANTS with prices and images
  const variants = [];
  const seenVariants = new Set();
  
  document.querySelectorAll('[class*="sku"] [class*="item"]').forEach(el => {
    const text = el.innerText.trim();
    const img = el.querySelector('img');
    
    if (!text || text === 'Color' || text.match(/^¥[\\d.]+$/) || seenVariants.has(text)) return;
    
    const priceMatch = text.match(/¥([\\d.]+)/);
    const variantPrice = priceMatch ? parseFloat(priceMatch[1]) : null;
    const variantName = text.replace(/[\\n\\r]*¥[\\d.]+/g, '').trim();
    
    if (variantName && variantName.length > 2 && variantName.length < 100) {
      variants.push({
        rawName: variantName,
        price: variantPrice,
        image: img ? getFullUrl(img.src || img.dataset.src) : null
      });
      seenVariants.add(text);
    }
  });
  
  // 6. MOQ
  let moq = 1;
  const moqMatch = document.body.innerText.match(/(\\d+)\\s*PCS起批/);
  if (moqMatch) moq = parseInt(moqMatch[1]);
  
  // 7. Weight if available
  let weight = null;
  const weightMatch = document.body.innerText.match(/(\\d+\\.?\\d*)\\s*(g|kg|克|千克)/i);
  if (weightMatch) weight = weightMatch[0];
  
  return {
    success: true,
    raw: {
      productId,
      url,
      rawTitle,
      priceMin,
      priceMax,
      specs,
      images,
      variants: variants.slice(0, 30),
      moq,
      weight
    }
  };
})()
`;
  return executeJS(code);
}

// ============================================
// CLAUDE COPYWRITING
// ============================================
async function copywriteWithClaude(rawData) {
  if (!ANTHROPIC_API_KEY) {
    console.log('   ⚠️  No API key - using basic cleanup');
    return basicCleanup(rawData);
  }
  
  const prompt = `You are a product copywriter for a South African e-commerce store. Transform this raw 1688.com wholesale listing into polished consumer-ready content.

RAW DATA:
Title: ${rawData.rawTitle}
Price: ¥${rawData.priceMin} - ¥${rawData.priceMax}
Specifications: ${JSON.stringify(rawData.specs, null, 2)}
Variants: ${rawData.variants.map(v => v.rawName).join(', ')}
Weight: ${rawData.weight || 'Not specified'}

REQUIREMENTS:
1. TITLE: Create a clean, consumer-friendly product title (max 80 chars)
   - Remove: "Cross-border", "Wholesale", "Factory", "Manufacturers", "OEM", "ODM"
   - Keep: Product type, key features, size/quantity if relevant
   - Format: "[Product Name] - [Key Feature] ([Size/Qty])" or similar

2. DESCRIPTION: Write 2-3 compelling sentences (max 200 chars)
   - Focus on benefits to the customer
   - Mention key materials/features from specs
   - Sound professional, not like a translation

3. SHORT_DESCRIPTION: One punchy sentence for product cards (max 80 chars)

4. FEATURES: 3-5 bullet points of key selling points (each max 60 chars)

5. CLEAN_VARIANTS: Clean up each variant name
   - Remove labels like "Product specifications", "Net content"
   - Keep just the variant value: "60ml", "Rose Gold", "Large"
   - Input variants: ${JSON.stringify(rawData.variants.map(v => v.rawName))}

6. CATEGORY_SUGGESTION: Suggest the best category from:
   Beauty & Skincare, Hair Care, Health & Wellness, Home & Living, Fashion & Accessories, Electronics, Sports & Outdoors, Baby & Kids, Food & Beverages, Other

Respond in JSON format only:
{
  "title": "...",
  "description": "...",
  "shortDescription": "...",
  "features": ["...", "...", "..."],
  "cleanVariants": ["...", "..."],
  "categorySuggestion": "..."
}`;

  try {
    const response = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    if (!content) {
      console.log('   ⚠️  Empty Claude response');
      return basicCleanup(rawData);
    }
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('   ⚠️  Could not parse Claude response');
      return basicCleanup(rawData);
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.log(`   ⚠️  Claude API error: ${err.message}`);
    return basicCleanup(rawData);
  }
}

// Basic cleanup without Claude
function basicCleanup(rawData) {
  // Clean title
  let title = rawData.rawTitle
    .replace(/cross[-\s]?border/gi, '')
    .replace(/wholesale/gi, '')
    .replace(/factory\s*(direct\s*)?supply/gi, '')
    .replace(/manufacturers?/gi, '')
    .replace(/OEM|ODM/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (title.length > 80) title = title.substring(0, 77) + '...';
  
  // Clean variants
  const cleanVariants = rawData.variants.map(v => {
    return v.rawName
      .replace(/^(Product\s*)?specifications?\s*/i, '')
      .replace(/^Net\s*content\s*/i, '')
      .replace(/[\n\r\t]/g, ' ')
      .trim();
  }).filter(v => v.length > 1);
  
  return {
    title,
    description: `Quality ${title.toLowerCase().split(' ').slice(0, 3).join(' ')} product. ${rawData.specs['Brand'] ? 'Brand: ' + rawData.specs['Brand'] + '.' : ''} Imported directly for the best value.`,
    shortDescription: title.substring(0, 80),
    features: Object.entries(rawData.specs).slice(0, 4).map(([k, v]) => `${k}: ${v}`),
    cleanVariants,
    categorySuggestion: 'Other'
  };
}

// ============================================
// SEND TO JEFFY API
// ============================================
async function sendToJeffy(rawData, copywrittenData) {
  // Build variants with cleaned names
  const variants = rawData.variants.map((v, i) => ({
    name: copywrittenData.cleanVariants[i] || v.rawName,
    rawName: v.rawName,
    price: v.price,
    image: v.image,
    attributes: {}
  }));
  
  const payload = {
    source: '1688',
    sourceProductId: rawData.productId,
    sourceUrl: rawData.url,
    titleOriginal: rawData.rawTitle,
    title: copywrittenData.title,
    description: copywrittenData.description,
    shortDescription: copywrittenData.shortDescription,
    features: copywrittenData.features,
    categorySuggestion: copywrittenData.categorySuggestion,
    costPriceCNY: rawData.priceMin,
    images: rawData.images,
    mainImage: rawData.images[0],
    moq: rawData.moq,
    weight: rawData.weight,
    specs: rawData.specs,
    variants
  };
  
  const resp = await fetch(`${JEFFY_API}/api/import/1688/enrich`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  return resp.json();
}

// ============================================
// GET PRODUCTS TO ENRICH
// ============================================
async function getProductsToEnrich(limit = 50) {
  const resp = await fetch(`${JEFFY_API}/api/import/1688?limit=${limit}`);
  const data = await resp.json();
  if (!data.products) return [];
  
  // Get products that haven't been copywritten (no features) or have bad data
  return data.products.filter(p => {
    const hasFeatures = p.source_data?.features?.length > 0;
    const hasBadName = p.name?.includes('有限公司') || p.name?.startsWith('1688 Product');
    const hasDefaultPrice = p.selling_price_cents === 20000;
    const noDescription = !p.description || p.description.length < 50;
    
    // Need enrichment if: no features OR bad name OR no description
    return !hasFeatures || hasBadName || noDescription;
  });
}

// ============================================
// MAIN
// ============================================
async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const testArg = args.includes('--test');
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;
  
  console.log('='.repeat(60));
  console.log('🚀 JEFFY 1688 PREMIUM SCRAPER v4');
  console.log('   With Claude AI Copywriting');
  console.log('='.repeat(60));
  console.log('');
  
  if (!ANTHROPIC_API_KEY) {
    console.log('⚠️  ANTHROPIC_API_KEY not set - will use basic cleanup');
    console.log('   Set it with: export ANTHROPIC_API_KEY=your-key');
    console.log('');
  }
  
  // Check browser
  console.log('🔌 Checking browser...');
  try {
    const status = await browserRequest('/status');
    if (status.status !== 'running') throw new Error('Browser not running');
    console.log('✅ Browser connected');
  } catch (e) {
    console.error('❌ Browser not connected. Start with:');
    console.log('   cd ~/Desktop/jeffy-mvp/jeffy-1688-browser && npm start');
    process.exit(1);
  }
  
  if (testArg) {
    // Test mode
    console.log('\n🧪 TEST MODE - Processing current page...');
    await scrollPage();
    await sleep(1000);
    
    console.log('   🔍 Scraping raw data...');
    const scraped = await scrapeRawData();
    if (!scraped?.success) {
      console.log('   ❌ Scrape failed');
      return;
    }
    
    console.log('   ✍️  Copywriting with Claude...');
    const copywritten = await copywriteWithClaude(scraped.raw);
    
    console.log('\n📦 RESULTS:');
    console.log('-'.repeat(50));
    console.log('RAW TITLE:', scraped.raw.rawTitle);
    console.log('');
    console.log('✨ POLISHED TITLE:', copywritten.title);
    console.log('✨ DESCRIPTION:', copywritten.description);
    console.log('✨ SHORT DESC:', copywritten.shortDescription);
    console.log('✨ FEATURES:', copywritten.features);
    console.log('✨ CATEGORY:', copywritten.categorySuggestion);
    console.log('✨ CLEAN VARIANTS:', copywritten.cleanVariants?.slice(0, 5));
    console.log('');
    console.log('📸 Images:', scraped.raw.images.length);
    console.log('🏷️  Variants:', scraped.raw.variants.length);
    console.log('💰 Price: ¥', scraped.raw.priceMin, '-', scraped.raw.priceMax);
    return;
  }
  
  // Get products
  console.log(`\n📋 Fetching products (limit: ${limit})...`);
  const products = await getProductsToEnrich(limit);
  console.log(`Found ${products.length} products needing enrichment`);
  
  if (products.length === 0) {
    console.log('✨ All products are enriched!');
    return;
  }
  
  const results = { success: 0, failed: 0 };
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const url = product.source_1688_url || product.source_url;
    
    console.log(`\n[${i + 1}/${products.length}] ${product.sku}`);
    
    if (!url) {
      console.log('   ⚠️  No URL, skipping');
      results.failed++;
      continue;
    }
    
    try {
      // Navigate
      console.log('   📍 Navigating...');
      await navigateTo(url);
      await sleep(3500);
      
      // Scroll
      console.log('   📜 Loading content...');
      await scrollPage();
      await sleep(1500);
      
      // Scrape
      console.log('   🔍 Scraping...');
      const scraped = await scrapeRawData();
      
      if (!scraped?.success) {
        console.log(`   ❌ Scrape failed`);
        results.failed++;
        continue;
      }
      
      // Copywrite
      console.log('   ✍️  Copywriting...');
      const copywritten = await copywriteWithClaude(scraped.raw);
      
      console.log(`   📦 "${copywritten.title.substring(0, 45)}..."`);
      console.log(`   💰 ¥${scraped.raw.priceMin}, 📸 ${scraped.raw.images.length} imgs, 🏷️ ${scraped.raw.variants.length} variants`);
      
      // Upload
      console.log('   📤 Uploading...');
      const result = await sendToJeffy(scraped.raw, copywritten);
      
      if (result.success) {
        console.log(`   ✅ Done!`);
        results.success++;
      } else {
        console.log(`   ❌ Upload failed: ${result.error}`);
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
  console.log('📊 ENRICHMENT COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
}

main().catch(console.error);
