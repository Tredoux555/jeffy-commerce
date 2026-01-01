-- =====================================================
-- Zone Partners Table - Complete Setup
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create the zone_partners table if it doesn't exist
CREATE TABLE IF NOT EXISTS zone_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  business_name TEXT,
  zone_id TEXT,
  zone_name TEXT,
  notes TEXT,
  
  -- Status and compliance
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  is_active BOOLEAN DEFAULT FALSE,
  
  -- CPA compliance timestamps
  disclosure_sent_at TIMESTAMP WITH TIME ZONE,
  can_sign_after DATE,
  agreement_signed_at TIMESTAMP WITH TIME ZONE,
  agreed_to_terms BOOLEAN DEFAULT FALSE,
  cooling_off_ends_at DATE,
  deposit_paid_at TIMESTAMP WITH TIME ZONE,
  training_completed_at TIMESTAMP WITH TIME ZONE,
  stock_received_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'zone_partners' AND column_name = 'status') THEN
    ALTER TABLE zone_partners ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));
  END IF;
  
  -- notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'zone_partners' AND column_name = 'notes') THEN
    ALTER TABLE zone_partners ADD COLUMN notes TEXT;
  END IF;
  
  -- zone_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'zone_partners' AND column_name = 'zone_name') THEN
    ALTER TABLE zone_partners ADD COLUMN zone_name TEXT;
  END IF;
  
  -- user_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'zone_partners' AND column_name = 'user_id') THEN
    ALTER TABLE zone_partners ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
  
  -- agreed_to_terms
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'zone_partners' AND column_name = 'agreed_to_terms') THEN
    ALTER TABLE zone_partners ADD COLUMN agreed_to_terms BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- full_legal_name alias (some code uses this)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'zone_partners' AND column_name = 'full_legal_name') THEN
    ALTER TABLE zone_partners ADD COLUMN full_legal_name TEXT;
  END IF;
END $$;

-- Update full_legal_name from full_name where null
UPDATE zone_partners 
SET full_legal_name = full_name 
WHERE full_legal_name IS NULL AND full_name IS NOT NULL;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_zone_partners_email ON zone_partners(email);
CREATE INDEX IF NOT EXISTS idx_zone_partners_status ON zone_partners(status);
CREATE INDEX IF NOT EXISTS idx_zone_partners_user_id ON zone_partners(user_id);

-- Grant permissions
GRANT ALL ON zone_partners TO service_role;
GRANT ALL ON zone_partners TO authenticated;
GRANT SELECT, INSERT ON zone_partners TO anon;

-- Enable RLS
ALTER TABLE zone_partners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Zone partners can view own record" ON zone_partners;
CREATE POLICY "Zone partners can view own record" ON zone_partners
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON zone_partners;
CREATE POLICY "Service role full access" ON zone_partners
  FOR ALL USING (true);

-- =====================================================
-- Verify setup
-- =====================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'zone_partners'
ORDER BY ordinal_position;
