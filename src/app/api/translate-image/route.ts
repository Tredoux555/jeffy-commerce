/**
 * API Route: Analyze Chinese Product Images
 * POST /api/translate-image
 * 
 * Uses Claude Vision to detect and translate Chinese text in product images.
 * Helps identify which images are "clean" (no Chinese) for SA market.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  console.log('[translate-image] === START (Claude Vision) ===');
  
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();
    let imageUrl: string = '';
    let imageBase64: string = '';
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
    
    const contentType = request.headers.get('content-type') || '';
    console.log('[translate-image] Content-Type:', contentType);

    const clonedRequest = request.clone();
    
    // Try FormData first (file upload)
    try {
      const formData = await request.formData();
      const imageFile = formData.get('image') as File | null;
      
      if (imageFile && imageFile.size > 0) {
        console.log('[translate-image] Got file:', imageFile.name, 'size:', imageFile.size);
        
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'File must be an image' },
            { status: 400 }
          );
        }

        // Convert to base64 for Claude
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageBase64 = buffer.toString('base64');
        mediaType = imageFile.type as typeof mediaType;
        
        // Also upload to storage for reference
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `analyzed/${Date.now()}_${safeName}`;
        
        await supabase.storage
          .from('translated-images')
          .upload(filename, buffer, {
            contentType: imageFile.type,
            upsert: true,
          });

        const { data: urlData } = supabase.storage
          .from('translated-images')
          .getPublicUrl(filename);
        
        imageUrl = urlData.publicUrl;
      }
    } catch (formError) {
      console.log('[translate-image] Not form data, trying JSON...');
    }

    // Try JSON (URL)
    if (!imageBase64) {
      try {
        const body = await clonedRequest.json();
        if (body.imageUrl) {
          imageUrl = body.imageUrl;
          console.log('[translate-image] Got URL from JSON:', imageUrl);
          
          // Fetch image and convert to base64
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          imageBase64 = Buffer.from(imageBuffer).toString('base64');
          
          const contentTypeHeader = imageResponse.headers.get('content-type') || 'image/jpeg';
          if (contentTypeHeader.includes('png')) mediaType = 'image/png';
          else if (contentTypeHeader.includes('gif')) mediaType = 'image/gif';
          else if (contentTypeHeader.includes('webp')) mediaType = 'image/webp';
        }
      } catch (jsonError) {
        console.log('[translate-image] Not JSON either');
      }
    }

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Call Claude Vision
    console.log('[translate-image] Calling Claude Vision...');
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analyze this product image for Chinese text.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "has_chinese": true/false,
  "chinese_texts": [
    {
      "original": "the Chinese text exactly as shown",
      "translation": "English translation",
      "location": "where in image (e.g., top banner, product label, watermark)"
    }
  ],
  "recommendation": "CLEAN" or "HAS_CHINESE" or "MINOR_CHINESE",
  "summary": "Brief description of what text was found and recommendation for SA market"
}

Rules:
- "CLEAN" = No Chinese text, safe to use
- "MINOR_CHINESE" = Small Chinese text (watermark, tiny label) that might be acceptable
- "HAS_CHINESE" = Prominent Chinese text that should be avoided for SA market
- Only include actual Chinese characters, not English text
- If no Chinese found, return empty chinese_texts array

Return ONLY the JSON, no other text.`,
            },
          ],
        },
      ],
    });

    // Parse Claude's response
    const claudeText = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log('[translate-image] Claude response:', claudeText.slice(0, 500));
    
    let analysis;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = claudeText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('[translate-image] Parse error:', parseError);
      analysis = {
        has_chinese: false,
        chinese_texts: [],
        recommendation: 'UNKNOWN',
        summary: 'Could not analyze image',
        raw_response: claudeText,
      };
    }

    console.log('[translate-image] === SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      original_image_url: imageUrl,
      analysis: analysis,
      has_chinese: analysis.has_chinese,
      recommendation: analysis.recommendation,
      chinese_texts: analysis.chinese_texts || [],
      summary: analysis.summary,
    });

  } catch (error) {
    console.error('[translate-image] Error:', error);
    return NextResponse.json({
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
