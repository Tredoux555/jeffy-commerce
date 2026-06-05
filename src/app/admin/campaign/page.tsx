'use client';

import { useEffect, useState } from 'react';
import {
  Megaphone, MessageCircle, PhoneMissed, Sparkles, Heart, ShieldCheck,
  Calendar, Users, Radio, Building2, CheckCircle2, Circle, DollarSign, Gift,
} from 'lucide-react';

// Wishlist Campaign — action-plan dashboard.
// Canonical source: docs/JEFFY_WISHLIST_CAMPAIGN.md + docs/JEFFY_CAMPAIGN_MANAGER_HIRING.md
// Strategy: we don't buy reach — we manufacture it by granting real wishes and turning
// each into a story the internet shares for free. Step 1 = hire the SA-based manager.

const STORAGE_KEY = 'jeffy_campaign_checklist_v1';

const NEXT_ACTIONS = [
  { id: 'hire', step: 'STEP 1', text: 'Hire the SA-based social media / campaign manager', note: 'Everything waits on this. See the Hiring section below.' },
  { id: 'whatsapp', step: '', text: 'Register the WhatsApp Business line + missed-call backup number', note: 'Voice-note friendly. Free entry, no smartphone required.' },
  { id: 'scripts', step: '', text: 'Draft the launch script pack', note: 'Launch video, WhatsApp auto-reply flow, consent script.' },
  { id: 'firstwish', step: '', text: 'Identify and pre-grant the first hero wish', note: 'Launch with proof, not a request.' },
  { id: 'partners', step: '', text: 'Build the corporate-partner CSI/CSR target list', note: 'Retailers, banks, telcos — for Phase 3 leverage.' },
];

const PHASES = [
  {
    n: 1, name: 'PROVE IT', months: 'Months 1–3', tone: 'border-orange-300 bg-orange-50',
    points: [
      'Hire the manager (Month 0–1).',
      'Stand up the WhatsApp line + missed-call backup.',
      'Launch with proof: pre-film & grant the FIRST wish before going public.',
      'Grant 1–2 wishes. Film raw and honest. Post FB + TikTok + Reels + Shorts.',
      'Boost only what already performs organically (R2–5k/month).',
    ],
    goal: 'Validate the mechanic floods the WhatsApp line and the story format moves people. Cheap learning before scaling.',
  },
  {
    n: 2, name: 'FIND THE FORMULA', months: 'Months 4–8', tone: 'border-amber-300 bg-amber-50',
    points: [
      'Double down on whatever video format won in Phase 1.',
      'Daily cadence locked in via the multi-cut method.',
      'Approach community radio (campus + local, R150–R800/spot, NOT SABC) — many run feel-good stories free.',
      'Start a light corporate-partner outreach list.',
    ],
    goal: 'Lock the repeatable format and begin building free amplification + partner pipeline.',
  },
  {
    n: 3, name: 'LEVERAGE', months: 'Months 9–12', tone: 'border-emerald-300 bg-emerald-50',
    points: [
      'Use 8–10 proven hero stories as the pitch deck to corporate CSI/CSR partners.',
      'Unlock: a partner funds the wishes + granting for brand association.',
      'Now paid radio becomes affordable — someone else pays, amplifying something already proven.',
      'Consider a "Year in Wishes" annual flagship compilation.',
    ],
    goal: 'Turn proof into partner-funded scale so growth no longer comes off Jeffy’s own budget.',
  },
];

const ETHICS = [
  'Proper, recorded consent for every recipient, before filming — plain-language, in their own language.',
  'Frame recipients as people with dreams, not objects of pity. The story is aspiration, not destitution.',
  'NEVER make anyone perform gratitude for the camera. No staged crying, no "say thank you to Jeffy."',
  'Let people keep their pride — dignity in framing, editing, and captions.',
  'Anyone can decline to be filmed and still receive their wish.',
];

