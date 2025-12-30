import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Common product translations for 1688 searching
const PRODUCT_TRANSLATIONS: Record<string, string> = {
  // Beauty & Personal Care
  'led skincare': 'LED美容仪',
  'led face mask': 'LED面罩美容仪',
  'pimple patch': '痘痘贴',
  'acne patch': '痤疮贴',
  'hair growth serum': '生发精华液',
  'jade roller': '玉石滚轮',
  'gua sha': '刮痧板',
  'face massager': '面部按摩器',
  'beauty device': '美容仪器',
  'makeup brush': '化妆刷',
  'eyelash': '假睫毛',
  
  // Pet Supplies
  'pet gps collar': '宠物GPS项圈',
  'pet camera': '宠物摄像头',
  'dog toy': '狗玩具',
  'cat toy': '猫玩具',
  'pet grooming': '宠物美容工具',
  'dog harness': '狗胸背带',
  'cat scratching': '猫抓板',
  'pet bed': '宠物窝',
  'dog leash': '狗牵引绳',
  
  // Health & Wellness
  'massage gun': '筋膜枪',
  'resistance band': '弹力带',
  'yoga mat': '瑜伽垫',
  'posture corrector': '矫姿带',
  'foam roller': '泡沫轴',
  'fitness tracker': '运动手环',
  'jump rope': '跳绳',
  'dumbbell': '哑铃',
  
  // Home & Kitchen
  'air fryer accessories': '空气炸锅配件',
  'electric scrubber': '电动清洁刷',
  'storage organizer': '收纳盒',
  'kitchen gadget': '厨房小工具',
  'vacuum sealer': '真空封口机',
  'ice maker': '制冰机',
  'blender': '搅拌机',
  
  // Electronics
  'magsafe': 'MagSafe配件',
  'phone mount': '手机支架',
  'led projector': 'LED投影仪',
  'wireless charger': '无线充电器',
  'power bank': '充电宝',
  'bluetooth speaker': '蓝牙音箱',
  'earbuds': '蓝牙耳机',
  'ring light': '环形补光灯',
  
  // Baby & Kids
  'busy board': '忙碌板',
  'montessori toy': '蒙特梭利玩具',
  'baby monitor': '婴儿监视器',
  'stroller accessories': '婴儿车配件',
  'teething toy': '磨牙玩具',
  
  // Car Accessories
  'car phone mount': '车载手机支架',
  'car organizer': '车载收纳',
  'car vacuum': '车载吸尘器',
  'seat cover': '汽车座套',
  'dash cam': '行车记录仪',
  
  // Smart Home
  'smart plug': '智能插座',
  'led strip': 'LED灯带',
  'humidifier': '加湿器',
  'air purifier': '空气净化器',
  'robot vacuum': '扫地机器人',
  
  // Drinkware
  'stanley cup': '保温杯',
  'stanley': '史丹利保温杯',
  'tumbler': '不锈钢保温杯',
  'water bottle': '水杯',
  'insulated bottle': '保温水壶',
  'quencher': '大容量保温杯',
  'insulated tumbler': '保温杯大容量',
  
  // Fashion Accessories
  'hair clip': '发夹',
  'scrunchie': '发圈',
  'tote bag': '托特包',
  'crossbody bag': '斜挎包',
  'jewelry': '饰品',
  'sunglasses': '太阳镜',
};

// Category keywords for broader searches
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'beauty': ['美容仪', '护肤工具', '化妆品', '美妆工具'],
  'pet': ['宠物用品', '宠物玩具', '宠物服装'],
  'health': ['健身器材', '按摩器', '运动用品'],
  'home': ['家居用品', '厨房用品', '收纳用品'],
  'electronics': ['电子配件', '数码配件', '3C配件'],
  'baby': ['母婴用品', '儿童玩具', '婴儿用品'],
  'car': ['汽车用品', '车载配件'],
  'smart': ['智能家居', '智能设备'],
  'drinkware': ['保温杯', '水杯', '杯子'],
  'fashion': ['时尚配饰', '饰品', '包包'],
};

