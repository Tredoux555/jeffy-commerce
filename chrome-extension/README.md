# Jeffy 1688 Importer - Chrome Extension

Import products from 1688.com directly into Jeffy Commerce with automatic:
- 🌐 Chinese → English translation
- 🖼️ Image OCR (reads Chinese text on images)
- 🧹 Text removal from product images
- 💰 Automatic ZAR pricing calculation
- 📦 Draft product creation in admin

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select this `chrome-extension` folder
5. You should see the Jeffy 1688 Importer icon in your toolbar

## Creating Icons

Before installing, create PNG icons from the SVG:

```bash
# Using ImageMagick (if installed)
convert icons/icon128.svg -resize 16x16 icons/icon16.png
convert icons/icon128.svg -resize 48x48 icons/icon48.png
convert icons/icon128.svg -resize 128x128 icons/icon128.png
```

Or use any image editor to create 16x16, 48x48, and 128x128 pixel PNGs with the Jeffy "J" logo.

## Usage

1. Go to any product page on 1688.com (detail.1688.com/...)
2. Look for the orange **"Send to Jeffy"** button (bottom right)
3. Click it!
4. Product will be:
   - Scraped (title, price, images, specs)
   - Translated to English
   - Images analyzed for Chinese text
   - Text removed from images (if enabled)
   - Created as draft in Jeffy admin

## API Endpoints

The extension communicates with these Jeffy APIs:

- `POST /api/import/1688` - Main import endpoint
- `POST /api/import/1688/process-image` - Image processing
- `GET /api/import/1688` - Status check

## Environment Variables Required

In your Jeffy `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...     # For translation & OCR
REPLICATE_API_TOKEN=r8_...        # For image processing (optional)
```

## Testing

1. Go to `/admin/import` in Jeffy
2. Test image processing with a 1688 image URL
3. Test full import pipeline

## Troubleshooting

**Button doesn't appear:**
- Make sure you're on a product detail page (URL contains `detail.1688.com`)
- Refresh the page
- Check Chrome console for errors

**Import fails:**
- Check Jeffy API status at `/api/import/1688`
- Ensure ANTHROPIC_API_KEY is set
- Check Vercel logs for errors

**Images not processing:**
- REPLICATE_API_TOKEN is optional but needed for image cleanup
- Without it, original images are used

## Support

Contact Jeffy Commerce support or check the admin dashboard.
