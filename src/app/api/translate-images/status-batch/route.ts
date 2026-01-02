/**
 * API Route: Check Multiple Translation Jobs Status
 * POST /api/translate-images/status-batch
 * 
 * Accepts an array of job IDs and returns status for all.
 * More efficient than calling individual status endpoints.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { jobIds } = await request.json();

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: 'Job IDs array required' },
        { status: 400 }
      );
    }

    if (jobIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 jobs per batch' },
        { status: 400 }
      );
    }

    const { data: jobs, error } = await supabase
      .from('image_translations')
      .select('*')
      .in('id', jobIds);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    // Transform to response format
    const jobStatuses = jobs.map(job => ({
      id: job.id,
      status: job.status,
      progress: job.progress,
      originalUrl: job.original_url,
      originalFilename: job.original_filename,
      translatedUrl: job.translated_url,
      detectedText: job.detected_text,
      processingTimeMs: job.processing_time_ms,
      error: job.error_message,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    }));

    // Summary stats
    const summary = {
      total: jobStatuses.length,
      pending: jobStatuses.filter(j => j.status === 'pending').length,
      processing: jobStatuses.filter(j => j.status === 'processing').length,
      completed: jobStatuses.filter(j => j.status === 'completed').length,
      failed: jobStatuses.filter(j => j.status === 'failed').length,
      allComplete: jobStatuses.every(j => j.status === 'completed' || j.status === 'failed'),
    };

    return NextResponse.json({
      jobs: jobStatuses,
      summary,
    });

  } catch (error) {
    console.error('Batch status error:', error);
    return NextResponse.json(
      { error: 'Failed to check batch status' },
      { status: 500 }
    );
  }
}

