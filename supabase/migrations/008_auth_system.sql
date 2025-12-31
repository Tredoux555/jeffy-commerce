-- Auth System Tables for Jeffy
-- Run this in Supabase SQL Editor

-- 1. Add auth columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- 3. RLS for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions" ON sessions 
  FOR ALL USING (true);

-- 4. Cleanup function for expired sessions (optional - run periodically)
-- DELETE FROM sessions WHERE expires_at < NOW();

-- 5. Index for user verification token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
