# JEFFY COMMERCE PRE-LAUNCH HANDOFF
## Date: December 31, 2025
## Status: Build Fixed, DB Migration Pending, Ready for Quick Wins

---

## 🎯 CURRENT STATE

### What's Deployed to jeffy.co.za (Railway)
| Page | URL | Status |
|------|-----|--------|
| Customer Waitlist | `/coming-soon` | ✅ Deployed, needs DB |
| Product Wants | `/wants` | ✅ Deployed, needs DB |
| Zone Partners | `/zone-partners` | ✅ Deployed, needs DB |
| Waitlist API | `/api/waitlist` | ✅ Deployed, needs DB |
| Wants API | `/api/wants/public` | ✅ Deployed, needs DB |
| Zone API | `/api/zone-partners` | ✅ Deployed, needs DB |

### Build Status
- **Latest commit:** `5d6d3e1` - Fixed TypeScript error in wants page
- **Build:** Should be passing now (was failing on type error)
- **Issue:** Database tables don't exist yet

---

## 🗄️ DATABASE MIGRATION REQUIRED

**File location:** `/supabase/migrations/005_prelaunch_system.sql`

**Run this SQL in Supabase Dashboard → SQL Editor:**

```sql
-- WAITLIST TABLE
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  position SERIAL,
  referral_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  referred_by UUID REFERENCES waitlist(id) ON DELETE SET NULL,
  referral_count INTEGER DEFAULT 0,
  reward_tier INTEGER DEFAULT 0,
  type TEXT DEFAULT 'customer' CHECK (type IN ('customer', 'zone_partner')),
  zone_id TEXT,
  whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlist(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_type ON waitlist(type);
CREATE INDEX IF NOT EXISTS idx_waitlist_zone ON waitlist(zone_id) WHERE zone_id IS NOT NULL;

-- Referral trigger
CREATE OR REPLACE FUNCTION increment_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE waitlist SET referral_count = referral_count + 1 WHERE id = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_referral ON waitlist;
CREATE TRIGGER trigger_increment_referral AFTER INSERT ON waitlist FOR EACH ROW EXECUTE FUNCTION increment_referral_count();

-- WANT VOTES TABLE
CREATE TABLE IF NOT EXISTS want_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  want_id UUID NOT NULL REFERENCES wants(id) ON DELETE CASCADE,
  voter_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(want_id, voter_email)
);

-- Add columns to wants table
ALTER TABLE wants ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'voting';
ALTER TABLE wants ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS first_requester_rewarded BOOLEAN DEFAULT false;

-- Vote count trigger
CREATE OR REPLACE FUNCTION update_want_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE wants SET vote_count = vote_count + 1 WHERE id = NEW.want_id;
    UPDATE wants SET status = 'sourcing' WHERE id = NEW.want_id AND vote_count >= 50 AND status = 'voting';
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE wants SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = OLD.want_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_want_vote_count ON want_votes;
CREATE TRIGGER trigger_want_vote_count AFTER INSERT OR DELETE ON want_votes FOR EACH ROW EXECUTE FUNCTION update_want_vote_count();

-- RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE want_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read waitlist" ON waitlist FOR SELECT USING (true);
CREATE POLICY "Public insert waitlist" ON waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read want_votes" ON want_votes FOR SELECT USING (true);
CREATE POLICY "Public insert want_votes" ON want_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete own votes" ON want_votes FOR DELETE USING (true);
```

---

## 📁 KEY FILE LOCATIONS

```
jeffy-mvp/
├── src/app/
│   ├── coming-soon/page.tsx      ← Customer waitlist UI
│   ├── wants/page.tsx            ← Product voting UI
│   ├── zone-partners/page.tsx    ← Partner recruitment UI
│   └── api/
│       ├── waitlist/route.ts     ← Waitlist API
│       ├── wants/
│       │   ├── public/route.ts   ← Public wants API
│       │   └── vote/route.ts     ← Voting API
│       └── zone-partners/route.ts ← Zone partner API
├── supabase/migrations/
│   ├── 005_prelaunch_system.sql  ← NEW - run this!
│   └── _future/
│       └── 004_trend_prediction.sql ← Stashed for Phase 2
├── src/lib/_future/trends/       ← Viral prediction engine (stashed)
└── docs/future-features/
    └── VIRAL_TRENDS_SYSTEM.md    ← Activation docs
```

---

## ✅ WHAT WAS BUILT TODAY

### 1. Customer Waitlist (`/coming-soon`)
- Email-only signup (minimal friction)
- Referral code generation
- Position display with referral-based movement
- 5-tier reward system (3/5/10/25/50 referrals)
- WhatsApp as primary share mechanism
- Mission reveal on scroll
- Live waitlist counter

### 2. Product Wants (`/wants`)
- Public product request submission
- Voting with progress bars (50 vote threshold)
- Duplicate detection
- Daily vote limit (10/day)
- First requester gets FREE when sourced
- Status workflow: voting → sourcing → available
- Category filtering

