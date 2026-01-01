import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List all categories
export async function GET() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ categories });
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, parent_id, image_url, sort_order, is_active } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug required' }, { status: 400 });
    }

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        description: description || null,
        parent_id: parent_id || null,
        image_url: image_url || null,
        sort_order: sort_order || 0,
        is_active: is_active ?? true
      })
      .select()
      .single();

    if (error) {
      console.error('Category create error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    console.error('Category create exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
