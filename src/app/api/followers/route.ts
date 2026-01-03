import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/followers - Add a new follower
 * GET /api/followers - List all followers (admin)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, email, source, interests } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    // Clean phone number - remove spaces, ensure starts with country code
    let cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '27' + cleanPhone.substring(1);
    }
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }

    const supabase = await createClient();

    // Check if already exists
    const { data: existing } = await supabase
      .from('followers')
      .select('id, interests')
      .eq('phone', cleanPhone)
      .single();

    if (existing) {
      // Update interests if new ones provided
      if (interests && interests.length > 0) {
        const mergedInterests = [...new Set([...(existing.interests || []), ...interests])];
        await supabase
          .from('followers')
          .update({ 
            interests: mergedInterests,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Already following!',
        isExisting: true 
      });
    }

    // Insert new follower
    const { data, error } = await supabase
      .from('followers')
      .insert({
        phone: cleanPhone,
        name: name || null,
        email: email || null,
        source: source || 'website',
        interests: interests || ['general']
      })
      .select()
      .single();

    if (error) {
      console.error('Follower insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'You\'re now following!',
      follower: data 
    });

  } catch (error: any) {
    console.error('Follower API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const status = searchParams.get('status') || 'active';

    let query = supabase
      .from('followers')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (source) {
      query = query.eq('source', source);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0,
      followers: data 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
