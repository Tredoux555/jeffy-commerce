# JEFFY HANDOFF - December 31, 2025

## SESSION SUMMARY
Zone Partner journey built (4 pages), coming-soon redesigned, application system working.

---

## TASK #1 (PRIORITY): Verification System for Wants

### The Problem
Currently the voting system is broken/missing. Need TWO separate systems:

### System A: Popularity Clicks (Fun Metric)
- The upvote button on `/wants` page
- Anyone can click unlimited times
- No login, no verification
- Just increments a counter for engagement feel
- Admin can see it but it's NOT official
- **Status:** Needs to be decoupled from verification

### System B: Real Verification (Serious - THE ACTUAL SYSTEM)
- Creator of a Want gets a PERSONAL link with unique code
- Example: `jeffy.co.za/want/[want-id]?ref=[CREATOR_CODE]`
- Creator shares this link with friends/family
- When friend clicks:
  1. See the want details
  2. MUST enter phone OR email
  3. Phone/email MUST be verified (OTP or email confirmation link)
  4. Only THEN does it count as 1 verification
- **10 verified people = Tredoux sources the product**
- **First requester gets it FREE**

### Database Schema Needed
```sql
-- Verifications table (the real votes)
CREATE TABLE want_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  want_id UUID REFERENCES wants(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  verification_code TEXT,
  verified_at TIMESTAMPTZ,
  referred_by_code TEXT, -- creator's referral code
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add to wants table
ALTER TABLE wants ADD COLUMN creator_referral_code TEXT UNIQUE;
ALTER TABLE wants ADD COLUMN verified_count INTEGER DEFAULT 0;
ALTER TABLE wants ADD COLUMN popularity_clicks INTEGER DEFAULT 0;
```

### Pages/Components Needed
1. **Want Detail Page** `/want/[id]` - Shows want, verification form if `?ref=` present
2. **Verification Form** - Phone or email input → sends OTP/link
3. **OTP/Email Verification** - Confirms and increments verified_count
4. **Creator Dashboard** - See their wants, share links, track verifications
5. **Admin Overview** - See all wants, popularity vs real verifications

### Flow Diagram
```
Creator creates Want
    ↓
Gets personal link: jeffy.co.za/want/xyz?ref=MYCODE
    ↓
Shares with 10 friends
    ↓
Friend clicks → Enters phone → Gets OTP → Verifies
    ↓
verified_count++
    ↓
At 10 verifications → Tredoux notified → Sources product
    ↓
First requester gets it FREE
```

---

## COMPLETED TODAY

### Zone Partner Journey (4 pages)
| Page | URL | Status |
|------|-----|--------|
| What is Jeffy | `/partner` | ✅ Live |
| How It Works | `/partner/how-it-works` | ✅ Live |
| Why It Works | `/partner/why-it-works` | ✅ Live |
| Apply | `/partner/apply` | ✅ Live |

### Coming Soon Page
- `/coming-soon` - Two paths: Create a Want / Become Zone Partner
- Dark slate theme, premium exclusive feel
- "This isn't for everyone" energy
- **THIS IS THE AESTHETIC TO MAINTAIN**

### Key Changes
1. **50 votes → 10 verifications** for Wants
2. **Zone selection**: Province → City → Area (cascading dropdowns)
3. **School messaging**: "Jeffy builds commerce empire → commerce builds school empire"
4. **API fixed**: Handles existing waitlist emails (upgrades to zone partner)
5. **Phone stored** in zone_id field (temporary)
6. **R200 → R500** markup example on why-it-works page

---

## DATABASE NOTES

### Waitlist Table
- Zone partners stored with `type: 'zone_partner'`
- `zone_id` format: `western-cape > cape-town > Camps Bay | Phone: 0761234567`
- Email is UNIQUE across all waitlist types
- Existing customers auto-upgrade to zone partner if they apply

### Wants Table
- Currently has `vote_count` but this needs to split into:
  - `popularity_clicks` (fun metric, meaningless)
  - `verified_count` (real verifications, serious)

---

## DESIGN PHILOSOPHY

### Two Vibes, Same Brand
| Audience | Vibe | Colors |
|----------|------|--------|
| Customers (Homepage) | "Eish, These Prices!" | Orange energy, gray-950 |
| Partners/Believers | "This is a movement" | Slate dark, premium, exclusive |

The contrast IS the design. Don't make them look the same.

---

## NOT BUILT YET (Phase 2+)

- [ ] **Verification system** (Task #1 above)
- [ ] Digital zone mapping tool
- [ ] Zone boundary visualization  
- [ ] Google Places autocomplete for areas
- [ ] Separate phone column in database
- [ ] OTP service integration (consider Twilio, Africa's Talking, or local SA provider)

---

## FILES MODIFIED TODAY

### New Files
- `src/app/partner/page.tsx` - What is Jeffy
- `src/app/partner/how-it-works/page.tsx`
- `src/app/partner/why-it-works/page.tsx`
- `src/app/partner/apply/page.tsx` - Zone application form
- `src/app/partner/layout.tsx`

### Modified Files
- `src/app/coming-soon/page.tsx` - Redesigned with two paths
- `src/app/coming-soon/opengraph-image.tsx` - New OG image
- `src/app/wants/page.tsx` - Changed 50→10 threshold
- `src/app/api/zone-partners/route.ts` - Fixed unique email handling

---

## URLS FOR TESTING

```
https://jeffy.co.za/coming-soon          <- Entry point (share this)
https://jeffy.co.za/partner              <- Zone partner journey start
https://jeffy.co.za/partner/how-it-works
https://jeffy.co.za/partner/why-it-works  
https://jeffy.co.za/partner/apply        <- Application form
https://jeffy.co.za/wants                <- Product requests
https://jeffy.co.za                      <- Main store
```

---

## NEXT SESSION PRIORITIES

1. **BUILD VERIFICATION SYSTEM** (described above)
2. Delete test wants from database
3. Test full flow: Create want → Get link → Share → Friend verifies → Count increments
4. Admin view for verifications vs popularity

---

## REPO & DEPLOYMENT

- **Repo:** github.com/Tredoux555/jeffy-commerce
- **Hosting:** Railway
- **Branch:** main (auto-deploys)
- **Build time:** ~90 seconds

---

*Handoff created: Dec 31, 2025 @ 17:00 SAST*
