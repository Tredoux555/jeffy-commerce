'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Mail, Send, CheckCircle, Clock, MessageSquare, Calendar,
  Search, Phone, Instagram, Linkedin, Twitter, XCircle, 
  Rocket, Copy, Check, ChevronDown, ChevronUp, Zap, Star,
  Trophy, Target, Users
} from 'lucide-react';

interface Influencer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  platform: string | null;
  handle: string | null;
  followers: number | null;
  category: string | null;
  priority: string;
  notes: string | null;
  profile_url: string | null;
  outreach_contacts?: OutreachContact[];
}

interface OutreachContact {
  id: string;
  influencer_id: string;
  status: string;
  pitch_type: string;
  sent_at: string | null;
  replied_at: string | null;
  notes: string | null;
}

// Top 5 priority names for Day 1
const DAY1_NAMES = [
  'Taddy Blecher',      // Education pioneer - perfect fit
  'Thulani Madondo',    // CNN Hero - great story alignment  
  'Vusi Thembekwayo',   // Massive reach + business credibility
  'Motsepe Foundation', // Funding potential
  'Theo Baloyi',        // Bathu shoes - direct alignment
];

// Day 3 names
const DAY3_NAMES = [
  'Dr Sizwe Nxasana',
  'Lindiwe Matlali',
  'James Urdang',
  'IkamvaYouth',
  'Bonang Matheba',
  'Connie Ferguson',
];

