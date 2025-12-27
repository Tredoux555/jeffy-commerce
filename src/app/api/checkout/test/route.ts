import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Health check endpoint - tests if checkout API can actually process orders
export async function POST(request: NextRequest) {
  const errors: string[] = [];
  
  try {
    // 1. Test Supabase connection
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 2. Test if products table is accessible
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, selling_price_cents')
      .eq('status', 'active')
      .limit(1);
    
    if (productsError) {
      errors.push(`Products query failed: ${productsError.message}`);
    }

    // 3. Test if orders table is accessible and can insert
    const { data: orderTest, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (orderError) {
      errors.push(`Orders query failed: ${orderError.message}`);
    }

    // 4. Test required columns exist by attempting minimal insert (will rollback)
    const testOrderNumber = `TEST-${Date.now()}`;
    const { data: insertTest, error: insertError } = await supabase
      .from('orders')
      .insert({
        order_number: testOrderNumber,
        customer_name: 'Health Check Test',
        customer_email: 'test@healthcheck.jeffy.co.za',
        customer_phone: '0000000000',
        delivery_address: 'Test Address',
        subtotal_cents: 0,
        total_cents: 0,
        payment_method: 'test',
        payment_status: 'test',
        status: 'test',
      })
      .select()
      .single();

    if (insertError) {
      errors.push(`Order insert test failed: ${insertError.message}`);
    } else if (insertTest) {
      // Clean up test order
      await supabase.from('orders').delete().eq('id', insertTest.id);
    }

    // Return results
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Checkout system has issues',
        errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Checkout system fully operational',
      checks: {
        supabase: 'connected',
        products: 'accessible',
        orders: 'read/write OK',
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Checkout test failed',
      error: error.message,
    }, { status: 500 });
  }
}
