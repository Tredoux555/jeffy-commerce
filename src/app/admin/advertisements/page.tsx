'use client';

import { useState } from 'react';
import { 
  Radio, MessageSquare, Instagram, Facebook, Youtube, Copy, Check, Megaphone,
  Target, Users, TrendingUp, DollarSign, Calendar, CheckCircle, ArrowRight,
  Smartphone, Share2, Gift, MapPin, FileText, Zap
} from 'lucide-react';

type TabType = 'strategy' | 'zone-partners' | 'wants' | 'ads' | 'research';

// ============ STRATEGY DATA ============

const PHASE_1_TASKS = [
  { task: 'Set up WhatsApp Business with Jeffy branding', cost: 'R0', time: '1 hour', done: false },
  { task: 'Send personal messages to 30 contacts', cost: 'R0', time: '2 hours', done: false },
  { task: 'Post WhatsApp Status daily for 7 days', cost: 'R0', time: '10 min/day', done: false },
  { task: 'Create 3 TikTok videos showing products', cost: 'R0', time: '3 hours', done: false },
  { task: 'Join 5 Facebook groups (SA entrepreneurs, stokvels)', cost: 'R0', time: '1 hour', done: false },
  { task: 'Set up referral tracking (R50 airtime per signup)', cost: 'R500', time: '1 hour', done: false },
];

const PHASE_2_TASKS = [
  { task: 'Print 5,000 A6 flyers', cost: 'R1,200', time: '3 days', done: false },
  { task: 'Distribute at 3 taxi ranks (Bara, MTN Noord, Bree)', cost: 'R300', time: '1 day', done: false },
  { task: 'Partner with 5 spaza shops for flyer display', cost: 'R0', time: '1 day', done: false },
  { task: 'Run Facebook ads - Zone Partner (R100/day x 7)', cost: 'R700', time: '7 days', done: false },
  { task: 'Run Facebook ads - Wants viral (R100/day x 7)', cost: 'R700', time: '7 days', done: false },
  { task: 'Contact 10 nano-influencers for trade deals', cost: 'R0-500', time: '1 week', done: false },
];

const PHASE_3_TASKS = [
  { task: 'Book Jozi FM campaign (10 spots)', cost: 'R6,000', time: '2 weeks', done: false },
  { task: 'Create radio ad with local voiceover', cost: 'R1,500', time: '3 days', done: false },
  { task: 'Partner with 1 micro-influencer (10K+ followers)', cost: 'R2,500', time: '1 week', done: false },
  { task: 'Commission wall mural in Soweto', cost: 'R5,000', time: '1 week', done: false },
  { task: 'Launch stokvel partnership program', cost: 'R1,000', time: 'Ongoing', done: false },
  { task: 'Hire part-time community ambassador', cost: 'R3,000/mo', time: 'Ongoing', done: false },
];

// ============ ADVERTISEMENTS DATA ============

