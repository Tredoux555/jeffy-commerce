-- Simple Image Translations Table
-- For Chinese-to-English product image translation

CREATE TABLE IF NOT EXISTS image_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_image_url TEXT NOT NULL,
    translated_image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for status lookups
CREATE INDEX idx_image_translations_status ON image_translations(status);
CREATE INDEX idx_image_translations_created ON image_translations(created_at DESC);

-- RLS Policies - Allow service role full access
ALTER TABLE image_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to image_translations"
    ON image_translations
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create storage bucket (run via Supabase Dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('translated-images', 'translated-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies for translated-images bucket
-- CREATE POLICY "Public read access for translated images"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'translated-images');

-- CREATE POLICY "Service role can upload translated images"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'translated-images');

