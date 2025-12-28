-- WhatsApp Notification Queue for Wants System
-- Run this in Supabase SQL Editor

-- Notification queue table
CREATE TABLE IF NOT EXISTS want_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  want_id UUID REFERENCES wants(id) ON DELETE CASCADE,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  milestone INT NOT NULL, -- 1, 3, 5, 7, 9, 10
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMPTZ,
  sent_via TEXT, -- 'manual', 'twilio', 'wati'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_want_notifications_status ON want_notifications(status);
CREATE INDEX IF NOT EXISTS idx_want_notifications_want_id ON want_notifications(want_id);

-- Enable RLS
ALTER TABLE want_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for service role
CREATE POLICY "Service role full access" ON want_notifications
  FOR ALL USING (true) WITH CHECK (true);