const ADVERTISEMENTS = [
  {
    id: 'radio-30s-kasi',
    type: 'radio' as const,
    title: 'Radio Ad - 30s Kasi Energy',
    duration: '30 seconds',
    targetAudience: 'Township hustlers, community radio listeners',
    content: `[Upbeat kwaito/amapiano beat - 3 seconds]

Yoh, you looking for a side hustle that actually pays?

Jeffy's here. We bring products straight from China - you sell them in your area, keep ALL the profit.

Start with just 500 rand. We give you 2,500 worth of stock. 

Buy for 100, sell for 200 - that's 100 in YOUR pocket, every sale.

No boss. No CV. Just you, your community, and real money.

WhatsApp "JEFFY" to 0-7-1-2-3-4-5-6-7-8.

Jeffy - eish, these prices!

[Beat out]`,
    notes: 'Best for community radio stations. Update phone number before use.'
  },
  {
    id: 'radio-wants',
    type: 'radio' as const,
    title: 'Radio Ad - Wants System (Free Products)',
    duration: '30 seconds',
    targetAudience: 'Young SA consumers, social media users',
    content: `[Trendy beat - 3 seconds]

Want something for FREE? Like, actually free?

Jeffy Wants is here. Pick a product. Share with 10 friends. When they vote - you get it FREE!

Phones, gadgets, fashion, beauty - whatever you want.

No catch. No credit card. Just share and receive.

Your friends want free stuff too, right?

Download now at jeffy.co.za slash wants.

Jeffy Wants - share it, get it, love it!

[Beat out]`,
    notes: 'Target youth radio, university stations, and urban FM.'
  },
  {
    id: 'whatsapp-personal',
    type: 'whatsapp' as const,
    title: 'WhatsApp - Personal Message (Zone Partner)',
    targetAudience: 'Friends & family in SA',
    content: `Hey! Quick one - I've been building something from China that I think could actually help people back home.

It's called Jeffy - basically I source products direct from Chinese factories and people in SA can sell them in their communities. Start for R500, get R2,500 worth of stock.

I'm looking for the first few people to try it. Know anyone hustling who might be keen? Or if you want to take a look yourself: jeffy.co.za/zone-partner

No pressure at all - just wanted you to see what I've been working on 🙏`,
    notes: 'Send to 20-30 close contacts. Personal touch matters.'
  },
  {
    id: 'whatsapp-wants',
    type: 'whatsapp' as const,
    title: 'WhatsApp - Wants Viral Message',
    targetAudience: 'Anyone who likes free stuff',
    content: `Bro I just found the craziest thing 😂

There's this site where you pick a product you want, share it with 10 people, and if they vote for you - YOU GET IT FREE

Like actually free. No catch.

I'm trying to get this speaker: jeffy.co.za/wants/xyz

Can you vote for me real quick? Takes 2 seconds 🙏

Then you can start your own want and I'll vote for yours!`,
    notes: 'This is the viral loop. Each person who votes sees the system and wants to try it.'
  },
  {
    id: 'whatsapp-entrepreneur',
    type: 'whatsapp' as const,
    title: 'WhatsApp - Entrepreneur Pitch',
    targetAudience: 'People actively looking for income',
    content: `Yo, got something for you.

I'm sourcing products from China - same factories that supply Amazon/Takealot. Built a platform where you can sell this stuff in your area.

R500 gets you R2,500 stock. You set your own prices, keep all profit above wholesale. Example: Buy for R100, sell for R199 = R99 in your pocket.

First 5 people get my direct WhatsApp for sourcing requests.

jeffy.co.za/zone-partner

Interested?`,
    notes: 'Good for entrepreneurial contacts who are already hustling.'
  },
  {
    id: 'tiktok-wants',
    type: 'social' as const,
    title: 'TikTok Script - Wants Explainer',
    targetAudience: 'Gen Z, young millennials',
    content: `[Hook - first 3 seconds]
"I'm about to show you how to get literally anything for free"

[Body]
"So there's this app called Jeffy Wants.

You pick ANY product you want - phone, sneakers, makeup, whatever.

Share it with 10 friends. They vote for you.

When you hit 10 votes... you get it. For FREE.

Your friends can do the same thing and you vote for them.

It's basically a group buying hack from China.

Link in bio - go get your free stuff"

[CTA]
"Comment what you'd want for free 👇"`,
    notes: 'Keep it under 60 seconds. Use trending sounds. Show actual products.'
  },
  {
    id: 'facebook-zone',
    type: 'social' as const,
    title: 'Facebook Post - Zone Partner Recruitment',
    targetAudience: 'SA entrepreneurs, township residents',
    content: `Who wants to start a business with R500?

Looking for go-getters in:
🏘️ Soweto
🏘️ Alexandra  
🏘️ Khayelitsha
🏘️ Umlazi
🏘️ Tembisa
🏘️ Any township in SA!

You get:
✅ R2,500 stock
✅ 7 days to sell
✅ Exclusive zone
✅ WhatsApp support

Your profit = whatever you charge above wholesale.

Link in bio or DM me "ZONE" 👇

#SideHustle #SmallBusiness #Township #SouthAfrica #Entrepreneur`,
    notes: 'Good for personal Facebook. Add local township names for your network.'
  },
  {
    id: 'instagram-wants',
    type: 'social' as const,
    title: 'Instagram Reel Script - Wants',
    targetAudience: 'Young urban SA, social media natives',
    content: `[Visual: Unboxing a product]

"This cost me R0"

[Cut to phone screen]

"I used Jeffy Wants. You pick what you want..."

[Show product selection]

"Share with 10 friends..."

[Show sharing]

"They vote..."

[Show votes coming in]

"And it shows up at your door. Free."

[Back to unboxing]

"Link in bio. You're welcome."

[Show product in use]`,
    notes: 'Film vertically. Use trending audio. Make it look organic, not ad-like.'
  }
];

