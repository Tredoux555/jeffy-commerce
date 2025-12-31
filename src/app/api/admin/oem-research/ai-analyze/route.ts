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
- Load shedding: Solar/power products have unique SA demand
- Exchange rate: ¥1 ≈ R2.50

## SCORING FORMULA (use this exact weighting)
TOTAL SA SCORE (0-100) = weighted average of:
- Margin Potential (30%): Based on landed cost vs retail price achievable
- Trend Velocity (25%): How fast is demand growing globally?
- Competition Level (20%): Low competition = higher score
- Supplier Quality (15%): Factory indicators, badges, verification potential
- Shipping Ease (10%): Weight, fragility, customs complexity

## FACTORY VERIFICATION INDICATORS
BADGES TO LOOK FOR:
- 源头厂家 (Source Factory): Blue badge = verified manufacturer
- 实力商家 (Powerful Merchant): Red bull logo = 500K+ RMB capital
- 超级工厂 (Super Factory): 500m²+, serves major brands
- 深度验厂 (Deep Factory Verified): Third-party audit

MANUFACTURING CLUSTERS (validate location matches product):
- Electronics → Shenzhen, Suzhou
- Drinkware → Yongkang, Zhejiang
- Toys → Chenghai, Shantou
- Kitchen appliances → Ningbo, Zhejiang
- Beauty devices → Shenzhen, Guangdong

## PRICE TIERS
- "impulse": Under R200 - highest conversion
- "considered": R200-R500 - good for quality items
- "premium": Over R500 - needs strong differentiation

## DUTY CATEGORIES
- "zero": Electronics, gadgets (0% duty)
- "standard": Most goods (15% VAT only)
- "clothing_45": Apparel, textiles (45% duty + 15% VAT)

## VERDICT ASSIGNMENT
- "rocket": SA Score 80+ AND margin 60%+ AND (impulse OR considered) = 🚀 QUICK WIN
- "star": SA Score 70+ AND margin 50%+ = ⭐ TOP PICK  
- "trending": SA Score 65+ OR strong trend signals = 📈 TRENDING
- "review": SA Score 50-65 OR has risks = ⚠️ NEEDS REVIEW
- "skip": SA Score <50 OR major red flags = ❌ SKIP

## OUTPUT FORMAT
Return a JSON array with each product having this structure:
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
  "verdictReason": "High margin impulse buy with low competition",
  "market": {
    "priceTier": "impulse", "dutyCategory": "zero", "dutyPercent": 0,
    "trendLagWeeks": 8, "competitionLevel": "low",
    "demandSignals": ["TikTok viral US"], "targetAudience": "Young women 18-35"
  },
  "sourcing": {
    "shippingType": "air", "weightGrams": 50, "moqEstimate": "50-100",
    "leadTimeDays": 14, "factoryCluster": "Yiwu, Zhejiang",
    "clusterMatch": true, "recommendedBadges": ["源头厂家"]
  },
  "risks": ["Seasonal demand"],
  "opportunities": ["First mover in SA"],
  "recommendation": "Order samples immediately."
}

IMPORTANT: Return ONLY valid JSON array. No markdown, no explanation. Skip products scoring below 50.

RESEARCH TEXT:
`;

async function analyzeChunk(client: Anthropic, chunkText: string, chunkNum: number): Promise<any[]> {
  console.log(`[AI Analyze] Processing chunk ${chunkNum}: ${chunkText.length} chars`);
  
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: SA_SCORING_PROMPT + chunkText }]
    });

    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('');

    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7);
    if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);
    
    const products = JSON.parse(cleanJson.trim());
    console.log(`[AI Analyze] Chunk ${chunkNum} found ${products.length} products`);
    return products;
  } catch (error) {
    console.error(`[AI Analyze] Chunk ${chunkNum} failed:`, error);
    return [];
  }
}

function splitIntoChunks(text: string, maxChunkSize: number = 20000): string[] {
  const chunks: string[] = [];
  
  // Try to split on paragraph boundaries
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

function deduplicateProducts(products: any[]): any[] {
  const seen = new Map<string, any>();
  
  for (const product of products) {
    const key = product.name?.toLowerCase().trim();
    if (!key) continue;
    
    // Keep the one with higher score
    if (!seen.has(key) || (product.scores?.total > seen.get(key).scores?.total)) {
      seen.set(key, product);
    }
  }
  
  return Array.from(seen.values());
}

export async function POST(request: NextRequest) {
  try {
    const { research_text, research_id } = await request.json();
    
    if (!research_text || research_text.length < 50) {
      return NextResponse.json({ 
        error: 'Research text too short. Need at least 50 characters.' 
      }, { status: 400 });
    }

    console.log(`[AI Analyze] Starting analysis: ${research_text.length} total chars`);
    const startTime = Date.now();
    const client = getAnthropic();
    
    // Split into chunks if needed
    const chunks = splitIntoChunks(research_text, 20000);
    console.log(`[AI Analyze] Split into ${chunks.length} chunks`);
    
    // Process all chunks (in parallel for speed)
    let allProducts: any[] = [];
    
    if (chunks.length === 1) {
      // Single chunk - process directly
      allProducts = await analyzeChunk(client, chunks[0], 1);
    } else {
      // Multiple chunks - process in parallel
      const results = await Promise.all(
        chunks.map((chunk, i) => analyzeChunk(client, chunk, i + 1))
      );
      allProducts = results.flat();
    }
    
    // Deduplicate products that might appear in multiple chunks
    const uniqueProducts = deduplicateProducts(allProducts);
    console.log(`[AI Analyze] Total unique products: ${uniqueProducts.length} (${allProducts.length} before dedup)`);

    // Enrich with URLs
    const enrichedProducts = uniqueProducts.map((p: any) => ({
      ...p,
      urls: {
        ...generate1688Urls(p.chineseKeywords?.primary || ''),
        imageSearch: generateImageSearchUrls()
      },
      research_id: research_id || null
    }));

    // Categorize by verdict
    const quickWins = enrichedProducts.filter((p: any) => p.verdict === 'rocket');
    const topPicks = enrichedProducts.filter((p: any) => p.verdict === 'star');
    const trending = enrichedProducts.filter((p: any) => p.verdict === 'trending');
    const needsReview = enrichedProducts.filter((p: any) => p.verdict === 'review');

    // Summary stats
    const avgScore = enrichedProducts.length > 0 
      ? Math.round(enrichedProducts.reduce((sum: number, p: any) => sum + (p.scores?.total || 0), 0) / enrichedProducts.length)
      : 0;
    const avgMargin = enrichedProducts.length > 0 
      ? Math.round(enrichedProducts.reduce((sum: number, p: any) => sum + (p.pricing?.marginPercent || 0), 0) / enrichedProducts.length)
      : 0;
    const totalPotentialProfit = enrichedProducts.reduce((sum: number, p: any) => sum + (p.pricing?.marginZAR || 0), 0);

    const duration = Date.now() - startTime;
    console.log(`[AI Analyze] Complete in ${duration}ms: ${enrichedProducts.length} products from ${chunks.length} chunks`);

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
        totalPotentialProfit,
        categories: [...new Set(enrichedProducts.map((p: any) => p.category))],
        chunksProcessed: chunks.length,
        totalChars: research_text.length,
        processingTimeMs: duration
      },
      products: enrichedProducts,
      grouped: {
        quickWins,
        topPicks,
        trending,
        needsReview
      }
    });

  } catch (error) {
    console.error('[AI Analyze] Error:', error);
    return NextResponse.json({ 
      error: 'AI analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
