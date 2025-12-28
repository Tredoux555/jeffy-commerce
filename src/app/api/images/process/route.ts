/**
 * API Route: Process 1688 Product Images
 * POST /api/images/process
 * 
 * Detects Chinese text and provides English translations
 */

import { NextRequest, NextResponse } from 'next/server';
import { processProductImage, processProductImages } from '@/lib/image-processor';
import { isAdminLoggedIn } from '@/lib/auth';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const isAdmin = await isAdminLoggedIn();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, imageUrls } = body;

    const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json({ 
        error: 'Google Cloud API key not configured. Add GOOGLE_CLOUD_API_KEY to environment variables.' 
      }, { status: 500 });
    }

    // Single image processing
    if (imageUrl) {
      const result = await processProductImage(imageUrl, googleApiKey);
      return NextResponse.json(result);
    }

    // Batch processing
    if (imageUrls && Array.isArray(imageUrls)) {
      if (imageUrls.length > 20) {
        return NextResponse.json({ 
          error: 'Maximum 20 images per batch' 
        }, { status: 400 });
      }

      const results = await processProductImages(imageUrls, googleApiKey);
      
      return NextResponse.json({
        success: true,
        results,
        summary: {
          total: results.length,
          withChineseText: results.filter(r => r.chineseTexts.length > 0).length,
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
