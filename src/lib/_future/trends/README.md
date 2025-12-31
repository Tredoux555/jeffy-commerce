# Viral Product Prediction Engine

**Status:** Stashed for Phase 2
**Built:** Dec 31, 2025
**Lines of Code:** 6,000+

## What This Does

Predicts viral products for the SA market by scanning AliExpress, 
Google Trends, and using Claude AI for analysis.

## To Activate

1. Move files from _future to main directories
2. Run database migration: 004_trend_prediction.sql
3. Install dependencies (see CURSOR_INSTRUCTIONS.md in docs/)
4. Set environment variables:
   - ALIEXPRESS_APP_KEY
   - ALIEXPRESS_APP_SECRET
   - ALIEXPRESS_TRACKING_ID
5. Add /admin/trends to navigation

## Monthly Cost When Active

~$45-95/month (Supabase + Claude API)

## File Structure

```
src/lib/_future/trends/
├── types.ts              - Type definitions
├── scoring-engine.ts     - SA scoring algorithm
├── trend-service.ts      - Main orchestration
└── services/
    ├── aliexpress.ts     - AliExpress API
    ├── google-trends.ts  - Google Trends
    └── ai-analysis.ts    - Claude analysis

src/app/api/_future/trends/     - API routes
src/app/admin/_future/trends/   - Dashboard pages
src/cli/_future/                - CLI tool
supabase/migrations/_future/    - DB migration
```

## Full Documentation

See docs/future-features/VIRAL_TRENDS_SYSTEM.md
