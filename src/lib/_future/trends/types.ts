// ============================================================================
// JEFFY COMMERCE: Viral Product Prediction Engine
// Type Definitions
// ============================================================================

// ============================================================================
// DATABASE TYPES
// ============================================================================

export type ProductSource = 'aliexpress' | 'tiktok' | '1688' | 'temu' | 'amazon';
export type ProductStatus = 'tracking' | 'approved' | 'rejected' | 'sourcing' | 'listed' | 'archived';
export type PriceTier = 'optimal' | 'acceptable' | 'risky';
export type AIRecommendation = 'approve' | 'reject' | 'monitor' | 'needs_review';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface TrendProduct {
  id: string;
  external_id: string;
  source: ProductSource;
  name: string;
  name_zh?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  source_url?: string;
  image_urls: string[];
  
  // Pricing
  source_price_cny?: number;
  source_price_usd?: number;
  estimated_landed_cost_zar?: number;
  retail_price_zar?: number;
  margin_percentage?: number;
  
  // Product attributes
  variants: ProductVariant[];
  moq: number;
  weight_grams?: number;
  shipping_category?: string;
  
  // Duty calculations
  hs_code?: string;
  duty_rate: number;
  vat_rate: number;
  
  // Scoring
  current_score: number;
  velocity_24h: number;
  velocity_7d: number;
  confidence: number;
  
  // Status
  status: ProductStatus;
  mobile_friendly: boolean;
  
  // Metadata
  first_seen_at: string;
  last_updated_at: string;
  metadata: Record<string, unknown>;
}

export interface ProductVariant {
  name: string;
  value: string;
  price_delta?: number;
  sku?: string;
  stock?: number;
}

export interface TrendMetric {
  id: number;
  recorded_at: string;
  product_id: string;
  source: string;
  metric_type: MetricType;
  value: number;
  metadata: Record<string, unknown>;
}

export type MetricType = 
  | 'views'
  | 'likes'
  | 'comments'
  | 'shares'
  | 'sales'
  | 'orders'
  | 'search_interest'
  | 'mentions'
  | 'velocity'
  | 'trend_score';

export interface TrendDailyScore {
  id: number;
  date: string;
  product_id: string;
  avg_score?: number;
  peak_velocity?: number;
  total_mentions: number;
  total_sales_signals: number;
  tiktok_score: number;
  aliexpress_score: number;
  google_trends_score: number;
  price_score: number;
  supplier_score: number;
}

export interface TikTokSignal {
  id: string;
  product_id?: string;
  video_id?: string;
  video_url?: string;
  creator_handle?: string;
  creator_followers?: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  hashtags: string[];
  has_shop_link: boolean;
  recorded_at: string;
  metadata: Record<string, unknown>;
}

export interface GoogleTrendsSignal {
  id: string;
  keyword: string;
  product_id?: string;
  region: string;
  interest_value?: number;
  interest_change_7d?: number;
  interest_change_30d?: number;
  related_queries: string[];
  related_topics: string[];
  recorded_at: string;
}

export interface TrendSupplier {
  id: string;
  external_id: string;
  source: ProductSource;
  name?: string;
  rating?: number;
  transaction_count?: number;
  response_rate?: number;
  on_time_delivery_rate?: number;
  reliability_score: number;
  verified: boolean;
  gold_supplier: boolean;
  created_at: string;
  updated_at: string;
}

export interface SACategoryPerformance {
  id: string;
  category: string;
  subcategory?: string;
  avg_adoption_lag_days?: number;
  success_rate?: number;
  avg_margin?: number;
  typical_duty_rate?: number;
  typical_hs_code?: string;
  seasonal_weights: Record<string, number>;
  updated_at: string;
}

