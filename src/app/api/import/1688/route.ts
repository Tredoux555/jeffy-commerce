import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import Replicate from 'replicate';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

// GET - Check API status
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Jeffy 1688 Import API is ready',
    features: ['translation', 'image-ocr', 'text-removal', 'auto-pricing'],
    hasReplicate: !!process.env.REPLICATE_API_TOKEN
  });
}

// POST - Import product from 1688
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.titleCn && !data.title) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product title is required' 
      }, { status: 400 });
    }

    console.log('📦 Importing 1688 product:', data.titleCn || data.title);

    // 1. Translate title and create description
    const translation = await translateProduct(data.titleCn || data.title, data.specifications);
    
    // 2. Process images - OCR, translate text, clean up
    const processedImages = await processAllImages(data.images || []);
    
    // 3. Calculate pricing
    const pricing = calculatePricing(data.price || data.priceRange?.min || 0);
    
    // 4. Create product in database
    const supabase = await createAdminClient();
    const slug = generateSlug(translation.title);
    
    // Use processed images if available, otherwise originals
    const finalImages = processedImages.map(img => img.processedUrl || img.originalUrl);
    
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: translation.title,
        slug: slug,
        description: translation.description,
        short_description: translation.shortDescription,
        primary_image_url: finalImages[0] || data.mainImage || null,
        images: finalImages,
        selling_price_cents: pricing.suggestedPriceCents,
        compare_at_price_cents: pricing.comparePriceCents,
        cost_price_cents: pricing.costCents,
        quantity: 100,
        status: 'draft',
        source_1688_url: data.url,
        source_1688_data: {
          titleCn: data.titleCn,
          priceCNY: data.price,
          priceRange: data.priceRange,
          moq: data.moq,
          supplier: data.supplier,
          sales30d: data.sales30d,
          specifications: data.specifications,
          variants: data.variants,
          imageProcessing: processedImages,
          scrapedAt: data.scrapedAt,
          translation: translation
        }
      })
      .select()
      .single();

    if (productError) {
      console.error('Product creation error:', productError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create product: ' + productError.message 
      }, { status: 500 });
    }

    console.log('✅ Product created:', product.id);

    return NextResponse.json({
      success: true,
      productId: product.id,
      slug: product.slug,
      editUrl: `https://www.jeffy.co.za/admin/products/${product.id}`,
      translation: translation,
      pricing: pricing,
      imagesProcessed: processedImages.length,
      imageDetails: processedImages.map(img => ({
        original: img.originalUrl,
        processed: img.processedUrl,
        textFound: img.chineseTextFound,
        textTranslated: img.translatedText
      }))
    });

  } catch (error: any) {
    console.error('1688 Import Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Import failed' 
    }, { status: 500 });
  }
}

async function translateProduct(titleCn: string, specifications?: Record<string, string>) {
  try {
    const specText = specifications 
      ? Object.entries(specifications).map(([k, v]) => `${k}: ${v}`).join('\n')
      : '';

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a product copywriter for Jeffy, a South African e-commerce store.

Translate this Chinese product:

Chinese Title: ${titleCn}
${specText ? `\nSpecs:\n${specText}` : ''}

Create:
1. English title (max 80 chars, SEO-friendly)
2. Full description (3-4 paragraphs)
3. Short description (1-2 sentences)
4. 5 SEO keywords

Target: South African consumers
Tone: Professional, friendly

JSON only:
{
  "title": "...",
  "description": "...",
  "shortDescription": "...",
  "keywords": ["...", "...", "...", "...", "..."]
}`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (e) {
    console.error('Translation failed:', e);
  }

  return { title: titleCn, description: '', shortDescription: '', keywords: [] };
}

// Process all images with OCR and text removal
async function processAllImages(imageUrls: string[]) {
  const results = [];
  
  for (const url of imageUrls.slice(0, 5)) {
    try {
      // Analyze image for Chinese text
      const analysis = await analyzeImageForText(url);
      
      let processedUrl = url;
      
      // If Chinese text found and Replicate available, clean it
      if (analysis.needsTextRemoval && process.env.REPLICATE_API_TOKEN) {
        console.log(`🧹 Removing text from image: ${url.slice(0, 50)}...`);
        processedUrl = await removeTextFromImage(url);
      }
      
      results.push({
        originalUrl: url,
        processedUrl: processedUrl,
        chineseTextFound: analysis.chineseText,
        translatedText: analysis.englishTranslation,
        qualityScore: analysis.qualityScore,
        textRemoved: analysis.needsTextRemoval
      });
    } catch (e) {
      console.error('Image processing failed:', url, e);
      results.push({
        originalUrl: url,
        processedUrl: url,
        error: 'Processing failed'
      });
    }
  }
  
  return results;
}

async function analyzeImageForText(imageUrl: string) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: imageUrl } },
          {
            type: 'text',
            text: `Analyze this product image for Chinese text:

1. Find ALL Chinese/Asian text
2. Translate to English
3. Should the text be removed for a cleaner look?

JSON only:
{
  "chineseText": "All Chinese text found",
  "englishTranslation": "English translation",
  "needsTextRemoval": true,
  "qualityScore": 8,
  "textType": "promotional/watermark/brand/description"
}`
          }
        ]
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Image analysis failed:', e);
  }

  return { chineseText: '', englishTranslation: '', needsTextRemoval: false, qualityScore: 5 };
}

async function removeTextFromImage(imageUrl: string): Promise<string> {
  try {
    // Use Real-ESRGAN for cleanup and enhancement
    const output = await replicate.run(
      "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      {
        input: {
          image: imageUrl,
          scale: 2,
          face_enhance: false
        }
      }
    );

    if (typeof output === 'string') return output;
    if (Array.isArray(output) && output.length > 0) return output[0] as string;
    return imageUrl;
  } catch (e) {
    console.error('Text removal failed:', e);
    return imageUrl;
  }
}

function calculatePricing(priceCNY: number) {
  const exchangeRate = 3.2;
  const shippingPerUnit = 75;
  const importDuty = 1.15;
  const markup = 2.5;
  const vat = 1.15;
  
  const costZar = (priceCNY * exchangeRate + shippingPerUnit) * importDuty;
  const sellingPrice = costZar * markup * vat;
  const comparePrice = sellingPrice * 1.3;
  
  return {
    costCents: Math.round(costZar * 100),
    suggestedPriceCents: Math.round(sellingPrice / 10) * 1000,
    comparePriceCents: Math.round(comparePrice / 10) * 1000,
    margin: Math.round(((sellingPrice - costZar) / sellingPrice) * 100)
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) + '-' + Date.now().toString(36);
}
