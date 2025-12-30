-- =====================================================
-- FIX: Add missing 'status' column to zone_partners
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'zone_partners' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE zone_partners 
        ADD COLUMN status TEXT DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));
        
        -- Set existing active partners to approved
        UPDATE zone_partners SET status = 'approved' WHERE is_active = true;
        UPDATE zone_partners SET status = 'pending' WHERE is_active = false OR is_active IS NULL;
    END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'zone_partners' 
AND column_name = 'status';
