-- ============================================================================
-- JEFFY COMMERCE: Pre-Launch System Tables
-- Migration 005: Waitlist, Wants Voting, Zone Partners
-- ============================================================================

-- ============================================================================
-- WAITLIST TABLE (Customer + Zone Partner)
-- ============================================================================

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

-- Index for referral lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlist(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_type ON waitlist(type);
CREATE INDEX IF NOT EXISTS idx_waitlist_zone ON waitlist(zone_id) WHERE zone_id IS NOT NULL;

-- Auto-increment referrer's count when someone joins via referral
CREATE OR REPLACE FUNCTION increment_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE waitlist 
    SET referral_count = referral_count + 1
    WHERE id = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_referral ON waitlist;
CREATE TRIGGER trigger_increment_referral
  AFTER INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION increment_referral_count();

-- ============================================================================
-- WANT VOTES TABLE
-- ============================================================================

-- Add columns to existing wants table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wants' AND column_name = 'vote_count') THEN
    ALTER TABLE wants ADD COLUMN vote_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wants' AND column_name = 'status') THEN
    ALTER TABLE wants ADD COLUMN status TEXT DEFAULT 'voting';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wants' AND column_name = 'is_public') THEN
    ALTER TABLE wants ADD COLUMN is_public BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wants' AND column_name = 'first_requester_rewarded') THEN
    ALTER TABLE wants ADD COLUMN first_requester_rewarded BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Want votes table
CREATE TABLE IF NOT EXISTS want_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  want_id UUID NOT NULL REFERENCES wants(id) ON DELETE CASCADE,
  voter_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(want_id, voter_email)
);

CREATE INDEX IF NOT EXISTS idx_want_votes_want ON want_votes(want_id);
CREATE INDEX IF NOT EXISTS idx_want_votes_email ON want_votes(voter_email);

-- Auto-update vote_count when votes change
CREATE OR REPLACE FUNCTION update_want_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE wants SET vote_count = vote_count + 1 WHERE id = NEW.want_id;
    -- Auto-change status if threshold reached
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

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE want_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read waitlist stats (for counter)
CREATE POLICY "Public read waitlist" ON waitlist FOR SELECT USING (true);
-- Anyone can insert (signup)
CREATE POLICY "Public insert waitlist" ON waitlist FOR INSERT WITH CHECK (true);

-- Anyone can vote
CREATE POLICY "Public read want_votes" ON want_votes FOR SELECT USING (true);
CREATE POLICY "Public insert want_votes" ON want_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete own votes" ON want_votes FOR DELETE USING (true);

-- ============================================================================
-- DONE
-- ============================================================================
