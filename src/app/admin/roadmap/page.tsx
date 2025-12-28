'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle, Circle, Rocket, Calendar, 
  Code, Briefcase, AlertTriangle, TrendingUp
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'business' | 'technical';
  priority: 'critical' | 'high' | 'medium';
  estimatedHours?: number;
  link?: string;
  blockedReason?: string;
}

interface Phase {
  id: string;
  name: string;
  icon: any;
  color: string;
  dateRange: string;
  description: string;
  tasks: Task[];
}

const PHASES: Phase[] = [
  {
    id: 'pre-launch',
    name: 'Pre-Launch (January)',
    icon: Calendar,
    color: 'blue',
    dateRange: '1 Jan - 31 Jan 2026',
    description: 'Foundation work while waiting for business registration',
    tasks: [
      { id: 'biz-reg', title: 'Complete Business Registration', description: 'CIPC registration, tax number, bank account setup', type: 'business', priority: 'critical', blockedReason: 'Agents return Jan 11' },
      { id: 'payfast-merchant', title: 'Apply for PayFast Merchant Account', description: 'Need business registration first. Apply immediately when ready.', type: 'business', priority: 'critical', link: 'https://www.payfast.co.za/registration' },
      { id: 'first-products', title: 'Source 3 Launch Products', description: 'Steel plates, stainless mugs, magnetic knife holder. Order samples.', type: 'business', priority: 'critical' },
      { id: 'mvelo-feedback', title: 'Get Feedback from Mvelo', description: 'First Zone Partner test. Get honest feedback on vision and system.', type: 'business', priority: 'high' },
      { id: 'zone-definition', title: 'Define First 3 Zones', description: 'Pick launch zones with postal codes for each.', type: 'business', priority: 'high', link: '/admin/zones' },
      { id: 'auto-assign', title: 'Build Auto Order Assignment', description: 'Order → match postal code to zone → assign to Zone Partner → WhatsApp', type: 'technical', priority: 'critical', estimatedHours: 4 },
      { id: 'partner-onboarding', title: 'Build Partner Onboarding Flow', description: 'After approval: checklist (PayFast, deposit, training, stock)', type: 'technical', priority: 'critical', estimatedHours: 6 },
      { id: 'order-emails', title: 'Order Confirmation Emails', description: 'Customer gets email with order number and tracking link', type: 'technical', priority: 'high', estimatedHours: 2 },
    ]
  },
  {
    id: 'launch',
    name: 'Launch (February)',
    icon: Rocket,
    color: 'orange',
    dateRange: '1 Feb - 28 Feb 2026',
    description: 'Go live with first Zone Partners and customers',
    tasks: [
      { id: 'payfast-live', title: 'PayFast Live Integration', description: 'Switch from sandbox to production. Test with real R1 transaction.', type: 'technical', priority: 'critical', estimatedHours: 2 },
      { id: 'first-zone-partner', title: 'Onboard First Zone Partner', description: 'Full process: deposit, training, stock delivery.', type: 'business', priority: 'critical' },
      { id: 'products-in-sa', title: 'Products Physically in SA', description: 'First shipment arrived, quality checked, ready for stock.', type: 'business', priority: 'critical' },
      { id: 'soft-launch', title: 'Soft Launch (Friends & Family)', description: 'First 10-20 real orders. Find bugs. Get feedback.', type: 'business', priority: 'critical' },
      { id: 'day1-outreach', title: 'Send Day 1 Outreach Emails', description: 'Taddy Blecher, Vusi Thembekwayo, Motsepe Foundation', type: 'business', priority: 'high', link: '/admin/outreach' },
    ]
  },
  {
    id: 'growth',
    name: 'Growth (March+)',
    icon: TrendingUp,
    color: 'green',
    dateRange: 'March 2026 onwards',
    description: 'Scale what works, fix what doesn\'t',
    tasks: [
      { id: 'rating-system', title: 'Build Rating System', description: 'Customer rates delivery. Partner sees rating. Warning thresholds.', type: 'technical', priority: 'high', estimatedHours: 4 },
      { id: 'refund-system', title: 'Build Refund System', description: 'Customer requests refund. Admin reviews. Partner deduction if fault.', type: 'technical', priority: 'high', estimatedHours: 6 },
      { id: 'payfast-split', title: 'PayFast Split Payments', description: 'Auto-split: 50% profit to partner, rest to Jeffy.', type: 'technical', priority: 'medium', estimatedHours: 4 },
      { id: 'expand-zones', title: 'Expand to 5-10 Zones', description: 'Based on demand signals and applications.', type: 'business', priority: 'medium' },
      { id: 'founding-partners', title: 'Recruit 10 Founding Partners', description: 'Special status, profit sharing, school priority.', type: 'business', priority: 'medium' },
    ]
  }
];


