# JEFFY WANTS SYSTEM - DEEP AUDIT
**Date:** January 2, 2026  
**Auditor:** Claude (Opus 4.5)  
**Status:** ⚠️ CRITICAL FINDINGS

---

## EXECUTIVE SUMMARY

The Jeffy wants system has **TWO PARALLEL IMPLEMENTATIONS** that use different database columns, different user flows, and different verification mechanisms. This creates confusion, potential data inconsistencies, and a fragmented user experience.

---

## 🚨 CRITICAL FINDING: DUAL SYSTEM ARCHITECTURE

### System A: "Agrees" System (Phone-Based, Simpler)
| Component | Location |
|-----------|----------|
| Create Page | `/wants/create` |
| Detail Page | `/wants/[shareCode]` |
| Service | `src/lib/wants-service.ts` |
| Admin View | `/admin/wants` |
| Table | `want_agrees` |

**Database Columns Used:**
- `title` (not `product_name`)
- `current_agrees` (not `verified_count`)
- `threshold` (default: 10)
- `share_code` (for URLs)
- `creator_name` + `creator_phone` (phone-based)
- `reference_image_url`, `reference_url`
- `max_price_cents`
- `status`: 'active' → 'threshold_reached' → 'converted'

**User Flow:**
1. User fills form at `/wants/create` with name + WhatsApp number
2. Gets unique share code (e.g., `ABC123DE`)
3. Shares link: `jeffy.co.za/wants/ABC123DE`
4. Friends visit link → enter their phone number → "agree"
5. Milestones trigger WhatsApp notification queue
6. At 10 agrees, admin converts to product

---

### System B: "Verification" System (Email-Based, Complex)
| Component | Location |
|-----------|----------|
| Main Page | `/wants` (explore/create modal) |
| Detail Page | `/want/[id]` |
| API Routes | `/api/wants/public`, `/api/wants/request-verification`, `/api/wants/verify` |
| My Wants | `/my-wants` |
| Tables | `want_verifications`, `want_votes` |

**Database Columns Used:**
- `product_name` (not `title`)
- `verified_count` (not `current_agrees`)
- `vote_count`, `popularity_clicks`
- `is_public`
- `creator_email` (email-based)
- `creator_referral_code` (for tracking)
- `image_url` (not `reference_image_url`)
- `status`: 'voting' → 'sourcing' → 'available'

**User Flow:**
1. User fills modal at `/wants` with email
2. Email sent with verification link
3. User sets password, gets dashboard at `/my-wants`
4. Shares referral link: `jeffy.co.za/want/[uuid]?ref=ABC123`
5. Friends verify via email or SMS
6. Verification requires email/phone code confirmation
7. `verified_count` increments

---

## ⚠️ SPECIFIC ISSUES FOUND

### Issue 1: Admin Page Mismatch
The admin page (`/admin/wants`) uses **System A columns** (`current_agrees`, `title`, `share_code`) but the main public `/wants` page creates wants using **System B columns** (`product_name`, `verified_count`, `creator_email`).

**Impact:** Wants created via the main page will show as having 0 "agrees" in admin because the admin looks at `current_agrees`, not `verified_count`.

### Issue 2: Broken Cross-References
- `want_notifications` table references `wants(product_name)` - this is System B
- `want-to-product.ts` uses System A columns (`title`, `creator_phone`)
- `convert-to-product-button.tsx` expects System A data

**Impact:** Converting a System B want to product will fail or show incorrect data.

### Issue 3: Two Separate Agreement Tables
- `want_agrees` - used by System A (phone number entry)
- `want_verifications` - used by System B (email/SMS verified)

**Impact:** No unified view of engagement. An agree in System A doesn't count in System B.

### Issue 4: Missing TypeScript Types
The `wants` table is not defined in `src/types/database.ts`.

**Impact:** No TypeScript safety for database operations on wants.

### Issue 5: Notification System Only Works with System A
The milestone notification system (`notification-utils.ts`, `notification-service.ts`) only triggers on `addWantAgreement()` in System A. System B verifications don't trigger milestone notifications.

---

## ✅ WHAT'S WORKING CORRECTLY

### System A (Agrees) - Full Flow
| Step | Status | Notes |
|------|--------|-------|
| Create want | ✅ Works | Via `/wants/create` |
| Generate share code | ✅ Works | 8-char uppercase |
| Phone normalization | ✅ Works | Handles SA formats |
| Duplicate prevention | ✅ Works | Same phone can't agree twice |
| Increment current_agrees | ✅ Works | Real-time count update |
| Threshold detection | ✅ Works | Status → 'threshold_reached' |
| Milestone detection | ✅ Works | 1, 3, 5, 7, 9, 10 |
| Queue notifications | ✅ Works | Writes to `want_notifications` |
| Admin view | ✅ Works | Shows progress, WhatsApp links |
| Convert to product | ✅ Works | Creates draft product |

