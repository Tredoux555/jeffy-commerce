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

function generate1688Urls(chineseKeyword: string) {
  const encoded = encodeURIComponent(chineseKeyword);
  return {
    search: `https://s.1688.com/selloffer/offer_search.htm?keywords=${encoded}`,
    factory: `https://s.1688.com/selloffer/offer_search.htm?keywords=${encoded}&descendOrder=tradenumaliScore30D&filtIsBpSeller=true`,
    oem: `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(chineseKeyword + ' 源头工厂')}`,
    superFactory: `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(chineseKeyword + ' 超级工厂')}`,
  };
}

function generateImageSearchUrls() {
  return {
    ali1688: 'https://s.1688.com/youyuan/index.htm',
    taobao: 'https://s.taobao.com/search?imgfile=&js=1&stats_click=search_radio_all%3A1&initiative_id=staobaoz_20210101&ie=utf8&tfsid=&app=imgsearch',
    aliexpress: 'https://www.aliexpress.com/wholesale',
  };
}

const SA_SCORING_PROMPT = `You are an expert product sourcing analyst for a South African e-commerce company importing from China via 1688.com.

## YOUR TASK
Analyze the research text and extract ALL viable products. For each product, provide comprehensive scoring and intelligence.

## SA MARKET CONTEXT (CRITICAL)
- Price sweet spot: Under R500, optimal R200-R300
- Mobile-first: 72% of SA transactions are mobile
- Import duties: 45% on clothing + 15% VAT, electronics often 0%
- Trend lag: SA trails US/UK by 3-6 months (arbitrage window!)
- Exchange rate: ¥1 ≈ R2.50

## SCORING FORMULA
TOTAL SA SCORE (0-100) = weighted average of:
- Margin Potential (30%): Based on landed cost vs retail price
- Trend Velocity (25%): How fast is demand growing?
- Competition Level (20%): Low competition = higher score
- Supplier Quality (15%): Factory indicators
- Shipping Ease (10%): Weight, fragility, customs

## VERDICT ASSIGNMENT
- "rocket": Score 80+ AND margin 60%+ = 🚀 QUICK WIN
- "star": Score 70+ AND margin 50%+ = ⭐ TOP PICK  
- "trending": Score 65+ = 📈 TRENDING
- "review": Score 50-65 = ⚠️ NEEDS REVIEW

## OUTPUT FORMAT
Return ONLY a valid JSON array. Each product:
{
  "name": "Product Name",
  "category": "category",
  "subcategory": "subcategory",
  "chineseKeywords": { "primary": "关键词", "alt": "备选", "factory": "工厂词" },
  "pricing": {
    "retailZAR": 149, "cost1688ZAR": 15, "shippingZAR": 8, "dutyZAR": 0,
    "landedCostZAR": 23, "marginPercent": 85, "marginZAR": 126
  },
  "scores": {
    "total": 82, "marginPotential": 90, "trendVelocity": 75,
    "competitionLevel": 85, "supplierQuality": 70, "shippingEase": 80
  },
  "verdict": "rocket",
  "verdictReason": "High margin impulse buy",
  "market": {
    "priceTier": "impulse", "dutyCategory": "zero", "dutyPercent": 0,
    "trendLagWeeks": 8, "competitionLevel": "low",
    "demandSignals": ["TikTok viral"], "targetAudience": "Young women 18-35"
  },
  "sourcing": {
    "shippingType": "air", "weightGrams": 50, "moqEstimate": "50-100",
    "leadTimeDays": 14, "factoryCluster": "Yiwu",
    "clusterMatch": true, "recommendedBadges": ["源头厂家"]
  },
  "risks": ["Seasonal"],
  "opportunities": ["First mover"],
  "recommendation": "Order samples."
}

No markdown. No explanation. Just JSON array.

RESEARCH:
`;

export async function POST(request: NextRequest) {
  try {
    const { research_text, research_id } = await request.json();
    
    if (!research_text || research_text.length < 50) {
      return NextResponse.json({ 
        error: 'Research text too short. Need at least 50 characters.' 
      }, { status: 400 });
    }

    const charCount = research_text.length;
    console.log(`[AI Analyze] Starting: ${charCount} chars`);
    
    // Warn if very large (but still process)
    if (charCount > 30000) {
      console.log(`[AI Analyze] Warning: Large input (${charCount} chars). Consider splitting for better results.`);
    }
    
    const startTime = Date.now();
    const client = getAnthropic();
    
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: SA_SCORING_PROMPT + research_text }]
    });
    
    const duration = Date.now() - startTime;
    console.log(`[AI Analyze] Claude responded in ${duration}ms`);

    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('');

    let products: any[] = [];
    try {
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7);
      if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3);
      if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);
      products = JSON.parse(cleanJson.trim());
    } catch (parseError) {
      console.error('[AI Analyze] Parse error:', responseText.slice(0, 500));
      return NextResponse.json({ 
        error: 'Failed to parse AI response',
        hint: 'Try with smaller input'
      }, { status: 500 });
    }

    // Enrich with URLs
    const enrichedProducts = products.map((p: any) => ({
      ...p,
      urls: {
        ...generate1688Urls(p.chineseKeywords?.primary || ''),
        imageSearch: generateImageSearchUrls()
      },
      research_id: research_id || null
    }));

    // Categorize
    const quickWins = enrichedProducts.filter((p: any) => p.verdict === 'rocket');
    const topPicks = enrichedProducts.filter((p: any) => p.verdict === 'star');
    const trending = enrichedProducts.filter((p: any) => p.verdict === 'trending');
    const needsReview = enrichedProducts.filter((p: any) => p.verdict === 'review');

    // Stats
    const avgScore = enrichedProducts.length > 0 
      ? Math.round(enrichedProducts.reduce((sum: number, p: any) => sum + (p.scores?.total || 0), 0) / enrichedProducts.length)
      : 0;
    const avgMargin = enrichedProducts.length > 0 
      ? Math.round(enrichedProducts.reduce((sum: number, p: any) => sum + (p.pricing?.marginPercent || 0), 0) / enrichedProducts.length)
      : 0;

    console.log(`[AI Analyze] Found ${enrichedProducts.length} products in ${duration}ms`);

    return NextResponse.json({
      success: true,
      summary: {
        totalProducts: enrichedProducts.length,
        quickWins: quickWins.length,
        topPicks: topPicks.length,
        trending: trending.length,
        needsReview: needsReview.length,
        avgScore,
        avgMargin,
        categories: [...new Set(enrichedProducts.map((p: any) => p.category))],
        inputChars: charCount,
        processingMs: duration
      },
      products: enrichedProducts,
      grouped: { quickWins, topPicks, trending, needsReview }
    });

  } catch (error) {
    console.error('[AI Analyze] Error:', error);
    return NextResponse.json({ 
      error: 'AI analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
