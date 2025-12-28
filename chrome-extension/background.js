// Background Service Worker - Handles API calls (bypasses CORS)

const JEFFY_API_URL = 'https://jeffy.co.za/api/import/1688';

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'IMPORT_PRODUCT') {
    handleImport(message.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'IMPORT_SUCCESS') {
    updateStats();
    return true;
  }
  
  return false;
});

// Make API call from background (no CORS issues)
async function handleImport(productData) {
  try {
    console.log('Background: Sending to Jeffy API...', productData);
    
    const response = await fetch(JEFFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 100)}`);
    }

    const result = await response.json();
    
    if (result.success) {
      await updateStats();
    }
    
    return result;
    
  } catch (error) {
    console.error('Background: Import failed', error);
    return { success: false, error: error.message };
  }
}

async function updateStats() {
  const stats = await chrome.storage.local.get(['importCount', 'todayCount', 'lastImportDate']);
  const today = new Date().toDateString();
  
  const newStats = {
    importCount: (stats.importCount || 0) + 1,
    todayCount: stats.lastImportDate === today ? (stats.todayCount || 0) + 1 : 1,
    lastImportDate: today
  };
  
  await chrome.storage.local.set(newStats);
}

// Initialize stats on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    importCount: 0,
    todayCount: 0,
    lastImportDate: new Date().toDateString()
  });
  console.log('Jeffy 1688 Importer installed');
});
