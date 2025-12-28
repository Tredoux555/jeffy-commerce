// 1688 Scraper - Price Calculator
// Converts CNY to ZAR with shipping, fees, and markup

import type { PricingConfig, Raw1688Product, JeffyProductImport } from './types';

// Default pricing configuration
export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  exchangeRate: 2.65, // 1 CNY = 2.65 ZAR (update regularly)
  shippingPerKg: 150, // R150 per kg from China
  platformFee: 5, // 5% platform fee
  profitMargin: 40, // 40% profit margin
  roundTo: 100, // Round to nearest R1 (100 cents)
};

// Calculate final selling price from CNY cost
export function calculateSellingPrice(
  cnyPrice: number,
  weightKg: number = 0.5,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): {
  costZAR: number;
  shippingZAR: number;
  platformFeeZAR: number;
  profitZAR: number;
  sellingPrice: number;
  comparePrice: number;
  breakdown: string;
} {
  // Step 1: Convert CNY to ZAR
  const costZAR = cnyPrice * config.exchangeRate;
  
  // Step 2: Add shipping cost
  const shippingZAR = weightKg * config.shippingPerKg;
  
  // Step 3: Calculate subtotal
  const subtotal = costZAR + shippingZAR;
  
  // Step 4: Add platform fee
  const platformFeeZAR = subtotal * (config.platformFee / 100);
  
  // Step 5: Calculate base cost
  const baseCost = subtotal + platformFeeZAR;
  
  // Step 6: Add profit margin
  const profitZAR = baseCost * (config.profitMargin / 100);
  const rawPrice = baseCost + profitZAR;
  
  // Step 7: Round to configured amount
  const sellingPrice = Math.ceil(rawPrice / config.roundTo) * config.roundTo;
  
  // Step 8: Calculate compare price (original + higher margin for "discount" display)
  const comparePrice = Math.ceil((rawPrice * 1.25) / config.roundTo) * config.roundTo;
  
  // Create breakdown string
  const breakdown = `
Cost: ¥${cnyPrice.toFixed(2)} × ${config.exchangeRate} = R${costZAR.toFixed(2)}
Shipping: ${weightKg}kg × R${config.shippingPerKg} = R${shippingZAR.toFixed(2)}
Platform Fee: ${config.platformFee}% = R${platformFeeZAR.toFixed(2)}
Profit: ${config.profitMargin}% = R${profitZAR.toFixed(2)}
Final: R${(sellingPrice / 100).toFixed(2)}
  `.trim();
  
  return {
    costZAR: Math.round(costZAR * 100), // Convert to cents
    shippingZAR: Math.round(shippingZAR * 100),
    platformFeeZAR: Math.round(platformFeeZAR * 100),
    profitZAR: Math.round(profitZAR * 100),
    sellingPrice: Math.round(sellingPrice * 100), // In cents
    comparePrice: Math.round(comparePrice * 100),
    breakdown,
  };
}

// Calculate price for entire product with variants
export function calculateProductPricing(
  product: Raw1688Product,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): {
  basePrice: ReturnType<typeof calculateSellingPrice>;
  variantPrices: Map<string, ReturnType<typeof calculateSellingPrice>>;
} {
  // Estimate weight from product or default
  const weightKg = product.shipping?.weight || 0.5;
  
  // Calculate base price (using minimum price)
  const basePrice = calculateSellingPrice(product.price.min, weightKg, config);
  
  // Calculate variant prices if they have adjustments
  const variantPrices = new Map<string, ReturnType<typeof calculateSellingPrice>>();
  
  for (const variant of product.variants) {
    for (const option of variant.options) {
      const adjustedPrice = product.price.min + (option.priceAdjustment || 0);
      const variantKey = `${variant.name}:${option.value}`;
      variantPrices.set(variantKey, calculateSellingPrice(adjustedPrice, weightKg, config));
    }
  }
  
  return { basePrice, variantPrices };
}

// Quick price estimate (for display in import queue)
export function quickPriceEstimate(cnyPrice: number): number {
  const { sellingPrice } = calculateSellingPrice(cnyPrice);
  return sellingPrice;
}

// Format price for display
export function formatZAR(cents: number): string {
  return `R${(cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
}

export function formatCNY(yuan: number): string {
  return `¥${yuan.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
}

// Calculate bulk pricing (price breaks)
export function calculateBulkPricing(
  unitPrice: number,
  quantity: number,
  moq: number
): {
  unitPrice: number;
  totalPrice: number;
  savings: number;
  pricePerUnit: string;
} {
  // Apply quantity discounts
  let discount = 0;
  if (quantity >= moq * 10) discount = 0.15; // 15% off for 10x MOQ
  else if (quantity >= moq * 5) discount = 0.10; // 10% off for 5x MOQ
  else if (quantity >= moq * 2) discount = 0.05; // 5% off for 2x MOQ
  
  const discountedUnitPrice = Math.round(unitPrice * (1 - discount));
  const totalPrice = discountedUnitPrice * quantity;
  const savings = (unitPrice - discountedUnitPrice) * quantity;
  
  return {
    unitPrice: discountedUnitPrice,
    totalPrice,
    savings,
    pricePerUnit: formatZAR(discountedUnitPrice),
  };
}

// Fetch current exchange rate (placeholder - would use real API)
export async function fetchExchangeRate(): Promise<number> {
  // TODO: Integrate with exchange rate API
  // For now, return default
  return DEFAULT_PRICING_CONFIG.exchangeRate;
}

// Update config with current exchange rate
export async function getUpdatedPricingConfig(): Promise<PricingConfig> {
  const currentRate = await fetchExchangeRate();
  return {
    ...DEFAULT_PRICING_CONFIG,
    exchangeRate: currentRate,
  };
}
