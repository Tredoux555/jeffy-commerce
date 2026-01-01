-- Create factories table for 1688 supplier tracking
CREATE TABLE IF NOT EXISTS factories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  products TEXT[] DEFAULT '{}',
  notes TEXT,
  quality_rating INTEGER DEFAULT 3 CHECK (quality_rating >= 1 AND quality_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searching
CREATE INDEX IF NOT EXISTS idx_factories_category ON factories(category);
CREATE INDEX IF NOT EXISTS idx_factories_name ON factories(name);

-- Enable RLS (Row Level Security)
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (admin only)
CREATE POLICY "Allow all for authenticated users" ON factories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert the first factory (nail scissors)
INSERT INTO factories (name, url, category, products, notes, quality_rating)
VALUES (
  'goldhdshiny',
  'https://www.1688.com/factory/goldhdshiny.html',
  'Beauty & Personal Care',
  ARRAY['nail scissors', 'tweezers', 'cuticle tools'],
  'First factory saved - nail tools specialist',
  3
);