interface ExtractedProduct {
  name: string;
  category: string;
  chineseKeywords: string[];
  searchUrls: {
    url: string;
    keyword: string;
    type: 'exact' | 'category' | 'broad';
  }[];
  priceRange: {
    retailUsd: string;
    oemUsd: string;
    margin: string;
  } | null;
  notes: string[];
  priority: number;
}

function generate1688Url(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  return `https://s.1688.com/selloffer/offer_search.htm?keywords=${encoded}`;
}

function generateFactoryFilterUrl(keyword: string): string {
  const encoded = encodeURIComponent(keyword);
  // Add factory filter parameters - sorted by trade volume
  return `https://s.1688.com/selloffer/offer_search.htm?keywords=${encoded}&descendOrder=tradenumaliScore30D`;
}

function extractProducts(text: string): ExtractedProduct[] {
  const products: ExtractedProduct[] = [];
  const seenProducts = new Set<string>();
  
  // Pattern matching for product mentions with prices
  // e.g., "LED skincare devices (source $15-25, sell $60-100)"
  const pricePattern = /([a-zA-Z][a-zA-Z\s\-\/]+?)[\s]*\((?:source|cost|oem|factory)[\s:]*\$?([\d\.\-]+)[\s,]*(?:sell|retail|price)[\s:]*\$?([\d\.\-]+)\)/gi;
  
  const fullText = text.toLowerCase();
  
  // Extract products with pricing
  let match;
  while ((match = pricePattern.exec(text)) !== null) {
    const productName = match[1].trim().toLowerCase();
    if (seenProducts.has(productName) || productName.length < 3) continue;
    seenProducts.add(productName);
    
    const product = createProductEntry(productName, match[2], match[3]);
    if (product) products.push(product);
  }
  
  // Extract from translation dictionary matches
  for (const [english, chinese] of Object.entries(PRODUCT_TRANSLATIONS)) {
    if (fullText.includes(english.toLowerCase()) && !seenProducts.has(english)) {
      seenProducts.add(english);
      const product = createProductEntry(english, null, null);
      if (product) products.push(product);
    }
  }
  
  // Look for specific high-value products mentioned
  const highValueProducts = [
    'stanley', 'quencher', 'tumbler', 'massage gun', 'led mask', 'ring light',
    'air fryer', 'busy board', 'gua sha', 'jade roller', 'resistance band',
    'phone mount', 'wireless charger', 'pet camera', 'dog harness', 'insulated',
    'stainless steel', 'portable', 'electric', 'smart', 'bluetooth', 'wireless'
  ];
  
  for (const product of highValueProducts) {
    if (fullText.includes(product) && !seenProducts.has(product)) {
      seenProducts.add(product);
      const entry = createProductEntry(product, null, null);
      if (entry) products.push(entry);
    }
  }
  
  // Sort by priority
  products.sort((a, b) => b.priority - a.priority);
  
  return products;
}

