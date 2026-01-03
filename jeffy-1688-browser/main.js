const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const Store = require('electron-store');
const http = require('http');

const store = new Store();

let mainWindow;
let currentWebview = null;

// ============================================
// API SERVER FOR REMOTE CONTROL (port 3688)
// ============================================
const API_PORT = 3688;

function startAPIServer() {
  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Parse body for POST requests
    let body = '';
    if (req.method === 'POST') {
      body = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
      });
    }

    const url = req.url;
    
    try {
      // GET /status - Check if browser is running
      if (url === '/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'running', 
          hasWindow: !!mainWindow,
          currentUrl: mainWindow ? 'active' : null
        }));
        return;
      }

      // POST /navigate - Navigate to URL
      if (url === '/navigate' && req.method === 'POST') {
        const { url: targetUrl } = JSON.parse(body);
        mainWindow.webContents.send('navigate', targetUrl);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, navigatedTo: targetUrl }));
        return;
      }

      // POST /execute - Execute JavaScript in webview
      if (url === '/execute' && req.method === 'POST') {
        const { code } = JSON.parse(body);
        mainWindow.webContents.send('execute-js', code);
        
        // Wait for result
        const result = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve({ timeout: true }), 10000);
          ipcMain.once('execute-js-result', (event, result) => {
            clearTimeout(timeout);
            resolve(result);
          });
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, result }));
        return;
      }

      // POST /click - Click on element by selector or text
      if (url === '/click' && req.method === 'POST') {
        const { selector, text, index } = JSON.parse(body);
        
        let clickCode;
        if (selector) {
          clickCode = `
            (function() {
              const elements = document.querySelectorAll('${selector}');
              const el = elements[${index || 0}];
              if (el) {
                el.click();
                return { success: true, clicked: '${selector}' };
              }
              return { success: false, error: 'Element not found: ${selector}' };
            })()
          `;
        } else if (text) {
          clickCode = `
            (function() {
              const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
              let node;
              while (node = walker.nextNode()) {
                if (node.textContent.includes('${text}')) {
                  const el = node.parentElement;
                  if (el) {
                    el.click();
                    return { success: true, clicked: '${text}' };
                  }
                }
              }
              // Try finding by innerText
              const all = document.querySelectorAll('*');
              for (const el of all) {
                if (el.innerText && el.innerText.trim() === '${text}') {
                  el.click();
                  return { success: true, clicked: '${text}' };
                }
              }
              return { success: false, error: 'Text not found: ${text}' };
            })()
          `;
        }
        
        mainWindow.webContents.send('execute-js', clickCode);
        
        const result = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve({ timeout: true }), 5000);
          ipcMain.once('execute-js-result', (event, result) => {
            clearTimeout(timeout);
            resolve(result);
          });
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      }

      // GET /page-content - Get page text content
      if (url === '/page-content' && req.method === 'GET') {
        const contentCode = `document.body.innerText.substring(0, 10000)`;
        mainWindow.webContents.send('execute-js', contentCode);
        
        const result = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve('Timeout'), 5000);
          ipcMain.once('execute-js-result', (event, result) => {
            clearTimeout(timeout);
            resolve(result);
          });
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ content: result }));
        return;
      }

      // GET /current-url - Get current URL
      if (url === '/current-url' && req.method === 'GET') {
        const urlCode = `window.location.href`;
        mainWindow.webContents.send('execute-js', urlCode);
        
        const result = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve('Unknown'), 5000);
          ipcMain.once('execute-js-result', (event, result) => {
            clearTimeout(timeout);
            resolve(result);
          });
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ url: result }));
        return;
      }

      // POST /capture - Capture current product
      if (url === '/capture' && req.method === 'POST') {
        mainWindow.webContents.send('capture-product');
        
        const result = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve({ timeout: true }), 10000);
          ipcMain.once('capture-result', (event, result) => {
            clearTimeout(timeout);
            resolve(result);
          });
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      }

      // GET /products - Get captured products
      if (url === '/products' && req.method === 'GET') {
        mainWindow.webContents.send('get-products');
        
        const result = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve([]), 5000);
          ipcMain.once('products-list', (event, result) => {
            clearTimeout(timeout);
            resolve(result);
          });
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ products: result }));
        return;
      }

      // POST /send-to-jeffy - Send product to Jeffy
      if (url === '/send-to-jeffy' && req.method === 'POST') {
        const { index } = JSON.parse(body);
        mainWindow.webContents.send('send-to-jeffy', index);
        
        const result = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve({ timeout: true }), 30000);
          ipcMain.once('send-to-jeffy-result', (event, result) => {
            clearTimeout(timeout);
            resolve(result);
          });
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      }

      // POST /scroll - Scroll page
      if (url === '/scroll' && req.method === 'POST') {
        const { direction, amount } = JSON.parse(body);
        const scrollCode = direction === 'down' 
          ? `window.scrollBy(0, ${amount || 500}); 'scrolled down'`
          : `window.scrollBy(0, -${amount || 500}); 'scrolled up'`;
        
        mainWindow.webContents.send('execute-js', scrollCode);
        
        const result = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve('done'), 2000);
          ipcMain.once('execute-js-result', (event, result) => {
            clearTimeout(timeout);
            resolve(result);
          });
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
      }

      // 404 for unknown endpoints
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found', endpoint: url }));
      
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });

  server.listen(API_PORT, '127.0.0.1', () => {
    console.log(`🎮 Jeffy 1688 API Server running on http://127.0.0.1:${API_PORT}`);
    console.log('Endpoints: /status, /navigate, /execute, /click, /page-content, /capture, /products, /send-to-jeffy');
  });
}

// ============================================
// ELECTRON WINDOW
// ============================================

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  // Set up session to persist cookies for 1688
  const ses = session.defaultSession;
  
  // Allow all cookies from 1688
  ses.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src * 'unsafe-inline' 'unsafe-eval' data: blob:"]
      }
    });
  });

  createWindow();
  startAPIServer();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for communication between renderer and main process

// Store API key securely
ipcMain.handle('store-api-key', async (event, apiKey) => {
  store.set('claudeApiKey', apiKey);
  return { success: true };
});

// Get stored API key
ipcMain.handle('get-api-key', async () => {
  return store.get('claudeApiKey', '');
});

// Store search history
ipcMain.handle('save-search', async (event, searchData) => {
  const searches = store.get('searchHistory', []);
  searches.unshift({
    ...searchData,
    timestamp: new Date().toISOString()
  });
  // Keep only last 100 searches
  store.set('searchHistory', searches.slice(0, 100));
  return { success: true };
});

// Get search history
ipcMain.handle('get-search-history', async () => {
  return store.get('searchHistory', []);
});

// Store product analysis
ipcMain.handle('save-analysis', async (event, analysisData) => {
  const analyses = store.get('productAnalyses', []);
  analyses.unshift({
    ...analysisData,
    timestamp: new Date().toISOString()
  });
  store.set('productAnalyses', analyses.slice(0, 50));
  return { success: true };
});

// Get product analyses
ipcMain.handle('get-analyses', async () => {
  return store.get('productAnalyses', []);
});
