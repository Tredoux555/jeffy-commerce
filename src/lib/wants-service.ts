'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { checkMilestone, getMilestoneMessage, queueNotification } from './notification-service';

// Normalize phone number for consistent duplicate checking
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  if (cleaned.startsWith('0')) cleaned = '27' + cleaned.slice(1);
  if (cleaned.length === 9 && !cleaned.startsWith('27')) cleaned = '27' + cleaned;
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
    
    const normalizedPhone = normalizePhone(phone);
    
    // Check for duplicates
    const { data: existing } = await supabase
      .from('want_agrees')
      .select('id, phone')
      .eq('want_id', wantId);

    const alreadyAgreed = existing?.some(agree => 
      normalizePhone(agree.phone) === normalizedPhone
    );

    if (alreadyAgreed) {
      return { success: false, error: 'This number has already agreed to this want' };
    }

    // Add agreement
    const { data: agreement, error: agreementError } = await supabase
      .from('want_agrees')
      .insert({ want_id: wantId, name, phone: normalizedPhone })
      .select()
      .single();

    if (agreementError) throw agreementError;

    // Get current want data
    const { data: currentWant } = await supabase
      .from('wants')
      .select('current_agrees, threshold, title, creator_name, creator_phone')
      .eq('id', wantId)
      .single();

    const previousCount = currentWant?.current_agrees || 0;
    const newCount = previousCount + 1;
    const thresholdReached = newCount >= (currentWant?.threshold || 10);

    // Update count and status
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

    // ====== CHECK FOR MILESTONE & QUEUE NOTIFICATION ======
    const milestone = checkMilestone(previousCount, newCount);
    if (milestone && currentWant?.creator_phone) {
      const message = getMilestoneMessage(
        milestone,
        currentWant.creator_name || 'there',
        currentWant.title,
        newCount
      );
      
      // Queue the notification (will be sent manually or via API later)
      await queueNotification(
        wantId,
        currentWant.creator_phone,
        currentWant.creator_name || 'Creator',
        milestone,
        message
      );
      
      console.log(`📱 Milestone ${milestone} reached for "${currentWant.title}" - notification queued`);
    }
    // ======================================================

    return {
      success: true,
      agreement,
      want: updatedWant,
      thresholdReached,
      milestone, // Return milestone so frontend knows
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
    const normalizedPhone = normalizePhone(creatorPhone);
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
