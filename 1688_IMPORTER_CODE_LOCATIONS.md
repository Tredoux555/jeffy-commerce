# 1688 Importer - Source Code Locations

## 📍 Complete File Structure

### **Main API Endpoint** (Backend)
**Location:** `src/app/api/import/1688/route.ts`
- **Purpose:** Main API endpoint that receives product data and saves to database
- **Functions:**
  - `POST` - Import product from 1688
  - `GET` - List imported products
- **Key Features:**
  - Price calculation (CNY → ZAR)
  - SKU generation
  - Slug generation
  - Duplicate detection
  - Database insertion
  - Import logging

---

### **Core Scraper Library** (`src/lib/scraper/`)

#### 1. **Types & Interfaces**
**Location:** `src/lib/scraper/types.ts`
- TypeScript interfaces for:
  - `Raw1688Product` - Raw data from 1688
  - `JeffyProductImport` - Processed product for Jeffy
  - `PricingConfig` - Pricing configuration
  - `TranslationProvider` - Translation service types

#### 2. **URL Parser**
**Location:** `src/lib/scraper/url-parser.ts`
- Functions:
  - `parse1688Url(url: string)` - Extract product ID from 1688 URL
  - `isValidProductId(productId: string)` - Validate product ID
  - `extractMultiple1688Urls(text: string)` - Extract multiple URLs from text
  - `generateSku(productId: string)` - Generate SKU from product ID

#### 3. **Translation Service**
**Location:** `src/lib/scraper/translation.ts`
- Multi-provider translation:
  - Google Translate
  - DeepL
  - OpenAI
  - Mock (for testing)
- Functions:
  - `translateText(text: string, provider: string)` - Translate Chinese to English

#### 4. **Price Calculator**
**Location:** `src/lib/scraper/price-calculator.ts`
- Functions:
  - `calculateSellingPrice(costCNY: number, weight?: number)` - Calculate ZAR selling price
  - Price includes:
    - Exchange rate (CNY → ZAR)
    - Shipping costs
    - Markup percentage
    - Rounds to nearest R5

#### 5. **Product Processor**
**Location:** `src/lib/scraper/product-processor.ts`
- Functions:
  - `processProduct(raw: Raw1688Product, config: PricingConfig)` - Convert 1688 data to Jeffy format
  - `validateProduct(product: JeffyProductImport)` - Validate processed product
  - `cleanProductName(name: string)` - Clean product names

#### 6. **Mock Scraper** (For Testing)
**Location:** `src/lib/scraper/mock-scraper.ts`
- Functions:
  - `mockScrapeProduct(productId: string)` - Generate mock 1688 product data
  - `mockScrapeWithDelay(productId: string, delay: number)` - Mock with delay

#### 7. **Index/Exports**
**Location:** `src/lib/scraper/index.ts`
- Exports all functions and types from the scraper library

---

### **UI Components** (`src/components/scraper/`)

#### 1. **Single Product Importer**
**Location:** `src/components/scraper/single-product-importer.tsx`
- **Purpose:** Import one product at a time
- **Features:**
  - URL input
  - Product preview
  - Price calculation display
  - Import to database

#### 2. **Bulk Import Queue**
**Location:** `src/components/scraper/bulk-import-queue.tsx`
- **Purpose:** Batch import multiple products
- **Features:**
  - Queue management
  - Progress tracking
  - Batch processing
  - Error handling

#### 3. **Agent Order Export**
**Location:** `src/components/scraper/agent-order-export.tsx`
- **Purpose:** Export orders for China agent
- **Features:**
  - Order selection
  - Export to CSV/Excel
  - Agent communication

#### 4. **Component Exports**
**Location:** `src/components/scraper/index.ts`
- Exports all scraper components

---

### **Chrome Extension** (`chrome-extension/`)

#### 1. **Content Script**
**Location:** `chrome-extension/content.js`
- **Purpose:** Runs on 1688.com product pages
- **Features:**
  - Detects product pages
  - Creates floating "Send to Jeffy" button
  - Scrapes product data from page
  - Sends data to API endpoint

#### 2. **Background Script**
**Location:** `chrome-extension/background.js`
- **Purpose:** Extension background service
- **Features:**
  - Extension lifecycle management
  - Message handling

#### 3. **Popup UI**
**Location:** `chrome-extension/popup.html` & `popup.js`
- **Purpose:** Extension popup interface
- **Features:**
  - Quick import
  - Status display
  - Settings

#### 4. **Manifest**
**Location:** `chrome-extension/manifest.json`
- Extension configuration
- Permissions
- Content script injection rules

#### 5. **Styling**
**Location:** `chrome-extension/content.css`
- Styles for floating button and UI

---

### **Additional API Routes**

#### Image Processing
**Location:** `src/app/api/import/1688/process-image/route.ts`
- **Purpose:** Process product images
- **Features:**
  - Image analysis
  - Text extraction from images
  - Image optimization

---

### **Database Migrations**

#### Import System Schema
**Location:** `migrations/1688_import_system.sql`
- Database schema for:
  - Import logs table
  - Product source tracking
  - Import history

---

## 📦 How to Share with Claude

### **Option 1: Share Entire Directory**
Share these directories:
```
src/lib/scraper/          (All core library files)
src/components/scraper/   (All UI components)
src/app/api/import/1688/  (API endpoint)
chrome-extension/         (Chrome extension)
```

### **Option 2: Share Key Files**
Essential files to share:
1. `src/lib/scraper/types.ts` - All type definitions
2. `src/lib/scraper/url-parser.ts` - URL parsing logic
3. `src/lib/scraper/price-calculator.ts` - Pricing logic
4. `src/lib/scraper/product-processor.ts` - Product processing
5. `src/app/api/import/1688/route.ts` - Main API endpoint
6. `src/components/scraper/single-product-importer.tsx` - UI component
7. `chrome-extension/content.js` - Chrome extension scraper

### **Option 3: Share Specific Feature**
If Claude needs a specific feature:
- **URL Parsing:** `src/lib/scraper/url-parser.ts`
- **Price Calculation:** `src/lib/scraper/price-calculator.ts`
- **Product Processing:** `src/lib/scraper/product-processor.ts`
- **API Integration:** `src/app/api/import/1688/route.ts`
- **Chrome Extension:** `chrome-extension/content.js`

---

## 🔗 File Relationships

```
Chrome Extension (content.js)
    ↓ (scrapes data)
    ↓ (sends to API)
API Endpoint (route.ts)
    ↓ (uses)
Scraper Library (lib/scraper/)
    ├── url-parser.ts
    ├── price-calculator.ts
    ├── product-processor.ts
    └── translation.ts
    ↓ (saves to)
Database (Supabase)
```

---

## 📝 Quick Reference

**Main Entry Point:** `src/app/api/import/1688/route.ts`

**Core Library:** `src/lib/scraper/`

**UI Components:** `src/components/scraper/`

**Chrome Extension:** `chrome-extension/`

**Database Schema:** `migrations/1688_import_system.sql`

---

## 🎯 Most Important Files for Claude

1. **`src/lib/scraper/types.ts`** - Understand data structures
2. **`src/lib/scraper/product-processor.ts`** - Core processing logic
3. **`src/app/api/import/1688/route.ts`** - API integration
4. **`chrome-extension/content.js`** - Web scraping logic

---

**Last Updated:** 2025-01-27

