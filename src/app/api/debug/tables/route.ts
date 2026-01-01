import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Check if factories table exists
  try {
    const { data, error, count } = await supabase
      .from('factories')
      .select('*', { count: 'exact', head: true });
    
    results.checks.factories = {
      exists: !error,
      count: count,
      error: error?.message || null
    };
  } catch (e: any) {
    results.checks.factories = { exists: false, error: e.message };
  }

  // Check categories table
  try {
    const { data, error, count } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    results.checks.categories = {
      exists: !error,
      count: count,
      error: error?.message || null
    };
  } catch (e: any) {
    results.checks.categories = { exists: false, error: e.message };
  }

  // Check want_notifications table
  try {
    const { data, error, count } = await supabase
      .from('want_notifications')
      .select('*', { count: 'exact', head: true });
    
    results.checks.want_notifications = {
      exists: !error,
      count: count,
      error: error?.message || null
    };
  } catch (e: any) {
    results.checks.want_notifications = { exists: false, error: e.message };
  }

  // Try to insert and delete a test factory
  try {
    const { data: inserted, error: insertError } = await supabase
      .from('factories')
      .insert({ 
        name: 'TEST_DELETE_ME', 
        url: 'https://test.1688.com',
        category: 'Other'
      })
      .select()
      .single();
    
    if (insertError) {
      results.checks.factory_insert_test = { success: false, error: insertError.message };
    } else {
      // Clean up test record
      await supabase.from('factories').delete().eq('id', inserted.id);
      results.checks.factory_insert_test = { success: true };
    }
  } catch (e: any) {
    results.checks.factory_insert_test = { success: false, error: e.message };
  }

  return NextResponse.json(results, { status: 200 });
}
