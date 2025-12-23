import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const TMAPI_KEY = process.env.TMAPI_API_KEY || '';
const TMAPI_BASE = 'https://api.tmapi.top';

interface Product1688 {
  id: string;
  title: string;
  titleCn: string;
  price: number;
  priceRange: { min: number; max: number };
  moq: number;
  sales30d: number;
  mainImage: string;
  images: string[];
  supplierName: string;
  supplierRating: number;
  supplierYears: number;
  supplierLocation: string;
  url: string;
}

async function optimizeSearchKeywords(query: string): Promise<{ cn: string; en: string; tags: string[] }> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are an expert at sourcing products from 1688.com (China's largest B2B wholesale platform).

Given this English product search query: "${query}"

Generate optimized Chinese search keywords for 1688.com that will find the best wholesale/export products.

Rules:
1. Translate to Chinese using terms commonly used on 1688
2. Add relevant tags like 外贸 (export), 工厂直销 (factory direct), 批发 (wholesale) if appropriate
3. Include product category terms that Chinese suppliers use
4. Avoid overly specific brand names (use generic product terms)

Respond in this exact JSON format only, no other text:
{
  "cn": "Chinese search keywords",
  "en": "English translation of keywords", 
  "tags": ["tag1", "tag2"],
  "reasoning": "Brief explanation of why these keywords work"
}`
    }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    return { cn: query, en: query, tags: [] };
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse keyword optimization:', e);
  }

  return { cn: query, en: query, tags: [] };
}

async function search1688Products(keywordsCn: string, limit: number = 10): Promise<Product1688[]> {
  if (TMAPI_KEY) {
    try {
      const response = await fetch(
        `${TMAPI_BASE}/ali/search/items?keyword=${encodeURIComponent(keywordsCn)}&page=1&pageSize=${limit}&apiToken=${TMAPI_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        return (data.data?.items || []).map((item: any) => ({
          id: item.itemId || item.id,
          title: item.title,
          titleCn: item.titleCn || item.title,
          price: parseFloat(item.price || 0),
          priceRange: {
            min: parseFloat(item.priceRange?.[0] || item.price || 0),
            max: parseFloat(item.priceRange?.[1] || item.price || 0),
          },
          moq: parseInt(item.moq || item.minOrder || 1),
          sales30d: parseInt(item.sales30d || item.sold || 0),
          mainImage: item.mainImage || item.image,
          images: item.images || [item.image],
          supplierName: item.shopName || item.sellerName || 'Unknown',
          supplierRating: parseFloat(item.shopScore || item.rating || 0),
          supplierYears: parseInt(item.shopYears || 0),
          supplierLocation: item.location || 'China',
          url: `https://detail.1688.com/offer/${item.itemId || item.id}.html`,
        }));
      }
    } catch (e) {
      console.error('TMAPI search failed:', e);
    }
  }
  return [];
}

