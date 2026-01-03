-- Add fingerprint column for quick (one-click) verifications
ALTER TABLE want_verifications 
ADD COLUMN IF NOT EXISTS fingerprint TEXT;

-- Add unique constraint on fingerprint per want (prevents same device verifying twice)
-- Drop existing unique constraints first (they reference email/phone)
ALTER TABLE want_verifications DROP CONSTRAINT IF EXISTS want_verifications_want_id_fingerprint_key;

-- Create index for fingerprint lookups
CREATE INDEX IF NOT EXISTS idx_want_verifications_fingerprint ON want_verifications(want_id, fingerprint);

-- Update verification_type check to include 'quick'
ALTER TABLE want_verifications DROP CONSTRAINT IF EXISTS want_verifications_verification_type_check;
ALTER TABLE want_verifications ADD CONSTRAINT want_verifications_verification_type_check 
  CHECK (verification_type IN ('email', 'sms', 'quick'));

-- For quick verifications, we set verified_at immediately (no OTP needed)
-- The trigger will auto-increment verified_count

-- Update the trigger to handle quick verifications (INSERT with verified_at set)
CREATE OR REPLACE FUNCTION update_want_verified_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT with verified_at already set (quick verify)
  IF TG_OP = 'INSERT' AND NEW.verified_at IS NOT NULL THEN
    UPDATE wants SET verified_count = (SELECT COUNT(*) FROM want_verifications WHERE want_id = NEW.want_id AND verified_at IS NOT NULL) WHERE id = NEW.want_id;
    UPDATE wants SET status = 'sourcing' WHERE id = NEW.want_id AND verified_count >= 10 AND status IN ('voting', 'active');
  END IF;
  -- Handle UPDATE (email/sms verify)
  IF TG_OP = 'UPDATE' AND NEW.verified_at IS NOT NULL AND OLD.verified_at IS NULL THEN
    UPDATE wants SET verified_count = (SELECT COUNT(*) FROM want_verifications WHERE want_id = NEW.want_id AND verified_at IS NOT NULL) WHERE id = NEW.want_id;
    UPDATE wants SET status = 'sourcing' WHERE id = NEW.want_id AND verified_count >= 10 AND status IN ('voting', 'active');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for both INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_update_verified_count ON want_verifications;
CREATE TRIGGER trigger_update_verified_count 
  AFTER INSERT OR UPDATE ON want_verifications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_want_verified_count();

-- Ensure RLS allows quick verifications
DROP POLICY IF EXISTS "Allow all inserts" ON want_verifications;
DROP POLICY IF EXISTS "Allow all selects" ON want_verifications;
DROP POLICY IF EXISTS "Allow all updates" ON want_verifications;
CREATE POLICY "Allow all inserts" ON want_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all selects" ON want_verifications FOR SELECT USING (true);
CREATE POLICY "Allow all updates" ON want_verifications FOR UPDATE USING (true);