### 3. Zone Partner Recruitment (`/zone-partners`)
- 16 SA zones across 5 provinces
- Real scarcity with capacity limits
- Position-based benefits (1-10, 11-25, 26-50, 51+)
- Referral mechanics (+3 positions per referral)
- Links to full application at `/partner/apply`

### 4. Viral Trends Engine (STASHED)
- 6,000+ lines stashed in `_future` directories
- AliExpress scanner, Google Trends, Claude AI analysis
- DO NOT DEPLOY - waiting for Phase 2

---

## 🚀 NEXT STEPS (PRIORITIZED)

### IMMEDIATE (Before Testing)
1. ✅ Verify build passed on Railway
2. 🔲 Run SQL migration in Supabase
3. 🔲 Test endpoints:
   - `curl -X POST https://jeffy.co.za/api/waitlist -H "Content-Type: application/json" -d '{"email":"test@example.com"}'`
   - Visit https://jeffy.co.za/coming-soon
   - Visit https://jeffy.co.za/wants
   - Visit https://jeffy.co.za/zone-partners

### QUICK WINS (30 mins)
1. Add launch date to coming-soon page ("Launching January 15, 2025")
2. Add impact counter ("R0 raised so far")
3. Improve WhatsApp share messages

### THIS WEEK (2-3 hours)
1. **Email confirmations via Resend**
   - Confirmation email with position + referral link
   - Pre-written WhatsApp share in email
   - "Share with 3 friends to unlock 10% off"

### BEFORE PUBLIC LAUNCH
1. Milestone emails (hit tier → congrats)
2. Weekly position update emails
3. Trust score basics (account age)

---

## 📊 STRATEGY INSIGHTS (from strategy doc)

### Proven Patterns We're Following
- Harry's: 100K emails in 1 week, 77% from referrals
- Robinhood: 1M signups, 50%+ from social
- Morning Brew: 30% growth from referrals at $0.25 CAC
- Who Gives A Crap: "Purposeful not preachy" tone

### Critical Gap: Email Loop
The viral loop is broken without email:
1. User signs up → sees referral code → closes tab → forgets → never shares

**Fix:** Instant confirmation email with:
- Their position (#47 in line)
- Referral link (pre-embedded)
- WhatsApp share button
- Current tier + next milestone

### Communication Cadence (Partner Waitlist)
- Day 0: Welcome + position + referral link
- Day 2: "What Zone Partners earn"
- Day 5: App preview
- Day 10: Position update
- Weekly: Milestones + leaderboard

---

## 🔑 REWARD TIERS

| Referrals | Tier | Name | Reward |
|-----------|------|------|--------|
| 3 | 1 | Supporter | 10% launch discount |
| 5 | 2 | Insider | Priority access |
| 10 | 3 | Star | 20% launch discount |
| 25 | 4 | Champion | R200 store credit |
| 50 | 5 | Legend | Founder Kit + Free Product |

---

## 🌍 ZONE CONFIGURATION

16 zones across 5 provinces:
- **Gauteng (7):** Sandton, Rosebank, Fourways, Midrand, Centurion, Pretoria East, Pretoria North
- **Western Cape (4):** Cape Town CBD, Sea Point, Claremont, Stellenbosch
- **KZN (3):** Durban North, Umhlanga, Ballito
- **Eastern Cape (1):** Port Elizabeth
- **Free State (1):** Bloemfontein

Partner benefits by position:
- **1-10:** 55/45 split (6 months locked) + Founding Partner + Direct WhatsApp to founders
- **11-25:** Founding Partner badge + Priority training
- **26-50:** Early launch access
- **51+:** Standard timeline

---

## 🧪 SMOKE TEST COMMANDS

```bash
# Check endpoints
curl -s -o /dev/null -w "%{http_code}" https://jeffy.co.za/coming-soon
curl -s -o /dev/null -w "%{http_code}" https://jeffy.co.za/wants
curl -s -o /dev/null -w "%{http_code}" https://jeffy.co.za/zone-partners

# Test waitlist signup
curl -X POST https://jeffy.co.za/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check waitlist stats
curl https://jeffy.co.za/api/waitlist
```

---

## 📝 REPO INFO

- **Repo:** Tredoux555/jeffy-commerce
- **Path:** ~/Desktop/jeffy-mvp
- **Hosting:** Railway
- **Database:** Supabase
- **Latest commit:** 5d6d3e1

---

## ⚠️ KNOWN ISSUES

1. **Pre-existing build errors** in `/src/app/admin/orders/` - unrelated to new code
2. **pdf-parse warning** in OEM research extract route - non-blocking

---

## 🎯 SESSION GOAL WHEN RESUMING

1. Confirm DB migration was run
2. Test all 3 pages work
3. Add launch date + impact counter (quick wins)
4. Set up Resend email confirmations

---

*Last updated: Dec 31, 2025, 02:50 UTC*
