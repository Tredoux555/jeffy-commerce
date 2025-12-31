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
  estimatedRetailUSD: string;
  estimated1688CostUSD: string;
  marginPercent: number;
  demandSignals: string[];
  moqEstimate: string;
  competitionLevel: string;
  recommendation: string;
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

const EXTRACTION_PROMPT = `You are a product sourcing expert analyzing market research to identify products for importing from China via 1688.com.

Analyze the following research text and extract ALL viable product opportunities. For each product:

1. **Product Name**: Clear English name
2. **Chinese Keyword**: The EXACT Chinese search term to use on 1688.com (this is critical - must be accurate Chinese that factories use)
3. **Chinese Keyword Alt**: An alternative Chinese search term
4. **Category**: beauty, pet, health, electronics, home, baby, fashion, drinkware, car, smart_home, outdoor, other
5. **Estimated Retail USD**: What it sells for in Western markets (range like "$25-40")
6. **Estimated 1688 Cost USD**: Factory/OEM price estimate (range like "$3-8")
7. **Margin Percent**: Calculated gross margin (number only, e.g., 65)
8. **Demand Signals**: Array of evidence showing demand (TikTok viral, Amazon trending, etc.)
9. **MOQ Estimate**: Typical minimum order quantity
10. **Competition Level**: low, medium, high
11. **Recommendation**: brief note on why this is worth sourcing or any concerns

IMPORTANT FOR CHINESE KEYWORDS:
- Use actual product terms Chinese factories use on 1688
- Not literal translations - use industry/trade terms
- Examples: 
  - "Stanley cup" → "保温杯40oz" or "不锈钢保温杯大容量"
  - "LED face mask" → "LED美容面罩" or "光子嫩肤仪"
  - "Massage gun" → "筋膜枪" 
  - "Busy board" → "忙碌板儿童玩具" or "蒙氏早教板"

Return ONLY valid JSON array. No markdown, no explanation. Format:
[
  {
    "name": "Product Name",
    "chineseKeyword": "主要中文关键词",
    "chineseKeywordAlt": "备选中文关键词", 
    "category": "category",
    "estimatedRetailUSD": "$XX-XX",
    "estimated1688CostUSD": "$X-X",
    "marginPercent": 65,
    "demandSignals": ["signal1", "signal2"],
    "moqEstimate": "50-100 units",
    "competitionLevel": "medium",
    "recommendation": "Brief note"
  }
]

If no products found, return empty array: []

RESEARCH TEXT TO ANALYZE:
`;

export async function POST(request: NextRequest) {
  try {
    const { research_text } = await request.json();
    
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
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: EXTRACTION_PROMPT + truncatedText
        }
      ]
    });

    // Extract text content
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('');

    // Parse JSON response
    let products: any[] = [];
    try {
      // Clean up response - remove markdown code blocks if present
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.slice(7);
      }
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.slice(3);
      }
      if (cleanJson.endsWith('```')) {
        cleanJson = cleanJson.slice(0, -3);
      }
      products = JSON.parse(cleanJson.trim());
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json({ 
        error: 'Failed to parse AI response',
        rawResponse: responseText.slice(0, 500)
      }, { status: 500 });
    }

    // Add 1688 URLs to each product
    const enrichedProducts: ExtractedProduct[] = products.map((p: any) => ({
      ...p,
      searchUrls: generate1688Urls(p.chineseKeyword)
    }));

    // Calculate summary stats
    const categories = [...new Set(enrichedProducts.map(p => p.category))];
    const avgMargin = enrichedProducts.length > 0 
      ? Math.round(enrichedProducts.reduce((sum, p) => sum + (p.marginPercent || 0), 0) / enrichedProducts.length)
      : 0;
    const highMarginProducts = enrichedProducts.filter(p => p.marginPercent >= 50);

    return NextResponse.json({
      success: true,
      summary: {
        totalProducts: enrichedProducts.length,
        categories,
        averageMargin: avgMargin,
        highMarginCount: highMarginProducts.length,
        totalSearchLinks: enrichedProducts.length * 3
      },
      products: enrichedProducts,
      topPicks: enrichedProducts
        .sort((a, b) => (b.marginPercent || 0) - (a.marginPercent || 0))
        .slice(0, 5)
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    return NextResponse.json({ 
      error: 'AI analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
