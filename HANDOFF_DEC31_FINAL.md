# JEFFY PRE-LAUNCH - LIVE STATUS
**Updated:** Dec 31, 2025 12:40 PM Beijing Time

## 🚀 LIVE URLS
- **https://jeffy.co.za/coming-soon** - Customer waitlist with referral system
- **https://jeffy.co.za/wants** - Product voting (50 votes = sourced, first requester FREE)
- **https://jeffy.co.za/zone-partners** - 16 SA zones with position-based benefits

## ✅ WHAT'S WORKING

### Pages
- Coming-soon with countdown timer (Jan 20, 2025 launch)
- Impact bar showing school funding goal
- Founder pricing urgency (first 100)
- Wants page with 6 seeded products
- Zone Partners page with 16 SA zones

### APIs
- `/api/waitlist` - POST to join, GET to see count
- `/api/wants/public` - POST to request product, GET to list
- `/api/wants/vote` - POST to vote on products
- `/api/zone-partners` - POST to apply

### Email System
- Resend integrated and verified (hello@jeffy.co.za)
- Welcome emails sending on waitlist signup
- Includes position, referral code, WhatsApp share button
- Zone Partner confirmation emails ready

### Database (Supabase)
- `waitlist` - 8 entries, referral system working
- `wants` - 6 products seeded
- `want_votes` - vote tracking
- `users` - auto-created on want submission
- All RLS policies configured

## 📊 CURRENT STATS
- Waitlist: 8 signups
- Products requested: 6
- Referral system: Verified working
- Email delivery: Confirmed

## 🔧 FIXES APPLIED TODAY
1. Missing `wants` table → Recreated with correct schema
2. Sequence permissions for `waitlist_position_seq`
3. Table permissions for `wants`, `want_votes`
4. TypeScript build error (_future folder excluded)
5. Schema cache reload after table recreation

## 📁 KEY FILES
```
src/app/
├── coming-soon/page.tsx     # Waitlist landing
├── wants/page.tsx           # Product voting
├── zone-partners/page.tsx   # Partner signup
└── api/
    ├── waitlist/route.ts
    ├── wants/public/route.ts
    ├── wants/vote/route.ts
    └── zone-partners/route.ts

src/lib/
├── email/
│   ├── resend.ts            # Email client
│   └── templates/
│       ├── waitlist-welcome.tsx
│       └── zone-partner-welcome.tsx
```

## 🔐 ENV VARS (Railway)
```
NEXT_PUBLIC_SUPABASE_URL=https://inhrgiakjyprabxluppv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_... (rotate this - was shared in chat)
```

## ⚠️ ACTION REQUIRED
1. **Rotate Resend API key** - Go to resend.com → API Keys → Delete current → Create new → Update Railway

## 🎯 NEXT PRIORITIES
1. **Test the live pages** - Share with 2-3 people to verify flow
2. **Social proof** - Add testimonials or early supporter badges
3. **Analytics** - Add Plausible or Vercel Analytics
4. **SEO** - Meta tags, OG images for social sharing
5. **Zone Partner onboarding flow** - After signup, what's next?

## 🧪 TEST COMMANDS
```bash
# Test waitlist signup
curl -X POST https://jeffy.co.za/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "name":"Test"}'

# Test product want
curl -X POST https://jeffy.co.za/api/wants/public \
  -H "Content-Type: application/json" \
  -d '{"product_name":"Test Product","user_email":"test@example.com"}'

# Check wants list
curl https://jeffy.co.za/api/wants/public
```

---
**Ready for soft launch. Share the links!**
