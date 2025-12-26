'use server';

import { createAdminClient } from '@/lib/supabase/server';

export async function getWants(limit = 20) {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('wants')
      .select('*')
      .eq('status', 'active')
      .order('current_agrees', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, wants: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getWantByShareCode(shareCode: string) {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('wants')
      .select('*')
      .eq('share_code', shareCode)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, want: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getWantById(wantId: string) {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('wants')
      .select('*')
      .eq('id', wantId)
      .single();

    if (error) throw error;
    return { success: true, want: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addWantAgreement(wantId: string, name: string, phone: string) {
  try {
    const supabase = await createAdminClient();
    
    // Check if already agreed (prevent duplicates)
    const { data: existing, error: checkError } = await supabase
      .from('want_agrees')
      .select('id')
      .eq('want_id', wantId)
      .eq('phone', phone)
      .single();

    if (existing) {
      return { success: false, error: 'You have already agreed to this want' };
    }

    // Add agreement
    const { data: agreement, error: agreementError } = await supabase
      .from('want_agrees')
      .insert({ want_id: wantId, name, phone })
      .select()
      .single();

    if (agreementError) throw agreementError;

    // Get current count and increment
    const { data: currentWant } = await supabase
      .from('wants')
      .select('current_agrees, threshold, title, creator_name')
      .eq('id', wantId)
      .single();

    const newCount = (currentWant?.current_agrees || 0) + 1;
    const thresholdReached = newCount >= (currentWant?.threshold || 10);

    // Update the count and status if threshold reached
    const updateData: any = { current_agrees: newCount };
    if (thresholdReached) {
      updateData.status = 'threshold_reached';
      console.log(`🎉 THRESHOLD REACHED! Want "${currentWant?.title}" by ${currentWant?.creator_name} has ${newCount} agrees!`);
    }

    const { data: updatedWant, error: updateError } = await supabase
      .from('wants')
      .update(updateData)
      .eq('id', wantId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      success: true,
      agreement,
      want: updatedWant,
      thresholdReached,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getTrendingWants(limit = 10) {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('wants')
      .select('*')
      .eq('status', 'active')
      .order('current_agrees', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, wants: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getWantAgreements(wantId: string) {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('want_agrees')
      .select('*')
      .eq('want_id', wantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, agreements: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createWant(
  title: string, 
  creatorName: string, 
  creatorPhone: string, 
  threshold = 10,
  description: string | null = null,
  referenceUrl: string | null = null,
  referenceImageUrl: string | null = null,
  maxPriceCents: number | null = null
) {
  try {
    // Debug: Log environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔍 [createWant] Debug Info:');
    console.log('  - Supabase URL:', supabaseUrl || 'MISSING');
    console.log('  - Service Role Key exists:', serviceRoleKey ? `YES (length: ${serviceRoleKey.length})` : 'NO');
    console.log('  - Service Role Key starts with:', serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'N/A');
    
    const supabase = await createAdminClient();
    
    // Generate share code
    const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    console.log('🔍 [createWant] Attempting insert with:');
    console.log('  - Title:', title);
    console.log('  - Share Code:', shareCode);
    console.log('  - Threshold:', threshold);
    console.log('  - Max Price Cents:', maxPriceCents);

    const { data, error } = await supabase
      .from('wants')
      .insert({
        title,
        description,
        reference_url: referenceUrl,
        reference_image_url: referenceImageUrl,
        max_price_cents: maxPriceCents,
        creator_name: creatorName,
        creator_phone: creatorPhone,
        threshold,
        share_code: shareCode,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [createWant] Supabase Error:');
      console.error('  - Error code:', error.code);
      console.error('  - Error message:', error.message);
      console.error('  - Error details:', JSON.stringify(error, null, 2));
      console.error('  - Full error object:', error);
      throw error;
    }
    
    console.log('✅ [createWant] Success! Want created:', data);
    return { success: true, want: data };
  } catch (err: any) {
    console.error('❌ [createWant] Exception caught:');
    console.error('  - Error type:', err?.constructor?.name);
    console.error('  - Error message:', err?.message);
    console.error('  - Error stack:', err?.stack);
    console.error('  - Full error:', err);
    return { success: false, error: err.message };
  }
}

export async function updateWantStatus(wantId: string, status: string) {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('wants')
      .update({ status })
      .eq('id', wantId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, want: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Simple survey vote - just increment survey_votes count (separate from official agrees)
// This is for market research only - does NOT count toward the 10 threshold
export async function addSurveyVote(wantId: string) {
  try {
    const supabase = await createAdminClient();
    
    // Get current survey_votes count
    const { data: currentWant } = await supabase
      .from('wants')
      .select('survey_votes')
      .eq('id', wantId)
      .single();

    const newCount = (currentWant?.survey_votes || 0) + 1;

    // Update the survey_votes count (NOT current_agrees)
    const { data, error } = await supabase
      .from('wants')
      .update({ survey_votes: newCount })
      .eq('id', wantId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, want: data, newCount };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Get all wants for admin view
export async function getAllWantsForAdmin() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('wants')
      .select('*')
      .order('current_agrees', { ascending: false });

    if (error) throw error;
    return { success: true, wants: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Get wants that have reached threshold - need admin action
export async function getThresholdReachedWants() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('wants')
      .select('*')
      .eq('status', 'threshold_reached')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { success: true, wants: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
