// South African Import Cost Calculator
// Based on SARS import duties and regulations

interface ImportCostInput {
  productPriceCNY: number;      // Price in Chinese Yuan
  shippingCNY?: number;         // Shipping cost in Yuan (estimated if not provided)
  weightKg?: number;            // Product weight for shipping estimate
  category?: ProductCategory;   // For duty rate lookup
}

interface ImportCostBreakdown {
  // Base costs
  productCostZAR: number;
  shippingZAR: number;
  
  // Import fees
  customsDutyZAR: number;
  customsDutyRate: number;
  vatZAR: number;
  vatRate: number;
  customsClearanceFee: number;
  
  // Totals
  totalLandedCost: number;
  
  // Suggested retail
  suggestedRetailPrice: number;
  profitMargin: number;
  platformFee: number;  // Jeffy's cut
  partnerShare: number; // Delivery partner's cut
  netProfit: number;
}

type ProductCategory = 
  | 'electronics'
  | 'clothing'
  | 'sports'
  | 'toys'
  | 'home'
  | 'beauty'
  | 'accessories'
  | 'other';

// South African import duty rates by category (approximate)
// Source: SARS Tariff Book - simplified for common categories
const DUTY_RATES: Record<ProductCategory, number> = {
  electronics: 0.00,      // Most electronics are 0%
  clothing: 0.45,         // Clothing can be up to 45%
  sports: 0.20,           // Sporting goods ~20%
  toys: 0.20,             // Toys ~20%
  home: 0.25,             // Home goods ~25%
  beauty: 0.20,           // Cosmetics ~20%
  accessories: 0.30,      // Bags, watches etc ~30%
  other: 0.25,            // Default assumption
};

// Current exchange rate (should be fetched from API in production)
const CNY_TO_ZAR = 3.20;  // 1 CNY ≈ 3.20 ZAR (update regularly)

// SA VAT rate
const VAT_RATE = 0.15;

// Fixed costs
const CUSTOMS_CLEARANCE_FEE = 500;  // Typical broker fee in ZAR
const MIN_SHIPPING_ZAR = 150;       // Minimum shipping estimate

// Shipping estimate per kg (sea freight average)
const SHIPPING_PER_KG_ZAR = 45;

// Business margins
const TARGET_MARGIN = 0.50;         // 50% target margin on landed cost
const PLATFORM_FEE_RATE = 0.10;     // 10% Jeffy platform fee
const PARTNER_SHARE_RATE = 0.50;    // 50% of profit to delivery partner

export function calculateImportCosts(input: ImportCostInput): ImportCostBreakdown {
  const {
    productPriceCNY,
    shippingCNY,
    weightKg = 1,  // Default 1kg if not specified
    category = 'other',
  } = input;

  // Convert product price to ZAR
  const productCostZAR = Math.round(productPriceCNY * CNY_TO_ZAR);

  // Calculate shipping
  let shippingZAR: number;
  if (shippingCNY) {
    shippingZAR = Math.round(shippingCNY * CNY_TO_ZAR);
  } else {
    // Estimate based on weight
    shippingZAR = Math.max(MIN_SHIPPING_ZAR, Math.round(weightKg * SHIPPING_PER_KG_ZAR));
  }

  // Get duty rate for category
  const customsDutyRate = DUTY_RATES[category];

  // Calculate customs duty (on product + shipping value)
  const dutiableValue = productCostZAR + shippingZAR;
  const customsDutyZAR = Math.round(dutiableValue * customsDutyRate);

  // Calculate VAT (on product + shipping + duty)
  const vatableValue = dutiableValue + customsDutyZAR;
  const vatZAR = Math.round(vatableValue * VAT_RATE);

  // Total landed cost
  const totalLandedCost = productCostZAR + shippingZAR + customsDutyZAR + vatZAR + CUSTOMS_CLEARANCE_FEE;

  // Calculate suggested retail price with target margin
  const suggestedRetailPrice = Math.round(totalLandedCost * (1 + TARGET_MARGIN));
  
  // Round to nice price point (e.g., R1,999 instead of R1,847)
  const roundedRetailPrice = roundToNicePrice(suggestedRetailPrice);

  // Calculate actual margin with rounded price
  const grossProfit = roundedRetailPrice - totalLandedCost;
  const profitMargin = grossProfit / roundedRetailPrice;

  // Platform and partner shares
  const platformFee = Math.round(grossProfit * PLATFORM_FEE_RATE);
  const partnerShare = Math.round((grossProfit - platformFee) * PARTNER_SHARE_RATE);
  const netProfit = grossProfit - platformFee - partnerShare;

  return {
    productCostZAR,
    shippingZAR,
    customsDutyZAR,
    customsDutyRate,
    vatZAR,
    vatRate: VAT_RATE,
    customsClearanceFee: CUSTOMS_CLEARANCE_FEE,
    totalLandedCost,
    suggestedRetailPrice: roundedRetailPrice,
    profitMargin,
    platformFee,
    partnerShare,
    netProfit,
  };
}

function roundToNicePrice(price: number): number {
  if (price < 100) {
    return Math.ceil(price / 10) * 10 - 1;  // e.g., 99
  } else if (price < 1000) {
    return Math.ceil(price / 50) * 50 - 1;  // e.g., 499, 549
  } else if (price < 10000) {
    return Math.ceil(price / 100) * 100 - 1;  // e.g., 1999, 2499
  } else {
    return Math.ceil(price / 500) * 500 - 1;  // e.g., 14999, 19999
  }
}

// Helper to format ZAR currency
export function formatZAR(amount: number): string {
  return `R${amount.toLocaleString('en-ZA')}`;
}

// Detect category from product title (basic implementation)
export function detectCategory(title: string): ProductCategory {
  const lowerTitle = title.toLowerCase();
  
  if (/phone|laptop|tablet|computer|electronic|cable|charger|bluetooth|wireless|speaker|headphone|earphone|earbud/i.test(lowerTitle)) {
    return 'electronics';
  }
  if (/shirt|dress|pants|jacket|clothing|wear|fashion|hoodie|sweater/i.test(lowerTitle)) {
    return 'clothing';
  }
  if (/bow|arrow|sport|fitness|gym|bicycle|ball|racket|golf|fishing|camping|outdoor/i.test(lowerTitle)) {
    return 'sports';
  }
  if (/toy|game|puzzle|doll|lego|kid|children/i.test(lowerTitle)) {
    return 'toys';
  }
  if (/home|kitchen|furniture|decor|garden|tool|lamp|light/i.test(lowerTitle)) {
    return 'home';
  }
  if (/makeup|cosmetic|beauty|skincare|perfume|hair/i.test(lowerTitle)) {
    return 'beauty';
  }
  if (/bag|watch|jewelry|wallet|sunglasses|hat|belt|accessory/i.test(lowerTitle)) {
    return 'accessories';
  }
  
  return 'other';
}

// Get exchange rate (placeholder - should use real API)
export async function getExchangeRate(): Promise<number> {
  // TODO: Integrate with exchange rate API
  // For now, return static rate
  return CNY_TO_ZAR;
}






