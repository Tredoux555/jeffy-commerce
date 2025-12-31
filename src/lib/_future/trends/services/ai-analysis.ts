// ============================================================================
// JEFFY COMMERCE: Claude AI Product Analysis
// STATUS: FUTURE - See README.md for activation
// ============================================================================

import Anthropic from '@anthropic-ai/sdk';
import { TrendProduct, AIRecommendation, TrendAIAnalysis } from '../types';

const client = new Anthropic();

export interface AIProductAnalysis {
  sa_viability_score: number;
  reasoning: string;
  target_demographic: string;
  marketing_angle: string;
  risks: string[];
  opportunities: string[];
  recommendation: AIRecommendation;
  suggested_retail_price_zar: number;
  suggested_category: string;
}

const SA_ANALYSIS_PROMPT = `You are analyzing a product for the South African market. Consider:

1. **Price Sensitivity**: SA consumers are price-conscious. R500 is the impulse buy ceiling.
2. **Mobile-First**: 90% shop on mobile. Product must photograph well.
3. **TikTok Influence**: Viral products from TikTok take 2-6 months to hit SA.
4. **Duty Impact**: Clothing = 45%, electronics = 0%, cosmetics = 20%.
5. **Load Shedding**: Power-related products perform exceptionally well.
6. **Trust Issues**: SA shoppers are skeptical of unknown brands.

Analyze this product and provide:
- SA viability score (0-100)
- Target demographic (age, income, location)
- Marketing angle for SA
- Top 3 risks
- Top 3 opportunities
- Recommendation: approve/reject/monitor/needs_review
- Suggested retail price in ZAR
- Best category for SA market`;

export async function analyzeProduct(
  product: Partial<TrendProduct>,
  context: { price_score?: number; mobile_friendly?: boolean }
): Promise<AIProductAnalysis> {
  const productInfo = `
Product: ${product.name}
Category: ${product.category} > ${product.subcategory || 'N/A'}
Source Price: $${product.source_price_usd || 'N/A'} USD
Estimated Landed Cost: R${product.estimated_landed_cost_zar || 'N/A'}
Price Score: ${context.price_score || 'N/A'}/100
Mobile Friendly: ${context.mobile_friendly ? 'Yes' : 'No'}
Source: ${product.source}
`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `${SA_ANALYSIS_PROMPT}\n\n${productInfo}\n\nRespond in JSON format with keys: sa_viability_score, reasoning, target_demographic, marketing_angle, risks (array), opportunities (array), recommendation, suggested_retail_price_zar, suggested_category`
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error('No JSON in response');
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      sa_viability_score: parsed.sa_viability_score || 50,
      reasoning: parsed.reasoning || '',
      target_demographic: parsed.target_demographic || '',
      marketing_angle: parsed.marketing_angle || '',
      risks: parsed.risks || [],
      opportunities: parsed.opportunities || [],
      recommendation: parsed.recommendation || 'needs_review',
      suggested_retail_price_zar: parsed.suggested_retail_price_zar || 0,
      suggested_category: parsed.suggested_category || product.category || '',
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      sa_viability_score: 50,
      reasoning: 'Analysis failed',
      target_demographic: 'Unknown',
      marketing_angle: '',
      risks: ['Analysis failed'],
      opportunities: [],
      recommendation: 'needs_review',
      suggested_retail_price_zar: 0,
      suggested_category: product.category || '',
    };
  }
}

export function transformToDBFormat(productId: string, analysis: AIProductAnalysis): Partial<TrendAIAnalysis> {
  return {
    product_id: productId,
    sa_viability_score: analysis.sa_viability_score,
    reasoning: analysis.reasoning,
    target_demographic: analysis.target_demographic,
    marketing_angle: analysis.marketing_angle,
    risks: analysis.risks,
    opportunities: analysis.opportunities,
    recommendation: analysis.recommendation,
    suggested_retail_price_zar: analysis.suggested_retail_price_zar,
    suggested_category: analysis.suggested_category,
    model_version: 'claude-sonnet-4-20250514',
  };
}

export const aiAnalysisService = {
  analyzeProduct,
  transformToDBFormat,
};

export default aiAnalysisService;
