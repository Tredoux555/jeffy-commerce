# Viral Product Prediction Engine - Complete Documentation

**Status:** Stashed for Phase 2
**Built:** Dec 31, 2025

## Overview

This system predicts viral products for the South African market by:
- Scanning AliExpress trending products via their Affiliate API
- Analyzing Google Trends for SA market lag opportunities
- Using Claude AI to assess product viability
- Scoring products with SA-specific weights

## Files Included

### Core Library (`src/lib/_future/trends/`)
- `types.ts` - All TypeScript type definitions
- `scoring-engine.ts` - SA-optimized scoring algorithm
- `trend-service.ts` - Main orchestration service
- `services/aliexpress.ts` - AliExpress Affiliate API
- `services/google-trends.ts` - Google Trends integration
- `services/ai-analysis.ts` - Claude AI analysis

### API Routes (`src/app/api/_future/trends/`)
- `route.ts` - Main trends endpoint
- `stats/route.ts` - Dashboard statistics
- `refresh/route.ts` - Score refresh trigger
- `ai-batch/route.ts` - Batch AI analysis
- `categories/route.ts` - Category breakdown
- `review/route.ts` - Products for review
- `[id]/route.ts` - Single product details
- `[id]/analyze/route.ts` - AI analysis trigger
- `[id]/chart/route.ts` - Chart data

### Admin Dashboard (`src/app/admin/_future/trends/`)
- `page.tsx` - Main dashboard
- `[id]/page.tsx` - Product detail page

### CLI Tool (`src/cli/_future/`)
- `trends.ts` - Command-line scanner

### Database Migration (`supabase/migrations/_future/`)
- `004_trend_prediction.sql` - Full schema

## Activation Checklist

When ready to deploy:

1. Move files from `_future` directories to main directories
2. Run SQL migration in Supabase
3. Install dependencies:
   ```bash
   npm install google-trends-api commander ora cli-table3 chalk crypto-js
   npm install -D @types/crypto-js
   ```
4. Add environment variables to Railway:
   ```
   ALIEXPRESS_APP_KEY=xxx
   ALIEXPRESS_APP_SECRET=xxx
   ALIEXPRESS_TRACKING_ID=xxx
   ```
5. Update imports (remove `_future` from paths)
6. Add `/admin/trends` to admin navigation
7. Test with `npm run trends:stats`
8. Deploy to Railway

## SA-Specific Scoring

The scoring engine uses weights optimized for South Africa:
- TikTok velocity: 20%
- AliExpress velocity: 20%
- Price score: 20% (R500 ceiling for impulse)
- Google interest: 15%
- Mobile-friendly: 10%
- Supplier quality: 10%
- Category adoption: 5%

## Monthly Costs

When active:
- Supabase: ~$25/month (existing)
- Claude API: ~$20-70/month (usage-based)
- Total: ~$45-95/month additional

## Why Stashed?

1. Core commerce (1688 pipeline, Zone Partners) is priority
2. No point paying for APIs until commerce is working
3. Need product catalog before trend scanning matters
4. One major system at a time
