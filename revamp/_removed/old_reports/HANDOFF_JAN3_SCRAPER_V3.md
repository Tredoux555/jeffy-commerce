# HANDOFF: 1688 Premium Scraper v3 - Jan 3 2026

## CURRENT STATUS
**Enrichment v3 is RUNNING** - processing ~167 products with the new premium scraper.

Check progress:
```bash
tail -50 /Users/tredouxwillemse/Desktop/jeffy-mvp/enrichment-v3.log
```

## WHAT WAS FIXED

### The Problem
Previous scraper was broken:
- **Titles**: Grabbed company names (e.g., "广州市海诗生物科技有限公司") instead of product titles
- **Prices**: All showed ¥1 (defaulted to R200)
- **Variants**: None captured

### Root Cause Discovery
Did deep inspection of live 1688 product pages and found:
- `h1` tag contains **COMPANY NAME**, not product title
- Product title is in `document.title` (strip " - 阿里巴巴" suffix)
- Prices in `.module-od-main-price` element
- Variants in `[class*="sku"] [class*="item"]` with embedded prices like "30 inches 1b\n¥3.29"

### The Solution: Premium Scraper v3
**File**: `/Users/tredouxwillemse/Desktop/jeffy-mvp/scripts/enrich-premium-v3.js`

Key improvements:
1. **Title**: Extracts from `document.title`, strips suffix
2. **Prices**: Parses `.module-od-main-price` for price range (¥min - ¥max)
3. **Variants**: Full extraction with name, price, image, and attributes (color/length)
4. **Images**: Gets full-size URLs by converting `_sum.jpg` → `_b.jpg`
5. **MOQ**: Extracts from "XPCS起批" pattern

## HOW TO USE

### Test on current page:
```bash
cd /Users/tredouxwillemse/Desktop/jeffy-mvp
node scripts/enrich-premium-v3.js --test
```

### Run enrichment:
```bash
# Make sure Electron browser is running first:
cd ~/Desktop/jeffy-mvp/jeffy-1688-browser && npm start

# Then run scraper:
cd ~/Desktop/jeffy-mvp
node scripts/enrich-premium-v3.js --limit=50
```

### Check if enrichment is still running:
```bash
ps aux | grep enrich-premium
tail -30 /Users/tredouxwillemse/Desktop/jeffy-mvp/enrichment-v3.log
```

## VERIFIED WORKING
Test run on 3 products showed:
- ✅ Real titles: "Cross-border rosemary essential oil scalp care essence..."
- ✅ Real prices: R255.00, R205.00 (calculated from ¥8, ¥2)
- ✅ 8-10 images uploaded per product
- ✅ 3-9 variants with images and attributes

## KEY FILES

| File | Purpose |
|------|---------|
| `scripts/enrich-premium-v3.js` | Working premium scraper (USE THIS) |
| `scripts/inspect-1688.js` | DOM inspection tool for debugging |
| `scripts/enrich-puppeteer.js` | Old Puppeteer scraper (deprecated - gets blocked) |
| `jeffy-1688-browser/` | Electron browser app (required for scraping) |
| `src/app/api/import/1688/enrich/route.ts` | API endpoint for saving enriched data |

## DATA FLOW
1. Scraper uses Electron browser API (port 3688) to navigate 1688 pages
2. JavaScript executed in webview extracts title, prices, variants, images
3. Data sent to `PUT /api/import/1688/enrich`
4. API downloads images to Supabase storage, calculates ZAR prices, updates DB

## PRICING FORMULA
```
Cost ZAR = CNY × 3.2
Landed = Cost + (0.5kg × R150 shipping)
Selling = Landed × 2.5 markup
Compare = Selling × 1.3
```

## IF ENRICHMENT FAILS
1. Check Electron browser is still running: `curl http://127.0.0.1:3688/status`
2. Restart browser if needed: `cd ~/Desktop/jeffy-mvp/jeffy-1688-browser && npm start`
3. Re-run: `node scripts/enrich-premium-v3.js --limit=50`

## NEXT STEPS AFTER ENRICHMENT
1. Check products in admin: https://jeffy.co.za/admin/products
2. Review titles/descriptions (may need translation cleanup)
3. Verify pricing makes sense
4. Publish best products to make them live
