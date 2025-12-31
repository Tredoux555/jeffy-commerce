-- 1. Fix want_verifications RLS
ALTER TABLE want_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access verifications" ON want_verifications;
CREATE POLICY "Service role full access verifications" ON want_verifications FOR ALL USING (true) WITH CHECK (true);

-- 2. Fix sessions RLS (for login)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access sessions" ON sessions;
CREATE POLICY "Service role full access sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- 3. Add image_url column to wants
ALTER TABLE wants ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Allow public access to images bucket
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Service role upload" ON storage.objects;
CREATE POLICY "Service role upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'images');

-- 6. Clear test data
TRUNCATE wants CASCADE;

