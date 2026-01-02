/**
 * API Route: List Recent Translations
 * GET /api/translate-images/list
 * 
 * Returns recent translation jobs with pagination.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status'); // Optional filter
    const productId = searchParams.get('productId'); // Optional filter
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('image_translations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: jobs, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch translations' },
        { status: 500 }
      );
    }

    // Transform to response format
    const translations = jobs.map(job => ({
      id: job.id,
      status: job.status,
      progress: job.progress,
      originalUrl: job.original_url,
      originalFilename: job.original_filename,
      translatedUrl: job.translated_url,
      processingTimeMs: job.processing_time_ms,
      error: job.error_message,
      productId: job.product_id,
      createdAt: job.created_at,
    }));

    return NextResponse.json({
      translations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    console.error('List translations error:', error);
    return NextResponse.json(
      { error: 'Failed to list translations' },
      { status: 500 }
    );
  }
}

