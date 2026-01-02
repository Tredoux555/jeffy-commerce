/**
 * API Route: Check Translation Job Status
 * GET /api/translate-images/status/[jobId]
 * 
 * Returns the current status of a translation job.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      );
    }

    const { data: job, error } = await supabase
      .from('image_translations')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}

