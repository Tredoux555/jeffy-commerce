'use server';

import { createAdminClient } from '@/lib/supabase/server';

// Normalize phone number for consistent duplicate checking
function normalizePhone(phone: string): string {
  // Remove all spaces, dashes, brackets, dots
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  // Remove leading + if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }
  // If starts with 27, keep as is
  // If starts with 0, convert to 27
  if (cleaned.startsWith('0')) {
    cleaned = '27' + cleaned.slice(1);
  }
  // If it's just 9 digits (no country code), assume SA
  if (cleaned.length === 9 && !cleaned.startsWith('27')) {
    cleaned = '27' + cleaned;
  }
  return cleaned;
}

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
    
    // Normalize phone for duplicate check
    const normalizedPhone = normalizePhone(phone);
    
    // Check if already agreed (prevent duplicates) - check both original and normalized
    const { data: existing } = await supabase
      .from('want_agrees')
      .select('id, phone')
      .eq('want_id', wantId);

    // Check if any existing phone matches when normalized
    const alreadyAgreed = existing?.some(agree => 
      normalizePhone(agree.phone) === normalizedPhone
    );

    if (alreadyAgreed) {
      return { success: false, error: 'This number has already agreed to this want' };
    }

    // Add agreement with normalized phone
    const { data: agreement, error: agreementError } = await supabase
      .from('want_agrees')
      .insert({ want_id: wantId, name, phone: normalizedPhone })
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
    const supabase = await createAdminClient();
    
    // Normalize creator phone
    const normalizedPhone = normalizePhone(creatorPhone);
    
    // Generate share code
    const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { data, error } = await supabase
      .from('wants')
      .insert({
        title,
        description,
        reference_url: referenceUrl,
        reference_image_url: referenceImageUrl,
        max_price_cents: maxPriceCents,
        creator_name: creatorName,
        creator_phone: normalizedPhone,
        threshold,
        share_code: shareCode,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, want: data };
  } catch (err: any) {
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

export async function addSurveyVote(wantId: string) {
  try {
    const supabase = await createAdminClient();
    
    const { data: currentWant } = await supabase
      .from('wants')
      .select('survey_votes')
      .eq('id', wantId)
      .single();

    const newCount = (currentWant?.survey_votes || 0) + 1;

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
