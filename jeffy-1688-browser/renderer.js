// Jeffy 1688 Research Browser - Renderer Process
// WITH REMOTE CONTROL API SUPPORT

// State
let apiKey = '';
let capturedProducts = [];
let currentAnalysis = null;

// JEFFY API CONFIG
let JEFFY_API_URL = localStorage.getItem('jeffyApiUrl') || 'https://jeffy.co.za';

// DOM Elements
const webview = document.getElementById('webview');
const searchInput = document.getElementById('searchInput');
const translateBtn = document.getElementById('translateBtn');
const translationResult = document.getElementById('translationResult');
const primaryTerm = document.getElementById('primaryTerm');
const altTerms = document.getElementById('altTerms');
const searchTips = document.getElementById('searchTips');
const productList = document.getElementById('productList');
const analyzeBtn = document.getElementById('analyzeBtn');
const analysisPanel = document.getElementById('analysisPanel');
const analysisContent = document.getElementById('analysisContent');
const analysisLoading = document.getElementById('analysisLoading');
const urlBar = document.getElementById('urlBar');
const loginDot = document.getElementById('loginDot');
const loginStatus = document.getElementById('loginStatus');
const pageInfo = document.getElementById('pageInfo');
const settingsModal = document.getElementById('settingsModal');
const apiKeyInput = document.getElementById('apiKeyInput');

// ============================================
// REMOTE CONTROL HANDLERS
// ============================================

// Track webview ready state
let webviewReady = false;

function setupRemoteControl() {
  // Track when webview is ready
  webview.addEventListener('dom-ready', () => {
    webviewReady = true;
    console.log('Webview DOM ready');
  });
  
  webview.addEventListener('did-start-loading', () => {
    webviewReady = false;
  });
  
  webview.addEventListener('did-stop-loading', () => {
    webviewReady = true;
    console.log('Webview finished loading');
  });

  // Handle navigate command
  window.electronAPI.onNavigate((url) => {
    console.log('Remote: Navigate to', url);
    webviewReady = false;
    webview.loadURL(url);
  });

  // Handle execute JS command - with better error handling
  window.electronAPI.onExecuteJs(async (code) => {
    console.log('Remote: Execute JS, webviewReady:', webviewReady);
    
    // Wait for webview to be ready if not
    if (!webviewReady) {
      console.log('Waiting for webview...');
      await new Promise(resolve => {
        const checkReady = setInterval(() => {
          if (webviewReady) {
            clearInterval(checkReady);
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkReady);
          resolve();
        }, 10000);
      });
    }
    
    try {
      // Execute code directly - caller should handle error catching
      const result = await webview.executeJavaScript(code);
      console.log('Execute result:', typeof result);
      window.electronAPI.sendExecuteResult(result);
    } catch (error) {
      console.error('Execute error:', error);
      window.electronAPI.sendExecuteResult({ error: error.message });
    }
  });

  // Handle capture command
  window.electronAPI.onCapture(async () => {
    console.log('Remote: Capture product');
    const result = await captureCurrentProductRemote();
    window.electronAPI.sendCaptureResult(result);
  });

  // Handle get products command
  window.electronAPI.onGetProducts(() => {
    console.log('Remote: Get products');
    window.electronAPI.sendProductsList(capturedProducts);
  });

  // Handle send to jeffy command
  window.electronAPI.onSendToJeffy(async (index) => {
    console.log('Remote: Send to Jeffy', index);
    const result = await sendToJeffyRemote(index);
    window.electronAPI.sendToJeffyResult(result);
  });
}

