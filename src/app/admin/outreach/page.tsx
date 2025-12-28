'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Mail, Send, CheckCircle, Clock, MessageSquare, Calendar,
  Search, Phone, Instagram, Linkedin, Twitter, XCircle, 
  Rocket, Copy, Check, ChevronDown, ChevronUp, Zap
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
  'Siyanda Calvin Ntenga': {
    subject: "From School Shoes to School Buildings - Partnership Opportunity",
    body: `Siyanda,

I've watched the Ntenga Foundation's work providing school shoes to children who have none. You understand something most people don't: that small barriers – like not having shoes – can end an entire educational journey.

I'm Tredoux from Jeffy Commerce. We're building something that could multiply your impact 1000x.

Our model:
• E-commerce profits fund FREE SCHOOLS across SA
• Zone Partners run local delivery with 50/50 profit sharing
• Graduates receive land, skills, and means to build self-sufficient lives

Imagine: every purchase on Jeffy doesn't just deliver a product – it adds another brick to a school building. Your shoes get kids to school. Our schools give them somewhere to go.

What if we partnered? Ntenga Foundation + Jeffy Commerce = end-to-end educational support.

15 minutes to explore?

Let's build,
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

// Default pitch
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
  const [sendingAll, setSendingAll] = useState(false);
  
  const supabase = createClient();

  useEffect(() => { fetchInfluencers(); }, []);

  const fetchInfluencers = async () => {
    const { data } = await supabase
      .from('influencers')
      .select(`*, outreach_contacts (*)`)
      .order('priority')
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

  // SEND TO ONE PERSON
  const sendToOne = (inf: Influencer) => {
    const link = getGmailLink(inf);
    if (link) {
      window.open(link, '_blank');
      updateStatus(inf.id, 'email_sent');
    }
  };

  // SEND TO EVERYONE - Opens all Gmail tabs
  const sendToEveryone = async () => {
    setSendingAll(true);
    const withEmail = influencers.filter(i => i.email && getStatus(i) === 'not_contacted');
    
    for (let i = 0; i < withEmail.length; i++) {
      const inf = withEmail[i];
      const link = getGmailLink(inf);
      if (link) {
        // Stagger opens to avoid browser blocking
        setTimeout(() => {
          window.open(link, '_blank');
          updateStatus(inf.id, 'email_sent');
        }, i * 1000); // 1 second between each
      }
    }
    
    setTimeout(() => setSendingAll(false), withEmail.length * 1000 + 1000);
  };

  // Stats
  const withEmail = influencers.filter(i => i.email);
  const notContacted = influencers.filter(i => getStatus(i) === 'not_contacted' && i.email);
  const sent = influencers.filter(i => getStatus(i) === 'email_sent');
  const replied = influencers.filter(i => ['replied', 'meeting_scheduled', 'converted'].includes(getStatus(i)));

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Rocket className="w-8 h-8 text-orange-500" />
          Influencer Outreach
        </h1>
        <p className="text-gray-600 mt-1">Click to send personalized pitches</p>
      </div>

      {/* BIG SEND TO EVERYONE BUTTON */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">🚀 Ready to Launch Outreach?</h2>
            <p className="opacity-90 mt-1">
              {notContacted.length} contacts with email ready to receive your pitch
            </p>
          </div>
          <button
            onClick={sendToEveryone}
            disabled={sendingAll || notContacted.length === 0}
            className="px-8 py-4 bg-white text-orange-600 font-bold text-xl rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-3"
          >
            {sendingAll ? (
              <>
                <div className="animate-spin w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full" />
                Opening {notContacted.length} emails...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                SEND TO ALL {notContacted.length} CONTACTS
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border-2">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-3xl font-bold">{influencers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-green-200">
          <p className="text-green-600 text-sm">With Email</p>
          <p className="text-3xl font-bold text-green-600">{withEmail.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
          <p className="text-blue-600 text-sm">Emails Sent</p>
          <p className="text-3xl font-bold text-blue-600">{sent.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
          <p className="text-emerald-600 text-sm">Replied/Meeting</p>
          <p className="text-3xl font-bold text-emerald-600">{replied.length}</p>
        </div>
      </div>

      {/* Influencer List */}
      <div className="space-y-3">
        {influencers.map((inf) => {
          const status = getStatus(inf);
          const statusOpt = STATUS_OPTIONS.find(s => s.value === status)!;
          const pitch = getPitch(inf);
          const gmailLink = getGmailLink(inf);
          const isExpanded = expandedId === inf.id;
          const hasPitch = !!PITCHES[inf.name];

          return (
            <div key={inf.id} className="bg-white rounded-xl border shadow-sm">
              {/* Main Row */}
              <div className="p-4 flex items-center gap-4">
                {/* Priority */}
                <div className={`w-2 h-14 rounded-full ${
                  inf.priority === 'high' ? 'bg-red-500' :
                  inf.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-300'
                }`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{inf.name}</span>
                    {hasPitch && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✨ Custom Pitch</span>}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{inf.category}</span>
                    {inf.followers && <span>{inf.followers >= 1000000 ? `${(inf.followers/1000000).toFixed(1)}M` : `${Math.round(inf.followers/1000)}K`}</span>}
                    {inf.email && <span className="text-green-600 font-medium">📧 {inf.email}</span>}
                  </div>
                </div>

                {/* Status */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusOpt.color}`}>
                  {statusOpt.label}
                </span>

                {/* SEND BUTTON - Big and Clear */}
                {inf.email && status === 'not_contacted' ? (
                  <button
                    onClick={() => sendToOne(inf)}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg"
                  >
                    <Mail className="w-5 h-5" />
                    SEND
                  </button>
                ) : inf.email ? (
                  <button
                    onClick={() => sendToOne(inf)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Resend
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">No email</span>
                )}

                {/* Copy */}
                <button
                  onClick={() => copyPitch(inf)}
                  className={`p-2 rounded-lg ${copiedId === inf.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title="Copy pitch"
                >
                  {copiedId === inf.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>

                {/* Status Change */}
                <select
                  value={status}
                  onChange={(e) => updateStatus(inf.id, e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>

                {/* Expand */}
                <button onClick={() => setExpandedId(isExpanded ? null : inf.id)} className="p-2 text-gray-500">
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t p-4 bg-gray-50 grid md:grid-cols-2 gap-4">
                  {/* Pitch */}
                  <div>
                    <h4 className="font-bold text-sm mb-2">📧 PITCH PREVIEW</h4>
                    <div className="bg-white border rounded-lg p-4 text-sm max-h-80 overflow-y-auto">
                      <p className="font-medium mb-2">Subject: {pitch.subject}</p>
                      <pre className="whitespace-pre-wrap text-xs text-gray-700 font-sans">{pitch.body}</pre>
                    </div>
                  </div>

                  {/* Contact & Actions */}
                  <div>
                    <h4 className="font-bold text-sm mb-2">📞 CONTACT & ACTIONS</h4>
                    <div className="bg-white border rounded-lg p-4 space-y-3">
                      {inf.email && <p><strong>Email:</strong> {inf.email}</p>}
                      {inf.phone && <p><strong>Phone:</strong> {inf.phone}</p>}
                      {inf.profile_url && <p><strong>Profile:</strong> <a href={inf.profile_url} target="_blank" className="text-blue-600 underline">{inf.profile_url}</a></p>}
                      {inf.notes && <p className="text-gray-600 text-sm">{inf.notes}</p>}
                      
                      <div className="pt-3 space-y-2">
                        {gmailLink && (
                          <a
                            href={gmailLink}
                            target="_blank"
                            onClick={() => updateStatus(inf.id, 'email_sent')}
                            className="block w-full text-center px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
                          >
                            📧 Open in Gmail (Ready to Send)
                          </a>
                        )}
                        <button
                          onClick={() => copyPitch(inf)}
                          className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          {copiedId === inf.id ? '✓ Copied!' : '📋 Copy Pitch for LinkedIn/DM'}
                        </button>
                        {inf.phone && (
                          <a
                            href={`https://wa.me/${inf.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            className="block w-full text-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            💬 WhatsApp
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
