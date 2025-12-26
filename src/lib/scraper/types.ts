// 1688 Scraper - Core Types & Interfaces

// Raw product data from 1688
export interface Raw1688Product {
  productId: string;
  url: string;
  title: string; // Chinese
  titleTranslated?: string; // English
  price: {
    min: number;
    max: number;
    currency: 'CNY';
  };
  moq: number; // Minimum Order Quantity
  images: string[];
  mainImage: string;
  videos?: string[];
  description: string; // Chinese HTML
  descriptionTranslated?: string;
  specifications: Record<string, string>; // Chinese key-value pairs
  specificationsTranslated?: Record<string, string>;
  variants: Raw1688Variant[];
  seller: {
    name: string;
    id: string;
    rating?: number;
    yearsOnPlatform?: number;
    location?: string;
  };
  shipping: {
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    estimatedDays?: number;
  };
  scrapedAt: string;
}

export interface Raw1688Variant {
  id: string;
  name: string; // Chinese
  nameTranslated?: string;
  type: 'color' | 'size' | 'style' | 'other';
  options: Array<{
    id: string;
    value: string; // Chinese
    valueTranslated?: string;
    image?: string;
    priceAdjustment?: number;
    stock?: number;
  }>;
}

// Processed product ready for Jeffy
export interface JeffyProductImport {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sellingPrice: number;
  comparePrice: number | null;
  costPrice: number;
  sku: string;
  stock: number;
  moq: number;
  images: string[];
  mainImage: string;
  variants: JeffyVariant[];
  source: {
    platform: '1688';
    productId: string;
    url: string;
    sellerName: string;
    sellerId: string;
    importedAt: string;
  };
  category?: string;
  tags?: string[];
}

export interface JeffyVariant {
  name: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  options: Record<string, string>;
  image?: string;
}

export interface ImportJob {
  id: string;
  status: 'pending' | 'scraping' | 'translating' | 'processing' | 'ready' | 'imported' | 'failed';
  url: string;
  rawData?: Raw1688Product;
  processedData?: JeffyProductImport;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricingConfig {
  exchangeRate: number;
  shippingPerKg: number;
  platformFee: number;
  profitMargin: number;
  roundTo: number;
}

export interface AgentOrder {
  id: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    url: string;
    title: string;
    variant: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }>;
  totalCNY: number;
  customerName: string;
  shippingAddress: string;
  status: 'pending' | 'ordered' | 'shipped' | 'received';
  createdAt: string;
  agentNotes?: string;
}
