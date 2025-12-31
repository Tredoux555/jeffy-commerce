# JEFFY WANTS SYSTEM - HANDOFF DEC 31, 2025

## LATEST COMMIT
`pending` - Fix verification API - use maybeSingle instead of single

### Previous:
`6bfdd6d` - Add debug logging to verification API + accept both voting and active status

## KNOWN ISSUES

### 1. ~~Verification API Failing~~ FIXED ✓
- **Root cause:** `.single()` was throwing when no existing verification found
- **Fix:** Changed to `.maybeSingle()` - returns null instead of erroring
- Commit and push to deploy the fix

### 2. Schema Mismatch (OLD vs NEW)
- OLD: `title`, `current_agrees`, `threshold`, `status: 'active'`
- NEW: `product_name`, `verified_count`, `status: 'voting'`  
- Admin page uses OLD, public API uses NEW
- Verification API now accepts BOTH statuses

---

## WHAT'S LIVE AND WORKING

### 1. `/wants` - Main Create Want Page
- Full co-creator journey with emotional pitch
- "You're not a customer. You're a co-creator."
- 5-step process explanation
- Zone Partner bonus section at end
- **Wants list is HIDDEN** (code stored with `{false &&` for later)
- Create Want modal with success flow

### 2. `/wants/explore` - NEW Community Voting Page
- Reddit-style upvote/downvote on wants
- Search, sort (Popular/Trending/Newest)
- Share links, WhatsApp integration
- Votes stored in localStorage
- Dark theme matching site

### 3. `/my-wants` - User Dashboard (Magic Link Auth)
- Enter email → receive magic link
- Click link → see your wants + verification progress
- Share links to get more verifications
- **REQUIRES SQL** (see below)

### 4. Duplicate Want Flow
- When user tries to create duplicate:
  - Shows "Great minds think alike! 🧠"
  - Displays similar wants with Share buttons
  - CTA to "Explore All Wants" → `/wants/explore`
  - Option to "Request something different"

### 5. `/admin/wants` - Admin Dashboard
- Shows all wants with verification progress
- Stats: Ready to Source, Collecting, Expired
- WhatsApp creator when threshold reached
- **Uses OLD schema** (title, current_agrees, threshold)

---

## CRITICAL: RUN THIS SQL IN SUPABASE

```sql
-- Magic Links table for /my-wants dashboard
CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires ON magic_links(expires_at);
```

---

## BUG FIXED - DEC 31 (Claude Session)

### Root Cause Found:
The `.single()` call on line 75 was throwing errors when no existing verification was found (expected case for new users). Supabase's `.single()` throws an error if 0 rows returned.

### Fix Applied:
Changed `.single()` to `.maybeSingle()` which returns `null` instead of erroring.

```javascript
// BEFORE (broken):
const { data: existing } = await existingQuery.single();

// AFTER (fixed):
const { data: existing, error: existingError } = await existingQuery.maybeSingle();
```

Also added error handling if `want_verifications` table doesn't exist.

---

## NEXT STEPS

1. **Commit and push** the fix:
   ```bash
   cd ~/Desktop/jeffy-mvp
   git add .
   git commit -m "Fix verification API - use maybeSingle instead of single"
   git push
   ```

2. **Wait for Railway deploy** (~2 min)

3. **Test verification** at `/want/[id]?ref=...`

4. If still failing, check Railway logs for these lines:
   - `Verification request:` - shows what was received
   - `Want lookup:` - shows if want was found and its status  
   - `Check existing verification error:` - NEW: shows if query failed
   - `Insert verification error:` - shows DB error details
   - `Email send result:` - shows if Resend API failed

### If still failing after fix:
- Table missing: Run migration 007 in Supabase SQL editor
- Resend error: Check RESEND_API_KEY in Railway env vars
- Domain not verified: Check Resend dashboard for jeffy.co.za

---

## FILES CREATED/MODIFIED THIS SESSION

### Created:
- `/src/app/wants/explore/page.tsx` - Community voting page
- `/src/app/my-wants/page.tsx` - User dashboard
- `/src/app/api/auth/magic-link/route.ts` - Magic link auth
- `/src/app/api/wants/vote/route.ts` - Vote tracking
- `/src/app/api/admin/wants/route.ts` - Admin API
- `/supabase/migrations/005_magic_links.sql` - DB migration

### Modified:
- `/src/app/wants/page.tsx` - Hidden wants list, updated duplicate flow
- `/src/app/admin/wants/page.tsx` - REVERTED to original  
- `/src/app/api/wants/request-verification/route.ts` - FIXED: maybeSingle(), added table existence check

---

## KEY URLS

- Public wants: `https://jeffy.co.za/wants`
- Explore/vote: `https://jeffy.co.za/wants/explore`
- User dashboard: `https://jeffy.co.za/my-wants`
- Admin: `https://jeffy.co.za/admin/wants`
- Verify want: `https://jeffy.co.za/want/[id]?ref=[code]`

---

## REPO INFO

- GitHub: `Tredoux555/jeffy-commerce`
- Local: `/Users/tredouxwillemse/Desktop/jeffy-mvp`
- Deployed: Railway (auto-deploy from main)
