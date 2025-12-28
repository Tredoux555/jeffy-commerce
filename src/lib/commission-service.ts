'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CommissionRequest {
  orderId: string;
  zonePartnerId: string;
  zoneId: string;
  orderProfitCents: number;
}

export async function calculateCommission(data: CommissionRequest) {
  try {
    const { data: commission, error } = await supabase
      .from('commissions')
      .insert({
        order_id: data.orderId,
        zone_partner_id: data.zonePartnerId,
        zone_id: data.zoneId,
        order_profit_cents: data.orderProfitCents,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Commission error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      commission: {
        id: commission.id,
        profit: data.orderProfitCents,
        partnerShare: commission.partner_commission_cents,
        jeffyShare: commission.jeffy_commission_cents,
      },
    };
  } catch (err: any) {
    console.error('Error:', err);
    return { success: false, error: err.message };
  }
}

export async function getPartnerEarnings(zonePartnerId: string) {
  try {
    const { data, error } = await supabase
      .from('partner_earnings')
      .select('*')
      .eq('zone_partner_id', zonePartnerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      earnings: data || {
        zone_partner_id: zonePartnerId,
        total_commissions_cents: 0,
        paid_commissions_cents: 0,
        pending_commissions_cents: 0,
        total_orders: 0,
        paid_orders: 0,
        pending_orders: 0,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getCommissionHistory(zonePartnerId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('zone_partner_id', zonePartnerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, commissions: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markCommissionPaid(commissionId: string) {
  try {
    const { data, error } = await supabase
      .from('commissions')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', commissionId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, commission: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


