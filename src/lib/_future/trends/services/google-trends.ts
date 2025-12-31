// ============================================================================
// JEFFY COMMERCE: Google Trends Integration
// Uses google-trends-api package for search interest data
// STATUS: FUTURE - See README.md for activation
// ============================================================================

// @ts-ignore - google-trends-api doesn't have types
import googleTrends from 'google-trends-api';
import { GoogleTrendsSignal, GoogleTrendsResult } from '../types';

const config = {
  defaultGeo: 'ZA',
  defaultCategory: 0,
  timezone: 120,
};

export async function getInterestOverTime(options: {
  keyword: string;
  startTime?: Date;
  endTime?: Date;
  geo?: string;
}): Promise<{ date: string; value: number }[]> {
  const {
    keyword,
    startTime = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endTime = new Date(),
    geo = config.defaultGeo,
  } = options;

  try {
    const result = await googleTrends.interestOverTime({
      keyword, startTime, endTime, geo,
      timezone: config.timezone,
    });

    const data = JSON.parse(result);
    return (data.default?.timelineData || []).map((item: any) => ({
      date: item.formattedTime,
      value: item.value[0] || 0,
    }));
  } catch (error) {
    console.error(`Failed to get interest for "${keyword}":`, error);
    return [];
  }
}

export async function getRelatedQueries(keyword: string, geo = 'ZA'): Promise<{ rising: string[]; top: string[] }> {
  try {
    const result = await googleTrends.relatedQueries({ keyword, geo, timezone: config.timezone });
    const data = JSON.parse(result);
    return {
      rising: (data.default?.rankedList?.[0]?.rankedKeyword || []).slice(0, 10).map((i: any) => i.query),
      top: (data.default?.rankedList?.[1]?.rankedKeyword || []).slice(0, 10).map((i: any) => i.query),
    };
  } catch {
    return { rising: [], top: [] };
  }
}

export async function compareRegionalInterest(keyword: string): Promise<{ za: number; us: number; uk: number; lag_indicator: number }> {
  try {
    const result = await googleTrends.interestByRegion({ keyword, resolution: 'COUNTRY', timezone: config.timezone });
    const data = JSON.parse(result);
    const geoMapData = data.default?.geoMapData || [];

    const findValue = (code: string) => geoMapData.find((r: any) => r.geoCode === code)?.value?.[0] || 0;
    const za = findValue('ZA'), us = findValue('US'), uk = findValue('GB');
    const avgDeveloped = (us + uk) / 2;
    
    return { za, us, uk, lag_indicator: avgDeveloped > 0 ? (avgDeveloped - za) / avgDeveloped : 0 };
  } catch {
    return { za: 0, us: 0, uk: 0, lag_indicator: 0 };
  }
}

export const SA_TRENDING_KEYWORDS = [
  'solar panel', 'power bank', 'led lights', 'rechargeable', 'battery backup',
  'phone case', 'earbuds', 'smart watch', 'ring light', 'tripod',
  'skincare', 'lip gloss', 'makeup brush', 'face mask', 'serum',
  'kitchen gadget', 'organization', 'cleaning', 'storage',
  'resistance bands', 'yoga mat', 'water bottle', 'gym bag',
];

export async function findSAOpportunities(keywords: string[] = SA_TRENDING_KEYWORDS) {
  const opportunities: { keyword: string; opportunity_score: number; regional: { za: number; us: number; uk: number } }[] = [];

  for (const keyword of keywords) {
    try {
      const regional = await compareRegionalInterest(keyword);
      if (regional.lag_indicator > 0.3) {
        opportunities.push({
          keyword,
          opportunity_score: regional.lag_indicator * 100,
          regional: { za: regional.za, us: regional.us, uk: regional.uk },
        });
      }
      await new Promise(r => setTimeout(r, 300));
    } catch {}
  }

  return opportunities.sort((a, b) => b.opportunity_score - a.opportunity_score);
}

export const googleTrendsService = {
  getInterestOverTime,
  getRelatedQueries,
  compareRegionalInterest,
  findSAOpportunities,
  SA_TRENDING_KEYWORDS,
};

export default googleTrendsService;
