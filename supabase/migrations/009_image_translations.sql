-- ============================================
-- CHECKPOINT 1: Image Translation System Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Table to track image translation jobs
CREATE TABLE IF NOT EXISTS image_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source image info
    original_url TEXT NOT NULL,
    original_filename TEXT,
    original_size_bytes INTEGER,
    
    -- Translation settings
    source_language TEXT DEFAULT 'zh',
    target_language TEXT DEFAULT 'en',
    glossary JSONB DEFAULT '[]'::jsonb,
    
    -- Processing status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Results
    translated_url TEXT,
    detected_text JSONB, -- Array of {original, translated, bbox}
    processing_time_ms INTEGER,
    
    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- External API tracking
    alibaba_task_id TEXT,
    
    -- Link to product (optional - for when used in product import)
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index for quick status lookups
CREATE INDEX idx_image_translations_status ON image_translations(status);
CREATE INDEX idx_image_translations_product ON image_translations(product_id);
CREATE INDEX idx_image_translations_created ON image_translations(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_image_translations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER image_translations_updated
    BEFORE UPDATE ON image_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_image_translations_timestamp();

-- RLS Policies
ALTER TABLE image_translations ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins full access to image_translations"
    ON image_translations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- Storage bucket for translated images
-- Run these in Supabase SQL Editor
-- ============================================

-- Create bucket for translated images (run via Supabase Dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('translated-images', 'translated-images', true);

-- Storage policy for translated images
-- CREATE POLICY "Public read access for translated images"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'translated-images');

-- CREATE POLICY "Authenticated users can upload translated images"
--     ON storage.objects FOR INSERT
--     TO authenticated
--     WITH CHECK (bucket_id = 'translated-images');

-- ============================================
-- Helpful view for monitoring
-- ============================================

CREATE OR REPLACE VIEW image_translation_stats AS
SELECT 
    status,
    COUNT(*) as count,
    AVG(processing_time_ms) as avg_processing_ms,
    DATE_TRUNC('day', created_at) as day
FROM image_translations
GROUP BY status, DATE_TRUNC('day', created_at)
ORDER BY day DESC, status;

-- Grant access to the view
GRANT SELECT ON image_translation_stats TO authenticated;

