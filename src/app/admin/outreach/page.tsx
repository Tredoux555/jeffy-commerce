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
  'Taddy Blecher',
  'Vusi Thembekwayo',
  'Motsepe Foundation',
  'Theo Baloyi',
  'Lindiwe Matlali',
];

// Day 3 names
const DAY3_NAMES = [
  'Dr Sizwe Nxasana',
  'Thulani Madondo',
  'James Urdang',
  'IkamvaYouth',
  'Bonang Matheba',
  'Connie Ferguson',
];

// ============================================
// REAL PERSONALIZED LETTERS - WITH SOUL
// ============================================
const PITCHES: Record<string, { subject: string; body: string }> = {
  'Vusi Thembekwayo': {
    subject: "From walking through malls with CVs to building free schools",
    body: `Hey Vusi,

I'm going to be straight with you — I've followed your journey for years and it took me a while to work up the nerve to send this. But here goes.

I know where you came from. The gunmen. Losing your father at 13. Your mom working herself to the bone. Living at your grandfather's place with no electricity, waking before dawn just to catch buses to school. Dropping out of university when the money dried up. Walking through malls for six weeks handing out CVs.

And I know where you ended up. Business from your bedroom at 17. World champion speaker by 22. MyGrowthFund. 300 Black businesses. 100,000 jobs by 2030.

Here's the thing — I'm building something that I think speaks to everything you've been fighting for. It's called Jeffy, and on the surface it's just a commerce platform. But underneath? It's the engine for something bigger.

The profits from Jeffy are going to build free schools. Not charity schools — schools where kids are selected purely on merit. And when they graduate? They walk away with one hectare of land, a house they built themselves, and the skills to manufacture whatever they need. Food. Tech. Clothes. Everything.

My family built a school once. For farm kids who had to walk 30km each way just to learn. Corruption killed it. I've been trying to figure out how to build something they can't destroy ever since.

I'm not asking for money or a favour. I'm asking if you'd take 10 minutes to read The Jeffy Manifesto and tell me if it's worth a conversation. That's it.

You once said you challenge yourself to do one terrifying thing every year. Sending this email might be mine.

Cheers,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Theo Baloyi': {
    subject: "Walk Your Journey — from Alex to building schools together",
    body: `Hey Theo,

Your dad taught you something that stuck with me — have an intellectual relationship with money, not an emotional one. Lose R10? Don't cry about it. Think about how to make R20.

He passed in 2014 before he could see what you built. That gets me. The people who plant trees they'll never sit under.

I know the story. Moving to Alex. Seeing guys on street corners who'd given up. Asking yourself if you'd be the one in the fancy office looking down or the one actually doing something. Sixteen factories saying no to your mesh design. Wanting 100 pairs but they demanded 1,200. Twenty-one samples later, finally a yes.

Now? 32+ stores. 400+ jobs. 80% of your warehouse staff from Alex. Your sister on the team. Job Creator of the Year. A million school shoes through Bathu for Batho.

"Walk Your Journey" isn't just a slogan. It's a whole philosophy. And I think what I'm building has the same DNA.

Jeffy Commerce is a platform where Zone Partners — local entrepreneurs — own their territories and keep 50% of profits. Not the 25% Uber and Bolt leave for their drivers. Real ownership. Real money back in the community.

But that's just the engine. The profits build free schools where graduates walk away with land, a house they built, and skills to make anything they need. Selected on merit alone. No connections. No money. Just potential.

You said "don't despise small beginnings." This is mine. I'm not asking you to endorse anything blind. Just read The Jeffy Manifesto and tell me if it's worth walking together for a bit.

Walk your journey,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Taddy Blecher': {
    subject: "From millionaire actuary to free education — I need to learn from you",
    body: `Hey Taddy,

I'm going to be honest with you — when I found out what you've built, I couldn't believe someone hadn't sent me to you years ago.

You were a millionaire actuary with tickets to America in 1995. But driving through the townships changed everything. You unpacked your bags and spent four years in Alexandra. And when you realized graduates were ending up back on the streets, you founded a free university with "no buildings, no books, no money, no teachers, no computers — nothing."

Now? 600,000+ South Africans trained. 19,000+ graduates collectively earning R100M+ annually. 5,000+ businesses created. The "Learn and Earn" model where students literally build and maintain the institution while studying.

You're already doing what I've been dreaming about.

Here's my version: Jeffy Commerce is a platform that funds free schools. Students are selected on pure merit. When they graduate, they leave with one hectare of land, a house they built themselves, and skills to manufacture everything they need. The schools become self-sustaining communities.

My family built a school once. Corruption killed it. Your model is corruption-proof because it doesn't depend on outside funding — the community sustains itself.

I'd love to learn from you. Pick your brain. Maybe find ways our visions can support each other.

The Jeffy Manifesto is attached. Would love your thoughts on it — from someone who's actually built what I'm trying to build.

With serious respect,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Motsepe Foundation': {
    subject: "Land WITH skills — exactly what you've been building",
    body: `Dear Dr. Motsepe,

Your father ran a spaza shop in Soweto. You became the first Black partner at Bowman Gilfillan. First African to sign the Giving Pledge. Built an empire. And then pledged R3.5 billion toward providing rural communities land WITH skills and resources for sustainable farming.

That last part is exactly what I'm trying to do. Not just land. Land WITH skills AND resources.

Jeffy Commerce is a platform that funds free schools. Merit-only selection. Graduates leave with one hectare of land, a house they built themselves, and skills to manufacture everything they need — food, tech, medicine, housing. Complete self-sufficiency.

Your land reform approach is the model. Providing land without skills creates dependency. You understood that. I want to take it further — not just farming skills, but manufacturing skills. Complete independence.

The Jeffy Manifesto is attached. If there is any alignment between what I'm building and the Motsepe Foundation's work, I would be deeply honored to have that conversation.

You've already committed over $2 billion to building South Africa. I'm not asking for funding — I'm asking if you'd read the vision and tell me if it's worth pursuing.

With deep respect,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Lindiwe Matlali': {
    subject: "800,000 kids trained — children need to know they matter",
    body: `Hey Lindiwe,

Orphaned young. Founded Africa Teen Geeks in 2014 after meeting an 8-year-old US coder who'd built her own app. Realized IT was only taught from grade 10, only in rich schools. Said "I'm going to fix this."

Now? 800,000+ kids trained. Presidential 4th Industrial Commission. MS at Columbia. Graduate certificate at Stanford. Africa's largest computer science NGO.

"Children need to know that they matter." That sentence broke me.

Here's what I'm building. Jeffy Commerce funds free schools. Merit-only selection — so no child is left behind because of money. Graduates leave with land, a house they built, and skills to manufacture everything they need — including technology.

Coding is part of that. But I'm going further — manufacturing tech, not just using it. Building computers, not just programming them. Real physical and digital skills combined.

Would you read The Jeffy Manifesto? Your work in townships and rural areas is exactly who these schools are for. I'd love your thoughts on how coding and tech skills fit into a self-sufficiency curriculum.

Raising little Marian Croaks,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Dr Sizwe Nxasana': {
    subject: "From FirstRand CEO to PhD in education at 67 — that tells me everything",
    body: `Hey Sizwe,

You ran FirstRand for 10 years. Telkom for 8. One of the first 10 Black chartered accountants in South Africa. And then you "retired" — only to start a PhD in Project-Based Learning. At 67. Finished it in May 2025.

That tells me everything I need to know about where your heart is.

You founded KZN's first Black audit firm in 1989. Built an empire. Then walked away to transform education. Sifiso Learning Group. Future Nation Schools. An "African-centred education ecosystem" where kids learn by doing real projects.

That's exactly what I'm building. Jeffy Commerce is a platform that funds free schools. Students selected on pure merit. When they graduate: one hectare of land, a house they built themselves, skills to manufacture food, tech, clothes, everything.

Project-based learning taken to its logical conclusion — not just learning by doing projects, but learning by building an entire life.

My family built a school once for farm kids. Corruption killed it. Your model — learning by doing, African-centered, self-sustaining — is the antidote.

I'd love your perspective on The Jeffy Manifesto. Coming from someone who left a corporate throne to get a PhD in education, I can't think of anyone better to critique what I'm building.

Grateful for your time,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Bonang Matheba': {
    subject: "You dropped out due to fees — then built an empire anyway",
    body: `Bonang,

You dropped out of university due to fee issues. Then you built an empire anyway. House of BNG. Forbes Africa recognition. 10.5 million followers.

But I wonder — how many brilliant South Africans never got their shot because there was no Bonang-level determination to fall back on?

I'm Tredoux from Jeffy Commerce. We're building free schools funded by e-commerce profits. Not charity schools — excellence schools. Merit-based. Graduates get land, skills, and means to build independent lives.

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

I'm Tredoux from Jeffy Commerce. We're building free schools funded by e-commerce profits — and we need partners who understand the power of story.

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
• A story worth telling — commerce funding education at scale
• Real students, real transformation, real impact
• Content that matters

15 minutes to explore?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Terra-Khaya': {
    subject: "You built an off-grid eco-lodge from nothing — I need that for my schools",
    body: `Hey Shane and Carrie,

You built an entire eco-lodge from natural and salvaged materials. 100% off-grid. Cob construction. Mud bricks. Earthbags. Cordwood. Wattle and daub. Zero waste. In Hogsback.

And you run 10-day workshops teaching others how to do it. Foundations, structure, roofing, cob ovens, rocket stoves. Real skills. Real buildings.

This is literally what I need for my schools.

Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with one hectare of land, a house they built themselves, and skills to manufacture everything they need. The "house they built themselves" part? That's where you come in.

I don't want students building with expensive imported materials. I want them building with what's around them. Natural. Sustainable. Beautiful. Like what you've created at Terra-Khaya.

Would you read The Jeffy Manifesto and tell me if this is something you'd want to be part of? Even as advisors or curriculum consultants. Your building skills program is exactly what we need to teach the next generation.

You said: "We aim, through our methods of living and building, to be an example that conscious living and respect for Mother Earth is something mutually simple and rewarding." I want that to be the ethos of every Jeffy school.

Building with the earth,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Trevor Noah Foundation': {
    subject: "Trevor's favorite toy was a brick — Faranani builds schools",
    body: `Dear Foundation Team,

Trevor's favorite childhood toy was a brick. He couldn't afford real toys. His book "Born a Crime" captures what growing up in Soweto really looked like.

But what got my attention was the Faranani Infrastructure Project. Youth who are "not in employment, education or training" BUILD school infrastructure while receiving skills training, work experience, and career development.

They're not just learning. They're building. And what they build is a school for others.

That's exactly the philosophy behind what I'm creating. Jeffy Commerce funds free schools. Merit-only selection. Graduates leave with land, a house they built themselves, and skills to manufacture everything they need.

"Faranani" — working together. That's what I want for every Jeffy community. Students building the infrastructure, learning by doing, then helping the next generation.

Trevor said: "Kids of today are being told to be the leaders of tomorrow, but they're not given the tools. We tell people to follow their dreams, but you can only dream of what you can imagine."

Jeffy schools expand what kids can imagine. The Jeffy Manifesto is attached. If there's any alignment with the Foundation's work, I'd love to explore it.

Working together,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Thulani Madondo': {
    subject: "CNN Hero from Kliptown — what if we built 100 Kliptowns?",
    body: `Thulani,

CNN Hero. 17 years in Kliptown. 1,400+ children supported. You grew up in the poverty you're now fighting. That's not a story — that's credibility money can't buy.

I'm Tredoux from Jeffy Commerce. My family built a school for farm children in SA. Corruption destroyed it. I've spent years figuring out how to try again — corruption-proof this time.

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

  'James Urdang': {
    subject: "30 years of Education Africa — mentored by Sisulu, worked with Mandela",
    body: `James,

Mentored by Walter Sisulu. Worked with Mandela. Built Masibambane College. 30+ years creating educational opportunity in South Africa.

I'm Tredoux from Jeffy Commerce, and I need to learn from someone like you.

We're building:
• E-commerce platform where profits fund FREE schools
• Zone Partners for local delivery (50/50 profit split)
• Merit-based selection — graduates get land + skills + facilities
• Self-sufficient communities across SA

I've read about Education Africa's marimba programmes, your approach to holistic education, the practical skills focus. This is exactly what we want to build — but funded perpetually by commerce, not donations.

Would you give us 30 minutes? Your experience could save us years of mistakes.

With deep respect for your life's work,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'IkamvaYouth': {
    subject: "17 branches, 80-100% pass rates — what if we funded 50 branches?",
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

  'Nicolette Mashile': {
    subject: "No one is born bad at money — they're just never taught",
    body: `Hey Nicolette,

You said something once that hit me hard — no one is born bad at money. We're just never taught. Families living paycheck to paycheck aren't failing. They're repeating patterns nobody showed them how to break.

I know your story. Bushbuckridge. Boarding school where you couldn't speak English or Swazi. Depression diagnosis at 17. Dropping out of Rhodes. Your sister taking a loan so you could try again. That R125,000 lesson from an Offer to Purchase you didn't fully understand.

And now? Five investment properties. Millionaire. Coco the Money Bunny teaching kids. FSCA Consumer Advisory Panel. Every mistake turned into a lesson for millions.

Your vision is "a financially inclusive and economically viable South Africa where everyone can thrive." That's literally what I'm trying to build.

Jeffy Commerce gives Zone Partners 50% of profits — real money, not scraps. But that's just the start. The profits fund free schools where kids are selected on merit alone and graduate with land, a home, and skills to manufacture everything they need.

Imagine if those schools taught financial literacy from day one. If Coco's lessons were woven right into the curriculum. Kids who aren't just self-sufficient but financially capable too.

Not asking for anything today except your time. Read The Jeffy Manifesto. If it lines up with where you're headed, I'd love to chat.

You bought your first property to protect yourself from instant gratification. This is me doing the same thing — betting on something bigger than myself.

Thanks for reading,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Aisha Pandor': {
    subject: "30,000 jobs for women — let's create 30,000 more futures",
    body: `Aisha,

SweepSouth created 30,000+ jobs for women who needed them. You proved tech can be a force for inclusion, not just disruption.

I'm Tredoux from Jeffy Commerce. We're taking a similar approach to education:

• E-commerce platform with Zone Partners (50/50 profit split)
• ALL profits fund FREE merit-based schools
• Graduates get land, skills, production facilities
• Focus on creating self-sufficient communities

You understand building platforms that create opportunity at scale. That's exactly what we need guidance on.

Would you be open to a conversation? Specifically around:
• How you scaled SweepSouth's social impact
• Lessons learned in SA market
• Potential advisory relationship

15 minutes?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Boity Thulo': {
    subject: "#OwnYourThrone — help SA's next generation claim theirs",
    body: `Boity,

You dropped out due to fees. Then you built an empire — music, business, 6 million followers, Forbes 30 Under 30. #OwnYourThrone isn't just a brand — it's your story.

But how many talented South Africans never got to own anything because there was no throne to claim?

I'm Tredoux from Jeffy Commerce. We're building free schools funded by e-commerce profits:

• Zone Partners deliver locally (50/50 profit split)
• ALL profits build merit-based schools
• Graduates get 1 hectare land + skills + independence

You know what it's like to have financial barriers almost end your journey. Your story could inspire thousands to either become Zone Partners or support our mission.

One IG story. One tweet. One conversation.

What would it take?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Sizwe Dhlomo': {
    subject: "2.5M Twitter followers could build schools",
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

  'Dr Precious Moloi-Motsepe': {
    subject: "UCT Chancellor + R1.5B education commitment — aligned visions",
    body: `Dear Dr. Moloi-Motsepe,

As UCT Chancellor and CEO of the Motsepe Foundation, you sit at the intersection of tertiary excellence and primary/secondary access. You understand the full education pipeline.

I'm Tredoux Willemse, founder of Jeffy Commerce. We're building the funding mechanism for free schools:

• E-commerce profits fund merit-based FREE schools
• Graduates receive 1 hectare land + skills + facilities
• Self-sufficient communities producing food, tech, medicine

The Motsepe Foundation's R1.5 billion education commitment is transformative. Jeffy Commerce offers a self-sustaining complement: schools that fund themselves perpetually through commerce.

We would be honored to present our model to the Foundation team and explore potential alignment.

Respectfully,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },
};

// Default pitch for those without custom
const DEFAULT_PITCH = {
  subject: "Partnership Opportunity — Jeffy Commerce | Building Free Schools",
  body: `Hi [NAME],

I'm Tredoux Willemse, founder of Jeffy Commerce.

My family built a school once. For farm kids who walked 30km just to learn. Corruption killed it. I've spent years trying to figure out how to build something they can't destroy.

Here's what we're building:

Jeffy Commerce is a platform where Zone Partners — local entrepreneurs — own their territories and keep 50% of profits. Real ownership. Real money back in the community.

But that's just the engine. The profits build free schools where graduates walk away with land, a house they built, and skills to make anything they need. Selected on merit alone. No connections. No money. Just potential.

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
        <p className="text-gray-600 mt-1">Personalized letters with soul — not corporate templates</p>
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
            <p className="text-sm text-slate-300 mb-3">Highest-value targets</p>
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
            <p className="text-sm text-slate-300 mb-3">Education leaders & high-reach</p>
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
            <p className="text-sm text-slate-300 mb-3">Complete the outreach</p>
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
                    {hasPitch && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✨ Personal Letter</span>}
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
                    <h4 className="font-bold text-sm mb-2">📧 YOUR LETTER</h4>
                    <div className="bg-white border rounded-lg p-4 text-sm max-h-96 overflow-y-auto">
                      <p className="font-medium mb-2 text-orange-600">Subject: {pitch.subject}</p>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{pitch.body}</pre>
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
                          {copiedId === inf.id ? '✓ Copied!' : '📋 Copy Letter for LinkedIn/DM'}
                        </button>
                        {inf.phone && (
                          <a href={`https://wa.me/${inf.phone.replace(/[^0-9]/g, '')}`} target="_blank"
                            className="block w-full text-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
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
