import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JF-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  const debugInfo: string[] = [];
  debugInfo.push('Checkout started');

  try {
    // Parse body
    let body;
    try {
      body = await request.json();
      debugInfo.push(`Body parsed: ${JSON.stringify(body).substring(0, 200)}`);
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid JSON body',
        debug: debugInfo 
      }, { status: 400 });
    }

    const { items, customer, paymentMethod } = body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'Cart is empty',
        debug: debugInfo 
      }, { status: 400 });
    }
    debugInfo.push(`Items count: ${items.length}`);

    // Validate customer
    if (!customer?.firstName || !customer?.lastName || !customer?.email || !customer?.phone) {
      return NextResponse.json({ 
        error: 'Missing customer information',
        received: { firstName: !!customer?.firstName, lastName: !!customer?.lastName, email: !!customer?.email, phone: !!customer?.phone },
        debug: debugInfo 
      }, { status: 400 });
    }
    debugInfo.push('Customer validated');

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Server configuration error',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        debug: debugInfo 
      }, { status: 500 });
    }
    
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    debugInfo.push('Supabase client created');

    // Fetch products
    const productIds = items.map((item: any) => item.productId).filter(Boolean);
    debugInfo.push(`Product IDs: ${productIds.join(', ')}`);

    if (productIds.length === 0) {
      return NextResponse.json({ 
        error: 'No valid product IDs in cart',
        items: items,
        debug: debugInfo 
      }, { status: 400 });
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, selling_price_cents, cost_price_cents, quantity')
      .in('id', productIds);

    if (productsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch products',
        details: productsError.message,
        code: productsError.code,
        debug: debugInfo 
      }, { status: 500 });
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ 
        error: 'Products not found',
        productIds: productIds,
        debug: debugInfo 
      }, { status: 404 });
    }
    debugInfo.push(`Products found: ${products.length}`);

    // Calculate totals
    let subtotalCents = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = products.find((p: any) => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ 
          error: `Product not found: ${item.productId}`,
          debug: debugInfo 
        }, { status: 400 });
      }

      const itemTotal = product.selling_price_cents * item.quantity;
      subtotalCents += itemTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        variant_id: item.variantId || null,
        variant_name: null,
        quantity: item.quantity,
        unit_price_cents: product.selling_price_cents,
        unit_cost_cents: product.cost_price_cents || 0,
        total_cents: itemTotal,
      });
    }
    debugInfo.push(`Subtotal: ${subtotalCents}`);

    const orderNumber = generateOrderNumber();
    const totalCents = subtotalCents;

    // Create order - minimal fields
    const orderData = {
      order_number: orderNumber,
      customer_name: `${customer.firstName} ${customer.lastName}`,
      customer_email: customer.email,
      customer_phone: customer.phone,
      delivery_address: `${customer.address || ''}, ${customer.city || ''}, ${customer.province || ''}, ${customer.postalCode || ''}`,
      subtotal_cents: subtotalCents,
      total_cents: totalCents,
      payment_method: paymentMethod || 'eft',
      payment_status: 'pending',
      status: 'pending_payment',
    };
    debugInfo.push(`Order data prepared: ${orderNumber}`);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ 
        error: 'Failed to create order',
        details: orderError.message,
        code: orderError.code,
        hint: orderError.hint,
        orderData: orderData,
        debug: debugInfo 
      }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ 
        error: 'Order created but not returned',
        debug: debugInfo 
      }, { status: 500 });
    }
    debugInfo.push(`Order created: ${order.id}`);

    // Create order items
    const itemsToInsert = orderItems.map((item) => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      debugInfo.push(`Order items error (non-fatal): ${itemsError.message}`);
    } else {
      debugInfo.push('Order items created');
    }

    // Handle payment methods
    if (paymentMethod === 'payfast') {
      const payfastUrl = process.env.PAYFAST_SANDBOX === 'true'
        ? 'https://sandbox.payfast.co.za/eng/process'
        : 'https://www.payfast.co.za/eng/process';

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jeffy.co.za';

      const data: Record<string, string> = {
        merchant_id: process.env.PAYFAST_MERCHANT_ID || '',
        merchant_key: process.env.PAYFAST_MERCHANT_KEY || '',
        return_url: `${siteUrl}/checkout/success?order=${orderNumber}`,
        cancel_url: `${siteUrl}/checkout?cancelled=true`,
        notify_url: `${siteUrl}/api/webhooks/payfast`,
        name_first: customer.firstName,
        name_last: customer.lastName,
        email_address: customer.email,
        m_payment_id: order.id,
        amount: (totalCents / 100).toFixed(2),
        item_name: `Order ${orderNumber}`,
      };

      const passphrase = process.env.PAYFAST_PASSPHRASE || '';
      let signatureString = Object.entries(data)
        .filter(([, value]) => value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, '+')}`)
        .join('&');

      if (passphrase) {
        signatureString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
      }

      const signature = createHash('md5').update(signatureString).digest('hex');
      data.signature = signature;

      const params = new URLSearchParams(data);
      return NextResponse.json({
        success: true,
        orderNumber,
        redirectUrl: `${payfastUrl}?${params.toString()}`,
      });
    }

    // EFT or other - no redirect needed
    return NextResponse.json({
      success: true,
      orderNumber,
      redirectUrl: null,
    });

  } catch (error) {
    debugInfo.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({
      error: 'Checkout failed',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      debug: debugInfo,
    }, { status: 500 });
  }
}
