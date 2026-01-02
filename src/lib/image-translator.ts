/**
 * Unified Image Translation Service
 * 
 * Provides a single interface for image translation, automatically
 * selecting the best available method:
 * 
 * 1. Alibaba Qwen-MT-Image (preferred - end-to-end solution)
 * 2. Claude Vision + Sharp (fallback - more manual but works)
 * 
 * Usage:
 *   const result = await translateProductImage(imageUrl);
 *   if (result.success) {
 *     console.log('Translated image:', result.resultUrl);
 *   }
 */

import { 
  translateImage as alibabaTranslate,
  TranslationRequest,
  TranslationResponse 
} from './alibaba-translator';

import { 
  translateImageWithClaude
} from './claude-translator-fallback';

import { createClient } from '@supabase/supabase-js';

// Types
export interface DetectedTextRegion {
  original: string;
  translated: string;
  bbox: number[] | { x: number; y: number; width: number; height: number };
}

export interface ProductImageTranslation {
  success: boolean;
  method: 'alibaba' | 'claude' | 'none';
  originalUrl: string;
  translatedUrl?: string;
  detectedRegions?: DetectedTextRegion[];
  processingTimeMs?: number;
  error?: string;
}

export interface TranslationOptions {
  sourceLanguage?: string;
  targetLanguage?: string;
  glossary?: Array<{ source: string; target: string }>;
  preferredMethod?: 'alibaba' | 'claude' | 'auto';
  saveToStorage?: boolean;
  productId?: string;
}

// Check which translation services are available
function getAvailableServices(): { alibaba: boolean; claude: boolean } {
  return {
    alibaba: !!process.env.ALIBABA_DASHSCOPE_API_KEY,
    claude: !!process.env.ANTHROPIC_API_KEY,
  };
}

// Upload result to Supabase storage
async function uploadToStorage(
  imageBuffer: Buffer,
  filename: string
): Promise<string | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.storage
      .from('translated-images')
      .upload(filename, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('translated-images')
      .getPublicUrl(filename);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

// Fetch image from URL and return as buffer
async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Fetch image from Alibaba result URL
async function fetchResultImage(url: string): Promise<Buffer> {
  return fetchImageAsBuffer(url);
}

/**
 * Main translation function
 * Automatically selects the best available method
 */
export async function translateProductImage(
  imageUrl: string,
  options: TranslationOptions = {}
): Promise<ProductImageTranslation> {
  const startTime = Date.now();
  const services = getAvailableServices();
  
  const {
    preferredMethod = 'auto',
    saveToStorage = true,
    glossary = [],
  } = options;

  // Determine which method to use
  let useAlibaba = services.alibaba && (preferredMethod === 'alibaba' || preferredMethod === 'auto');
  let useClaude = services.claude && (preferredMethod === 'claude' || (preferredMethod === 'auto' && !useAlibaba));

  if (!useAlibaba && !useClaude) {
    return {
      success: false,
      method: 'none',
      originalUrl: imageUrl,
      error: 'No translation service available. Set ALIBABA_DASHSCOPE_API_KEY or ANTHROPIC_API_KEY.',
    };
  }

  // Try Alibaba first (preferred)
  if (useAlibaba) {
    try {
      console.log('[Translator] Using Alibaba Qwen-MT-Image...');
      
      const result = await alibabaTranslate(imageUrl, {
        sourceLanguage: options.sourceLanguage,
        targetLanguage: options.targetLanguage,
        glossary,
        domain: 'e-commerce',
      });

      if (result.success && result.resultUrl) {
        let finalUrl = result.resultUrl;

        // Optionally save to our own storage
        if (saveToStorage) {
          const imageBuffer = await fetchResultImage(result.resultUrl);
          const filename = `translated_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
          const storageUrl = await uploadToStorage(imageBuffer, filename);
          if (storageUrl) {
            finalUrl = storageUrl;
          }
        }

        return {
          success: true,
          method: 'alibaba',
          originalUrl: imageUrl,
          translatedUrl: finalUrl,
          detectedRegions: result.detectedText,
          processingTimeMs: Date.now() - startTime,
        };
      }

      // If Alibaba failed and Claude is available, fall through
      if (useClaude) {
        console.log('[Translator] Alibaba failed, falling back to Claude...');
      } else {
        return {
          success: false,
          method: 'alibaba',
          originalUrl: imageUrl,
          error: result.error || 'Alibaba translation failed',
          processingTimeMs: Date.now() - startTime,
        };
      }
    } catch (error) {
      console.error('[Translator] Alibaba error:', error);
      if (!useClaude) {
        return {
          success: false,
          method: 'alibaba',
          originalUrl: imageUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTimeMs: Date.now() - startTime,
        };
      }
    }
  }

  // Try Claude fallback
  if (useClaude) {
    try {
      console.log('[Translator] Using Claude Vision fallback...');
      
      // Fetch the image
      const imageBuffer = await fetchImageAsBuffer(imageUrl);
      
      // Detect media type
      const mediaType = imageUrl.toLowerCase().includes('.png') 
        ? 'image/png' 
        : imageUrl.toLowerCase().includes('.webp')
          ? 'image/webp'
          : 'image/jpeg';

      const result = await translateImageWithClaude(imageBuffer, mediaType);

      if (result.success && result.resultBuffer) {
        let finalUrl = imageUrl; // Default to original if storage fails

        if (saveToStorage) {
          const filename = `translated_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
          const storageUrl = await uploadToStorage(result.resultBuffer, filename);
          if (storageUrl) {
            finalUrl = storageUrl;
          }
        }

        return {
          success: true,
          method: 'claude',
          originalUrl: imageUrl,
          translatedUrl: finalUrl,
          detectedRegions: result.regions,
          processingTimeMs: Date.now() - startTime,
        };
      }

      return {
        success: false,
        method: 'claude',
        originalUrl: imageUrl,
        error: result.error || 'Claude translation failed',
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        method: 'claude',
        originalUrl: imageUrl,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  // Shouldn't reach here, but just in case
  return {
    success: false,
    method: 'none',
    originalUrl: imageUrl,
    error: 'No translation method available',
  };
}

/**
 * Batch translate multiple images
 * Processes in parallel with concurrency limit
 */
export async function translateProductImages(
  imageUrls: string[],
  options: TranslationOptions = {},
  concurrency: number = 3
): Promise<ProductImageTranslation[]> {
  const results: ProductImageTranslation[] = [];
  
  // Process in batches
  for (let i = 0; i < imageUrls.length; i += concurrency) {
    const batch = imageUrls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(url => translateProductImage(url, options))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Check service health/availability
 */
export function getTranslationServiceStatus(): {
  available: boolean;
  services: { alibaba: boolean; claude: boolean };
  recommended: 'alibaba' | 'claude' | null;
} {
  const services = getAvailableServices();
  return {
    available: services.alibaba || services.claude,
    services,
    recommended: services.alibaba ? 'alibaba' : services.claude ? 'claude' : null,
  };
}

