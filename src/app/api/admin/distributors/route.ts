import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Admin: list distributors.
export async function GET() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, distributors: data || [] });
}

// Admin: update a distributor (approve, set credit limit, change phase/status).
export async function POST(request: NextRequest) {
  try {
    const { id, status, credit_limit_cents, phase } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status !== undefined) patch.status = status;
    if (credit_limit_cents !== undefined) patch.credit_limit_cents = credit_limit_cents;
    if (phase !== undefined) patch.phase = phase;

    const supabase = await createAdminClient();
    const { error } = await supabase.from('distributors').update(patch).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
