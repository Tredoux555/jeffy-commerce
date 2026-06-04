import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { generateOrderNumber } from '@/lib/utils';
import { routeOrder } from '@/lib/distributors/routing';
import { VAT_REGISTERED, splitInclusive } from '@/lib/vat';
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

    console.log('Supabase query result:', { data: products, error: productsError });

    if (productsError) {
      console.error('PRODUCTS ERROR DETAILS:', JSON.stringify(productsError, null, 2));
      return NextResponse.json({
        error: 'Failed to fetch products',
        details: productsError.message || 'Unknown error',
        code: productsError.code || 'NO_CODE',
        fullError: productsError
      }, { status: 500 });
    }

    if (!products || products.length === 0) {
      console.error('No products found for IDs:', productIds);
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
      // Use true landed cost when available; fall back to legacy cost_price_cents.
      const unitCost = product.landed_cost_cents ?? product.cost_price_cents ?? 0;
      const itemCost = unitCost * item.quantity;
      subtotalCents += itemTotal;
      totalCostCents += itemCost;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        variant_id: item.variantId || null,
        variant_name: null,
        quantity: item.quantity,
        unit_price_cents: product.selling_price_cents,
        unit_cost_cents: unitCost,
        total_cents: itemTotal,
      });
    }

    const orderNumber = generateOrderNumber();
    const totalCents = subtotalCents;
    
    // Gross profit. Seller margin is handled by the two-tier split below (buy-sell model);
    // the legacy 50/50 franchise split is retired.
    const profitCents = totalCents - totalCostCents;

    // Generate QR code data (unique identifier for delivery)
    const qrCodeData = `JEFFY-${orderNumber}-${Date.now()}`;

    // Resolve a customer identity by email (best-effort) so orders aren't anonymous.
    let resolvedUserId = '00000000-0000-0000-0000-000000000000';
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', customer.email)
        .maybeSingle();
      if (existingUser?.id) resolvedUserId = existingUser.id as string;
    } catch {
      // users lookup is best-effort; fall back to the guest placeholder
    }

    // Create order with delivery info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: resolvedUserId,
        customer_email: customer.email,
        customer_name: `${customer.firstName} ${customer.lastName}`.trim(),
        customer_phone: customer.phone,
        delivery_latitude: delivery?.latitude || 0,
        delivery_longitude: delivery?.longitude || 0,
        delivery_address: `${customer.address}, ${customer.city}, ${customer.province}, ${customer.postalCode}`,
        zone_id: null,
        franchise_id: null,
        is_franchise_delivery: false,
        subtotal_cents: subtotalCents,
        total_cents: totalCents,
        profit_cents: profitCents,
        franchise_share_cents: 0,
        platform_share_cents: profitCents,
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

    // --- Reseller network: route to nearest reseller + two-tier split ---
    // Additive and defensive: if the distributor columns/tables aren't present
    // yet (pre-migration), this logs and is skipped without breaking checkout.
    let splitMerchantId: string | null = null;
    let splitAmountCents = 0;
    try {
      const patch: Record<string, unknown> = {};

      // Two-tier split from wholesale prices when every line has one.
      let wholesaleTotal = 0;
      let haveWholesale = true;
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        const w = (product as { wholesale_price_cents?: number | null } | undefined)?.wholesale_price_cents;
        if (w == null) { haveWholesale = false; break; }
        wholesaleTotal += w * item.quantity;
      }
      let sellerMarginCents = 0;
      if (haveWholesale) {
        sellerMarginCents = Math.max(subtotalCents - wholesaleTotal, 0);
        patch.jeffy_wholesale_cents = wholesaleTotal;
        patch.seller_margin_cents = sellerMarginCents;
        // VAT ends at the wholesale leg: record Jeffy's output VAT on the wholesale
        // supply when registered (resellers are too small to register).
        if (VAT_REGISTERED) {
          const { netCents, vatCents } = splitInclusive(wholesaleTotal);
          patch.vat_cents = vatCents;
          patch.net_wholesale_cents = netCents;
        }
      }

      // Stock-aware geo-routing: nearest active reseller that holds every line in stock.
      if (delivery?.latitude && delivery?.longitude) {
        const outcome = await routeOrder(
          delivery.latitude,
          delivery.longitude,
          items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
        );
        if (outcome.result) {
          patch.distributor_id = outcome.result.distributor.id;
          patch.routing_status = 'routed';
          // Real-time PayFast Split: pay the seller's margin straight to their PayFast
          // merchant account. If they're not PayFast-enabled, the webhook accrues the
          // margin as a withdrawable ledger credit instead (fallback).
          const merchantId = outcome.result.distributor.payfast_merchant_id;
          if (merchantId && sellerMarginCents > 0) {
            splitMerchantId = merchantId;
            splitAmountCents = sellerMarginCents;
            patch.split_to_merchant_id = merchantId;
            patch.split_amount_cents = sellerMarginCents;
          }
        } else {
          // No reseller could fulfil — flag for admin assignment / Jeffy-direct.
          patch.routing_status = outcome.reason;
        }
      }

      if (Object.keys(patch).length > 0) {
        const { error: routeError } = await supabase.from('orders').update(patch).eq('id', order.id);
        if (routeError) console.error('Reseller routing/split (non-fatal):', routeError.message);
      }
    } catch (e) {
      console.error('Reseller routing/split threw (non-fatal):', e instanceof Error ? e.message : String(e));
    }

    // (Legacy franchise delivery record removed — the buy-sell model dispatches stock
    //  to resellers via the distributor ledger, not per-order delivery rows.)

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

      // PayFast Split Payments: route the seller's margin to their merchant account in
      // real time. Placed before signature so it's included in the hash.
      if (splitMerchantId && splitAmountCents > 0 && Number.isFinite(Number(splitMerchantId))) {
        data.setup = JSON.stringify({
          split_payment: {
            merchant_id: Number(splitMerchantId),
            amount: splitAmountCents,
            percentage: 0,
            min: 100,
            max: splitAmountCents,
          },
        });
      }

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
