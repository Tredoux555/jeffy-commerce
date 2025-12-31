// ============================================================================
// JEFFY COMMERCE: AliExpress Affiliate API Integration
// STATUS: FUTURE - See README.md for activation
// ============================================================================

import crypto from 'crypto';
import { TrendProduct, ProductSource } from '../types';

const getConfig = () => ({
  appKey: process.env.ALIEXPRESS_APP_KEY || '',
  appSecret: process.env.ALIEXPRESS_APP_SECRET || '',
  trackingId: process.env.ALIEXPRESS_TRACKING_ID || 'jeffy_trends',
  baseUrl: 'https://api-sg.aliexpress.com/sync',
});

function generateSignature(params: Record<string, string>, secret: string): string {
  const signString = Object.keys(params).sort().map(k => k + params[k]).join('');
  return crypto.createHmac('sha256', secret).update(signString).digest('hex').toUpperCase();
}

export interface AliExpressHotProduct {
  product_id: number;
  product_title: string;
  product_main_image_url: string;
  product_detail_url: string;
  target_sale_price: string;
  sale_price: string;
  first_level_category_name: string;
  second_level_category_name: string;
  lastest_volume: number;
  evaluate_rate: string;
  hot_product_commission_rate: string;
  ship_to_days: string;
}

export async function queryHotProducts(params: {
  keywords?: string;
  category_ids?: string;
  page_no?: number;
  page_size?: number;
  max_sale_price?: number;
}): Promise<AliExpressHotProduct[]> {
  const config = getConfig();
  if (!config.appKey || !config.appSecret) {
    console.warn('AliExpress API not configured');
    return [];
  }

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const businessParams = {
    keywords: params.keywords || '',
    category_ids: params.category_ids || '',
    page_no: String(params.page_no || 1),
    page_size: String(Math.min(params.page_size || 50, 50)),
    target_currency: 'USD',
    target_language: 'EN',
    ship_to_country: 'ZA',
    sort: 'LAST_VOLUME_DESC',
    tracking_id: config.trackingId,
    ...(params.max_sale_price && { max_sale_price: String(params.max_sale_price) }),
  };

  const systemParams: Record<string, string> = {
    app_key: config.appKey,
    method: 'aliexpress.affiliate.hotproduct.query',
    format: 'json',
    v: '2.0',
    sign_method: 'sha256',
    timestamp,
  };

  const allParams = { ...systemParams, ...businessParams };
  allParams.sign = generateSignature(allParams, config.appSecret);

  const url = `${config.baseUrl}?${Object.entries(allParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.resp_result?.result?.products?.product || [];
  } catch (error) {
    console.error('AliExpress API error:', error);
    return [];
  }
}

export function transformAliExpressProduct(product: AliExpressHotProduct): Partial<TrendProduct> {
  return {
    external_id: String(product.product_id),
    source: 'aliexpress' as ProductSource,
    name: product.product_title,
    source_url: product.product_detail_url,
    image_urls: [product.product_main_image_url],
    source_price_usd: parseFloat(product.target_sale_price || product.sale_price),
    category: product.first_level_category_name,
    subcategory: product.second_level_category_name,
    variants: [],
    moq: 1,
    mobile_friendly: true,
  };
}

export const ALIEXPRESS_CATEGORIES = {
  electronics: { id: '44', subcategories: { phone_accessories: '509', smart_gadgets: '5090301' } },
  beauty: { id: '66', subcategories: { skincare: '66030201', makeup: '66030101' } },
  home: { id: '15', subcategories: { kitchen: '150401', organization: '150403' } },
};

export const SA_PRIORITY_CATEGORIES = [
  'electronics.phone_accessories',
  'electronics.smart_gadgets',
  'beauty.skincare',
  'home.kitchen',
];

export async function scanTrendingProducts(options: {
  categories?: string[];
  maxPages?: number;
  maxPriceUsd?: number;
} = {}): Promise<{ products: Partial<TrendProduct>[]; total_found: number; errors: string[] }> {
  const { categories = SA_PRIORITY_CATEGORIES, maxPages = 3, maxPriceUsd = 30 } = options;
  const results = { products: [] as Partial<TrendProduct>[], total_found: 0, errors: [] as string[] };
  const seenIds = new Set<string>();

  for (const categoryPath of categories) {
    const [mainCat, subCat] = categoryPath.split('.');
    const catConfig = ALIEXPRESS_CATEGORIES[mainCat as keyof typeof ALIEXPRESS_CATEGORIES];
    if (!catConfig) continue;

    const categoryId = subCat ? catConfig.subcategories[subCat as keyof typeof catConfig.subcategories] : catConfig.id;

    for (let page = 1; page <= maxPages; page++) {
      try {
        const products = await queryHotProducts({ category_ids: categoryId, page_no: page, max_sale_price: maxPriceUsd });
        for (const p of products) {
          const id = String(p.product_id);
          if (!seenIds.has(id)) {
            seenIds.add(id);
            results.products.push(transformAliExpressProduct(p));
            results.total_found++;
          }
        }
        await new Promise(r => setTimeout(r, 100));
      } catch (e) {
        results.errors.push(`${categoryPath} page ${page}: ${e}`);
      }
    }
  }

  return results;
}

export const aliexpressService = {
  queryHotProducts,
  scanTrendingProducts,
  transformAliExpressProduct,
  CATEGORIES: ALIEXPRESS_CATEGORIES,
  SA_PRIORITY_CATEGORIES,
};

export default aliexpressService;
