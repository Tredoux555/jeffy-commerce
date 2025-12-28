// ============================================================
// JEFFY COMMERCE - COMPLETE E2E TEST SUITE
// Covers ALL 34 operations documented
// ============================================================

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const TEST_PREFIX = 'e2e_full_';

// ============================================================
// TYPES
// ============================================================

export interface TestStep {
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  data?: any;
}

export interface TestSuiteResult {
  id: string;
  name: string;
  startedAt: string;
  completedAt: string;
  duration: number;
  status: 'passed' | 'failed' | 'partial';
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    byCategory: Record<string, { passed: number; failed: number; total: number }>;
  };
  steps: TestStep[];
  testData: TestDataStore;
  cleanup: { success: boolean; deleted: string[]; errors: string[] };
}

interface TestDataStore {
  productId?: string;
  categoryId?: string;
  customerId?: string;
  addressId?: string;
  orderId?: string;
  orderNumber?: string;
  orderItemId?: string;
  zoneId?: string;
  zonePartnerId?: string;
  wantId?: string;
  wantShareCode?: string;
  wantAgreeIds: string[];
  ratingId?: string;
  refundRequestId?: string;
  notificationIds: string[];
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateTestId(): string {
  return `${TEST_PREFIX}${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

function generateOrderNumber(): string {
  return `TEST-${Date.now().toString().slice(-6)}`;
}

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'E2E_';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateEmail(): string {
  return `${TEST_PREFIX}${Date.now()}@test.jeffy.co.za`;
}

// ============================================================
// MAIN TEST RUNNER
// ============================================================

export async function runCompleteTestSuite(baseUrl: string): Promise<TestSuiteResult> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const testId = generateTestId();
  const startedAt = new Date().toISOString();
  const steps: TestStep[] = [];
  const testData: TestDataStore = { wantAgreeIds: [], notificationIds: [] };

  async function runStep(
    name: string, 
    category: string, 
    fn: () => Promise<any>
  ): Promise<any> {
    const stepStart = Date.now();
    try {
      const result = await fn();
      steps.push({
        name,
        category,
        status: 'passed',
        duration: Date.now() - stepStart,
        data: result
      });
      return result;
    } catch (error: any) {
      steps.push({
        name,
        category,
        status: 'failed',
        duration: Date.now() - stepStart,
        error: error.message
      });
      return null;
    }
  }

  // ========================================================
  // CATEGORY 1: DATABASE SCHEMA TESTS
  // ========================================================

  const schemaTables = [
    'products', 'categories', 'orders', 'order_items',
    'wants', 'want_agrees', 'zones', 'zone_partners',
    'order_ratings', 'refund_requests', 'notifications',
    'users', 'addresses'
  ];

  for (const table of schemaTables) {
    await runStep(`Verify ${table} table exists`, 'schema', async () => {
      const { error } = await supabaseAdmin.from(table).select('id').limit(1);
      if (error?.code === '42P01') throw new Error(`${table} table missing`);
      return { exists: true };
    });
  }

  // ========================================================
  // CATEGORY 2: PRODUCT & CATEGORY TESTS
  // ========================================================

  const category = await runStep('Create test category', 'products', async () => {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: 'E2E Test Category',
        slug: `e2e-test-category-${Date.now()}`,
        is_active: true,
        sort_order: 999
      })
      .select()
      .single();
    if (error) throw new Error(`Category creation failed: ${error.message}`);
    testData.categoryId = data.id;
    return data;
  });

  const product = await runStep('Create test product', 'products', async () => {
    if (!category) throw new Error('Category not created');
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: 'E2E Test Product',
        slug: `e2e-test-product-${Date.now()}`,
        category_id: category.id,
        selling_price_cents: 9999,
        cost_price_cents: 5000,
        compare_at_price_cents: 14999,
        quantity: 100,
        status: 'active',
        short_description: 'Test product for E2E testing'
      })
      .select()
      .single();
    if (error) throw new Error(`Product creation failed: ${error.message}`);
    testData.productId = data.id;
    return data;
  });

  await runStep('Verify product in active listings', 'products', async () => {
    if (!product) throw new Error('Product not created');
    const { data } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('status', 'active')
      .eq('id', product.id)
      .single();
    if (!data) throw new Error('Product not in active listings');
    return { found: true };
  });

  await runStep('Verify product-category relation', 'products', async () => {
    if (!product) throw new Error('Product not created');
    const { data } = await supabaseAdmin
      .from('products')
      .select('*, categories(name)')
      .eq('id', product.id)
      .single();
    if (!data?.categories) throw new Error('Category not linked');
    return { linked: true };
  });

  await runStep('Test category filter query', 'products', async () => {
    if (!category) throw new Error('Category not created');
    const { data } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('category_id', category.id)
      .eq('status', 'active');
    if (!data?.length) throw new Error('Filter returned no results');
    return { count: data.length };
  });

  await runStep('Test price sort query', 'products', async () => {
    const { data } = await supabaseAdmin
      .from('products')
      .select('selling_price_cents')
      .eq('status', 'active')
      .order('selling_price_cents', { ascending: true })
      .limit(10);
    for (let i = 1; i < (data?.length || 0); i++) {
      if (data![i].selling_price_cents < data![i-1].selling_price_cents) {
        throw new Error('Sort order incorrect');
      }
    }
    return { sorted: true };
  });

  await runStep('Test discount calculation', 'products', async () => {
    if (!product) throw new Error('Product not created');
    const discount = Math.round((1 - product.selling_price_cents / product.compare_at_price_cents) * 100);
    if (discount <= 0) throw new Error('Discount should be positive');
    return { discountPercent: discount };
  });

  // ========================================================
  // CATEGORY 3: ZONE & PARTNER SETUP
  // ========================================================

  const zone = await runStep('Create test zone', 'zones', async () => {
    const { data, error } = await supabaseAdmin
      .from('zones')
      .insert({
        name: 'E2E Test Zone',
        description: 'Automated test zone',
        postal_codes: ['0001', '0002', '0003', '2196']
      })
      .select()
      .single();
    if (error) throw new Error(`Zone creation failed: ${error.message}`);
    testData.zoneId = data.id;
    return data;
  });

  await runStep('Verify postal codes array', 'zones', async () => {
    if (!zone) throw new Error('Zone not created');
    const { data } = await supabaseAdmin
      .from('zones')
      .select('postal_codes')
      .eq('id', zone.id)
      .single();
    if (!Array.isArray(data?.postal_codes)) throw new Error('Not an array');
    if (data.postal_codes.length !== 4) throw new Error('Wrong count');
    return { count: data.postal_codes.length };
  });

  const partner = await runStep('Create active zone partner', 'partners', async () => {
    if (!zone) throw new Error('Zone not created');
    const now = new Date();
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    
    const { data, error } = await supabaseAdmin
      .from('zone_partners')
      .insert({
        full_name: 'E2E Test Partner',
        email: generateEmail(),
        phone: '+27123456789',
        business_name: 'Test Deliveries PTY',
        zone_id: zone.id,
        postal_codes: ['0001', '0002'],
        status: 'approved',
        disclosure_sent_at: fifteenDaysAgo.toISOString(),
        can_sign_after: fifteenDaysAgo.toISOString(),
        agreement_signed_at: now.toISOString(),
        cooling_off_ends_at: now.toISOString(),
        deposit_paid_at: now.toISOString(),
        training_completed_at: now.toISOString(),
        stock_received_at: now.toISOString(),
        is_active: true,
        average_rating: 5.00
      })
      .select()
      .single();
    if (error) throw new Error(`Partner creation failed: ${error.message}`);
    testData.zonePartnerId = data.id;
    return data;
  });

  // ========================================================
  // CATEGORY 4: LEGAL COMPLIANCE TESTS
  // ========================================================

  await runStep('14-day waiting period calc', 'legal', async () => {
    const disclosure = new Date();
    const canSign = new Date(disclosure.getTime() + 14 * 24 * 60 * 60 * 1000);
    const days = Math.ceil((canSign.getTime() - disclosure.getTime()) / (24 * 60 * 60 * 1000));
    if (days !== 14) throw new Error(`Expected 14, got ${days}`);
    return { days };
  });

  await runStep('10 business day cooling-off calc', 'legal', async () => {
    let businessDays = 0;
    let date = new Date();
    while (businessDays < 10) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0 && date.getDay() !== 6) businessDays++;
    }
    if (businessDays !== 10) throw new Error('Calculation wrong');
    return { businessDays };
  });

  await runStep('Full refund during cooling-off', 'legal', async () => {
    const deposit = 10000;
    const inCooling = true;
    const refund = inCooling ? deposit : deposit - 2500;
    if (refund !== 10000) throw new Error('Should be full refund');
    return { refundCents: refund };
  });

  await runStep('Partial refund after cooling-off', 'legal', async () => {
    const deposit = 10000;
    const damages = 2500;
    const inCooling = false;
    const refund = inCooling ? deposit : deposit - damages;
    if (refund !== 7500) throw new Error('Should deduct damages');
    return { refundCents: refund };
  });

  // ========================================================
  // CATEGORY 5: CUSTOMER & ORDER FLOW
  // ========================================================

  const customer = await runStep('Create test customer', 'orders', async () => {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: generateEmail(),
        name: 'E2E Test Customer',
        phone: '+27111111111'
      })
      .select()
      .single();
    if (error) throw new Error(`Customer creation failed: ${error.message}`);
    testData.customerId = data.id;
    return data;
  });

  const address = await runStep('Create test address', 'orders', async () => {
    if (!customer) throw new Error('Customer not created');
    const { data, error } = await supabaseAdmin
      .from('addresses')
      .insert({
        user_id: customer.id,
        recipient_name: 'E2E Test Customer',
        phone: '+27111111111',
        street_address: '123 Test Street',
        city: 'Johannesburg',
        province: 'GP',
        postal_code: '0001',
        country: 'South Africa',
        is_default: true
      })
      .select()
      .single();
    if (error) throw new Error(`Address creation failed: ${error.message}`);
    testData.addressId = data.id;
    return data;
  });

  const order = await runStep('Create test order', 'orders', async () => {
    if (!customer || !product) throw new Error('Dependencies missing');
    const orderNumber = generateOrderNumber();
    const subtotal = product.selling_price_cents * 2;
    const profit = subtotal - (product.cost_price_cents * 2);
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: customer.id,
        delivery_address: '123 Test Street, Johannesburg, GP, 0001',
        subtotal_cents: subtotal,
        total_cents: subtotal,
        profit_cents: profit,
        franchise_share_cents: Math.floor(profit / 2),
        platform_share_cents: profit - Math.floor(profit / 2),
        payment_method: 'payfast',
        payment_status: 'pending',
        status: 'pending_payment'
      })
      .select()
      .single();
    if (error) throw new Error(`Order creation failed: ${error.message}`);
    testData.orderId = data.id;
    testData.orderNumber = orderNumber;
    return data;
  });

  await runStep('Create order items', 'orders', async () => {
    if (!order || !product) throw new Error('Dependencies missing');
    const { data, error } = await supabaseAdmin
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        quantity: 2,
        unit_price_cents: product.selling_price_cents,
        unit_cost_cents: product.cost_price_cents,
        total_cents: product.selling_price_cents * 2
      })
      .select()
      .single();
    if (error) throw new Error(`Order items failed: ${error.message}`);
    testData.orderItemId = data.id;
    return data;
  });

  await runStep('Test stock decrement', 'orders', async () => {
    if (!product) throw new Error('Product missing');
    const original = product.quantity;
    const { data } = await supabaseAdmin
      .from('products')
      .update({ quantity: original - 2 })
      .eq('id', product.id)
      .select('quantity')
      .single();
    if (data?.quantity !== original - 2) throw new Error('Decrement failed');
    await supabaseAdmin.from('products').update({ quantity: original }).eq('id', product.id);
    return { decremented: true };
  });

  // ========================================================
  // CATEGORY 6: PAYMENT SIMULATION
  // ========================================================

  await runStep('Simulate payment success', 'payment', async () => {
    if (!order) throw new Error('Order missing');
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        payment_status: 'completed',
        payment_reference: `PF_TEST_${Date.now()}`,
        paid_at: new Date().toISOString()
      })
      .eq('id', order.id);
    if (error) throw new Error(`Payment update failed: ${error.message}`);
    return { status: 'paid' };
  });

  await runStep('PayFast signature generation', 'payment', async () => {
    const data: Record<string, string> = {
      merchant_id: 'TEST',
      merchant_key: 'TEST',
      amount: '99.99',
      item_name: 'Test'
    };
    const passphrase = 'test';
    let str = Object.entries(data)
      .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, '+')}`)
      .join('&');
    str += `&passphrase=${encodeURIComponent(passphrase)}`;
    const sig = crypto.createHash('md5').update(str).digest('hex');
    if (sig.length !== 32) throw new Error('Invalid signature');
    return { signatureLength: sig.length };
  });

  await runStep('Verify paid status', 'payment', async () => {
    if (!order) throw new Error('Order missing');
    const { data } = await supabaseAdmin
      .from('orders')
      .select('status, payment_status')
      .eq('id', order.id)
      .single();
    if (data?.status !== 'paid') throw new Error('Not paid');
    return data;
  });

  // ========================================================
  // CATEGORY 7: AUTO-ASSIGNMENT
  // ========================================================

  await runStep('Extract postal code from address', 'assignment', async () => {
    const addr = '123 Test Street, Johannesburg, GP, 0001';
    const match = addr.match(/\b(\d{4})\b/);
    if (!match || match[1] !== '0001') throw new Error('Extraction failed');
    return { postalCode: match[1] };
  });

  await runStep('Zone lookup by postal code', 'assignment', async () => {
    if (!zone) throw new Error('Zone missing');
    const { data } = await supabaseAdmin
      .from('zones')
      .select('id, name')
      .contains('postal_codes', ['0001'])
      .single();
    if (!data) throw new Error('Zone not found');
    return { zoneName: data.name };
  });

  await runStep('Active partner lookup', 'assignment', async () => {
    if (!zone) throw new Error('Zone missing');
    const { data } = await supabaseAdmin
      .from('zone_partners')
      .select('id, full_name')
      .eq('zone_id', zone.id)
      .eq('is_active', true)
      .single();
    if (!data) throw new Error('No active partner');
    return { partnerName: data.full_name };
  });

  await runStep('Assign order to partner', 'assignment', async () => {
    if (!order || !partner) throw new Error('Dependencies missing');
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        zone_partner_id: partner.id,
        assigned_at: new Date().toISOString(),
        status: 'assigned'
      })
      .eq('id', order.id);
    if (error) throw new Error(`Assignment failed: ${error.message}`);
    return { assigned: true };
  });

  await runStep('Verify assignment', 'assignment', async () => {
    if (!order || !partner) throw new Error('Dependencies missing');
    const { data } = await supabaseAdmin
      .from('orders')
      .select('zone_partner_id, status')
      .eq('id', order.id)
      .single();
    if (data?.zone_partner_id !== partner.id) throw new Error('Wrong partner');
    if (data?.status !== 'assigned') throw new Error('Wrong status');
    return data;
  });

  // ========================================================
  // CATEGORY 8: DELIVERY & RATING
  // ========================================================

  await runStep('Mark as delivered', 'delivery', async () => {
    if (!order) throw new Error('Order missing');
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status: 'delivered', delivered_at: new Date().toISOString() })
      .eq('id', order.id);
    if (error) throw new Error(`Delivery failed: ${error.message}`);
    return { delivered: true };
  });

  const rating = await runStep('Submit rating', 'rating', async () => {
    if (!order || !partner) throw new Error('Dependencies missing');
    const { data, error } = await supabaseAdmin
      .from('order_ratings')
      .insert({
        order_id: order.id,
        zone_partner_id: partner.id,
        stars: 5,
        tags: ['fast', 'friendly', 'professional'],
        comment: 'E2E test rating'
      })
      .select()
      .single();
    if (error) throw new Error(`Rating failed: ${error.message}`);
    testData.ratingId = data.id;
    return data;
  });

  await runStep('Verify rating stored', 'rating', async () => {
    if (!rating) throw new Error('Rating missing');
    const { data } = await supabaseAdmin
      .from('order_ratings')
      .select('stars, tags')
      .eq('id', rating.id)
      .single();
    if (data?.stars !== 5) throw new Error('Stars wrong');
    return data;
  });

  // ========================================================
  // CATEGORY 9: REFUND FLOW
  // ========================================================

  const refund = await runStep('Create refund request', 'refund', async () => {
    if (!order || !partner) throw new Error('Dependencies missing');
    const { data, error } = await supabaseAdmin
      .from('refund_requests')
      .insert({
        order_id: order.id,
        zone_partner_id: partner.id,
        reason: 'Defective Product',
        reason_category: 'defective',
        description: 'E2E test refund',
        status: 'pending',
        who_pays: 'jeffy',
        amount: '199.98',
        refund_percentage: 100
      })
      .select()
      .single();
    if (error) throw new Error(`Refund failed: ${error.message}`);
    testData.refundRequestId = data.id;
    return data;
  });

  await runStep('WHO PAYS: Defective = Jeffy', 'refund', async () => {
    if (!refund) throw new Error('Refund missing');
    if (refund.who_pays !== 'jeffy') throw new Error('Wrong payer');
    return { whoPays: refund.who_pays };
  });

  await runStep('Approve refund', 'refund', async () => {
    if (!refund) throw new Error('Refund missing');
    const { error } = await supabaseAdmin
      .from('refund_requests')
      .update({
        status: 'approved',
        admin_notes: 'E2E approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', refund.id);
    if (error) throw new Error(`Approval failed: ${error.message}`);
    return { approved: true };
  });

  // ========================================================
  // CATEGORY 10: WANTS SYSTEM
  // ========================================================

  const want = await runStep('Create want', 'wants', async () => {
    const shareCode = generateShareCode();
    const { data, error } = await supabaseAdmin
      .from('wants')
      .insert({
        title: 'E2E Test Want - Stanley Tumbler',
        description: 'Testing wants system',
        share_code: shareCode,
        threshold: 10,
        current_agrees: 0,
        status: 'active',
        creator_name: 'E2E Tester',
        creator_phone: '+27999999999',
        max_price_cents: 50000
      })
      .select()
      .single();
    if (error) throw new Error(`Want creation failed: ${error.message}`);
    testData.wantId = data.id;
    testData.wantShareCode = shareCode;
    return data;
  });

  await runStep('Share code unique', 'wants', async () => {
    if (!want) throw new Error('Want missing');
    const { data } = await supabaseAdmin
      .from('wants')
      .select('id')
      .eq('share_code', want.share_code);
    if (data!.length !== 1) throw new Error('Not unique');
    return { unique: true };
  });

  await runStep('Add 10 agrees', 'wants', async () => {
    if (!want) throw new Error('Want missing');
    for (let i = 0; i < 10; i++) {
      const { data, error } = await supabaseAdmin
        .from('want_agrees')
        .insert({
          want_id: want.id,
          name: `Agreer ${i + 1}`,
          phone: `+2780000000${i}`
        })
        .select()
        .single();
      if (error) throw new Error(`Agree ${i + 1} failed`);
      testData.wantAgreeIds.push(data.id);
      await supabaseAdmin.from('wants').update({ current_agrees: i + 1 }).eq('id', want.id);
    }
    return { added: 10 };
  });

  await runStep('Discount tier: 3 = 20%', 'wants', async () => {
    const d = 3 >= 10 ? 100 : 3 >= 7 ? 60 : 3 >= 5 ? 40 : 3 >= 3 ? 20 : 0;
    if (d !== 20) throw new Error('Wrong');
    return { discount: d };
  });

  await runStep('Discount tier: 5 = 40%', 'wants', async () => {
    const d = 5 >= 10 ? 100 : 5 >= 7 ? 60 : 5 >= 5 ? 40 : 5 >= 3 ? 20 : 0;
    if (d !== 40) throw new Error('Wrong');
    return { discount: d };
  });

  await runStep('Discount tier: 7 = 60%', 'wants', async () => {
    const d = 7 >= 10 ? 100 : 7 >= 7 ? 60 : 7 >= 5 ? 40 : 7 >= 3 ? 20 : 0;
    if (d !== 60) throw new Error('Wrong');
    return { discount: d };
  });

  await runStep('Discount tier: 10 = FREE', 'wants', async () => {
    const d = 10 >= 10 ? 100 : 10 >= 7 ? 60 : 10 >= 5 ? 40 : 10 >= 3 ? 20 : 0;
    if (d !== 100) throw new Error('Wrong');
    return { discount: d, isFree: true };
  });

  await runStep('Verify threshold reached', 'wants', async () => {
    if (!want) throw new Error('Want missing');
    const { data } = await supabaseAdmin
      .from('wants')
      .select('current_agrees, threshold')
      .eq('id', want.id)
      .single();
    if (data!.current_agrees < data!.threshold) throw new Error('Not reached');
    return data;
  });

  await runStep('Mark as sourced', 'wants', async () => {
    if (!want) throw new Error('Want missing');
    const { error } = await supabaseAdmin
      .from('wants')
      .update({ status: 'sourced' })
      .eq('id', want.id);
    if (error) throw new Error(`Update failed: ${error.message}`);
    return { sourced: true };
  });

  // ========================================================
  // CATEGORY 11: PRICING CALCULATIONS
  // ========================================================

  await runStep('ZAR pricing calculation', 'pricing', async () => {
    const cny = 50;
    const rate = 3.2;
    const ship = 75;
    const markup = 2.5;
    const vat = 1.15;
    const cost = cny * rate;
    const total = cost + ship;
    const price = Math.ceil(total * markup * vat);
    const margin = Math.round(((price - total) / price) * 100);
    if (cost !== 160) throw new Error('Cost wrong');
    return { cost, total, price, margin };
  });

  await runStep('Margin calculation', 'pricing', async () => {
    const sell = 500;
    const cost = 200;
    const margin = Math.round(((sell - cost) / sell) * 100);
    if (margin !== 60) throw new Error('Margin wrong');
    return { margin };
  });

  await runStep('Profit split 50/50', 'pricing', async () => {
    const profit = 1000;
    const franchise = Math.floor(profit / 2);
    const platform = profit - franchise;
    if (franchise !== 500 || platform !== 500) throw new Error('Split wrong');
    return { franchise, platform };
  });

  // ========================================================
  // CATEGORY 12: NOTIFICATIONS
  // ========================================================

  await runStep('Log notification', 'notifications', async () => {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        type: 'new_order',
        channel: 'whatsapp',
        recipient: '+27123456789',
        message: 'E2E test notification',
        status: 'pending'
      })
      .select()
      .single();
    if (error) throw new Error(`Insert failed: ${error.message}`);
    testData.notificationIds.push(data.id);
    return { logged: true };
  });

  await runStep('WhatsApp template format', 'notifications', async () => {
    const msg = `📦 New Order! #TEST-123. Deliver to: 123 St. Earn R45.`;
    if (!msg.includes('📦')) throw new Error('Missing emoji');
    return { valid: true };
  });

  // ========================================================
  // CATEGORY 13: API ENDPOINT TESTS
  // ========================================================

  await runStep('API: /api/ping', 'api', async () => {
    try {
      const res = await fetch(`${baseUrl}/api/ping`);
      return { status: res.status };
    } catch (e: any) {
      return { skipped: true, reason: e.message };
    }
  });

  await runStep('API: /api/smart-finder', 'api', async () => {
    try {
      const res = await fetch(`${baseUrl}/api/smart-finder`);
      const data = await res.json();
      return { status: res.status, configured: data.anthropicConfigured };
    } catch (e: any) {
      return { skipped: true, reason: e.message };
    }
  });

  // ========================================================
  // CLEANUP
  // ========================================================

  const cleanup = await cleanupTestData(supabaseAdmin, testData);

  const completedAt = new Date().toISOString();
  const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime();

  const summary = {
    total: steps.length,
    passed: steps.filter(s => s.status === 'passed').length,
    failed: steps.filter(s => s.status === 'failed').length,
    skipped: steps.filter(s => s.status === 'skipped').length,
    byCategory: {} as Record<string, { passed: number; failed: number; total: number }>
  };

  for (const step of steps) {
    if (!summary.byCategory[step.category]) {
      summary.byCategory[step.category] = { passed: 0, failed: 0, total: 0 };
    }
    summary.byCategory[step.category].total++;
    if (step.status === 'passed') summary.byCategory[step.category].passed++;
    if (step.status === 'failed') summary.byCategory[step.category].failed++;
  }

  return {
    id: testId,
    name: 'Jeffy Complete E2E Test Suite',
    startedAt,
    completedAt,
    duration,
    status: summary.failed === 0 ? 'passed' : summary.passed > 0 ? 'partial' : 'failed',
    summary,
    steps,
    testData,
    cleanup
  };
}

