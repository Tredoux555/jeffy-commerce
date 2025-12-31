import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all wants for admin
export async function GET() {
  try {
    const { data: wants, error } = await supabase
      .from('wants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, wants: wants || [] });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// PATCH - Update want status
export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 });
    }

    const validStatuses = ['voting', 'active', 'sourcing', 'available'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const { error } = await supabase
      .from('wants')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Delete a want
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    // First delete verifications
    await supabase
      .from('want_verifications')
      .delete()
      .eq('want_id', id);

    // Delete votes
    await supabase
      .from('want_votes')
      .delete()
      .eq('want_id', id);

    // Then delete the want
    const { error } = await supabase
      .from('wants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
