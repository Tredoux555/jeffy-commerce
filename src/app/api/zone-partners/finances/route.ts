import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to get current week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// GET - Get all partner balances or single partner details
export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get('partner_id');

  try {
    // Get balances view
    let query = supabase.from('zp_balances').select('*');
    
    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }

    const { data: balances, error: balanceError } = await query;
    if (balanceError) throw balanceError;

    // If requesting single partner, also get their transaction history
    if (partnerId) {
      const { data: deliveries } = await supabase
        .from('zp_deliveries')
        .select('*')
        .eq('partner_id', partnerId)
        .order('delivery_date', { ascending: false })
        .limit(20);

      const { data: payments } = await supabase
        .from('zp_payments')
        .select('*')
        .eq('partner_id', partnerId)
        .order('payment_date', { ascending: false })
        .limit(20);

      return NextResponse.json({
        success: true,
        partner: balances?.[0] || null,
        deliveries: deliveries || [],
        payments: payments || []
      });
    }

    // Calculate totals
    const totals = (balances || []).reduce((acc, b) => ({
      totalDelivered: acc.totalDelivered + (b.total_delivered_cents || 0),
      totalPaid: acc.totalPaid + (b.total_paid_cents || 0),
      totalOutstanding: acc.totalOutstanding + (b.balance_cents || 0),
      activePartners: acc.activePartners + (b.is_active ? 1 : 0),
      partnersWithBalance: acc.partnersWithBalance + (b.balance_cents > 0 ? 1 : 0)
    }), {
      totalDelivered: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      activePartners: 0,
      partnersWithBalance: 0
    });

    return NextResponse.json({
      success: true,
      balances: balances || [],
      totals
    });
  } catch (error: any) {
    console.error('Finance GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Record delivery or payment
export async function POST(request: NextRequest) {
  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { action, partner_id, amount, date, notes, method, reference } = body;

    if (!partner_id) {
      return NextResponse.json({ error: 'partner_id required' }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount required' }, { status: 400 });
    }

    const amountCents = Math.round(amount * 100); // Convert Rands to cents
    const recordDate = date ? new Date(date) : new Date();

    if (action === 'delivery') {
      // Record stock delivery
      const weekNumber = getWeekNumber(recordDate);
      const year = recordDate.getFullYear();

      const { data, error } = await supabase
        .from('zp_deliveries')
        .upsert({
          partner_id,
          delivery_date: recordDate.toISOString().split('T')[0],
          week_number: weekNumber,
          year,
          wholesale_total_cents: amountCents,
          status: 'delivered',
          notes: notes || null
        }, {
          onConflict: 'partner_id,week_number,year'
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `Delivery of R${amount.toFixed(2)} recorded`,
        delivery: data
      });

    } else if (action === 'payment') {
      // Record payment received
      const { data, error } = await supabase
        .from('zp_payments')
        .insert({
          partner_id,
          payment_date: recordDate.toISOString().split('T')[0],
          amount_cents: amountCents,
          method: method || 'eft',
          reference: reference || null,
          status: 'confirmed',
          notes: notes || null
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `Payment of R${amount.toFixed(2)} recorded`,
        payment: data
      });

    } else {
      return NextResponse.json({ error: 'Invalid action. Use "delivery" or "payment"' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Finance POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Cancel a delivery or reverse a payment
export async function DELETE(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'delivery' or 'payment'
  const id = searchParams.get('id');

  if (!type || !id) {
    return NextResponse.json({ error: 'type and id required' }, { status: 400 });
  }

  try {
    if (type === 'delivery') {
      const { error } = await supabase
        .from('zp_deliveries')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (error) throw error;
    } else if (type === 'payment') {
      const { error } = await supabase
        .from('zp_payments')
        .update({ status: 'reversed' })
        .eq('id', id);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `${type} cancelled` });
  } catch (error: any) {
    console.error('Finance DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
