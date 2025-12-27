# JEFFY COMMERCE - COMPLETE HANDOFF DOCUMENT
## December 28, 2025

**USE THIS TO START A NEW CHAT WITH CLAUDE**

---

## 🚀 CURRENT SYSTEM STATUS

### Live Deployment
- **URL:** https://jeffy.co.za
- **Platform:** Railway
- **Status:** DEPLOYED AND WORKING
- **Last Commit:** fcc2466 (Chinese text replacement + real health check)

### Tech Stack
- Next.js 14.2.35
- Supabase (Database + Auth + Storage)
- PayFast (Payments with Split Payment capability)
- Tailwind CSS
- TypeScript

### Repository
- Location: `/Users/tredouxwillemse/Desktop/jeffy-mvp`
- Git status: CLEAN (no uncommitted changes)

---

## ✅ WHAT'S WORKING

### Core E-commerce
- Product catalog with categories
- Shopping cart
- Checkout (simplified - no map, city/province for zones)
- PayFast payment integration
- Order management in admin

### Zone Partner System
- Partner application form (4 steps: Personal → Zone → Insurance → Bank → Agreement)
- Admin dashboard for managing applications
- Zone assignment system

### Admin Features
- Product management (add/edit/delete)
- Image upload with AI analysis (Claude Vision)
- Chinese text replacement on product images
- Category management
- Order viewing
- Health check dashboard

### Special Features
- "Wants" system (customers request products)
- QR code scanning for products
- WhatsApp notifications
- Error monitoring with logging

---

## ⚠️ PENDING ITEMS (NOT YET BUILT)

### Critical Before Launch
1. **Run SQL for error_logs table** (created in code but may not exist in DB)
2. **Run SQL for categories table** (same)
3. **Test checkout flow end-to-end** after latest fixes
4. **PayFast Split Payments configuration** - accounts need setup

### Zone Partner System Phase 2
- Profit-sharing implementation (50/50 split)
- Partner dashboard (view earnings, orders, stock)
- Stock management per partner
- Automated weekly payouts

### 1688 Import System
- Scraper for Chinese product data
- Translation (Chinese → English)
- Automated product upload
- Agent communication system

---

## 📄 LEGAL DOCUMENTS CREATED (PDFs)

All in `/mnt/user-data/outputs/` and available for download:

1. **JEFFY_ZONE_PARTNER_AGREEMENT_v2.pdf** (14 pages)
   - CPA-compliant with cancellation notice on first page
   - 50% PROFIT split (not revenue)
   - Stock purchase model
   - Insurance requirements
   - Non-compete clauses

2. **JEFFY_RAPID_SCALE_PLAYBOOK.pdf** (12 pages)
   - Complete money flow calculations
   - Import duty breakdown (avoid clothing - 45% duty!)
   - Technology stack recommendations (~R13k/month)
   - Week-by-week action plan
   - Scaling warnings (what breaks at 10/25/50/100 partners)

3. **JEFFY_CHINA_SOURCING_AGREEMENT.pdf** (3 pages)
   - Simple agent agreement for China contact
   - Commission structure
   - Quality control
   - Non-circumvention

4. **JEFFY_STOCK_PURCHASE_MODEL.pdf** (2 pages)
   - Option A: At Cost (RECOMMENDED)
   - Option B: With Markup
   - Tax implications
   - Decision checklist

