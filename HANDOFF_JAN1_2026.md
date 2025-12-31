# JEFFY MVP HANDOFF - January 1, 2026

## CRITICAL: Run This SQL First

The auth system is broken due to RLS policies. Run this in Supabase SQL Editor:

```sql
-- ============================================
-- CRITICAL FIX: Run this FIRST
-- ============================================

-- Fix sessions table (causing login loop)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access sessions" ON sessions;
CREATE POLICY "Allow all on sessions" ON sessions FOR ALL TO public USING (true) WITH CHECK (true);

-- Fix want_verifications table
ALTER TABLE want_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access verifications" ON want_verifications;
CREATE POLICY "Allow all on verifications" ON want_verifications FOR ALL TO public USING (true) WITH CHECK (true);

-- Fix users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access users" ON users;
CREATE POLICY "Allow all on users" ON users FOR ALL TO public USING (true) WITH CHECK (true);

-- Fix wants table
ALTER TABLE wants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access wants" ON wants;
CREATE POLICY "Allow all on wants" ON wants FOR ALL TO public USING (true) WITH CHECK (true);

-- Clear test data to start fresh
TRUNCATE users CASCADE;
TRUNCATE wants CASCADE;
TRUNCATE sessions CASCADE;
```

## Current Status

### Working ✅
- Image upload with client-side compression (mobile + desktop)
- Want creation with duplicate check
- One want per person limit
- Email sending via Resend
- Verification page shows product image
- Homepage redirects to /coming-soon

### Broken ❌
- **Auth flow (login loop)** - Sessions table RLS blocking API calls
- Auto-login after password setup may fail

### Untested
- Full verification flow (someone clicking share link)
- Password reset
- /my-wants dashboard (blocked by auth)

## Project Structure

```
/Users/tredouxwillemse/Desktop/jeffy-mvp/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts      # Email/password login
│   │   │   │   ├── me/route.ts         # Get current user (401 issue)
│   │   │   │   ├── set-password/route.ts # Set password after verify
│   │   │   │   └── verify/route.ts     # Verify email token
│   │   │   ├── upload/route.ts         # Image upload to Supabase
│   │   │   ├── wants/
│   │   │   │   ├── public/route.ts     # Create/list wants
│   │   │   │   ├── [id]/route.ts       # Get single want
│   │   │   │   └── [id]/verify/route.ts # Verify a want
│   │   ├── wants/page.tsx              # Create want form
│   │   ├── want/[id]/page.tsx          # Verification page
│   │   ├── my-wants/page.tsx           # User dashboard
│   │   ├── login/page.tsx              # Login form
│   │   └── auth/verify/page.tsx        # Set password page
├── next.config.js                       # Redirect / to /coming-soon
└── package.json
```

## Database Schema

### users
- id (uuid, PK)
- email (text, unique)
- name (text, nullable)
- password_hash (text, nullable)
- email_verified (boolean)
- verification_token (text)
- verification_expires (timestamp)

### wants
- id (uuid, PK)
- product_name (text)
- description (text)
- category (text)
- user_id (uuid, FK)
- creator_email (text)
- image_url (text) ← NEW
- vote_count (int)
- verified_count (int)
- status (text: voting/sourcing/available)
- creator_referral_code (text)
- is_public (boolean)

### sessions
- id (uuid, PK)
- user_id (uuid, FK)
- token (text, unique)
- expires_at (timestamp)

### want_verifications
- id (uuid, PK)
- want_id (uuid, FK)
- verifier_email (text)
- referral_code (text)

## Environment Variables (Railway)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
RESEND_API_KEY=re_xxx
NEXT_PUBLIC_SITE_URL=https://jeffy.co.za
SESSION_SECRET=xxx
ADMIN_PASSWORD=xxx
```

## Supabase Storage Setup

Bucket: `images` (must be PUBLIC)

Required policies (run in SQL editor):
```sql
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'images');
CREATE POLICY "Allow public insert" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'images');
CREATE POLICY "Allow public update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'images');
CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'images');
```

## User Flow (Intended)

1. User visits /wants
2. Uploads product image (compressed client-side)
3. Fills form: product name, description, email
4. Submits → want created → email sent
5. Email contains:
   - Share link: jeffy.co.za/want/{id}?ref={code}
   - Setup link: jeffy.co.za/auth/verify?token={token}
6. User clicks setup link → sets password → auto-login
7. Redirected to /my-wants dashboard
8. User shares link with friends
9. Friends verify → verified_count increases
10. At 10 verifications → user gets free product

## Key Files to Know

### Image Upload (WORKING)
`src/app/api/upload/route.ts` - Handles upload to Supabase storage
`src/app/wants/page.tsx` - Client-side compression (2MB → 200KB)

### Auth Flow (BROKEN - needs RLS fix)
`src/app/api/auth/me/route.ts` - Returns 401 due to sessions RLS
`src/app/my-wants/page.tsx` - Redirects to /login when 401

### Want Creation (WORKING)
`src/app/api/wants/public/route.ts` - Creates want, sends email
- One want per email enforced
- Duplicate product check

## Recent Commits

```
5515b7a - Fix TypeScript error with Image constructor
8065e78 - Fix deprecated config export in upload route
eabbbc6 - Add client-side image compression for mobile uploads
4c96f7f - Add upload retry logic and progress feedback for mobile
9129eb1 - One want per person ever
6b6e2ea - Limit one want per user
fcab6cc - Always send confirmation email for new wants
```

## To Resume Development

1. Run the SQL fix at top of this document
2. Clear browser localStorage: `localStorage.clear()`
3. Test flow:
   - Go to /wants
   - Create want with image
   - Check email
   - Click verify link
   - Set password
   - Should land on /my-wants

## Next Features to Build

1. **Verification flow** - Test someone clicking share link
2. **Admin dashboard** - View all wants, manage status
3. **Progress notifications** - Email when verification count increases
4. **Product catalog** - Show sourced products for purchase
5. **1688 integration** - Auto-source products from China

## Deployment

- **Host**: Railway (auto-deploy from GitHub)
- **Repo**: github.com/Tredoux555/jeffy-commerce
- **Domain**: jeffy.co.za
- **Database**: Supabase

Push to main branch → Railway auto-deploys (~2 min)

## Contacts

- Supabase project: Check Railway env vars for URL
- Resend: hello@jeffy.co.za sender domain
- Railway: railway.app dashboard

---

**PRIORITY**: Fix RLS policies with SQL above, then test full auth flow.
