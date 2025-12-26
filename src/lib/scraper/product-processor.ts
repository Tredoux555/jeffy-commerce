// 1688 Scraper - Product Processor
// Converts raw 1688 data to Jeffy-ready format

import type { Raw1688Product, JeffyProductImport, JeffyVariant, PricingConfig } from './types';
import { calculateProductPricing, DEFAULT_PRICING_CONFIG } from './price-calculator';
import { generateSku, generateSlug } from './url-parser';

// Process a raw 1688 product into Jeffy format
export function processProduct(
  raw: Raw1688Product,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): JeffyProductImport {
  const pricing = calculateProductPricing(raw, config);
  
  // Use translated name or fallback to original
  const productName = raw.titleTranslated || raw.title;
  
  // Generate description
  const description = generateDescription(raw);
  const shortDescription = generateShortDescription(raw);
  
  // Process variants
  const variants = processVariants(raw, config);
  
  // Calculate stock (sum of variant stocks or default)
  const totalStock = variants.length > 0
    ? variants.reduce((sum, v) => sum + v.stock, 0)
    : 100; // Default stock
  
  return {
    name: cleanProductName(productName),
    slug: generateSlug(productName),
    description,
    shortDescription,
    sellingPrice: pricing.basePrice.sellingPrice,
    comparePrice: pricing.basePrice.comparePrice,
    costPrice: pricing.basePrice.costZAR,
    sku: generateSku(raw.productId),
    stock: totalStock,
    moq: raw.moq || 1,
    images: processImages(raw.images),
    mainImage: raw.mainImage || raw.images[0] || '',
    variants,
    source: {
      platform: '1688',
      productId: raw.productId,
      url: raw.url,
      sellerName: raw.seller.name,
      sellerId: raw.seller.id,
      importedAt: new Date().toISOString(),
    },
    tags: extractTags(raw),
  };
}

// Clean up product name
function cleanProductName(name: string): string {
  return name
    .replace(/【.*?】/g, '') // Remove Chinese brackets
    .replace(/\[.*?\]/g, '') // Remove square brackets
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .slice(0, 100); // Limit length
}

// Generate full description
function generateDescription(raw: Raw1688Product): string {
  const parts: string[] = [];
  
  // Add translated description if available
  if (raw.descriptionTranslated) {
    parts.push(raw.descriptionTranslated);
  }
  
  // Add specifications
  const specs = raw.specificationsTranslated || raw.specifications;
  if (Object.keys(specs).length > 0) {
    parts.push('\n\n**Specifications:**');
    for (const [key, value] of Object.entries(specs)) {
      parts.push(`- ${key}: ${value}`);
    }
  }
  
  // Add shipping info
  if (raw.shipping?.weight) {
    parts.push(`\n**Weight:** ${raw.shipping.weight}kg`);
  }
  
  return parts.join('\n');
}

// Generate short description (for product cards)
function generateShortDescription(raw: Raw1688Product): string {
  const desc = raw.descriptionTranslated || raw.title;
  return desc.slice(0, 150).trim() + (desc.length > 150 ? '...' : '');
}

// Process variants into Jeffy format
function processVariants(
  raw: Raw1688Product,
  config: PricingConfig
): JeffyVariant[] {
  const variants: JeffyVariant[] = [];
  const pricing = calculateProductPricing(raw, config);
  
  // If no variants, return empty array
  if (raw.variants.length === 0) {
    return [];
  }
  
  // For single variant type (e.g., just colors OR just sizes)
  if (raw.variants.length === 1) {
    const variant = raw.variants[0];
    for (const option of variant.options) {
      const variantKey = `${variant.name}:${option.value}`;
      const variantPricing = pricing.variantPrices.get(variantKey) || pricing.basePrice;
      
      variants.push({
        name: `${cleanProductName(raw.titleTranslated || raw.title)} - ${option.valueTranslated || option.value}`,
        sku: `${generateSku(raw.productId)}-${option.id.slice(-3)}`,
        price: variantPricing.sellingPrice,
        comparePrice: variantPricing.comparePrice,
        stock: option.stock || 50,
        options: {
          [variant.nameTranslated || variant.name]: option.valueTranslated || option.value,
        },
        image: option.image,
      });
    }
  }
  
  // For multiple variant types (e.g., color AND size), create combinations
  if (raw.variants.length >= 2) {
    const [first, second] = raw.variants;
    
    for (const opt1 of first.options) {
      for (const opt2 of second.options) {
        const variantKey = `${first.name}:${opt1.value}`;
        const variantPricing = pricing.variantPrices.get(variantKey) || pricing.basePrice;
        
        variants.push({
          name: `${cleanProductName(raw.titleTranslated || raw.title)} - ${opt1.valueTranslated || opt1.value} / ${opt2.valueTranslated || opt2.value}`,
          sku: `${generateSku(raw.productId)}-${opt1.id.slice(-2)}${opt2.id.slice(-2)}`,
          price: variantPricing.sellingPrice,
          comparePrice: variantPricing.comparePrice,
          stock: Math.min(opt1.stock || 50, opt2.stock || 50),
          options: {
            [first.nameTranslated || first.name]: opt1.valueTranslated || opt1.value,
            [second.nameTranslated || second.name]: opt2.valueTranslated || opt2.value,
          },
          image: opt1.image || opt2.image,
        });
      }
    }
  }
  
  return variants;
}

// Process image URLs (ensure HTTPS, valid format)
function processImages(images: string[]): string[] {
  return images
    .filter(url => url && url.length > 0)
    .map(url => {
      // Ensure HTTPS
      if (url.startsWith('//')) return `https:${url}`;
      if (url.startsWith('http://')) return url.replace('http://', 'https://');
      return url;
    })
    .slice(0, 10); // Limit to 10 images
}

// Extract tags from product data
function extractTags(raw: Raw1688Product): string[] {
  const tags: string[] = [];
  
  // Add seller location as tag
  if (raw.seller.location) {
    tags.push(`Made in ${raw.seller.location}`);
  }
  
  // Add MOQ tag
  if (raw.moq && raw.moq > 1) {
    tags.push(`MOQ: ${raw.moq}`);
  }
  
  // Add "Imported" tag
  tags.push('Imported from China');
  
  return tags;
}

// Validate processed product
export function validateProduct(product: JeffyProductImport): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!product.name || product.name.length < 3) {
    errors.push('Product name is too short');
  }
  
  if (!product.sellingPrice || product.sellingPrice < 100) {
    errors.push('Selling price is invalid');
  }
  
  if (!product.mainImage) {
    errors.push('Main image is required');
  }
  
  if (!product.source?.productId) {
    errors.push('Source product ID is missing');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
