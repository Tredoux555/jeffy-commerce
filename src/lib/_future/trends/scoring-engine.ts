// ============================================================================
// JEFFY COMMERCE: Trend Scoring Engine
// SA-optimized scoring algorithm with decay and confidence
// ============================================================================

import {
  TrendProduct,
  TrendMetric,
  ScoreComponents,
  ScoreWeights,
  TrendScore,
  SA_SCORE_WEIGHTS,
  LandedCostCalculation,
  DEFAULT_EXCHANGE_RATES,
  SACategoryPerformance,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

// Price thresholds in ZAR
const PRICE_THRESHOLDS = {
  optimal: 100,      // R100 and under = max score
  good: 200,         // R200 = 90
  acceptable: 300,   // R300 = 80
  marginal: 400,     // R400 = 70
  limit: 500,        // R500 = 60 (hard limit for impulse)
  risky: 750,        // R750 = 40
  expensive: 1000,   // R1000 = 25
};

// Velocity normalization (based on typical ranges)
const VELOCITY_NORMALIZATION = {
  tiktok_views_24h: 50000,    // 50k views = 100 score
  tiktok_sales_24h: 100,       // 100 sales = 100 score
  aliexpress_orders_24h: 50,   // 50 orders = 100 score
  google_interest: 100,        // Already 0-100
};

// Decay half-life in hours
const DECAY_HALF_LIFE = {
  tiktok: 48,          // TikTok signals decay fast (2 days)
  aliexpress: 168,     // Sales data more stable (7 days)
  google: 336,         // Search interest slow-moving (14 days)
  supplier: 720,       // Supplier ratings very stable (30 days)
};

// ============================================================================
// LANDED COST CALCULATION
// ============================================================================

export interface LandedCostParams {
  source_price_usd?: number;
  source_price_cny?: number;
  weight_grams?: number;
  duty_rate?: number;
  vat_rate?: number;
  shipping_method?: 'sea' | 'air' | 'express';
}

/**
 * Calculate full landed cost in ZAR including duties and VAT
 */
export function calculateLandedCost(
  params: LandedCostParams
): LandedCostCalculation {
  const {
    source_price_usd,
    source_price_cny,
    weight_grams = 500,
    duty_rate = 0,
    vat_rate = 15,
    shipping_method = 'sea',
  } = params;

  const rates = DEFAULT_EXCHANGE_RATES;

  // Convert to ZAR
  let product_cost_zar = 0;
  if (source_price_usd) {
    product_cost_zar = source_price_usd * rates.usd_to_zar;
  } else if (source_price_cny) {
    product_cost_zar = source_price_cny * rates.cny_to_zar;
  }

  // Shipping cost per kg by method
  const shippingRates = {
    sea: 80,      // R80/kg - slow but cheap
    air: 180,     // R180/kg - faster
    express: 350, // R350/kg - DHL/FedEx
  };

  const shipping_cost_zar = (weight_grams / 1000) * shippingRates[shipping_method];

  // Duty calculation (on CIF value)
  const cif_value = product_cost_zar + shipping_cost_zar;
  const duty_amount_zar = cif_value * (duty_rate / 100);

  // VAT on total including duty
  const vat_amount_zar = (cif_value + duty_amount_zar) * (vat_rate / 100);

  // Total landed cost
  const total_landed_cost_zar = cif_value + duty_amount_zar + vat_amount_zar;

  // Calculate margin at 2x markup
  const retail_price = total_landed_cost_zar * 2;
  const margin_at_retail = ((retail_price - total_landed_cost_zar) / retail_price) * 100;

  return {
    product_cost_zar: Math.round(product_cost_zar * 100) / 100,
    shipping_cost_zar: Math.round(shipping_cost_zar * 100) / 100,
    duty_amount_zar: Math.round(duty_amount_zar * 100) / 100,
    vat_amount_zar: Math.round(vat_amount_zar * 100) / 100,
    total_landed_cost_zar: Math.round(total_landed_cost_zar * 100) / 100,
    margin_at_retail: Math.round(margin_at_retail * 100) / 100,
  };
}

// ============================================================================
// COMPONENT SCORE CALCULATIONS
// ============================================================================

/**
 * Calculate price score based on SA thresholds
 */
export function calculatePriceScore(landed_cost_zar?: number): number {
  if (landed_cost_zar === undefined || landed_cost_zar === null) return 50;

  if (landed_cost_zar <= PRICE_THRESHOLDS.optimal) return 100;
  if (landed_cost_zar <= PRICE_THRESHOLDS.good) return 90;
  if (landed_cost_zar <= PRICE_THRESHOLDS.acceptable) return 80;
  if (landed_cost_zar <= PRICE_THRESHOLDS.marginal) return 70;
  if (landed_cost_zar <= PRICE_THRESHOLDS.limit) return 60;
  if (landed_cost_zar <= PRICE_THRESHOLDS.risky) return 40;
  if (landed_cost_zar <= PRICE_THRESHOLDS.expensive) return 25;
  
  return 10; // Above R1000
}

/**
 * Normalize velocity metrics to 0-100 scale
 */
export function normalizeVelocity(
  value: number,
  metricType: keyof typeof VELOCITY_NORMALIZATION
): number {
  const maxValue = VELOCITY_NORMALIZATION[metricType];
  const normalized = (value / maxValue) * 100;
  return Math.min(100, Math.max(0, normalized));
}

/**
 * Calculate TikTok velocity score from engagement metrics
 */
export function calculateTikTokScore(metrics: {
  views_24h?: number;
  likes_24h?: number;
  sales_24h?: number;
  video_count?: number;
}): number {
  const {
    views_24h = 0,
    likes_24h = 0,
    sales_24h = 0,
    video_count = 0,
  } = metrics;

  // Weighted combination of signals
  const viewScore = normalizeVelocity(views_24h, 'tiktok_views_24h') * 0.3;
  const salesScore = normalizeVelocity(sales_24h, 'tiktok_sales_24h') * 0.5;
  const engagementScore = Math.min(100, (likes_24h / Math.max(views_24h, 1)) * 1000) * 0.1;
  const momentumScore = Math.min(100, video_count * 10) * 0.1;

  return Math.round(viewScore + salesScore + engagementScore + momentumScore);
}

/**
 * Calculate AliExpress velocity score
 */
export function calculateAliExpressScore(metrics: {
  orders_24h?: number;
  orders_7d?: number;
  reviews?: number;
  rating?: number;
}): number {
  const {
    orders_24h = 0,
    orders_7d = 0,
    reviews = 0,
    rating = 0,
  } = metrics;

  // Orders velocity is primary signal
  const orderScore24h = normalizeVelocity(orders_24h, 'aliexpress_orders_24h') * 0.4;
  const orderScore7d = normalizeVelocity(orders_7d / 7, 'aliexpress_orders_24h') * 0.3;
  
  // Social proof
  const reviewScore = Math.min(100, Math.log10(reviews + 1) * 25) * 0.2;
  const ratingScore = (rating / 5) * 100 * 0.1;

  return Math.round(orderScore24h + orderScore7d + reviewScore + ratingScore);
}

/**
 * Calculate supplier reliability score
 */
export function calculateSupplierScore(supplier: {
  rating?: number;
  transaction_count?: number;
  response_rate?: number;
  on_time_delivery?: number;
  verified?: boolean;
  gold_supplier?: boolean;
}): number {
  const {
    rating = 0,
    transaction_count = 0,
    response_rate = 0,
    on_time_delivery = 0,
    verified = false,
    gold_supplier = false,
  } = supplier;

  // Base score from rating
  let score = (rating / 5) * 40;

  // Transaction volume bonus
  score += Math.min(20, Math.log10(transaction_count + 1) * 5);

  // Response and delivery
  score += (response_rate / 100) * 15;
  score += (on_time_delivery / 100) * 15;

  // Verification bonuses
  if (verified) score += 5;
  if (gold_supplier) score += 5;

  return Math.min(100, Math.round(score));
}

// ============================================================================
// DECAY FUNCTIONS
// ============================================================================

/**
 * Apply exponential decay based on signal age
 */
export function applyDecay(
  signalAgeHours: number,
  halfLifeHours: number = 168
): number {
  return Math.pow(0.5, signalAgeHours / halfLifeHours);
}

/**
 * Get decay factor for a specific signal type
 */
export function getDecayFactor(
  signalType: 'tiktok' | 'aliexpress' | 'google' | 'supplier',
  signalAgeHours: number
): number {
  const halfLife = DECAY_HALF_LIFE[signalType];
  return applyDecay(signalAgeHours, halfLife);
}

// ============================================================================
// CONFIDENCE CALCULATION
// ============================================================================

/**
 * Calculate confidence score based on data completeness and freshness
 */
export function calculateConfidence(params: {
  has_tiktok_data: boolean;
  has_aliexpress_data: boolean;
  has_google_data: boolean;
  has_supplier_data: boolean;
  data_age_hours: number;
  data_points: number;
}): number {
  const {
    has_tiktok_data,
    has_aliexpress_data,
    has_google_data,
    has_supplier_data,
    data_age_hours,
    data_points,
  } = params;

  // Data completeness (0-50 points)
  let completeness = 0;
  if (has_tiktok_data) completeness += 15;
  if (has_aliexpress_data) completeness += 15;
  if (has_google_data) completeness += 10;
  if (has_supplier_data) completeness += 10;

  // Data freshness (0-30 points)
  const freshnessDecay = applyDecay(data_age_hours, 24);
  const freshness = freshnessDecay * 30;

  // Data volume (0-20 points)
  const volumeScore = Math.min(20, Math.log10(data_points + 1) * 10);

  return Math.round(completeness + freshness + volumeScore) / 100;
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

export interface ScoreInput {
  product: Partial<TrendProduct>;
  metrics?: {
    tiktok?: {
      views_24h?: number;
      likes_24h?: number;
      sales_24h?: number;
      video_count?: number;
      last_updated?: Date;
    };
    aliexpress?: {
      orders_24h?: number;
      orders_7d?: number;
      reviews?: number;
      rating?: number;
      last_updated?: Date;
    };
    google?: {
      interest?: number;
      velocity_7d?: number;
      last_updated?: Date;
    };
    supplier?: {
      rating?: number;
      transaction_count?: number;
      response_rate?: number;
      on_time_delivery?: number;
      verified?: boolean;
      gold_supplier?: boolean;
    };
  };
  categoryPerformance?: Partial<SACategoryPerformance>;
  weights?: ScoreWeights;
}

/**
 * Calculate comprehensive trend score for a product
 */
export function calculateTrendScore(input: ScoreInput): TrendScore {
  const { product, metrics = {}, categoryPerformance = {}, weights = SA_SCORE_WEIGHTS } = input;

  const now = new Date();

  // Calculate individual component scores
  const tiktok_velocity = metrics.tiktok
    ? calculateTikTokScore(metrics.tiktok)
    : 0;

  const aliexpress_velocity = metrics.aliexpress
    ? calculateAliExpressScore(metrics.aliexpress)
    : 0;

  const google_interest = metrics.google?.interest || 0;

  const price_score = calculatePriceScore(product.estimated_landed_cost_zar);

  const mobile_friendly = product.mobile_friendly !== false;

  const supplier_score = metrics.supplier
    ? calculateSupplierScore(metrics.supplier)
    : 50; // Default to neutral

  const category_adoption = categoryPerformance.success_rate || 0.5;

  // Calculate decay factors
  const tiktokAge = metrics.tiktok?.last_updated
    ? (now.getTime() - new Date(metrics.tiktok.last_updated).getTime()) / 3600000
    : 24;
  const aliexpressAge = metrics.aliexpress?.last_updated
    ? (now.getTime() - new Date(metrics.aliexpress.last_updated).getTime()) / 3600000
    : 48;
  const googleAge = metrics.google?.last_updated
    ? (now.getTime() - new Date(metrics.google.last_updated).getTime()) / 3600000
    : 72;

  const tiktokDecay = getDecayFactor('tiktok', tiktokAge);
  const aliexpressDecay = getDecayFactor('aliexpress', aliexpressAge);
  const googleDecay = getDecayFactor('google', googleAge);

  // Apply weighted scoring with decay
  const mobileScore = mobile_friendly ? 100 : 20;

  const weightedScore =
    (tiktok_velocity * tiktokDecay * weights.tiktok) +
    (aliexpress_velocity * aliexpressDecay * weights.aliexpress) +
    (google_interest * googleDecay * weights.google) +
    (price_score * weights.price) +
    (mobileScore * weights.mobile) +
    (supplier_score * weights.supplier) +
    (category_adoption * 100 * weights.category);

  // Average decay factor
  const avgDecay = (tiktokDecay + aliexpressDecay + googleDecay) / 3;

  // Calculate confidence
  const confidence = calculateConfidence({
    has_tiktok_data: !!metrics.tiktok,
    has_aliexpress_data: !!metrics.aliexpress,
    has_google_data: !!metrics.google,
    has_supplier_data: !!metrics.supplier,
    data_age_hours: Math.max(tiktokAge, aliexpressAge, googleAge),
    data_points: Object.keys(metrics).length * 5, // Rough estimate
  });

  const components: ScoreComponents = {
    tiktok_velocity,
    aliexpress_velocity,
    google_interest,
    price_score,
    mobile_friendly,
    supplier_score,
    category_adoption,
  };

  return {
    total: Math.round(weightedScore * 100) / 100,
    components,
    weights,
    confidence,
    decay_factor: avgDecay,
  };
}

// ============================================================================
// BATCH SCORING
// ============================================================================

/**
 * Score multiple products efficiently
 */
export function scoreProducts(
  products: ScoreInput[]
): Array<{ product_id: string; score: TrendScore }> {
  return products.map(input => ({
    product_id: input.product.id || input.product.external_id || '',
    score: calculateTrendScore(input),
  }));
}

/**
 * Rank products by score
 */
export function rankProducts(
  products: Array<{ product_id: string; score: TrendScore }>
): Array<{ rank: number; product_id: string; score: TrendScore }> {
  return products
    .sort((a, b) => b.score.total - a.score.total)
    .map((item, index) => ({
      rank: index + 1,
      ...item,
    }));
}

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

/**
 * Detect velocity anomalies (sudden spikes)
 */
export function detectVelocityAnomaly(
  current: number,
  historical: number[],
  threshold: number = 2.5
): { is_anomaly: boolean; z_score: number; direction: 'spike' | 'drop' | 'normal' } {
  if (historical.length < 3) {
    return { is_anomaly: false, z_score: 0, direction: 'normal' };
  }

  const mean = historical.reduce((a, b) => a + b, 0) / historical.length;
  const variance = historical.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historical.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return { is_anomaly: current !== mean, z_score: current !== mean ? Infinity : 0, direction: 'normal' };
  }

  const z_score = (current - mean) / stdDev;
  const is_anomaly = Math.abs(z_score) > threshold;
  
  let direction: 'spike' | 'drop' | 'normal' = 'normal';
  if (z_score > threshold) direction = 'spike';
  else if (z_score < -threshold) direction = 'drop';

  return { is_anomaly, z_score: Math.round(z_score * 100) / 100, direction };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const scoringEngine = {
  calculateLandedCost,
  calculatePriceScore,
  calculateTikTokScore,
  calculateAliExpressScore,
  calculateSupplierScore,
  calculateConfidence,
  calculateTrendScore,
  scoreProducts,
  rankProducts,
  applyDecay,
  getDecayFactor,
  detectVelocityAnomaly,
  normalizeVelocity,
  PRICE_THRESHOLDS,
  DECAY_HALF_LIFE,
};

export default scoringEngine;
