# Jeffy 1688 Importer - Chrome Extension

Import products from 1688.com to Jeffy Commerce with one click!

## Features

✅ **One-Click Import** - Click "Send to Jeffy" on any 1688 product page
✅ **Auto Translation** - Chinese → English using Claude AI
✅ **Image OCR** - Reads Chinese text on product images
✅ **Smart Pricing** - Auto-calculates ZAR pricing with markup
✅ **Image Analysis** - Identifies text to remove/translate

## Installation

### Step 1: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder

### Step 2: Configure Jeffy API

The extension connects to `https://www.jeffy.co.za/api/import/1688`

Make sure your Jeffy deployment has:
- `ANTHROPIC_API_KEY` in environment variables
- (Optional) `REPLICATE_API_KEY` for auto text removal

## Usage

1. Browse products on [1688.com](https://detail.1688.com)
2. Open any product detail page
3. Look for the orange **"🚀 Send to Jeffy"** button (bottom right)
4. Click it!
5. Product is imported as **draft** in Jeffy admin

## What Gets Imported

| Field | Source |
|-------|--------|
| Title | Auto-translated from Chinese |
| Description | AI-generated from specs |
| Images | Up to 10 product images |
| Price | Calculated with markup (CNY → ZAR) |
| Variants | Extracted from SKU options |
| Supplier | Name, rating, location |
| 1688 URL | Original product link |

## Image Processing

The extension analyzes each image:
- Detects Chinese text overlays
- Recommends: keep / remove / translate
- Rates image quality (1-10)
- Provides cleaning instructions

### Auto Text Removal (Optional)

If you add `REPLICATE_API_KEY`:
- AI automatically removes Chinese text
- Returns clean product images
- Uses LaMa inpainting model

## Pricing Formula

```
Cost (ZAR) = (Price CNY × 3.2 + R75 shipping) × 1.15 duty
Selling = Cost × 2.5 markup × 1.15 VAT
Compare = Selling × 1.3 (shows "was" price)
```

## Troubleshooting

**Button not showing?**
- Make sure you're on a product detail page (URL contains `detail.1688.com`)
- Refresh the page

**Import failed?**
- Check Chrome DevTools console for errors
- Verify API is responding: visit `/api/import/1688`

**Images not analyzing?**
- Claude needs valid image URLs
- Some 1688 images may be protected

## Files

```
chrome-extension/
├── manifest.json      # Extension config
├── content.js         # Scrapes 1688 pages
├── content.css        # Floating button styles
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── background.js      # Stats tracking
└── icons/             # Extension icons
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/import/1688` | GET | Check API status |
| `/api/import/1688` | POST | Import product |
| `/api/import/1688/process-image` | POST | Analyze/clean images |

---

Made with 🧡 for Jeffy Commerce
