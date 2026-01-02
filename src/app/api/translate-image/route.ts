/**
 * API Route: Translate Chinese Product Image to English
 * POST /api/translate-image
 * 
 * Uses Alibaba DashScope Qwen-MT-Image API to translate Chinese text in images to English
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis';
const API_KEY = process.env.ALIBABA_DASHSCOPE_API_KEY;

// Supabase admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'ALIBABA_DASHSCOPE_API_KEY not configured' },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();
    
    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Upload original image to Supabase storage
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalFilename = `originals/${Date.now()}_${imageFile.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('translated-images')
      .upload(originalFilename, buffer, {
        contentType: imageFile.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL for original
    const { data: urlData } = supabase.storage
      .from('translated-images')
      .getPublicUrl(originalFilename);

    const originalImageUrl = urlData.publicUrl;

    // Create translation record
    const { data: translationRecord, error: recordError } = await supabase
      .from('image_translations')
      .insert({
        original_image_url: originalImageUrl,
        status: 'processing',
      })
      .select()
      .single();

    if (recordError || !translationRecord) {
      console.error('Failed to create translation record:', recordError);
      return NextResponse.json(
        { error: 'Failed to create translation record' },
        { status: 500 }
      );
    }

    // Call Alibaba DashScope Qwen-MT-Image API
    try {
      const dashscopeResponse = await fetch(DASHSCOPE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable', // Enable async mode
        },
        body: JSON.stringify({
          model: 'qwen-mt-image-v1',
          input: {
            image_url: originalImageUrl,
          },
          parameters: {
            source_lang: 'zh',
            target_lang: 'en',
            domain_list: ['e-commerce'],
          },
        }),
      });

      const dashscopeData = await dashscopeResponse.json();

      if (!dashscopeResponse.ok) {
        // Update record as failed
        await supabase
          .from('image_translations')
          .update({
            status: 'failed',
          })
          .eq('id', translationRecord.id);

        return NextResponse.json(
          { 
            error: 'Translation API error',
            details: dashscopeData.message || `API error: ${dashscopeResponse.status}`,
          },
          { status: dashscopeResponse.status }
        );
      }

      const taskId = dashscopeData.output?.task_id;

      if (!taskId) {
        await supabase
          .from('image_translations')
          .update({ status: 'failed' })
          .eq('id', translationRecord.id);

        return NextResponse.json(
          { error: 'No task ID returned from API' },
          { status: 500 }
        );
      }

      // Poll for task completion
      const translatedImageUrl = await pollForTranslation(taskId, translationRecord.id, supabase);

      if (translatedImageUrl) {
        // Download translated image and save to storage
        const translatedBuffer = await fetch(translatedImageUrl).then(r => r.arrayBuffer());
        const translatedFilename = `translated/${Date.now()}_${imageFile.name}`;
        
        const { error: saveError } = await supabase.storage
          .from('translated-images')
          .upload(translatedFilename, Buffer.from(translatedBuffer), {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (!saveError) {
          const { data: translatedUrlData } = supabase.storage
            .from('translated-images')
            .getPublicUrl(translatedFilename);

          // Update record with translated URL
          await supabase
            .from('image_translations')
            .update({
              translated_image_url: translatedUrlData.publicUrl,
              status: 'completed',
            })
            .eq('id', translationRecord.id);

          return NextResponse.json({
            success: true,
            id: translationRecord.id,
            original_image_url: originalImageUrl,
            translated_image_url: translatedUrlData.publicUrl,
            status: 'completed',
          });
        }
      }

      // If we get here, something went wrong
      await supabase
        .from('image_translations')
        .update({ status: 'failed' })
        .eq('id', translationRecord.id);

      return NextResponse.json(
        { error: 'Failed to save translated image' },
        { status: 500 }
      );

    } catch (apiError) {
      console.error('Translation API error:', apiError);
      await supabase
        .from('image_translations')
        .update({ status: 'failed' })
        .eq('id', translationRecord.id);

      return NextResponse.json(
        { 
          error: 'Translation failed',
          details: apiError instanceof Error ? apiError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Translate image error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Poll Alibaba API for translation task completion
 */
async function pollForTranslation(
  taskId: string,
  recordId: string,
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<string | null> {
  const maxAttempts = 30; // 30 attempts = 60 seconds max
  const pollInterval = 2000; // 2 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    try {
      const statusResponse = await fetch(
        `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
          },
        }
      );

      const statusData = await statusResponse.json();

      if (!statusResponse.ok) {
        console.error('Status check error:', statusData);
        continue;
      }

      const taskStatus = statusData.output?.task_status;

      if (taskStatus === 'SUCCEEDED') {
        const resultUrl = statusData.output?.result_url;
        if (resultUrl) {
          return resultUrl;
        }
      } else if (taskStatus === 'FAILED') {
        await supabase
          .from('image_translations')
          .update({ status: 'failed' })
          .eq('id', recordId);
        return null;
      }
      // If PENDING or RUNNING, continue polling
    } catch (error) {
      console.error('Polling error:', error);
      // Continue polling despite error
    }
  }

  // Timeout
  await supabase
    .from('image_translations')
    .update({ status: 'failed' })
    .eq('id', recordId);

  return null;
}

