// Jeffy 1688 Importer - Content Script
// Runs on 1688.com product pages

(function() {
  'use strict';
  
  // Check if we're on a product detail page
  function isProductPage() {
    return window.location.href.includes('detail.1688.com') || 
           window.location.href.includes('/offer/');
  }

  // Create the floating import button
  function createImportButton() {
    if (document.getElementById('jeffy-import-btn')) return;

    const container = document.createElement('div');
    container.id = 'jeffy-import-container';
    container.innerHTML = `
      <div id="jeffy-import-btn" class="jeffy-btn">
        <span class="jeffy-icon">🚀</span>
        <span class="jeffy-text">Send to Jeffy</span>
      </div>
      <div id="jeffy-status" class="jeffy-status hidden"></div>
    `;
    document.body.appendChild(container);

    document.getElementById('jeffy-import-btn').addEventListener('click', handleImport);
  }

  // Extract product data from the page
  function scrapeProductData() {
    // Extract product ID from URL
    const urlMatch = window.location.href.match(/offer\/(\d+)\.html/) || 
                     window.location.href.match(/offerId=(\d+)/);
    const sourceProductId = urlMatch ? urlMatch[1] : Date.now().toString();

    const data = {
      source: '1688',
      sourceProductId: sourceProductId,
      sourceUrl: window.location.href,
      scrapedAt: new Date().toISOString(),
      title: '',
      titleOriginal: '',
      costPriceCNY: 0,
      moq: null,
      images: [],
      mainImage: '',
      variants: [],
      specifications: {},
      seller: {
        name: '',
        rating: null,
        location: ''
      },
      description: ''
    };

    try {
      // Title - get the actual product title from the h1
      // The title is in nested font tags inside h1
      const titleContainer = document.querySelector('#productTitle h1') ||
                             document.querySelector('[data-module="od_title"] h1') ||
                             document.querySelector('.module-od-title h1');
      if (titleContainer) {
        // Get innerText to get just the visible text
        data.titleOriginal = titleContainer.innerText.trim();
        data.title = data.titleOriginal;
        console.log('JEFFY: Found title:', data.title);
      } else {
        console.log('JEFFY: Title not found');
      }

      // Price - look for the price value in mainPrice section
      const priceContainer = document.querySelector('#mainPrice');
      if (priceContainer) {
        // Find all font elements and get the one with just a number
        const fonts = priceContainer.querySelectorAll('font');
        for (const font of fonts) {
          const text = font.innerText.trim();
          if (/^\d+(\.\d+)?$/.test(text)) {
            data.costPriceCNY = parseFloat(text);
            console.log('JEFFY: Found price:', data.costPriceCNY);
            break;
          }
        }
      }
      
      // Fallback: look for any price-like number near ¥ symbol
      if (data.costPriceCNY === 0) {
        const priceText = document.body.innerText.match(/¥\s*(\d+(?:\.\d+)?)/);
        if (priceText) {
          data.costPriceCNY = parseFloat(priceText[1]);
          console.log('JEFFY: Found price via regex:', data.costPriceCNY);
        }
      }

      // MOQ (Minimum Order Quantity)
      const moqMatch = document.body.innerText.match(/Minimum order of (\d+)/i) ||
                       document.body.innerText.match(/(\d+)\s*件起批/);
      if (moqMatch) {
        data.moq = parseInt(moqMatch[1]);
        console.log('JEFFY: Found MOQ:', data.moq);
      }

      // Images - get all product images from gallery
      const imageEls = document.querySelectorAll('img.preview-img, img.ant-image-img, .od-gallery-turn-item-wrapper img');
      const imageSet = new Set();
      imageEls.forEach(img => {
        let src = img.src || img.dataset.src;
        if (src && src.includes('alicdn.com') && !src.includes('avatar')) {
          // Clean up URL
          src = src.split('?')[0];
          imageSet.add(src);
        }
      });
      data.images = Array.from(imageSet).slice(0, 10);
      data.mainImage = data.images[0] || '';
      console.log('JEFFY: Found images:', data.images.length, data.images);

      // Seller info
      const sellerEl = document.querySelector('.shop-company-name h1') ||
                       document.querySelector('[class*="company-name"] h1') ||
                       document.querySelector('.winport-title h1');
      if (sellerEl) {
        data.seller.name = sellerEl.innerText.trim();
        console.log('JEFFY: Found seller:', data.seller.name);
      }

      // Description - from specifications or product details
      const specText = [];
      document.querySelectorAll('.detail-attr td, [class*="attribute"] span').forEach(el => {
        const text = el.innerText.trim();
        if (text && text.length < 100) specText.push(text);
      });
      data.description = specText.join(' ').slice(0, 2000);

      console.log('JEFFY: Final scraped data:', JSON.stringify(data, null, 2));
      const descEl = document.querySelector('[class*="detail-desc"], [class*="description"]');
      if (descEl) {
        data.description = descEl.textContent.trim().slice(0, 2000);
      }

    } catch (e) {
      console.error('Jeffy Scraper Error:', e);
    }

    return data;
  }

  // Show status message
  function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('jeffy-status');
    statusEl.textContent = message;
    statusEl.className = `jeffy-status ${type}`;
    statusEl.classList.remove('hidden');
    
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        statusEl.classList.add('hidden');
      }, 5000);
    }
  }

  // Handle import button click
  async function handleImport() {
    const btn = document.getElementById('jeffy-import-btn');
    btn.classList.add('loading');
    showStatus('Scraping product data...', 'info');

    try {
      // Scrape the product
      const productData = scrapeProductData();
      
      if (!productData.titleOriginal && !productData.title) {
        throw new Error('Could not find product title');
      }

      if (productData.images.length === 0) {
        showStatus('Warning: No images found', 'warning');
      }

      showStatus('Sending to Jeffy...', 'info');

      // Send directly to Jeffy API
      const response = await fetch('https://jeffy.co.za/api/import/1688', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (result.success) {
        showStatus(`✅ Product imported! ID: ${result.productId}`, 'success');
        
        // Open Jeffy admin in new tab
        if (result.editUrl) {
          window.open(result.editUrl, '_blank');
        }
      } else {
        throw new Error(result.error || 'Import failed');
      }

    } catch (error) {
      console.error('Jeffy Import Error:', error);
      showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
      btn.classList.remove('loading');
    }
  }

  // Initialize
  function init() {
    if (!isProductPage()) return;
    
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createImportButton);
    } else {
      createImportButton();
    }
  }

  init();
})();
