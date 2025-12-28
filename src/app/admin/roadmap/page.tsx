'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle, Circle, Rocket, Calendar, 
  Code, Briefcase, AlertTriangle, TrendingUp, Users,
  ChevronDown, ChevronUp, Copy, Check, Database,
  Mail, MapPin, Package, CreditCard, MessageSquare,
  Star, RotateCcw, Shield, Clock, Target, Zap
} from 'lucide-react';

// ============================================================
// TECHNICAL TRACK - For AI Implementation
// Each task includes context for future Claude sessions
// ============================================================

interface TechTask {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  estimatedHours: number;
  dependencies?: string[];
  aiContext: string; // Instructions for future AI
  codeLocation?: string;
  sqlRequired?: boolean;
  taskType: 'sql' | 'cursor'; // SQL = paste in Supabase, Cursor = give to Cursor AI
}

interface TechPhase {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  tasks: TechTask[];
}

const TECH_PHASES: TechPhase[] = [
  {
    id: 'database',
    name: 'Phase 1: Database Foundation',
    icon: Database,
    color: 'blue',
    description: 'Schema updates - everything depends on this',
    tasks: [
      {
        id: 'db-zones',
        title: 'Add postal_codes to zones table',
        description: 'Enable order-to-zone matching via postal codes',
        priority: 'critical',
        estimatedHours: 0.5,
        sqlRequired: true,
        taskType: 'sql',
        aiContext: `-- PASTE THIS INTO SUPABASE SQL EDITOR --

ALTER TABLE zones ADD COLUMN IF NOT EXISTS postal_codes TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_zones_postal_codes ON zones USING GIN(postal_codes);

-- VERIFY IT WORKED --
SELECT column_name FROM information_schema.columns WHERE table_name = 'zones' AND column_name = 'postal_codes';`
      },
      {
        id: 'db-orders',
        title: 'Add assignment fields to orders',
        description: 'Track which Zone Partner handles each order',
        priority: 'critical',
        estimatedHours: 0.5,
        dependencies: ['db-zones'],
        sqlRequired: true,
        taskType: 'sql',
        aiContext: `-- PASTE THIS INTO SUPABASE SQL EDITOR --

ALTER TABLE orders ADD COLUMN IF NOT EXISTS zone_partner_id UUID REFERENCES zone_partners(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_zone_partner ON orders(zone_partner_id);

-- VERIFY: Check orders table in Supabase dashboard for new columns`
      },
      {
        id: 'db-partners',
        title: 'Add onboarding fields to zone_partners',
        description: 'Track legal compliance and activation status',
        priority: 'critical',
        estimatedHours: 0.5,
        sqlRequired: true,
        taskType: 'sql',
        aiContext: `-- PASTE THIS INTO SUPABASE SQL EDITOR --

ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS disclosure_sent_at TIMESTAMPTZ;
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS can_sign_after DATE;
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS agreement_signed_at TIMESTAMPTZ;
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS cooling_off_ends_at DATE;
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ;
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS training_completed_at TIMESTAMPTZ;
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS stock_received_at TIMESTAMPTZ;
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 5.00;

-- VERIFY: Check zone_partners table in Supabase dashboard`
      }
    ]
  },
  {
    id: 'auto-assign',
    name: 'Phase 2: Auto Order Assignment',
    icon: Zap,
    color: 'orange',
    description: 'The operational backbone - orders flow to partners automatically',
    tasks: [
      {
        id: 'zones-ui',
        title: 'Update zones admin to input postal codes',
        description: 'Admin can set which postal codes belong to each zone',
        priority: 'critical',
        estimatedHours: 1,
        dependencies: ['db-zones'],
        codeLocation: '/src/app/admin/zones/page.tsx',
        taskType: 'cursor',
        aiContext: `CURSOR TASK: Modify /src/app/admin/zones/page.tsx

WHAT TO BUILD:
Add postal codes input field to the zone creation/edit form.

STEPS:
1. Add to formData state: postal_codes: '' (comma-separated string)
2. Add input field in form after description:
   <Input value={formData.postal_codes} onChange={...} placeholder="2196, 2191, 2090" />
3. Parse on submit: postal_codes.split(',').map(p => p.trim()).filter(p => /^\\d{4}$/.test(p))
4. Display in zone list: show "{zone.postal_codes?.length || 0} postal codes"

CONTEXT: SA postal codes are 4 digits. Zone Partner owns exclusive delivery for those codes.

TEST: Create zone, add postal codes, verify they save and display.`
      },
      {
        id: 'assign-api',
        title: 'Create auto-assign API endpoint',
        description: 'POST /api/orders/auto-assign - matches order to zone partner',
        priority: 'critical',
        estimatedHours: 2,
        dependencies: ['db-zones', 'db-orders'],
        codeLocation: '/src/app/api/orders/auto-assign/route.ts',
        taskType: 'cursor',
        aiContext: `CURSOR TASK: Create /src/app/api/orders/auto-assign/route.ts

WHAT TO BUILD:
API endpoint that assigns paid orders to Zone Partners based on postal code.

LOGIC:
1. Get order by ID, verify status === 'paid'
2. Extract postal code from delivery_address (regex: /\\b(\\d{4})\\b(?!.*\\d{4})/)
3. Query: zones WHERE postal_codes @> ARRAY[postalCode] AND is_active = true
4. If zone found, get zone_partner WHERE zone_id = zone.id AND is_active = true
5. If partner found: UPDATE orders SET zone_partner_id, assigned_at, status = 'assigned'
6. If no partner: UPDATE orders SET status = 'pending_assignment', notes = reason
7. Send WhatsApp notification to partner (call /api/notify/whatsapp)

RETURN: { success: boolean, partnerId?, partnerName?, reason? }

REFERENCE FILES:
- /src/app/api/webhooks/payfast/route.ts (order update pattern)
- /src/lib/supabase/server.ts (createAdminClient)

TEST: Create zone with postal codes, create partner in zone, place test order, verify assignment.`
      },
      {
        id: 'webhook-hook',
        title: 'Call auto-assign from PayFast webhook',
        description: 'Trigger assignment when payment completes',
        priority: 'critical',
        estimatedHours: 0.5,
        dependencies: ['assign-api'],
        codeLocation: '/src/app/api/webhooks/payfast/route.ts',
        taskType: 'cursor',
        aiContext: `CURSOR TASK: Modify /src/app/api/webhooks/payfast/route.ts

WHAT TO BUILD:
After marking order as 'paid', call the auto-assign API.

ADD THIS CODE after the order status update to 'paid':

// AUTO-ASSIGN TO ZONE PARTNER
try {
  const assignResponse = await fetch(\`\${process.env.NEXT_PUBLIC_SITE_URL}/api/orders/auto-assign\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId })
  });
  const assignResult = await assignResponse.json();
  console.log(\`Order \${orderId} assignment:\`, assignResult);
} catch (e) {
  console.error(\`Failed to auto-assign order \${orderId}:\`, e);
}

TEST: Complete PayFast sandbox payment, check if order gets zone_partner_id populated.`
      }
    ]
  },
  {
    id: 'onboarding',
    name: 'Phase 3: Partner Onboarding',
    icon: Users,
    color: 'purple',
    description: 'Legal compliance + activation checklist',
    tasks: [
      {
        id: 'legal-lib',
        title: 'Create legal compliance functions',
        description: 'CPA 14-day wait and 10-day cooling off calculations',
        priority: 'critical',
        estimatedHours: 1,
        codeLocation: '/src/lib/legal-compliance.ts',
        taskType: 'cursor',
        aiContext: `CURSOR TASK: Create /src/lib/legal-compliance.ts

WHAT TO BUILD:
Legal compliance utility functions for SA Consumer Protection Act.

FUNCTIONS NEEDED:
1. canSignAgreement(disclosureSentAt: Date | null): { allowed: boolean, daysRemaining: number }
   - Returns false if < 14 days since disclosure sent
   
2. getCoolingOffStatus(agreementSignedAt: Date | null): { inCoolingOff: boolean, businessDaysRemaining: number }
   - 10 BUSINESS days (skip weekends)
   - Partner can cancel freely during this period
   
3. calculateExitRefund(depositCents: number, inCoolingOff: boolean, damagedStockCents: number)
   - Full refund during cooling off
   - Deduct damaged stock after

INSTALL: npm install date-fns
USE: addDays, differenceInDays, isSaturday, isSunday from date-fns`
      },
      {
        id: 'approval-flow',
        title: 'Update admin approval to start 14-day wait',
        description: 'When admin approves, auto-set disclosure_sent_at and can_sign_after',
        priority: 'critical',
        estimatedHours: 1,
        dependencies: ['db-partners', 'legal-lib'],
        codeLocation: '/src/app/admin/partners/page.tsx',
        taskType: 'cursor',
        aiContext: `CURSOR TASK: Modify /src/app/admin/partners/page.tsx

WHAT TO BUILD:
When admin approves a partner, start the 14-day disclosure wait period.

In updatePartnerStatus function, when status === 'approved':
1. const now = new Date();
2. const canSignAfter = addDays(now, 14);
3. updateData.disclosure_sent_at = now.toISOString();
4. updateData.can_sign_after = canSignAfter.toISOString().split('T')[0];

ALSO: Send WhatsApp notification that disclosure was sent.

TEST: Approve partner, verify disclosure_sent_at is set, verify can_sign_after is 14 days later.`
      },
      {
        id: 'onboarding-page',
        title: 'Create partner onboarding checklist page',
        description: 'Partner sees steps: wait, sign, deposit, training, stock, activate',
        priority: 'high',
        estimatedHours: 3,
        dependencies: ['legal-lib'],
        codeLocation: '/src/app/partner/onboarding/page.tsx',
        taskType: 'cursor',
        aiContext: `CURSOR TASK: Create /src/app/partner/onboarding/page.tsx

WHAT TO BUILD:
A checklist page showing partner's progress through onboarding.

CHECKLIST STEPS (in order):
1. Disclosure Document Sent ✓ (auto, show days remaining)
2. Sign Agreement (blocked until 14 days, link to /partner/agreement/[id])
3. Cooling-Off Period (10 business days, show remaining)
4. Pay Deposit (only after cooling off ends!)
5. Complete Training (video + quiz)
6. Receive Stock (confirm in app)
7. Go Live! (is_active = true)

EACH STEP SHOWS: ✓ Complete | ⏳ Current | ○ Upcoming
Load partner data from Supabase, calculate status using legal-compliance.ts

UI: Dark theme like partner dashboard, mobile-friendly.`
      }
    ]
  },
  {
    id: 'notifications',
    name: 'Phase 4: Notifications',
    icon: MessageSquare,
    color: 'green',
    description: 'Keep partners and customers informed',
    tasks: [
      {
        id: 'whatsapp-templates',
        title: 'Add WhatsApp notification templates',
        description: 'new_order, low_stock, payout_sent, disclosure_sent',
        priority: 'high',
        estimatedHours: 1,
        codeLocation: '/src/app/api/notify/whatsapp/route.ts',
        taskType: 'cursor',
        aiContext: `CURSOR TASK: Modify /src/app/api/notify/whatsapp/route.ts

WHAT TO BUILD:
Add new notification templates.

ADD TEMPLATES:
- new_order: "🛒 New Jeffy Order! #{orderNumber}. Deliver to: {address}. Earn R{earnings}."
- disclosure_sent: "📄 Hi {name}! Application approved. Disclosure doc sent by email. 14 day wait starts now."
- low_stock: "⚠️ Low stock: {product} ({remaining} left)"
- payout_sent: "💰 R{amount} sent for {count} deliveries!"

Add new ones to TEMPLATES object.
TEST: Call API with each type, verify message format.`
      },
      {
        id: 'email-api',
        title: 'Create email API with Resend',
        description: 'Order confirmation emails to customers',
        priority: 'high',
        estimatedHours: 2,
        codeLocation: '/src/app/api/email/send/route.ts',
        taskType: 'cursor',
        aiContext: `CURSOR TASK: Create /src/app/api/email/send/route.ts

WHAT TO BUILD:
Email sending API using Resend.

SETUP: npm install resend
ENV: RESEND_API_KEY

TEMPLATES:
- order_confirmation: Order #{number}, delivery address, total, tracking link
- partner_assigned: Your delivery partner is {name}, contact {phone}

HTML TEMPLATE: Use Jeffy orange branding, include logo, footer.

TEST: Send test email to yourself.`
      }
    ]
  },
  {
    id: 'post-launch',
    name: 'Phase 5: Post-Launch Features',
    icon: Star,
    color: 'yellow',
    description: 'Build after first orders are flowing',
    tasks: [
      {
        id: 'rating-system',
        title: 'Build customer rating system',
        description: 'Customer rates 1-5 stars after delivery',
        priority: 'medium',
        estimatedHours: 4,
        taskType: 'cursor',
        aiContext: `CURSOR TASK: Build rating system

CREATE FILES:
1. /src/app/rate/[orderId]/page.tsx - Star selection + tags + comment
2. /src/app/api/ratings/submit/route.ts - Save rating, update partner average

SQL (run in Supabase):
CREATE TABLE order_ratings (id UUID PRIMARY KEY, order_id UUID, zone_partner_id UUID, stars INT, tags TEXT[], comment TEXT);

After rating saved: Update zone_partners.average_rating

Ratings drive partner accountability. Below 4.0 triggers warnings.`
      },
      {
        id: 'refund-system',
        title: 'Build refund request system',
        description: 'Customer requests, admin reviews, partner may be charged',
        priority: 'medium',
        estimatedHours: 6,
        taskType: 'cursor',
        aiContext: `CURSOR TASK: Build refund system

CREATE FILES:
1. /src/app/refund/[orderId]/page.tsx - Request form with reason + photos
2. /src/app/admin/refunds/page.tsx - Review queue, approve/reject

SQL (run in Supabase):
CREATE TABLE refund_requests (id UUID PRIMARY KEY, order_id UUID, reason TEXT, status TEXT, who_pays TEXT, amount INT);

WHO PAYS MATRIX:
- Defective product → Jeffy pays
- Wrong item → Partner pays
- Not delivered → Partner pays
- Changed mind → Jeffy pays (80% refund)
- Damaged in delivery → Partner pays`
      },
      {
        id: 'payfast-split',
        title: 'PayFast split payments',
        description: 'Auto-split each payment to partner',
        priority: 'medium',
        estimatedHours: 4,
        taskType: 'cursor',
        aiContext: `CURSOR TASK: Research PayFast Split Payments

RESEARCH: PayFast Split Payments API
Configure in PayFast dashboard: percentage split or fixed amounts
Partner needs PayFast merchant ID linked to their account

DEFER THIS: Manual weekly payouts are fine for first 10 partners.
Build when you have 10+ active partners.`
      }
    ]
  }
];


