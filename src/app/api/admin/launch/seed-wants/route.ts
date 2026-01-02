import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jeffy.co.za';
const SEED_EMAIL = 'launch@jeffy.co.za';

// Price data for our seed products
const PRICE_DATA: Record<string, { china_price: string; sa_price: string; markup: string }> = {
  "Archery Thumb-Button Release Aid (4-Finger)": { china_price: "R132", sa_price: "R5,860", markup: "44x" },
  "Junxing M128 Compound Bow (30-70lbs)": { china_price: "R3,312", sa_price: "R5,500", markup: "1.7x" },
  "5-Pin Bow Sight with 6x Magnifier Lens": { china_price: "R528", sa_price: "R10,317", markup: "20x" },
  "TWS Bluetooth Earbuds with Charging Case": { china_price: "R24", sa_price: "R249", markup: "10x" },
  "5M RGB LED Strip Lights with Remote": { china_price: "R43", sa_price: "R249", markup: "6x" }
};

function generateReferralCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

// GET - Fetch existing seed wants
export async function GET() {
  try {
    // Get wants created by our seed email
    const { data: wants, error } = await supabase
      .from('wants')
      .select('id, product_name, description, category, verified_count, status, creator_referral_code, created_at')
      .eq('creator_email', SEED_EMAIL)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch seed wants' }, { status: 500 });
    }

    // Enrich with price data and share links
    const enrichedWants = (wants || []).map(want => {
      const prices = PRICE_DATA[want.product_name] || { china_price: '?', sa_price: '?', markup: '?' };
      return {
        id: want.id,
        product_name: want.product_name,
        category: want.category,
        verified_count: want.verified_count || 0,
        status: want.status,
        share_link: `${SITE_URL}/want/${want.id}?ref=${want.creator_referral_code}`,
        china_price: prices.china_price,
        sa_price: prices.sa_price,
        markup: prices.markup
      };
    });

    return NextResponse.json({ success: true, wants: enrichedWants });
  } catch (err) {
    console.error('GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Create seed wants
export async function POST(request: NextRequest) {
  try {
    const { products } = await request.json();

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Products array required' }, { status: 400 });
    }

    // Check if seed wants already exist
    const { data: existing } = await supabase
      .from('wants')
      .select('id')
      .eq('creator_email', SEED_EMAIL)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ 
        error: 'Seed wants already exist. Delete them first to recreate.',
        existing: true 
      }, { status: 400 });
    }

    const created = [];
    const errors = [];

    for (const product of products) {
      const referralCode = generateReferralCode();
      
      const wantData = {
        product_name: product.product_name,
        description: product.description,
        category: product.category || 'General',
        creator_email: SEED_EMAIL,
        creator_referral_code: referralCode,
        status: 'voting',
        is_public: true,
        verified_count: 0,
        vote_count: 0,
        popularity_clicks: 0,
        // Mark as verified so it shows immediately
        is_creator_verified: true
      };

      const { data, error } = await supabase
        .from('wants')
        .insert(wantData)
        .select()
        .single();

      if (error) {
        console.error('Insert error for', product.product_name, error);
        errors.push({ product: product.product_name, error: error.message });
      } else {
        created.push({
          id: data.id,
          product_name: data.product_name,
          share_link: `${SITE_URL}/want/${data.id}?ref=${referralCode}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      created: created.length,
      errors: errors.length > 0 ? errors : undefined,
      wants: created
    });

  } catch (err) {
    console.error('POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Remove all seed wants (for testing)
export async function DELETE() {
  try {
    // First delete any verifications for these wants
    const { data: wants } = await supabase
      .from('wants')
      .select('id')
      .eq('creator_email', SEED_EMAIL);

    if (wants && wants.length > 0) {
      const wantIds = wants.map(w => w.id);
      
      // Delete verifications
      await supabase
        .from('want_verifications')
        .delete()
        .in('want_id', wantIds);
    }

    // Delete the wants
    const { error } = await supabase
      .from('wants')
      .delete()
      .eq('creator_email', SEED_EMAIL);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete seed wants' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Seed wants deleted' });
  } catch (err) {
    console.error('DELETE error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