export default function RoadmapPage() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('jeffy-roadmap-completed');
    const savedProgress = localStorage.getItem('jeffy-roadmap-progress');
    if (saved) setCompletedTasks(JSON.parse(saved));
    if (savedProgress) setInProgressTasks(JSON.parse(savedProgress));
  }, []);

  const toggleComplete = (taskId: string) => {
    const newCompleted = completedTasks.includes(taskId)
      ? completedTasks.filter(id => id !== taskId)
      : [...completedTasks, taskId];
    setCompletedTasks(newCompleted);
    localStorage.setItem('jeffy-roadmap-completed', JSON.stringify(newCompleted));
    if (inProgressTasks.includes(taskId)) {
      const newProgress = inProgressTasks.filter(id => id !== taskId);
      setInProgressTasks(newProgress);
      localStorage.setItem('jeffy-roadmap-progress', JSON.stringify(newProgress));
    }
  };

  const toggleProgress = (taskId: string) => {
    const newProgress = inProgressTasks.includes(taskId)
      ? inProgressTasks.filter(id => id !== taskId)
      : [...inProgressTasks, taskId];
    setInProgressTasks(newProgress);
    localStorage.setItem('jeffy-roadmap-progress', JSON.stringify(newProgress));
  };

  const getPhaseProgress = (phase: Phase) => {
    const total = phase.tasks.length;
    const done = phase.tasks.filter(t => completedTasks.includes(t.id)).length;
    return { done, total, percent: Math.round((done / total) * 100) };
  };

  const totalTasks = PHASES.reduce((sum, p) => sum + p.tasks.length, 0);
  const totalDone = completedTasks.length;
  const totalHours = PHASES.reduce((sum, p) => 
    sum + p.tasks.filter(t => t.type === 'technical' && !completedTasks.includes(t.id))
      .reduce((h, t) => h + (t.estimatedHours || 0), 0), 0);


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
              <p className="text-white/80">Your path to Feb/March 2026 launch</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-white/70 text-sm">Progress</p>
              <p className="text-3xl font-bold">{totalDone}/{totalTasks}</p>
              <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${(totalDone/totalTasks)*100}%` }} />
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-white/70 text-sm">Tech Hours Left</p>
              <p className="text-3xl font-bold">~{totalHours}h</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-white/70 text-sm">Target Launch</p>
              <p className="text-3xl font-bold">Feb 2026</p>
            </div>
          </div>
        </div>


        {/* Phases */}
        {PHASES.map((phase) => {
          const progress = getPhaseProgress(phase);
          const colorClasses: Record<string, string> = {
            blue: 'from-blue-500 to-blue-600',
            orange: 'from-orange-500 to-orange-600',
            green: 'from-green-500 to-green-600',
          };
          return (
            <div key={phase.id} className="mb-8">
              <div className={`bg-gradient-to-r ${colorClasses[phase.color]} rounded-t-xl p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <phase.icon className="h-6 w-6" />
                    <div>
                      <h2 className="text-xl font-bold">{phase.name}</h2>
                      <p className="text-white/80 text-sm">{phase.dateRange}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{progress.percent}%</p>
                    <p className="text-sm text-white/80">{progress.done}/{progress.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-b-xl border border-t-0 divide-y">
                {phase.tasks.map((task) => {
                  const isDone = completedTasks.includes(task.id);
                  const isInProgress = inProgressTasks.includes(task.id);
                  const priorityColor: Record<string, string> = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-blue-500' };
                  return (
                    <div key={task.id} className={`p-4 flex items-start gap-4 ${isDone ? 'bg-green-50' : isInProgress ? 'bg-yellow-50' : ''}`}>
                      <button onClick={() => toggleComplete(task.id)} className="mt-1 flex-shrink-0">
                        {isDone ? <CheckCircle className="h-6 w-6 text-green-600" /> : <Circle className="h-6 w-6 text-gray-300 hover:text-gray-400" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`w-2 h-2 rounded-full ${priorityColor[task.priority]}`}></span>
                          <h3 className={`font-medium ${isDone ? 'line-through text-gray-400' : ''}`}>{task.title}</h3>
                          {task.type === 'business' ? <Briefcase className="h-4 w-4 text-purple-600" /> : <Code className="h-4 w-4 text-green-600" />}
                          {task.estimatedHours && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">~{task.estimatedHours}h</span>}
                          {task.blockedReason && !isDone && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Blocked</span>}
                        </div>
                        <p className={`text-sm mt-1 ${isDone ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>
                        {task.blockedReason && !isDone && <p className="text-xs text-red-600 mt-1">⚠️ {task.blockedReason}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isDone && <button onClick={() => toggleProgress(task.id)} className={`text-xs px-3 py-1 rounded-full ${isInProgress ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{isInProgress ? '⏳ In Progress' : 'Start'}</button>}
                        {task.link && <Link href={task.link} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">Open →</Link>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}


        {/* Quick Reference */}
        <div className="bg-slate-800 text-white rounded-xl p-6 mt-8">
          <h3 className="font-bold text-lg mb-4">🎯 Minimum Viable Launch Checklist</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-orange-400 mb-2">Must Have (Day 1)</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>✓ PayFast live (can accept payments)</li>
                <li>✓ 3+ products physically in SA</li>
                <li>✓ 1+ Zone Partner active with stock</li>
                <li>✓ Auto-assign orders to partner</li>
                <li>✓ Customer can track order status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Nice to Have (Week 2+)</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>○ Email confirmations</li>
                <li>○ WhatsApp notifications</li>
                <li>○ Rating system</li>
                <li>○ Refund handling</li>
                <li>○ PayFast auto-split</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>"Plant trees under whose shade you will never sit."</p>
          <p className="mt-1">You've built more than you think. Keep going. 🌱</p>
        </div>
      </div>
    </div>
  );
}
