// Deep inspection for description, specs, and other useful data
const http = require('http');

const code = `
(function() {
  const result = {
    url: window.location.href,
    title: document.title,
    description: null,
    specifications: [],
    attributes: {},
    detailImages: [],
    weight: null,
    material: null,
    features: []
  };
  
  // 1. DESCRIPTION - Look in multiple places
  const descSelectors = [
    '.detail-desc',
    '.mod-detail-desc',
    '[class*="description"]',
    '[class*="detail-content"]',
    '.offer-attr-list',
    '.detail-attributes'
  ];
  
  for (const sel of descSelectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim().length > 50) {
      result.description = {
        selector: sel,
        text: el.innerText.trim().substring(0, 1000)
      };
      break;
    }
  }
  
  // 2. SPECIFICATIONS TABLE - Usually in a table or list
  const specSelectors = [
    '.detail-attributes table',
    '.offer-attr-list',
    '[class*="attr"] table',
    '.mod-detail-attributes',
    '[class*="attributes"]',
    '[class*="parameter"]'
  ];
  
  for (const sel of specSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      result.specifications.push({
        selector: sel,
        html: el.outerHTML.substring(0, 500),
        text: el.innerText.substring(0, 800)
      });
    }
  }
  
  // 3. Look for specific attributes in the page text
  const bodyText = document.body.innerText;
  
  // Weight
  const weightMatch = bodyText.match(/(\\d+\\.?\\d*)\\s*(kg|g|克|千克)/i);
  if (weightMatch) {
    result.weight = weightMatch[0];
  }
  
  // Material
  const materialMatch = bodyText.match(/材质[：:]*\\s*([^\\n]{2,30})/);
  if (materialMatch) {
    result.material = materialMatch[1].trim();
  }
  
  // 4. Find any attribute rows (Key: Value pairs)
  document.querySelectorAll('tr, [class*="attr-item"], [class*="prop-item"]').forEach(row => {
    const text = row.innerText.trim();
    if (text.includes(':') || text.includes('：')) {
      const parts = text.split(/[：:]/);
      if (parts.length === 2 && parts[0].length < 30 && parts[1].length < 100) {
        result.attributes[parts[0].trim()] = parts[1].trim();
      }
    }
  });
  
  // 5. Detail/description images (usually in the lower section)
  document.querySelectorAll('[class*="detail"] img, [class*="desc"] img').forEach(img => {
    const src = img.src || img.dataset.src;
    if (src && src.includes('cbu01.alicdn.com') && !result.detailImages.includes(src)) {
      result.detailImages.push(src.substring(0, 150));
    }
  });
  result.detailImages = result.detailImages.slice(0, 10);
  
  // 6. Look for feature/selling points
  document.querySelectorAll('[class*="feature"], [class*="selling-point"], [class*="highlight"]').forEach(el => {
    const text = el.innerText.trim();
    if (text.length > 10 && text.length < 200) {
      result.features.push(text);
    }
  });
  
  // 7. Raw text samples from key areas
  result.rawSamples = [];
  ['[class*="detail"]', '[class*="attr"]', '[class*="param"]'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      result.rawSamples.push({
        selector: sel,
        text: el.innerText.substring(0, 500)
      });
    }
  });
  
  return result;
})()
`;

const postData = JSON.stringify({ code });

const req = http.request({
  hostname: '127.0.0.1',
  port: 3688,
  path: '/execute',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.stringify(JSON.parse(data), null, 2)));
});

req.write(postData);
req.end();
