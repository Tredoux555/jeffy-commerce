/**
 * JEFFY IMAGE PROCESSOR
 * Detects Chinese text in 1688 product images and translates to English
 * 
 * Uses:
 * - Google Cloud Vision API for OCR (detect Chinese text)
 * - Google Cloud Translation API for Chinese → English
 * 
 * Cost: ~$0.001 per image
 */

interface TextRegion {
  text: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  translation?: string;
}

interface ProcessResult {
  success: boolean;
  originalUrl: string;
  textFound: TextRegion[];
  chineseTexts: string[];
  translations: { original: string; translated: string }[];
  error?: string;
}

// Check if text contains Chinese characters
function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);
}

// Google Cloud Vision API - Detect text in image
async function detectText(imageUrl: string, apiKey: string): Promise<TextRegion[]> {
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { source: { imageUri: imageUrl } },
          features: [{ type: 'TEXT_DETECTION', maxResults: 50 }],
          imageContext: {
            languageHints: ['zh-CN', 'zh-TW', 'en']
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
      }
    };
  });
}

// Google Translate API - Translate Chinese to English
async function translateTexts(texts: string[], apiKey: string): Promise<{ original: string; translated: string }[]> {
  if (texts.length === 0) return [];
  
  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: texts,
          source: 'zh',
          target: 'en',
          format: 'text'
        })
      }
    );
    
    const data = await response.json() as any;
    const translations = data.data?.translations || [];
    
    return texts.map((original, i) => ({
      original,
      translated: translations[i]?.translatedText || original
    }));
  } catch (error) {
    console.error('Translation error:', error);
    return texts.map(t => ({ original: t, translated: t }));
  }
}

// Main processing function
export async function processProductImage(
  imageUrl: string,
  googleApiKey: string
): Promise<ProcessResult> {
  try {
    // 1. Detect text using Google Vision
    const textRegions = await detectText(imageUrl, googleApiKey);
    
    // 2. Filter Chinese text only
    const chineseRegions = textRegions.filter(r => containsChinese(r.text));
    const chineseTexts = [...new Set(chineseRegions.map(r => r.text))]; // Unique texts
    
    if (chineseTexts.length === 0) {
      return {
        success: true,
        originalUrl: imageUrl,
        textFound: textRegions,
        chineseTexts: [],
        translations: []
      };
    }
    
    // 3. Translate Chinese text
    const translations = await translateTexts(chineseTexts, googleApiKey);
    
    // 4. Add translations to regions
    const regionsWithTranslations = textRegions.map(region => {
      if (containsChinese(region.text)) {
        const translation = translations.find(t => t.original === region.text);
        return { ...region, translation: translation?.translated };
      }
      return region;
    });
    
    return {
      success: true,
      originalUrl: imageUrl,
      textFound: regionsWithTranslations,
      chineseTexts,
      translations
    };
    
  } catch (error) {
    return {
      success: false,
      originalUrl: imageUrl,
      textFound: [],
      chineseTexts: [],
      translations: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Batch process multiple images
export async function processProductImages(
  imageUrls: string[],
  googleApiKey: string
): Promise<ProcessResult[]> {
  const results: ProcessResult[] = [];
  
  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(url => processProductImage(url, googleApiKey))
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
