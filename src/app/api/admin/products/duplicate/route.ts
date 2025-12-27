import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();
    const supabase = await createClient();

    // Get the original product
    const { data: original, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError || !original) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create duplicate with modified fields
    const timestamp = Date.now();
    const duplicate = {
      ...original,
      id: undefined, // Let DB generate new ID
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${timestamp}`,
      sku: original.sku ? `${original.sku}-COPY` : null,
      status: 'draft',
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    delete duplicate.id;

    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert(duplicate)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      productId: newProduct.id,
      message: 'Product duplicated'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
