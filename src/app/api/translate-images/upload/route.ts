/**
 * API Route: Upload and Translate Product Images
 * POST /api/translate-images/upload
 * 
 * Accepts multipart form data with images, uploads to temp storage,
 * creates translation jobs, and returns job IDs for tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { translateProductImage } from '@/lib/image-translator';

// Supabase admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const glossaryRaw = formData.get('glossary') as string;
    const productId = formData.get('productId') as string | null;
    
    // Parse glossary if provided
    let glossary: Array<{ source: string; target: string }> = [];
    if (glossaryRaw) {
      try {
        glossary = JSON.parse(glossaryRaw);
      } catch {
        // Ignore invalid glossary
      }
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    if (files.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 images per batch' },
        { status: 400 }
      );
    }

    const jobs: Array<{
      id: string;
      filename: string;
      status: string;
    }> = [];

    // Process each file
    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Upload original to temp storage
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const originalFilename = `originals/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('translated-images')
        .upload(originalFilename, buffer, {
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      // Get public URL for the original
      const { data: urlData } = supabase.storage
        .from('translated-images')
        .getPublicUrl(originalFilename);

      const originalUrl = urlData.publicUrl;

      // Create translation job record
      const { data: jobData, error: jobError } = await supabase
        .from('image_translations')
        .insert({
          original_url: originalUrl,
          original_filename: file.name,
          original_size_bytes: buffer.length,
          status: 'pending',
          progress: 0,
          glossary: glossary,
          product_id: productId || null,
        })
        .select()
        .single();

      if (jobError || !jobData) {
        console.error('Job creation error:', jobError);
        continue;
      }

      jobs.push({
        id: jobData.id,
        filename: file.name,
        status: 'pending',
      });

      // Start translation asynchronously (don't await)
      processTranslation(jobData.id, originalUrl, glossary).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      jobs,
      message: `${jobs.length} translation job(s) started`,
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Process translation in background
 */
async function processTranslation(
  jobId: string,
  imageUrl: string,
  glossary: Array<{ source: string; target: string }>
) {
  const supabase = getSupabaseAdmin();
  
  try {
    // Update status to processing
    await supabase
      .from('image_translations')
      .update({ status: 'processing', progress: 10 })
      .eq('id', jobId);

    const startTime = Date.now();

    // Perform translation
    const result = await translateProductImage(imageUrl, {
      glossary,
      saveToStorage: true,
    });

    const processingTime = Date.now() - startTime;

    if (result.success && result.translatedUrl) {
      // Success - update job record
      await supabase
        .from('image_translations')
        .update({
          status: 'completed',
          progress: 100,
          translated_url: result.translatedUrl,
          detected_text: result.detectedRegions || [],
          processing_time_ms: processingTime,
        })
        .eq('id', jobId);
    } else {
      // Failed - update with error
      await supabase
        .from('image_translations')
        .update({
          status: 'failed',
          progress: 0,
          error_message: result.error || 'Translation failed',
          processing_time_ms: processingTime,
        })
        .eq('id', jobId);
    }
  } catch (error) {
    // Update job as failed
    await supabase
      .from('image_translations')
      .update({
        status: 'failed',
        progress: 0,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', jobId);
  }
}

// Configure for large file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

