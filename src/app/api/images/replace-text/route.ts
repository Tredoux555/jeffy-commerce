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
  position: 'top' | 'center' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'large' | 'medium' | 'small';
  percentY: number; // 0-100 vertical position
  percentX: number; // 0-100 horizontal position  
  percentWidth: number; // estimated width as % of image
  percentHeight: number; // estimated height as % of image
  bgColor: string; // detected background color for matching
}

interface AnalysisResult {
  hasText: boolean;
  regions: TextRegion[];
  overallRecommendation: string;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, productId } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Step 1: Analyze image with Claude Vision - get text positions
    const analysis = await analyzeImageForReplacement(imageUrl);
    
    if (!analysis.hasText || analysis.regions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No Chinese text detected - image is clean',
        enhancedUrl: imageUrl,
        wasEnhanced: false
      });
    }

    // Step 2: Download and process image - REPLACE text
    const enhancedBuffer = await replaceTextInImage(imageUrl, analysis.regions);

    // Step 3: Upload to Supabase
    const timestamp = Date.now();
    const fileName = `replaced_${productId || 'img'}_${timestamp}.jpg`;
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
      wasEnhanced: true,
      regionsReplaced: analysis.regions.length,
      regions: analysis.regions.map(r => ({
        original: r.chinese,
        translated: r.english,
        position: r.position
      }))
    });

  } catch (error: any) {
    console.error('Image text replacement error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function analyzeImageForReplacement(imageUrl: string): Promise<AnalysisResult> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'url', url: imageUrl } },
        {
          type: 'text',
          text: `Analyze this product image for Chinese/Asian text that needs to be replaced with English.

For EACH text region found, identify:
1. The Chinese text content
2. English translation (concise, product-appropriate)
3. Position in image (estimate as percentage from top-left)
4. Size relative to image
5. Background color behind the text (for seamless replacement)

Return ONLY valid JSON:
{
  "hasText": true,
  "regions": [
    {
      "chinese": "中文文字",
      "english": "English Text",
      "position": "top",
      "size": "large",
      "percentY": 10,
      "percentX": 50,
      "percentWidth": 80,
      "percentHeight": 8,
      "bgColor": "#FF6B35"
    }
  ],
  "overallRecommendation": "Brief note"
}

Position values:
- percentY: 0=top, 50=middle, 100=bottom
- percentX: 0=left, 50=center, 100=right
- percentWidth/Height: approximate size as % of image

bgColor: Use hex color that matches the background behind the text (e.g., "#FFFFFF" for white, "#000000" for black, "#FF6B35" for orange, etc.)

If no Chinese/Asian text found, return: {"hasText": false, "regions": [], "overallRecommendation": "Clean image"}`
        }
      ]
    }]
  });

  const responseText = (message.content[0] as any).text;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : '{"hasText": false, "regions": []}');
  } catch {
    return { hasText: false, regions: [], overallRecommendation: 'Could not analyze' };
  }
}

async function replaceTextInImage(imageUrl: string, regions: TextRegion[]): Promise<Buffer> {
  // Download the image
  const response = await fetch(imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'image/*',
      'Referer': 'https://www.1688.com/'
    }
  });
  
  if (!response.ok) throw new Error('Failed to download image');
  
  const imageBuffer = Buffer.from(await response.arrayBuffer());
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 800;

  // Create overlay SVG with all text replacements
  const svgParts: string[] = [];
  
  for (const region of regions) {
    // Calculate pixel positions from percentages
    const x = Math.round((region.percentX / 100) * width);
    const y = Math.round((region.percentY / 100) * height);
    const boxWidth = Math.round((region.percentWidth / 100) * width);
    const boxHeight = Math.round((region.percentHeight / 100) * height);
    
    // Determine font size based on region size
    let fontSize: number;
    switch (region.size) {
      case 'large': fontSize = Math.min(32, Math.max(18, boxHeight * 0.6)); break;
      case 'medium': fontSize = Math.min(24, Math.max(14, boxHeight * 0.6)); break;
      default: fontSize = Math.min(18, Math.max(10, boxHeight * 0.6));
    }

    // Determine text color based on background
    const textColor = isLightColor(region.bgColor) ? '#000000' : '#FFFFFF';
    
    // Calculate box position (centered on the coordinates)
    const boxX = Math.max(0, x - boxWidth / 2);
    const boxY = Math.max(0, y - boxHeight / 2);
    
    // Add padding to cover text fully
    const padding = 4;
    const paddedWidth = boxWidth + padding * 2;
    const paddedHeight = boxHeight + padding * 2;
    const paddedX = Math.max(0, boxX - padding);
    const paddedY = Math.max(0, boxY - padding);

    // Create background rectangle to cover Chinese text
    svgParts.push(`
      <rect 
        x="${paddedX}" 
        y="${paddedY}" 
        width="${paddedWidth}" 
        height="${paddedHeight}" 
        fill="${region.bgColor}"
        rx="2"
      />
    `);

    // Add English text centered in the box
    svgParts.push(`
      <text 
        x="${x}" 
        y="${y + fontSize * 0.35}" 
        font-family="Arial, Helvetica, sans-serif" 
        font-size="${fontSize}" 
        fill="${textColor}" 
        text-anchor="middle" 
        font-weight="bold"
      >${escapeXml(region.english)}</text>
    `);
  }

  // Create complete SVG overlay
  const overlaySvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${svgParts.join('\n')}
    </svg>
  `;

  // Composite the overlay onto the image
  const result = await image
    .composite([{
      input: Buffer.from(overlaySvg),
      top: 0,
      left: 0
    }])
    .jpeg({ quality: 92 })
    .toBuffer();

  return result;
}

function isLightColor(hexColor: string): boolean {
  // Convert hex to RGB and calculate luminance
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
