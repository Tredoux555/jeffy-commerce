import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  return NextResponse.json({ category });
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, slug, description, parent_id, image_url, sort_order, is_active } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug required' }, { status: 400 });
    }

    // Check for duplicate slug (excluding current category)
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', params.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Another category with this slug exists' }, { status: 400 });
    }

    const { data: category, error } = await supabase
      .from('categories')
      .update({
        name,
        slug,
        description: description || null,
        parent_id: parent_id || null,
        image_url: image_url || null,
        sort_order: sort_order || 0,
        is_active: is_active ?? true
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Category update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    console.error('Category update exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category has products
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', params.id);

    if (productCount && productCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete category with ${productCount} products. Move or delete products first.` 
      }, { status: 400 });
    }

    // Check if category has sub-categories
    const { count: childCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', params.id);

    if (childCount && childCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete category with ${childCount} sub-categories. Delete sub-categories first.` 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Category delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Category delete exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