// ============ RESEARCH CONTENT ============

const RESEARCH_CONTENT = `
## Community Radio Stations & Rates

| Township | Station | Weekly Reach | Cost per 30s | Contact |
|----------|---------|--------------|--------------|---------|
| Soweto | Jozi FM 105.8 | 416,000+ | R600-R1,500 | prudence@unitedstations.co.za |
| Alexandra | Alex FM 89.1 | 150,000+ | R400-R800 | alexfm.org |
| Khayelitsha | Zibonele FM 98.2 | 182,000 daily | R500-R1,000 | info@zibonelefm.co.za |
| Umlazi | Intokozo FM 101.2 | Youth-focused | R400-R700 | Via social media |
| Tembisa | Voice of Tembisa 87.6 | Local community | R300-R600 | 011 025 1036 |

**Booking:** Contact LeoFiveMedia (+27 10 238 0837) or PlaceMyAd (placemyad.co.za)
**Lead time:** 1-2 weeks, rush possible in 24-48 hours
**Production:** R1,000-R3,000 for jingle creation

---

## WhatsApp Marketing Stats

- **28+ million** active SA users
- **98%** message open rate (vs 21% for email)
- **25** average daily opens per user
- **256** max contacts per broadcast list

**Data bundles for your audience:**
- MTN: 500MB WhatsApp for R2/day or 1.2GB for R37/month
- Vodacom: Similar packages available
- Keep images under 100KB, videos under 5MB

---

## Facebook/Instagram Ad Costs

| Metric | Cost (ZAR) |
|--------|------------|
| Cost per click (CPC) | R3-R30 (avg R8-R15) |
| Cost per 1,000 impressions | R30-R350 |
| Minimum daily budget | R15.38 |
| Recommended test budget | R100-R200/day |

**R200/day typically reaches 6,800-20,000 people**

---

## Influencer Rates

| Tier | Followers | Static Post | Reel/Video |
|------|-----------|-------------|------------|
| Nano | 1K-10K | R2,693 | ~R4,500 |
| Micro | 10K-50K | R4,354 | R7,335 |

**75% of influencers accept product trades**
**SA influencers: 3.39% engagement (global avg: 1.49%)**

---

## Street Marketing Costs

| Item | Cost |
|------|------|
| 5,000 A6 flyers | R799-R1,450 |
| Taxi rank distribution (per 1,000) | R100 |
| Door-to-door (per 1,000) | R389 |
| SA Post Office "Knock and Drop" (per 1,000) | R100 |
| Spaza shop branding | R80/day |
| Wall mural | R5,000-R8,000 |

---

## Key Stats

- **R900 billion** township economy annually
- **70%** of township residents shop online
- **18 million** daily taxi commuters
- **60,000+** spaza shops nationwide
- **11.5 million** stokvel members (R44-50 billion annually)
- **28%** of purchases influenced by word-of-mouth
`;

// ============ COMPONENT ============

