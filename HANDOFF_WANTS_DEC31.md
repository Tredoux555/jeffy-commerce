# JEFFY WANTS SYSTEM - HANDOFF DEC 31, 2025

## LATEST COMMIT
`6bfdd6d` - Add debug logging to verification API + accept both voting and active status

## KNOWN ISSUES

### 1. Verification API Failing (Screenshot: 20:48)
- Error: "Failed to create verification"
- 400 and 500 errors from `/api/wants/request-verification`
- Added debug logging to track down issue
- Also fixed: Now accepts both `voting` AND `active` status for backwards compatibility
- **Check Railway logs** after next attempt to see actual error

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

## DEBUGGING THE VERIFICATION ERROR

1. Try to verify again on `/want/[id]?ref=...`
2. Check Railway logs in real-time
3. Look for these log lines:
   - `Verification request:` - shows what was received
   - `Want lookup:` - shows if want was found and its status
   - `Insert verification error:` - shows DB error details
   - `Email send result:` - shows if Resend API failed

Possible causes:
- `want_verifications` table not created (run migration 007)
- Resend API key missing or invalid
- Email domain not verified in Resend

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
- `/src/app/api/wants/request-verification/route.ts` - Added logging, accepts voting+active

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
