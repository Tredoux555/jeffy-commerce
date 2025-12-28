'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Mail, Send, CheckCircle, Clock, MessageSquare, Calendar,
  UserPlus, Search, ExternalLink, Phone, Instagram,
  Youtube, Linkedin, Twitter, XCircle, Star, TrendingUp,
  Rocket, Copy, Check, ChevronDown, ChevronUp
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
  meeting_at: string | null;
  outcome: string | null;
  follow_up_date: string | null;
  notes: string | null;
}

// Personalized pitch letters for each influencer
const PERSONALIZED_PITCHES: Record<string, { subject: string; body: string }> = {
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
Founder, Jeffy Commerce`
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
Founder, Jeffy Commerce`
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
CIPC: 2025/950712/07`
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

  'Trevor Noah Foundation': {
    subject: "Trevor Noah Foundation + Jeffy Commerce = Education at Scale",
    body: `Dear Trevor Noah Foundation Team,

Trevor's commitment to South African youth education through the Foundation demonstrates that global success hasn't forgotten home.

I'm Tredoux Willemse, founder of Jeffy Commerce. We're building a self-sustaining model that could amplify the Foundation's impact:

Our model:
• E-commerce profits fund FREE merit-based schools
• Zone Partners provide local employment (50/50 profit sharing)
• Graduates receive 1 hectare land + skills + production means
• Self-sufficient communities that break poverty cycles permanently

The Trevor Noah Foundation provides crucial youth support. Jeffy Commerce provides the schools and life infrastructure those youth need long-term.

We're not seeking funding – we're seeking partnership with organizations that share our belief that South African children deserve world-class opportunities.

Would the Foundation team be open to a conversation about potential collaboration?

Respectfully,
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
Founder, Jeffy Commerce`
  },

  'Aisha Pandor': {
    subject: "30,000 Jobs Created - Let's Create 30,000 More Futures",
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
    subject: "#OwnYourThrone - Help SA's Next Generation Claim Theirs",
    body: `Boity,

You dropped out due to fees. Then you built an empire – music, business, 6 million followers, Forbes 30 Under 30. #OwnYourThrone isn't just a brand – it's your story.

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

  'IkamvaYouth (Joy Olivier)': {
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

  'Nicolette Mashile': {
    subject: "Financial Bunny + Free Schools = Financial Freedom at Scale",
    body: `Nicolette,

"Coco The Money Bunny" teaches kids about money. Your school workshops reach children when their financial habits are still forming. You understand that education IS financial freedom.

I'm Tredoux from Jeffy Commerce. We're building free schools where financial literacy won't just be a workshop – it'll be core curriculum.

Our model:
• E-commerce profits fund merit-based FREE schools
• Graduates get 1 hectare land + skills + production means
• Self-sufficient communities that understand money AND how to make it

What if Financial Bunny's curriculum was built into Jeffy Schools? What if every graduate understood compound interest before they turned 16?

Would you be interested in a conversation about curriculum partnership?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  },

  'Dr Precious Moloi-Motsepe': {
    subject: "UCT Chancellor + Jeffy Commerce = Education Ecosystem",
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
CIPC: 2025/950712/07`
  },

  'Terra-Khaya (Shane Eades)': {
    subject: "Off-Grid Schools for a Self-Sufficient Generation",
    body: `Shane,

Terra-Khaya proves that 100% off-grid living isn't just possible – it's beautiful. 38 acres of permaculture, natural building, and conscious community.

I'm Tredoux from Jeffy Commerce. We're building free schools, and we want them to be self-sufficient in every sense – including energy and food.

Our model:
• E-commerce profits fund FREE schools
• Graduates get 1 hectare land + skills
• Communities that produce food, tech, medicine, clothing

Here's where Terra-Khaya's wisdom matters:

We need schools that teach permaculture, natural building, renewable energy – not as theory but as practice. Your 38 acres are a living curriculum.

Would you consider being a consultant on sustainable school design? Or hosting student exchanges?

Worth a conversation?

Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za`
  }
};

// Default pitch for anyone without custom letter
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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  not_contacted: { label: 'Not Contacted', color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-4 h-4" /> },
  email_sent: { label: 'Email Sent', color: 'bg-blue-100 text-blue-700', icon: <Send className="w-4 h-4" /> },
  linkedin_sent: { label: 'LinkedIn Sent', color: 'bg-blue-100 text-blue-700', icon: <Linkedin className="w-4 h-4" /> },
  all_sent: { label: 'All Channels Sent', color: 'bg-purple-100 text-purple-700', icon: <Rocket className="w-4 h-4" /> },
  replied: { label: 'Replied! 🎉', color: 'bg-green-100 text-green-700', icon: <MessageSquare className="w-4 h-4" /> },
  meeting_scheduled: { label: 'Meeting Set', color: 'bg-purple-100 text-purple-700', icon: <Calendar className="w-4 h-4" /> },
  converted: { label: 'Partner! 🚀', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-4 h-4" /> },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
  no_response: { label: 'No Response', color: 'bg-orange-100 text-orange-700', icon: <Clock className="w-4 h-4" /> },
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="w-4 h-4 text-pink-500" />,
  YouTube: <Youtube className="w-4 h-4 text-red-500" />,
  LinkedIn: <Linkedin className="w-4 h-4 text-blue-600" />,
  Twitter: <Twitter className="w-4 h-4 text-sky-500" />,
};

export default function OutreachPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    const { data, error } = await supabase
      .from('influencers')
      .select(`*, outreach_contacts (*)`)
      .order('priority', { ascending: true })
      .order('followers', { ascending: false });
    
    if (data) setInfluencers(data);
    if (error) console.error('Error fetching:', error);
    setLoading(false);
  };

  const getLatestContact = (influencer: Influencer): OutreachContact | null => {
    if (!influencer.outreach_contacts?.length) return null;
    return influencer.outreach_contacts.sort((a, b) => 
      new Date(b.sent_at || 0).getTime() - new Date(a.sent_at || 0).getTime()
    )[0];
  };

  const getStatus = (influencer: Influencer): string => {
    return getLatestContact(influencer)?.status || 'not_contacted';
  };

  const updateStatus = async (influencerId: string, newStatus: string) => {
    const existing = influencers.find(i => i.id === influencerId);
    const contact = existing ? getLatestContact(existing) : null;

    if (contact) {
      await supabase.from('outreach_contacts').update({ 
        status: newStatus,
        ...(newStatus === 'email_sent' && !contact.sent_at ? { sent_at: new Date().toISOString() } : {}),
        ...(newStatus === 'replied' ? { replied_at: new Date().toISOString() } : {}),
      }).eq('id', contact.id);
    } else {
      await supabase.from('outreach_contacts').insert({
        influencer_id: influencerId,
        status: newStatus,
        sent_at: new Date().toISOString(),
      });
    }
    fetchInfluencers();
  };

  const getPitch = (influencer: Influencer) => {
    const custom = PERSONALIZED_PITCHES[influencer.name];
    if (custom) return custom;
    
    return {
      subject: DEFAULT_PITCH.subject,
      body: DEFAULT_PITCH.body.replace('[NAME]', influencer.name.split(' ')[0])
    };
  };

  const generateGmailLink = (influencer: Influencer) => {
    if (!influencer.email) return null;
    const pitch = getPitch(influencer);
    const subject = encodeURIComponent(pitch.subject);
    const body = encodeURIComponent(pitch.body);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${influencer.email}&su=${subject}&body=${body}`;
  };

  const generateLinkedInLink = (influencer: Influencer) => {
    if (!influencer.profile_url?.includes('linkedin')) return null;
    return influencer.profile_url;
  };

  const generateInstagramLink = (influencer: Influencer) => {
    if (!influencer.handle) return null;
    return `https://instagram.com/${influencer.handle}`;
  };

  const generateTwitterLink = (influencer: Influencer) => {
    if (!influencer.handle) return null;
    return `https://twitter.com/${influencer.handle}`;
  };

  const copyPitch = async (influencer: Influencer) => {
    const pitch = getPitch(influencer);
    await navigator.clipboard.writeText(`Subject: ${pitch.subject}\n\n${pitch.body}`);
    setCopiedId(influencer.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendAll = async (influencer: Influencer) => {
    const gmailLink = generateGmailLink(influencer);
    const linkedinLink = generateLinkedInLink(influencer);
    
    // Open Gmail if available
    if (gmailLink) {
      window.open(gmailLink, '_blank');
    }
    
    // Open LinkedIn after a delay
    if (linkedinLink) {
      setTimeout(() => window.open(linkedinLink, '_blank'), 500);
    }
    
    // Update status
    await updateStatus(influencer.id, gmailLink ? 'email_sent' : 'linkedin_sent');
  };

  // Stats
  const stats = {
    total: influencers.length,
    withEmail: influencers.filter(i => i.email).length,
    notContacted: influencers.filter(i => getStatus(i) === 'not_contacted').length,
    sent: influencers.filter(i => ['email_sent', 'linkedin_sent', 'all_sent'].includes(getStatus(i))).length,
    replied: influencers.filter(i => ['replied', 'meeting_scheduled', 'converted'].includes(getStatus(i))).length,
  };

  // Filtered
  const filtered = influencers.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === 'all' || i.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  // Group by priority
  const highPriority = filtered.filter(i => i.priority === 'high');
  const mediumPriority = filtered.filter(i => i.priority === 'medium');
  const lowPriority = filtered.filter(i => i.priority === 'low');

  if (loading) return <div className="p-8 text-center">Loading outreach data...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-7 h-7 text-orange-500" />
            Influencer Outreach Command Center
          </h1>
          <p className="text-gray-600">Personalized pitches ready to send • One-click multi-platform outreach</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <p className="text-sm text-gray-500">Total Contacts</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-green-200">
          <p className="text-sm text-green-600">With Email</p>
          <p className="text-2xl font-bold text-green-600">{stats.withEmail}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <p className="text-sm text-gray-500">Not Contacted</p>
          <p className="text-2xl font-bold text-gray-600">{stats.notContacted}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
          <p className="text-sm text-blue-600">Outreach Sent</p>
          <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
          <p className="text-sm text-emerald-600">Replied/Meeting</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.replied}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search influencers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Priorities</option>
          <option value="high">🔥 High Priority</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Priority Sections */}
      {highPriority.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="text-2xl">🔥</span> High Priority - Direct Mission Alignment
          </h2>
          <div className="space-y-3">
            {highPriority.map((influencer) => (
              <InfluencerCard 
                key={influencer.id}
                influencer={influencer}
                status={getStatus(influencer)}
                expanded={expandedId === influencer.id}
                onToggle={() => setExpandedId(expandedId === influencer.id ? null : influencer.id)}
                onSendAll={() => sendAll(influencer)}
                onCopyPitch={() => copyPitch(influencer)}
                onStatusChange={(status) => updateStatus(influencer.id, status)}
                copied={copiedId === influencer.id}
                pitch={getPitch(influencer)}
                gmailLink={generateGmailLink(influencer)}
                linkedinLink={generateLinkedInLink(influencer)}
                instagramLink={generateInstagramLink(influencer)}
                twitterLink={generateTwitterLink(influencer)}
              />
            ))}
          </div>
        </div>
      )}

      {mediumPriority.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="text-2xl">⭐</span> Medium Priority - High Reach
          </h2>
          <div className="space-y-3">
            {mediumPriority.map((influencer) => (
              <InfluencerCard 
                key={influencer.id}
                influencer={influencer}
                status={getStatus(influencer)}
                expanded={expandedId === influencer.id}
                onToggle={() => setExpandedId(expandedId === influencer.id ? null : influencer.id)}
                onSendAll={() => sendAll(influencer)}
                onCopyPitch={() => copyPitch(influencer)}
                onStatusChange={(status) => updateStatus(influencer.id, status)}
                copied={copiedId === influencer.id}
                pitch={getPitch(influencer)}
                gmailLink={generateGmailLink(influencer)}
                linkedinLink={generateLinkedInLink(influencer)}
                instagramLink={generateInstagramLink(influencer)}
                twitterLink={generateTwitterLink(influencer)}
              />
            ))}
          </div>
        </div>
      )}

      {lowPriority.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Long Shots - Worth Trying
          </h2>
          <div className="space-y-3">
            {lowPriority.map((influencer) => (
              <InfluencerCard 
                key={influencer.id}
                influencer={influencer}
                status={getStatus(influencer)}
                expanded={expandedId === influencer.id}
                onToggle={() => setExpandedId(expandedId === influencer.id ? null : influencer.id)}
                onSendAll={() => sendAll(influencer)}
                onCopyPitch={() => copyPitch(influencer)}
                onStatusChange={(status) => updateStatus(influencer.id, status)}
                copied={copiedId === influencer.id}
                pitch={getPitch(influencer)}
                gmailLink={generateGmailLink(influencer)}
                linkedinLink={generateLinkedInLink(influencer)}
                instagramLink={generateInstagramLink(influencer)}
                twitterLink={generateTwitterLink(influencer)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// Influencer Card Component
function InfluencerCard({
  influencer,
  status,
  expanded,
  onToggle,
  onSendAll,
  onCopyPitch,
  onStatusChange,
  copied,
  pitch,
  gmailLink,
  linkedinLink,
  instagramLink,
  twitterLink,
}: {
  influencer: Influencer;
  status: string;
  expanded: boolean;
  onToggle: () => void;
  onSendAll: () => void;
  onCopyPitch: () => void;
  onStatusChange: (status: string) => void;
  copied: boolean;
  pitch: { subject: string; body: string };
  gmailLink: string | null;
  linkedinLink: string | null;
  instagramLink: string | null;
  twitterLink: string | null;
}) {
  const statusConfig = STATUS_CONFIG[status];
  const hasEmail = !!influencer.email;
  const hasCustomPitch = !!PERSONALIZED_PITCHES[influencer.name];

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      {/* Main Row */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Priority Bar */}
          <div className={`w-1.5 h-16 rounded-full ${
            influencer.priority === 'high' ? 'bg-red-500' :
            influencer.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-300'
          }`} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg">{influencer.name}</h3>
              {hasCustomPitch && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  ✨ Custom Pitch
                </span>
              )}
              {PLATFORM_ICONS[influencer.platform || '']}
              {influencer.handle && (
                <span className="text-sm text-gray-500">@{influencer.handle}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">{influencer.category}</span>
              {influencer.followers && (
                <span className="font-medium">
                  {influencer.followers >= 1000000 
                    ? `${(influencer.followers / 1000000).toFixed(1)}M` 
                    : `${(influencer.followers / 1000).toFixed(0)}K`} followers
                </span>
              )}
              {influencer.email && (
                <span className="text-green-600">📧 {influencer.email}</span>
              )}
              {influencer.phone && (
                <span className="text-blue-600">📱 {influencer.phone}</span>
              )}
            </div>
            {influencer.notes && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{influencer.notes}</p>
            )}
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.color}`}>
            {statusConfig.icon}
            <span className="text-sm font-medium whitespace-nowrap">{statusConfig.label}</span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* One-Click Send All */}
            {status === 'not_contacted' && hasEmail && (
              <button
                onClick={onSendAll}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 font-medium shadow-lg"
              >
                <Rocket className="w-4 h-4" />
                Send All
              </button>
            )}

            {/* Individual Platform Buttons */}
            {gmailLink && (
              <a
                href={gmailLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onStatusChange('email_sent')}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                title="Send Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            )}

            {linkedinLink && (
              <a
                href={linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                title="Open LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}

            {instagramLink && (
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200"
                title="Open Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}

            {twitterLink && influencer.platform === 'Twitter' && (
              <a
                href={twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200"
                title="Open Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}

            {/* Copy Pitch */}
            <button
              onClick={onCopyPitch}
              className={`p-2 rounded-lg transition-colors ${
                copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Copy pitch to clipboard"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>

            {/* Status Dropdown */}
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-2 py-2 border rounded-lg text-sm bg-white"
            >
              {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Expand */}
            <button
              onClick={onToggle}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Pitch Preview */}
      {expanded && (
        <div className="border-t px-4 py-4 bg-gray-50">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pitch Preview */}
            <div>
              <h4 className="font-medium text-sm text-gray-500 mb-2">📧 PERSONALIZED PITCH</h4>
              <div className="bg-white border rounded-lg p-4 text-sm">
                <p className="font-medium text-gray-900 mb-2">Subject: {pitch.subject}</p>
                <div className="text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto text-xs leading-relaxed">
                  {pitch.body}
                </div>
              </div>
            </div>

            {/* Contact Info & Actions */}
            <div>
              <h4 className="font-medium text-sm text-gray-500 mb-2">📞 CONTACT INFO</h4>
              <div className="bg-white border rounded-lg p-4 space-y-2 text-sm">
                {influencer.email && (
                  <p><span className="text-gray-500">Email:</span> <a href={`mailto:${influencer.email}`} className="text-blue-600 hover:underline">{influencer.email}</a></p>
                )}
                {influencer.phone && (
                  <p><span className="text-gray-500">Phone:</span> <a href={`tel:${influencer.phone}`} className="text-blue-600 hover:underline">{influencer.phone}</a></p>
                )}
                {influencer.profile_url && (
                  <p><span className="text-gray-500">Profile:</span> <a href={influencer.profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{influencer.profile_url}</a></p>
                )}
                {influencer.handle && (
                  <p><span className="text-gray-500">Handle:</span> @{influencer.handle}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                {gmailLink && (
                  <a
                    href={gmailLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onStatusChange('email_sent')}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Mail className="w-4 h-4" />
                    Open in Gmail (Ready to Send)
                  </a>
                )}
                
                <button
                  onClick={onCopyPitch}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Pitch for LinkedIn/DM'}
                </button>

                {influencer.phone && (
                  <a
                    href={`https://wa.me/${influencer.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
