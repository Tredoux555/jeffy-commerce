# HANDOFF: Wants System Fix - January 2, 2026

## WHAT WAS FIXED

### Problem
Admin page at `/admin/wants` was looking for wrong database columns:
- Looking for `status === 'active'` but live system creates `status === 'voting'`
- Looking for `current_agrees` but live system uses `verified_count`
- Looking for `title` but live system uses `product_name`
- Looking for `creator_phone` but live system uses `creator_email`

**Result:** Wants created by users showed in total count but appeared in NO category (not in Ready, Collecting, or Expired).

### Solution
Updated `/src/app/admin/wants/page.tsx` with helper functions that read BOTH column names:
- `getCount()` - reads `verified_count` OR `current_agrees`
- `getTitle()` - reads `product_name` OR `title`
- `getImage()` - reads `image_url` OR `reference_image_url`
- `getContact()` - returns email OR phone with appropriate UI
- `isCollecting()` - checks for `'voting'` OR `'active'` status

Admin now shows:
- ✅ Correct product names
- ✅ Correct verification counts
- ✅ Email contact with "Email Creator" button
- ✅ Wants in correct categories

## LIVE USER FLOW (Email-Based System)

```
/coming-soon → /wants (modal) → Enter email → Verification email sent
     ↓
User clicks email link → Verified as creator
     ↓
User shares: jeffy.co.za/want/[uuid]?ref=[code]
     ↓
Friends enter email → Get verification email → Click to verify
     ↓
verified_count increments (DB trigger)
     ↓
At 10 verifications → status = 'sourcing' → Shows in "Ready to Source"
```

## KEY FILES

| File | Purpose |
|------|---------|
| `src/app/admin/wants/page.tsx` | Admin dashboard (FIXED) |
| `src/app/wants/page.tsx` | Public wants list + create modal |
| `src/app/want/[id]/page.tsx` | Friend verification page |
| `src/app/wants/verify/[token]/page.tsx` | Email link landing |
| `src/app/api/wants/public/route.ts` | Create want API |
| `src/app/api/wants/verify/route.ts` | Verify API |
| `src/lib/email/verification.ts` | Email templates |
| `supabase/migrations/007_want_verifications.sql` | DB trigger for count |

## DATABASE COLUMNS (Live System)

```sql
wants table:
- product_name (NOT title)
- verified_count (NOT current_agrees)
- creator_email (NOT creator_phone)
- image_url (NOT reference_image_url)
- status: 'voting' → 'sourcing' → 'available'
- creator_referral_code (for tracking)
```

## DEPLOYED
- Commit: `83494b0`
- Message: "Fix admin wants page to support email-based verification system"
- Time: Jan 2, 2026 ~08:30 UTC

## NEXT STEPS
1. ✅ Wants system fixed
2. 🔄 Zone Partner signup audit (starting now)
3. Test complete flow before SA traffic

---
*Session: Jan 2, 2026 | Focus: Production readiness for launch*
