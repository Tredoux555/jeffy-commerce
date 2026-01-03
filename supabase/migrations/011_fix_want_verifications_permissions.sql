-- Fix table-level permissions for want_verifications
-- This is required even with RLS enabled - grants the ability for roles to access the table
-- The actual row-level access is then controlled by RLS policies

-- Grant permissions to all roles
GRANT ALL ON TABLE want_verifications TO authenticated;
GRANT ALL ON TABLE want_verifications TO anon;
GRANT ALL ON TABLE want_verifications TO service_role;

-- Grant sequence permissions for UUID generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Clean up any conflicting policies and create fresh ones
DROP POLICY IF EXISTS "Anyone can insert verifications" ON want_verifications;
DROP POLICY IF EXISTS "Anyone can view own verification" ON want_verifications;
DROP POLICY IF EXISTS "System can update verifications" ON want_verifications;
DROP POLICY IF EXISTS "Service role full access verifications" ON want_verifications;
DROP POLICY IF EXISTS "Allow all inserts" ON want_verifications;
DROP POLICY IF EXISTS "Allow all selects" ON want_verifications;
DROP POLICY IF EXISTS "Allow all updates" ON want_verifications;
DROP POLICY IF EXISTS "Allow all deletes" ON want_verifications;

-- Create permissive policies (we control access at the API level)
CREATE POLICY "Allow all inserts" ON want_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all selects" ON want_verifications FOR SELECT USING (true);
CREATE POLICY "Allow all updates" ON want_verifications FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes" ON want_verifications FOR DELETE USING (true);