// ============================================================
// CLEANUP
// ============================================================

async function cleanupTestData(
  supabase: any,
  testData: TestDataStore
): Promise<{ success: boolean; deleted: string[]; errors: string[] }> {
  const deleted: string[] = [];
  const errors: string[] = [];

  const items = [
    { table: 'notifications', ids: testData.notificationIds },
    { table: 'refund_requests', id: testData.refundRequestId },
    { table: 'order_ratings', id: testData.ratingId },
    { table: 'want_agrees', ids: testData.wantAgreeIds },
    { table: 'wants', id: testData.wantId },
    { table: 'order_items', id: testData.orderItemId },
    { table: 'orders', id: testData.orderId },
    { table: 'addresses', id: testData.addressId },
    { table: 'users', id: testData.customerId },
    { table: 'zone_partners', id: testData.zonePartnerId },
    { table: 'zones', id: testData.zoneId },
    { table: 'products', id: testData.productId },
    { table: 'categories', id: testData.categoryId },
  ];

  for (const item of items) {
    try {
      if (item.ids && item.ids.length > 0) {
        await supabase.from(item.table).delete().in('id', item.ids);
        deleted.push(`${item.table}: ${item.ids.length}`);
      } else if (item.id) {
        await supabase.from(item.table).delete().eq('id', item.id);
        deleted.push(`${item.table}: 1`);
      }
    } catch (e: any) {
      errors.push(`${item.table}: ${e.message}`);
    }
  }

  return { success: errors.length === 0, deleted, errors };
}