export default function AdvertisementsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('strategy');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [phase1Tasks, setPhase1Tasks] = useState(PHASE_1_TASKS);
  const [phase2Tasks, setPhase2Tasks] = useState(PHASE_2_TASKS);
  const [phase3Tasks, setPhase3Tasks] = useState(PHASE_3_TASKS);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleTask = (phase: number, index: number) => {
    if (phase === 1) {
      const updated = [...phase1Tasks];
      updated[index].done = !updated[index].done;
      setPhase1Tasks(updated);
    } else if (phase === 2) {
      const updated = [...phase2Tasks];
      updated[index].done = !updated[index].done;
      setPhase2Tasks(updated);
    } else {
      const updated = [...phase3Tasks];
      updated[index].done = !updated[index].done;
      setPhase3Tasks(updated);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'radio': return <Radio className="h-5 w-5" />;
      case 'whatsapp': return <MessageSquare className="h-5 w-5" />;
      case 'social': return <Instagram className="h-5 w-5" />;
      default: return <Megaphone className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'radio': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'whatsapp': return 'bg-green-100 text-green-700 border-green-200';
      case 'social': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Megaphone className="h-7 w-7 text-jeffy-orange" />
          Marketing Command Center
        </h1>
        <p className="text-gray-600 mt-1">
          Complete strategy, advertisements, and research for Jeffy growth
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap border-b pb-4">
        <button
          onClick={() => setActiveTab('strategy')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'strategy' 
              ? 'bg-jeffy-orange text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Target className="h-4 w-4" /> Strategy & Tasks
        </button>
        <button
          onClick={() => setActiveTab('zone-partners')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'zone-partners' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          <MapPin className="h-4 w-4" /> Zone Partners
        </button>
        <button
          onClick={() => setActiveTab('wants')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'wants' 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          <Gift className="h-4 w-4" /> Wants System
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'ads' 
              ? 'bg-green-600 text-white' 
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          <FileText className="h-4 w-4" /> Ad Copy
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'research' 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <TrendingUp className="h-4 w-4" /> Research & Data
        </button>
      </div>

      {/* ============ STRATEGY TAB ============ */}
      {activeTab === 'strategy' && (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-8 w-8" />
                <div>
                  <h3 className="font-bold text-lg">Zone Partners</h3>
                  <p className="text-blue-100 text-sm">Township reseller network</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li>✓ Physical presence in communities</li>
                <li>✓ Trust-based, word-of-mouth</li>
                <li>✓ Radio, flyers, spaza shops</li>
                <li>✓ R500 entry → R2,500 stock</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="h-8 w-8" />
                <div>
                  <h3 className="font-bold text-lg">Wants System</h3>
                  <p className="text-purple-100 text-sm">Viral sharing for free products</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li>✓ Digital-first, social native</li>
                <li>✓ Viral loop - share to unlock</li>
                <li>✓ TikTok, Instagram, influencers</li>
                <li>✓ Free products drive signups</li>
              </ul>
            </div>
          </div>

          {/* Phase 1: Free */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="font-bold text-gray-900">Phase 1: Free Hustle</h3>
                  <p className="text-sm text-gray-600">Budget: R0-R500 | Timeline: Week 1</p>
                </div>
              </div>
              <span className="text-sm text-green-700 font-medium">
                {phase1Tasks.filter(t => t.done).length}/{phase1Tasks.length} done
              </span>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {phase1Tasks.map((task, i) => (
                  <div 
                    key={i}
                    onClick={() => toggleTask(1, i)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      task.done ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}>
                      {task.done && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`flex-1 ${task.done ? 'line-through text-gray-400' : ''}`}>{task.task}</span>
                    <span className="text-sm text-gray-500">{task.cost}</span>
                    <span className="text-sm text-gray-400">{task.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phase 2: Low Budget */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="font-bold text-gray-900">Phase 2: Paid Push</h3>
                  <p className="text-sm text-gray-600">Budget: R2,000-R3,000 | Timeline: Week 2-3</p>
                </div>
              </div>
              <span className="text-sm text-blue-700 font-medium">
                {phase2Tasks.filter(t => t.done).length}/{phase2Tasks.length} done
              </span>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {phase2Tasks.map((task, i) => (
                  <div 
                    key={i}
                    onClick={() => toggleTask(2, i)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      task.done ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.done ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                      {task.done && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`flex-1 ${task.done ? 'line-through text-gray-400' : ''}`}>{task.task}</span>
                    <span className="text-sm text-gray-500">{task.cost}</span>
                    <span className="text-sm text-gray-400">{task.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phase 3: Scale */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-purple-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="font-bold text-gray-900">Phase 3: Scale Up</h3>
                  <p className="text-sm text-gray-600">Budget: R10,000-R20,000 | Timeline: Month 2+</p>
                </div>
              </div>
              <span className="text-sm text-purple-700 font-medium">
                {phase3Tasks.filter(t => t.done).length}/{phase3Tasks.length} done
              </span>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {phase3Tasks.map((task, i) => (
                  <div 
                    key={i}
                    onClick={() => toggleTask(3, i)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      task.done ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.done ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                    }`}>
                      {task.done && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`flex-1 ${task.done ? 'line-through text-gray-400' : ''}`}>{task.task}</span>
                    <span className="text-sm text-gray-500">{task.cost}</span>
                    <span className="text-sm text-gray-400">{task.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ ZONE PARTNERS TAB ============ */}
      {activeTab === 'zone-partners' && (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🏘️ Zone Partner Strategy</h2>
            <p className="text-gray-700 mb-4">
              Township resellers who buy wholesale and sell in their communities. Trust-based, 
              physical presence, word-of-mouth driven.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-blue-700">Target Audience</h4>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• Unemployed youth looking for income</li>
                  <li>• Existing informal traders</li>
                  <li>• Stokvel members</li>
                  <li>• Spaza shop owners</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-blue-700">Best Channels</h4>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• Community radio (Jozi FM, Alex FM)</li>
                  <li>• Taxi rank flyers</li>
                  <li>• WhatsApp broadcasts</li>
                  <li>• Spaza shop partnerships</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-blue-700">Key Messages</h4>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• "R500 starts your business"</li>
                  <li>• "Keep ALL the profit"</li>
                  <li>• "No boss, no CV"</li>
                  <li>• "China prices in your street"</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold text-gray-900 mb-4">📻 Community Radio Campaign</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Station</th>
                  <th className="text-left p-3">Township</th>
                  <th className="text-left p-3">Reach</th>
                  <th className="text-left p-3">Cost/30s</th>
                  <th className="text-left p-3">Contact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3 font-medium">Jozi FM 105.8</td>
                  <td className="p-3">Soweto</td>
                  <td className="p-3">416K weekly</td>
                  <td className="p-3">R600-R1,500</td>
                  <td className="p-3 text-blue-600">prudence@unitedstations.co.za</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Alex FM 89.1</td>
                  <td className="p-3">Alexandra</td>
                  <td className="p-3">150K+</td>
                  <td className="p-3">R400-R800</td>
                  <td className="p-3 text-blue-600">alexfm.org</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Zibonele FM 98.2</td>
                  <td className="p-3">Khayelitsha</td>
                  <td className="p-3">182K daily</td>
                  <td className="p-3">R500-R1,000</td>
                  <td className="p-3 text-blue-600">info@zibonelefm.co.za</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold text-gray-900 mb-4">🎯 Referral Program</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-700">Incentive Structure</h4>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="flex justify-between"><span>Sign up as Zone Partner</span><span className="font-semibold">R50 airtime</span></li>
                  <li className="flex justify-between"><span>Complete first sale</span><span className="font-semibold">R30 cash bonus</span></li>
                  <li className="flex justify-between"><span>Refer new active Partner</span><span className="font-semibold">R100 cash</span></li>
                  <li className="flex justify-between"><span>Monthly sales &gt; R1,000</span><span className="font-semibold">12% commission</span></li>
                </ul>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-semibold text-amber-700">Why This Works</h4>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  <li>• Immediate rewards (airtime = instant gratification)</li>
                  <li>• Cash is king in townships</li>
                  <li>• Network effects through stokvels</li>
                  <li>• Top performer recognition = status</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ WANTS TAB ============ */}
      {activeTab === 'wants' && (
        <div className="space-y-6">
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎁 Wants System Strategy</h2>
            <p className="text-gray-700 mb-4">
              Viral sharing loop where users pick a product, share with 10 friends, and get it FREE 
              when friends vote. Digital-first, social native, works across all demographics.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-purple-700">Target Audience</h4>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• Gen Z (16-24) on TikTok</li>
                  <li>• Young professionals (25-35)</li>
                  <li>• Students who want free stuff</li>
                  <li>• Anyone with 10+ friends</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-purple-700">Best Channels</h4>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• TikTok (organic viral)</li>
                  <li>• Instagram Reels</li>
                  <li>• Micro-influencers</li>
                  <li>• WhatsApp chain sharing</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-purple-700">Key Messages</h4>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• "Get it FREE"</li>
                  <li>• "No catch, just share"</li>
                  <li>• "10 friends = free product"</li>
                  <li>• "Your friends want free stuff too"</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold text-gray-900 mb-4">🔄 The Viral Loop</h3>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="bg-purple-100 rounded-lg p-4 text-center w-40">
                <Gift className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <p className="font-medium">Pick Product</p>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400" />
              <div className="bg-blue-100 rounded-lg p-4 text-center w-40">
                <Share2 className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="font-medium">Share Link</p>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400" />
              <div className="bg-green-100 rounded-lg p-4 text-center w-40">
                <Users className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="font-medium">10 Friends Vote</p>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400" />
              <div className="bg-orange-100 rounded-lg p-4 text-center w-40">
                <Zap className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <p className="font-medium">Get FREE!</p>
              </div>
            </div>
            <p className="text-center text-gray-600 mt-4 text-sm">
              Each voter sees the system → Creates their own Want → Shares with their friends → Loop continues
            </p>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold text-gray-900 mb-4">📱 Platform Strategy</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-pink-600 mb-3 flex items-center gap-2">
                  <Instagram className="h-5 w-5" /> TikTok / Instagram Reels
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Create 3-5 videos per week showing products</li>
                  <li>• Use trending sounds and formats</li>
                  <li>• "Unboxing" style reveals work best</li>
                  <li>• Partner with nano-influencers (1K-10K followers)</li>
                  <li>• Target R2,500 per influencer for reel</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> WhatsApp Chain Strategy
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• "Vote for my Want" messages spread naturally</li>
                  <li>• Each voter receives prompt to start their own</li>
                  <li>• Status posts with want progress updates</li>
                  <li>• "I got it FREE!" success story posts</li>
                  <li>• Groups become self-reinforcing loops</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-3">🚀 Launch Strategy</h3>
            <ol className="space-y-2 text-sm">
              <li><strong>Week 1:</strong> Seed with 10 personal contacts who have large networks. Give them R100 product budget each.</li>
              <li><strong>Week 2:</strong> Each seeded user recruits 10 voters who each start their own Wants. That's 100 new Wants.</li>
              <li><strong>Week 3:</strong> 100 Wants × 10 voters each = 1,000 people exposed. Some percentage convert.</li>
              <li><strong>Week 4:</strong> First "I got it FREE!" success stories. Use these for social proof content.</li>
              <li><strong>Month 2:</strong> Influencer partnerships to accelerate. Target 10K+ active Wants.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ============ ADS TAB ============ */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          {ADVERTISEMENTS.map((ad) => (
            <div 
              key={ad.id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${getTypeColor(ad.type)}`}>
                    {getTypeIcon(ad.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {ad.duration && <span>⏱️ {ad.duration}</span>}
                      {ad.targetAudience && <span>🎯 {ad.targetAudience}</span>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(ad.content, ad.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    copiedId === ad.id
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copiedId === ad.id ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-6">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 bg-gray-50 p-4 rounded-lg border text-sm leading-relaxed">
                  {ad.content}
                </pre>
                {ad.notes && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                    <span>💡</span>
                    <span>{ad.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ RESEARCH TAB ============ */}
      {activeTab === 'research' && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📊 Market Research & Data</h2>
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ 
              __html: RESEARCH_CONTENT
                .replace(/^## /gm, '<h2 class="text-lg font-bold mt-6 mb-3">')
                .replace(/^### /gm, '<h3 class="text-base font-semibold mt-4 mb-2">')
                .replace(/\n\n/g, '</p><p class="mb-4">')
                .replace(/\n---\n/g, '<hr class="my-6 border-gray-200">')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\|/g, '</td><td class="border px-3 py-2">')
                .replace(/<td class="border px-3 py-2">---/g, '<td class="border px-3 py-2 bg-gray-50">---')
            }} />
          </div>
          
          {/* Key Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">R900B</div>
              <div className="text-sm text-gray-600">Township economy</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-gray-600">WhatsApp open rate</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">18M</div>
              <div className="text-sm text-gray-600">Daily taxi commuters</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">60K+</div>
              <div className="text-sm text-gray-600">Spaza shops</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
