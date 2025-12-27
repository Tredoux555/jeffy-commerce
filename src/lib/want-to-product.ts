import { createAdminClient } from '@/lib/supabase/server';
import { getWantApprovedMessage, generateWhatsAppUrl, formatPhoneForWhatsApp } from '@/lib/whatsapp';

interface WantData {
  id: string;
  title: string;
  description?: string;
  reference_url?: string;
  reference_image_url?: string;
  creator_name: string;
  creator_phone: string;
  max_price_cents?: number;
}

/**
 * Convert a want that reached threshold into a product
 * Returns the created product and updates the want status
 */
export async function convertWantToProduct(wantId: string): Promise<{
  success: boolean;
  product?: any;
  whatsappUrl?: string;
  error?: string;
}> {
  try {
    const supabase = await createAdminClient();

    // Get the want data
    const { data: want, error: wantError } = await supabase
      .from('wants')
      .select('*')
      .eq('id', wantId)
      .single();

    if (wantError || !want) {
      return { success: false, error: 'Want not found' };
    }

    // Check if already converted
    if (want.converted_product_id) {
      return { success: false, error: 'Want already converted to product' };
    }

    // Generate slug from title
    const slug = want.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    // Create the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: want.title,
        slug,
        description: want.description || `Community requested product: ${want.title}`,
        short_description: `Requested by ${want.creator_name} with ${want.current_agrees} agrees!`,
        primary_image_url: want.reference_image_url,
        source_url: want.reference_url,
        status: 'draft', // Admin will set price and publish
        source: 'want',
        quantity: 0, // Will be set when sourced
        selling_price_cents: want.max_price_cents || 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (productError) {
      return { success: false, error: 'Failed to create product: ' + productError.message };
    }

    // Update want with product link and status
    await supabase
      .from('wants')
      .update({
        status: 'converted',
        converted_product_id: product.id,
        converted_at: new Date().toISOString(),
      })
      .eq('id', wantId);

    // Create creator benefit record
    await supabase
      .from('want_creator_benefits')
      .insert({
        want_id: wantId,
        product_id: product.id,
        creator_name: want.creator_name,
        creator_phone: want.creator_phone,
        free_units_earned: 1, // 1 free for creator
        resale_units_earned: 10, // 10 to sell
        free_units_claimed: 0,
        resale_units_claimed: 0,
        status: 'pending',
      })
      .catch(() => {}); // Ignore if table doesn't exist yet

    // Generate WhatsApp notification for creator
    const productUrl = `https://jeffy.co.za/products/${slug}`;
    const message = getWantApprovedMessage(want.title, want.creator_name, productUrl);
    const whatsappUrl = generateWhatsAppUrl(want.creator_phone, message);

    return {
      success: true,
      product,
      whatsappUrl,
    };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get all wants that have reached threshold but not yet converted
 */
export async function getPendingConversions(): Promise<{
  success: boolean;
  wants?: any[];
  error?: string;
}> {
  try {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from('wants')
      .select('*')
      .eq('status', 'threshold_reached')
      .is('converted_product_id', null)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { success: true, wants: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get creator's benefit status for a want
 */
export async function getCreatorBenefit(wantId: string): Promise<{
  success: boolean;
  benefit?: any;
  error?: string;
}> {
  try {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from('want_creator_benefits')
      .select('*')
      .eq('want_id', wantId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, benefit: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