// ============================================================
// FOUNDER TRACK - Tredoux's Journey to 100 Franchises
// Business milestones from first email to scale
// ============================================================

interface FounderTask {
  id: string;
  title: string;
  description: string;
  milestone: string; // What success looks like
  supportNeeded?: string; // What tech/systems support this
  tips?: string[];
}

interface FounderPhase {
  id: string;
  name: string;
  icon: any;
  color: string;
  target: string; // e.g., "1-3 Partners"
  description: string;
  tasks: FounderTask[];
}

const FOUNDER_PHASES: FounderPhase[] = [
  {
    id: 'foundation',
    name: 'Foundation',
    icon: Shield,
    color: 'blue',
    target: 'Pre-Launch',
    description: 'Get legal, financial, and product foundations in place',
    tasks: [
      {
        id: 'f-bizreg',
        title: 'Complete business registration',
        description: 'CIPC, tax number, bank account. Agents return Jan 11.',
        milestone: 'Can legally accept payments and sign partner agreements',
        tips: ['Follow up with agent weekly', 'Have backup agent contact ready']
      },
      {
        id: 'f-payfast',
        title: 'Apply for PayFast merchant account',
        description: 'Needs business registration. Apply same day you get CIPC.',
        milestone: 'PayFast dashboard active, can process payments',
        supportNeeded: 'Update checkout to use production PayFast keys'
      },
      {
        id: 'f-products',
        title: 'Order first 3 products from China',
        description: 'Steel plates, stainless mugs, magnetic knife holder. Use your China advantage.',
        milestone: '100 units of each product shipped to SA',
        tips: ['Start with products you know sell', 'Factor in 4-6 week shipping']
      },
      {
        id: 'f-zones',
        title: 'Define first 3 zones',
        description: 'Pick areas where you have contacts or high demand potential.',
        milestone: 'Zones created in admin with postal codes assigned',
        supportNeeded: 'Zone admin UI with postal code input',
        tips: ['Start with areas you know', 'Consider friend/family as first partners']
      }
    ]
  },
  {
    id: 'first-partners',
    name: 'First Partners',
    icon: Users,
    color: 'orange',
    target: '1-3 Partners',
    description: 'Recruit and activate your first Zone Partners',
    tasks: [
      {
        id: 'f-mvelo',
        title: 'Get commitment from Mvelo',
        description: 'Your first test partner. Get honest feedback on everything.',
        milestone: 'Mvelo signed, deposit paid, ready for stock',
        tips: ['Be hands-on with first partner', 'Learn what confuses them']
      },
      {
        id: 'f-outreach-day1',
        title: 'Send Day 1 outreach emails',
        description: 'Taddy Blecher, Joe Matimba, Motsepe Foundation. The big asks.',
        milestone: 'Emails sent to top 10 influencers',
        supportNeeded: 'Outreach CRM to track responses',
        tips: ['Personal subject lines', 'Follow up after 5 days if no response']
      },
      {
        id: 'f-firstdelivery',
        title: 'Complete first real delivery',
        description: 'Friends/family order, partner delivers. End-to-end test.',
        milestone: 'Customer received product, rated experience',
        supportNeeded: 'Auto-assign must work, tracking page shows status',
        tips: ['Be available to troubleshoot', 'Document every issue']
      },
      {
        id: 'f-10orders',
        title: 'Process first 10 orders',
        description: 'Soft launch. Find bugs. Get feedback. Iterate.',
        milestone: '10 orders delivered, no major issues',
        tips: ['Call every customer after delivery', 'Fix issues same day']
      }
    ]
  },
  {
    id: 'validation',
    name: 'Validation',
    icon: Target,
    color: 'green',
    target: '3-10 Partners',
    description: 'Prove the model works, start recruiting more partners',
    tasks: [
      {
        id: 'f-3partners',
        title: 'Activate 3 Zone Partners',
        description: 'Each in different zone. Test the system at small scale.',
        milestone: '3 partners active, all completed at least 5 deliveries',
        supportNeeded: 'Partner dashboard shows earnings, stock levels'
      },
      {
        id: 'f-firstpayout',
        title: 'Complete first partner payout',
        description: 'Calculate earnings, send EFT. Make it real for partners.',
        milestone: 'All 3 partners received first payout',
        tips: ['Overpay slightly on first payout - goodwill', 'Send WhatsApp confirmation']
      },
      {
        id: 'f-outreach-wave2',
        title: 'Day 3-5 outreach waves',
        description: 'Follow up on Day 1 emails, send to next batch.',
        milestone: 'At least 2 responses from influencers or media',
        tips: ['Persistence wins', 'Adapt message based on first responses']
      },
      {
        id: 'f-testimonials',
        title: 'Collect first testimonials',
        description: 'Partner video testimonials, customer reviews.',
        milestone: '3 partner videos, 10 customer reviews',
        tips: ['Offer small bonus for video testimonial', 'Use for social proof']
      },
      {
        id: 'f-10partners',
        title: 'Reach 10 Zone Partners',
        description: 'Word of mouth starts. System needs to handle scale.',
        milestone: '10 partners active across multiple cities',
        supportNeeded: 'Auto-assignment critical, manual payout still OK'
      }
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    icon: TrendingUp,
    color: 'purple',
    target: '10-30 Partners',
    description: 'Scale what works, automate what hurts',
    tasks: [
      {
        id: 'f-automate-payouts',
        title: 'Automate partner payouts',
        description: 'Manual payouts don\'t scale past 10 partners.',
        milestone: 'PayFast split or batch EFT working',
        supportNeeded: 'PayFast split payments integration'
      },
      {
        id: 'f-founding30',
        title: 'Fill 30 Founding Partner spots',
        description: 'Special status: 10% profit pool, school priority.',
        milestone: 'All 30 Founding Partner slots filled',
        tips: ['Scarcity drives action', 'Personal outreach to best candidates']
      },
      {
        id: 'f-press',
        title: 'Get media coverage',
        description: 'News24, Business Day, local radio. Story sells itself.',
        milestone: 'At least 1 major media mention',
        tips: ['SA entrepreneur helping SA - angle that works', 'Schools angle is unique']
      },
      {
        id: 'f-25partners',
        title: 'Reach 25 active partners',
        description: 'Approaching tipping point. Operations must be smooth.',
        milestone: '25 partners, <2% refund rate, >4.5 average rating',
        supportNeeded: 'Rating system, refund handling'
      }
    ]
  },
  {
    id: 'scale',
    name: 'Scale',
    icon: Rocket,
    color: 'red',
    target: '30-100 Partners',
    description: 'The system runs itself, you focus on growth',
    tasks: [
      {
        id: 'f-hire',
        title: 'Hire first operations person',
        description: 'You can\'t do this alone at 50+ partners.',
        milestone: 'Part-time ops support handling partner queries',
        tips: ['Start with VA or part-time', 'Document everything first']
      },
      {
        id: 'f-50partners',
        title: 'Reach 50 Zone Partners',
        description: 'National coverage starting. Multiple cities.',
        milestone: '50 partners, R500K+ monthly GMV',
        supportNeeded: 'All automation complete, minimal manual work'
      },
      {
        id: 'f-school-planning',
        title: 'Begin first school planning',
        description: 'The true purpose. Start with family farm site.',
        milestone: 'Land secured, architect engaged',
        tips: ['This is why we\'re building this. Keep the vision alive.']
      },
      {
        id: 'f-100partners',
        title: 'Reach 100 Zone Partners',
        description: '🎉 Major milestone. Sustainable business proven.',
        milestone: '100 partners, R1M+ monthly GMV, profitable',
        tips: ['Celebrate this one', 'You built something real']
      }
    ]
  }
];


// ============================================================
// SOCIAL MEDIA TRACK - Build Brand Presence
// Anonymous founder strategy → The Reveal
// ============================================================

interface SocialTask {
  id: string;
  title: string;
  description: string;
  platform?: string;
  contentTemplate?: string;
  tips?: string[];
}

interface SocialPhase {
  id: string;
  name: string;
  icon: any;
  color: string;
  timeframe: string;
  description: string;
  tasks: SocialTask[];
}

const SOCIAL_PHASES: SocialPhase[] = [
  {
    id: 'setup',
    name: 'Phase 1: Account Setup',
    icon: Users,
    color: 'blue',
    timeframe: 'Week 1',
    description: 'Create all accounts with consistent branding',
    tasks: [
      {
        id: 's-email',
        title: 'Create dedicated email',
        description: 'jeffy.commerce@gmail.com or similar for all accounts',
        tips: ['Use this email for all social signups', 'Set up email forwarding to your main']
      },
      {
        id: 's-linkedin',
        title: 'Create LinkedIn Company Page',
        description: 'Jeffy Commerce - professional presence for B2B outreach',
        platform: 'LinkedIn',
        tips: ['Use Jeffy logo as profile', 'Add company details from CIPC']
      },
      {
        id: 's-twitter',
        title: 'Create Twitter/X account',
        description: '@JeffySA or @JeffyCommerce - quick updates and engagement',
        platform: 'Twitter/X',
        tips: ['Reserve the handle even if not posting yet']
      },
      {
        id: 's-instagram',
        title: 'Create Instagram account',
        description: '@jeffy.sa - visual content, product showcases',
        platform: 'Instagram',
        tips: ['Business account for insights', 'Link to Facebook page']
      },
      {
        id: 's-tiktok',
        title: 'Create TikTok account',
        description: '@jeffy.sa - short-form video, younger audience',
        platform: 'TikTok',
        tips: ['Can repurpose content from Instagram Reels']
      },
      {
        id: 's-facebook',
        title: 'Create Facebook Page',
        description: 'Jeffy Commerce - older demographic, community groups',
        platform: 'Facebook',
        tips: ['Required for Instagram business features']
      },
      {
        id: 's-bio',
        title: 'Set consistent bio across all platforms',
        description: 'Same messaging everywhere for brand recognition',
        contentTemplate: `Jeffy Commerce | South African E-Commerce Revolution
Factory-direct prices. Local entrepreneurs. 50/50 profit sharing.
Zone Partner applications open 🇿🇦
[link to /partner/apply]`
      }
    ]
  },
  {
    id: 'foundation-content',
    name: 'Phase 2: Foundation Content',
    icon: MessageSquare,
    color: 'orange',
    timeframe: 'Week 2',
    description: '10 posts minimum BEFORE any outreach. Look established.',
    tasks: [
      {
        id: 's-post1',
        title: 'Post 1: Launch Announcement',
        description: 'Jeffy is live. Factory-direct. 50/50 profit sharing.',
        contentTemplate: `Jeffy is live. 🇿🇦

Factory-direct products. South African entrepreneurs.
50/50 profit sharing from landed cost.

This isn't dropshipping. This is building something.

Zone Partner applications now open.
#JeffySA #SouthAfricanBusiness`
      },
      {
        id: 's-post2',
        title: 'Post 2: The Problem',
        description: 'Why R50 products cost R350 in SA',
        contentTemplate: `Why does a R50 product from China cost R350 in SA?

→ Importers add 200%+ markup
→ Retailers add another layer
→ You pay for everyone's profit margin

Jeffy cuts the chain. Factory → You.
#EishThesePrices`
      },
      {
        id: 's-post3',
        title: 'Post 3: Zone Partner Explainer',
        description: 'What is a Zone Partner? The core model.',
        contentTemplate: `What's a Zone Partner?

You own your territory.
You handle local delivery.
We handle sourcing, importing, warehousing.
You keep 50% of profit. We keep 50%.

No franchise fees. No inventory risk.
Just hustle and your community.

DM "ZONE" to learn more.`
      },
      {
        id: 's-post4',
        title: 'Post 4: The Vision (Heritage)',
        description: 'Schools story - emotional hook without naming founder',
        contentTemplate: `Our founder's family built schools for farm children decades ago.

Corruption killed those schools.

Jeffy exists to build them again.

Commerce funds education. Profit funds purpose.
This is the long game.`
      },
      {
        id: 's-post5',
        title: 'Post 5: Territory Scarcity',
        description: 'Show zones, create urgency',
        contentTemplate: `First Zone Partner territories:
□ Johannesburg North
□ Cape Town Southern Suburbs
□ Durban Central
□ Pretoria East

Limited to 1 partner per zone.
First movers get first choice.`
      },
      {
        id: 's-post6',
        title: 'Post 6: Price Comparison',
        description: 'Stanley tumbler example - concrete savings',
        contentTemplate: `Stanley tumbler: R850 retail
Jeffy price: R299

Same factory. Same quality.
Different price because different system.

Coming soon to a Zone Partner near you.
#FactoryDirect`
      },
      {
        id: 's-post7',
        title: 'Post 7: Founder Story (Anonymous)',
        description: 'Build mystique without revealing name',
        contentTemplate: `The founder grew up on a farm in South Africa.

1km away, children walked 30km to school.

He's worked on every continent.
Built businesses. Doubled turnovers.
Survived things that would break most people.

Now he's back. Building Jeffy.
You'll meet him when the time is right.`
      },
      {
        id: 's-post8',
        title: 'Post 8: Why South Africa',
        description: 'The belief statement',
        contentTemplate: `"South Africans are the most capable people on the planet."

Our founder believes this to his core.

Jeffy isn't charity. It's opportunity.
For people who are ready to work.
For people who are tired of waiting.

The system failed you. Build your own.`
      },
      {
        id: 's-post9',
        title: 'Post 9: vs Traditional Franchise',
        description: 'Comparison that sells the model',
        contentTemplate: `Traditional franchise: Pay R500K+ upfront
Jeffy Zone Partner: R10K-30K entry

Traditional franchise: 5-8% royalties forever
Jeffy: 50/50 profit split, no royalties

Traditional franchise: Their rules, their brand
Jeffy: Your territory, your relationships, our supply chain`
      },
      {
        id: 's-post10',
        title: 'Post 10: Founding Partner CTA',
        description: 'Direct call to action with scarcity',
        contentTemplate: `We're looking for 10-30 founding Zone Partners.

Not investors. Operators.
People who know their communities.
People who are done waiting for jobs.

Priority placement for founding families.
First school site: founder's family farm.

Link in bio. Applications close when we're full.`
      }
    ]
  },
  {
    id: 'engagement',
    name: 'Phase 3: Engagement & Growth',
    icon: TrendingUp,
    color: 'green',
    timeframe: 'Weeks 3-4',
    description: 'Build following through consistent engagement',
    tasks: [
      {
        id: 's-follow',
        title: 'Follow 50-100 SA business accounts daily',
        description: 'Entrepreneurs, business coaches, SA economy accounts',
        tips: ['Quality over quantity', 'Focus on engaged accounts not just big ones']
      },
      {
        id: 's-comment',
        title: 'Comment meaningfully on SA business content',
        description: 'Not spam - genuine insights and engagement',
        tips: ['First 3 comments get most visibility', 'Add value, don\'t just promote']
      },
      {
        id: 's-share',
        title: 'Share SA economy news with Jeffy perspective',
        description: 'Position Jeffy as thought leader on SA commerce',
        tips: ['Unemployment stats', 'Rand weakness', 'Import costs']
      },
      {
        id: 's-respond',
        title: 'Respond to ALL DMs within 24 hours',
        description: 'Every inquiry is a potential Zone Partner',
        tips: ['Set up templates for common questions', 'Personal touch beats speed']
      },
      {
        id: 's-schedule',
        title: 'Post 3-5x per week minimum',
        description: 'Consistency beats virality. Use Buffer or Later.',
        tips: ['40% educational, 30% vision, 20% product, 10% engagement']
      }
    ]
  },
  {
    id: 'legend',
    name: 'Phase 4: Build The Legend',
    icon: Star,
    color: 'purple',
    timeframe: 'Weeks 5-12',
    description: 'Heritage content series - founder mystique without naming',
    tasks: [
      {
        id: 's-bloodline',
        title: 'Post: The Bloodline',
        description: '335 years in SA, three European bloodlines',
        contentTemplate: `Our founder descends from three European bloodlines that arrived in South Africa over 335 years ago.

Dutch. German. Flemish.

His family name means "very gentle" in Old French.
But gentle men still build empires.

The schools he's building aren't new.
His family built schools for farm children generations ago.
This is unfinished business.`
      },
      {
        id: 's-training',
        title: 'Post: The Training Ground',
        description: 'Head Chorister story - leadership from young age',
        contentTemplate: `At 17, our founder was Head Chorister at one of the world's elite music schools.

The teachers had to ask HIS permission to schedule extra concerts.
The boys followed him, not the administration.

Now he teaches kindergarten in China.
And builds Jeffy at night.

Underestimate him at your own risk.`
      },
      {
        id: 's-purpose',
        title: 'Post: The True Purpose',
        description: 'The full vision - schools, land, self-sufficiency',
        contentTemplate: `Jeffy isn't the end goal.

The end goal:
→ Free schools, merit-only selection
→ Graduates receive 1 hectare of land
→ Self-built houses
→ Production facilities
→ Skills to manufacture food, tech, medicine, clothes

Self-sufficient communities.
Commerce funding education.
Profit funding purpose.

The founder's family once owned land worth R300M.
The first school will be built there.

This is generational thinking.`
      },
      {
        id: 's-influencer-dm',
        title: 'Warm DM outreach to influencers',
        description: 'Taddy Blecher, Joe Matimba, Terra-Khaya, Motsepe',
        tips: ['Reference specific work they\'ve done', 'Ask for call or share, not money']
      }
    ]
  },
  {
    id: 'reveal',
    name: 'Phase 5: The Reveal',
    icon: Rocket,
    color: 'red',
    timeframe: 'After Milestones',
    description: 'Only after: 100+ partners OR media coverage OR school funding',
    tasks: [
      {
        id: 's-trigger',
        title: 'Hit reveal trigger',
        description: '100+ Zone Partners signed, OR media coverage, OR school milestone',
        tips: ['Don\'t rush this', 'Anonymous builds curiosity']
      },
      {
        id: 's-reveal-post',
        title: 'The Reveal Post',
        description: 'Full founder introduction across all platforms',
        contentTemplate: `My name is Tredoux Willemse.

I built Jeffy.

I'm a kindergarten teacher in China.
I come from a founding family of South Africa.
My ancestors arrived in 1690.
My family built schools that corruption destroyed.

I've worked on every continent.
Doubled business turnovers.
Survived things I won't talk about.

I'm not doing this for money.
I'm doing this because South Africans are the most capable people on the planet.
And they deserve systems that work for them.

Jeffy is just the beginning.

- Tredoux
Founder, Jeffy Commerce`
      },
      {
        id: 's-update-bios',
        title: 'Update all bios with founder name',
        description: 'Founded by Tredoux Willemse across all platforms',
        tips: ['LinkedIn personal profile refresh', 'Media kit ready for interviews']
      }
    ]
  }
];


// ============================================================
// REACT COMPONENT
// ============================================================

export default function RoadmapPage() {
  const [techCompleted, setTechCompleted] = useState<string[]>([]);
  const [techInProgress, setTechInProgress] = useState<string[]>([]);
  const [founderCompleted, setFounderCompleted] = useState<string[]>([]);
  const [founderInProgress, setFounderInProgress] = useState<string[]>([]);
  const [socialCompleted, setSocialCompleted] = useState<string[]>([]);
  const [socialInProgress, setSocialInProgress] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'tech' | 'founder' | 'social'>('tech');
  const [expandedContext, setExpandedContext] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const savedTech = localStorage.getItem('jeffy-roadmap-tech-completed');
    const savedTechProgress = localStorage.getItem('jeffy-roadmap-tech-progress');
    const savedFounder = localStorage.getItem('jeffy-roadmap-founder-completed');
    const savedFounderProgress = localStorage.getItem('jeffy-roadmap-founder-progress');
    const savedSocial = localStorage.getItem('jeffy-roadmap-social-completed');
    const savedSocialProgress = localStorage.getItem('jeffy-roadmap-social-progress');
    
    if (savedTech) setTechCompleted(JSON.parse(savedTech));
    if (savedTechProgress) setTechInProgress(JSON.parse(savedTechProgress));
    if (savedFounder) setFounderCompleted(JSON.parse(savedFounder));
    if (savedFounderProgress) setFounderInProgress(JSON.parse(savedFounderProgress));
    if (savedSocial) setSocialCompleted(JSON.parse(savedSocial));
    if (savedSocialProgress) setSocialInProgress(JSON.parse(savedSocialProgress));
  }, []);

  const toggleTechComplete = (taskId: string) => {
    const newCompleted = techCompleted.includes(taskId)
      ? techCompleted.filter(id => id !== taskId)
      : [...techCompleted, taskId];
    setTechCompleted(newCompleted);
    localStorage.setItem('jeffy-roadmap-tech-completed', JSON.stringify(newCompleted));
    if (techInProgress.includes(taskId)) {
      const newProgress = techInProgress.filter(id => id !== taskId);
      setTechInProgress(newProgress);
      localStorage.setItem('jeffy-roadmap-tech-progress', JSON.stringify(newProgress));
    }
  };

  const toggleTechProgress = (taskId: string) => {
    const newProgress = techInProgress.includes(taskId)
      ? techInProgress.filter(id => id !== taskId)
      : [...techInProgress, taskId];
    setTechInProgress(newProgress);
    localStorage.setItem('jeffy-roadmap-tech-progress', JSON.stringify(newProgress));
  };

  const toggleFounderComplete = (taskId: string) => {
    const newCompleted = founderCompleted.includes(taskId)
      ? founderCompleted.filter(id => id !== taskId)
      : [...founderCompleted, taskId];
    setFounderCompleted(newCompleted);
    localStorage.setItem('jeffy-roadmap-founder-completed', JSON.stringify(newCompleted));
    if (founderInProgress.includes(taskId)) {
      const newProgress = founderInProgress.filter(id => id !== taskId);
      setFounderInProgress(newProgress);
      localStorage.setItem('jeffy-roadmap-founder-progress', JSON.stringify(newProgress));
    }
  };

  const toggleFounderProgress = (taskId: string) => {
    const newProgress = founderInProgress.includes(taskId)
      ? founderInProgress.filter(id => id !== taskId)
      : [...founderInProgress, taskId];
    setFounderInProgress(newProgress);
    localStorage.setItem('jeffy-roadmap-founder-progress', JSON.stringify(newProgress));
  };

  const toggleSocialComplete = (taskId: string) => {
    const newCompleted = socialCompleted.includes(taskId)
      ? socialCompleted.filter(id => id !== taskId)
      : [...socialCompleted, taskId];
    setSocialCompleted(newCompleted);
    localStorage.setItem('jeffy-roadmap-social-completed', JSON.stringify(newCompleted));
    if (socialInProgress.includes(taskId)) {
      const newProgress = socialInProgress.filter(id => id !== taskId);
      setSocialInProgress(newProgress);
      localStorage.setItem('jeffy-roadmap-social-progress', JSON.stringify(newProgress));
    }
  };

  const toggleSocialProgress = (taskId: string) => {
    const newProgress = socialInProgress.includes(taskId)
      ? socialInProgress.filter(id => id !== taskId)
      : [...socialInProgress, taskId];
    setSocialInProgress(newProgress);
    localStorage.setItem('jeffy-roadmap-social-progress', JSON.stringify(newProgress));
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalTechTasks = TECH_PHASES.reduce((sum, p) => sum + p.tasks.length, 0);
  const totalTechDone = techCompleted.length;
  const totalTechHours = TECH_PHASES.reduce((sum, p) => 
    sum + p.tasks.filter(t => !techCompleted.includes(t.id)).reduce((h, t) => h + t.estimatedHours, 0), 0);

  const totalFounderTasks = FOUNDER_PHASES.reduce((sum, p) => sum + p.tasks.length, 0);
  const totalFounderDone = founderCompleted.length;

  const totalSocialTasks = SOCIAL_PHASES.reduce((sum, p) => sum + p.tasks.length, 0);
  const totalSocialDone = socialCompleted.length;

  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
          </Link>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Rocket className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-bold">Jeffy Launch Roadmap</h1>
              <p className="text-white/80">Technical build + Founder journey to 100 franchises</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-white/70 text-sm">Tech</p>
              <p className="text-2xl font-bold">{totalTechDone}/{totalTechTasks}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-white/70 text-sm">Hours Left</p>
              <p className="text-2xl font-bold">~{totalTechHours}h</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-white/70 text-sm">Founder</p>
              <p className="text-2xl font-bold">{totalFounderDone}/{totalFounderTasks}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-white/70 text-sm">Social</p>
              <p className="text-2xl font-bold">{totalSocialDone}/{totalSocialTasks}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-white/70 text-sm">Target</p>
              <p className="text-2xl font-bold">100 Partners</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('tech')}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
              activeTab === 'tech' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            <Code className="h-5 w-5" />
            Technical Build
          </button>
          <button
            onClick={() => setActiveTab('founder')}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
              activeTab === 'founder' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            <Briefcase className="h-5 w-5" />
            Founder Journey
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
              activeTab === 'social' 
                ? 'bg-pink-600 text-white' 
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            Social Media
          </button>
        </div>


        {/* TECHNICAL TRACK */}
        {activeTab === 'tech' && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                <Code className="h-5 w-5" /> Two Workflows
              </h3>
              <div className="mt-2 grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-purple-100 rounded-lg p-3">
                  <p className="font-semibold text-purple-800">🗄️ SQL Tasks → Supabase</p>
                  <p className="text-purple-700">Copy SQL and paste into Supabase SQL Editor. Run manually.</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <p className="font-semibold text-green-800">💻 Code Tasks → Cursor</p>
                  <p className="text-green-700">Copy instructions and give to Cursor AI. It builds the code.</p>
                </div>
              </div>
            </div>

            {TECH_PHASES.map((phase) => {
              const done = phase.tasks.filter(t => techCompleted.includes(t.id)).length;
              const percent = Math.round((done / phase.tasks.length) * 100);
              
              return (
                <div key={phase.id} className="mb-8">
                  <div className={`bg-gradient-to-r ${colorClasses[phase.color]} rounded-t-xl p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <phase.icon className="h-6 w-6" />
                        <div>
                          <h2 className="text-xl font-bold">{phase.name}</h2>
                          <p className="text-white/80 text-sm">{phase.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{percent}%</p>
                        <p className="text-sm text-white/80">{done}/{phase.tasks.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-b-xl border border-t-0 divide-y">
                    {phase.tasks.map((task) => {
                      const isDone = techCompleted.includes(task.id);
                      const isInProgress = techInProgress.includes(task.id);
                      const isExpanded = expandedContext === task.id;
                      const priorityColor: Record<string, string> = { 
                        critical: 'bg-red-500', 
                        high: 'bg-orange-500', 
                        medium: 'bg-blue-500' 
                      };
                      
                      return (
                        <div key={task.id} className={`${isDone ? 'bg-green-50' : isInProgress ? 'bg-yellow-50' : ''}`}>
                          <div className="p-4 flex items-start gap-4">
                            <button onClick={() => toggleTechComplete(task.id)} className="mt-1 flex-shrink-0">
                              {isDone ? <CheckCircle className="h-6 w-6 text-green-600" /> : <Circle className="h-6 w-6 text-gray-300 hover:text-gray-400" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`w-2 h-2 rounded-full ${priorityColor[task.priority]}`}></span>
                                <h3 className={`font-medium ${isDone ? 'line-through text-gray-400' : ''}`}>{task.title}</h3>
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">~{task.estimatedHours}h</span>
                                {task.sqlRequired && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">SQL</span>}
                              </div>
                              <p className={`text-sm mt-1 ${isDone ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
                              {task.codeLocation && (
                                <p className="text-xs text-blue-600 mt-1 font-mono">{task.codeLocation}</p>
                              )}
                              {task.dependencies && task.dependencies.length > 0 && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Depends on: {task.dependencies.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!isDone && (
                                <button 
                                  onClick={() => toggleTechProgress(task.id)} 
                                  className={`text-xs px-3 py-1 rounded-full ${
                                    isInProgress ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {isInProgress ? '⏳ In Progress' : 'Start'}
                                </button>
                              )}
                              <button
                                onClick={() => setExpandedContext(isExpanded ? null : task.id)}
                                className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${
                                  task.sqlRequired 
                                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                {task.sqlRequired ? '🗄️ Supabase' : '💻 Cursor'}
                              </button>
                            </div>
                          </div>
                          
                          {/* Expanded AI Context */}
                          {isExpanded && (
                            <div className="px-4 pb-4 ml-10">
                              <div className={`rounded-xl p-4 text-white ${task.sqlRequired ? 'bg-purple-900' : 'bg-slate-800'}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`text-sm font-semibold ${task.sqlRequired ? 'text-purple-300' : 'text-green-300'}`}>
                                    {task.sqlRequired ? '🗄️ PASTE INTO SUPABASE SQL EDITOR' : '💻 GIVE TO CURSOR AI'}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(task.aiContext, task.id)}
                                    className="text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-1 font-medium"
                                  >
                                    {copiedId === task.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    {copiedId === task.id ? 'Copied!' : 'Copy'}
                                  </button>
                                </div>
                                <pre className="text-sm text-slate-200 whitespace-pre-wrap font-mono overflow-x-auto bg-black/20 p-3 rounded-lg">
                                  {task.aiContext}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}


        {/* FOUNDER TRACK */}
        {activeTab === 'founder' && (
          <div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                <Briefcase className="h-5 w-5" /> Your Journey to 100 Franchises
              </h3>
              <p className="text-sm text-purple-700 mt-1">
                From first email to sustainable business. Each milestone brings you closer to funding the schools.
              </p>
            </div>

            {FOUNDER_PHASES.map((phase) => {
              const done = phase.tasks.filter(t => founderCompleted.includes(t.id)).length;
              const percent = Math.round((done / phase.tasks.length) * 100);
              
              return (
                <div key={phase.id} className="mb-8">
                  <div className={`bg-gradient-to-r ${colorClasses[phase.color]} rounded-t-xl p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <phase.icon className="h-6 w-6" />
                        <div>
                          <h2 className="text-xl font-bold">{phase.name}</h2>
                          <p className="text-white/80 text-sm">{phase.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{phase.target}</p>
                        <p className="text-sm text-white/80">{done}/{phase.tasks.length} done</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-b-xl border border-t-0 divide-y">
                    {phase.tasks.map((task) => {
                      const isDone = founderCompleted.includes(task.id);
                      const isInProgress = founderInProgress.includes(task.id);
                      const isExpanded = expandedContext === task.id;
                      
                      return (
                        <div key={task.id} className={`${isDone ? 'bg-green-50' : isInProgress ? 'bg-yellow-50' : ''}`}>
                          <div className="p-4 flex items-start gap-4">
                            <button onClick={() => toggleFounderComplete(task.id)} className="mt-1 flex-shrink-0">
                              {isDone ? <CheckCircle className="h-6 w-6 text-green-600" /> : <Circle className="h-6 w-6 text-gray-300 hover:text-gray-400" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-medium ${isDone ? 'line-through text-gray-400' : ''}`}>{task.title}</h3>
                              <p className={`text-sm mt-1 ${isDone ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  ✓ {task.milestone}
                                </span>
                              </div>
                              {task.supportNeeded && (
                                <p className="text-xs text-blue-600 mt-2">
                                  🔧 Tech needed: {task.supportNeeded}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!isDone && (
                                <button 
                                  onClick={() => toggleFounderProgress(task.id)} 
                                  className={`text-xs px-3 py-1 rounded-full ${
                                    isInProgress ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {isInProgress ? '⏳ In Progress' : 'Start'}
                                </button>
                              )}
                              {task.tips && task.tips.length > 0 && (
                                <button
                                  onClick={() => setExpandedContext(isExpanded ? null : task.id)}
                                  className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 flex items-center gap-1"
                                >
                                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  Tips
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Expanded Tips */}
                          {isExpanded && task.tips && (
                            <div className="px-4 pb-4 ml-10">
                              <div className="bg-purple-50 rounded-xl p-4">
                                <p className="text-xs text-purple-600 font-semibold mb-2">💡 Tips</p>
                                <ul className="text-sm text-purple-800 space-y-1">
                                  {task.tips.map((tip, i) => (
                                    <li key={i}>• {tip}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SOCIAL MEDIA TRACK */}
        {activeTab === 'social' && (
          <div>
            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-pink-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Anonymous Founder Strategy
              </h3>
              <p className="text-sm text-pink-700 mt-1">
                Build brand credibility first. Reveal founder identity after hitting milestones.
                Full playbook saved at: <code className="bg-pink-100 px-1 rounded">docs/SOCIAL_MEDIA_PLAYBOOK.md</code>
              </p>
            </div>

            {SOCIAL_PHASES.map((phase) => {
              const done = phase.tasks.filter(t => socialCompleted.includes(t.id)).length;
              const percent = Math.round((done / phase.tasks.length) * 100);
              
              return (
                <div key={phase.id} className="mb-8">
                  <div className={`bg-gradient-to-r ${colorClasses[phase.color]} rounded-t-xl p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <phase.icon className="h-6 w-6" />
                        <div>
                          <h2 className="text-xl font-bold">{phase.name}</h2>
                          <p className="text-white/80 text-sm">{phase.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{phase.timeframe}</p>
                        <p className="text-sm text-white/80">{done}/{phase.tasks.length} done</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-b-xl border border-t-0 divide-y">
                    {phase.tasks.map((task) => {
                      const isDone = socialCompleted.includes(task.id);
                      const isInProgress = socialInProgress.includes(task.id);
                      const isExpanded = expandedContext === task.id;
                      const hasContent = task.contentTemplate || (task.tips && task.tips.length > 0);
                      
                      return (
                        <div key={task.id} className={`${isDone ? 'bg-green-50' : isInProgress ? 'bg-yellow-50' : ''}`}>
                          <div className="p-4 flex items-start gap-4">
                            <button onClick={() => toggleSocialComplete(task.id)} className="mt-1 flex-shrink-0">
                              {isDone ? <CheckCircle className="h-6 w-6 text-green-600" /> : <Circle className="h-6 w-6 text-gray-300 hover:text-gray-400" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`font-medium ${isDone ? 'line-through text-gray-400' : ''}`}>{task.title}</h3>
                                {task.platform && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{task.platform}</span>
                                )}
                              </div>
                              <p className={`text-sm mt-1 ${isDone ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!isDone && (
                                <button 
                                  onClick={() => toggleSocialProgress(task.id)} 
                                  className={`text-xs px-3 py-1 rounded-full ${
                                    isInProgress ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {isInProgress ? '⏳ In Progress' : 'Start'}
                                </button>
                              )}
                              {hasContent && (
                                <button
                                  onClick={() => setExpandedContext(isExpanded ? null : task.id)}
                                  className="text-xs px-3 py-1 bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 flex items-center gap-1"
                                >
                                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  {task.contentTemplate ? 'Content' : 'Tips'}
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Expanded Content Template */}
                          {isExpanded && task.contentTemplate && (
                            <div className="px-4 pb-4 ml-10">
                              <div className="bg-slate-800 rounded-xl p-4 text-white">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-slate-400">Copy-paste content</span>
                                  <button
                                    onClick={() => copyToClipboard(task.contentTemplate!, task.id)}
                                    className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded flex items-center gap-1"
                                  >
                                    {copiedId === task.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    {copiedId === task.id ? 'Copied!' : 'Copy'}
                                  </button>
                                </div>
                                <pre className="text-sm text-slate-200 whitespace-pre-wrap font-mono">
                                  {task.contentTemplate}
                                </pre>
                              </div>
                            </div>
                          )}
                          
                          {/* Expanded Tips */}
                          {isExpanded && task.tips && !task.contentTemplate && (
                            <div className="px-4 pb-4 ml-10">
                              <div className="bg-pink-50 rounded-xl p-4">
                                <p className="text-xs text-pink-600 font-semibold mb-2">💡 Tips</p>
                                <ul className="text-sm text-pink-800 space-y-1">
                                  {task.tips.map((tip, i) => (
                                    <li key={i}>• {tip}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Reference */}
        <div className="bg-slate-800 text-white rounded-xl p-6 mt-8">
          <h3 className="font-bold text-lg mb-4">🎯 What This Roadmap Contains</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">Technical Track</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• 14 tasks with AI instructions</li>
                <li>• Copy-paste for Claude sessions</li>
                <li>• SQL, APIs, UI updates</li>
                <li>• Dependencies mapped</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">Founder Track</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• 18 milestones to 100 partners</li>
                <li>• Clear success criteria</li>
                <li>• Tech dependencies noted</li>
                <li>• Tips from research</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-pink-400 mb-2">Social Media Track</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• 30 tasks across 5 phases</li>
                <li>• Copy-paste post content</li>
                <li>• Anonymous → Reveal strategy</li>
                <li>• Heritage content series</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Motivation */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>"Plant trees under whose shade you will never sit."</p>
          <p className="mt-1">Every partner gets you closer to the schools. Keep building. 🌱</p>
        </div>
      </div>
    </div>
  );
}