### System B (Verification) - Partial
| Step | Status | Notes |
|------|--------|-------|
| Create want | ✅ Works | Via modal on `/wants` |
| Email notification | ✅ Works | Via Resend |
| User registration | ✅ Works | With password |
| Dashboard | ✅ Works | Shows progress at `/my-wants` |
| Request verification | ✅ Works | Email or SMS |
| Complete verification | ⚠️ Untested | Requires email/SMS code |
| Increment verified_count | ⚠️ Unknown | Needs E2E test |

---

## 🔧 NOTIFICATION SYSTEM AUDIT

### Milestone Notifications (System A Only)
```
1 agree  → 🎉 "Your first friend just agreed!"
3 agrees → 🔥 "You're on fire! 3 friends agreed"
5 agrees → ⚡ "HALFWAY THERE!"
7 agrees → 🚀 "Almost there! 7 friends agreed"
9 agrees → 😱 "ONE MORE!!!"
10 agrees → 🎊 "CONGRATULATIONS! You did it!"
```

**Status:** Notifications queue to `want_notifications` table but are sent **manually** via admin (no automatic Twilio/WATI integration).

### Admin Notification Page (`/admin/notifications`)
| Feature | Status |
|---------|--------|
| View pending | ✅ Works |
| View sent | ✅ Works |
| View failed | ✅ Works |
| Stats display | ✅ Works |
| "Send All Pending" button | ❌ **UI only** - no backend |
| Individual send button | ❌ **UI only** - no backend |

---

## 📊 DATABASE SCHEMA ANALYSIS

### `wants` Table - Dual Schema
The table appears to have columns from **both** systems:

**System A Columns:**
- `title`
- `current_agrees`
- `threshold`
- `share_code`
- `creator_name`
- `creator_phone`
- `reference_image_url`
- `reference_url`
- `max_price_cents`
- `converted_product_id`
- `converted_at`

**System B Columns:**
- `product_name`
- `vote_count`
- `verified_count`
- `popularity_clicks`
- `is_public`
- `creator_email`
- `creator_referral_code`
- `image_url`
- `user_id`
- `first_requester_rewarded`

### Related Tables
| Table | Purpose | Used By |
|-------|---------|---------|
| `want_agrees` | Phone agreements | System A |
| `want_verifications` | Email/SMS verified agreements | System B |
| `want_votes` | Engagement tracking | System B |
| `want_notifications` | WhatsApp queue | System A |
| `want_creator_benefits` | Free product tracking | System A |

---

## 🎯 RECOMMENDATIONS

### Option 1: Consolidate to System A (Recommended)
The simpler phone-based system is:
- More viral (no email verification friction)
- More complete (milestones, notifications, conversion flow)
- What admin uses

**Action:** Deprecate System B routes and migrate main `/wants` page to use System A.

### Option 2: Consolidate to System B
If email verification is required for data quality:
- Add milestone notifications to verification flow
- Update admin page to use System B columns
- Update conversion flow to use System B columns

### Option 3: Unified Hybrid
- Keep both entry points but unify the backend
- Map columns: `title` = `product_name`, etc.
- Create views or virtual columns

---

## 📁 FILES AUDITED

### Core Service Files
- ✅ `src/lib/wants-service.ts` - System A service
- ✅ `src/lib/notification-service.ts` - Queue management
- ✅ `src/lib/notification-utils.ts` - Milestone logic
- ✅ `src/lib/want-to-product.ts` - Conversion logic

### API Routes
- ✅ `src/app/api/wants/public/route.ts` - System B create/list
- ✅ `src/app/api/wants/[id]/route.ts` - System B detail
- ✅ `src/app/api/wants/request-verification/route.ts` - System B verify
- ✅ `src/app/api/wants/vote/route.ts` - System B engagement
- ✅ `src/app/api/admin/wants/route.ts` - Admin API

### Frontend Pages
- ✅ `src/app/wants/create/page.tsx` - System A create
- ✅ `src/app/wants/[shareCode]/page.tsx` - System A detail
- ✅ `src/app/wants/[shareCode]/want-detail-client.tsx` - System A agree flow
- ✅ `src/app/wants/page.tsx` - System B main page
- ✅ `src/app/my-wants/page.tsx` - System B dashboard
- ✅ `src/app/admin/wants/page.tsx` - Admin (System A columns)
- ✅ `src/app/admin/notifications/page.tsx` - Notification queue

### Migrations
- ✅ `migrations/want_notifications.sql` - Notification queue table

---

## CONCLUSION

The Jeffy wants system is **functional but fragmented**. The core System A flow (phone-based agrees with milestones) is complete and working. However, having two parallel systems creates maintenance burden and potential user confusion.

**Immediate Action Required:**
1. Decide which system is the canonical implementation
2. Consolidate or clearly separate the two systems
3. Add working backend for notification send buttons
4. Add TypeScript types for `wants` table

**The good news:** The viral mechanics (milestones, WhatsApp sharing, conversion to product) are all implemented and working in System A.
