-- Followers table - people who want updates from Jeffy/Spaza
CREATE TABLE IF NOT EXISTS followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(100),
  email VARCHAR(255),
  source VARCHAR(50) DEFAULT 'website', -- 'website', 'hustle', 'whatsapp', 'manual'
  interests TEXT[], -- ['spaza', 'wants', 'zone_partner']
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'unsubscribed'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(phone)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_followers_phone ON followers(phone);
CREATE INDEX IF NOT EXISTS idx_followers_source ON followers(source);
CREATE INDEX IF NOT EXISTS idx_followers_status ON followers(status);

-- Announcements table - messages sent to followers
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_interests TEXT[], -- which interests to target, NULL = all
  sent_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent'
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