// Remote capture (returns result instead of alert)
async function captureCurrentProductRemote() {
  try {
    const productData = await webview.executeJavaScript(`
      (function() {
        const url = window.location.href;
        
        if (!url.includes('detail.1688.com') && !url.includes('/offer/')) {
          return { 
            success: false,
            error: 'Not on a product page'
          };
        }
        
        const productIdMatch = url.match(/offer\\/(\\d+)\\.html/) || url.match(/offerId=(\\d+)/);
        const productId = productIdMatch ? productIdMatch[1] : null;
        
        let title = '';
        const titleSels = ['.title-text', '.d-title', 'h1'];
        for (const sel of titleSels) {
          const el = document.querySelector(sel);
          if (el && el.textContent.trim().length > 5) {
            title = el.textContent.trim();
            break;
          }
        }
        
        let priceMin = 0, priceMax = 0;
        const priceEl = document.querySelector('.price-text, .price');
        if (priceEl) {
          const nums = priceEl.textContent.match(/[\\d.]+/g);
          if (nums) {
            priceMin = parseFloat(nums[0]);
            priceMax = nums[1] ? parseFloat(nums[1]) : priceMin;
          }
        }
        
        let images = [];
        document.querySelectorAll('[class*="gallery"] img').forEach(img => {
          if (img.src && !img.src.includes('placeholder')) {
            images.push(img.src.replace(/\\.\\d+x\\d+\\./, '.'));
          }
        });
        
        let moq = '1';
        const moqEl = document.querySelector('[class*="moq"]');
        if (moqEl) {
          const m = moqEl.textContent.match(/\\d+/);
          if (m) moq = m[0];
        }
        
        let sales = '0';
        const salesEl = document.querySelector('[class*="sale"], [class*="成交"]');
        if (salesEl) {
          const s = salesEl.textContent.match(/\\d+/);
          if (s) sales = s[0];
        }
        
        return {
          success: true,
          data: {
            productId, url, title,
            priceMin, priceMax,
            mainImage: images[0] || '',
            images: images.slice(0, 10),
            moq, sales,
            capturedAt: new Date().toISOString()
          }
        };
      })()
    `);
    
    if (productData.success) {
      addCapturedProduct(productData.data);
      return { success: true, product: productData.data };
    }
    return productData;
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Remote send to Jeffy (returns result instead of alert)
async function sendToJeffyRemote(index) {
  const product = capturedProducts[index];
  if (!product) return { success: false, error: 'Product not found' };
  
  try {
    let translatedTitle = product.title;
    
    if (apiKey && product.title) {
      try {
        const resp = await window.translationAPI.translateProduct(product, apiKey);
        if (resp) translatedTitle = resp.title || product.title;
      } catch (e) {
        console.log('Translation failed:', e);
      }
    }
    
    const jeffyProduct = {
      source: '1688',
      sourceProductId: product.productId,
      sourceUrl: product.url,
      titleOriginal: product.title,
      title: translatedTitle,
      costPriceCNY: product.priceMin || 0,
      images: product.images || [],
      mainImage: product.mainImage,
      moq: parseInt(product.moq) || 1,
      capturedAt: product.capturedAt
    };
    
    const response = await fetch(`${JEFFY_API_URL}/api/import/1688`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jeffyProduct)
    });
    
    const result = await response.json();
    
    if (result.success) {
      capturedProducts[index].sentToJeffy = true;
      renderProductList();
      return { success: true, sku: result.sku, sellingPrice: result.sellingPrice };
    } else {
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
  apiKey = await window.electronAPI.getApiKey();
  if (apiKey) {
    apiKeyInput.value = apiKey;
  }
  
  const jeffyUrlInput = document.getElementById('jeffyUrlInput');
  if (jeffyUrlInput) {
    jeffyUrlInput.value = JEFFY_API_URL;
  }
  
  setupWebviewEvents();
  setupUIEvents();
  setupRemoteControl();
  
  console.log('🎮 Remote control enabled on port 3688');
}

// Webview Events
function setupWebviewEvents() {
  webview.addEventListener('did-start-loading', () => {
    pageInfo.textContent = 'Loading...';
  });

  webview.addEventListener('did-stop-loading', () => {
    pageInfo.textContent = 'Ready';
    urlBar.value = webview.getURL();
    checkLoginStatus();
  });

  webview.addEventListener('did-navigate', (e) => {
    urlBar.value = e.url;
  });

  webview.addEventListener('did-navigate-in-page', (e) => {
    urlBar.value = e.url;
  });

  setInterval(checkLoginStatus, 5000);
}

async function checkLoginStatus() {
  try {
    const result = await webview.executeJavaScript(`
      (function() {
        const userInfo = document.querySelector('.user-name, .member-nick, [class*="login-info"], [class*="user-info"]');
        if (userInfo && userInfo.textContent.trim()) {
          return { loggedIn: true, username: userInfo.textContent.trim().substring(0, 20) };
        }
        return { loggedIn: false };
      })()
    `);
    
    if (result.loggedIn) {
      loginDot.classList.add('online');
      loginStatus.textContent = 'Logged in: ' + result.username;
    } else {
      loginDot.classList.remove('online');
      loginStatus.textContent = 'Not logged in - click to login';
    }
  } catch (e) {}
}

// UI Events
function setupUIEvents() {
  document.getElementById('backBtn').addEventListener('click', () => webview.goBack());
  document.getElementById('forwardBtn').addEventListener('click', () => webview.goForward());
  document.getElementById('refreshBtn').addEventListener('click', () => webview.reload());
  document.getElementById('homeBtn').addEventListener('click', () => webview.loadURL('https://www.1688.com'));

  urlBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      let url = urlBar.value;
      if (!url.startsWith('http')) url = 'https://' + url;
      webview.loadURL(url);
    }
  });

  document.getElementById('captureBtn').addEventListener('click', captureCurrentProduct);
  translateBtn.addEventListener('click', translateAndSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') translateAndSearch();
  });

  primaryTerm.addEventListener('click', () => {
    const term = primaryTerm.textContent;
    if (term && term !== 'Loading...') search1688(term);
  });

  analyzeBtn.addEventListener('click', analyzeProducts);
  document.getElementById('settingsBtn').addEventListener('click', () => {
    settingsModal.classList.add('visible');
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettings();
  });
}

