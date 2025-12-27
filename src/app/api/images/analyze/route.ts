import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ImageAnalysis {
  imageUrl: string;
  index: number;
  hasChineseText: boolean;
  chineseTextFound: string[];
  englishTranslations: string[];
  textAmount: 'none' | 'minimal' | 'moderate' | 'heavy';
  isClean: boolean;
  recommendation: string;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrls } = await request.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: 'No image URLs provided' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const analyses: ImageAnalysis[] = [];
    
    // Analyze each image (limit to first 5 to save tokens)
    for (let i = 0; i < Math.min(imageUrls.length, 5); i++) {
      const imageUrl = imageUrls[i];
      
      try {
        const analysis = await analyzeImage(imageUrl, i);
        analyses.push(analysis);
      } catch (err) {
        console.log(`Failed to analyze image ${i}:`, err);
        analyses.push({
          imageUrl,
          index: i,
          hasChineseText: false,
          chineseTextFound: [],
          englishTranslations: [],
          textAmount: 'none',
          isClean: true,
          recommendation: 'Could not analyze'
        });
      }
    }

    // Find the cleanest image
    const cleanImages = analyses.filter(a => a.isClean);
    const bestImageIndex = cleanImages.length > 0 
      ? cleanImages[0].index 
      : analyses.sort((a, b) => {
          const order = { none: 0, minimal: 1, moderate: 2, heavy: 3 };
          return order[a.textAmount] - order[b.textAmount];
        })[0]?.index || 0;

    return NextResponse.json({
      success: true,
      analyses,
      bestImageIndex,
      summary: {
        totalAnalyzed: analyses.length,
        cleanImages: cleanImages.length,
        imagesWithChineseText: analyses.filter(a => a.hasChineseText).length
      }
    });

  } catch (error: any) {
    console.error('Image analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function analyzeImage(imageUrl: string, index: number): Promise<ImageAnalysis> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'url', url: imageUrl }
        },
        {
          type: 'text',
          text: `Analyze this product image for Chinese/Asian text.

Return ONLY a JSON object (no markdown, no explanation):
{
  "hasChineseText": true/false,
  "chineseTextFound": ["text1", "text2"],
  "englishTranslations": ["translation1", "translation2"],
  "textAmount": "none" | "minimal" | "moderate" | "heavy",
  "isClean": true/false (true if image is good for e-commerce with minimal distracting text),
  "recommendation": "brief recommendation"
}

"minimal" = small brand name or 1-2 words
"moderate" = several text elements but product is clear
"heavy" = lots of text covering product`
        }
      ]
    }]
  });

  const responseText = (message.content[0] as any).text;
  
  // Parse JSON from response
  let parsed;
  try {
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch {
    parsed = {
      hasChineseText: false,
      chineseTextFound: [],
      englishTranslations: [],
      textAmount: 'none',
      isClean: true,
      recommendation: 'Could not parse analysis'
    };
  }

  return {
    imageUrl,
    index,
    ...parsed
  };
}
