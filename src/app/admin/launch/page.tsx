'use client';

import { useState, useEffect } from 'react';
import { 
  Rocket, Target, Users, Share2, CheckCircle, Clock, 
  TrendingUp, Facebook, MessageCircle, Video, Mail,
  ExternalLink, Copy, Check, AlertCircle, Zap, DollarSign,
  RefreshCw, Plus, Trash2
} from 'lucide-react';
import Link from 'next/link';

interface SeedWant {
  id: string;
  product_name: string;
  china_price: string;
  sa_price: string;
  markup: string;
  verified_count: number;
  status: string;
  share_link: string;
  category: string;
}

interface LaunchTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'done';
  platform: 'facebook' | 'whatsapp' | 'tiktok' | 'manual' | 'system';
  day: number;
}

const SEED_PRODUCTS = [
  {
    product_name: "Archery Thumb-Button Release Aid (4-Finger)",
    description: "Professional compound bow release aid with 4-finger grip and adjustable trigger. CNC machined aluminum. Same quality as Carter/TruFire releases.",
    category: "Sports",
    china_price: "R132",
    china_price_rmb: "¥55",
    sa_price: "R5,860",
    markup: "44x",
    factory: "SPG Archery (河南隼牌体育器材)",
    image_search: "compound bow thumb release aid 4 finger"
  },
  {
    product_name: "Junxing M128 Compound Bow (30-70lbs)",
    description: "340 FPS hunting compound bow with 7075 aluminum riser. Adjustable 30-70lb draw weight. Complete with accessories.",
    category: "Sports",
    china_price: "R3,312",
    china_price_rmb: "¥1,380",
    sa_price: "R5,500",
    markup: "1.7x",
    factory: "Linyi Junxing Sports (临沂军兴运动器材)",
    image_search: "junxing m128 compound bow"
  },
  {
    product_name: "5-Pin Bow Sight with 6x Magnifier Lens",
    description: "CNC aluminum bow sight with fiber optic pins and 6x magnification lens. Micro-adjustable windage and elevation.",
    category: "Sports",
    china_price: "R528",
    china_price_rmb: "¥220",
    sa_price: "R10,317",
    markup: "20x",
    factory: "SPG Archery / Topoint Archery",
    image_search: "compound bow sight magnifier lens 5 pin"
  },
  {
    product_name: "TWS Bluetooth Earbuds with Charging Case",
    description: "Wireless Bluetooth 5.0 earbuds with touch controls, 24hr battery life with case. Same factory as 'branded' versions.",
    category: "Electronics",
    china_price: "R24",
    china_price_rmb: "¥10",
    sa_price: "R249",
    markup: "10x",
    factory: "Shenzhen Electronics (深圳市淘音科技)",
    image_search: "tws bluetooth earbuds charging case"
  },
  {
    product_name: "5M RGB LED Strip Lights with Remote",
    description: "5 meter RGB LED strip with 44-key remote, 16 colors, multiple modes. Self-adhesive backing. 12V power adapter included.",
    category: "Home",
    china_price: "R43",
    china_price_rmb: "¥18",
    sa_price: "R249",
    markup: "6x",
    factory: "Shenzhen Lighting (深圳市鼎阳照明)",
    image_search: "rgb led strip lights 5m remote"
  }
];

const LAUNCH_TASKS: LaunchTask[] = [
  // Day 1-2
  { id: '1', title: 'Create 5 seed wants', description: 'Products with offensive markup from 1688 research', status: 'pending', platform: 'system', day: 1 },
  { id: '2', title: 'Verify all wants show correctly', description: 'Check /wants page and admin dashboard', status: 'pending', platform: 'system', day: 1 },
  
  // Day 3 - Facebook raids
  { id: '3', title: 'Post in SA Buy & Sell (Release Aid)', description: 'Use "I need to vent" template - R132 vs R5,860', status: 'pending', platform: 'facebook', day: 3 },
  { id: '4', title: 'Post in Archery SA group (Bow Sight)', description: 'R528 vs R10,317 - target archers specifically', status: 'pending', platform: 'facebook', day: 3 },
  { id: '5', title: 'Post in Bargain Hunters SA (Earbuds)', description: 'R24 vs R249 - mass appeal product', status: 'pending', platform: 'facebook', day: 3 },
  
  // Day 4-5 - WhatsApp
  { id: '6', title: 'WhatsApp status - Earbuds price reveal', description: 'Share status, ask 3-5 people to repost', status: 'pending', platform: 'whatsapp', day: 4 },
  { id: '7', title: 'Direct message 10 friends', description: 'Personal asks with specific want links', status: 'pending', platform: 'whatsapp', day: 5 },
  
  // Day 6-7 - TikTok
  { id: '8', title: 'Record TikTok: SA pricing scam', description: '"South Africans are getting scammed" - show receipts', status: 'pending', platform: 'tiktok', day: 6 },
  
  // Week 2
  { id: '9', title: 'Push wants close to 10', description: '"Almost there" posts for any want at 5+ verifications', status: 'pending', platform: 'facebook', day: 8 },
  { id: '10', title: 'Activate first Zone Partner', description: 'Pick one from 28 letters who gets the mission', status: 'pending', platform: 'manual', day: 10 },
];