type DrawWinner = {
  wantId: string; title: string; name: string | null; phone: string | null;
  email: string | null; emailNotified: boolean; whatsappLink: string | null;
};
type DrawState =
  | { status: 'idle' }
  | { status: 'drawing' }
  | { status: 'winner'; winner: DrawWinner }
  | { status: 'none' }
  | { status: 'error'; message: string };

export default function CampaignPage() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [draw, setDraw] = useState<DrawState>({ status: 'idle' });
  const [showPack, setShowPack] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const runDraw = async () => {
    if (draw.status === 'drawing') return;
    if (!confirm('Draw a random winner from the eligible wishes now? This records the winner and cannot be undone.')) return;
    setDraw({ status: 'drawing' });
    try {
      const res = await fetch('/api/admin/wishlist/draw', { method: 'POST' });
      const j = await res.json();
      if (!res.ok || !j.success) { setDraw({ status: 'error', message: j.error || 'Draw failed.' }); return; }
      if (!j.drawn) { setDraw({ status: 'none' }); return; }
      setDraw({ status: 'winner', winner: j.winner });
    } catch {
      setDraw({ status: 'error', message: 'Network error.' });
    }
  };

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const completed = NEXT_ACTIONS.filter((a) => done[a.id]).length;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-[#ff6b35]" /> Wishlist Campaign
        </h1>
        <p className="text-gray-600">The content engine that funds the mission. Year-1 budget envelope R200k–R420k.</p>
      </div>

      {/* One-line strategy */}
      <div className="rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] p-5 text-white mb-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">The one-line strategy</p>
        <p className="mt-1 text-lg font-semibold leading-snug">
          We don&apos;t buy reach. We manufacture it — by granting real wishes and turning each one into a story the internet shares for free.
        </p>
        <p className="mt-2 text-sm opacity-90">
          One filmed wish = 8–15 pieces of content. 12 wishes/year = a year of anchor stories. Radio is a round-2 amplifier, ideally on a partner&apos;s budget — never the launch tool.
        </p>
      </div>

      {/* Draw a winner (on-demand) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2"><Gift className="h-4 w-4 text-[#ff6b35]" /> Grant a wish — draw a winner</h2>
            <p className="mt-0.5 text-sm text-slate-500">Picks a random eligible wish and records the winner. Run it whenever you&apos;re ready to film the next one — no fixed schedule.</p>
          </div>
          <button
            onClick={runDraw}
            disabled={draw.status === 'drawing'}
            className="rounded-lg bg-[#ff6b35] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {draw.status === 'drawing' ? 'Drawing…' : 'Draw a winner'}
          </button>
        </div>

        {draw.status === 'winner' && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-800">🎉 Winner drawn</p>
            <p className="mt-1 text-sm text-green-800">
              <strong>{draw.winner.name || 'A Jeffy customer'}</strong> — &ldquo;{draw.winner.title}&rdquo;
            </p>
            <p className="mt-1 text-xs text-green-700">
              {draw.winner.email ? `Email: ${draw.winner.email}${draw.winner.emailNotified ? ' (notified ✓)' : ' (email not sent — set RESEND_API_KEY)'}` : 'No email on file.'}
              {draw.winner.phone ? ` · Phone: ${draw.winner.phone}` : ''}
            </p>
            {draw.winner.whatsappLink && (
              <a href={draw.winner.whatsappLink} target="_blank" rel="noopener noreferrer"
                 className="mt-2 inline-block rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white">
                Message on WhatsApp
              </a>
            )}
            <p className="mt-2 text-xs text-green-700">Recorded in wishlist_grants and shown publicly as a winner. Remember: recorded consent before filming.</p>
          </div>
        )}
        {draw.status === 'none' && (
          <p className="mt-4 text-sm text-slate-500">No eligible wishes right now (need active wishes with at least one supporter that haven&apos;t already won).</p>
        )}
        {draw.status === 'error' && (
          <p className="mt-4 text-sm text-red-600">{draw.message}</p>
        )}
      </section>

      {/* Next actions checklist */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#ff6b35]" /> Immediate next actions</h2>
          <span className="text-xs text-slate-500">{completed} / {NEXT_ACTIONS.length} done</span>
        </div>
        <ul className="space-y-2">
          {NEXT_ACTIONS.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => toggle(a.id)}
                className={`w-full text-left flex items-start gap-3 rounded-lg border p-3 transition-colors ${done[a.id] ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                {done[a.id]
                  ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  : <Circle className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />}
                <span>
                  <span className={`font-medium ${done[a.id] ? 'text-green-800 line-through' : 'text-slate-800'}`}>
                    {a.step && <span className="mr-2 rounded bg-[#ff6b35] px-1.5 py-0.5 text-[10px] font-bold text-white align-middle">{a.step}</span>}
                    {a.text}
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">{a.note}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-400">Progress is saved in this browser.</p>
      </section>

      {/* The mechanic */}
      <section className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-3">The mechanic — keep it brutally simple</h2>
          <div className="space-y-3 text-sm text-slate-700">
            <p className="flex gap-2"><MessageCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /><span><strong>WhatsApp line (primary).</strong> Free, voice-note friendly so low-literacy entrants can just talk their wish. Auto-reply confirms entry.</span></p>
            <p className="flex gap-2"><PhoneMissed className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" /><span><strong>Missed-call number (backup).</strong> Entrant calls, hangs up, costs R0. We SMS / call back.</span></p>
            <p className="flex gap-2"><Heart className="h-4 w-4 text-[#ff6b35] shrink-0 mt-0.5" /><span><strong>The single question:</strong> &ldquo;If we could grant one wish to change your life, what would it be — and why?&rdquo; The <em>why</em> is the story pipeline.</span></p>
            <p className="flex gap-2"><Calendar className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" /><span><strong>Cadence:</strong> grant one wish per month, filmed start to finish.</span></p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Posting & platforms</h2>
          <p className="text-sm text-slate-700 mb-3">Consistency beats volume. Target <strong>1 post/day, 5–7 days/week</strong> — a strong 5/week beats a burnt-out 7/week. One filmed wish becomes weeks of daily posts (teaser → the &ldquo;why&rdquo; → reveal → reaction → BTS → 1-month follow-up → per-platform cuts).</p>
          <ol className="text-sm text-slate-700 space-y-1 list-decimal pl-5">
            <li><strong>Facebook</strong> — PRIMARY. Where lower-income SA actually lives.</li>
            <li><strong>TikTok</strong> — the free virality lottery.</li>
            <li><strong>Instagram Reels + YouTube Shorts</strong> — repurpose the same vertical cuts.</li>
          </ol>
        </div>
      </section>

      {/* Budget scenarios */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-600" /> Budget scenarios</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-800">Scenario A — without a manager</p>
            <p className="text-xs text-slate-500 mb-2">~R5k–15k/month → R60k–180k/year</p>
            <p className="text-sm text-slate-600">Lean and doable, but caps growth — consistency suffers when you&apos;re running everything else. Fallback only if hiring slips.</p>
          </div>
          <div className="rounded-lg border-2 border-[#ff6b35] bg-orange-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Scenario B — with a manager <span className="ml-1 rounded bg-[#ff6b35] px-1.5 py-0.5 text-[10px] font-bold text-white">RECOMMENDED</span></p>
            <p className="text-xs text-slate-500 mb-2">~R15k–39k/month → ~R180k–420k/year (inside the envelope)</p>
            <p className="text-sm text-slate-600">The manager changes the math via content volume, consistency, and inbox management — not by buying reach. Under one-tenth of a radio-only plan, far more effective.</p>
          </div>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-3">Line item (Scenario B)</th><th className="py-2 px-3">Monthly</th><th className="py-2 pl-3">Year 1</th>
            </tr></thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-50"><td className="py-2 pr-3">Campaign / social manager salary</td><td className="py-2 px-3">R8k–20k</td><td className="py-2 pl-3">R96k–240k</td></tr>
              <tr className="border-b border-slate-50"><td className="py-2 pr-3">Paid boosts (best performers only)</td><td className="py-2 px-3">R3k–8k</td><td className="py-2 pl-3">R36k–96k</td></tr>
              <tr className="border-b border-slate-50"><td className="py-2 pr-3">The wishes themselves (avg)</td><td className="py-2 px-3">R3k–8k</td><td className="py-2 pl-3">R36k–96k</td></tr>
              <tr className="border-b border-slate-50"><td className="py-2 pr-3">Production extras (travel, props, editing)</td><td className="py-2 px-3">R1k–3k</td><td className="py-2 pl-3">R12k–36k</td></tr>
              <tr className="font-semibold"><td className="py-2 pr-3">Total</td><td className="py-2 px-3">R15k–39k</td><td className="py-2 pl-3">~R180k–420k</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 12-month roadmap */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-[#ff6b35]" /> 12-month roadmap</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PHASES.map((p) => (
            <div key={p.n} className={`rounded-xl border p-4 ${p.tone}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Phase {p.n} · {p.months}</p>
              <p className="text-lg font-bold text-slate-900 mb-2">{p.name}</p>
              <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-4">
                {p.points.map((pt, i) => <li key={i}>{pt}</li>)}
              </ul>
              <p className="mt-3 text-xs text-slate-600 border-t border-slate-200/60 pt-2"><strong>Goal:</strong> {p.goal}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ethics */}
      <section className="rounded-xl border-2 border-rose-200 bg-rose-50 p-5 shadow-sm mb-6">
        <h2 className="text-base font-bold text-rose-900 mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-rose-600" /> Non-negotiable ethics — dignity protects the brand for decades</h2>
        <p className="text-sm text-rose-800 mb-3">Filmed poverty reads as either genuine upliftment or exploitative spectacle — and which one the public perceives attaches <em>permanently</em> to the Jeffy and Isibani names. These are hard rules for the manager and every edit; put them in the contract.</p>
        <ul className="text-sm text-rose-900 space-y-1.5">
          {ETHICS.map((e, i) => <li key={i} className="flex gap-2"><ShieldCheck className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" /><span>{e}</span></li>)}
        </ul>
      </section>

      {/* Hiring Step 1 */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-10">
        <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-[#ff6b35]" /> Step 1 — hire the campaign / social media manager</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
          <div>
            <p className="font-semibold text-slate-800 mb-1">Who you&apos;re looking for</p>
            <ul className="space-y-1 list-disc pl-4">
              <li>Storyteller first, marketer second — the emotion in the wish is the product.</li>
              <li>Phone-native video editor, CapCut-fluent, non-corporate vertical video.</li>
              <li>Emotionally mature inbox manager (the WhatsApp line is heavy).</li>
              <li>Culturally fluent in low-income SA; ideally isiZulu and/or isiXhosa.</li>
              <li>Self-starting & remote-reliable (managed from Beijing).</li>
            </ul>
            <p className="mt-2 text-xs text-slate-500">Tiers: R8k–12k junior-but-hungry · <strong>R12k–20k mid-level = recommended target.</strong></p>
          </div>
          <div>
            <p className="font-semibold text-slate-800 mb-1">Where to find them</p>
            <ol className="space-y-1 list-decimal pl-4">
              <li>LinkedIn — campaign / NGO / cause content. Judge their posts, not their CV.</li>
              <li>Instagram / TikTok — DM SA creators already making emotional human-interest content.</li>
              <li>OfferZen / RecruitMyMom / Pnet / Careers24.</li>
              <li>University comms / journalism grads (Rhodes, Wits, UJ, DUT).</li>
              <li>Your own network — referrals beat cold hires for trust-heavy work.</li>
            </ol>
            <p className="mt-2 text-xs text-slate-600 flex gap-2"><Radio className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" /><span><strong>Screening test:</strong> paid trial brief — 60s of footage → one FB post, one TikTok cut, a caption. Hire on the dignity instinct + edit quality.</span></p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600 flex gap-2">
          <Building2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <span>Payment routes through Montree Commerce → Montree Limited (HK) via Wallex during trial, same rails as the existing SA hire. Full job spec, pitch, and onboarding in <code className="rounded bg-slate-200 px-1 text-xs">docs/JEFFY_CAMPAIGN_MANAGER_HIRING.md</code>; full plan in <code className="rounded bg-slate-200 px-1 text-xs">docs/JEFFY_WISHLIST_CAMPAIGN.md</code>.</span>
        </div>
      </section>

      {/* Manager advert — ready to post (student / side-hustle) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-10">
        <h2 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2"><Megaphone className="h-4 w-4 text-[#ff6b35]" /> Manager advert — ready to post</h2>
        <p className="text-sm text-slate-500 mb-4">Targeting a media/journalism/film student, AI-current, CapCut-fluent — a part-time side-hustle, not an employee. Set the pay figure (suggested R5,000–R9,000/month part-time), then post on university channels.</p>

        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">Version A — university career pages / LinkedIn (full)</p>
        <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 mb-5">{`Side-hustle: Social Storyteller for a South African startup with a heart (remote, part-time)

We're Jeffy. Once a month we grant one real wish to an ordinary South African — and we film it, honestly and with dignity, then share the story. Behind it is a bigger mission: building toward free, merit-based schools for kids who deserve a shot.

We're looking for one student to be the eyes and voice of that — not as an employee, as a paid side-hustle you run around your studies.

What you'd do
• Run our WhatsApp "wish line" — read the entries, spot the stories worth telling.
• Shoot and cut short vertical video (CapCut is perfect) that doesn't look corporate.
• Post across Facebook, TikTok, Instagram Reels and YouTube Shorts; learn what makes people share.
• Use AI tools to work faster — we want someone already curious about that.

You might be our person if you're
• Studying media, journalism, film, communications or marketing (or just genuinely good at this).
• Phone-native with video — you already make content people actually watch.
• Emotionally switched-on — the wish line carries heavy, real stories.
• Culturally fluent in SA; isiZulu and/or isiXhosa is a big plus.
• Self-driven — we're a small team managing remotely.

The deal
• Remote, flexible around your timetable. [R___/month], part-time to start — room to grow.
• Real ownership of a brand from the ground floor.

One non-negotiable: every person we film gives consent first, we never make anyone perform gratitude for a camera, and we tell stories about people's dreams, never their poverty.

To apply: send your Instagram/TikTok or a reel you're proud of (portfolio over CV), and one line on why this matters to you → [your email / WhatsApp].`}</pre>

        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">Version B — Instagram / TikTok DM + notice board (short)</p>
        <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 mb-5">{`📲 Paid side-hustle for a student creator (remote)
We grant one real wish a month to a South African and film the story — with dignity, never as a pity show. Want to run the WhatsApp wish line + shoot/edit the videos (CapCut), part-time around your studies? Mission-led SA startup, ground floor. isiZulu/isiXhosa a plus. Show us a reel you're proud of, not a CV. DM/email [___].`}</pre>

        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">Where to post (university-first)</p>
        <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">
          <li>Media/journalism/film department pages + student WhatsApp/Facebook groups: Rhodes (JMS), Wits, UJ, Stellenbosch/CPUT (film), UCT, DUT, TUT.</li>
          <li>Campus career portals (part-time / remote student-jobs boards).</li>
          <li>Instagram / TikTok — DM SA student creators already making emotional human-interest content.</li>
          <li>RecruitMyMom + student job boards; and your own network (referrals win for trust-heavy work).</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">Screen with a paid trial: 60s of footage → one FB post, one TikTok cut, a caption. Hire on edit quality + whether they instinctively get the dignity rule.</p>
      </section>

      {/* Trial brief + launch script pack (collapsible) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-10">
        <button
          onClick={() => setShowPack(!showPack)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="text-base font-semibold text-slate-900 flex items-center gap-2"><Radio className="h-4 w-4 text-[#ff6b35]" /> Trial brief &amp; launch script pack</span>
          <span className="text-sm text-slate-400">{showPack ? 'Hide' : 'Show'}</span>
        </button>
        <p className="mt-1 text-sm text-slate-500">The paid finalist test, the proof-first launch film, the WhatsApp auto-replies, and the recorded-consent script. Full copy also in <code className="rounded bg-slate-200 px-1 text-xs">docs/JEFFY_CAMPAIGN_LAUNCH_PACK.md</code>.</p>

        {showPack && (
          <div className="mt-4 space-y-5">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">Paid trial brief (to finalists)</p>
              <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{`Hi [name] — thanks for putting your hand up. This is a short PAID task so we can see how you work. Pay: [R___ flat], due within [3 days].

The story: Jeffy grants one real wish a month to an ordinary South African and tells it honestly, with dignity — never as a pity show.

Your task: from the ~60s of raw footage we sent [link], produce:
1) One Facebook post — a cut (up to ~60s) + caption.
2) One TikTok / Reels vertical cut — 15–30s.
3) The caption copy for each.

What we're looking for: hook in the first 2 seconds; subtitles (people watch on mute); real emotion WITHOUT exploiting the person; an SA-authentic voice, not corporate.

The rule that matters most: the story is about the person's DREAM, never their poverty. No staged gratitude.

Send to [email/WhatsApp] by [date].`}</pre>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">Launch film — "we granted the first wish" (60–90s, vertical)</p>
              <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{`0–2s · HOOK (on-screen text): "We asked one South African what would change their life. Then we made it happen."
2–15s · Their "why" in their own words (their voice, subtitled). Don't narrate over it — this is the heart.
15–35s · The reveal / the moment we grant it. Hold on the real reaction. Silence is fine.
35–55s · Let it breathe — a beat of genuine emotion. Their words, not ours.
55–75s · Invitation: "Every week we grant a wish. Next week it could be you — or someone you love."
CTA card: "Tell us your wish. WhatsApp a voice note or message to [number]. It's free. No catch."

Editor dignity notes: subtitle everything; never cut for poverty-shock; if the emotion isn't real, don't fake it; get the person's sign-off on the final cut where you can.`}</pre>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">WhatsApp wish-line auto-replies</p>
              <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{`On first message:
"Hi 👋 You've reached the Jeffy Wish List. Here's the only question:
‘If we could grant one wish to change your life, what would it be — and why?’
You can type it or just send a voice note — whatever's easier. Take your time. 💛"

If they only say hi:
"No rush 🙂 Whenever you're ready, tell us: if we could grant one wish to change your life, what would it be — and why? A voice note is perfect."

Once they've sent their wish:
"Got it — thank you for trusting us with that. 🙏 Every week we choose a wish to grant and film the story (only ever with your permission). It's completely free and there's nothing to buy. If yours is chosen, we'll message you here first. Either way, thank you. 💛"

(Real replies to heavy messages should be human, not canned — these just set expectations.)`}</pre>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">Recorded consent script (before any filming · translate to their language)</p>
              <pre className="whitespace-pre-wrap rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{`"Before we film anything — this is completely your choice.
We'd like to share your story on the internet — Facebook, TikTok, and similar — so other people can see it. Is that okay with you?
You can say no to being filmed and STILL receive your wish — that doesn't change.
If we film and you want us to stop at any point, just say so, and we will.
You don't owe us anything and you don't have to thank anyone. We just want to tell your story with respect.
Are you happy for us to film and share this?"

Keep the recorded "yes" with the footage. If anyone hesitates, default to NOT filming.`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
