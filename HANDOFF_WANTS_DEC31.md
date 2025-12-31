# JEFFY WANTS SYSTEM - HANDOFF DEC 31, 2025

## LATEST COMMIT
`aa295de` - Revert admin/wants to working version

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

## SCHEMA MISMATCH ISSUE

There are TWO schemas in play:

**OLD Schema (admin page expects):**
- `title` (product name)
- `current_agrees` (verification count)
- `threshold` (default 10)
- `status: 'active'`

**NEW Schema (public wants API uses):**
- `product_name`
- `verified_count`
- `status: 'voting'`

The `/admin/wants` page was broken because I tried to merge them. I reverted it to the old working version. 

**TODO:** Either:
1. Migrate all old data to new schema, OR
2. Update admin page to handle both schemas properly (I attempted this but it broke)

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

---

## NEXT STEPS

1. **Run the SQL** for magic_links table
2. **Test `/my-wants`** flow end-to-end
3. **Decide on schema migration** - new vs old
4. **Admin wants page** needs to work with new schema
5. **Success modal on mobile** still showing old version - may need cache clear or redeploy

---

## KEY URLS

- Public wants: `https://jeffy.co.za/wants`
- Explore/vote: `https://jeffy.co.za/wants/explore`
- User dashboard: `https://jeffy.co.za/my-wants`
- Admin: `https://jeffy.co.za/admin/wants`

---

## REPO INFO

- GitHub: `Tredoux555/jeffy-commerce`
- Local: `/Users/tredouxwillemse/Desktop/jeffy-mvp`
- Deployed: Railway (auto-deploy from main)
