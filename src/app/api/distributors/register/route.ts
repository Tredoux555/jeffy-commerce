import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Public: a person applies to become a Jeffy distributor (independent reseller).
// Creates a distributor row with status 'pending' for admin approval.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      owner_name, phone, email, business_name,
      address, suburb, city, province, postal_code,
      latitude, longitude, coverage_area,
    } = body;

    if (!owner_name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Prevent duplicate pending/active application for the same phone.
    const { data: existing } = await supabase
      .from('distributors')
      .select('id, status')
      .eq('phone', phone)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'An application with this phone number already exists.',
      }, { status: 400 });
    }

    const { data: distributor, error } = await supabase
      .from('distributors')
      .insert({
        owner_name,
        phone,
        email: email || null,
        business_name: business_name || null,
        address: address || null,
        suburb: suburb || null,
        city: city || null,
        province: province || null,
        postal_code: postal_code || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        coverage_area: coverage_area || null,
        status: 'pending',
        phase: 'consignment',
        credit_limit_cents: 0,
        balance_owed_cents: 0,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Distributor register error:', error.message);
      return NextResponse.json({ error: 'Could not submit application. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: distributor?.id,
      message: 'Application received! We\'ll review and be in touch.',
    });
  } catch (e) {
    console.error('Distributor register exception:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
