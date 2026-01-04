import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET all suppliers (admin only)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch suppliers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch suppliers', suppliers: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({ suppliers: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', suppliers: [] },
      { status: 500 }
    );
  }
}

// PATCH - update supplier status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing id or status' },
        { status: 400 }
      );
    }

    if (!['pending', 'active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, active, or inactive.' },
        { status: 400 }
      );
    }

    const updateData: any = { 
      status,
      updated_at: new Date().toISOString(),
    };

    // Set verified_at when activating
    if (status === 'active') {
      updateData.verified_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update supplier:', error);
      return NextResponse.json(
        { error: 'Failed to update supplier' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      supplier: data,
      message: `Supplier ${status === 'active' ? 'approved' : 'updated'}` 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE - remove supplier
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing supplier id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete supplier:', error);
      return NextResponse.json(
        { error: 'Failed to delete supplier' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supplier deleted' 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
