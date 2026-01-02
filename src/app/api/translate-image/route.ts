/**
 * API Route: Translate Chinese Product Image to English
 * POST /api/translate-image
 * 
 * Accepts either:
 * - FormData with image file (key: 'image')
 * - JSON body with { imageUrl: string }
 * 
 * Uses Alibaba DashScope Qwen-MT-Image API (Beijing region only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Beijing region endpoint (image translation only works in Beijing)
const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis';
const API_KEY = process.env.ALIBABA_DASHSCOPE_API_KEY;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  console.log('[translate-image] === START ===');
  
  try {
    if (!API_KEY) {
      console.error('[translate-image] No API key configured');
      return NextResponse.json(
        { error: 'ALIBABA_DASHSCOPE_API_KEY not configured' },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();
    let originalImageUrl: string = '';
    
    const contentType = request.headers.get('content-type') || '';
    console.log('[translate-image] Content-Type:', contentType);

    const clonedRequest = request.clone();
    
    // Try FormData first
    try {
      const formData = await request.formData();
      const imageFile = formData.get('image') as File | null;
      
      if (imageFile && imageFile.size > 0) {
        console.log('[translate-image] Got file:', imageFile.name, 'size:', imageFile.size);
        
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'File must be an image', receivedType: imageFile.type },
            { status: 400 }
          );
        }

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const originalFilename = `originals/${Date.now()}_${safeName}`;
        
        console.log('[translate-image] Uploading to storage:', originalFilename);
        
        const { error: uploadError } = await supabase.storage
          .from('translated-images')
          .upload(originalFilename, buffer, {
            contentType: imageFile.type,
            upsert: true,
          });

        if (uploadError) {
          console.error('[translate-image] Storage error:', uploadError);
          return NextResponse.json(
            { error: 'Failed to upload image to storage', details: uploadError.message },
            { status: 500 }
          );
        }

        const { data: urlData } = supabase.storage
          .from('translated-images')
          .getPublicUrl(originalFilename);

        originalImageUrl = urlData.publicUrl;
        console.log('[translate-image] Uploaded, URL:', originalImageUrl);
      }
    } catch (formError) {
      console.log('[translate-image] Not form data, trying JSON...');
    }

    // If no URL yet, try JSON
    if (!originalImageUrl) {
      try {
        const body = await clonedRequest.json();
        if (body.imageUrl) {
          originalImageUrl = body.imageUrl;
          console.log('[translate-image] Got URL from JSON:', originalImageUrl);
        }
      } catch (jsonError) {
        console.log('[translate-image] Not JSON either');
      }
    }

    if (!originalImageUrl) {
      console.error('[translate-image] No image provided');
      return NextResponse.json(
        { error: 'No image provided. Send FormData with "image" file or JSON with "imageUrl"' },
        { status: 400 }
      );
    }

    // Call Alibaba DashScope API with CORRECT format
    // Model: qwen-mt-image (NOT qwen-mt-image-v1)
    // source_lang and target_lang go in INPUT, not parameters
    console.log('[translate-image] Calling DashScope API...');
    
    const requestBody = {
      model: 'qwen-mt-image',  // Correct model name
      input: {
        image_url: originalImageUrl,
        source_lang: 'zh',      // Moved to input
        target_lang: 'en',      // Moved to input
      },
    };
    
    console.log('[translate-image] Request body:', JSON.stringify(requestBody));
    
    const dashscopeResponse = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify(requestBody),
    });

    const dashscopeData = await dashscopeResponse.json();
    console.log('[translate-image] DashScope response:', JSON.stringify(dashscopeData).slice(0, 1000));

    if (!dashscopeResponse.ok) {
      // Check for region error
      const errorMsg = dashscopeData.message || dashscopeData.error?.message || JSON.stringify(dashscopeData);
      
      if (errorMsg.includes('region') || errorMsg.includes('Beijing') || dashscopeData.code === 'InvalidParameter') {
        return NextResponse.json({
          error: 'Region error: Image translation only works with Beijing region API key',
          details: errorMsg,
          hint: 'Get a Beijing region API key from https://dashscope.console.aliyun.com/',
        }, { status: 500 });
      }
      
      return NextResponse.json({
        error: 'DashScope API error',
        details: errorMsg,
        status: dashscopeResponse.status,
      }, { status: 500 });
    }

    const taskId = dashscopeData.output?.task_id;
    if (!taskId) {
      return NextResponse.json(
        { error: 'No task ID from DashScope', response: dashscopeData },
        { status: 500 }
      );
    }

    // Poll for completion
    console.log('[translate-image] Task ID:', taskId, '- polling...');
    const translatedUrl = await pollForResult(taskId);

    if (!translatedUrl) {
      return NextResponse.json(
        { error: 'Translation timed out or failed' },
        { status: 500 }
      );
    }

    // Download and save translated image
    console.log('[translate-image] Downloading result from:', translatedUrl);
    const translatedBuffer = await fetch(translatedUrl).then(r => r.arrayBuffer());
    const translatedFilename = `translated/${Date.now()}.jpg`;
    
    const { error: saveError } = await supabase.storage
      .from('translated-images')
      .upload(translatedFilename, Buffer.from(translatedBuffer), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (saveError) {
      console.error('[translate-image] Save error:', saveError);
      // Return the Alibaba URL directly as fallback
      return NextResponse.json({
        success: true,
        id: taskId,
        original_image_url: originalImageUrl,
        translated_image_url: translatedUrl,
        status: 'completed',
      });
    }

    const { data: finalUrlData } = supabase.storage
      .from('translated-images')
      .getPublicUrl(translatedFilename);

    console.log('[translate-image] === SUCCESS ===', finalUrlData.publicUrl);
    
    return NextResponse.json({
      success: true,
      id: taskId,
      original_image_url: originalImageUrl,
      translated_image_url: finalUrlData.publicUrl,
      status: 'completed',
    });

  } catch (error) {
    console.error('[translate-image] Unhandled error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

async function pollForResult(taskId: string): Promise<string | null> {
  const maxAttempts = 30;
  const interval = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, interval));

    try {
      const res = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
      });
      
      const data = await res.json();
      const status = data.output?.task_status;
      
      console.log(`[translate-image] Poll ${i + 1}/${maxAttempts}: ${status}`);

      if (status === 'SUCCEEDED') {
        return data.output?.result_url || null;
      }
      if (status === 'FAILED') {
        console.error('[translate-image] Task failed:', data);
        return null;
      }
    } catch (e) {
      console.error('[translate-image] Poll error:', e);
    }
  }

  return null;
}
