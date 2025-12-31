import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List public wants with vote counts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'voting';
  const limit = parseInt(searchParams.get('limit') || '50');
  const sortBy = searchParams.get('sort') || 'votes';

  let query = supabase
    .from('wants')
    .select('*')
    .eq('is_public', true);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (sortBy === 'votes') {
    query = query.order('vote_count', { ascending: false });
  } else if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: true });
  }

  query = query.limit(limit);

  const { data: wants, error } = await query;

  if (error) {
    console.error('Wants fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch wants' }, { status: 500 });
  }

  const { count: totalVoting } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'voting')
    .eq('is_public', true);

  const { count: totalSourcing } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sourcing')
    .eq('is_public', true);

  const { count: totalAvailable } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')
    .eq('is_public', true);

  return NextResponse.json({
    success: true,
    wants: wants || [],
    stats: {
      voting: totalVoting || 0,
      sourcing: totalSourcing || 0,
      available: totalAvailable || 0
    }
  });
}

// POST - Submit a new want
export async function POST(request: NextRequest) {
  try {
    const { product_name, description, category, user_email, user_name } = await request.json();

    if (!product_name || !user_email) {
      return NextResponse.json({ error: 'Product name and email required' }, { status: 400 });
    }

    // Check for duplicates
    const { data: existing } = await supabase
      .from('wants')
      .select('id, product_name, vote_count')
      .ilike('product_name', `%${product_name}%`)
      .eq('is_public', true)
      .limit(5);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: false,
        similar: existing,
        message: 'Similar products already requested. Vote for them instead!'
      });
    }

    // Get or create user
    let userId = null;
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', user_email.toLowerCase())
      .single();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({ email: user_email.toLowerCase(), name: user_name || null })
        .select('id')
        .single();
      if (userError) {
        console.error('User insert error:', userError);
        return NextResponse.json({ error: 'Failed to create user', debug: userError.message }, { status: 500 });
      }
      userId = newUser?.id;
    }

    // Create want
    const { data: want, error } = await supabase
      .from('wants')
      .insert({
        product_name,
        description: description || null,
        category: category || 'General',
        user_id: userId,
        vote_count: 1,
        status: 'voting',
        is_public: true,
        first_requester_rewarded: false
      })
      .select()
      .single();

    if (error) {
      console.error('Want insert error:', error);
      return NextResponse.json({ error: 'Failed to create want', debug: error.message }, { status: 500 });
    }

    // Add creator's vote
    await supabase.from('want_votes').insert({
      want_id: want.id,
      voter_email: user_email.toLowerCase()
    });

    return NextResponse.json({
      success: true,
      want,
      message: 'Product requested! Share it to get votes.'
    });

  } catch (error) {
    console.error('Want creation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