// ============================================
// SEARCH & TRANSLATE
// ============================================

async function translateAndSearch() {
  const term = searchInput.value.trim();
  if (!term) { alert('Please enter a product name'); return; }
  if (!apiKey) { alert('Set API key in Settings'); settingsModal.classList.add('visible'); return; }

  translateBtn.disabled = true;
  translateBtn.textContent = '🔄 Translating...';
  translationResult.classList.add('visible');
  primaryTerm.textContent = 'Loading...';
  altTerms.innerHTML = '';
  searchTips.textContent = '';

  try {
    const result = await window.translationAPI.translateToChinese(term, apiKey);
    primaryTerm.textContent = result.primary;
    altTerms.innerHTML = result.alternatives.map(alt => 
      `<span class="alt-term" onclick="search1688('${alt}')">${alt}</span>`
    ).join('');
    if (result.tips) searchTips.textContent = '💡 ' + result.tips;
    search1688(result.primary);
    await window.electronAPI.saveSearch({ english: term, chinese: result.primary, alternatives: result.alternatives });
  } catch (error) {
    alert('Translation failed: ' + error.message);
    primaryTerm.textContent = 'Error';
  } finally {
    translateBtn.disabled = false;
    translateBtn.textContent = '🔍 Translate & Search';
  }
}

function search1688(term) {
  webview.loadURL(`https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(term)}`);
}

function quickSearch(term) { search1688(term); }

// ============================================
// PRODUCT CAPTURE
// ============================================

async function captureCurrentProduct() {
  pageInfo.textContent = 'Capturing...';
  const result = await captureCurrentProductRemote();
  if (result.success) {
    pageInfo.textContent = '✓ Captured!';
  } else {
    alert(result.error || 'Capture failed');
    pageInfo.textContent = 'Ready';
  }
  setTimeout(() => { pageInfo.textContent = 'Ready'; }, 2000);
}

function addCapturedProduct(product) {
  if (capturedProducts.some(p => p.productId === product.productId)) {
    return;
  }
  capturedProducts.push(product);
  renderProductList();
  analyzeBtn.disabled = capturedProducts.length < 2;
}