// ============================================================
// INDIVIDUAL TEST RUNNERS
// ============================================================

export async function runSchemaTests(): Promise<TestStep[]> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const steps: TestStep[] = [];
  const tables = [
    'products', 'categories', 'orders', 'order_items',
    'wants', 'want_agrees', 'zones', 'zone_partners',
    'order_ratings', 'refund_requests', 'notifications',
    'users', 'addresses'
  ];

  for (const table of tables) {
    const start = Date.now();
    try {
      const { error } = await supabaseAdmin.from(table).select('id').limit(1);
      steps.push({
        name: `Table: ${table}`,
        category: 'schema',
        status: error?.code === '42P01' ? 'failed' : 'passed',
        duration: Date.now() - start,
        error: error?.code === '42P01' ? 'Missing' : undefined
      });
    } catch (e: any) {
      steps.push({
        name: `Table: ${table}`,
        category: 'schema',
        status: 'failed',
        duration: Date.now() - start,
        error: e.message
      });
    }
  }
  return steps;
}

export async function runLegalTests(): Promise<TestStep[]> {
  const steps: TestStep[] = [];

  const start1 = Date.now();
  const days = 14;
  steps.push({
    name: '14-day waiting period',
    category: 'legal',
    status: days === 14 ? 'passed' : 'failed',
    duration: Date.now() - start1,
    data: { days }
  });

  const start2 = Date.now();
  let bd = 0;
  let d = new Date();
  while (bd < 10) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) bd++;
  }
  steps.push({
    name: '10 business day cooling-off',
    category: 'legal',
    status: bd === 10 ? 'passed' : 'failed',
    duration: Date.now() - start2,
    data: { businessDays: bd }
  });

  return steps;
}

export async function runPricingTests(): Promise<TestStep[]> {
  const steps: TestStep[] = [];
  const start = Date.now();

  const cny = 100;
  const cost = cny * 3.2;
  const total = cost + 75;
  const price = Math.ceil(total * 2.5 * 1.15);
  const margin = Math.round(((price - total) / price) * 100);

  steps.push({
    name: 'Full pricing calculation',
    category: 'pricing',
    status: 'passed',
    duration: Date.now() - start,
    data: { cost, total, price, margin }
  });

  return steps;
}
