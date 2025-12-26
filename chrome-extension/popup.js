// Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Load stats from storage
  const stats = await chrome.storage.local.get(['importCount', 'todayCount', 'lastImportDate']);
  
  // Reset today count if it's a new day
  const today = new Date().toDateString();
  if (stats.lastImportDate !== today) {
    await chrome.storage.local.set({ todayCount: 0, lastImportDate: today });
    stats.todayCount = 0;
  }
  
  document.getElementById('importCount').textContent = stats.importCount || 0;
  document.getElementById('todayCount').textContent = stats.todayCount || 0;
  
  // Check API connection
  checkConnection();
});

async function checkConnection() {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  
  try {
    const response = await fetch('https://jeffy-commerce.vercel.app/api/import/1688');
    const data = await response.json();
    
    if (data.success) {
      statusDot.classList.remove('offline');
      statusText.textContent = 'Connected to Jeffy';
    } else {
      throw new Error('API not ready');
    }
  } catch (e) {
    statusDot.classList.add('offline');
    statusText.textContent = 'Connection failed';
  }
}
