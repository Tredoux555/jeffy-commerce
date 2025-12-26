import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { data: wants, error } = await supabase
      .from('wants')
      .select('*')
      .eq('creator_phone', phone)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wants:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch wants' }, { status: 500 });
    }

    return NextResponse.json({ success: true, wants: wants || [] });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
