-- Magic Links table for passwordless authentication
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_magic_links_expires ON magic_links(expires_at);

-- Auto-cleanup old tokens (optional - run periodically)
-- DELETE FROM magic_links WHERE expires_at < NOW() - INTERVAL '7 days';
