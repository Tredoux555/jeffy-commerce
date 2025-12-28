import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get points balance
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    const phone = request.nextUrl.searchParams.get('phone');

    if (!email && !phone) {
      return NextResponse.json({ success: false, error: 'Email or phone required' }, { status: 400 });
    }

    const supabase = await createClient();

    let query = supabase.from('loyalty_points').select('*');
    if (email) query = query.eq('user_email', email);
    if (phone) query = query.eq('user_phone', phone);

    const { data: transactions } = await query.order('created_at', { ascending: false });

    const balance = (transactions || []).reduce((sum, t) => sum + t.points, 0);
    const totalEarned = (transactions || []).filter(t => t.points > 0).reduce((sum, t) => sum + t.points, 0);

    // Determine tier
    const tiers = [
      { name: 'Bronze', min: 0, multiplier: 1.0, icon: '🥉', color: '#CD7F32' },
      { name: 'Silver', min: 500, multiplier: 1.25, icon: '🥈', color: '#C0C0C0' },
      { name: 'Gold', min: 2000, multiplier: 1.5, icon: '🥇', color: '#FFD700' },
      { name: 'Platinum', min: 5000, multiplier: 2.0, icon: '💎', color: '#E5E4E2' },
    ];

    let tier = tiers[0];
    for (const t of tiers) {
      if (totalEarned >= t.min) tier = t;
    }

    return NextResponse.json({
      success: true,
      balance,
      totalEarned,
      tier: tier.name,
      tierIcon: tier.icon,
      tierColor: tier.color,
      multiplier: tier.multiplier,
      transactions: transactions?.slice(0, 10) || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST - Add/redeem points
export async function POST(request: NextRequest) {
  try {
    const { email, phone, points, type, source, description, referenceId } = await request.json();

    if (!email && !phone) {
      return NextResponse.json({ success: false, error: 'Email or phone required' }, { status: 400 });
    }

    if (!points || !type) {
      return NextResponse.json({ success: false, error: 'Points and type required' }, { status: 400 });
    }

    const supabase = await createClient();

    // For redemptions, check balance first
    if (type === 'redeem') {
      let balanceQuery = supabase.from('loyalty_points').select('points');
      if (email) balanceQuery = balanceQuery.eq('user_email', email);
      if (phone) balanceQuery = balanceQuery.eq('user_phone', phone);
      
      const { data: existing } = await balanceQuery;
      const currentBalance = (existing || []).reduce((sum, t) => sum + t.points, 0);
      
      if (currentBalance < Math.abs(points)) {
        return NextResponse.json({ success: false, error: 'Insufficient points' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('loyalty_points')
      .insert({
        user_email: email,
        user_phone: phone,
        points: type === 'redeem' ? -Math.abs(points) : Math.abs(points),
        transaction_type: type,
        source,
        description,
        reference_id: referenceId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, transaction: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
