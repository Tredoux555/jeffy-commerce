-- Add columns to wants
ALTER TABLE wants 
ADD COLUMN IF NOT EXISTS creator_referral_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
ADD COLUMN IF NOT EXISTS verified_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS popularity_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS creator_email TEXT,
ADD COLUMN IF NOT EXISTS creator_phone TEXT;

-- Backfill referral codes
UPDATE wants SET creator_referral_code = encode(gen_random_bytes(6), 'hex') WHERE creator_referral_code IS NULL;

-- Create verifications table
CREATE TABLE IF NOT EXISTS want_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  want_id UUID REFERENCES wants(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  verification_type TEXT CHECK (verification_type IN ('email', 'sms')),
  verification_token TEXT,
  otp_code TEXT,
  expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  referred_by_code TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(want_id, email),
  UNIQUE(want_id, phone)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_want_verifications_want_id ON want_verifications(want_id);
CREATE INDEX IF NOT EXISTS idx_want_verifications_token ON want_verifications(verification_token);

-- Trigger for auto-updating verified_count
CREATE OR REPLACE FUNCTION update_want_verified_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.verified_at IS NOT NULL AND OLD.verified_at IS NULL THEN
    UPDATE wants SET verified_count = (SELECT COUNT(*) FROM want_verifications WHERE want_id = NEW.want_id AND verified_at IS NOT NULL) WHERE id = NEW.want_id;
    UPDATE wants SET status = 'sourcing' WHERE id = NEW.want_id AND verified_count >= 10 AND status = 'voting';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_verified_count ON want_verifications;
CREATE TRIGGER trigger_update_verified_count AFTER UPDATE ON want_verifications FOR EACH ROW EXECUTE FUNCTION update_want_verified_count();

-- RLS
ALTER TABLE want_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert verifications" ON want_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view own verification" ON want_verifications FOR SELECT USING (true);
CREATE POLICY "System can update verifications" ON want_verifications FOR UPDATE USING (true);

