import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Image processing endpoint - reads Chinese, can remove/translate text
export async function POST(request: NextRequest) {
  try {
    const { imageUrl, action = 'analyze' } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'Image URL required' }, { status: 400 });
    }

    // Step 1: Analyze image with Claude Vision - find all text
    const analysis = await analyzeImageText(imageUrl);

    // Step 2: Based on action, process the image
    let result;
    switch (action) {
      case 'analyze':
        // Just return the analysis
        result = { analysis };
        break;
        
      case 'remove-text':
        // Use AI to remove text overlays
        result = await removeTextFromImage(imageUrl, analysis);
        break;
        
      case 'translate-text':
        // Get translations for text found
        result = { 
          analysis,
          translations: analysis.textElements.map((t: any) => ({
            original: t.text,
            translated: t.translation,
            position: t.position
          }))
        };
        break;
        
      default:
        result = { analysis };
    }

    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    console.error('Image processing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// Detailed image text analysis with Claude Vision
async function analyzeImageText(imageUrl: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'url', url: imageUrl }
        },
        {
          type: 'text',
          text: `You are an expert at analyzing product images for e-commerce.

Analyze this image and identify ALL text visible:

1. Find every piece of Chinese text
2. Find every piece of English text  
3. Note the approximate position (top-left, center, bottom, etc.)
4. Translate Chinese text to English
5. Categorize each text element:
   - "brand" (logo, brand name)
   - "promo" (sale text, discounts, marketing)
   - "spec" (specifications, measurements)
   - "watermark" (website watermarks)
   - "info" (product info, features)

6. For each text, recommend: "keep", "remove", or "translate"
   - Remove: watermarks, Chinese promo text, cluttered overlays
   - Keep: brand names (if relevant), important specs
   - Translate: product info that adds value

7. Rate overall image quality for e-commerce (1-10)
8. Suggest if image needs cleaning

Respond in JSON:
{
  "textElements": [
    {
      "text": "original text",
      "language": "chinese/english",
      "translation": "english translation if chinese",
      "position": "top-left/center/bottom-right/etc",
      "category": "brand/promo/spec/watermark/info",
      "recommendation": "keep/remove/translate",
      "reason": "why this recommendation"
    }
  ],
  "overallQuality": 8,
  "needsCleaning": true,
  "cleaningNotes": "Remove promotional overlays and watermarks",
  "productVisible": true,
  "backgroundType": "white/lifestyle/studio/cluttered"
}`
        }
      ]
    }]
  });

  const content = response.content[0];
  if (content.type === 'text') {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }

  return { textElements: [], overallQuality: 5, needsCleaning: false };
}

// Remove text from image using AI inpainting
// This uses Replicate's SDXL inpainting or similar service
async function removeTextFromImage(imageUrl: string, analysis: any) {
  // Check if we have Replicate API key for inpainting
  const replicateKey = process.env.REPLICATE_API_KEY;
  
  if (!replicateKey) {
    // Return instructions for manual editing if no API
    return {
      originalUrl: imageUrl,
      processedUrl: null,
      analysis,
      instructions: generateEditingInstructions(analysis),
      message: 'Automatic text removal requires Replicate API. Manual editing instructions provided.'
    };
  }

  try {
    // Use Replicate's LaMa inpainting model (great for text removal)
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'cdac8d4c2d9e3e9d6c7c4d8b3f0e2a4d6c8b0a2c4e6f8a0b2c4d6e8f0a2b4c6', // LaMa model
        input: {
          image: imageUrl,
          mask: 'auto' // Auto-detect text regions
        }
      })
    });

    const prediction = await response.json();
    
    // Poll for result
    let result = prediction;
    while (result.status === 'processing' || result.status === 'starting') {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(result.urls.get, {
        headers: { 'Authorization': `Token ${replicateKey}` }
      });
      result = await pollRes.json();
    }

    if (result.status === 'succeeded') {
      return {
        originalUrl: imageUrl,
        processedUrl: result.output,
        analysis,
        textRemoved: analysis.textElements.filter((t: any) => t.recommendation === 'remove').length
      };
    }
  } catch (e) {
    console.error('Replicate processing failed:', e);
  }

  return {
    originalUrl: imageUrl,
    processedUrl: null,
    analysis,
    instructions: generateEditingInstructions(analysis),
    message: 'Automatic processing failed. Manual editing instructions provided.'
  };
}

// Generate manual editing instructions based on analysis
function generateEditingInstructions(analysis: any) {
  const toRemove = analysis.textElements?.filter((t: any) => t.recommendation === 'remove') || [];
  const toTranslate = analysis.textElements?.filter((t: any) => t.recommendation === 'translate') || [];

  return {
    summary: `Found ${toRemove.length} elements to remove, ${toTranslate.length} to translate`,
    removeList: toRemove.map((t: any) => ({
      text: t.text,
      position: t.position,
      reason: t.reason
    })),
    translateList: toTranslate.map((t: any) => ({
      original: t.text,
      translated: t.translation,
      position: t.position
    })),
    tools: [
      'Photoshop - Content Aware Fill',
      'Canva - Magic Eraser',
      'Remove.bg - Background removal',
      'Cleanup.pictures - Object removal'
    ]
  };
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Image Processing API',
    actions: ['analyze', 'remove-text', 'translate-text'],
    features: [
      'Claude Vision OCR for Chinese/English text',
      'Text position detection',
      'Translation recommendations',
      'AI-powered text removal (requires Replicate API)',
      'Manual editing instructions fallback'
    ]
  });
}
