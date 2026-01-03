// Inspect 1688 product page structure
const http = require('http');

const code = `
(function() {
  const result = { 
    url: window.location.href,
    pageTitle: document.title,
    selectors: {},
    allPrices: [],
    allImages: [],
    variants: [],
    rawTextSamples: []
  };
  
  // 1. Find title elements
  const titleTests = [
    { name: 'h1', sel: 'h1' },
    { name: 'title-text', sel: '.title-text' },
    { name: 'mod-detail-title', sel: '.mod-detail-title' },
    { name: 'detail-title-any', sel: '[class*="detail-title"]' },
    { name: 'title-any', sel: '[class*="title"]' },
    { name: 'offerdetail-title', sel: '[class*="offerdetail"] [class*="title"]' }
  ];
  
  titleTests.forEach(t => {
    const el = document.querySelector(t.sel);
    if (el && el.innerText.trim().length > 10) {
      result.selectors[t.name] = {
        className: el.className,
        text: el.innerText.trim().substring(0, 200)
      };
    }
  });
  
  // 2. Find ALL price-like elements
  document.querySelectorAll('[class*="price"], [class*="Price"]').forEach((el, i) => {
    if (i < 15) {
      const text = el.innerText.trim();
      if (text && text.length < 100) {
        result.allPrices.push({
          className: el.className.substring(0, 80),
          text: text
        });
      }
    }
  });
  
  // 3. Extract prices from page text
  const bodyText = document.body.innerText;
  const priceMatches = bodyText.match(/¥\\s*[\\d.]+/g);
  if (priceMatches) {
    result.extractedPrices = [...new Set(priceMatches)].slice(0, 15);
  }
  
  // 4. Find variant/SKU elements
  const variantSelectors = [
    '[class*="sku-item"]',
    '[class*="prop-item"]', 
    '[class*="sku-wrapper"] li',
    '[class*="skuItem"]',
    '[class*="sku"] [class*="item"]'
  ];
  
  variantSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (i < 20) {
        const text = el.innerText.trim();
        const img = el.querySelector('img');
        if (text && text.length > 0 && text.length < 100) {
          result.variants.push({
            selector: sel,
            text: text,
            hasImage: !!img,
            imgSrc: img ? (img.src || img.dataset.src || '').substring(0, 100) : null
          });
        }
      }
    });
  });
  
  // 5. Find all product images
  document.querySelectorAll('img').forEach(img => {
    const src = img.src || img.dataset.src || img.dataset.lazySrc;
    if (src && src.includes('cbu01.alicdn.com') && !src.includes('avatar')) {
      result.allImages.push(src.substring(0, 120));
    }
  });
  result.allImages = [...new Set(result.allImages)].slice(0, 20);
  
  // 6. Look for embedded JSON data
  const scriptContent = [];
  document.querySelectorAll('script').forEach(script => {
    const text = script.textContent;
    if (text && text.length > 200 && text.length < 50000) {
      if (text.includes('offerDetail') || text.includes('skuModel') || 
          text.includes('priceModel') || text.includes('"title"')) {
        scriptContent.push({
          length: text.length,
          preview: text.substring(0, 500)
        });
      }
    }
  });
  result.embeddedScripts = scriptContent.slice(0, 3);
  
  // 7. Check for global data variables
  const globalVars = ['__INIT_DATA__', 'globalData', 'detailData', 'pageData', 'offerDetailData'];
  result.globalVars = {};
  globalVars.forEach(v => {
    if (typeof window[v] !== 'undefined') {
      result.globalVars[v] = 'EXISTS';
    }
  });
  
  // 8. Get sample of page text (to understand structure)
  const lines = bodyText.split('\\n').filter(l => l.trim().length > 10);
  result.rawTextSamples = lines.slice(0, 30);
  
  return result;
})()
`;

const postData = JSON.stringify({ code });

const options = {
  hostname: '127.0.0.1',
  port: 3688,
  path: '/execute',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log(JSON.stringify(result, null, 2));
    } catch(e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(postData);
req.end();