export interface TrendJob {
  id: string;
  job_type: JobType;
  status: JobStatus;
  started_at?: string;
  completed_at?: string;
  products_scanned: number;
  products_added: number;
  products_updated: number;
  error_message?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type JobType = 
  | 'aliexpress_scan'
  | 'tiktok_scan'
  | 'google_trends_scan'
  | 'score_refresh'
  | 'ai_analysis'
  | 'daily_aggregate'
  | 'full_sync';

export interface TrendAIAnalysis {
  id: string;
  product_id: string;
  sa_viability_score?: number;
  reasoning?: string;
  target_demographic?: string;
  marketing_angle?: string;
  risks: string[];
  opportunities: string[];
  recommendation?: AIRecommendation;
  suggested_retail_price_zar?: number;
  suggested_category?: string;
  analyzed_at: string;
  model_version?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

// AliExpress Affiliate API
export interface AliExpressHotProduct {
  product_id: number;
  product_title: string;
  product_main_image_url: string;
  product_detail_url: string;
  target_sale_price: string;
  target_sale_price_currency: string;
  original_price: string;
  sale_price: string;
  discount: string;
  first_level_category_id: number;
  first_level_category_name: string;
  second_level_category_id: number;
  second_level_category_name: string;
  evaluate_rate: string;
  hot_product_commission_rate: string;
  ship_to_days: string;
  lastest_volume: number;
  product_video_url?: string;
}

export interface AliExpressAPIResponse {
  resp_result: {
    resp_code: number;
    resp_msg: string;
    result: {
      current_page_no: number;
      current_record_count: number;
      total_page_no: number;
      total_record_count: number;
      products: {
        product: AliExpressHotProduct[];
      };
    };
  };
}

// FastMoss/TikTok Analytics
export interface FastMossTrendingProduct {
  product_id: string;
  title: string;
  image_url: string;
  shop_name: string;
  price: number;
  currency: string;
  sales_volume: number;
  sales_growth_7d: number;
  sales_growth_30d: number;
  video_count: number;
  avg_views: number;
  top_hashtags: string[];
  category: string;
  first_seen: string;
}

// Google Trends
export interface GoogleTrendsResult {
  keyword: string;
  interest_over_time: {
    date: string;
    value: number;
  }[];
  related_queries: {
    query: string;
    value: number;
  }[];
  related_topics: {
    topic: string;
    value: number;
  }[];
}

// CJ Dropshipping
export interface CJProduct {
  pid: string;
  productNameEn: string;
  productImage: string;
  sellPrice: number;
  categoryId: string;
  categoryName: string;
  listedNum: number;
  sourceFrom: string;
  productWeight: number;
  variants: {
    variantName: string;
    variantImage: string;
    variantSellPrice: number;
  }[];
}

// ============================================================================
// SCORING TYPES
// ============================================================================

export interface ScoreComponents {
  tiktok_velocity: number;      // 0-100
  aliexpress_velocity: number;  // 0-100
  google_interest: number;      // 0-100
  price_score: number;          // 0-100
  mobile_friendly: boolean;
  supplier_score: number;       // 0-100
  category_adoption: number;    // 0-1
}

export interface ScoreWeights {
  tiktok: number;
  aliexpress: number;
  google: number;
  price: number;
  mobile: number;
  supplier: number;
  category: number;
}

export const SA_SCORE_WEIGHTS: ScoreWeights = {
  tiktok: 0.20,
  aliexpress: 0.20,
  google: 0.15,
  price: 0.20,
  mobile: 0.10,
  supplier: 0.10,
  category: 0.05,
};

export interface TrendScore {
  total: number;
  components: ScoreComponents;
  weights: ScoreWeights;
  confidence: number;
  decay_factor: number;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface TrendingProductView extends TrendProduct {
  supplier_name?: string;
  supplier_reliability?: number;
  price_score: number;
  price_tier: PriceTier;
}

export interface ProductForReview extends TrendProduct {
  sa_viability_score?: number;
  recommendation?: AIRecommendation;
  reasoning?: string;
  risks: string[];
  opportunities: string[];
}

export interface DashboardStats {
  total_tracking: number;
  high_score_count: number;
  pending_review: number;
  approved_today: number;
  avg_score: number;
  top_categories: { category: string; count: number }[];
}

export interface TrendChartData {
  date: string;
  score: number;
  velocity: number;
  mentions: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  avg_score: number;
  avg_price: number;
  success_rate: number;
}

// ============================================================================
// CLI TYPES
// ============================================================================

export interface ScanOptions {
  source?: ProductSource;
  category?: string;
  limit?: number;
  minScore?: number;
  maxPrice?: number;
  force?: boolean;
}

export interface AnalyzeOptions {
  productId?: string;
  limit?: number;
  minScore?: number;
  export?: boolean;
}

export interface ReportOptions {
  format: 'json' | 'csv' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  minScore?: number;
}

// ============================================================================
// JOB QUEUE TYPES
// ============================================================================

export interface TrendJobPayload {
  job_type: JobType;
  options?: Record<string, unknown>;
  triggered_by?: string;
}

export interface ScanJobPayload extends TrendJobPayload {
  job_type: 'aliexpress_scan' | 'tiktok_scan' | 'google_trends_scan';
  options: {
    keywords?: string[];
    categories?: string[];
    limit?: number;
  };
}

export interface AIAnalysisJobPayload extends TrendJobPayload {
  job_type: 'ai_analysis';
  options: {
    product_ids?: string[];
    limit?: number;
    min_score?: number;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface LandedCostCalculation {
  product_cost_zar: number;
  shipping_cost_zar: number;
  duty_amount_zar: number;
  vat_amount_zar: number;
  total_landed_cost_zar: number;
  margin_at_retail: number;
}

// Exchange rates (updated periodically)
export interface ExchangeRates {
  usd_to_zar: number;
  cny_to_zar: number;
  updated_at: string;
}

export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  usd_to_zar: 18.50,
  cny_to_zar: 2.55,
  updated_at: new Date().toISOString(),
};