5. **JEFFY_MINIMUM_STOCK_CLAUSE.pdf** (2 pages)
   - Option 1: 10 of each item (simple but doesn't scale)
   - Option 2: Core Products + R5k minimum (RECOMMENDED)
   - Comparison table

6. **JEFFY_ZONE_PARTNER_FAQ.pdf** (12 pages)
   - 50+ questions answered
   - For partners AND founder reference
   - Earnings expectations
   - Tax obligations
   - Contract checklist
   - Red flags to watch for

---

## 💰 BUSINESS MODEL DECISIONS MADE

### Money Flow (DECIDED: Option A - At Cost)
```
Zone Partner buys stock at R52 (Jeffy's landed cost)
Customer pays R200
PayFast takes ~R8.40
Net: R191.60
Zone Partner gets back: R80 cost + R55.80 (50% profit) = R135.80
Jeffy keeps: R55.80 (50% profit)
Zone Partner ROI: ~70%
```

### Stock Requirements (RECOMMENDED: Tiered)
- 10 units of each "Core Product" (Jeffy designates 10-20 bestsellers)
- Minimum R5,000 total stock value
- Restock within 7 days when below 3 units
- 14-day cure period before termination

### Legal Status
- Zone Partners are BOTH:
  - Franchisees (for CPA compliance - need disclosure docs)
  - Independent Contractors (for tax - handle own SARS)

---

## 🔧 RECENT CODE FIXES (This Session)

### Checkout Fixes
- **File:** `src/app/api/checkout/route.ts`
- Changed crypto import to named import (TypeScript fix)
- Removed optional DB columns that might not exist
- Minimal insert: order_number, customer_name, email, phone, address, amounts, status

### Zones Made Optional
- **File:** `src/app/checkout/page.tsx`
- Zones wrapped in try/catch
- Default zone set on mount
- Checkout works even if zones table missing

### Error Monitoring
- **File:** `src/app/api/errors/log/route.ts` (NEW)
- Logs errors to error_logs table
- WhatsApp notification to admin
- Integrated into checkout

### Chinese Text Replacement
- **File:** `src/app/api/images/replace-text/route.ts` (NEW)
- Claude Vision identifies Chinese text regions
- Creates SVG overlay with English translations
- Composites onto image with Sharp

### Health Check Improvements
- **File:** `src/app/api/checkout/test/route.ts` (NEW)
- Actually tests checkout API (creates then deletes test order)
- Verifies products and orders tables work

---

## 📊 DATABASE TABLES NEEDED

Run these in Supabase SQL Editor if not already present:

```sql
-- Error logging
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type VARCHAR(100),
  error_message TEXT,
  error_details JSONB,
  page_url TEXT,
  user_agent TEXT,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎯 FOUNDER CONTEXT (For Claude)

**Who is Tredoux:**
- Kindergarten teacher in China (Chinese second language learners, ages 3-5)
- Has a 2.5-year-old daughter
- Non-technical - needs complete, copy-paste solutions
- Limited time: ~1hr weekday, 8-12hrs weekend
- Building Jeffy to fund FREE SCHOOLS in South Africa

**The Vision:**
- Commerce funds schools
- Merit-only student selection
- Graduates get: 1ha land, self-built house, production facility, skills
- First school on family farm (worth 300M rand)
- "Plant trees under whose shade you'll never sit"

**Current Situation:**
- 1 week holiday left to build
- Then 1-2 months for business registration
- Expects viral rapid expansion (100+ franchises)
- Solo founder - no backup or support
- China agent ready (trusted contact, no formal agreement yet)

**Communication Style:**
- Wants comprehensive, production-ready code
- Prefers Claude writes ALL code, he drops into Cursor
- Needs simple instructions, no jargon
- Values honesty and direct recommendations

---

## 🔑 ENVIRONMENT VARIABLES NEEDED

In `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
ADMIN_WHATSAPP=
```

---

## 📁 KEY FILE LOCATIONS

```
/src/app/
  ├── page.tsx (Homepage)
  ├── checkout/page.tsx (Checkout flow)
  ├── admin/
  │   ├── layout.tsx (Admin sidebar)
  │   ├── products/[id]/page.tsx (Product editor with AI)
  │   ├── categories/page.tsx
  │   └── partners/page.tsx (Zone Partner admin)
  └── api/
      ├── checkout/route.ts (Order processing)
      ├── checkout/test/route.ts (Health check)
      ├── errors/log/route.ts (Error monitoring)
      └── images/replace-text/route.ts (Chinese→English)

/src/components/
  ├── health-check.tsx (Dashboard health monitor)
  └── ... (various UI components)

/src/lib/
  ├── supabase/ (Client configs)
  └── error-reporter.ts (Client-side error helper)
```

---

## 🚨 IMPORTANT WARNINGS

1. **AVOID CLOTHING IMPORTS** - 45% duty + 15% VAT kills margins
2. **CPA COMPLIANCE** - Zone Partner agreements need 14-day disclosure, 10-day cooling off
3. **INDEPENDENT CONTRACTOR** - If partner earns >50% from Jeffy, SARS may reclassify
4. **INSURANCE REQUIRED** - Commercial vehicle + public liability BEFORE partner starts

---

## 📞 NEXT STEPS (Priority Order)

1. ☐ Run SQL tables in Supabase (error_logs, categories)
2. ☐ Test checkout flow end-to-end
3. ☐ Decide: Stock at cost vs. with markup (recommended: at cost)
4. ☐ Decide: Minimum stock clause (recommended: tiered)
5. ☐ Get legal review of Zone Partner Agreement
6. ☐ Set up PayFast Split Payments
7. ☐ Build Zone Partner dashboard (Phase 2)
8. ☐ Build 1688 scraper/importer

---

## 💬 HOW TO START NEW CHAT

Copy this to new Claude chat:

```
I'm continuing work on Jeffy Commerce, a South African e-commerce platform with Zone Partners (independent contractors who buy stock and earn 50% profit).

Please read this handoff document: /Users/tredouxwillemse/Desktop/jeffy-mvp/HANDOFF_DEC_28_2025.md

Current status: MVP deployed at jeffy.co.za. Legal docs created. Need to continue with [SPECIFIC TASK].

My workflow: You write ALL code, I drop it into Cursor. Give me complete files with exact paths.
```

---

**Document created: December 28, 2025**
**Session summary: Legal documents, money flow, FAQ, checkout fixes**
