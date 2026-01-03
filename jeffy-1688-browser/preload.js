const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  storeApiKey: (apiKey) => ipcRenderer.invoke('store-api-key', apiKey),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  saveSearch: (searchData) => ipcRenderer.invoke('save-search', searchData),
  getSearchHistory: () => ipcRenderer.invoke('get-search-history'),
  saveAnalysis: (analysisData) => ipcRenderer.invoke('save-analysis', analysisData),
  getAnalyses: () => ipcRenderer.invoke('get-analyses'),
  
  // Remote control listeners
  onNavigate: (callback) => ipcRenderer.on('navigate', (event, url) => callback(url)),
  onExecuteJs: (callback) => ipcRenderer.on('execute-js', (event, code) => callback(code)),
  onCapture: (callback) => ipcRenderer.on('capture-product', () => callback()),
  onGetProducts: (callback) => ipcRenderer.on('get-products', () => callback()),
  onSendToJeffy: (callback) => ipcRenderer.on('send-to-jeffy', (event, index) => callback(index)),
  
  // Send results back to main
  sendExecuteResult: (result) => ipcRenderer.send('execute-js-result', result),
  sendCaptureResult: (result) => ipcRenderer.send('capture-result', result),
  sendProductsList: (products) => ipcRenderer.send('products-list', products),
  sendToJeffyResult: (result) => ipcRenderer.send('send-to-jeffy-result', result)
});

// Expose translation helper
contextBridge.exposeInMainWorld('translationAPI', {
  // Translate search term to Chinese
  translateToChinese: async (englishTerm, apiKey) => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are a 1688.com product sourcing expert. Convert this English product search term into the BEST Chinese search terms for finding suppliers on 1688.com.

English product: "${englishTerm}"

Respond in this exact JSON format:
{
  "primary": "最佳中文搜索词",
  "alternatives": ["备选搜索词1", "备选搜索词2", "备选搜索词3"],
  "tips": "Brief tip about what to look for",
  "category_keywords": ["relevant", "category", "keywords in Chinese"]
}

Rules:
1. Use terms Chinese suppliers actually use, not literal translations
2. Include material specifications if relevant
3. Include common variations buyers search for
4. Consider trending terms on 1688

Respond ONLY with the JSON.`
        }]
      })
    });
    
    const data = await response.json();
    if (data.content && data.content[0]) {
      try {
        return JSON.parse(data.content[0].text);
      } catch {
        return { primary: data.content[0].text, alternatives: [], tips: '', category_keywords: [] };
      }
    }
    throw new Error('Translation failed');
  },

  // Translate a captured product (Chinese to English)
  translateProduct: async (product, apiKey) => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `Translate this Chinese product listing to English for a South African e-commerce store.

Chinese Title: ${product.title || 'Unknown'}
Chinese Description: ${product.description || 'No description'}

Create an APPEALING English product listing. Respond in this exact JSON format:
{
  "title": "Catchy English product title (max 80 chars)",
  "description": "Detailed English product description with features and benefits (200-400 words)",
  "shortDescription": "One-liner for cards (max 100 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "Suggested category",
  "highlights": ["Key feature 1", "Key feature 2", "Key feature 3"]
}

Make it sound natural and appealing for South African shoppers. Don't mention 1688 or China.
Respond ONLY with the JSON.`
        }]
      })
    });
    
    const data = await response.json();
    if (data.content && data.content[0]) {
      try {
        return JSON.parse(data.content[0].text);
      } catch {
        return { title: product.title, description: product.description };
      }
    }
    throw new Error('Product translation failed');
  },

  // Analyze products with Claude
  analyzeProducts: async (productsData, apiKey) => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `You are a product sourcing expert analyzing 1688.com listings. Analyze these products and recommend the BEST option for resale in South Africa.

Product Data:
${JSON.stringify(productsData, null, 2)}

Respond in this exact JSON format:
{
  "ranking": [
    {
      "rank": 1,
      "product_index": 0,
      "score": 95,
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1"],
      "verdict": "Brief verdict"
    }
  ],
  "winner": {
    "product_index": 0,
    "reasoning": "Detailed reasoning for why this is the best choice",
    "negotiation_tips": ["tip 1", "tip 2"],
    "estimated_margin": "XX-XX%",
    "red_flags": ["any concerns to watch for"]
  },
  "market_insights": "Brief market insights for SA market"
}

Consider:
1. Sales volume - higher is better
2. Price point vs quality
3. Store rating and transactions
4. MOQ (lower is better for testing)
5. Image quality (indicates professionalism)
6. SA market demand potential

Respond ONLY with the JSON.`
        }]
      })
    });
    
    const data = await response.json();
    if (data.content && data.content[0]) {
      try {
        return JSON.parse(data.content[0].text);
      } catch {
        return { error: 'Failed to parse analysis', raw: data.content[0].text };
      }
    }
    throw new Error('Analysis failed');
  }
});