function renderProductList() {
  if (capturedProducts.length === 0) {
    productList.innerHTML = '<div style="text-align: center; padding: 20px; color: #555;">No products captured yet.</div>';
    return;
  }
  
  productList.innerHTML = capturedProducts.map((p, i) => `
    <div class="product-card">
      ${p.mainImage ? `<img src="${p.mainImage}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` : ''}
      <div class="title">${(p.title || 'Product').substring(0, 50)}</div>
      <div class="meta">
        <span class="price">¥${p.priceMin || 0}</span>
        <span class="sales">${p.sales || 0} sold</span>
      </div>
      <div style="margin-top: 8px; display: flex; gap: 8px;">
        <button style="flex: 1; padding: 6px; font-size: 11px;" onclick="viewProduct(${i})">View</button>
        <button style="flex: 1; padding: 6px; font-size: 11px;" onclick="sendToJeffy(${i})">📤 Jeffy</button>
        <button class="secondary" style="padding: 6px; font-size: 11px;" onclick="removeProduct(${i})">✕</button>
      </div>
    </div>
  `).join('');
}

function viewProduct(index) {
  const product = capturedProducts[index];
  if (product && product.url) webview.loadURL(product.url);
}

function removeProduct(index) {
  capturedProducts.splice(index, 1);
  renderProductList();
  analyzeBtn.disabled = capturedProducts.length < 2;
}

// ============================================
// SEND TO JEFFY
// ============================================

async function sendToJeffy(index) {
  pageInfo.textContent = 'Sending...';
  const result = await sendToJeffyRemote(index);
  if (result.success) {
    alert(`✓ Sent to Jeffy!\nSKU: ${result.sku}\nPrice: R${result.sellingPrice}`);
  } else {
    alert(`Failed: ${result.error}`);
  }
  pageInfo.textContent = 'Ready';
}

async function sendAllToJeffy() {
  for (let i = 0; i < capturedProducts.length; i++) {
    if (!capturedProducts[i].sentToJeffy) {
      await sendToJeffy(i);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

// ============================================
// ANALYSIS
// ============================================

async function analyzeProducts() {
  if (capturedProducts.length < 2) { alert('Capture at least 2 products'); return; }
  if (!apiKey) { alert('Set API key in Settings'); settingsModal.classList.add('visible'); return; }
  
  analysisPanel.classList.add('visible');
  analysisLoading.style.display = 'flex';
  analysisContent.innerHTML = '';
  
  try {
    const analysis = await window.translationAPI.analyzeProducts(capturedProducts, apiKey);
    currentAnalysis = analysis;
    renderAnalysis(analysis);
  } catch (error) {
    analysisContent.innerHTML = `<div style="color: #f44336;">Analysis failed: ${error.message}</div>`;
  } finally {
    analysisLoading.style.display = 'none';
  }
}

function renderAnalysis(analysis) {
  if (analysis.error) {
    analysisContent.innerHTML = `<div style="color: #f44336;">${analysis.error}</div>`;
    return;
  }
  
  let html = '';
  if (analysis.winner) {
    const winner = capturedProducts[analysis.winner.product_index];
    html += `<div class="winner-card">
      <h4>🏆 Winner</h4>
      <p>${winner?.title?.substring(0, 60) || 'Product'}...</p>
      <p style="color: #ccc;">${analysis.winner.reasoning}</p>
      <button onclick="sendToJeffy(${analysis.winner.product_index})">📤 Send to Jeffy</button>
    </div>`;
  }
  
  if (analysis.ranking) {
    html += '<div style="margin-top: 16px;"><h4>Rankings</h4>';
    analysis.ranking.forEach(item => {
      const p = capturedProducts[item.product_index];
      html += `<div style="background: #1e1e1e; padding: 12px; margin: 8px 0; border-radius: 6px;">
        #${item.rank} - ${p?.title?.substring(0, 40) || 'Product'}... (${item.score}/100)
      </div>`;
    });
    html += '</div>';
  }
  
  html += '<button class="secondary" style="margin-top: 16px;" onclick="sendAllToJeffy()">📤 Send All</button>';
  analysisContent.innerHTML = html;
}

// ============================================
// SETTINGS
// ============================================

function closeSettings() { settingsModal.classList.remove('visible'); }

async function saveSettings() {
  const newApiKey = apiKeyInput.value.trim();
  const newJeffyUrl = document.getElementById('jeffyUrlInput')?.value?.trim();
  
  if (newApiKey) {
    await window.electronAPI.storeApiKey(newApiKey);
    apiKey = newApiKey;
  }
  if (newJeffyUrl) {
    localStorage.setItem('jeffyApiUrl', newJeffyUrl);
    JEFFY_API_URL = newJeffyUrl;
  }
  
  alert('Settings saved!');
  closeSettings();
}

// Globals
window.quickSearch = quickSearch;
window.search1688 = search1688;
window.viewProduct = viewProduct;
window.removeProduct = removeProduct;
window.sendToJeffy = sendToJeffy;
window.sendAllToJeffy = sendAllToJeffy;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;

init();
