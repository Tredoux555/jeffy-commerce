# JEFFY HANDOFF - December 31, 2025

## SESSION SUMMARY
Zone Partner journey built (4 pages), coming-soon redesigned, application system working.

---

## TASK #1 (PRIORITY): Verification System for Wants

### The Problem
Currently the voting system is broken/missing. Need TWO separate systems:

### System A: Popularity Clicks (Fun Metric)
- The upvote button on `/wants` page
- Anyone can click unlimited times
- No login, no verification
- Just increments a counter for engagement feel
- Admin can see it but it's NOT official
- **Status:** Needs to be decoupled from verification

### System B: Real Verification (Serious - THE ACTUAL SYSTEM)
- Creator of a Want gets a PERSONAL link with unique code
- Example: `jeffy.co.za/want/[want-id]?ref=[CREATOR_CODE]`
- Creator shares this link with friends/family
- When friend clicks:
  1. See the want details
  2. MUST enter phone OR email
  3. Phone/email MUST be verified (OTP or email confirmation link)
  4. Only THEN does it count as 1 verification
- **10 verified people = Tredoux sources the product**
- **First requester gets it FREE**

---

## VERIFICATION INFRASTRUCTURE (Already Exists!)

### Email System ✅ READY
- **Provider:** Resend
- **Domain:** jeffy.co.za (verified, DKIM/SPF configured)
- **API Key:** In Railway env vars as `RESEND_API_KEY`
- **Sending from:** noreply@jeffy.co.za or hello@jeffy.co.za
- **Status:** Working - welcome emails already sending

**For Verification:**
- Send email with unique verification link
- Link format: `jeffy.co.za/verify/[TOKEN]`
- Token expires after 24 hours
- On click → mark as verified

### SMS System ⚠️ NEEDS TESTING
- **Provider:** Twilio (previously set up)
- **Credentials:** Check Railway env vars for:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
- **Status:** Set up before but untested recently

**For Verification:**
- Send 6-digit OTP via SMS
- User enters OTP on verification page
- OTP expires after 10 minutes
- On correct entry → mark as verified

### Verification Flow Options

**Option 1: Email Verification**
```
Friend enters email
    ↓
System sends email via Resend:
"[Name] wants you to verify their product request!
Click here to confirm you'd buy this too: [LINK]"
    ↓
Friend clicks link
    ↓
verified_count++
```

**Option 2: SMS Verification (Phone)**
```
Friend enters phone number
    ↓
System sends SMS via Twilio:
"Your Jeffy verification code: 123456"
    ↓
Friend enters code on page
    ↓
verified_count++
```

**Option 3: Let User Choose**
- Form shows both options: "Verify via Email" or "Verify via SMS"
- Email = free (Resend generous limits)
- SMS = costs money (Twilio charges per SMS)
- Recommend: Default to email, offer SMS as backup

---

## VERIFICATION DATABASE SCHEMA

```sql
-- Verification tokens/OTPs
CREATE TABLE want_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  want_id UUID REFERENCES wants(id) ON DELETE CASCADE,
  
  -- Contact method (one or the other)
  email TEXT,
  phone TEXT,
  
  -- Verification
  verification_type TEXT CHECK (verification_type IN ('email', 'sms')),
  verification_token TEXT, -- for email links
  otp_code TEXT,           -- for SMS (6 digits)
  expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  
  -- Tracking
  referred_by_code TEXT,   -- creator's referral code
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicates
  UNIQUE(want_id, email),
  UNIQUE(want_id, phone)
);

-- Update wants table
ALTER TABLE wants ADD COLUMN IF NOT EXISTS creator_referral_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex');
ALTER TABLE wants ADD COLUMN IF NOT EXISTS verified_count INTEGER DEFAULT 0;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS popularity_clicks INTEGER DEFAULT 0;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS creator_email TEXT;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS creator_phone TEXT;
```

---

## API ENDPOINTS NEEDED

### POST /api/wants/request-verification
```json
Request:
{
  "want_id": "uuid",
  "ref_code": "CREATOR_CODE",
  "method": "email" | "sms",
  "contact": "email@example.com" | "+27821234567"
}

Response:
{
  "success": true,
  "message": "Verification email sent" | "OTP sent to your phone"
}
```

### POST /api/wants/verify
```json
Request (for SMS):
{
  "want_id": "uuid",
  "phone": "+27821234567",
  "otp": "123456"
}

Request (for Email - just needs token from URL):
{
  "token": "abc123xyz"
}

Response:
{
  "success": true,
  "verified_count": 5,
  "remaining": 5
}
```

---

## EMAIL TEMPLATE (for Resend)

