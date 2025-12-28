import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateOrderNumber } from '@/lib/utils';
import crypto from 'crypto';

interface CartItemInput {
  productId: string;
  quantity: number;
  variantId?: string;
}

interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, paymentMethod } = body as {
      items: CartItemInput[];
      customer: CustomerInput;
      paymentMethod: 'payfast' | 'ozow' | 'eft';
    };

    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Fetch products and calculate totals
    const productIds = items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError || !products) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Calculate order totals
    let subtotalCents = 0;
    const orderItems: {
      product_id: string;
      product_name: string;
      variant_id: string | null;
      variant_name: string | null;
      quantity: number;
      unit_price_cents: number;
      unit_cost_cents: number;
      total_cents: number;
    }[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      if (product.quantity < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for: ${product.name}` }, { status: 400 });
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
        unit_cost_cents: product.cost_price_cents,
        total_cents: itemTotal,
      });
    }

    const orderNumber = generateOrderNumber();
    const totalCents = subtotalCents; // Add shipping/tax later if needed

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: '00000000-0000-0000-0000-000000000000', // Guest checkout - TODO: use real user
        delivery_latitude: 0,
        delivery_longitude: 0,
        delivery_address: `${customer.address}, ${customer.city}, ${customer.province}, ${customer.postalCode}`,
        subtotal_cents: subtotalCents,
        total_cents: totalCents,
        payment_method: paymentMethod,
        payment_status: 'pending',
        status: 'pending_payment',
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

    if (itemsError) {
      console.error('Order items error:', itemsError);
      // TODO: Delete order if items fail
    }

    // Decrement product stock
    for (const item of items) {
      await supabase.rpc('decrement_stock', {
        p_product_id: item.productId,
        p_amount: item.quantity,
      });
    }

    // Handle payment methods
    if (paymentMethod === 'payfast') {
      const payfastUrl = process.env.PAYFAST_SANDBOX === 'true'
        ? 'https://sandbox.payfast.co.za/eng/process'
        : 'https://www.payfast.co.za/eng/process';

      const data: Record<string, string> = {
        merchant_id: process.env.PAYFAST_MERCHANT_ID || '',
        merchant_key: process.env.PAYFAST_MERCHANT_KEY || '',
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${orderNumber}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?cancelled=true`,
        notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/payfast`,
        name_first: customer.firstName,
        name_last: customer.lastName,
        email_address: customer.email,
        m_payment_id: order.id,
        amount: (totalCents / 100).toFixed(2),
        item_name: `Order ${orderNumber}`,
      };

      // Generate signature
      const passphrase = process.env.PAYFAST_PASSPHRASE || '';
      let signatureString = Object.entries(data)
        .filter(([, value]) => value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, '+')}`)
        .join('&');

      if (passphrase) {
        signatureString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
      }

      const signature = crypto.createHash('md5').update(signatureString).digest('hex');
      data.signature = signature;

      // Build redirect URL
      const params = new URLSearchParams(data);
      return NextResponse.json({
        orderNumber,
        redirectUrl: `${payfastUrl}?${params.toString()}`,
      });
    }

    if (paymentMethod === 'ozow') {
      // TODO: Implement Ozow integration
      return NextResponse.json({
        orderNumber,
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${orderNumber}`,
      });
    }

    // EFT - no redirect
    return NextResponse.json({
      orderNumber,
      redirectUrl: null,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
