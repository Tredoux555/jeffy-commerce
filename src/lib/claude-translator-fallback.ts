/**
 * Fallback Image Translator using Claude Vision API
 * 
 * This is a backup approach that uses:
 * 1. Claude Vision to extract and translate Chinese text
 * 2. Sharp to remove original text and render English
 * 
 * Use when Alibaba API is unavailable or for testing
 */

import Anthropic from '@anthropic-ai/sdk';

export interface TextRegion {
  original: string;
  translated: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fontSize?: number;
  color?: string;
}

export interface ClaudeTranslationResult {
  success: boolean;
  regions?: TextRegion[];
  error?: string;
}

/**
 * Use Claude Vision to extract Chinese text and provide translations
 * Returns structured data about text regions for downstream processing
 */
export async function extractAndTranslateWithClaude(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<ClaudeTranslationResult> {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
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
              text: `Analyze this product image and extract ALL Chinese text visible in it.

For each text region found, provide:
1. The original Chinese text
2. A natural English translation suitable for e-commerce (not literal)
3. Approximate position (describe as percentage from top-left: x%, y%)
4. Approximate size (small/medium/large relative to image)

IMPORTANT: Translate for South African e-commerce audience. Make product descriptions appealing and clear.

Respond in this exact JSON format:
{
  "regions": [
    {
      "original": "中文文字",
      "translated": "English text",
      "position": { "x_percent": 10, "y_percent": 20 },
      "size": "medium",
      "type": "title|description|spec|badge|other"
    }
  ],
  "dominant_colors": ["#FFFFFF", "#000000"],
  "has_logo": true,
  "product_category": "electronics|clothing|home|beauty|other"
}

Return ONLY valid JSON, no other text.`,
            },
          ],
        },
      ],
    });

    // Parse Claude's response
    const content = response.content[0];
    if (content.type !== 'text') {
      return { success: false, error: 'Unexpected response type' };
    }

    // Clean the response - remove markdown code blocks if present
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }

    const parsed = JSON.parse(jsonText);

    // Transform to our TextRegion format
    const regions: TextRegion[] = parsed.regions.map((r: any) => ({
      original: r.original,
      translated: r.translated,
      bbox: {
        x: r.position.x_percent,
        y: r.position.y_percent,
        width: r.size === 'large' ? 40 : r.size === 'medium' ? 25 : 15,
        height: r.size === 'large' ? 10 : r.size === 'medium' ? 6 : 4,
      },
      fontSize: r.size === 'large' ? 48 : r.size === 'medium' ? 32 : 24,
      color: parsed.dominant_colors?.[1] || '#000000', // Use secondary color for contrast
    }));

    return {
      success: true,
      regions,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Simple text overlay using Sharp
 * Creates a new image with translated text overlaid
 * 
 * Note: This is a basic implementation. For production,
 * you'd want proper inpainting to remove original text first.
 */
export async function overlayTranslatedText(
  imageBuffer: Buffer,
  regions: TextRegion[]
): Promise<Buffer> {
  // Dynamic import for Sharp (it's a native module)
  const sharp = (await import('sharp')).default;
  
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  
  const width = metadata.width || 800;
  const height = metadata.height || 600;

  // Build SVG overlay with semi-transparent backgrounds and translated text
  const textElements = regions.map(region => {
    const x = (region.bbox.x / 100) * width;
    const y = (region.bbox.y / 100) * height;
    const boxWidth = (region.bbox.width / 100) * width;
    const boxHeight = (region.bbox.height / 100) * height;
    const fontSize = region.fontSize || 24;

    return `
      <!-- Background box to cover original text -->
      <rect 
        x="${x}" 
        y="${y - fontSize}" 
        width="${boxWidth}" 
        height="${boxHeight + fontSize}"
        fill="white"
        fill-opacity="0.9"
        rx="4"
      />
      <!-- Translated text -->
      <text 
        x="${x + 5}" 
        y="${y}" 
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}px"
        font-weight="bold"
        fill="${region.color || '#000000'}"
      >${escapeXml(region.translated)}</text>
    `;
  }).join('\n');

  const svgOverlay = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${textElements}
    </svg>
  `;

  // Composite the SVG overlay onto the original image
  const result = await image
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();

  return result;
}

// Helper to escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Full fallback translation pipeline
 * Uses Claude for OCR+Translation, Sharp for rendering
 */
export async function translateImageWithClaude(
  imageBuffer: Buffer,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<{ success: boolean; resultBuffer?: Buffer; regions?: TextRegion[]; error?: string }> {
  // Step 1: Extract and translate with Claude
  const base64 = imageBuffer.toString('base64');
  const extraction = await extractAndTranslateWithClaude(base64, mediaType);
  
  if (!extraction.success || !extraction.regions) {
    return { 
      success: false, 
      error: extraction.error || 'Failed to extract text' 
    };
  }

  // If no Chinese text found, return original
  if (extraction.regions.length === 0) {
    return {
      success: true,
      resultBuffer: imageBuffer,
      regions: [],
    };
  }

  // Step 2: Overlay translated text
  try {
    const resultBuffer = await overlayTranslatedText(imageBuffer, extraction.regions);
    return {
      success: true,
      resultBuffer,
      regions: extraction.regions,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to render translation',
    };
  }
}

