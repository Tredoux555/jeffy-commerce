/**
 * API Route: Translate Chinese Product Image to English
 * POST /api/translate-image
 * 
 * Accepts either:
 * - JSON body with { imageUrl: string }
 * - FormData with image file
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
    let originalImageUrl: string;
    let isFileUpload = false;
    
    // Check content type to determine how to parse
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // JSON body with imageUrl
      const body = await request.json();
      originalImageUrl = body.imageUrl;
      
      if (!originalImageUrl) {
        return NextResponse.json(
          { error: 'imageUrl is required' },
          { status: 400 }
        );
      }
    } else if (contentType.includes('multipart/form-data')) {
      // FormData with file upload
      isFileUpload = true;
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

      originalImageUrl = urlData.publicUrl;
    } else {
      return NextResponse.json(
        { error: 'Invalid content type. Use application/json or multipart/form-data' },
        { status: 400 }
      );
    }

    // Call Alibaba DashScope Qwen-MT-Image API
    console.log('[translate-image] Starting translation for:', originalImageUrl);
    
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
    console.log('[translate-image] DashScope response:', dashscopeData);

    if (!dashscopeResponse.ok) {
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
      return NextResponse.json(
        { error: 'No task ID returned from API', details: dashscopeData },
        { status: 500 }
      );
    }

    // Poll for task completion
    console.log('[translate-image] Polling task:', taskId);
    const translatedImageUrl = await pollForTranslation(taskId);

    if (translatedImageUrl) {
      // Download translated image and save to storage
      const translatedBuffer = await fetch(translatedImageUrl).then(r => r.arrayBuffer());
      const translatedFilename = `translated/${Date.now()}.jpg`;
      
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

        console.log('[translate-image] Success:', translatedUrlData.publicUrl);
        
        return NextResponse.json({
          success: true,
          original_image_url: originalImageUrl,
          translated_image_url: translatedUrlData.publicUrl,
          status: 'completed',
        });
      } else {
        console.error('[translate-image] Save error:', saveError);
      }
    }

    // If we get here, something went wrong
    return NextResponse.json(
      { error: 'Failed to complete translation' },
      { status: 500 }
    );

  } catch (error) {
    console.error('[translate-image] Error:', error);
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
async function pollForTranslation(taskId: string): Promise<string | null> {
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
      console.log(`[translate-image] Poll attempt ${attempt + 1}:`, statusData.output?.task_status);

      if (!statusResponse.ok) {
        console.error('[translate-image] Status check error:', statusData);
        continue;
      }

      const taskStatus = statusData.output?.task_status;

      if (taskStatus === 'SUCCEEDED') {
        const resultUrl = statusData.output?.result_url;
        if (resultUrl) {
          return resultUrl;
        }
      } else if (taskStatus === 'FAILED') {
        console.error('[translate-image] Task failed:', statusData);
        return null;
      }
      // If PENDING or RUNNING, continue polling
    } catch (error) {
      console.error('[translate-image] Polling error:', error);
      // Continue polling despite error
    }
  }

  // Timeout
  console.error('[translate-image] Translation timeout');
  return null;
}
