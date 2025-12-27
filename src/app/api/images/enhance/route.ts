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
  position: string; // 'top', 'bottom', 'center', 'top-left', etc.
  color: string;
  approximate_y_percent: number;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, productId } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Step 1: Fetch the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Step 2: Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 800;

    // Step 3: Ask Claude to identify text regions with positions
    const base64Image = imageBuffer.toString('base64');
    const mediaType = imageUrl.includes('.png') ? 'image/png' : 'image/jpeg';

    const analysisResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64Image }
          },
          {
            type: 'text',
            text: `Analyze this product image. Find ALL Chinese/Asian text and provide:
1. The Chinese text
2. English translation
3. Approximate vertical position as percentage from top (0-100)
4. Text color (hex code or description)
5. Whether it's on a solid background or over the product

Return ONLY a JSON array (no markdown):
[
  {
    "chineseText": "机械结构",
    "englishText": "Mechanical Structure", 
    "y_percent": 15,
    "color": "#FFFFFF",
    "background": "solid_dark" | "solid_light" | "over_product" | "transparent"
  }
]

If no Chinese text found, return empty array: []`
          }
        ]
      }]
    });

    let textRegions: any[] = [];
    try {
      const responseText = (analysisResponse.content[0] as any).text;
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      textRegions = JSON.parse(jsonMatch ? jsonMatch[0] : '[]');
    } catch {
      textRegions = [];
    }

    // Step 4: Create text overlays using SVG
    if (textRegions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No Chinese text found to replace',
        originalUrl: imageUrl,
        enhancedUrl: imageUrl
      });
    }

    // Build SVG overlays for each text region
    const svgOverlays: { input: Buffer; top: number; left: number }[] = [];
    
    for (const region of textRegions) {
      const yPos = Math.round((region.y_percent / 100) * height);
      const fontSize = Math.round(height * 0.04); // 4% of image height
      const padding = 10;
      const textWidth = region.englishText.length * fontSize * 0.6;
      const boxWidth = Math.min(textWidth + padding * 2, width - 20);
      const boxHeight = fontSize + padding * 2;
      
      // Determine colors based on background
      let bgColor = 'rgba(0,0,0,0.7)';
      let textColor = '#FFFFFF';
      if (region.background === 'solid_light' || region.color?.toLowerCase().includes('dark')) {
        bgColor = 'rgba(255,255,255,0.85)';
        textColor = '#000000';
      }

      const svg = `
        <svg width="${boxWidth}" height="${boxHeight}">
          <rect width="100%" height="100%" fill="${bgColor}" rx="4"/>
          <text 
            x="50%" 
            y="50%" 
            font-family="Arial, sans-serif" 
            font-size="${fontSize}px" 
            font-weight="bold"
            fill="${textColor}" 
            text-anchor="middle" 
            dominant-baseline="middle"
          >${escapeXml(region.englishText)}</text>
        </svg>
      `;

      svgOverlays.push({
        input: Buffer.from(svg),
        top: Math.max(0, yPos - boxHeight / 2),
        left: Math.round((width - boxWidth) / 2)
      });
    }

    // Step 5: Composite overlays onto image
    let enhancedImage = sharp(imageBuffer);
    
    if (svgOverlays.length > 0) {
      enhancedImage = enhancedImage.composite(svgOverlays);
    }

    const outputBuffer = await enhancedImage.jpeg({ quality: 90 }).toBuffer();

    // Step 6: Upload to Supabase Storage
    const timestamp = Date.now();
    const fileName = `enhanced_${productId || 'product'}_${timestamp}.jpg`;
    const filePath = `products/enhanced/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, outputBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload enhanced image' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      originalUrl: imageUrl,
      enhancedUrl: urlData?.publicUrl,
      textRegions: textRegions,
      message: `Enhanced image with ${textRegions.length} text translations`
    });

  } catch (error: any) {
    console.error('Image enhance error:', error);
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