function createProductEntry(
  name: string, 
  sourcePriceStr: string | null, 
  retailPriceStr: string | null
): ExtractedProduct | null {
  const normalizedName = name.toLowerCase().trim();
  const chineseKeywords: string[] = [];
  const searchUrls: ExtractedProduct['searchUrls'] = [];
  const notes: string[] = [];
  
  // Find exact Chinese translation
  for (const [english, chinese] of Object.entries(PRODUCT_TRANSLATIONS)) {
    if (normalizedName.includes(english) || english.includes(normalizedName)) {
      if (!chineseKeywords.includes(chinese)) {
        chineseKeywords.push(chinese);
      }
    }
  }
  
  // Find category matches
  let detectedCategory = 'general';
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (normalizedName.includes(category) || 
        keywords.some(k => normalizedName.includes(k.toLowerCase()))) {
      detectedCategory = category;
      // Add category keywords as fallback
      keywords.slice(0, 2).forEach(k => {
        if (!chineseKeywords.includes(k)) {
          chineseKeywords.push(k);
        }
      });
      break;
    }
  }
  
  // If no Chinese keywords found, try to infer
  if (chineseKeywords.length === 0) {
    // Add generic search based on category detection
    if (normalizedName.includes('cup') || normalizedName.includes('bottle') || normalizedName.includes('tumbler')) {
      chineseKeywords.push('保温杯', '不锈钢杯', '大容量保温杯');
      detectedCategory = 'drinkware';
    } else if (normalizedName.includes('light') || normalizedName.includes('led')) {
      chineseKeywords.push('LED灯', '补光灯');
      detectedCategory = 'electronics';
    } else if (normalizedName.includes('bag')) {
      chineseKeywords.push('包包', '手提包');
      detectedCategory = 'fashion';
    } else if (normalizedName.includes('stanley') || normalizedName.includes('quencher')) {
      chineseKeywords.push('史丹利同款保温杯', '保温杯40oz', '大容量吸管杯');
      detectedCategory = 'drinkware';
    }
  }
  
  // Generate search URLs for each Chinese keyword
  chineseKeywords.forEach((keyword, index) => {
    searchUrls.push({
      url: generate1688Url(keyword),
      keyword: keyword,
      type: index === 0 ? 'exact' : 'broad'
    });
    
    // Also add factory-filtered version for primary keyword
    if (index === 0) {
      searchUrls.push({
        url: generateFactoryFilterUrl(keyword),
        keyword: `${keyword} (热销排序)`,
        type: 'exact'
      });
    }
  });
  
  // Add OEM-specific search terms
  if (chineseKeywords.length > 0) {
    const oemKeyword = chineseKeywords[0] + ' 源头工厂';
    searchUrls.push({
      url: generate1688Url(oemKeyword),
      keyword: oemKeyword,
      type: 'exact'
    });
  }
  
  // Calculate margin if prices provided
  let priceRange = null;
  if (sourcePriceStr && retailPriceStr) {
    const sourcePrice = parseFloat(sourcePriceStr.split('-')[0]);
    const retailPrice = parseFloat(retailPriceStr.split('-')[0]);
    if (sourcePrice && retailPrice) {
      const margin = Math.round((1 - sourcePrice / retailPrice) * 100);
      priceRange = {
        retailUsd: retailPriceStr,
        oemUsd: sourcePriceStr,
        margin: `${margin}%`
      };
      notes.push(`Margin potential: ${margin}%`);
    }
  }
  
  // Priority scoring
  let priority = 0;
  if (priceRange) priority += 3;
  if (chineseKeywords.length > 0) priority += 2;
  if (['beauty', 'pet', 'health', 'drinkware'].includes(detectedCategory)) priority += 2;
  if (searchUrls.length >= 2) priority += 1;
  
  if (searchUrls.length === 0) {
    return null; // Skip if we can't generate any search URLs
  }
  
  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    category: detectedCategory,
    chineseKeywords,
    searchUrls,
    priceRange,
    notes,
    priority
  };
}

export async function POST(request: NextRequest) {
  try {
    const { research_text, save_to_db } = await request.json();
    
    if (!research_text || research_text.length < 50) {
      return NextResponse.json({ 
        error: 'Research text too short. Paste your full research.' 
      }, { status: 400 });
    }
    
    // Extract products and generate links
    const products = extractProducts(research_text);
    
    // Generate summary stats
    const categories = [...new Set(products.map(p => p.category))];
    const totalLinks = products.reduce((sum, p) => sum + p.searchUrls.length, 0);
    
    // Optionally save to database
    if (save_to_db && products.length > 0) {
      // Save the analysis as a research entry
      const { error } = await supabase
        .from('oem_research')
        .insert({
          product_name: `Research Analysis - ${new Date().toLocaleDateString()}`,
          product_category: categories.join(', '),
          raw_research: research_text,
          key_findings: products.slice(0, 10).map(p => 
            `${p.name}: ${p.chineseKeywords.join(', ')} ${p.priceRange ? `(${p.priceRange.margin} margin)` : ''}`
          ),
          tags: ['auto-analyzed', ...categories],
          source: 'Research Analyzer',
          research_status: 'draft',
          priority: 5
        });
        
      if (error) {
        console.error('Error saving to DB:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        productsFound: products.length,
        categoriesDetected: categories,
        totalSearchLinks: totalLinks,
        topCategories: categories.slice(0, 5)
      },
      products: products.slice(0, 50), // Limit to top 50
      quickLinks: products.slice(0, 10).flatMap(p => 
        p.searchUrls.slice(0, 1).map(u => ({
          product: p.name,
          keyword: u.keyword,
          url: u.url
        }))
      )
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze research' }, { status: 500 });
  }
}
