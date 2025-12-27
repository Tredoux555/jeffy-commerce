import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TextRegion {
  chinese: string;
  english: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  color: string;
  backgroundColor: string;
  fontSize: 'small' | 'medium' | 'large';
  style: 'bold' | 'normal';
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, productId } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Step 1: Analyze image for text regions with Claude Vision
    const analysis = await analyzeImageForText(imageUrl);
    
    if (!analysis.regions || analysis.regions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No Chinese text found to replace',
        originalUrl: imageUrl,
        enhancedUrl: imageUrl
      });
    }

    // Step 2: Fetch and modify image
    const enhancedBuffer = await modifyImage(imageUrl, analysis.regions);

    // Step 3: Upload to Supabase
    const timestamp = Date.now();
    const fileName = `enhanced_${productId || 'img'}_${timestamp}.png`;
    const filePath = `products/enhanced/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, enhancedBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      originalUrl: imageUrl,
      enhancedUrl: urlData?.publicUrl,
      regionsModified: analysis.regions.length,
      translations: analysis.regions.map((r: TextRegion) => ({
        chinese: r.chinese,
        english: r.english,
        position: r.position
      }))
    });

  } catch (error: any) {
    console.error('Image enhancement error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function analyzeImageForText(imageUrl: string): Promise<{ regions: TextRegion[] }> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'url', url: imageUrl } },
        { type: 'text', text: `Analyze this product image and identify ALL Chinese/Asian text that should be translated to English.

For each text region, return a JSON array with:
{
  "regions": [
    {
      "chinese": "原文",
      "english": "Translation",
      "position": "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right",
      "color": "#FFFFFF" (hex color of the text),
      "backgroundColor": "#000000" (hex color behind text, or "transparent"),
      "fontSize": "small" | "medium" | "large",
      "style": "bold" | "normal"
    }
  ]
}

Be precise about position. Look at where text appears in the image grid (divide image into 3x3 grid).
Match colors as closely as possible to original.
Only include actual Chinese/Asian text, not product details or english text.
Return ONLY valid JSON, no markdown or explanation.` }
      ]
    }]
  });

  const responseText = (message.content[0] as any).text;
  
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : '{"regions":[]}');
  } catch {
    return { regions: [] };
  }
}

async function modifyImage(imageUrl: string, regions: TextRegion[]): Promise<Buffer> {
  // Fetch original image
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Load image into canvas
  const image = await loadImage(buffer);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  
  // Draw original image
  ctx.drawImage(image, 0, 0);
  
  // Process each text region
  for (const region of regions) {
    const coords = getPositionCoords(region.position, image.width, image.height, region.fontSize);
    
    // Calculate text metrics for background
    const fontSize = region.fontSize === 'large' ? 28 : region.fontSize === 'medium' ? 20 : 14;
    ctx.font = `${region.style === 'bold' ? 'bold ' : ''}${fontSize}px Arial, sans-serif`;
    const metrics = ctx.measureText(region.english);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2;
    
    // Draw background rectangle (cover Chinese text)
    if (region.backgroundColor && region.backgroundColor !== 'transparent') {
      ctx.fillStyle = region.backgroundColor;
      const padding = 8;
      ctx.fillRect(
        coords.x - padding,
        coords.y - textHeight - padding/2,
        textWidth + padding * 2,
        textHeight + padding
      );
    }
    
    // Draw English text
    ctx.fillStyle = region.color || '#FFFFFF';
    ctx.font = `${region.style === 'bold' ? 'bold ' : ''}${fontSize}px Arial, sans-serif`;
    
    // Add text shadow for readability
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillText(region.english, coords.x, coords.y);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
  
  return canvas.toBuffer('image/png');
}

function getPositionCoords(
  position: string, 
  width: number, 
  height: number, 
  fontSize: 'small' | 'medium' | 'large'
): { x: number; y: number } {
  const padding = 20;
  const verticalOffset = fontSize === 'large' ? 40 : fontSize === 'medium' ? 30 : 20;
  
  const positions: Record<string, { x: number; y: number }> = {
    'top-left': { x: padding, y: verticalOffset },
    'top-center': { x: width / 2, y: verticalOffset },
    'top-right': { x: width - padding - 100, y: verticalOffset },
    'center-left': { x: padding, y: height / 2 },
    'center': { x: width / 2, y: height / 2 },
    'center-right': { x: width - padding - 100, y: height / 2 },
    'bottom-left': { x: padding, y: height - padding },
    'bottom-center': { x: width / 2, y: height - padding },
    'bottom-right': { x: width - padding - 100, y: height - padding }
  };
  
  return positions[position] || positions['center'];
}
