import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TextRegion {
  chinese: string;
  english: string;
  position: 'top' | 'bottom' | 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  bgColor: string;
  textColor: string;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, productId } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Step 1: Analyze image with Claude Vision
    const analysis = await analyzeImageForEnhancement(imageUrl);
    
    if (!analysis.textRegions || analysis.textRegions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No text to replace',
        enhancedUrl: imageUrl 
      });
    }

    // Step 2: Download and process image
    const enhancedBuffer = await enhanceImage(imageUrl, analysis.textRegions);

    // Step 3: Upload to Supabase
    const timestamp = Date.now();
    const fileName = `enhanced_${productId || 'img'}_${timestamp}.jpg`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, enhancedBuffer, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      enhancedUrl: urlData?.publicUrl,
      textReplaced: analysis.textRegions.length,
      translations: analysis.textRegions.map((r: TextRegion) => ({
        chinese: r.chinese,
        english: r.english
      }))
    });

  } catch (error: any) {
    console.error('Image enhancement error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function analyzeImageForEnhancement(imageUrl: string): Promise<{ textRegions: TextRegion[] }> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'url', url: imageUrl } },
        {
          type: 'text',
          text: `Analyze this product image for Chinese/Asian text that should be translated to English.

For EACH text region found, provide:
1. The Chinese text exactly as shown
2. English translation
3. Position on image: "top", "bottom", "center", "top-left", "top-right", "bottom-left", "bottom-right"
4. Background color behind text (hex code like #FFFFFF)
5. Text color (hex code)

Return ONLY a JSON object:
{
  "textRegions": [
    {
      "chinese": "原文",
      "english": "Translation",
      "position": "top",
      "bgColor": "#000000",
      "textColor": "#FFFFFF"
    }
  ]
}

If no Chinese text found, return: {"textRegions": []}`
        }
      ]
    }]
  });

  const responseText = (message.content[0] as any).text;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : '{"textRegions": []}');
  } catch {
    return { textRegions: [] };
  }
}

async function enhanceImage(imageUrl: string, textRegions: TextRegion[]): Promise<Buffer> {
  // Download the image
  const response = await fetch(imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'image/*'
    }
  });
  
  if (!response.ok) throw new Error('Failed to download image');
  
  const imageBuffer = Buffer.from(await response.arrayBuffer());
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 800;

  // Create SVG overlays for each text region
  const svgOverlays: { input: Buffer; top: number; left: number }[] = [];

  for (const region of textRegions) {
    const overlay = createTextOverlay(region, width, height);
    if (overlay) {
      svgOverlays.push(overlay);
    }
  }

  // Composite all overlays onto the image
  let result = image;
  if (svgOverlays.length > 0) {
    result = image.composite(svgOverlays);
  }

  return result.jpeg({ quality: 90 }).toBuffer();
}

function createTextOverlay(
  region: TextRegion, 
  imgWidth: number, 
  imgHeight: number
): { input: Buffer; top: number; left: number } | null {
  const padding = 10;
  const fontSize = Math.min(24, Math.floor(imgWidth / 25));
  const boxHeight = fontSize + padding * 2;
  const boxWidth = Math.min(imgWidth - 40, region.english.length * fontSize * 0.6 + padding * 2);
  
  // Calculate position
  let top = 0;
  let left = Math.floor((imgWidth - boxWidth) / 2);
  
  switch (region.position) {
    case 'top':
    case 'top-left':
    case 'top-right':
      top = 20;
      break;
    case 'bottom':
    case 'bottom-left':
    case 'bottom-right':
      top = imgHeight - boxHeight - 20;
      break;
    case 'center':
    default:
      top = Math.floor((imgHeight - boxHeight) / 2);
  }

  if (region.position.includes('left')) left = 20;
  if (region.position.includes('right')) left = imgWidth - boxWidth - 20;

  // Create SVG with background and text
  const bgColor = region.bgColor || '#000000';
  const textColor = getContrastColor(bgColor);
  
  const svg = `
    <svg width="${boxWidth}" height="${boxHeight}">
      <rect x="0" y="0" width="${boxWidth}" height="${boxHeight}" 
            fill="${bgColor}" fill-opacity="0.85" rx="4"/>
      <text x="${boxWidth/2}" y="${boxHeight/2 + fontSize/3}" 
            font-family="Arial, sans-serif" font-size="${fontSize}" 
            fill="${textColor}" text-anchor="middle" font-weight="bold">
        ${escapeXml(region.english)}
      </text>
    </svg>
  `;

  return {
    input: Buffer.from(svg),
    top: Math.max(0, top),
    left: Math.max(0, left)
  };
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
