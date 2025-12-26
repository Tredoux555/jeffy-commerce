// 1688 Scraper - Translation Service
// Supports multiple translation providers

import type { Raw1688Product } from './types';

export type TranslationProvider = 'google' | 'deepl' | 'openai' | 'mock';

interface TranslationConfig {
  provider: TranslationProvider;
  apiKey?: string;
  model?: string; // For OpenAI
}

// Main translation function
export async function translateText(
  text: string,
  config: TranslationConfig
): Promise<string> {
  if (!text || text.trim() === '') return '';
  
  switch (config.provider) {
    case 'google':
      return translateWithGoogle(text, config.apiKey);
    case 'deepl':
      return translateWithDeepL(text, config.apiKey);
    case 'openai':
      return translateWithOpenAI(text, config.apiKey, config.model);
    case 'mock':
    default:
      return mockTranslate(text);
  }
}

// Google Translate API
async function translateWithGoogle(text: string, apiKey?: string): Promise<string> {
  if (!apiKey) throw new Error('Google API key required');
  
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'zh-CN',
      target: 'en',
      format: 'text',
    }),
  });
  
  if (!response.ok) throw new Error('Google translation failed');
  const data = await response.json();
  return data.data.translations[0].translatedText;
}

// DeepL API
async function translateWithDeepL(text: string, apiKey?: string): Promise<string> {
  if (!apiKey) throw new Error('DeepL API key required');
  
  const url = 'https://api-free.deepl.com/v2/translate';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      text,
      source_lang: 'ZH',
      target_lang: 'EN',
    }),
  });
  
  if (!response.ok) throw new Error('DeepL translation failed');
  const data = await response.json();
  return data.translations[0].text;
}

// OpenAI API (better for product descriptions)
async function translateWithOpenAI(
  text: string,
  apiKey?: string,
  model: string = 'gpt-4o-mini'
): Promise<string> {
  if (!apiKey) throw new Error('OpenAI API key required');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in e-commerce product descriptions. Translate Chinese to English, making the text suitable for a South African online store. Keep product names accurate but make descriptions appealing to Western consumers.',
        },
        {
          role: 'user',
          content: `Translate this Chinese product text to English:\n\n${text}`,
        },
      ],
      temperature: 0.3,
    }),
  });
  
  if (!response.ok) throw new Error('OpenAI translation failed');
  const data = await response.json();
  return data.choices[0].message.content;
}

// Mock translation for testing (adds [EN] prefix)
function mockTranslate(text: string): string {
  // Common Chinese → English mappings for testing
  const commonWords: Record<string, string> = {
    '颜色': 'Color',
    '尺寸': 'Size',
    '材质': 'Material',
    '重量': 'Weight',
    '包装': 'Package',
    '数量': 'Quantity',
    '价格': 'Price',
    '库存': 'Stock',
    '新款': 'New Style',
    '热卖': 'Hot Sale',
    '包邮': 'Free Shipping',
  };
  
  let result = text;
  for (const [cn, en] of Object.entries(commonWords)) {
    result = result.replace(new RegExp(cn, 'g'), en);
  }
  
  return `[Translated] ${result}`;
}

// Translate entire product
export async function translateProduct(
  product: Raw1688Product,
  config: TranslationConfig
): Promise<Raw1688Product> {
  const translated = { ...product };
  
  // Translate title
  translated.titleTranslated = await translateText(product.title, config);
  
  // Translate description (strip HTML first for better results)
  const plainDesc = product.description.replace(/<[^>]*>/g, ' ').trim();
  translated.descriptionTranslated = await translateText(plainDesc, config);
  
  // Translate specifications
  translated.specificationsTranslated = {};
  for (const [key, value] of Object.entries(product.specifications)) {
    const translatedKey = await translateText(key, config);
    const translatedValue = await translateText(value, config);
    translated.specificationsTranslated[translatedKey] = translatedValue;
  }
  
  // Translate variants
  translated.variants = await Promise.all(
    product.variants.map(async (variant) => ({
      ...variant,
      nameTranslated: await translateText(variant.name, config),
      options: await Promise.all(
        variant.options.map(async (opt) => ({
          ...opt,
          valueTranslated: await translateText(opt.value, config),
        }))
      ),
    }))
  );
  
  return translated;
}

// Batch translate multiple texts (more efficient for APIs with batching)
export async function batchTranslate(
  texts: string[],
  config: TranslationConfig
): Promise<string[]> {
  // For now, translate one by one
  // TODO: Implement true batching for Google/DeepL
  return Promise.all(texts.map(text => translateText(text, config)));
}
