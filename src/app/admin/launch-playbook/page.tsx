'use client';

import { useState } from 'react';
import { 
  Rocket, 
  Target, 
  Share2, 
  CheckCircle2, 
  Circle,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Flame,
  Users,
  MessageSquare,
  Video
} from 'lucide-react';

// Seed wants data
const seedWants = [
  {
    id: 1,
    name: 'Archery Release Aid',
    chinaPrice: 'R84-132',
    saPrice: 'R1,500-2,000',
    markup: '18-24x',
    link1688: 'https://m.1688.com/jiage/-B8B4BACFB9ADC8F6B7C5C6F7.html',
    factoryLink: 'https://www.1688.com/store/1A60DBC2EC22BACA742592E89FFBA8AC.html',
    factory: 'Topoint (顶点户外)',
    postCopy: "I paid R1,800 for a release aid. Factory price in China? R90. That's a 20x markup. Who else wants one at the real price?",
    category: 'archery'
  },
  {
    id: 2,
    name: 'Junxing M128 Compound Bow',
    chinaPrice: 'R3,312',
    saPrice: 'R5,500-8,000',
    markup: '1.7-2.4x',
    link1688: 'https://m.1688.com/huo/detail-627561875910.html',
    factoryLink: 'https://m.1688.com/huo/detail-627561875910.html',
    factory: 'Junxing (军兴)',
    postCopy: "The Junxing M128 - 340 fps, 30-70 lbs adjustable. Factory price: R3,300. Similar spec bows in SA: R6,000+. Who's in?",
    category: 'archery'
  },
  {
    id: 3,
    name: 'Bow Sight with Lens (2-Pin)',
    chinaPrice: 'R144-528',
    saPrice: 'R10,317',
    markup: '7-30x',
    link1688: 'https://www.1688.com/huo/b-B7B4C7FAB9ADC3E9D7BCC6F7.html',
    factoryLink: 'https://www.1688.com/store/1A60DBC2EC22BACA742592E89FFBA8AC.html',
    factory: 'Topoint (顶点户外)',
    postCopy: "A Spot Hogg Fast Eddie sight costs R10,000+ in SA. Chinese equivalent with lens? R500. Same function, 1/20th the price. 9 more people needed.",
    category: 'archery'
  },
  {
    id: 4,
    name: 'Lensed Peep Sight (Clarifier)',
    chinaPrice: 'R24-60',
    saPrice: 'R690-2,500',
    markup: '14-40x',
    link1688: 'https://www.1688.com/store/1A60DBC2EC22BACA742592E89FFBA8AC.html',
    factoryLink: 'https://www.1688.com/store/1A60DBC2EC22BACA742592E89FFBA8AC.html',
    factory: 'Topoint (顶点户外)',
    postCopy: "Clarifier peep sight in SA: R800+. Factory price: R50. That's 16x markup for a tiny piece of aluminum and glass. Who wants one?",
    category: 'archery'
  },
  {
    id: 5,
    name: 'TWS Bluetooth Earbuds',
    chinaPrice: 'R19-36',
    saPrice: 'R199-299',
    markup: '8-12x',
    link1688: 'https://www.1688.com/xunjia/-8cc8bwkd.html',
    factoryLink: 'https://www.1688.com/xunjia/-8cc8bwkd.html',
    factory: 'Shenzhen Electronics',
    postCopy: "Those R250 earbuds at Clicks? R24 from the same Chinese factory. Not a typo. 10x markup because... branding? Get 9 friends, we source direct.",
    category: 'mass'
  },
  {
    id: 6,
    name: '5M RGB LED Strip Lights',
    chinaPrice: 'R36-60',
    saPrice: 'R185-299',
    markup: '5-8x',
    link1688: 'https://s.1688.com/kq/-726762B5C6B4F8.html',
    factoryLink: 'https://s.1688.com/kq/-726762B5C6B4F8.html',
    factory: 'Shenzhen/Zhongshan Lighting',
    postCopy: "LED strip lights: R250 at Game. R40 from the factory. Same product. Same box. 6x markup. Who's decorating their room for less?",
    category: 'mass'
  }
];