export default function LaunchPage() {
  const [seedWants, setSeedWants] = useState<SeedWant[]>([]);
  const [tasks, setTasks] = useState<LaunchTask[]>(LAUNCH_TASKS);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSeedWants();
    loadTaskStatus();
  }, []);

  const loadSeedWants = async () => {
    try {
      const res = await fetch('/api/admin/launch/seed-wants');
      const data = await res.json();
      if (data.wants) {
        setSeedWants(data.wants);
      }
    } catch (err) {
      console.error('Failed to load seed wants:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskStatus = () => {
    const stored = localStorage.getItem('jeffy_launch_tasks');
    if (stored) {
      const savedStatuses = JSON.parse(stored);
      setTasks(prev => prev.map(task => ({
        ...task,
        status: savedStatuses[task.id] || task.status
      })));
    }
  };

  const saveTaskStatus = (taskId: string, status: LaunchTask['status']) => {
    const stored = localStorage.getItem('jeffy_launch_tasks');
    const statuses = stored ? JSON.parse(stored) : {};
    statuses[taskId] = status;
    localStorage.setItem('jeffy_launch_tasks', JSON.stringify(statuses));
  };

  const createSeedWants = async () => {
    setSeeding(true);
    setError(null);
    
    try {
      const res = await fetch('/api/admin/launch/seed-wants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: SEED_PRODUCTS })
      });
      
      const data = await res.json();
      
      if (data.success) {
        await loadSeedWants();
        // Mark first task as done
        updateTaskStatus('1', 'done');
      } else {
        setError(data.error || 'Failed to create seed wants');
      }
    } catch (err) {
      setError('Network error creating seed wants');
    } finally {
      setSeeding(false);
    }
  };

  const updateTaskStatus = (taskId: string, status: LaunchTask['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
    saveTaskStatus(taskId, status);
  };

  const copyShareLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlatformIcon = (platform: LaunchTask['platform']) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-400" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4 text-green-400" />;
      case 'tiktok': return <Video className="w-4 h-4 text-pink-400" />;
      case 'system': return <Zap className="w-4 h-4 text-yellow-400" />;
      default: return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalVerifications = seedWants.reduce((sum, w) => sum + w.verified_count, 0);
  const wantsAtTarget = seedWants.filter(w => w.verified_count >= 10).length;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Rocket className="w-8 h-8 text-orange-500" />
              Guerrilla Launch
            </h1>
            <p className="text-gray-400 mt-1">R0 budget. Maximum outrage. Light the fires.</p>
          </div>
          <Link href="/admin" className="text-gray-400 hover:text-white">
            ← Back to Admin
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm">Seed Wants</span>
            </div>
            <div className="text-2xl font-bold">{seedWants.length}/5</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Total Verifications</span>
            </div>
            <div className="text-2xl font-bold">{totalVerifications}</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Wants at 10+</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{wantsAtTarget}/5</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Tasks Done</span>
            </div>
            <div className="text-2xl font-bold">{completedTasks}/{tasks.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Seed Wants */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Seed Wants
              </h2>
              {seedWants.length === 0 && (
                <button
                  onClick={createSeedWants}
                  disabled={seeding}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {seeding ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create 5 Seed Wants
                    </>
                  )}
                </button>
              )}
              {seedWants.length > 0 && (
                <button
                  onClick={loadSeedWants}
                  className="p-2 hover:bg-zinc-800 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : seedWants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No seed wants created yet.</p>
                <p className="text-sm text-gray-500">Click "Create 5 Seed Wants" to populate with researched products.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {seedWants.map((want) => (
                  <div key={want.id} className="p-4 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{want.product_name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="text-green-400">{want.china_price}</span>
                          <span className="text-gray-500">→</span>
                          <span className="text-red-400">{want.sa_price}</span>
                          <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">
                            {want.markup} markup
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{want.verified_count}/10</div>
                        <div className="text-xs text-gray-400">verified</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => copyShareLink(want.share_link, want.id)}
                        className="flex-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-xs flex items-center justify-center gap-1"
                      >
                        {copiedId === want.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Link
                          </>
                        )}
                      </button>
                      <a
                        href={want.share_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-xs flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Price Comparison Quick Reference */}
            <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg">
              <h3 className="text-sm font-medium mb-2 text-gray-300">Quick Markup Reference</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Release Aid</span>
                  <span className="text-red-400 font-mono">R132 → R5,860 (44x)</span>
                </div>
                <div className="flex justify-between">
                  <span>Bow Sight</span>
                  <span className="text-red-400 font-mono">R528 → R10,317 (20x)</span>
                </div>
                <div className="flex justify-between">
                  <span>TWS Earbuds</span>
                  <span className="text-orange-400 font-mono">R24 → R249 (10x)</span>
                </div>
                <div className="flex justify-between">
                  <span>LED Strips</span>
                  <span className="text-yellow-400 font-mono">R43 → R249 (6x)</span>
                </div>
                <div className="flex justify-between">
                  <span>M128 Bow</span>
                  <span className="text-gray-400 font-mono">R3,312 → R5,500 (1.7x)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Launch Tasks */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Launch Checklist
            </h2>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className={`p-3 rounded-lg border transition-all ${
                    task.status === 'done' 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : task.status === 'in_progress'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-zinc-800/50 border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        const nextStatus = task.status === 'pending' ? 'in_progress' 
                          : task.status === 'in_progress' ? 'done' 
                          : 'pending';
                        updateTaskStatus(task.id, nextStatus);
                      }}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        task.status === 'done' 
                          ? 'bg-green-500 border-green-500' 
                          : task.status === 'in_progress'
                          ? 'border-yellow-500'
                          : 'border-zinc-600'
                      }`}
                    >
                      {task.status === 'done' && <Check className="w-3 h-3" />}
                      {task.status === 'in_progress' && <Clock className="w-3 h-3 text-yellow-500" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(task.platform)}
                        <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">Day {task.day}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Post Templates */}
        <div className="mt-6 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-blue-500" />
            Ready-to-Post Templates
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {/* Facebook Template */}
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Facebook className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Facebook Groups</span>
              </div>
              <div className="text-xs text-gray-300 bg-zinc-900 p-3 rounded font-mono whitespace-pre-wrap">
{`I need to vent.

I just found out [PRODUCT] costs R[CHINA] in China.

We pay R[SA].

That's [X]x markup. For the exact same thing.

I found a way to fight back — but I need 9 other people who want this too.

[LINK]

If 10 of us agree, they source it direct. No middleman.

Who's in?`}
              </div>
            </div>

            {/* WhatsApp Template */}
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">WhatsApp Status</span>
              </div>
              <div className="text-xs text-gray-300 bg-zinc-900 p-3 rounded font-mono whitespace-pre-wrap">
{`Quick question SA:

Would you pay R[CHINA] for [PRODUCT] if you could get 9 friends to agree?

Because that's the actual China price. We pay R[SA].

I'm trying something: [LINK]

10 people agree → they source it direct.

Tag someone who needs to see this.`}
              </div>
            </div>

            {/* TikTok Template */}
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-medium">TikTok Script</span>
              </div>
              <div className="text-xs text-gray-300 bg-zinc-900 p-3 rounded font-mono whitespace-pre-wrap">
{`[Hold up product/show screenshot]

"South Africans are getting scammed and nobody's talking about it."

[Show 1688 listing with price]

"This costs R[CHINA] in China."

[Show SA price]

"We pay R[SA]."

[Pause]

"I found a way to fix this. But I need 9 people who are tired of being ripped off."

[Show jeffy.co.za]

"Link in bio."`}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex gap-4">
          <Link 
            href="/wants" 
            className="flex-1 p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-orange-500" />
              <div>
                <div className="font-medium">View Public Wants</div>
                <div className="text-sm text-gray-400">See how it looks to users</div>
              </div>
            </div>
          </Link>
          <Link 
            href="/admin/wants" 
            className="flex-1 p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-500" />
              <div>
                <div className="font-medium">Admin Wants</div>
                <div className="text-sm text-gray-400">Manage and verify</div>
              </div>
            </div>
          </Link>
          <a 
            href="/GUERRILLA_LAUNCH_PLAN.md" 
            target="_blank"
            className="flex-1 p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Rocket className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium">Full Strategy Doc</div>
                <div className="text-sm text-gray-400">Complete guerrilla plan</div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
