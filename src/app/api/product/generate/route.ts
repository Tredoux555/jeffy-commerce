import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { calculateImportCosts, detectCategory, formatZAR } from '@/lib/import-calculator';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ProductInput {
  url: string;
  titleChinese?: string;
  titleEnglish?: string;
  priceCNY: number;
  moq: number;
  sales30d: number;
  supplierName: string;
  rating: number;
  images?: string[];
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const input: ProductInput = await request.json();

    // Detect category from title
    const category = detectCategory(input.titleEnglish || input.titleChinese || '');

    // Calculate import costs
    const costs = calculateImportCosts({
      productPriceCNY: input.priceCNY,
      category,
    });

    // Generate AI-optimized product details
    const aiResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a South African e-commerce product copywriter. Generate product details for a product being imported from China.

Input:
- Original Title: ${input.titleEnglish || input.titleChinese}
- Supplier: ${input.supplierName}
- Price: ¥${input.priceCNY} CNY (${formatZAR(costs.productCostZAR)})
- 30-day Sales: ${input.sales30d} units
- Supplier Rating: ${input.rating}/5
- Category: ${category}

Generate a JSON response with:
1. "title": A compelling English product title (max 80 chars) optimized for South African shoppers. Remove Chinese brand names unless well-known. Make it descriptive and appealing.

2. "description": A professional product description (150-300 words) that:
   - Highlights key features and benefits
   - Uses South African English (not American)
   - Includes bullet points for features
   - Mentions quality/value proposition
   - Does NOT mention China or import (position as quality product available in SA)
   - Includes a call to action

3. "shortDescription": A 1-2 sentence summary for product cards (max 150 chars)

4. "tags": Array of 5-8 relevant search tags for the product

5. "suggestedCategory": Best category match from: Electronics, Fashion, Sports & Outdoors, Home & Garden, Beauty, Toys & Games, Accessories, Other

Respond ONLY with valid JSON, no other text.`
        }
      ]
    });

    // Parse AI response
    let aiContent: any = {};
    const textBlock = aiResponse.content.find(block => block.type === 'text');
    if (textBlock && textBlock.type === 'text') {
      try {
        // Clean the response - remove markdown code blocks if present
        let jsonStr = textBlock.text.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        aiContent = JSON.parse(jsonStr);
      } catch (e) {
        console.error('Failed to parse AI response:', textBlock.text);
        // Use fallback values
        aiContent = {
          title: input.titleEnglish || 'Imported Product',
          description: 'Quality product imported for the South African market.',
          shortDescription: 'Quality imported product.',
          tags: [category],
          suggestedCategory: category,
        };
      }
    }

    // Build complete product data
    const productData = {
      // Basic info
      title: aiContent.title || input.titleEnglish,
      description: aiContent.description || '',
      shortDescription: aiContent.shortDescription || '',
      tags: aiContent.tags || [],
      suggestedCategory: aiContent.suggestedCategory || category,
      
      // Source info
      source: {
        url: input.url,
        platform: '1688',
        supplierName: input.supplierName,
        supplierRating: input.rating,
        originalTitle: input.titleChinese || input.titleEnglish,
        moq: input.moq,
        sales30d: input.sales30d,
      },
      
      // Pricing
      pricing: {
        costCNY: input.priceCNY,
        costZAR: costs.productCostZAR,
        shippingZAR: costs.shippingZAR,
        customsDutyZAR: costs.customsDutyZAR,
        customsDutyRate: `${(costs.customsDutyRate * 100).toFixed(0)}%`,
        vatZAR: costs.vatZAR,
        vatRate: `${(costs.vatRate * 100).toFixed(0)}%`,
        customsClearanceFee: costs.customsClearanceFee,
        totalLandedCost: costs.totalLandedCost,
        suggestedRetailPrice: costs.suggestedRetailPrice,
        profitMargin: `${(costs.profitMargin * 100).toFixed(0)}%`,
        
        // Profit split
        grossProfit: costs.suggestedRetailPrice - costs.totalLandedCost,
        platformFee: costs.platformFee,
        partnerShare: costs.partnerShare,
        netProfit: costs.netProfit,
      },
      
      // Images (to be fetched/uploaded separately)
      images: input.images || [],
    };

    return NextResponse.json(productData);

  } catch (error) {
    console.error('Product generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate product details' },
      { status: 500 }
    );
  }
}