// Launch checklist
const launchChecklist = [
  { id: 'w1d1', week: 1, day: '1-2', task: 'Create 5-6 seed wants on jeffy.co.za', category: 'setup' },
  { id: 'w1d2', week: 1, day: '3', task: 'Post in 3-5 SA Facebook buy/sell groups', category: 'facebook' },
  { id: 'w1d3', week: 1, day: '4', task: 'WhatsApp status chain (ask 3-5 people to repost)', category: 'whatsapp' },
  { id: 'w1d4', week: 1, day: '5-6', task: 'First TikTok/Reel: "SA pricing scam"', category: 'tiktok' },
  { id: 'w1d5', week: 1, day: '7', task: 'Monitor & engage with all comments', category: 'engage' },
  { id: 'w2d1', week: 2, day: '1-3', task: 'Push wants close to 10 verifications', category: 'push' },
  { id: 'w2d2', week: 2, day: '4-5', task: 'Activate first Zone Partner', category: 'partner' },
  { id: 'w2d3', week: 2, day: '6-7', task: 'Double down on what\'s working', category: 'scale' },
];

// Post templates
const postTemplates = {
  rant: `I need to vent.

I just found out [PRODUCT] costs R[CHINA PRICE] in China.

We pay R[SA PRICE].

That's [X]x markup. For the exact same thing.

I found a way to fight back — but I need 9 other people who want this too.

[LINK]

If 10 of us agree, they source it direct. No middleman.

Who's in?`,

  question: `Serious question: If you could get [PRODUCT] for R[CHINA PRICE] instead of R[SA PRICE], would you?

Catch: You need 9 other people to agree.

[LINK]`,

  discovery: `Just discovered something that made me angry.

[Screenshot of SA price vs China price]

We're being played.

Found a site where if 10 people agree they want something, they source it direct from China.

Testing it with [PRODUCT]: [LINK]`,

  whatsapp: `Hey, random question — would you want a [PRODUCT] if it was R[CHINA PRICE] instead of R[SA PRICE]?

I'm trying this thing where if 10 people agree, they source it from China direct.

Mind clicking this and verifying? Just needs your email: [LINK]`,

  almostThere: `UPDATE: [PRODUCT] want is at [X]/10

[REMAINING] more people and we actually source this.

Who wants [PRODUCT] at R[CHINA PRICE] instead of R[SA PRICE]?

[LINK]`,

  tiktokHooks: [
    "POV: You just found out how much South Africans overpay",
    "The South African pricing scam nobody talks about",
    "I need 9 people who are tired of paying markup",
    "What R1000 gets you in SA vs China",
    "This is why I stopped buying from [store]"
  ]
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button
      onClick={handleCopy}
      className="p-2 hover:bg-gray-100 rounded transition"
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
    </button>
  );
}

