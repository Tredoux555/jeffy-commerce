# 🔄 SESSION HANDOFF — pick up here

**Last session:** 5 June 2026 · **Status: LIVE on jeffy.co.za.** All work committed, pushed, and building green (production `next build` passed on every change).
**Deploy = `git push origin main` via Desktop Commander on the Mac (SSH remote). Railway auto-builds (service `jeffy-commerce`). DB ops = Supabase SQL editor via Chrome.**
**Master context:** read `JEFFY_PROGRAM.md` first, then this file.

---

## ⚠️ ONE ACTION NEEDED FROM YOU

To start **persisting the IP-derived area** on each wish, run this once in the **Supabase SQL editor** (also saved as `supabase/migrations/013_wish_location.sql`):

```sql
ALTER TABLE wants ADD COLUMN IF NOT EXISTS ip_country TEXT;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS ip_region  TEXT;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS ip_city    TEXT;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS ip_area    TEXT;
```

Until then wishes still save fine — area just isn't stored, and AI Insights "by area" stays empty. The code already populates these the moment they exist.

---

## What changed this session (5 Jun 2026)

Converted the whole site to the **canonical Wish List vision** (the approved promo explainer), ripped out the old voting mechanic, and added new capability:

1. **Killed the "share with 10 / rally backers / verify" desperation mechanic** site-wide.
2. **Ripped out the orphaned legacy backend** (~4,250 lines): voting/verify/threshold/benefits/milestone.
3. **Unlimited wishes per person** — removed the "one free product per person" 400 block + the "similar wish" interrupt.
4. **Ultra-minimal wish form**: just *"What do you want?"* + email (photo & details optional). Category/price/frequency/area fields removed — the AI infers them.
5. **Area captured from request IP** server-side (privacy-light: city/region/country, never raw IP). Geo-ready + non-breaking; needs the migration above.
6. **AI Wish Insights** admin tool (Claude categorises / clusters / recommends what to source).
7. **Cadence locked to MONTHLY** (was briefly weekly). Plan: upgrade to weekly in Year 2 when more shipments are flowing.
8. **Empty product categories hidden** from the storefront.

## The model (current source of truth)

Make a wish — no purchase, no catch, up to ten things. **Every MONTH** Jeffy draws winners **at random** and grants their wish **free**, then celebrates them publicly (radio, press, social). Each wish = one entry. No sharing, no recruiting, no thresholds. Wishes double as a live demand map for what to stock.
Legal rules: `/wish-list-rules` (CPA s.36). Customer T&Cs: `/wants/terms`. Both say monthly.

## Fulfilment intent (per Tredoux)
When a winner is drawn, reach out **personally** to confirm exactly what they want and deliver something that genuinely delights them — even if it costs more (e.g. they describe earbuds, we send mind-blowing Bose). One delighted winner blasting "this is legit" online = credibility + hundreds of new wishes per prize. This is *why* monthly (bigger spend per prize) beats weekly for now.

## Where things live

| Area | Path |
|---|---|
| Wish funnel (public) | `src/app/wants/page.tsx` |
| Floating promo popup | `src/components/floating-wants-promo.tsx` |
| Wish submission API | `src/app/api/wants/public/route.ts` (no limits; IP-geo; confirm email) |
| Logged-in dashboard | `src/app/my-wants/page.tsx` (uses `/api/auth/me`) |
| AI Wish Insights | `src/app/admin/wish-insights/page.tsx` + `src/app/api/admin/wish-insights/route.ts` (`claude-sonnet-4-20250514`, existing `ANTHROPIC_API_KEY`) |
| Run the draw / campaign | `src/app/admin/campaign/page.tsx`, `src/lib/wishlist/draw.ts`, table `wishlist_grants` |
| Incoming wishes (admin) | `src/app/admin/wants/page.tsx` (clean list → "Source") |
| Demand ranking (admin) | `src/app/admin/wishlist/page.tsx` |
| Categories storefront | `src/app/categories/page.tsx`, `src/app/products/page.tsx` (empties filtered) |

**AI Wish Insights usage:** Admin → sidebar → **AI Wish Insights** → "Analyse wishes". Pulls up to 400 latest wishes → Claude → summary, categories, clustered product types, demand by area, "source these first". ~10–30s.

## Removed this session — do NOT resurrect
Pages `/want/[id]`, `/wants/[shareCode]`, `/wants/verify`, `/wants/my`, `/wants/explore`, `/admin/survey`, `/admin/launch`(+playbook), `/admin/notifications`; API `convert`, `quick-verify`, `verify`, `request-verification`, `vote`, `wants/[id]`, `wants/my`, `admin/notifications`, `admin/wants`, `cron/expire-wants`, `admin/launch/seed-wants`; services `wants-service`, `want-to-product`, `notification-service`, `notification-utils`, `sms/service`, `sms/notifications`, `email/verification`; components `hero-wants`, `wants-display`, `convert-to-product-button`, `admin-notifications`.
**Critical fix:** removed a daily `expire-wants` cron that would have marked every wish "expired" (keyed off the dead `verified_count`).

## Known / deferred
- **Dead DB columns** (`verified_count`, `vote_count`, `want_agrees`, etc.) still exist — harmless; drop in a later migration for a clean schema.
- **Zone Partner → Reseller** naming still appears on homepage/checkout/emails/agreement. Intentionally **left untouched** (separate workstream; some are real DB columns like `order.zone_partners`).
- **PWA manifest** references a missing `icons/icon-144x144.png` (console 404) — cosmetic; can add the icon.
- **Cadence:** monthly now. Year-2 flip to weekly = copy-only sweep (search "every month / monthly draw").

## Deploy notes
- `git push origin main` → Railway auto-deploys. Hard-refresh to bust the promo popup (sessionStorage-dismissed).
- Verify locally with `npm run build` (green) before each push.
