import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Lazy initialization
let anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }
  return anthropic;
}

interface ExtractedProduct {
  name: string;
  chineseKeyword: string;
  chineseKeywordAlt: string;
  category: string;
  subcategory: string;
  
  // Pricing
  estimatedRetailZAR: number;
  estimated1688CostZAR: number;
  landedCostZAR: number;
  marginPercent: number;
  
  // SA Trend Scores (0-100)
  saTrendScore: number;
  tiktokVelocityScore: number;
  aliexpressScore: number;
  priceCompetitivenessScore: number;
  searchVolumeScore: number;
  mobileFriendlinessScore: number;
  supplierReliabilityScore: number;
  categoryAdoptionScore: number;
  
  // Market Intelligence
  demandSignals: string[];
  competitionLevel: 'low' | 'medium' | 'high';
  trendLagWeeks: number;
  trendSource: string;
  
  // SA Market Factors
  priceTier: 'impulse' | 'considered' | 'premium';
  dutyCategory: 'zero' | 'standard' | 'clothing_45';
  dutyPercent: number;
  mobileFriendly: boolean;
  
  // Sourcing
  moqEstimate: string;
  shippingType: 'air' | 'sea' | 'express';
  recommendation: string;
  riskFactors: string[];
  
  // 1688 URLs
  searchUrls: {
    primary: string;
    factory: string;
    oem: string;
  };
}

function generate1688Urls(chineseKeyword: string) {
  const encoded = encodeURIComponent(chineseKeyword);
  return {
    primary: `https://s.1688.com/selloffer/offer_search.htm?keywords=${encoded}`,
    factory: `https://s.1688.com/selloffer/offer_search.htm?keywords=${encoded}&descendOrder=tradenumaliScore30D`,
    oem: `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(chineseKeyword + ' 源头工厂')}`,
  };
}

const SA_SCORING_PROMPT = `You are a product sourcing expert analyzing market research to identify products for importing from China via 1688.com to sell in SOUTH AFRICA.

## CRITICAL SA MARKET CONTEXT:
- Price sensitivity: Under R500 is sweet spot, R200-R300 optimal for viral adoption
- Mobile-first: 72% of SA transactions are mobile - products must be mobile-browsable
- Import duties: 45% on clothing + 15% VAT, electronics often duty-free
- Trend lag: SA trails US/UK trends by 3-6 months - this creates arbitrage window
- Load shedding: Solar/power products have unique SA demand
- Exchange rate: ¥1 ≈ R2.50 for calculations

## SA TREND SCORE FORMULA (calculate this):
SA_Trend_Score = weighted average of:
- TikTok velocity (20%): How fast is engagement growing?
- AliExpress momentum (20%): Sales acceleration on AliExpress
- Price competitiveness (20%): How well does landed cost support margins?
- Search volume (15%): Google Trends / demand indicators
- Mobile friendliness (10%): Can it sell via mobile easily?
- Supplier reliability (10%): Factory quality indicators
- Category adoption (5%): How well does this category transfer to SA?

## PRICE TIERS:
- "impulse": Under R200 - highest conversion
- "considered": R200-R500 - good for quality items
- "premium": Over R500 - needs strong differentiation

## DUTY CATEGORIES:
- "zero": Electronics, gadgets (0%)
- "standard": Most goods (15% VAT only)
- "clothing_45": Apparel, textiles (45% duty + 15% VAT)

## SHIPPING TYPES:
- "air": Under 500g, 7-14 days, R40-80/kg
- "sea": Over 500g, 25-35 days, cheaper for bulk
- "express": Urgent samples, 3-5 days, expensive

Analyze the research and extract ALL viable products. For each product return:

{
  "name": "Product Name",
  "chineseKeyword": "主要中文关键词",
  "chineseKeywordAlt": "备选中文关键词",
  "category": "category",
  "subcategory": "subcategory",
  
  "estimatedRetailZAR": 149,
  "estimated1688CostZAR": 15,
  "landedCostZAR": 25,
  "marginPercent": 83,
  
  "saTrendScore": 78,
  "tiktokVelocityScore": 85,
  "aliexpressScore": 70,
  "priceCompetitivenessScore": 90,
  "searchVolumeScore": 65,
  "mobileFriendlinessScore": 95,
  "supplierReliabilityScore": 75,
  "categoryAdoptionScore": 80,
  
  "demandSignals": ["TikTok viral in US", "Amazon bestseller", "Low SA competition"],
  "competitionLevel": "low",
  "trendLagWeeks": 12,
  "trendSource": "tiktok",
  
  "priceTier": "impulse",
  "dutyCategory": "zero",
  "dutyPercent": 0,
  "mobileFriendly": true,
  
  "moqEstimate": "50-100 units",
  "shippingType": "air",
  "recommendation": "High priority - excellent margins, trending, low competition",
  "riskFactors": ["Seasonal demand", "Quality variance"]
}

IMPORTANT:
- Use ACTUAL Chinese trade terms factories use (not literal translations)
- Calculate realistic landed costs (1688 cost + shipping + duties)
- Be conservative with scores - 80+ is exceptional
- Flag risk factors honestly
- Products scoring under 50 SA_Trend_Score shouldn't be included

Return ONLY valid JSON array. No markdown, no explanation.

RESEARCH TEXT TO ANALYZE:
`;