// All personalized pitches
const PITCHES: Record<string, { subject: string; body: string }> = {
  'Taddy Blecher': {
    subject: "Fellow Education Revolutionary - Let's Build Free Schools Together",
    body: `Dear Dr. Blecher,

Your work with CIDA City Campus didn't just create a university – it proved that free, quality education at scale is possible in South Africa. That proof of concept has inspired everything we're building at Jeffy Commerce.

I'm Tredoux Willemse, founder of Jeffy Commerce. Like you, I believe South Africans are the most capable people on the planet when given opportunity. My family built a school for farm children who walked 30km to learn. Corruption killed it. I've spent years on every continent learning how to try again – properly this time.

Here's what we're building:
• E-commerce platform with Zone Partners (50/50 profit sharing)
• ALL profits beyond operations fund FREE SCHOOLS
• Merit-based selection – graduates receive 1 hectare land + skills training
• Self-sufficient communities producing food, tech, medicine, clothing

We're not asking for money. We're asking for your wisdom.

Would you give us 30 minutes? Your experience scaling free education could save us years of mistakes.

With deep respect,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za

"We plant trees under whose shade we'll never sit."`
  },
  'Thulani Madondo': {
    subject: "From Kliptown to Everywhere - Scaling Your Vision",
    body: `Thulani,

CNN Hero. 17 years in Kliptown. 1,400+ children supported. You grew up in the poverty you're now fighting. That's not a story – that's credibility money can't buy.

I'm Tredoux from Jeffy Commerce. My family built a school for farm children in SA. Corruption destroyed it. I've spent years figuring out how to try again – corruption-proof this time.

Our model:
• E-commerce profits fund FREE SCHOOLS
• Merit-based selection only
• Graduates get 1 hectare land + skills + production facilities
• Self-sufficient communities that don't depend on external funding

Kliptown Youth Program proves the model works. What if we could build 100 Kliptowns?

You have 17 years of on-the-ground wisdom. We have a funding mechanism that could scale it nationwide.

Can we talk?

With admiration,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },
  'Vusi Thembekwayo': {
    subject: "100,000 Jobs + Free Schools = Africa's Future",
    body: `Vusi,

MyGrowthFund's mission to create 100,000 jobs aligns perfectly with what we're building at Jeffy Commerce. But we're taking it further.

I'm Tredoux Willemse. Here's our thesis:

Jobs are great. But what if we created job CREATORS?

Jeffy Commerce model:
• Zone Partners run local delivery (50/50 profit split) – that's jobs
• ALL profits fund FREE merit-based schools – that's education
• Graduates get 1 hectare land + skills + production facilities – that's entrepreneurship
• Self-sufficient communities manufacturing food, tech, medicine – that's generational wealth

We're not building a company. We're building a machine that produces capable South Africans at scale.

You've got 6.2M followers and the ear of Africa's business community. A 60-second video from you could bring us 1,000 Zone Partner applications.

Worth a conversation?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },
  'Motsepe Foundation': {
    subject: "R1.5 Billion Commitment + Sustainable Model = Permanent Change",
    body: `Dear Motsepe Foundation Team,

Dr. Patrice Motsepe's R1.5 billion commitment to education at Global Citizen 2018 demonstrated what's possible when South African success reinvests in South African potential.

I'm Tredoux Willemse, founder of Jeffy Commerce. We're building something complementary: a self-sustaining education funding mechanism.

Our model:
• E-commerce platform with Zone Partners (50/50 profit sharing)
• ALL profits beyond operations fund FREE merit-based schools
• Graduates receive 1 hectare land + skills + production facilities
• Self-sufficient communities that don't require ongoing donations

The Motsepe Foundation provides transformative capital. Jeffy Commerce provides perpetual operational funding. Together: schools that never need another fundraising campaign.

We're seeking:
1. Strategic guidance from your education program team
2. Potential partnership on school infrastructure
3. Introduction to education sector stakeholders

Would your team be open to an exploratory conversation?

Respectfully,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },
  'Theo Baloyi': {
    subject: "1 Million Shoes + Free Schools = Unstoppable",
    body: `Theo,

Bathu for Batho. 1 million school shoes. You didn't just build a sneaker brand – you built a movement that says "South Africans uplift South Africans."

I'm Tredoux, founder of Jeffy Commerce. Our mission is audacious but simple: use e-commerce profits to build FREE SCHOOLS across South Africa.

Here's what caught my attention about Bathu:
• Township to success story that inspires millions
• "Bathu for Batho" already addresses education access
• You understand that business and social impact aren't separate

Here's what we're building:
• Zone Partners run local delivery (50/50 profit split)
• ALL profits fund merit-based free schools
• Graduates get 1 hectare land + skills to be self-sufficient

Bathu gets kids TO school. Jeffy builds the schools they go TO.

What if we combined forces? Bathu sold through Jeffy, with every sale funding education infrastructure?

Let's talk ambition.

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },
  'Dr Sizwe Nxasana': {
    subject: "From FirstRand to Future Nation - Let's Compare Notes",
    body: `Dr. Nxasana,

You left the corner office at FirstRand to build affordable schools with 100% matric pass rates. That tells me everything I need to know about your priorities.

I'm Tredoux Willemse, founder of Jeffy Commerce. We're attacking the same problem from a different angle:

Your approach: Build excellent affordable schools
Our approach: Fund FREE schools through e-commerce profits

Our model:
• Zone Partners deliver products locally (50/50 profit sharing)
• All profits beyond operations fund merit-based schools
• Graduates receive 1 hectare land + skills training
• Self-sufficient communities that can manufacture food, tech, medicine

You have operational excellence in education delivery. We're building the funding engine that could make it infinitely scalable.

I'd love 30 minutes to learn from your experience and explore whether there's a collaboration that makes both our visions bigger.

With respect,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },
  'Lindiwe Matlali': {
    subject: "800,000 Coders Need Schools That Understand Them",
    body: `Lindiwe,

You've trained 800,000+ children in coding through Africa Teen Geeks. You've seen firsthand that our kids can compete globally when given tools and opportunity.

I'm Tredoux from Jeffy Commerce. We're building free schools – but not just any schools.

Our vision:
• E-commerce profits fund merit-based FREE schools
• Graduates receive 1 hectare land + production facilities
• Communities that manufacture food, TECH, medicine, clothing

Tech is in our DNA. Our schools won't just teach coding – they'll produce the next generation of SA tech founders.

You're on the Presidential 4IR Commission. You have influence over how SA approaches technology education. What if Africa Teen Geeks grads had a pathway to schools specifically designed for their potential?

15 minutes to explore?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },
  'James Urdang': {
    subject: "30 Years of Education Africa Wisdom + Fresh Funding Model",
    body: `James,

Mentored by Walter Sisulu. Worked with Mandela. Built Masibambane College. 30+ years creating educational opportunity in South Africa.

I'm Tredoux from Jeffy Commerce, and I need to learn from someone like you.

We're building:
• E-commerce platform where profits fund FREE schools
• Zone Partners for local delivery (50/50 profit split)
• Merit-based selection – graduates get land + skills + facilities
• Self-sufficient communities across SA

I've read about Education Africa's marimba programmes, your approach to holistic education, the practical skills focus. This is exactly what we want to build – but funded perpetually by commerce, not donations.

Would you give us 30 minutes? Your experience could save us years of mistakes.

With deep respect for your life's work,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },
  'IkamvaYouth': {
    subject: "17 Branches, 80-100% Pass Rates - Let's Scale It",
    body: `Dear IkamvaYouth Team,

17 branches. 80-100% matric pass rates. Ashoka Fellow recognition. You've proven that peer-to-peer tutoring and community-based education works at scale.

I'm Tredoux from Jeffy Commerce. We're building the funding infrastructure that could help organizations like yours grow indefinitely.

Our model:
• E-commerce profits fund FREE schools
• Zone Partners create local employment
• Graduates receive resources for independent lives

Here's the partnership opportunity:

IkamvaYouth has the educational methodology that works. Jeffy Commerce has a funding model that doesn't depend on grants or donations.

What if every Jeffy sale contributed to IkamvaYouth expansion? What if we could fund 50 branches instead of 17?

Would your team be open to exploring this?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },
  'Bonang Matheba': {
    subject: "Queen B - Help Us Crown SA's Future Leaders",
    body: `Bonang,

You dropped out of university due to fee issues. Then you built an empire anyway. House of BNG. Forbes Africa recognition. 10.5 million followers.

But I wonder – how many brilliant South Africans never got their shot because there was no Bonang-level determination to fall back on?

I'm Tredoux from Jeffy Commerce. We're building free schools funded by e-commerce profits. Not charity schools – excellence schools. Merit-based. Graduates get land, skills, and means to build independent lives.

Here's why you:
• You LIVED the education access problem
• You proved SA talent can compete globally
• You reach millions of young South Africans daily

One Instagram story from you could fund a classroom. One partnership could fund a school.

What would it take to get 15 minutes of your time?

With respect,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },
  'Connie Ferguson': {
    subject: "Ferguson Foundation + Jeffy Schools = Legacy That Outlives Us",
    body: `Connie,

The Ferguson Foundation's work funding disadvantaged youth education shows that success in entertainment doesn't have to stay in entertainment.

I'm Tredoux from Jeffy Commerce. We're building free schools funded by e-commerce profits – and we need partners who understand the power of story.

Our model:
• Zone Partners deliver products locally (50/50 profit split)
• ALL profits fund merit-based free schools
• Graduates get land, skills, production facilities
• Self-sufficient communities across SA

Here's what Ferguson Films could add:
• Documentary telling the Jeffy Schools story
• Reaching 5.8M followers with our mission
• Ferguson Foundation partnership on education delivery

What we offer:
• A story worth telling – commerce funding education at scale
• Real students, real transformation, real impact
• Content that matters

15 minutes to explore?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },
  'Sizwe Dhlomo': {
    subject: "2.5M Twitter Followers Could Build Schools",
    body: `Sizwe,

You've got 2.5 million people paying attention to what you say. That's power. And from what I've seen, you use it thoughtfully.

I'm Tredoux from Jeffy Commerce. We're building free schools funded by e-commerce profits. Not charity. Not government. Just South Africans buying products, and those profits becoming classrooms.

Our model is simple:
• Zone Partners deliver locally (50/50 split)
• Profits build merit-based free schools
• Graduates get land + skills + independence

Here's my ask:

One tweet. That's it. If it resonates with you, one tweet about Jeffy Commerce could bring us hundreds of Zone Partner applications from people who want business ownership AND social impact.

No financial ask. Just attention from someone who has it.

Worth knowing more?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },
};

// Default pitch for those without custom
const DEFAULT_PITCH = {
  subject: "Partnership Opportunity - Jeffy Commerce | Building Free Schools Through E-Commerce",
  body: `Hi [NAME],

I'm Tredoux Willemse, founder of Jeffy Commerce. I've been following your work and believe there's powerful alignment with what we're building.

Jeffy Commerce is more than e-commerce – we're building a machine that produces free schools:

• Zone Partners run local delivery (50/50 profit sharing)
• ALL profits beyond operations fund FREE merit-based schools
• Graduates receive 1 hectare land + skills + production facilities
• Self-sufficient communities across South Africa

We're looking for partners who believe South Africans are the most capable people on the planet when given opportunity.

Would you be open to a 15-minute conversation?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za

"We plant trees under whose shade we'll never sit."`
};

const STATUS_OPTIONS = [
  { value: 'not_contacted', label: 'Not Contacted', color: 'bg-gray-100 text-gray-700' },
  { value: 'email_sent', label: 'Email Sent', color: 'bg-blue-100 text-blue-700' },
  { value: 'replied', label: 'Replied! 🎉', color: 'bg-green-100 text-green-700' },
  { value: 'meeting_scheduled', label: 'Meeting Set', color: 'bg-purple-100 text-purple-700' },
  { value: 'converted', label: 'Partner! 🚀', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-700' },
  { value: 'no_response', label: 'No Response', color: 'bg-orange-100 text-orange-700' },
];

export default function OutreachPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => { fetchInfluencers(); }, []);

  const fetchInfluencers = async () => {
    const { data } = await supabase
      .from('influencers')
      .select(`*, outreach_contacts (*)`)
      .order('followers', { ascending: false });
    if (data) setInfluencers(data);
    setLoading(false);
  };

  const getStatus = (inf: Influencer): string => {
    const contacts = inf.outreach_contacts || [];
    if (contacts.length === 0) return 'not_contacted';
    return contacts.sort((a, b) => 
      new Date(b.sent_at || 0).getTime() - new Date(a.sent_at || 0).getTime()
    )[0]?.status || 'not_contacted';
  };

  const updateStatus = async (id: string, status: string) => {
    const inf = influencers.find(i => i.id === id);
    const existing = inf?.outreach_contacts?.[0];
    
    if (existing) {
      await supabase.from('outreach_contacts').update({ status }).eq('id', existing.id);
    } else {
      await supabase.from('outreach_contacts').insert({
        influencer_id: id, status, sent_at: new Date().toISOString()
      });
    }
    fetchInfluencers();
  };

  const getPitch = (inf: Influencer) => {
    return PITCHES[inf.name] || {
      subject: DEFAULT_PITCH.subject,
      body: DEFAULT_PITCH.body.replace('[NAME]', inf.name.split(' ')[0])
    };
  };

  const getGmailLink = (inf: Influencer) => {
    if (!inf.email) return null;
    const pitch = getPitch(inf);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${inf.email}&su=${encodeURIComponent(pitch.subject)}&body=${encodeURIComponent(pitch.body)}`;
  };

  const copyPitch = async (inf: Influencer) => {
    const pitch = getPitch(inf);
    await navigator.clipboard.writeText(`Subject: ${pitch.subject}\n\n${pitch.body}`);
    setCopiedId(inf.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendToOne = (inf: Influencer) => {
    const link = getGmailLink(inf);
    if (link) {
      window.open(link, '_blank');
      updateStatus(inf.id, 'email_sent');
    }
  };

  const sendBatch = (names: string[]) => {
    const batch = influencers.filter(i => names.includes(i.name) && i.email && getStatus(i) === 'not_contacted');
    batch.forEach((inf, i) => {
      setTimeout(() => {
        const link = getGmailLink(inf);
        if (link) {
          window.open(link, '_blank');
          updateStatus(inf.id, 'email_sent');
        }
      }, i * 1500);
    });
  };

  // Categorize influencers
  const day1 = influencers.filter(i => DAY1_NAMES.includes(i.name));
  const day3 = influencers.filter(i => DAY3_NAMES.includes(i.name));
  const day5 = influencers.filter(i => !DAY1_NAMES.includes(i.name) && !DAY3_NAMES.includes(i.name));

  const day1Ready = day1.filter(i => i.email && getStatus(i) === 'not_contacted').length;
  const day3Ready = day3.filter(i => i.email && getStatus(i) === 'not_contacted').length;
  const day5Ready = day5.filter(i => i.email && getStatus(i) === 'not_contacted').length;

  // Stats
  const sent = influencers.filter(i => getStatus(i) === 'email_sent').length;
  const replied = influencers.filter(i => ['replied', 'meeting_scheduled', 'converted'].includes(getStatus(i))).length;

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Rocket className="w-8 h-8 text-orange-500" />
          Influencer Outreach
        </h1>
        <p className="text-gray-600 mt-1">Strategic staggered outreach - don't send all at once!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border-2">
          <p className="text-gray-500 text-sm">Total Contacts</p>
          <p className="text-3xl font-bold">{influencers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
          <p className="text-blue-600 text-sm">Emails Sent</p>
          <p className="text-3xl font-bold text-blue-600">{sent}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
          <p className="text-emerald-600 text-sm">Replied/Meeting</p>
          <p className="text-3xl font-bold text-emerald-600">{replied}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
          <p className="text-purple-600 text-sm">Conversion Rate</p>
          <p className="text-3xl font-bold text-purple-600">{sent > 0 ? Math.round((replied/sent)*100) : 0}%</p>
        </div>
      </div>

      {/* STRATEGY SECTION */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 mb-8 text-white">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📋 Your Outreach Strategy
        </h2>
        <p className="text-slate-300 mb-4">Don't blast everyone at once. Stagger your outreach so you can properly follow up with replies.</p>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Day 1 */}
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold">DAY 1 - Top 5</span>
            </div>
            <p className="text-sm text-slate-300 mb-3">Highest-value targets with perfect mission alignment</p>
            <ul className="text-sm space-y-1 mb-4">
              {DAY1_NAMES.map(name => {
                const inf = influencers.find(i => i.name === name);
                const status = inf ? getStatus(inf) : 'not_contacted';
                return (
                  <li key={name} className="flex items-center gap-2">
                    {status === 'not_contacted' ? '⚪' : status === 'email_sent' ? '🔵' : '🟢'}
                    <span className={status !== 'not_contacted' ? 'line-through opacity-60' : ''}>{name}</span>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={() => sendBatch(DAY1_NAMES)}
              disabled={day1Ready === 0}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {day1Ready > 0 ? `SEND TO ${day1Ready} CONTACTS` : 'ALL SENT ✓'}
            </button>
          </div>

          {/* Day 3 */}
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-orange-400" />
              <span className="font-bold">DAY 3 - Wave 2</span>
            </div>
            <p className="text-sm text-slate-300 mb-3">Education leaders & high-reach influencers</p>
            <ul className="text-sm space-y-1 mb-4">
              {DAY3_NAMES.map(name => {
                const inf = influencers.find(i => i.name === name);
                const status = inf ? getStatus(inf) : 'not_contacted';
                return (
                  <li key={name} className="flex items-center gap-2">
                    {status === 'not_contacted' ? '⚪' : status === 'email_sent' ? '🔵' : '🟢'}
                    <span className={status !== 'not_contacted' ? 'line-through opacity-60' : ''}>{name}</span>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={() => sendBatch(DAY3_NAMES)}
              disabled={day3Ready === 0}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {day3Ready > 0 ? `SEND TO ${day3Ready} CONTACTS` : 'ALL SENT ✓'}
            </button>
          </div>

          {/* Day 5 */}
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-bold">DAY 5 - Everyone Else</span>
            </div>
            <p className="text-sm text-slate-300 mb-3">Complete the outreach to remaining contacts</p>
            <ul className="text-sm space-y-1 mb-4 max-h-32 overflow-y-auto">
              {day5.map(inf => {
                const status = getStatus(inf);
                return (
                  <li key={inf.id} className="flex items-center gap-2">
                    {status === 'not_contacted' ? '⚪' : status === 'email_sent' ? '🔵' : '🟢'}
                    <span className={status !== 'not_contacted' ? 'line-through opacity-60' : ''}>{inf.name}</span>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={() => sendBatch(day5.map(i => i.name))}
              disabled={day5Ready === 0}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {day5Ready > 0 ? `SEND TO ${day5Ready} CONTACTS` : 'ALL SENT ✓'}
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm text-slate-300">
          <strong>💡 Pro tip:</strong> After Day 1, wait to see if you get any replies before sending Day 3. If someone replies, give them your full attention!
        </div>
      </div>

      {/* Full Contact List */}
      <h2 className="text-xl font-bold mb-4">All Contacts</h2>
      <div className="space-y-3">
        {influencers.map((inf) => {
          const status = getStatus(inf);
          const statusOpt = STATUS_OPTIONS.find(s => s.value === status)!;
          const pitch = getPitch(inf);
          const gmailLink = getGmailLink(inf);
          const isExpanded = expandedId === inf.id;
          const hasPitch = !!PITCHES[inf.name];
          const isDay1 = DAY1_NAMES.includes(inf.name);
          const isDay3 = DAY3_NAMES.includes(inf.name);

          return (
            <div key={inf.id} className="bg-white rounded-xl border shadow-sm">
              <div className="p-4 flex items-center gap-4">
                {/* Day indicator */}
                <div className={`w-2 h-14 rounded-full ${
                  isDay1 ? 'bg-yellow-500' : isDay3 ? 'bg-orange-500' : 'bg-blue-400'
                }`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg">{inf.name}</span>
                    {isDay1 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Day 1</span>}
                    {isDay3 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Day 3</span>}
                    {!isDay1 && !isDay3 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Day 5</span>}
                    {hasPitch && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✨ Custom</span>}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{inf.category}</span>
                    {inf.followers && <span>{inf.followers >= 1000000 ? `${(inf.followers/1000000).toFixed(1)}M` : `${Math.round(inf.followers/1000)}K`}</span>}
                    {inf.email && <span className="text-green-600">📧 {inf.email}</span>}
                  </div>
                </div>

                {/* Status */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusOpt.color}`}>
                  {statusOpt.label}
                </span>

                {/* Actions */}
                {inf.email && status === 'not_contacted' ? (
                  <button onClick={() => sendToOne(inf)} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg flex items-center gap-2">
                    <Mail className="w-4 h-4" /> SEND
                  </button>
                ) : inf.email ? (
                  <button onClick={() => sendToOne(inf)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" /> Resend
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">No email</span>
                )}

                <button
                  onClick={() => copyPitch(inf)}
                  className={`p-2 rounded-lg ${copiedId === inf.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {copiedId === inf.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>

                <select
                  value={status}
                  onChange={(e) => updateStatus(inf.id, e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>

                <button onClick={() => setExpandedId(isExpanded ? null : inf.id)} className="p-2 text-gray-500">
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t p-4 bg-gray-50 grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-sm mb-2">📧 PITCH PREVIEW</h4>
                    <div className="bg-white border rounded-lg p-4 text-sm max-h-80 overflow-y-auto">
                      <p className="font-medium mb-2">Subject: {pitch.subject}</p>
                      <pre className="whitespace-pre-wrap text-xs text-gray-700 font-sans">{pitch.body}</pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-2">📞 CONTACT & ACTIONS</h4>
                    <div className="bg-white border rounded-lg p-4 space-y-3">
                      {inf.email && <p><strong>Email:</strong> {inf.email}</p>}
                      {inf.phone && <p><strong>Phone:</strong> {inf.phone}</p>}
                      {inf.profile_url && <p><strong>Profile:</strong> <a href={inf.profile_url} target="_blank" className="text-blue-600 underline">{inf.profile_url}</a></p>}
                      {inf.notes && <p className="text-gray-600 text-sm">{inf.notes}</p>}
                      
                      <div className="pt-3 space-y-2">
                        {gmailLink && (
                          <a href={gmailLink} target="_blank" onClick={() => updateStatus(inf.id, 'email_sent')}
                            className="block w-full text-center px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">
                            📧 Open in Gmail
                          </a>
                        )}
                        <button onClick={() => copyPitch(inf)} className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                          {copiedId === inf.id ? '✓ Copied!' : '📋 Copy Pitch for LinkedIn/DM'}
                        </button>
                        {inf.phone && (
                          <a href={`https://wa.me/${inf.phone.replace(/[^0-9]/g, '')}`} target="_blank"
                            className="block w-full text-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                            💬 WhatsApp
                          </a>
                        )}
                        {inf.profile_url && (
                          <a href={inf.profile_url} target="_blank"
                            className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            🔗 View Profile
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
