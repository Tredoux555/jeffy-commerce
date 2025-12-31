-- ============================================
-- JEFFY PRE-LAUNCH SYSTEM - COMPLETE MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. USERS TABLE (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WANTS TABLE (MISSING - THIS WAS THE BUG)
CREATE TABLE IF NOT EXISTS wants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vote_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'voting' CHECK (status IN ('voting', 'sourcing', 'available', 'archived')),
  is_public BOOLEAN DEFAULT true,
  first_requester_rewarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wants_status ON wants(status);
CREATE INDEX IF NOT EXISTS idx_wants_public ON wants(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_wants_vote_count ON wants(vote_count DESC);

-- 3. WAITLIST TABLE
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

-- 4. WANT VOTES TABLE
CREATE TABLE IF NOT EXISTS want_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  want_id UUID NOT NULL REFERENCES wants(id) ON DELETE CASCADE,
  voter_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(want_id, voter_email)
);

CREATE INDEX IF NOT EXISTS idx_want_votes_want ON want_votes(want_id);

-- 5. TRIGGERS

-- Referral count trigger
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
CREATE TRIGGER trigger_increment_referral 
  AFTER INSERT ON waitlist 
  FOR EACH ROW 
  EXECUTE FUNCTION increment_referral_count();

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
CREATE TRIGGER trigger_want_vote_count 
  AFTER INSERT OR DELETE ON want_votes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_want_vote_count();

-- 6. ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wants ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE want_votes ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Public read users" ON users;
DROP POLICY IF EXISTS "Public insert users" ON users;
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public insert users" ON users FOR INSERT WITH CHECK (true);

-- Wants policies
DROP POLICY IF EXISTS "Public read wants" ON wants;
DROP POLICY IF EXISTS "Public insert wants" ON wants;
DROP POLICY IF EXISTS "Public update wants" ON wants;
CREATE POLICY "Public read wants" ON wants FOR SELECT USING (true);
CREATE POLICY "Public insert wants" ON wants FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update wants" ON wants FOR UPDATE USING (true);

-- Waitlist policies
DROP POLICY IF EXISTS "Public read waitlist" ON waitlist;
DROP POLICY IF EXISTS "Public insert waitlist" ON waitlist;
CREATE POLICY "Public read waitlist" ON waitlist FOR SELECT USING (true);
CREATE POLICY "Public insert waitlist" ON waitlist FOR INSERT WITH CHECK (true);

-- Want votes policies
DROP POLICY IF EXISTS "Public read want_votes" ON want_votes;
DROP POLICY IF EXISTS "Public insert want_votes" ON want_votes;
DROP POLICY IF EXISTS "Public delete own votes" ON want_votes;
CREATE POLICY "Public read want_votes" ON want_votes FOR SELECT USING (true);
CREATE POLICY "Public insert want_votes" ON want_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete own votes" ON want_votes FOR DELETE USING (true);

-- Done!
SELECT 'Migration complete! Tables created: users, wants, waitlist, want_votes' as status;
