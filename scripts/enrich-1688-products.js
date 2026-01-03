#!/usr/bin/env node
/**
 * JEFFY 1688 AUTO ENRICHMENT
 * 
 * Enriches stub products with real data from 1688
 * Uses the 1688 browser app's API for scraping
 * 
 * Prerequisites:
 *   1. Start 1688 browser: cd jeffy-1688-browser && npx electron .
 *   2. Login to 1688 in the browser
 *   3. Run this script
 * 
 * Usage:
 *   node scripts/enrich-1688-products.js
 *   node scripts/enrich-1688-products.js --limit=10
 *   node scripts/enrich-1688-products.js --category=hair-crochet-braids
 */

const BROWSER_API = 'http://127.0.0.1:3688';
const JEFFY_API = process.env.API_URL || 'https://jeffy.co.za';

// Delays to avoid detection
const NAVIGATE_DELAY = 3000;  // Wait for page load
const SCROLL_DELAY = 1000;    // Wait between scrolls
const CAPTURE_DELAY = 2000;   // Wait before capture
const BETWEEN_PRODUCTS = 5000; // Wait between products

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

async function scrollPage(amount = 1000) {
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

/**
 * Enhanced scraper that gets HIGH QUALITY images
 * 1688 image URL patterns:
 * - Thumbnails: xxx.60x60.jpg, xxx_100x100.jpg
 * - Full size: Remove size suffix, use original
 */
async function scrapeProductData() {
  const code = `
    (function() {
      const url = window.location.href;
      
      // Extract product ID
      const productIdMatch = url.match(/offer\\/(\\d+)\\.html/) || url.match(/offerId=(\\d+)/);
      const productId = productIdMatch ? productIdMatch[1] : null;
      
      if (!productId) {
        return { success: false, error: 'Not a product page' };
      }
      
      // Get title - look for long text that looks like product title
      // On 1688, product titles are often in specific containers or are the longest text blocks
      let title = '';
      
      // Method 1: Find by specific 1688 selectors
      const titleSelectors = [
        '.title-text',
        '.d-title',
        '.mod-detail-title',
        '[class*="offerdetail"] [class*="title"]',
        '.detail-title',
        'h1'
      ];
      for (const sel of titleSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const text = el.textContent.trim();
          // Product titles are usually 20-200 chars and contain keywords
          if (text.length > 20 && text.length < 300 && !text.includes('分') && !text.includes('%')) {
            title = text;
            break;
          }
        }
      }
      
      // Method 2: Search full page text for product-like title
      if (!title) {
        const bodyText = document.body.innerText;
        // Look for long English text (product names for export are often in English)
        const englishMatch = bodyText.match(/([A-Z][A-Za-z0-9\\s\\-\\.]+(?:Hair|Wig|Braid|Curl|Locs|Nail|Makeup|Beauty|LED|Phone)[A-Za-z0-9\\s\\-\\.]{10,150})/g);
        if (englishMatch && englishMatch[0]) {
          title = englishMatch[0].trim().split('\\n')[0]; // Remove any trailing newlines/ratings
        }
      }
      
      // Method 3: Fallback to looking for text near price
      if (!title) {
        const allText = document.body.innerText.split('\\n');
        for (const line of allText) {
          if (line.length > 30 && line.length < 200 && 
              (line.includes('Hair') || line.includes('Nail') || line.includes('Wig') || 
               line.includes('Braid') || line.includes('假发') || line.includes('头发'))) {
            title = line.trim();
            break;
          }
        }
      }
      
      // Get price range
      let priceMin = 0, priceMax = 0;
      const priceSelectors = [
        '.price-text',
        '.price-num',
        '.d-price',
        '[class*="price"]'
      ];
      for (const sel of priceSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const nums = el.textContent.match(/[\\d.]+/g);
          if (nums && nums.length > 0) {
            priceMin = parseFloat(nums[0]);
            priceMax = nums[1] ? parseFloat(nums[1]) : priceMin;
            break;
          }
        }
      }
      
      // Get HIGH QUALITY images - comprehensive extraction
      const imageSet = new Set();
      
      // Helper to convert thumbnail to full size
      function getFullSizeUrl(url) {
        if (!url) return null;
        let full = url;
        // Remove various thumbnail patterns
        full = full.replace(/_(\\d+)x(\\d+)\\./g, '.');
        full = full.replace(/\\.(\\d+)x(\\d+)\\./g, '.');
        full = full.replace(/_[bsmtq]\\./g, '.');
        full = full.replace(/\\.summ.*$/g, '');
        full = full.replace(/\\.search.*$/g, '');
        full = full.replace(/\\?.*$/, '');
        // Ensure HTTPS
        if (full.startsWith('//')) full = 'https:' + full;
        if (full.startsWith('http://')) full = full.replace('http://', 'https://');
        return full;
      }
      
      // 1. Main gallery images (highest quality)
      document.querySelectorAll('.detail-gallery-img, .gallery-img, [class*="gallery"] img').forEach(img => {
        const src = img.src || img.dataset.src || img.dataset.lazySrc;
        if (src && !src.includes('placeholder') && !src.includes('loading')) {
          imageSet.add(getFullSizeUrl(src));
        }
      });
      
      // 2. Thumbnail strip (often links to high-res)
      document.querySelectorAll('.thumb-list img, .detail-gallery-turn img, [class*="thumb"] img').forEach(img => {
        const src = img.src || img.dataset.src || img.dataset.lazySrc;
        const bigSrc = img.dataset.big || img.dataset.original || img.dataset.src;
        if (bigSrc) {
          imageSet.add(getFullSizeUrl(bigSrc));
        } else if (src) {
          imageSet.add(getFullSizeUrl(src));
        }
      });
      
      // 3. SKU/variant images
      document.querySelectorAll('[class*="sku"] img, [class*="variant"] img, [class*="color"] img').forEach(img => {
        const src = img.src || img.dataset.src;
        if (src && !src.includes('placeholder')) {
          imageSet.add(getFullSizeUrl(src));
        }
      });
      
      // 4. Detail/description images (product photos in description)
      document.querySelectorAll('.offer-details img, .detail-desc img, [class*="detail"] img').forEach(img => {
        const src = img.src || img.dataset.src;
        if (src && src.includes('cbu01.alicdn.com') && !src.includes('placeholder')) {
          imageSet.add(getFullSizeUrl(src));
        }
      });
      
      // Filter and dedupe - keep only high quality product images
      const images = Array.from(imageSet)
        .filter(url => {
          if (!url || url.length < 30) return false;
          // Must be image file
          if (!url.includes('.jpg') && !url.includes('.png') && !url.includes('.webp')) return false;
          // Exclude icons and small images
          if (url.includes('icon') || url.includes('logo') || url.includes('avatar')) return false;
          // Exclude very small images (likely icons) - check URL patterns
          if (url.includes('-tps-') && url.match(/-tps-(\\d+)-(\\d+)/)) {
            const m = url.match(/-tps-(\\d+)-(\\d+)/);
            if (m && (parseInt(m[1]) < 100 || parseInt(m[2]) < 100)) return false;
          }
          // Prefer cbu01.alicdn.com (product images) over img.alicdn.com (often icons)
          // Keep both but prioritize cbu01
          return true;
        })
        // Sort: cbu01.alicdn (product images) first, then others
        .sort((a, b) => {
          const aIsCbu = a.includes('cbu01.alicdn.com') ? 0 : 1;
          const bIsCbu = b.includes('cbu01.alicdn.com') ? 0 : 1;
          return aIsCbu - bIsCbu;
        })
        .slice(0, 15);
      
      // Get description text
      let description = '';
      const descEl = document.querySelector('.offer-details, .detail-desc, [class*="detail-info"]');
      if (descEl) {
        description = descEl.innerText.substring(0, 2000);
      }
      
      // Get MOQ
      let moq = 1;
      const moqEl = document.querySelector('[class*="moq"], [class*="min-order"]');
      if (moqEl) {
        const m = moqEl.textContent.match(/\\d+/);
        if (m) moq = parseInt(m[0]);
      }
      
      // Get sales count
      let sales = 0;
      const salesEl = document.querySelector('[class*="sale"], [class*="成交"], [class*="sold"]');
      if (salesEl) {
        const s = salesEl.textContent.match(/\\d+/);
        if (s) sales = parseInt(s[0]);
      }
      
      // Get color/variant options with images and prices
      let variants = [];
      
      // Method 1: SKU items (most common)
      document.querySelectorAll('[class*="sku-item"], [class*="prop-item"], [class*="sku-wrapper"] li, [class*="sku"] [class*="item"]').forEach(el => {
        const text = el.textContent.trim();
        const img = el.querySelector('img');
        const priceEl = el.querySelector('[class*="price"]');
        
        if (text && text.length > 0 && text.length < 100) {
          const variant = {
            name: text.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim(),
            image: null,
            priceAdjustment: 0,
            attributes: {}
          };
          
          // Get variant image (high quality)
          if (img) {
            const imgSrc = img.src || img.dataset.src || img.dataset.lazySrc || img.dataset.big;
            if (imgSrc) {
              variant.image = getFullSizeUrl(imgSrc);
            }
          }
          
          // Extract price if shown
          if (priceEl) {
            const priceMatch = priceEl.textContent.match(/[\d.]+/);
            if (priceMatch) {
              variant.price = parseFloat(priceMatch[0]);
            }
          }
          
          // Try to identify attribute type
          const lowerText = text.toLowerCase();
          
          // Length detection
          const lengthMatch = text.match(/(\d+)\s*(inch|inches|cm|mm|"|'|寸)/i);
          if (lengthMatch) {
            variant.attributes.length = lengthMatch[0];
          }
          
          // Color detection
          const colors = ['black', 'brown', 'blonde', 'red', 'blue', 'white', 'pink', 'purple', 'green', 'gray', 'grey', 'gold', 'silver', 'orange', 'burgundy', 'ombre', 'natural', '1b', '2', '4', '27', '30', '33', '613', '99j', 't1b'];
          for (const color of colors) {
            if (lowerText.includes(color)) {
              variant.attributes.color = color.charAt(0).toUpperCase() + color.slice(1);
              break;
            }
          }
          
          // Size detection
          const sizeMatch = text.match(/\b(XS|S|M|L|XL|XXL|XXXL|\d+g|\d+ml)\b/i);
          if (sizeMatch) {
            variant.attributes.size = sizeMatch[0].toUpperCase();
          }
          
          // Only add if we have meaningful data
          if (variant.name.length > 1 && !variant.name.match(/^[\d.]+$/)) {
            variants.push(variant);
          }
        }
      });
      
      // Method 2: Color swatches (backup)
      if (variants.length === 0) {
        document.querySelectorAll('[class*="color"] img, [class*="swatch"] img').forEach((img, idx) => {
          const src = img.src || img.dataset.src;
          const alt = img.alt || img.title || '';
          if (src && !src.includes('placeholder')) {
            variants.push({
              name: alt || 'Variant ' + (idx + 1),
              image: getFullSizeUrl(src),
              attributes: alt ? { color: alt } : {}
            });
          }
        });
      }
      
      // Dedupe variants by name
      const seenNames = new Set();
      variants = variants.filter(v => {
        if (seenNames.has(v.name)) return false;
        seenNames.add(v.name);
        return true;
      }).slice(0, 30); // Max 30 variants
      
      return {
        success: true,
        data: {
          productId,
          url,
          title,
          titleOriginal: title,
          priceMin,
          priceMax,
          costPriceCNY: priceMin,
          mainImage: images[0] || null,
          images,
          description,
          moq,
          sales,
          variants: variants.slice(0, 20),
          scrapedAt: new Date().toISOString()
        }
      };
    })()
  `;
  
  const result = await executeJS(code);
  return result.result;
}

async function sendToJeffy(productData) {
  const payload = {
    source: '1688',
    sourceProductId: productData.productId,
    sourceUrl: productData.url,
    titleOriginal: productData.titleOriginal,
    title: productData.title,
    descriptionOriginal: productData.description,
    description: productData.description,
    costPriceCNY: productData.costPriceCNY || productData.priceMin,
    images: productData.images,
    mainImage: productData.mainImage,
    moq: productData.moq,
    variants: productData.variants,
    capturedAt: productData.scrapedAt
  };
  
  // Use PUT to enrich existing products
  const resp = await fetch(`${JEFFY_API}/api/import/1688/enrich`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  return resp.json();
}

async function getProductsToEnrich(limit = 50, categorySlug = null) {
  // Get products that need enrichment (price = 0 or no images)
  let url = `${JEFFY_API}/api/import/1688?status=draft&limit=${limit}`;
  
  const resp = await fetch(url);
  const data = await resp.json();
  
  if (!data.products) return [];
  
  // Filter to those needing enrichment
  return data.products.filter(p => {
    const needsEnrichment = !p.selling_price_cents || p.selling_price_cents === 0 ||
                           !p.images || p.images.length === 0 ||
                           !p.primary_image_url;
    if (categorySlug && p.source_data?.category_slug !== categorySlug) {
      return false;
    }
    return needsEnrichment;
  });
}

async function enrichProduct(product) {
  const url = product.source_url || product.source_1688_url;
  if (!url) {
    console.log(`   ⚠️  No source URL for ${product.id}`);
    return { success: false, error: 'No source URL' };
  }
  
  console.log(`   📍 Navigating to: ${url}`);
  await navigateTo(url);
  await sleep(NAVIGATE_DELAY);
  
  // Scroll to load images
  console.log(`   📜 Scrolling to load content...`);
  await scrollPage(500);
  await sleep(SCROLL_DELAY);
  await scrollPage(800);
  await sleep(SCROLL_DELAY);
  await scrollPage(500);
  await sleep(CAPTURE_DELAY);
  
  // Scrape data
  console.log(`   🔍 Scraping product data...`);
  const scraped = await scrapeProductData();
  
  if (!scraped || !scraped.success) {
    console.log(`   ❌ Scrape failed: ${scraped?.error || 'Unknown error'}`);
    return { success: false, error: scraped?.error || 'Scrape failed' };
  }
  
  const data = scraped.data;
  console.log(`   📸 Found ${data.images?.length || 0} images, ${data.variants?.length || 0} variants`);
  console.log(`   💰 Price: ¥${data.priceMin} - ¥${data.priceMax}`);
  
  // Send to Jeffy
  console.log(`   📤 Sending to Jeffy...`);
  const result = await sendToJeffy(data);
  
  if (result.success) {
    console.log(`   ✅ Enriched! SKU: ${result.sku}, Images: ${result.imagesUploaded || 0}, Variants: ${result.variantsProcessed || 0}`);
    return { success: true, ...result };
  } else {
    console.log(`   ❌ Send failed: ${result.error}`);
    return { success: false, error: result.error };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const categoryArg = args.find(a => a.startsWith('--category='));
  const testMode = args.includes('--test');
  
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 50;
  const categorySlug = categoryArg ? categoryArg.split('=')[1] : null;
  
  console.log('='.repeat(60));
  console.log('🔄 JEFFY 1688 AUTO ENRICHMENT');
  console.log('='.repeat(60));
  console.log(`Browser API: ${BROWSER_API}`);
  console.log(`Jeffy API: ${JEFFY_API}`);
  console.log(`Limit: ${limit}`);
  if (categorySlug) console.log(`Category: ${categorySlug}`);
  console.log('');
  
  // Check if browser is running
  console.log('🔌 Checking 1688 browser...');
  const browserOk = await checkBrowserRunning();
  if (!browserOk) {
    console.error('❌ 1688 browser not running!');
    console.log('');
    console.log('Start it with:');
    console.log('  cd ~/Desktop/jeffy-mvp/jeffy-1688-browser && npx electron .');
    console.log('');
    console.log('Then login to 1688 and run this script again.');
    process.exit(1);
  }
  console.log('✅ Browser connected');
  console.log('');
  
  if (testMode) {
    // Test with one product
    console.log('🧪 TEST MODE - Testing with one product...');
    await navigateTo('https://detail.1688.com/offer/581430625604.html');
    await sleep(NAVIGATE_DELAY);
    await scrollPage(500);
    await sleep(SCROLL_DELAY);
    const scraped = await scrapeProductData();
    console.log('Scraped data:', JSON.stringify(scraped, null, 2));
    return;
  }
  
  // Get products needing enrichment
  console.log('📋 Fetching products to enrich...');
  const products = await getProductsToEnrich(limit, categorySlug);
  console.log(`Found ${products.length} products needing enrichment`);
  console.log('');
  
  if (products.length === 0) {
    console.log('✨ All products are already enriched!');
    return;
  }
  
  const results = { success: 0, failed: 0, skipped: 0 };
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n[${i + 1}/${products.length}] ${product.name || product.id}`);
    
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
    
    // Delay between products
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
  console.log(`⏭️  Skipped: ${results.skipped}`);
}

main().catch(console.error);
