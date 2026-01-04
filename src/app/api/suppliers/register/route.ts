import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, whatsapp, location_name, categories, bio } = body;

    // Validate required fields
    if (!name || !phone || !location_name || !categories || categories.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone, location_name, categories' },
        { status: 400 }
      );
    }

    // Clean phone number (remove spaces, dashes)
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const cleanWhatsapp = (whatsapp || phone).replace(/[\s-]/g, '');

    // Check if phone already registered
    const { data: existing } = await supabase
      .from('suppliers')
      .select('id')
      .eq('phone', cleanPhone)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This phone number is already registered. Contact us if you need to update your listing.' },
        { status: 409 }
      );
    }

    // Insert supplier
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        name,
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        location_name,
        categories,
        bio: bio || null,
        status: 'pending', // Needs admin approval
      })
      .select()
      .single();

    if (error) {
      console.error('Supplier registration error:', error);
      return NextResponse.json(
        { error: 'Failed to register. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! We will review and activate your profile within 24 hours.',
      supplier: {
        id: data.id,
        name: data.name,
        location: data.location_name,
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
