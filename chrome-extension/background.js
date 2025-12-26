// Background Service Worker

// Track successful imports
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'IMPORT_SUCCESS') {
    updateStats();
  }
  return true;
});

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
});
