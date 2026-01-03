#!/usr/bin/env node
/**
 * 1688 DEEP DIVE - Explore page structure to find all data sources
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const TEST_URL = process.argv[2] || 'https://detail.1688.com/offer/581430625604.html';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 1688 DEEP DIVE - Page Structure Analysis');
  console.log('='.repeat(70));
  console.log(`URL: ${TEST_URL}`);
  console.log('');

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--window-size=1400,900',
      '--lang=zh-CN',
      '--no-sandbox'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const page = await browser.newPage();
  
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
  });
  
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('🚀 Loading page...');
  await page.goto(TEST_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  
  console.log('📜 Scrolling to trigger lazy loading...');
  for (let i = 0; i < 5; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 500);
    await sleep(800);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(2000);

  console.log('\n' + '='.repeat(70));
  console.log('📊 SEARCHING FOR EMBEDDED JSON DATA');
  console.log('='.repeat(70));

  // Search for all global data objects
  const globalData = await page.evaluate(() => {
    const results = {};
    
    // Known 1688 data objects to look for
    const knownObjects = [
      '__INIT_DATA__',
      '__INIT_STATE__', 
      '__DATA__',
      '__PRELOADED_STATE__',
      'iDetailData',
      'iDetailConfig',
      'offerDetailData',
      'detailData',
      'pageData',
      'globalData'
    ];
    
    for (const name of knownObjects) {
      if (window[name]) {
        results[name] = {
          exists: true,
          type: typeof window[name],
          keys: Object.keys(window[name]).slice(0, 20),
          sample: JSON.stringify(window[name]).substring(0, 500)
        };
      }
    }
    
    // Search for any object with offer/product data
    for (const key of Object.keys(window)) {
      if (key.startsWith('__') || key.includes('data') || key.includes('Data') || 
          key.includes('detail') || key.includes('Detail') || key.includes('offer')) {
        const val = window[key];
        if (val && typeof val === 'object' && !results[key]) {
          const str = JSON.stringify(val);
          if (str && str.length > 100 && str.length < 1000000) {
            // Check if it contains product-like data
            if (str.includes('price') || str.includes('title') || str.includes('sku') || 
                str.includes('offer') || str.includes('product')) {
              results[key] = {
                exists: true,
                type: typeof val,
                keys: Object.keys(val).slice(0, 15),
                sample: str.substring(0, 300)
              };
            }
          }
        }
      }
    }
    
    return results;
  });

  console.log('\nFound global objects:');
  for (const [name, info] of Object.entries(globalData)) {
    console.log(`\n📦 ${name}:`);
    console.log(`   Keys: ${info.keys.join(', ')}`);
    console.log(`   Sample: ${info.sample.substring(0, 200)}...`);
  }

  // Now let's look for script tags with JSON data
  console.log('\n' + '='.repeat(70));
  console.log('📜 SEARCHING SCRIPT TAGS FOR JSON DATA');
  console.log('='.repeat(70));

  const scriptData = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script');
    const results = [];
    
    scripts.forEach((script, idx) => {
      const content = script.textContent || '';
      
      // Look for JSON assignments
      const patterns = [
        /window\.__INIT_DATA__\s*=\s*(\{[\s\S]*?\});/,
        /window\.iDetailData\s*=\s*(\{[\s\S]*?\});/,
        /window\.detailData\s*=\s*(\{[\s\S]*?\});/,
        /window\.globalData\s*=\s*(\{[\s\S]*?\});/,
        /"offerDetail"\s*:\s*(\{[\s\S]*?\})/,
        /"data"\s*:\s*(\{[^{}]*"title"[^{}]*\})/
      ];
      
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          results.push({
            scriptIndex: idx,
            pattern: pattern.toString().substring(0, 50),
            dataPreview: match[1] ? match[1].substring(0, 300) : content.substring(0, 300)
          });
        }
      }
      
      // Also check for large JSON-like content
      if (content.includes('"title"') && content.includes('"price"') && content.length > 1000) {
        results.push({
          scriptIndex: idx,
          note: 'Contains title and price keywords',
          preview: content.substring(0, 500)
        });
      }
    });
    
    return results;
  });

  console.log(`\nFound ${scriptData.length} potential data scripts:`);
  scriptData.forEach((s, i) => {
    console.log(`\n[Script ${s.scriptIndex}] ${s.pattern || s.note || ''}`);
    console.log(`   Preview: ${(s.dataPreview || s.preview || '').substring(0, 200)}...`);
  });

  // Now let's try to extract actual product data using various methods
  console.log('\n' + '='.repeat(70));
  console.log('🎯 ATTEMPTING DATA EXTRACTION');
  console.log('='.repeat(70));

  const extractedData = await page.evaluate(() => {
    const result = {
      method: null,
      title: null,
      prices: [],
      images: [],
      variants: [],
      raw: null
    };

    // METHOD 1: Try window.__INIT_DATA__
    if (window.__INIT_DATA__) {
      result.method = '__INIT_DATA__';
      const data = window.__INIT_DATA__;
      
      // Try to find offer/product data in the structure
      const findInObject = (obj, depth = 0) => {
        if (depth > 5 || !obj || typeof obj !== 'object') return null;
        
        // Direct properties
        if (obj.title && typeof obj.title === 'string' && obj.title.length > 10) {
          return obj;
        }
        if (obj.offerTitle || obj.productTitle || obj.subject) {
          return obj;
        }
        
        // Search nested
        for (const key of Object.keys(obj)) {
          if (typeof obj[key] === 'object') {
            const found = findInObject(obj[key], depth + 1);
            if (found) return found;
          }
        }
        return null;
      };
      
      const productData = findInObject(data);
      if (productData) {
        result.raw = JSON.stringify(productData).substring(0, 2000);
      }
    }

    // METHOD 2: Try iDetailData (common on 1688)
    if (window.iDetailData) {
      result.method = 'iDetailData';
      const d = window.iDetailData;
      result.title = d.offerTitle || d.title || d.subject;
      if (d.price) result.prices.push(d.price);
      if (d.priceRange) result.prices.push(d.priceRange);
      result.raw = JSON.stringify(d).substring(0, 2000);
    }

    // METHOD 3: Parse from page using known selectors with fallbacks
    if (!result.title) {
      // Title - try many selectors
      const titleSelectors = [
        '.mod-detail-title h1',
        '.title-text',
        '.d-title h1',
        '[class*="detail-title"] h1',
        '.offer-title',
        '[data-spm*="title"]',
        'h1.title',
        '.detail-title'
      ];
      
      for (const sel of titleSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const text = el.textContent.trim();
          if (text.length > 15 && !text.includes('有限公司') && !text.includes('科技')) {
            result.title = text;
            result.method = 'CSS: ' + sel;
            break;
          }
        }
      }
    }

    // METHOD 4: Look for the title in meta tags
    if (!result.title) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const metaTitle = document.querySelector('meta[name="title"]');
      const dcTitle = document.querySelector('meta[name="dc.title"]');
      
      if (ogTitle) result.title = ogTitle.content;
      else if (metaTitle) result.title = metaTitle.content;
      else if (dcTitle) result.title = dcTitle.content;
      
      if (result.title) result.method = 'meta tag';
    }

    // METHOD 5: Check document.title but clean it
    if (!result.title) {
      const docTitle = document.title;
      // 1688 titles often have format: "Product Name - Category - 1688"
      const parts = docTitle.split('-');
      if (parts[0] && parts[0].trim().length > 10) {
        result.title = parts[0].trim();
        result.method = 'document.title';
      }
    }

    // PRICES - try multiple approaches
    const priceSelectors = [
      '.price-text',
      '.price-original-sku',
      '[class*="price-main"]',
      '[class*="price-num"]',
      '.discount-price',
      '.range-price',
      '[class*="sku-price"]'
    ];
    
    for (const sel of priceSelectors) {
      document.querySelectorAll(sel).forEach(el => {
        const text = el.textContent;
        const matches = text.match(/[\d.]+/g);
        if (matches) {
          matches.forEach(m => {
            const num = parseFloat(m);
            if (num > 0.1 && num < 100000 && !result.prices.includes(num)) {
              result.prices.push(num);
            }
          });
        }
      });
    }

    // Also try to find price in any element with price-like class
    document.querySelectorAll('[class*="price"]').forEach(el => {
      const text = el.textContent;
      if (text.includes('¥') || text.includes('￥')) {
        const matches = text.match(/[¥￥]\s*([\d.]+)/g);
        if (matches) {
          matches.forEach(m => {
            const num = parseFloat(m.replace(/[¥￥\s]/g, ''));
            if (num > 0.1 && num < 100000 && !result.prices.includes(num)) {
              result.prices.push(num);
            }
          });
        }
      }
    });

    // IMAGES - comprehensive extraction
    const imageSet = new Set();
    
    // Helper to get full size image URL
    const getFullUrl = (src) => {
      if (!src) return null;
      let url = src
        .replace(/_(\d+)x(\d+)\./g, '.')
        .replace(/\.(\d+)x(\d+)\./g, '.')
        .replace(/_[bsmtq]\./g, '.')
        .replace(/\.summ.*$/g, '')
        .replace(/\?.*$/, '');
      if (url.startsWith('//')) url = 'https:' + url;
      return url;
    };

    // Get all images from page
    document.querySelectorAll('img').forEach(img => {
      const sources = [img.src, img.dataset.src, img.dataset.lazySrc, img.dataset.original];
      sources.forEach(src => {
        if (src && src.includes('alicdn.com') && !src.includes('avatar') && !src.includes('logo')) {
          imageSet.add(getFullUrl(src));
        }
      });
    });

    result.images = Array.from(imageSet).filter(u => u && u.length > 50).slice(0, 20);

    // VARIANTS
    const variantSelectors = [
      '.sku-item',
      '.sku-prop-item',
      '[class*="sku-item"]',
      '[class*="prop-item"]',
      '.obj-sku .obj-content span'
    ];
    
    for (const sel of variantSelectors) {
      document.querySelectorAll(sel).forEach(el => {
        const text = el.textContent.trim();
        const img = el.querySelector('img');
        if (text && text.length < 80 && text.length > 0) {
          result.variants.push({
            name: text.replace(/[\n\r\t]+/g, ' ').trim(),
            image: img ? getFullUrl(img.src || img.dataset.src) : null
          });
        }
      });
    }

    // Dedupe variants
    const seen = new Set();
    result.variants = result.variants.filter(v => {
      if (seen.has(v.name)) return false;
      seen.add(v.name);
      return true;
    });

    return result;
  });

  console.log('\n📋 EXTRACTION RESULTS:');
  console.log(`   Method: ${extractedData.method}`);
  console.log(`   Title: ${extractedData.title}`);
  console.log(`   Prices: ${extractedData.prices.join(', ')}`);
  console.log(`   Images: ${extractedData.images.length} found`);
  console.log(`   Variants: ${extractedData.variants.length} found`);
  
  if (extractedData.variants.length > 0) {
    console.log('\n   Sample variants:');
    extractedData.variants.slice(0, 5).forEach(v => {
      console.log(`     - ${v.name} ${v.image ? '(has image)' : ''}`);
    });
  }

  if (extractedData.raw) {
    console.log('\n   Raw data sample:');
    console.log(`   ${extractedData.raw.substring(0, 500)}...`);
  }

  // Save full page HTML for analysis
  console.log('\n' + '='.repeat(70));
  console.log('💾 SAVING DEBUG DATA');
  console.log('='.repeat(70));

  const pageContent = await page.content();
  const fs = require('fs');
  fs.writeFileSync('/Users/tredouxwillemse/Desktop/jeffy-mvp/debug-1688-page.html', pageContent);
  console.log('Saved full HTML to debug-1688-page.html');

  // Get all window objects for analysis
  const allWindowData = await page.evaluate(() => {
    const interesting = {};
    for (const key of Object.keys(window)) {
      if (key.startsWith('__') && window[key] && typeof window[key] === 'object') {
        try {
          const str = JSON.stringify(window[key]);
          if (str.length > 100 && str.length < 500000) {
            interesting[key] = window[key];
          }
        } catch(e) {}
      }
    }
    return interesting;
  });

  fs.writeFileSync('/Users/tredouxwillemse/Desktop/jeffy-mvp/debug-1688-data.json', JSON.stringify(allWindowData, null, 2));
  console.log('Saved window data to debug-1688-data.json');

  console.log('\n✅ Deep dive complete. Check the debug files for full analysis.');
  console.log('\nPress Ctrl+C to close browser...');
  
  // Keep browser open for manual inspection
  await sleep(300000);
  await browser.close();
}

main().catch(console.error);