```typescript
// src/lib/email/verification.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail({
  to,
  creatorName,
  productName,
  verificationLink
}: {
  to: string;
  creatorName: string;
  productName: string;
  verificationLink: string;
}) {
  await resend.emails.send({
    from: 'Jeffy <hello@jeffy.co.za>',
    to,
    subject: `${creatorName} wants your opinion on something`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Jeffy</h1>
        <p>Hey!</p>
        <p><strong>${creatorName}</strong> requested a product on Jeffy and wants to know if you'd buy it too:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="margin: 0;">${productName}</h2>
        </div>
        <p>If 10 people verify they want this, Jeffy will source it - and ${creatorName} gets theirs FREE!</p>
        <a href="${verificationLink}" style="display: inline-block; background: #f97316; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold;">
          Yes, I'd Buy This Too!
        </a>
        <p style="color: #666; margin-top: 30px; font-size: 14px;">
          If you don't want this product, just ignore this email.
        </p>
      </div>
    `
  });
}
```

---

## SMS TEMPLATE (for Twilio)

```typescript
// src/lib/sms/twilio.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendVerificationSMS({
  to,
  otp
}: {
  to: string;
  otp: string;
}) {
  await client.messages.create({
    body: `Your Jeffy verification code: ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to
  });
}
```

---

## FIRST STEP: Test Twilio

Before building, test if Twilio still works:

```bash
# In project directory, create test file:
node -e "
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
client.messages.create({
  body: 'Jeffy test: Your code is 123456',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: '+27765062049'  // Your number
}).then(m => console.log('Sent:', m.sid)).catch(e => console.error('Error:', e));
"
```

If this works, SMS verification is ready. If not, fall back to email-only.

---

## COMPLETED TODAY

### Zone Partner Journey (4 pages)
| Page | URL | Status |
|------|-----|--------|
| What is Jeffy | `/partner` | ✅ Live |
| How It Works | `/partner/how-it-works` | ✅ Live |
| Why It Works | `/partner/why-it-works` | ✅ Live |
| Apply | `/partner/apply` | ✅ Live |

### Coming Soon Page
- `/coming-soon` - Two paths: Create a Want / Become Zone Partner
- Dark slate theme, premium exclusive feel
- "This isn't for everyone" energy
- **THIS IS THE AESTHETIC TO MAINTAIN**

### Key Changes
1. **50 votes → 10 verifications** for Wants
2. **Zone selection**: Province → City → Area (cascading dropdowns)
3. **School messaging**: "Jeffy builds commerce empire → commerce builds school empire"
4. **API fixed**: Handles existing waitlist emails (upgrades to zone partner)
5. **Phone stored** in zone_id field (temporary)
6. **R200 → R500** markup example on why-it-works page

---

## DATABASE NOTES

### Waitlist Table
- Zone partners stored with `type: 'zone_partner'`
- `zone_id` format: `western-cape > cape-town > Camps Bay | Phone: 0761234567`
- Email is UNIQUE across all waitlist types
- Existing customers auto-upgrade to zone partner if they apply

### Wants Table
- Currently has `vote_count` but this needs to split into:
  - `popularity_clicks` (fun metric, meaningless)
  - `verified_count` (real verifications, serious)

---

## DESIGN PHILOSOPHY

### Two Vibes, Same Brand
| Audience | Vibe | Colors |
|----------|------|--------|
| Customers (Homepage) | "Eish, These Prices!" | Orange energy, gray-950 |
| Partners/Believers | "This is a movement" | Slate dark, premium, exclusive |

The contrast IS the design. Don't make them look the same.

---

## NOT BUILT YET (Phase 2+)

- [ ] **Verification system** (Task #1 above)
- [ ] Digital zone mapping tool
- [ ] Zone boundary visualization  
- [ ] Google Places autocomplete for areas
- [ ] Separate phone column in database
- [ ] OTP service integration (consider Twilio, Africa's Talking, or local SA provider)

---

## FILES MODIFIED TODAY

### New Files
- `src/app/partner/page.tsx` - What is Jeffy
- `src/app/partner/how-it-works/page.tsx`
- `src/app/partner/why-it-works/page.tsx`
- `src/app/partner/apply/page.tsx` - Zone application form
- `src/app/partner/layout.tsx`

### Modified Files
- `src/app/coming-soon/page.tsx` - Redesigned with two paths
- `src/app/coming-soon/opengraph-image.tsx` - New OG image
- `src/app/wants/page.tsx` - Changed 50→10 threshold
- `src/app/api/zone-partners/route.ts` - Fixed unique email handling

---

## URLS FOR TESTING

```
https://jeffy.co.za/coming-soon          <- Entry point (share this)
https://jeffy.co.za/partner              <- Zone partner journey start
https://jeffy.co.za/partner/how-it-works
https://jeffy.co.za/partner/why-it-works  
https://jeffy.co.za/partner/apply        <- Application form
https://jeffy.co.za/wants                <- Product requests
https://jeffy.co.za                      <- Main store
```

---

## NEXT SESSION PRIORITIES

1. **BUILD VERIFICATION SYSTEM** (described above)
2. Delete test wants from database
3. Test full flow: Create want → Get link → Share → Friend verifies → Count increments
4. Admin view for verifications vs popularity

---

## REPO & DEPLOYMENT

- **Repo:** github.com/Tredoux555/jeffy-commerce
- **Hosting:** Railway
- **Branch:** main (auto-deploys)
- **Build time:** ~90 seconds

---

*Handoff created: Dec 31, 2025 @ 17:00 SAST*
