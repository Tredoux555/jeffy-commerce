// ============================================================================
// JEFFY COMMERCE: Main Trend Service
// STATUS: FUTURE - See README.md for activation
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { scanTrendingProducts } from './services/aliexpress';
import { googleTrendsService } from './services/google-trends';
import { aiAnalysisService } from './services/ai-analysis';
import { calculateTrendScore, calculateLandedCost } from './scoring-engine';
import {
  TrendProduct,
  TrendJob,
  TrendAIAnalysis,
  DashboardStats,
  TrendChartData,
  CategoryBreakdown,
  JobType,
  ProductStatus,
  PaginatedResponse,
} from './types';

let supabase: SupabaseClient;

export function initSupabase() {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  supabase = createClient(url, key);
  return supabase;
}

export async function getTrendingProducts(options: {
  limit?: number;
  offset?: number;
  status?: ProductStatus;
  category?: string;
  minScore?: number;
  sortBy?: 'score' | 'velocity' | 'price' | 'date';
} = {}): Promise<PaginatedResponse<TrendProduct>> {
  const db = initSupabase();
  const { limit = 20, offset = 0, status, category, minScore = 0, sortBy = 'score' } = options;

  let query = db.from('trend_products').select('*', { count: 'exact' });
  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);
  if (minScore > 0) query = query.gte('current_score', minScore);

  const sortCol = { score: 'current_score', velocity: 'velocity_24h', price: 'estimated_landed_cost_zar', date: 'first_seen_at' }[sortBy];
  query = query.order(sortCol, { ascending: false }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return { data: data || [], total: count || 0, page: Math.floor(offset / limit) + 1, page_size: limit, has_more: (count || 0) > offset + limit };
}

export async function getProduct(id: string): Promise<TrendProduct | null> {
  const db = initSupabase();
  const { data, error } = await db.from('trend_products').select('*').eq('id', id).single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

export async function upsertProduct(product: Partial<TrendProduct>): Promise<TrendProduct> {
  const db = initSupabase();
  if (product.source_price_usd && !product.estimated_landed_cost_zar) {
    const landed = calculateLandedCost({ source_price_usd: product.source_price_usd, weight_grams: product.weight_grams, duty_rate: product.duty_rate });
    product.estimated_landed_cost_zar = landed.total_landed_cost_zar;
  }
  const { data, error } = await db.from('trend_products').upsert(product, { onConflict: 'external_id,source' }).select().single();
  if (error) throw error;
  return data;
}

export async function createJob(jobType: JobType): Promise<TrendJob> {
  const db = initSupabase();
  const { data, error } = await db.from('trend_jobs').insert({ job_type: jobType, status: 'running', started_at: new Date().toISOString() }).select().single();
  if (error) throw error;
  return data;
}

export async function completeJob(jobId: string, results: { products_scanned?: number; products_added?: number; error_message?: string }): Promise<void> {
  const db = initSupabase();
  await db.from('trend_jobs').update({ status: results.error_message ? 'failed' : 'completed', completed_at: new Date().toISOString(), ...results }).eq('id', jobId);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = initSupabase();
  const { count: totalTracking } = await db.from('trend_products').select('*', { count: 'exact', head: true }).in('status', ['tracking', 'approved']);
  const { count: highScoreCount } = await db.from('trend_products').select('*', { count: 'exact', head: true }).gte('current_score', 70);
  const { data: avgData } = await db.from('trend_products').select('current_score').in('status', ['tracking', 'approved']).limit(500);
  const avgScore = avgData?.length ? avgData.reduce((s, p) => s + (p.current_score || 0), 0) / avgData.length : 0;

  return {
    total_tracking: totalTracking || 0,
    high_score_count: highScoreCount || 0,
    pending_review: 0,
    approved_today: 0,
    avg_score: Math.round(avgScore * 100) / 100,
    top_categories: [],
  };
}

export async function runTrendScan(options: { sources?: string[]; maxProducts?: number } = {}): Promise<{ job_id: string; products_found: number; products_added: number; errors: string[] }> {
  const { maxProducts = 500 } = options;
  const job = await createJob('full_sync');
  const errors: string[] = [];
  let productsAdded = 0;

  try {
    const scanResult = await scanTrendingProducts({ maxPages: Math.ceil(maxProducts / 50 / 6), maxPriceUsd: 30 });
    errors.push(...scanResult.errors);

    for (const product of scanResult.products) {
      try {
        await upsertProduct(product);
        productsAdded++;
      } catch (e) {
        errors.push(`Product ${product.external_id}: ${e}`);
      }
    }

    await completeJob(job.id, { products_scanned: scanResult.total_found, products_added: productsAdded });
    return { job_id: job.id, products_found: scanResult.total_found, products_added: productsAdded, errors };
  } catch (error) {
    await completeJob(job.id, { error_message: String(error) });
    throw error;
  }
}

export const trendService = {
  initSupabase,
  getTrendingProducts,
  getProduct,
  upsertProduct,
  createJob,
  completeJob,
  getDashboardStats,
  runTrendScan,
};

export default trendService;
