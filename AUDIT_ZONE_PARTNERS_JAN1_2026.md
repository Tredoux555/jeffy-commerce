# ZONE PARTNER APPLICATION PROCESS - DEEP AUDIT
## January 1, 2026

---

## EXECUTIVE SUMMARY

The Zone Partner system has **TWO separate flows** that serve different purposes:

| Flow | Entry Point | Table | Purpose |
|------|-------------|-------|---------|
| **Quick Waitlist** | `/zone-partners` | `waitlist` | Fast signup, claim position |
| **Full Application** | `/partner/apply` | `zone_partners` | Complete application for review |

**🚨 CRITICAL ISSUE:** The `zone_partners` table is **missing columns** required by the API. Applications will fail until the migration is run.

---

## FLOW 1: Quick Waitlist (`/zone-partners` → `waitlist` table)

### Purpose
- Fast signup to "claim a spot"
- Gamified position system (referrals move you up)
- Low friction entry point

### User Journey
1. User visits `/zone-partners`
2. Selects a zone from map/list
3. Enters email (WhatsApp optional)
4. Submits → Goes to `waitlist` table with `type='zone_partner'`
5. Gets position number and referral code
6. Can share to move up the queue

### API Endpoint
- **POST `/api/zone-partners`** (minimal data = waitlist)
- **GET `/api/zone-partners`** (list zones, check position)

### Database
```sql
-- Uses existing waitlist table
waitlist (
  id, email, name, type='zone_partner', zone_id,
  position, referral_code, referral_count, referred_by
)
```

### Status: ✅ WORKING
- This flow works because `waitlist` table exists and has all columns

---

## FLOW 2: Full Application (`/partner/apply` → `zone_partners` table)

### Purpose
- Serious applicants only
- Collects detailed info for review
- Admin approval workflow with CPA compliance

### User Journey
1. User navigates through `/partner` → `/partner/how-it-works` → `/partner/why-it-works` → `/partner/apply`
2. Fills out form:
   - Full Name
   - Email
   - Phone
   - Province → City → Area (cascading selects)
   - Why they want to be a Zone Partner
3. Submits → Goes to `zone_partners` table
4. Receives confirmation email
5. Admin notified at tredoux@gmail.com
6. Admin reviews at `/admin/partners`
7. Admin approves → 14-day CPA waiting period starts
8. After compliance steps → Partner activated

### API Endpoint
- **POST `/api/zone-partners`** (with `name` field = full application)

### Database
```sql
zone_partners (
  id, user_id, full_name, full_legal_name, email, phone,
  business_name, zone_id, zone_name, notes,
  status, is_active, agreed_to_terms,
  -- CPA compliance fields:
  disclosure_sent_at, can_sign_after, agreement_signed_at,
  cooling_off_ends_at, deposit_paid_at, training_completed_at,
  stock_received_at,
  created_at, updated_at
)
```

### Status: ❌ BROKEN
- Table exists but missing required columns
- API fails with: `Could not find the 'notes' column`

---

## WHAT THE API DOES (Logic Flow)

```
POST /api/zone-partners
│
├─ Validate email
│
├─ Check if `name` field exists (2+ chars)
│   │
│   ├─ YES (Full Application) ─────────────────────┐
│   │   • Check zone_partners for existing email   │
│   │   • Insert into zone_partners table      ◄───┘
│   │   • Send confirmation email to applicant
│   │   • Send admin notification to tredoux@gmail.com
│   │   • Return success + partner data
│   │
│   └─ NO (Quick Waitlist) ────────────────────────┐
│       • Check waitlist for existing email        │
│       • Insert into waitlist table           ◄───┘
│       • Send waitlist email
│       • Return success + position/referral code
│
└─ Handle errors
```

---

## FILES INVOLVED

### Frontend Pages
| Path | Purpose |
|------|---------|
| `/src/app/zone-partners/page.tsx` | Quick waitlist signup |
| `/src/app/partner/page.tsx` | "What is Jeffy" intro |
| `/src/app/partner/how-it-works/page.tsx` | How partners work |
| `/src/app/partner/why-it-works/page.tsx` | Why join |
| `/src/app/partner/apply/page.tsx` | Full application form |
| `/src/app/admin/partners/page.tsx` | Admin review panel |