function SeedWantCard({ want }: { want: typeof seedWants[0] }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{want.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded ${
              want.category === 'archery' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {want.category === 'archery' ? '🏹 Archery' : '📱 Mass Appeal'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{want.factory}</p>
        </div>
        <div className="text-right">
          <div className="text-red-600 font-bold text-lg">{want.markup}</div>
          <div className="text-xs text-gray-500">markup</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <div className="text-gray-500">China Factory</div>
          <div className="font-semibold text-green-600">{want.chinaPrice}</div>
        </div>
        <div>
          <div className="text-gray-500">SA Retail</div>
          <div className="font-semibold text-red-600">{want.saPrice}</div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <a
          href={want.link1688}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 transition"
        >
          <ExternalLink className="h-4 w-4" />
          1688 Product
        </a>
        <a
          href={want.factoryLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition"
        >
          <ExternalLink className="h-4 w-4" />
          Factory Store
        </a>
      </div>
      
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-3 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {expanded ? 'Hide post copy' : 'Show post copy'}
      </button>
      
      {expanded && (
        <div className="mt-3 p-3 bg-gray-50 rounded text-sm relative">
          <CopyButton text={want.postCopy} />
          <p className="pr-10">{want.postCopy}</p>
        </div>
      )}
    </div>
  );
}

function PostTemplate({ title, template, icon: Icon }: { title: string; template: string; icon: any }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <CopyButton text={template} />
      </div>
      <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded">
        {template}
      </pre>
    </div>
  );
}

export default function LaunchPlaybookPage() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'wants' | 'templates' | 'checklist'>('overview');
  
  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };
  
  const progress = Math.round((completedTasks.length / launchChecklist.length) * 100);
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-7 w-7 text-jeffy-orange" />
            Launch Playbook
          </h1>
          <p className="text-gray-500 mt-1">R0 Budget Guerrilla Launch Strategy</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-jeffy-orange">{progress}%</div>
          <div className="text-sm text-gray-500">Complete</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-3 mb-6">
        <div 
          className="bg-jeffy-orange h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'overview', label: 'Overview', icon: Target },
          { id: 'wants', label: 'Seed Wants', icon: Flame },
          { id: 'templates', label: 'Post Templates', icon: MessageSquare },
          { id: 'checklist', label: 'Checklist', icon: CheckCircle2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
              activeTab === tab.id
                ? 'border-jeffy-orange text-jeffy-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* The Mindset */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">The Mindset</h2>
            <p className="text-lg opacity-90">
              You're not selling a product. You're starting a revolt against markup.
            </p>
            <p className="mt-2 opacity-80">
              Every South African knows they're getting ripped off. They just feel powerless. 
              Jeffy gives them a weapon — but only if they bring friends.
            </p>
            <p className="mt-4 font-semibold">
              Your job: Create outrage. Point to Jeffy. Get out of the way.
            </p>
          </div>
          
          {/* Week Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-sm">Week 1</span>
                Seed the Fire
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">→</span>
                  Create 5-6 seed wants with offensive markups
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">→</span>
                  Raid SA Facebook buy/sell groups
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">→</span>
                  WhatsApp status chain
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">→</span>
                  First TikTok/Reel
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">Week 2</span>
                Fan the Flames
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">→</span>
                  Push wants close to 10 verifications
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">→</span>
                  "Almost there" urgency posts
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">→</span>
                  Activate first Zone Partner
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">→</span>
                  Double down on what's working
                </li>
              </ul>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-bold text-lg mb-4">Success Metrics</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-800">5</div>
                <div className="text-sm text-gray-500">Wants hit 10 verifications</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">1</div>
                <div className="text-sm text-gray-500">Zone Partner activated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">R0</div>
                <div className="text-sm text-gray-500">Ad spend</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'wants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500">
              Products with offensive markup — ready to create as wants
            </p>
            <a
              href="/wants"
              target="_blank"
              className="flex items-center gap-1 text-jeffy-orange hover:underline"
            >
              Open Wants Page <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {seedWants.map(want => (
              <SeedWantCard key={want.id} want={want} />
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <PostTemplate 
            title="The Rant (Facebook)" 
            template={postTemplates.rant}
            icon={Flame}
          />
          <PostTemplate 
            title="The Question (Facebook)" 
            template={postTemplates.question}
            icon={MessageSquare}
          />
          <PostTemplate 
            title="The Discovery (Facebook)" 
            template={postTemplates.discovery}
            icon={Target}
          />
          <PostTemplate 
            title="WhatsApp Direct Message" 
            template={postTemplates.whatsapp}
            icon={Share2}
          />
          <PostTemplate 
            title="Almost There Push" 
            template={postTemplates.almostThere}
            icon={Users}
          />
          
          {/* TikTok Hooks */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold">TikTok/Reel Hooks</h3>
            </div>
            <ul className="space-y-2">
              {postTemplates.tiktokHooks.map((hook, i) => (
                <li key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">"{hook}"</span>
                  <CopyButton text={hook} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {activeTab === 'checklist' && (
        <div className="bg-white rounded-lg border">
          {launchChecklist.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 ${i !== 0 ? 'border-t' : ''}`}
            >
              <button
                onClick={() => toggleTask(item.id)}
                className="flex-shrink-0"
              >
                {completedTasks.includes(item.id) ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
              </button>
              <div className="flex-1">
                <p className={completedTasks.includes(item.id) ? 'line-through text-gray-400' : ''}>
                  {item.task}
                </p>
                <p className="text-sm text-gray-500">
                  Week {item.week}, Day {item.day}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                item.category === 'facebook' ? 'bg-blue-100 text-blue-700' :
                item.category === 'whatsapp' ? 'bg-green-100 text-green-700' :
                item.category === 'tiktok' ? 'bg-pink-100 text-pink-700' :
                item.category === 'setup' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {item.category}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