export async function POST(request: NextRequest) {
  try {
    const { research_text, research_id } = await request.json();
    
    if (!research_text || research_text.length < 50) {
      return NextResponse.json({ 
        error: 'Research text too short. Need at least 50 characters.' 
      }, { status: 400 });
    }

    // Truncate if too long (Claude has limits)
    const truncatedText = research_text.slice(0, 50000);
    
    const client = getAnthropic();
    
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: SA_SCORING_PROMPT + truncatedText
        }
      ]
    });

    // Extract text content
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('');

    // Parse JSON response
    let products: ExtractedProduct[] = [];
    try {
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7);
      if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3);
      if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);
      products = JSON.parse(cleanJson.trim());
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json({ 
        error: 'Failed to parse AI response',
        rawResponse: responseText.slice(0, 1000)
      }, { status: 500 });
    }

    // Add 1688 URLs to each product
    const enrichedProducts = products.map((p: ExtractedProduct) => ({
      ...p,
      searchUrls: generate1688Urls(p.chineseKeyword),
      research_id: research_id || null
    }));

    // Calculate summary stats
    const categories = [...new Set(enrichedProducts.map(p => p.category))];
    const avgScore = enrichedProducts.length > 0 
      ? Math.round(enrichedProducts.reduce((sum, p) => sum + (p.saTrendScore || 0), 0) / enrichedProducts.length)
      : 0;
    const avgMargin = enrichedProducts.length > 0 
      ? Math.round(enrichedProducts.reduce((sum, p) => sum + (p.marginPercent || 0), 0) / enrichedProducts.length)
      : 0;
    
    // Categorize by score
    const highPotential = enrichedProducts.filter(p => p.saTrendScore >= 75);
    const mediumPotential = enrichedProducts.filter(p => p.saTrendScore >= 60 && p.saTrendScore < 75);
    const impulsePrice = enrichedProducts.filter(p => p.priceTier === 'impulse');
    const airFreightReady = enrichedProducts.filter(p => p.shippingType === 'air');

    // Top picks sorted by SA Trend Score
    const topPicks = [...enrichedProducts]
      .sort((a, b) => (b.saTrendScore || 0) - (a.saTrendScore || 0))
      .slice(0, 5);

    // Quick wins: high score + impulse price + air freight
    const quickWins = enrichedProducts
      .filter(p => p.saTrendScore >= 70 && p.priceTier === 'impulse' && p.shippingType === 'air')
      .sort((a, b) => (b.marginPercent || 0) - (a.marginPercent || 0));

    return NextResponse.json({
      success: true,
      summary: {
        totalProducts: enrichedProducts.length,
        avgSATrendScore: avgScore,
        avgMargin: avgMargin,
        highPotentialCount: highPotential.length,
        mediumPotentialCount: mediumPotential.length,
        impulsePriceCount: impulsePrice.length,
        airFreightReadyCount: airFreightReady.length,
        quickWinsCount: quickWins.length,
        categories,
        totalSearchLinks: enrichedProducts.length * 3
      },
      products: enrichedProducts,
      topPicks,
      quickWins,
      tokenUsage: {
        input: message.usage?.input_tokens || 0,
        output: message.usage?.output_tokens || 0,
        estimatedCost: ((message.usage?.input_tokens || 0) * 0.003 / 1000) + ((message.usage?.output_tokens || 0) * 0.015 / 1000)
      }
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    return NextResponse.json({ 
      error: 'AI analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
