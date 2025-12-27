import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TextRegion {
  chineseText: string;
  englishText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, productId } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Step 1: Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const imgWidth = metadata.width || 800;
    const imgHeight = metadata.height || 800;

    // Step 2: Use Claude Vision to detect text regions
    const base64Image = imageBuffer.toString('base64');
    const mimeType = metadata.format === 'png' ? 'image/png' : 'image/jpeg';

    const analysisMessage = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: base64Image }
          },
          {
            type: 'text',
            text: `Analyze this product image (${imgWidth}x${imgHeight} pixels).
Find ALL Chinese/Asian text that should be replaced with English.

Return ONLY a JSON array (no markdown):
[
  {
    "chineseText": "original chinese text",
    "englishText": "English translation",
    "x": estimated x position (0-${imgWidth}),
    "y": estimated y position (0-${imgHeight}),
    "width": estimated text width in pixels,
    "height": estimated text height in pixels,
    "backgroundColor": "hex color behind text like #ffffff",
    "textColor": "hex color of text like #000000"
  }
]

Be precise with coordinates. If no Chinese text found, return []`
          }
        ]
      }]
    });

    let textRegions: TextRegion[] = [];
    try {
      const responseText = (analysisMessage.content[0] as any).text;
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      textRegions = JSON.parse(jsonMatch ? jsonMatch[0] : '[]');
    } catch {
      textRegions = [];
    }

    if (textRegions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No Chinese text found to replace',
        originalUrl: imageUrl,
        newUrl: imageUrl
      });
    }

    // Step 3: Create SVG overlay with text replacements
    const svgParts: string[] = [];
    
    for (const region of textRegions) {
      // Add background rectangle to cover Chinese text
      svgParts.push(`
        <rect 
          x="${region.x}" 
          y="${region.y}" 
          width="${region.width}" 
          height="${region.height}" 
          fill="${region.backgroundColor || '#ffffff'}"
        />
      `);
      
      // Add English text
      const fontSize = Math.max(12, Math.min(region.height * 0.7, 32));
      svgParts.push(`
        <text 
          x="${region.x + region.width / 2}" 
          y="${region.y + region.height / 2 + fontSize / 3}" 
          font-family="Arial, sans-serif"
          font-size="${fontSize}"
          font-weight="bold"
          fill="${region.textColor || '#000000'}"
          text-anchor="middle"
        >${escapeXml(region.englishText)}</text>
      `);
    }

    const svgOverlay = `
      <svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
        ${svgParts.join('')}
      </svg>
    `;

    // Step 4: Composite the overlay onto the image
    const processedBuffer = await sharp(imageBuffer)
      .composite([{
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      }])
      .jpeg({ quality: 90 })
      .toBuffer();

    // Step 5: Upload to Supabase Storage
    const timestamp = Date.now();
    const fileName = `${productId || 'product'}_enhanced_${timestamp}.jpg`;
    const filePath = `products/enhanced/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, processedBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      message: `Replaced ${textRegions.length} text regions`,
      originalUrl: imageUrl,
      newUrl: urlData?.publicUrl,
      replacements: textRegions.map(r => ({
        chinese: r.chineseText,
        english: r.englishText
      }))
    });

  } catch (error: any) {
    console.error('Image text replacement error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
