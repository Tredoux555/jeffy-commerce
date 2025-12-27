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
      // Title - from #productTitle h1 font
      const titleEl = document.querySelector('#productTitle .title-content h1 font') ||
                      document.querySelector('#productTitle h1 font') ||
                      document.querySelector('#productTitle h1') ||
                      document.querySelector('.title-content h1');
      if (titleEl) {
        data.titleOriginal = titleEl.textContent.trim();
        data.title = data.titleOriginal;
      }

      // Price - from #mainPrice .price-info.currency font
      const priceEl = document.querySelector('#mainPrice .price-info.currency font') ||
                      document.querySelector('#mainPrice .price-info font') ||
                      document.querySelector('.price-component .price-info font') ||
                      document.querySelector('.price-comp font');
      if (priceEl) {
        const priceText = priceEl.textContent.replace(/[^\d.]/g, '');
        data.costPriceCNY = parseFloat(priceText) || 0;
      }

      // Fallback price - try other selectors
      if (data.costPriceCNY === 0) {
        const fallbackPrice = document.querySelector('[class*="price"] font') ||
                              document.querySelector('.price-text');
        if (fallbackPrice) {
          const priceText = fallbackPrice.textContent.replace(/[^\d.]/g, '');
          data.costPriceCNY = parseFloat(priceText) || 0;
        }
      }

      // MOQ (Minimum Order Quantity)
      const moqEl = document.querySelector('[class*="moq"]') ||
                    document.querySelector('[class*="起批"]');
      if (moqEl) {
        const moqMatch = moqEl.textContent.match(/\d+/);
        if (moqMatch) data.moq = parseInt(moqMatch[0]);
      }

      // Images - from gallery thumbnails and preview images
      const imageEls = document.querySelectorAll('.od-gallery-list img.preview-img, .od-gallery-list img.ant-image-img, #gallery img.preview-img, .od-gallery-turn-item-wrapper img, .module-od-picture-gallery img');
      const imageSet = new Set();
      imageEls.forEach(img => {
        let src = img.src || img.dataset.src || img.getAttribute('data-lazy-src');
        if (src && src.includes('alicdn.com')) {
          // Clean up URL - remove size suffixes to get full resolution
          src = src.split('?')[0]
                   .replace(/_\d+x\d+\.[a-z]+$/i, '.jpg')
                   .replace(/\.jpg_.*$/i, '.jpg')
                   .replace(/\.(jpg|png|webp)_.*/i, '.$1');
          imageSet.add(src);
        }
      });
      data.images = Array.from(imageSet).slice(0, 10);
      data.mainImage = data.images[0] || '';

      // Variants/SKUs
      const skuItems = document.querySelectorAll('[class*="sku-item"], [class*="prop-item"], .sku-wrapper [class*="item"]');
      const variants = [];
      skuItems.forEach(item => {
        const name = item.textContent.trim();
        const img = item.querySelector('img');
        if (name && name.length < 100) {
          variants.push({
            name: name,
            image: img ? img.src : null
          });
        }
      });
      data.variants = variants.slice(0, 20);

      // Specifications/Attributes
      const specRows = document.querySelectorAll('[class*="attr"] tr, [class*="attributes"] li, .detail-attr tr');
      specRows.forEach(row => {
        const cells = row.querySelectorAll('td, span');
        if (cells.length >= 2) {
          const key = cells[0].textContent.trim();
          const value = cells[1].textContent.trim();
          if (key && value && key.length < 50) {
            data.specifications[key] = value;
          }
        }
      });

      // Seller info - from shop-company-name
      const supplierNameEl = document.querySelector('.shop-company-name h1') ||
                              document.querySelector('[class*="company-name"]') ||
                              document.querySelector('[class*="shop-name"]');
      if (supplierNameEl) {
        data.seller.name = supplierNameEl.textContent.trim();
      }

      const ratingEl = document.querySelector('[class*="score"]') ||
                       document.querySelector('[class*="rating"]');
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
