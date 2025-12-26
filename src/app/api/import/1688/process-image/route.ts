import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import Replicate from 'replicate';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

// POST - Process product image
export async function POST(request: NextRequest) {
  try {
    const { imageUrl, action } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'Image URL required' }, { status: 400 });
    }

    switch (action) {
      case 'analyze':
        const analysis = await analyzeImage(imageUrl);
        return NextResponse.json({ success: true, analysis });

      case 'remove-text':
        const cleanedUrl = await removeTextFromImage(imageUrl);
        return NextResponse.json({ success: true, cleanedImageUrl: cleanedUrl });

      case 'full-process':
        const result = await fullImageProcess(imageUrl);
        return NextResponse.json({ success: true, ...result });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Image processing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Processing failed' 
    }, { status: 500 });
  }
}

// Analyze image with Claude Vision
async function analyzeImage(imageUrl: string) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: imageUrl } },
          {
            type: 'text',
            text: `Analyze this product image:

1. Find ALL Chinese text visible
2. Translate each piece to English
3. Note text locations (percentage from top-left)
4. Rate quality for e-commerce (1-10)
5. Should text be removed?

Look for: titles, features, prices, promos, watermarks, brand names

JSON only:
{
  "chineseText": "All Chinese text | separated",
  "englishTranslation": "All translations",
  "textLocations": [
    {"text": "中文", "translation": "English", "percentX": 50, "percentY": 10, "size": "large"}
  ],
  "qualityScore": 8,
  "needsTextRemoval": true,
  "recommendation": "Remove overlays, keep product",
  "productDescription": "What the product is"
}`
          }
        ]
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Analysis failed:', e);
  }

  return { chineseText: '', englishTranslation: '', qualityScore: 5, needsTextRemoval: false };
}

// Remove text using Replicate's inpainting
async function removeTextFromImage(imageUrl: string): Promise<string> {
  try {
    // Use SDXL inpainting for text removal
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          image: imageUrl,
          prompt: "clean product photo, plain background, no text, no watermarks, professional product photography, studio lighting",
          negative_prompt: "text, words, letters, chinese, characters, watermark, logo, stamp, blurry, low quality",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          strength: 0.75
        }
      }
    );

    if (Array.isArray(output) && output.length > 0) {
      return output[0] as string;
    }
    return imageUrl;
  } catch (e) {
    console.error('Text removal failed:', e);
    return imageUrl;
  }
}

// Remove background for clean product shots
async function removeBackground(imageUrl: string): Promise<string> {
  try {
    const output = await replicate.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      {
        input: { image: imageUrl }
      }
    );

    if (typeof output === 'string') return output;
    return imageUrl;
  } catch (e) {
    console.error('Background removal failed:', e);
    return imageUrl;
  }
}

// Upscale and enhance image quality
async function enhanceImage(imageUrl: string): Promise<string> {
  try {
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      {
        input: {
          image: imageUrl,
          scale: 2,
          face_enhance: false
        }
      }
    );

    if (typeof output === 'string') return output;
    return imageUrl;
  } catch (e) {
    console.error('Enhancement failed:', e);
    return imageUrl;
  }
}

// Full processing pipeline
async function fullImageProcess(imageUrl: string) {
  console.log('🔍 Step 1: Analyzing image...');
  const analysis = await analyzeImage(imageUrl);
  
  let processedUrl = imageUrl;
  
  // Step 2: Remove text if needed
  if (analysis.needsTextRemoval) {
    console.log('🧹 Step 2: Removing Chinese text...');
    processedUrl = await removeTextFromImage(imageUrl);
  }
  
  // Step 3: Optional - remove background for cleaner look
  // console.log('✂️ Step 3: Removing background...');
  // processedUrl = await removeBackground(processedUrl);
  
  // Step 4: Enhance quality
  console.log('✨ Step 3: Enhancing quality...');
  const finalUrl = await enhanceImage(processedUrl);

  return {
    originalUrl: imageUrl,
    processedUrl: finalUrl,
    analysis: analysis,
    textRemoved: analysis.needsTextRemoval,
    translatedText: analysis.englishTranslation,
    chineseTextFound: analysis.chineseText
  };
}

// GET - Check API status
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Image processing API ready',
    capabilities: {
      ocr: !!process.env.ANTHROPIC_API_KEY,
      textRemoval: !!process.env.REPLICATE_API_TOKEN,
      backgroundRemoval: !!process.env.REPLICATE_API_TOKEN,
      enhancement: !!process.env.REPLICATE_API_TOKEN
    },
    actions: ['analyze', 'remove-text', 'full-process']
  });
}
