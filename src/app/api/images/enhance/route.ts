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
  location: 'top-banner' | 'bottom-banner' | 'overlay';
  importance: 'high' | 'medium' | 'low';
}

interface AnalysisResult {
  hasText: boolean;
  mainTitle?: { chinese: string; english: string };
  features: Array<{ chinese: string; english: string }>;
  recommendation: string;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, productId, mode = 'smart' } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Step 1: Analyze image with Claude Vision
    const analysis = await analyzeImage(imageUrl);
    
    if (!analysis.hasText) {
      return NextResponse.json({ 
        success: true, 
        message: 'No Chinese text detected - image is clean',
        enhancedUrl: imageUrl,
        wasEnhanced: false
      });
    }

    // Step 2: Download and process image
    const enhancedBuffer = await createEnhancedImage(imageUrl, analysis, mode);

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
      wasEnhanced: true,
      analysis: {
        mainTitle: analysis.mainTitle,
        featuresCount: analysis.features.length,
        recommendation: analysis.recommendation
      }
    });

  } catch (error: any) {
    console.error('Image enhancement error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function analyzeImage(imageUrl: string): Promise<AnalysisResult> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'url', url: imageUrl } },
        {
          type: 'text',
          text: `Analyze this product image for Chinese/Asian text.

Extract:
1. Main title/heading (the biggest/most prominent text)
2. Feature bullet points or specifications
3. Any other important text

Return ONLY valid JSON:
{
  "hasText": true/false,
  "mainTitle": { "chinese": "中文标题", "english": "English Title" },
  "features": [
    { "chinese": "特点1", "english": "Feature 1" },
    { "chinese": "特点2", "english": "Feature 2" }
  ],
  "recommendation": "Brief recommendation for this image"
}

Keep translations concise and suitable for product display.
If no Chinese text, return: {"hasText": false, "features": [], "recommendation": "Image is clean"}`
        }
      ]
    }]
  });

  const responseText = (message.content[0] as any).text;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : '{"hasText": false, "features": []}');
  } catch {
    return { hasText: false, features: [], recommendation: 'Could not analyze' };
  }
}

async function createEnhancedImage(
  imageUrl: string, 
  analysis: AnalysisResult,
  mode: string
): Promise<Buffer> {
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

  const overlays: { input: Buffer; top: number; left: number }[] = [];

  // Add top banner with main title if exists
  if (analysis.mainTitle?.english) {
    const topBanner = createBanner(
      analysis.mainTitle.english,
      width,
      'top',
      '#FF6B35' // Jeffy orange
    );
    overlays.push({ input: topBanner.buffer, top: 0, left: 0 });
  }

  // Add bottom banner with features if exists
  if (analysis.features && analysis.features.length > 0) {
    const featureText = analysis.features
      .slice(0, 3) // Max 3 features
      .map(f => f.english)
      .join(' • ');
    
    const bottomBanner = createBanner(
      featureText,
      width,
      'bottom',
      'rgba(0,0,0,0.75)'
    );
    overlays.push({ 
      input: bottomBanner.buffer, 
      top: height - bottomBanner.height, 
      left: 0 
    });
  }

  // Composite overlays
  let result = image;
  if (overlays.length > 0) {
    result = image.composite(overlays);
  }

  return result.jpeg({ quality: 92 }).toBuffer();
}

function createBanner(
  text: string,
  imageWidth: number,
  position: 'top' | 'bottom',
  bgColor: string
): { buffer: Buffer; height: number } {
  // Calculate dimensions
  const padding = 12;
  const fontSize = Math.min(22, Math.max(14, Math.floor(imageWidth / 40)));
  const lineHeight = fontSize * 1.3;
  
  // Word wrap if text is too long
  const maxCharsPerLine = Math.floor(imageWidth / (fontSize * 0.55));
  const lines = wrapText(text, maxCharsPerLine);
  const bannerHeight = Math.ceil(lines.length * lineHeight + padding * 2);

  // Determine colors
  const isOrange = bgColor.includes('FF6B35');
  const textColor = isOrange ? '#FFFFFF' : '#FFFFFF';
  const bgOpacity = isOrange ? '1' : '0.85';

  // Create SVG banner
  const textElements = lines.map((line, i) => {
    const y = padding + (i + 0.8) * lineHeight;
    return `<text x="${imageWidth/2}" y="${y}" 
              font-family="Arial, Helvetica, sans-serif" 
              font-size="${fontSize}" 
              fill="${textColor}" 
              text-anchor="middle" 
              font-weight="600">${escapeXml(line)}</text>`;
  }).join('\n');

  const svg = `
    <svg width="${imageWidth}" height="${bannerHeight}">
      <defs>
        <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          ${position === 'top' 
            ? `<stop offset="0%" style="stop-color:${bgColor};stop-opacity:${bgOpacity}"/>
               <stop offset="100%" style="stop-color:${bgColor};stop-opacity:${Number(bgOpacity) * 0.9}"/>`
            : `<stop offset="0%" style="stop-color:${bgColor};stop-opacity:${Number(bgOpacity) * 0.9}"/>
               <stop offset="100%" style="stop-color:${bgColor};stop-opacity:${bgOpacity}"/>`
          }
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${imageWidth}" height="${bannerHeight}" fill="url(#bannerGrad)"/>
      ${textElements}
    </svg>
  `;

  return {
    buffer: Buffer.from(svg),
    height: bannerHeight
  };
}

function wrapText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  return lines.slice(0, 3); // Max 3 lines
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
