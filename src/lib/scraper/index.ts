// 1688 Scraper - Main Export
// All scraper utilities in one import

// Types
export type {
  Raw1688Product,
  Raw1688Variant,
  JeffyProductImport,
  JeffyVariant,
  ImportJob,
  PricingConfig,
  AgentOrder,
} from './types';

// URL Parser
export {
  parse1688Url,
  build1688Url,
  build1688MobileUrl,
  build1688ApiUrl,
  isValidProductId,
  extractMultiple1688Urls,
  generateSku,
  generateSlug,
} from './url-parser';

// Translation
export {
  translateText,
  translateProduct,
  batchTranslate,
} from './translation';
export type { TranslationProvider } from './translation';

// Price Calculator
export {
  calculateSellingPrice,
  calculateProductPricing,
  quickPriceEstimate,
  formatZAR,
  formatCNY,
  calculateBulkPricing,
  fetchExchangeRate,
  getUpdatedPricingConfig,
  DEFAULT_PRICING_CONFIG,
} from './price-calculator';

// Product Processor
export {
  processProduct,
  validateProduct,
} from './product-processor';

// Mock Scraper (for testing)
export {
  mockScrapeProduct,
  mockScrapeWithDelay,
} from './mock-scraper';