async function getProductFromUrl(url: string): Promise<Product1688 | null> {
  const match = url.match(/offer\/(\d+)/);
  if (!match) return null;

  const offerId = match[1];

  if (TMAPI_KEY) {
    try {
      const response = await fetch(
        `${TMAPI_BASE}/ali/item/detail?itemId=${offerId}&apiToken=${TMAPI_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        const item = data.data;
        return {
          id: offerId,
          title: item.title,
          titleCn: item.titleCn || item.title,
          price: parseFloat(item.price || 0),
          priceRange: {
            min: parseFloat(item.priceRange?.[0] || item.price || 0),
            max: parseFloat(item.priceRange?.[1] || item.price || 0),
          },
          moq: parseInt(item.moq || 1),
          sales30d: parseInt(item.sales30d || 0),
          mainImage: item.mainImage,
          images: item.images || [],
          supplierName: item.shopName || 'Unknown',
          supplierRating: parseFloat(item.shopScore || 0),
          supplierYears: parseInt(item.shopYears || 0),
          supplierLocation: item.location || 'China',
          url: url,
        };
      }
    } catch (e) {
      console.error('TMAPI detail fetch failed:', e);
    }
  }

  return {
    id: offerId,
    title: 'Product from 1688',
    titleCn: '1688产品',
    price: 0,
    priceRange: { min: 0, max: 0 },
    moq: 1,
    sales30d: 0,
    mainImage: '',
    images: [],
    supplierName: 'Unknown',
    supplierRating: 0,
    supplierYears: 0,
    supplierLocation: 'China',
    url: url,
  };
}

async function analyzeAndRecommend(products: Product1688[], originalQuery: string): Promise<{
  productId: string;
  reasoning: string;
  priceAnalysis: string;
  qualityScore: number;
  valueScore: number;
} | null> {
  if (products.length === 0) return null;
  if (products.length === 1) {
    return {
      productId: products[0].id,
      reasoning: 'Only one product provided for analysis.',
      priceAnalysis: `Price: ¥${products[0].price}`,
      qualityScore: 70,
      valueScore: 70,
    };
  }

  const productSummaries = products.map((p, i) =>
    `${i + 1}. ID: ${p.id}
   Title: ${p.title}
   Price: ¥${p.price} (Range: ¥${p.priceRange.min}-${p.priceRange.max})
   MOQ: ${p.moq} units
   30-day Sales: ${p.sales30d}
   Supplier: ${p.supplierName} (Rating: ${p.supplierRating}, Years: ${p.supplierYears})
   Location: ${p.supplierLocation}`
  ).join('\n\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `You are an expert product sourcing analyst for a South African e-commerce company importing from China.

Original search query: "${originalQuery}"

Analyze these products from 1688.com and recommend the BEST one for resale in South Africa:

${productSummaries}

Consider:
1. Price competitiveness (lower is better, but not suspiciously low)
2. Sales volume (higher = proven demand, quality validation)
3. Supplier rating and years in business (reliability)
4. MOQ (lower is better for testing)
5. Value for money

Respond in this exact JSON format only:
{
  "productId": "the ID of the recommended product",
  "reasoning": "2-3 sentences explaining why this is the best choice",
  "priceAnalysis": "Brief price comparison and value assessment",
  "qualityScore": 0-100,
  "valueScore": 0-100
}`
    }]
  });

  const content = response.content[0];
  if (content.type !== 'text') return null;

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse recommendation:', e);
  }

  return null;
}

function calculatePricing(priceCny: number): {
  costZar: number;
  shippingZar: number;
  suggestedPrice: number;
  margin: number;
} {
  const exchangeRate = 3.2;
  const shippingPerUnit = 75;
  const markup = 2.5;
  const vat = 1.15;

  const costZar = priceCny * exchangeRate;
  const totalCost = costZar + shippingPerUnit;
  const suggestedPrice = Math.ceil(totalCost * markup * vat);
  const margin = ((suggestedPrice - totalCost) / suggestedPrice) * 100;

  return {
    costZar: Math.round(costZar * 100) / 100,
    shippingZar: shippingPerUnit,
    suggestedPrice,
    margin: Math.round(margin),
  };
}

async function translateProduct(product: Product1688): Promise<{
  title: string;
  description: string;
}> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Translate and optimize this Chinese product for a South African e-commerce store:

Chinese Title: ${product.titleCn}

Create:
1. An engaging English product title (max 80 chars, SEO-friendly)
2. A compelling product description (3-4 sentences highlighting features and benefits)

Target audience: South African consumers
Tone: Professional but friendly

Respond in JSON format:
{
  "title": "English product title",
  "description": "Product description"
}`
    }]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    return { title: product.title, description: '' };
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse translation:', e);
  }

  return { title: product.title, description: '' };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, url, products } = body;

    switch (action) {
      case 'optimize-keywords': {
        const keywords = await optimizeSearchKeywords(query);
        return NextResponse.json({ success: true, data: keywords });
      }

      case 'search': {
        const keywords = await optimizeSearchKeywords(query);
        const searchResults = await search1688Products(keywords.cn, 10);
        return NextResponse.json({
          success: true,
          data: {
            keywords,
            products: searchResults,
            apiEnabled: !!TMAPI_KEY,
          }
        });
      }

      case 'get-product': {
        const product = await getProductFromUrl(url);
        if (!product) {
          return NextResponse.json({ success: false, error: 'Invalid URL' }, { status: 400 });
        }
        const pricing = calculatePricing(product.price);
        const translation = await translateProduct(product);
        return NextResponse.json({
          success: true,
          data: { product, pricing, translation }
        });
      }

      case 'analyze': {
        const recommendation = await analyzeAndRecommend(products, query);
        const recommendedProduct = products.find((p: Product1688) => p.id === recommendation?.productId);
        const pricing = recommendedProduct ? calculatePricing(recommendedProduct.price) : null;

        return NextResponse.json({
          success: true,
          data: { recommendation, pricing }
        });
      }

      case 'translate': {
        const product = products[0];
        const translation = await translateProduct(product);
        return NextResponse.json({
          success: true,
          data: { translation }
        });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Smart Finder API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  if (action === 'status') {
    return NextResponse.json({
      success: true,
      data: {
        apiEnabled: !!TMAPI_KEY,
        anthropicEnabled: !!process.env.ANTHROPIC_API_KEY,
      }
    });
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}