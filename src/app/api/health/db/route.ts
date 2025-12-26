import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Simple query to test database connection
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json({
        healthy: false,
        details: `Database error: ${error.message}`,
      });
    }

    return NextResponse.json({
      healthy: true,
      details: 'Database connection successful. Query executed successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({
      healthy: false,
      details: `Connection failed: ${error.message || 'Unknown error'}`,
    });
  }
}

