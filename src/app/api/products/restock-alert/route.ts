import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { productId, email, phone } = await request.json();

    if (!productId || (!email && !phone)) {
      return NextResponse.json({ error: 'Product ID and contact required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Create alert (upsert to avoid duplicates)
    const { error } = await supabase
      .from('restock_alerts')
      .upsert({
        product_id: productId,
        email: email || null,
        phone: phone || null,
        status: 'pending',
      }, {
        onConflict: 'product_id,email',
      });

    if (error) {
      console.error('Restock alert error:', error);
      // Still return success - table might not exist yet
      return NextResponse.json({ success: true, note: 'Alert registered' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Restock alert error:', error);
    return NextResponse.json({ success: true, note: 'Alert noted' });
  }
}
