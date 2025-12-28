import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { code, orderTotalCents } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Code required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: discount, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !discount) {
      return NextResponse.json({ success: false, error: 'Invalid discount code' }, { status: 404 });
    }

    // Check expiry
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'This code has expired' }, { status: 400 });
    }

    // Check max uses
    if (discount.max_uses && discount.used_count >= discount.max_uses) {
      return NextResponse.json({ success: false, error: 'This code has been fully redeemed' }, { status: 400 });
    }

    // Check min order
    if (orderTotalCents && orderTotalCents < discount.min_order_cents) {
      const minOrder = (discount.min_order_cents / 100).toFixed(2);
      return NextResponse.json({ 
        success: false, 
        error: `Minimum order of R${minOrder} required` 
      }, { status: 400 });
    }

    // Calculate discount
    let discountAmountCents = 0;
    if (discount.discount_type === 'percentage') {
      discountAmountCents = Math.round((orderTotalCents || 0) * (discount.discount_value / 100));
    } else {
      discountAmountCents = discount.discount_value;
    }

    return NextResponse.json({
      success: true,
      discount: {
        id: discount.id,
        code: discount.code,
        description: discount.description,
        type: discount.discount_type,
        value: discount.discount_value,
        discountAmountCents,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
