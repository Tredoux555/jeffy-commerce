'use client';

import { useEffect, useState } from 'react';
import {
  FlaskConical, Target, MessageCircle, TrendingUp, Settings, Calculator,
  CheckCircle2, Circle, DollarSign, ShieldCheck, ArrowRight, Gift, Megaphone,
} from 'lucide-react';

// The Experiment — Minimum Viable Test dashboard.
// Canonical source: docs/JEFFY_MVT_EXPERIMENT_PLAN.md
// Principle: don't fund a year — fund the cheapest test that can kill the idea.

const STORAGE_KEY = 'jeffy_experiment_checklist_v1';

const LINKS = [
  { icon: MessageCircle, color: 'text-green-600', n: '1', name: 'Pull', q: 'Does the Wish List flood the WhatsApp line? Do people want in?' },
  { icon: TrendingUp, color: 'text-pink-600', n: '2', name: 'Reach', q: 'Do the winner stories travel and earn attention we didn’t pay for?' },
  { icon: Settings, color: 'text-blue-600', n: '3', name: 'Operations', q: 'Can one flagship seller run receive → sell → deliver → draw → hand-over without breaking?' },
  { icon: Calculator, color: 'text-purple-600', n: '4', name: 'Economics', q: 'After landed cost (FX), returns and seller margin — is there positive contribution per order?' },
];

const STAGES = [
  {
    key: 'stage1', tag: 'STAGE 1', name: 'SIGNAL', cost: '≈ R15k–R30k', time: '~4–6 weeks',
    tone: 'border-orange-300 bg-orange-50', tests: 'Tests Pull & Reach — no inventory, no hire, almost no risk.',
    points: [
      'Stand up the WhatsApp wish line + missed-call backup (near-free).',
      'Pre-grant ONE small wish (R1k–R3k) and film it. Launch with proof, not a request.',
      'Run it yourself, or screen a student creator with a paid trial brief (R500–R1,000 × 2–3 finalists).',
      'Tiny boost spend (R2k–R5k) on whatever performs organically.',
    ],
    win: 'The wish line fills on its own, and at least one piece of content earns real organic reach without heavy spend.',
    kill: 'After ~6 weeks, entries are a trickle and stories get no traction even when boosted → STOP. Learned for ~R15k–R30k.',
  },
  {
    key: 'stage2', tag: 'STAGE 2', name: 'PROVE THE LOOP', cost: '≈ R80k–R120k', time: '~3–4 months',
    tone: 'border-amber-300 bg-amber-50', tests: 'Only if Stage 1 fires. Tests Operations & Economics with one flagship seller.',
    points: [
      'First product shipment — small, the range you already know (~R50k, mostly recoverable at ~70% wholesale).',
      'Hire a student-tier manager (~R8k/mo × 3–4 = R25k–R35k) to run the line + content.',
      'Stand up ONE flagship seller (likely Johannesburg) and run the full loop end-to-end.',
      'Grant 2–3 monthly wishes (R5k–R10k). Modest boosts (R10k–R15k).',
    ],
    win: 'The loop runs clean for a full cycle, real sales happen, the seller delivers well, and unit economics clear after returns & FX — even if small.',
    kill: 'Loop keeps breaking, seller flakes, or margin stays negative after returns/FX with no path to positive → STOP or rework. ~R35k–R40k of inventory comes back.',
  },
];

const GATE = [
  { metric: 'Wish-line entries (one metro)', target: '≥ 50 / week, sustained for a month' },
  { metric: 'Organic reach', target: '≥ 1 piece hitting 50k+ views without heavy spend' },
  { metric: 'Flagship loop', target: '1 full cycle clean: receive → sell → deliver → draw → hand-over' },
  { metric: 'Sell-through', target: '≥ 50% of a batch sold within ~8 weeks' },
  { metric: 'Unit economics', target: 'Positive contribution per order after landed cost (FX), returns, seller margin' },
  { metric: 'Returns', target: 'Rate manageable; hold-back / reserve mechanic works in practice' },
];

const RISK = [
  { label: 'Stage 1 (signal)', spend: 'R15k–R30k', lost: '~all of it (but tiny)' },
  { label: 'Stage 2 (prove loop)', spend: 'R80k–R120k', lost: '~R60k–R90k (inventory ~R35k–R40k recoverable)' },
  { label: 'To fully answer the question', spend: '~R100k–R150k', lost: '~R75k–R120k', bold: true },
  { label: 'Full Year-1 campaign', spend: 'R200k–R420k', lost: 'only spent AFTER the gate passes', muted: true },
];

const STEPS = [
  { tag: 'STAGE 1', text: 'Register the WhatsApp Business line + missed-call backup.' },
  { tag: 'STAGE 1', text: 'Pre-grant + film one small hero wish. Launch with proof.' },
  { tag: 'STAGE 1', text: 'Post to FB + TikTok + Reels + Shorts. Tiny boosts on winners only.' },
  { tag: 'CHECK', text: 'Did the line flood and a story travel? If no → stop. If yes → continue.' },
  { tag: 'STAGE 2', text: 'Place the small first shipment. Hire a student-tier manager.' },
  { tag: 'STAGE 2', text: 'Stand up the flagship Joburg seller. Run the full loop, monthly draws.' },
  { tag: 'STAGE 2', text: 'Track contribution margin after returns + FX on every order.' },
  { tag: 'GATE', text: 'Hit the §gate targets? If yes → commit the full campaign. If no → rework or stop.' },
];

