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
      // Title (Chinese)
      const titleEl = document.querySelector('h1.title-text') || 
                      document.querySelector('.d-title') ||
                      document.querySelector('[class*="title"]');
      if (titleEl) {
        data.titleOriginal = titleEl.textContent.trim();
        data.title = data.titleOriginal; // Will be translated by API
      }

      // Price
      const priceEl = document.querySelector('.price-text') ||
                      document.querySelector('[class*="price"] [class*="num"]') ||
                      document.querySelector('.d-price');
      if (priceEl) {
        const priceText = priceEl.textContent.replace(/[^\d.]/g, '');
        data.costPriceCNY = parseFloat(priceText) || 0;
      }

      // Price range - take minimum
      const priceRangeEls = document.querySelectorAll('[class*="price-range"] [class*="price"]');
      if (priceRangeEls.length >= 1 && data.costPriceCNY === 0) {
        const priceText = priceRangeEls[0].textContent.replace(/[^\d.]/g, '');
        data.costPriceCNY = parseFloat(priceText) || 0;
      }

      // MOQ (Minimum Order Quantity)
      const moqEl = document.querySelector('[class*="moq"]') ||
                    document.querySelector('[class*="起批"]');
      if (moqEl) {
        const moqMatch = moqEl.textContent.match(/\d+/);
        if (moqMatch) data.moq = parseInt(moqMatch[0]);
      }

      // Images - Get all product images
      const imageEls = document.querySelectorAll('[class*="main-image"] img, [class*="detail-gallery"] img, .tab-content img, .vertical-img img');
      const imageSet = new Set();
      imageEls.forEach(img => {
        let src = img.src || img.dataset.src || img.getAttribute('data-lazy-src');
        if (src) {
          // Get high-res version
          src = src.replace(/_.+\.jpg/, '.jpg')
                   .replace(/_\d+x\d+/, '')
                   .replace(/\.jpg.*/, '.jpg')
                   .split('?')[0];
          if (src.includes('1688') || src.includes('alicdn')) {
            imageSet.add(src);
          }
        }
      });
      data.images = Array.from(imageSet).slice(0, 10);
      data.mainImage = data.images[0] || '';

      // Variants/SKUs
      const skuItems = document.querySelectorAll('[class*="sku-item"], [class*="prop-item"]');
      const variants = [];
      skuItems.forEach(item => {
        const name = item.textContent.trim();
        const img = item.querySelector('img');
        if (name) {
          variants.push({
            name: name,
            image: img ? img.src : null
          });
        }
      });
      data.variants = variants;

      // Specifications/Attributes
      const specRows = document.querySelectorAll('[class*="attr"] tr, [class*="attributes"] li');
      specRows.forEach(row => {
        const cells = row.querySelectorAll('td, span');
        if (cells.length >= 2) {
          const key = cells[0].textContent.trim();
          const value = cells[1].textContent.trim();
          if (key && value) {
            data.specifications[key] = value;
          }
        }
      });

      // Seller info
      const supplierNameEl = document.querySelector('[class*="company-name"], [class*="shop-name"]');
      if (supplierNameEl) {
        data.seller.name = supplierNameEl.textContent.trim();
      }

      const ratingEl = document.querySelector('[class*="score"], [class*="rating"]');
      if (ratingEl) {
        const ratingMatch = ratingEl.textContent.match(/[\d.]+/);
        if (ratingMatch) data.seller.rating = parseFloat(ratingMatch[0]);
      }

      // Description (from detail section)
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
