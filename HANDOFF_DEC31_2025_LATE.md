# JEFFY MVP HANDOFF - December 31, 2025 (23:15)

## PROJECT OVERVIEW
- **Repo**: `Tredoux555/jeffy-commerce`
- **Local**: `/Users/tredouxwillemse/Desktop/jeffy-mvp`
- **Live**: `jeffy.co.za` (Railway auto-deploy from main)
- **DB**: Supabase `inhrgiakjyprabxluppv.supabase.co`
- **Email**: Resend API (`hello@jeffy.co.za`)

## CURRENT STATE

### What's Working
- Homepage redirects to `/coming-soon` (configured in `next.config.js`)
- `/wants` page with "Create Your Want" flow
- Image upload for wants (required field)
- Verification email sent when creating want
- Password setup flow via email link
- Session-based auth (auto-login after password set)

### What Needs SQL Run
**Run this in Supabase SQL Editor:**
```sql
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
```

### Known Issues to Fix
1. **Login loops to login page** - Sessions table RLS was blocking reads (SQL above fixes)
2. **Verification fails** - "permission denied for want_verifications" (SQL above fixes)
3. **After SQL runs** - Test full flow: create want → get email → set password → auto-login to /my-wants

## KEY FILES

### Auth System
- `/src/app/api/auth/register/route.ts` - Send verification email
- `/src/app/api/auth/verify/route.ts` - Validate token, set password, create session
- `/src/app/api/auth/login/route.ts` - Email/password login
- `/src/app/api/auth/me/route.ts` - Get current user from session
- `/src/app/auth/verify/page.tsx` - Password setup page
- `/src/app/login/page.tsx` - Login page
- `/src/app/my-wants/page.tsx` - User dashboard

### Wants System
- `/src/app/wants/page.tsx` - Create want form (with image upload)
- `/src/app/want/[id]/page.tsx` - Verification page (shows image)
- `/src/app/api/wants/public/route.ts` - Create/list wants
- `/src/app/api/wants/[id]/route.ts` - Get single want
- `/src/app/api/upload/route.ts` - Image upload to Supabase Storage

### Config
- `/next.config.js` - Has redirect from `/` to `/coming-soon`

## DATABASE SCHEMA (Auth-related)

```sql
-- Users table additions
verification_token TEXT
verification_expires TIMESTAMPTZ
email_verified BOOLEAN DEFAULT false
password_hash TEXT

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wants table addition
image_url TEXT
```

## USER FLOW

1. User goes to `/wants` → clicks "Create Your Want"
2. Uploads product screenshot (required)
3. Enters name, description, category, email
4. API creates want + sends verification email
5. User clicks email link → `/auth/verify?token=xxx`
6. Sets password → auto-logged in → redirected to `/my-wants`
7. Dashboard shows their wants with verification progress
8. User shares link → friends verify at `/want/[id]?ref=xxx`

## NEXT STEPS

1. Run SQL above in Supabase
2. Test complete flow end-to-end
3. Fix any remaining auth issues
4. Style refinements if needed

## RECENT COMMITS
- `c363d74` - Add image upload for wants, show image on verification page
- `b3cc813` - Redirect homepage to coming-soon
- `7e5c2dc` - Move CTA button above reward card, remove white strip
- `0d6f754` - Fix vote route SQL usage
- `8b27b61` - Fix TypeScript error with try/catch
- `19f47db` - Replace magic links with email/password auth
