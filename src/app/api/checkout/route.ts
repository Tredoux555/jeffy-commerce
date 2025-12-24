import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
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

interface DeliveryInput {
  latitude: number;
  longitude: number;
  zoneId: string;
  partnerId: string;
}

export async function POST(request: NextRequest) {
  console.log('=== CHECKOUT API STARTED ===');

  try {
    const body = await request.json();
    const { items, customer, paymentMethod, delivery } = body as {
      items: CartItemInput[];
      customer: CustomerInput;
      paymentMethod: 'payfast' | 'ozow' | 'eft';
      delivery?: DeliveryInput;
    };

    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let supabase;
    try {
      supabase = await createAdminClient();
    } catch (clientError) {
      return NextResponse.json({
        error: 'Failed to create Supabase client',
        details: clientError instanceof Error ? clientError.message : String(clientError)
      }, { status: 500 });
    }

    // Fetch products and calculate totals
    console.log('=== FETCHING PRODUCTS ===');
    const productIds = items.map((item) => item.productId);
    console.log('Product IDs to fetch:', productIds);

    let products;
    let productsError;
    try {
      const result = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);
      products = result.data;
      productsError = result.error;
    } catch (queryError) {
      return NextResponse.json({
        error: 'Product query threw exception',
        details: queryError instanceof Error ? queryError.message : String(queryError)
      }, { status: 500 });
    }

    if (productsError) {
      return NextResponse.json({
        error: 'PRODUCTS_ERROR_TRIGGERED',
        message: productsError.message || 'No message',
        code: productsError.code || 'No code',
        hint: productsError.hint || 'No hint',
        details: 'This confirms the Supabase query returned an error object'
      }, { status: 500 });
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        error: 'Products not found',
        productIds: productIds
      }, { status: 404 });
    }

    // Calculate order totals
    let subtotalCents = 0;
    let totalCostCents = 0;
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
      const itemCost = (product.cost_price_cents || 0) * item.quantity;
      subtotalCents += itemTotal;
      totalCostCents += itemCost;

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

    const orderNumber = generateOrderNumber();
    const totalCents = subtotalCents;

    // Calculate profit split (50/50 between platform and partner)
    const profitCents = totalCents - totalCostCents;
    const franchiseShareCents = Math.floor(profitCents / 2);
    const platformShareCents = profitCents - franchiseShareCents;

    // Generate QR code data (unique identifier for delivery)
    const qrCodeData = `JEFFY-${orderNumber}-${Date.now()}`;

    // Create order with delivery info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: '00000000-0000-0000-0000-000000000000', // Guest checkout - TODO: use real user
        delivery_latitude: delivery?.latitude || 0,
        delivery_longitude: delivery?.longitude || 0,
        delivery_address: `${customer.address}, ${customer.city}, ${customer.province}, ${customer.postalCode}`,
        zone_id: delivery?.zoneId || null,
        franchise_id: delivery?.partnerId || null,
        is_franchise_delivery: !!delivery?.partnerId,
        subtotal_cents: subtotalCents,
        total_cents: totalCents,
        profit_cents: profitCents,
        franchise_share_cents: franchiseShareCents,
        platform_share_cents: platformShareCents,
        payment_method: paymentMethod,
        payment_status: 'pending',
        status: 'pending_payment',
        tracking_number: qrCodeData,
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
    }

    // Create delivery record if partner is assigned
    if (delivery?.partnerId) {
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .insert({
          order_id: order.id,
          franchisee_id: delivery.partnerId,
          qr_code: qrCodeData,
          status: 'pending',
          scheduled_date: new Date().toISOString().split('T')[0], // Today
          recipient_name: `${customer.firstName} ${customer.lastName}`,
          recipient_phone: customer.phone,
        });

      if (deliveryError) {
        console.error('Delivery creation error:', deliveryError);
      } else {
        // Update partner's total deliveries count
        await supabase.rpc('increment_partner_deliveries', {
          p_partner_id: delivery.partnerId,
        });
      }
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

      const params = new URLSearchParams(data);
      return NextResponse.json({
        orderNumber,
        redirectUrl: `${payfastUrl}?${params.toString()}`,
      });
    }

    if (paymentMethod === 'ozow') {
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
    // Return comprehensive error details since console.log doesn't work
    const errorDetails = {
      error: 'Checkout failed',
      errorType: typeof error,
      isErrorInstance: error instanceof Error,
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error,
      timestamp: new Date().toISOString(),
      phase: 'unknown - exception thrown before detailed logging'
    };

    return NextResponse.json(errorDetails, { status: 500 });
  }
}