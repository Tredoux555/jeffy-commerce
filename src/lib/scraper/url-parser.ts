// 1688 URL Parser - Extract product IDs from various URL formats

/**
 * Supported 1688 URL formats:
 * - https://detail.1688.com/offer/123456789.html
 * - https://m.1688.com/offer/123456789.html
 * - https://detail.1688.com/offer/123456789.html?params=value
 * - https://s.1688.com/selloffer/offer_search.htm?offerId=123456789
 * - Short links that redirect to product pages
 */

export function parse1688Url(url: string): { productId: string; isValid: boolean; error?: string } {
  try {
    // Clean the URL
    const cleanUrl = url.trim();
    
    // Check if it's a 1688 URL
    if (!cleanUrl.includes('1688.com')) {
      return { productId: '', isValid: false, error: 'Not a 1688.com URL' };
    }

    // Pattern 1: /offer/123456789.html
    const offerMatch = cleanUrl.match(/\/offer\/(\d+)\.html/);
    if (offerMatch) {
      return { productId: offerMatch[1], isValid: true };
    }

    // Pattern 2: offerId=123456789
    const offerIdMatch = cleanUrl.match(/offerId=(\d+)/);
    if (offerIdMatch) {
      return { productId: offerIdMatch[1], isValid: true };
    }

    // Pattern 3: Just digits (user pasted product ID directly)
    if (/^\d{10,15}$/.test(cleanUrl)) {
      return { productId: cleanUrl, isValid: true };
    }

    return { productId: '', isValid: false, error: 'Could not extract product ID from URL' };
  } catch (error) {
    return { productId: '', isValid: false, error: 'Invalid URL format' };
  }
}

// Build canonical 1688 URL from product ID
export function build1688Url(productId: string): string {
  return `https://detail.1688.com/offer/${productId}.html`;
}

// Build mobile URL (sometimes has different data)
export function build1688MobileUrl(productId: string): string {
  return `https://m.1688.com/offer/${productId}.html`;
}

// Build API URL (for official API access)
export function build1688ApiUrl(productId: string, apiKey?: string): string {
  const baseUrl = 'https://gw.open.1688.com/openapi';
  // This would need actual API endpoint - placeholder
  return `${baseUrl}/param2/1/com.alibaba.product/alibaba.product.get/${apiKey || 'APP_KEY'}?productId=${productId}`;
}

// Validate product ID format
export function isValidProductId(productId: string): boolean {
  // 1688 product IDs are typically 10-15 digits
  return /^\d{10,15}$/.test(productId);
}

// Extract multiple URLs from text (for bulk import)
export function extractMultiple1688Urls(text: string): Array<{ url: string; productId: string; isValid: boolean }> {
  const results: Array<{ url: string; productId: string; isValid: boolean }> = [];
  
  // Find all URLs in text
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
  const urls = text.match(urlRegex) || [];
  
  // Also check for bare product IDs
  const idRegex = /\b(\d{10,15})\b/g;
  const ids = text.match(idRegex) || [];
  
  // Process URLs
  for (const url of urls) {
    if (url.includes('1688.com')) {
      const parsed = parse1688Url(url);
      results.push({ url, productId: parsed.productId, isValid: parsed.isValid });
    }
  }
  
  // Process bare IDs (only if not already found)
  const foundIds = new Set(results.map(r => r.productId));
  for (const id of ids) {
    if (!foundIds.has(id)) {
      results.push({ url: build1688Url(id), productId: id, isValid: true });
    }
  }
  
  return results;
}

// Generate SKU from 1688 product ID
export function generateSku(productId: string, prefix: string = 'JF'): string {
  // Take last 6 digits of product ID
  const shortId = productId.slice(-6);
  return `${prefix}-${shortId}`;
}

// Generate slug from product name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .slice(0, 50) // Limit length
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}
