import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      throw new Error(`Missing Supabase config: URL=${!!url}, KEY=${!!key}`);
    }
    
    supabase = createClient(url, key);
  }
  return supabase;
}

// GET - Fetch all research or single entry
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    const db = getSupabase();
    
    // Single entry fetch
    if (id) {
      const { data, error } = await db
        .from('oem_research')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('GET single error:', error);
        return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
      }
      return NextResponse.json({ data });
    }
    
    // List fetch with filters
    let query = db
      .from('oem_research')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (status && status !== 'all') {
      query = query.eq('research_status', status);
    }
    
    if (search) {
      query = query.or(`product_name.ilike.%${search}%,brand_name.ilike.%${search}%,raw_research.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('GET list error:', error);
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
    }
    
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

// POST - Create new research entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST body:', JSON.stringify(body, null, 2));
    
    const db = getSupabase();
    
    const { data, error } = await db
      .from('oem_research')
      .insert([body])
      .select()
      .single();
    
    if (error) {
      console.error('POST error:', error);
      return NextResponse.json({ 
        error: error.message, 
        code: error.code, 
        details: error.details,
        hint: error.hint 
      }, { status: 500 });
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

// PUT - Update research entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const db = getSupabase();
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const { data, error } = await db
      .from('oem_research')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('PUT error:', error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE - Remove research entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = getSupabase();
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const { error } = await db
      .from('oem_research')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('DELETE error:', error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
