import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// This endpoint can be called by a cron job (Vercel Cron, etc.)
// to automatically mark expired wants and create notifications

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createAdminClient();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Find wants that should be expired
    const { data: expiredWants, error: fetchError } = await supabase
      .from('wants')
      .select('*')
      .eq('status', 'active')
      .lt('created_at', sevenDaysAgo.toISOString())
      .lt('current_agrees', 10);

    if (fetchError) {
      console.error('Error fetching expired wants:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    let expiredCount = 0;

    if (expiredWants && expiredWants.length > 0) {
      const expiredIds = expiredWants.map(w => w.id);
      
      const { error: updateError } = await supabase
        .from('wants')
        .update({ status: 'expired' })
        .in('id', expiredIds);

      if (!updateError) {
        expiredCount = expiredIds.length;
      }
    }

    // Check for newly successful wants
    const { data: newSuccesses } = await supabase
      .from('wants')
      .select('*')
      .eq('status', 'active')
      .gte('current_agrees', 10)
      .is('notified_at', null);

    let successCount = 0;

    if (newSuccesses && newSuccesses.length > 0) {
      await supabase
        .from('wants')
        .update({ 
          status: 'threshold_reached',
          notified_at: now.toISOString() 
        })
        .in('id', newSuccesses.map(w => w.id));

      successCount = newSuccesses.length;
    }

    return NextResponse.json({
      success: true,
      expired: expiredCount,
      successful: successCount,
      timestamp: now.toISOString(),
    });
  } catch (err: any) {
    console.error('Cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
