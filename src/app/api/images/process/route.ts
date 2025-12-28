/**
 * API Route: Process 1688 Product Images
 * POST /api/images/process
 * 
 * Removes Chinese text and replaces with English translations
 */

import { NextRequest, NextResponse } from 'next/server';
import { processProductImage, processProductImages } from '@/lib/image-processor';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60; // Allow up to 60 seconds for batch processing

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Only allow authenticated users (admin check can be added)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, imageUrls, options } = body;

    const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json({ 
        error: 'Google Cloud API key not configured' 
      }, { status: 500 });
    }

    // Single image processing
    if (imageUrl) {
      const result = await processProductImage(imageUrl, googleApiKey, options);
      
      if (result.success && result.processedBuffer) {
        // Upload to Supabase Storage
        const filename = `processed/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filename, result.processedBuffer, {
            contentType: 'image/png',
            cacheControl: '3600'
          });

        if (uploadError) {
          return NextResponse.json({ 
            success: true,
            processedBase64: result.processedBuffer.toString('base64'),
            textFound: result.textFound,
            warning: 'Processed but storage upload failed'
          });
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filename);

        return NextResponse.json({
          success: true,
          originalUrl: imageUrl,
          processedUrl: urlData.publicUrl,
          textFound: result.textFound
        });
      }

      return NextResponse.json({
        success: false,
        error: result.error,
        textFound: result.textFound
      }, { status: 400 });
    }

    // Batch processing
    if (imageUrls && Array.isArray(imageUrls)) {
      if (imageUrls.length > 20) {
        return NextResponse.json({ 
          error: 'Maximum 20 images per batch' 
        }, { status: 400 });
      }

      const results = await processProductImages(imageUrls, googleApiKey, options);
      
      // Upload successful results to storage
      const uploadedResults = await Promise.all(
        results.map(async (result) => {
          if (!result.success || !result.processedBuffer) {
            return {
              originalUrl: result.originalUrl,
              success: false,
              error: result.error
            };
          }

          const filename = `processed/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filename, result.processedBuffer, {
              contentType: 'image/png',
              cacheControl: '3600'
            });

          if (uploadError) {
            return {
              originalUrl: result.originalUrl,
              success: true,
              processedBase64: result.processedBuffer.toString('base64').slice(0, 100) + '...',
              warning: 'Storage upload failed'
            };
          }

          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filename);

          return {
            originalUrl: result.originalUrl,
            success: true,
            processedUrl: urlData.publicUrl,
            textFound: result.textFound?.length || 0
          };
        })
      );

      return NextResponse.json({
        success: true,
        results: uploadedResults,
        summary: {
          total: results.length,
          processed: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      });
    }

    return NextResponse.json({ 
      error: 'Provide imageUrl or imageUrls array' 
    }, { status: 400 });

  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Processing failed' 
    }, { status: 500 });
  }
}
