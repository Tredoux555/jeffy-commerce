import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Vote for a want
export async function POST(request: NextRequest) {
  try {
    const { want_id, voter_email } = await request.json();

    if (!want_id || !voter_email) {
      return NextResponse.json({ error: 'Want ID and email required' }, { status: 400 });
    }

    const cleanEmail = voter_email.toLowerCase().trim();

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('want_votes')
      .select('id')
      .eq('want_id', want_id)
      .eq('voter_email', cleanEmail)
      .single();

    if (existingVote) {
      return NextResponse.json({ 
        success: false, 
        alreadyVoted: true,
        message: 'You already voted for this!' 
      });
    }

    // Check daily vote limit (10 per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todayVotes } = await supabase
      .from('want_votes')
      .select('*', { count: 'exact', head: true })
      .eq('voter_email', cleanEmail)
      .gte('created_at', today.toISOString());

    if ((todayVotes || 0) >= 10) {
      return NextResponse.json({
        success: false,
        message: 'Daily vote limit reached (10). Come back tomorrow!'
      });
    }

    // Add vote
    const { error: voteError } = await supabase
      .from('want_votes')
      .insert({ want_id, voter_email: cleanEmail });

    if (voteError) {
      console.error('Vote insert error:', voteError);
      return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }

    // Get updated want
    const { data: want } = await supabase
      .from('wants')
      .select('id, product_name, vote_count, status')
      .eq('id', want_id)
      .single();

    // Check if threshold reached (50 votes = under review)
    if (want && want.vote_count >= 50 && want.status === 'voting') {
      await supabase
        .from('wants')
        .update({ status: 'sourcing' })
        .eq('id', want_id);
      
      return NextResponse.json({
        success: true,
        want: { ...want, status: 'sourcing' },
        message: '🎉 This product hit 50 votes! Now being sourced.',
        thresholdReached: true
      });
    }

    return NextResponse.json({
      success: true,
      want,
      message: 'Vote counted!'
    });

  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Remove vote
export async function DELETE(request: NextRequest) {
  try {
    const { want_id, voter_email } = await request.json();

    if (!want_id || !voter_email) {
      return NextResponse.json({ error: 'Want ID and email required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('want_votes')
      .delete()
      .eq('want_id', want_id)
      .eq('voter_email', voter_email.toLowerCase());

    if (error) {
      return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
    }

    // Update count manually since trigger might not fire on delete
    const { count } = await supabase
      .from('want_votes')
      .select('*', { count: 'exact', head: true })
      .eq('want_id', want_id);

    await supabase
      .from('wants')
      .update({ vote_count: count || 0 })
      .eq('id', want_id);

    return NextResponse.json({ success: true, message: 'Vote removed' });

  } catch (error) {
    console.error('Unvote error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
