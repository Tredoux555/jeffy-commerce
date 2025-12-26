-- Add referral tracking columns
ALTER TABLE want_agrees ADD COLUMN IF NOT EXISTS referrer_code TEXT;
ALTER TABLE want_agrees ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'direct';

-- Add notification tracking
ALTER TABLE wants ADD COLUMN IF NOT EXISTS notified_at TIMESTAMP WITH TIME ZONE;

-- Create notifications table for persistent notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'threshold_reached', 'new_want', 'expired'
  want_id UUID REFERENCES wants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);
