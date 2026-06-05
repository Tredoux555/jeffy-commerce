import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, error: 'AI service not configured (ANTHROPIC_API_KEY missing).' }, { status: 500 });
    }

    const supabase = await createAdminClient();
    // select('*') so this keeps working whether or not the ip_* location columns exist yet.
    const { data: wants, error } = await supabase
      .from('wants')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(400);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const wishes = wants || [];
    if (wishes.length === 0) {
      return NextResponse.json({ success: true, count: 0, insights: null });
    }

    const list = wishes
      .map((w: any, i: number) => {
        const area = w.ip_area || w.suburb ? ` [${w.ip_area || w.suburb}]` : '';
        const desc = w.description ? ` — ${w.description}` : '';
        return `${i + 1}. ${w.product_name}${desc}${area}`;
      })
      .join('\n');

    const prompt = `You are a demand analyst for Jeffy, a South African e-commerce store that sources products directly from Chinese factories. Below are ${wishes.length} customer "wishes" (free-text product requests). Some include an approximate area in [brackets].

Analyse them and return ONLY valid minified JSON (no markdown fences, no commentary) with EXACTLY this shape:
{"summary":"2-3 sentence overview of what South Africans are wishing for","categories":[{"name":"string","count":number,"examples":["string"]}],"clusters":[{"label":"specific product type","count":number,"samples":["string"]}],"by_area":[{"area":"string","top":["string"]}],"sourcing_recommendations":["a specific product worth sourcing first + one short reason"]}

Rules:
- "categories": broad buckets (e.g. Electronics, Kitchen, Fashion), sorted by count desc, max 10.
- "clusters": group near-duplicate / very similar wishes into specific product types, sorted by count desc, max 12.
- "by_area": only include if areas are present; otherwise return [].
- "sourcing_recommendations": 5-8 concrete items, prioritising high-demand + low-cost-to-source.
- Use the ACTUAL wishes; never invent products no one asked for.

WISHES:
${list}`;

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = msg.content.find((b: any) => b.type === 'text') as any;
    const text: string = block?.text || '';

    let insights: any = null;
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      insights = JSON.parse(text.slice(start, end + 1));
    } catch {
      return NextResponse.json({ success: false, error: 'Could not parse AI response.', raw: text }, { status: 502 });
    }

    return NextResponse.json({ success: true, count: wishes.length, insights });
  } catch (err: any) {
    console.error('Wish insights error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
