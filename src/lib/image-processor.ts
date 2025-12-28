/**
 * JEFFY IMAGE PROCESSOR
 * Removes Chinese text from 1688 product images and replaces with English
 * 
 * Uses:
 * - Google Cloud Vision API for OCR (detect Chinese text)
 * - Sharp for image manipulation (content-aware fill)
 * - Canvas for English text overlay
 * 
 * Cost: ~$0.001 per image
 */

import sharp from 'sharp';
import { createCanvas, loadImage, registerFont } from 'canvas';
import fetch from 'node-fetch';

interface TextRegion {
  text: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  vertices: { x: number; y: number }[];
}

interface ProcessResult {
  success: boolean;
  originalUrl: string;
  processedBuffer?: Buffer;
  processedUrl?: string;
  textFound: TextRegion[];
  error?: string;
}

// Google Cloud Vision API - Detect text in image
async function detectText(imageBuffer: Buffer, apiKey: string): Promise<TextRegion[]> {
  const base64Image = imageBuffer.toString('base64');
  
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION', maxResults: 50 }],
          imageContext: {
            languageHints: ['zh-CN', 'zh-TW', 'en'] // Chinese simplified, traditional, English
          }
        }]
      })
    }
  );

  const data = await response.json() as any;
  
  if (data.error) {
    throw new Error(`Vision API error: ${data.error.message}`);
  }

  const textAnnotations = data.responses?.[0]?.textAnnotations || [];
  
  // Skip first annotation (full text), process individual words/phrases
  return textAnnotations.slice(1).map((annotation: any) => {
    const vertices = annotation.boundingPoly?.vertices || [];
    const xs = vertices.map((v: any) => v.x || 0);
    const ys = vertices.map((v: any) => v.y || 0);
    
    return {
      text: annotation.description,
      bounds: {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys)
      },
      vertices
    };
  });
}

// Check if text contains Chinese characters
function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);
}

// Simple translation using Google Translate API
async function translateText(text: string, apiKey: string): Promise<string> {
  if (!containsChinese(text)) return text;
  
  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'zh',
          target: 'en',
          format: 'text'
        })
      }
    );
    
    const data = await response.json() as any;
    return data.data?.translations?.[0]?.translatedText || text;
  } catch {
    return text; // Return original if translation fails
  }
}

// Remove text regions by filling with surrounding color (simple approach)
async function removeTextRegions(
  imageBuffer: Buffer, 
  regions: TextRegion[]
): Promise<Buffer> {
  // Get image metadata
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 800;
  
  // Create SVG mask for regions to remove
  const padding = 5; // Extra padding around text
  const rects = regions
    .filter(r => containsChinese(r.text))
    .map(r => 
      `<rect x="${r.bounds.x - padding}" y="${r.bounds.y - padding}" 
            width="${r.bounds.width + padding * 2}" height="${r.bounds.height + padding * 2}" 
            fill="white"/>`
    )
    .join('\n');
  
  if (!rects) {
    // No Chinese text to remove
    return imageBuffer;
  }

  // For simple removal, we'll sample the edge color and fill
  // More sophisticated: use inpainting, but this works for product images
  const processed = await sharp(imageBuffer)
    .composite([{
      input: {
        create: {
          width,
          height,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        }
      },
      blend: 'dest-out'
    }])
    .toBuffer();
  
  // For now, blur the text regions (simple approach)
  // TODO: Implement proper content-aware fill
  let result = sharp(imageBuffer);
  
  for (const region of regions) {
    if (!containsChinese(region.text)) continue;
    
    const { x, y, width: w, height: h } = region.bounds;
    const pad = 3;
    
    // Extract the region, blur heavily, and composite back
    try {
      const blurredRegion = await sharp(imageBuffer)
        .extract({ 
          left: Math.max(0, x - pad), 
          top: Math.max(0, y - pad), 
          width: Math.min(w + pad * 2, width - x + pad), 
          height: Math.min(h + pad * 2, height - y + pad) 
        })
        .blur(15)
        .toBuffer();
      
      result = sharp(await result.toBuffer())
        .composite([{
          input: blurredRegion,
          left: Math.max(0, x - pad),
          top: Math.max(0, y - pad)
        }]);
    } catch {
      // Skip if region extraction fails
    }
  }
  
  return result.toBuffer();
}

// Add English text overlay
async function addEnglishText(
  imageBuffer: Buffer,
  translations: { original: TextRegion; translated: string }[]
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 800;
  
  // Create canvas for text overlay
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Load the processed image
  const img = await loadImage(imageBuffer);
  ctx.drawImage(img, 0, 0);
  
  // Add translated text
  for (const { original, translated } of translations) {
    if (!containsChinese(original.text)) continue;
    if (!translated || translated === original.text) continue;
    
    const { x, y, width: w, height: h } = original.bounds;
    
    // Calculate font size based on region height
    const fontSize = Math.max(12, Math.min(h * 0.8, 24));
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'top';
    
    // Add slight background for readability
    const textMetrics = ctx.measureText(translated);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(x - 2, y - 2, textMetrics.width + 4, h + 4);
    
    // Draw text
    ctx.fillStyle = '#000000';
    ctx.fillText(translated, x, y + (h - fontSize) / 2);
  }
  
  return canvas.toBuffer('image/png');
}

// Main processing function
export async function processProductImage(
  imageUrl: string,
  googleApiKey: string,
  options: {
    removeChineseText?: boolean;
    addEnglishTranslation?: boolean;
    outputFormat?: 'png' | 'jpeg' | 'webp';
  } = {}
): Promise<ProcessResult> {
  const { 
    removeChineseText = true, 
    addEnglishTranslation = true,
    outputFormat = 'png'
  } = options;

  try {
    // 1. Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    let imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // 2. Detect text using Google Vision
    const textRegions = await detectText(imageBuffer, googleApiKey);
    const chineseRegions = textRegions.filter(r => containsChinese(r.text));
    
    if (chineseRegions.length === 0) {
      // No Chinese text found, return original
      return {
        success: true,
        originalUrl: imageUrl,
        processedBuffer: imageBuffer,
        textFound: textRegions
      };
    }
    
    // 3. Translate Chinese text
    const translations: { original: TextRegion; translated: string }[] = [];
    if (addEnglishTranslation) {
      for (const region of chineseRegions) {
        const translated = await translateText(region.text, googleApiKey);
        translations.push({ original: region, translated });
      }
    }
    
    // 4. Remove Chinese text regions
    if (removeChineseText) {
      imageBuffer = await removeTextRegions(imageBuffer, chineseRegions);
    }
    
    // 5. Add English translations
    if (addEnglishTranslation && translations.length > 0) {
      imageBuffer = await addEnglishText(imageBuffer, translations);
    }
    
    // 6. Convert to desired output format
    const finalBuffer = await sharp(imageBuffer)
      .toFormat(outputFormat, { quality: 90 })
      .toBuffer();
    
    return {
      success: true,
      originalUrl: imageUrl,
      processedBuffer: finalBuffer,
      textFound: textRegions
    };
    
  } catch (error) {
    return {
      success: false,
      originalUrl: imageUrl,
      textFound: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Batch process multiple images
export async function processProductImages(
  imageUrls: string[],
  googleApiKey: string,
  options?: Parameters<typeof processProductImage>[2]
): Promise<ProcessResult[]> {
  const results: ProcessResult[] = [];
  
  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(url => processProductImage(url, googleApiKey, options))
    );
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + batchSize < imageUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

export default processProductImage;