export default function ExperimentPage() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const completed = STEPS.filter((_, i) => done[`step-${i}`]).length;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-[#ff6b35]" /> The Experiment
        </h1>
        <p className="text-gray-600">Run Year 1 as a falsifiable test, not a full-year bet. Stage-gated spend with a hard go/no-go.</p>
      </div>

      {/* Principle banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] p-5 text-white mb-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">The principle</p>
        <p className="mt-1 text-lg font-semibold leading-snug">
          Don&apos;t fund a year. Fund the cheapest test that can kill the idea.
        </p>
        <p className="mt-2 text-sm opacity-90">
          If the loop works in one place, we earn the right to spend big. If it doesn&apos;t, we found out for the price of a cheap car instead of an expensive one.
        </p>
      </div>

      {/* The one question */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2"><Target className="h-4 w-4 text-[#ff6b35]" /> The one question this answers</h2>
        <p className="text-lg font-semibold text-slate-900 mb-3">Does the loop work in one place?</p>
        <p className="text-sm text-slate-600 mb-4">Four links, tested in cost order — cheapest and most likely to fail, first. If link 1 or 2 fails, we never spend on 3 and 4. That is the whole point.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {LINKS.map((l) => (
            <div key={l.n} className="flex gap-3 rounded-lg border border-slate-200 p-3">
              <l.icon className={`h-5 w-5 shrink-0 mt-0.5 ${l.color}`} />
              <div>
                <p className="text-sm font-semibold text-slate-800">{l.n}. {l.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{l.q}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stages */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-600" /> The stages — spend gates, not an up-front commitment</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {STAGES.map((s) => (
            <div key={s.key} className={`rounded-xl border p-4 ${s.tone}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{s.tag}</p>
                <p className="text-xs font-semibold text-slate-600">{s.cost} · {s.time}</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{s.name}</p>
              <p className="text-xs text-slate-600 mb-2 italic">{s.tests}</p>
              <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-4">
                {s.points.map((pt, i) => <li key={i}>{pt}</li>)}
              </ul>
              <p className="mt-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-2"><strong>Success:</strong> {s.win}</p>
              <p className="mt-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded p-2"><strong>Kill:</strong> {s.kill}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The gate */}
      <section className="rounded-xl border-2 border-[#ff6b35] bg-orange-50 p-5 shadow-sm mb-6">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#ff6b35]" /> The gate — go / no-go before the big money</h2>
        <p className="text-sm text-slate-700 mb-3">Do <strong>not</strong> commit the full campaign (the <strong>R200k–R420k</strong> envelope) until Stage 2 passes on evidence. Set your own numbers; sensible defaults below.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-orange-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Gate metric</th><th className="py-2 pl-3">Default target (set your own)</th>
            </tr></thead>
            <tbody className="text-slate-700">
              {GATE.map((g, i) => (
                <tr key={i} className="border-b border-orange-100/60"><td className="py-2 pr-3 font-medium">{g.metric}</td><td className="py-2 pl-3">{g.target}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-800">Pass = earn the right to the R200k+ spend. Miss = you learned it for ~R100k–R150k instead of R300k+.</p>
        <a href="/admin/campaign" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#ff6b35] px-4 py-2 text-sm font-semibold text-white">
          <Megaphone className="h-4 w-4" /> Full campaign plan (post-gate) <ArrowRight className="h-4 w-4" />
        </a>
      </section>

      {/* What you risk */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2"><Calculator className="h-4 w-4 text-purple-600" /> What you actually risk</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-3"></th><th className="py-2 px-3">Spend</th><th className="py-2 pl-3">Truly unrecoverable if it fails</th>
            </tr></thead>
            <tbody className="text-slate-700">
              {RISK.map((r, i) => (
                <tr key={i} className={`border-b border-slate-50 ${r.bold ? 'font-semibold text-slate-900' : ''} ${r.muted ? 'text-slate-400' : ''}`}>
                  <td className="py-2 pr-3">{r.label}</td><td className="py-2 px-3">{r.spend}</td><td className="py-2 pl-3">{r.lost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">Already spent and <strong>not</strong> part of this decision: the platform build, company registration, import licence. Don&apos;t let sunk cost weigh the go-forward call. The bigger cost is your focus — a few months for Stage 1+2 vs. a full year for the whole campaign.</p>
      </section>

      {/* Order of operations checklist */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2"><Gift className="h-4 w-4 text-[#ff6b35]" /> Order of operations</h2>
          <span className="text-xs text-slate-500">{completed} / {STEPS.length} done</span>
        </div>
        <ul className="space-y-2">
          {STEPS.map((s, i) => {
            const id = `step-${i}`;
            const tagColor = s.tag === 'CHECK' || s.tag === 'GATE' ? 'bg-slate-800' : 'bg-[#ff6b35]';
            return (
              <li key={id}>
                <button
                  onClick={() => toggle(id)}
                  className={`w-full text-left flex items-start gap-3 rounded-lg border p-3 transition-colors ${done[id] ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  {done[id]
                    ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    : <Circle className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />}
                  <span>
                    <span className={`mr-2 rounded px-1.5 py-0.5 text-[10px] font-bold text-white align-middle ${tagColor}`}>{s.tag}</span>
                    <span className={`font-medium ${done[id] ? 'text-green-800 line-through' : 'text-slate-800'}`}>{s.text}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-slate-400">Progress is saved in this browser. Canonical source: <code className="rounded bg-slate-100 px-1 text-xs">docs/JEFFY_MVT_EXPERIMENT_PLAN.md</code></p>
      </section>
    </div>
  );
}