### API Routes
| Path | Purpose |
|------|---------|
| `/src/app/api/zone-partners/route.ts` | Main API (both flows) |
| `/src/app/api/waitlist/route.ts` | Generic waitlist API |

### Database Migrations
| Path | Status |
|------|--------|
| `/migrations/zone_partners_complete.sql` | ❌ NOT RUN |
| `/supabase/migrations/005_prelaunch_system.sql` | ✅ Has waitlist |

---

## ADMIN PANEL (`/admin/partners`)

### Features
- Lists all applications from `zone_partners` table
- Shows status badges (Pending, Approved, Rejected, Active)
- Approve button starts 14-day CPA countdown
- Compliance progress tracker (6 steps)
- Activate button when all steps complete

### CPA Compliance Steps
1. ✅ Disclosure sent
2. ⏳ 14-day waiting period
3. 📝 Agreement signed
4. 💰 Deposit paid
5. 🎓 Training completed
6. 📦 Stock received

---

## ISSUES FOUND

### 🚨 CRITICAL: Database Schema Mismatch

The API tries to insert these columns that don't exist:
- `notes` ← Application fails here
- `zone_name`
- `full_legal_name`
- `agreed_to_terms`

**Error:** `Could not find the 'notes' column of 'zone_partners' in the schema cache`

### 🔶 MEDIUM: Two Separate Entry Points

Users might be confused about:
- `/zone-partners` (waitlist) vs `/partner/apply` (full application)
- What each one does
- Whether they need to do both

### 🔷 LOW: No Link Between Systems

- Waitlist signup doesn't auto-populate full application
- User has to enter info twice
- No "upgrade from waitlist" flow

---

## REQUIRED FIX

Run this migration in Supabase SQL Editor:

```sql
-- File: /migrations/zone_partners_complete.sql

-- Add missing columns
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS zone_name TEXT;
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS full_legal_name TEXT;
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS agreed_to_terms BOOLEAN DEFAULT FALSE;
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;

-- Backfill full_legal_name
UPDATE zone_partners SET full_legal_name = full_name WHERE full_legal_name IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_zone_partners_email ON zone_partners(email);
CREATE INDEX IF NOT EXISTS idx_zone_partners_status ON zone_partners(status);
```

---

## POST-FIX TESTING CHECKLIST

After running migration, test:

- [ ] Submit application at `/partner/apply`
- [ ] Check email arrives to applicant
- [ ] Check admin notification at tredoux@gmail.com
- [ ] View application in `/admin/partners`
- [ ] Approve application (starts 14-day clock)
- [ ] Check `can_sign_after` date is set correctly

---

## EMAIL FLOW

### Applicant Receives
- Subject: "Zone Partner Application Received 🎯"
- Contains: Next steps, 5-step process explanation

### Admin Receives
- To: tredoux@gmail.com
- Subject: "🆕 New Zone Partner Application: [Name]"
- Contains: Name, Email, Phone, Zone, Why message, link to admin panel

---

## RECOMMENDATIONS

### Immediate (Before Testing)
1. Run `/migrations/zone_partners_complete.sql` in Supabase

### Short Term
2. Add link from waitlist success → "Complete Full Application"
3. Pre-fill application form if user came from waitlist
4. Add "Check Application Status" page for applicants

### Long Term
5. Consider merging flows - single application that auto-creates waitlist entry
6. Add WhatsApp notifications for status changes
7. Build mobile-friendly partner onboarding flow

---

## AUDIT VERIFICATION

### Files Reviewed
- ✅ `/src/app/partner/apply/page.tsx`
- ✅ `/src/app/zone-partners/page.tsx`
- ✅ `/src/app/api/zone-partners/route.ts`
- ✅ `/src/app/api/waitlist/route.ts`
- ✅ `/src/app/admin/partners/page.tsx`
- ✅ `/migrations/zone_partners_complete.sql`
- ✅ `/supabase/migrations/005_prelaunch_system.sql`

### Database Tables Checked
- ✅ `waitlist` - exists, working
- ❌ `zone_partners` - exists but missing columns

---

**Audit Completed:** January 1, 2026
**Auditor:** Claude
**Status:** ❌ BLOCKED - Migration required before testing
