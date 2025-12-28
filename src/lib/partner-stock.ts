import { createAdminClient } from '@/lib/supabase/server';

/**
 * Initialize stock for a partner with default quantity
 */
export async function initializePartnerStock(
  partnerId: string,
  productId: string,
  initialQuantity: number = 10
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createAdminClient();

    // Check if stock record already exists
    const { data: existing } = await supabase
      .from('partner_stock')
      .select('id')
      .eq('partner_id', partnerId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Update existing stock
      await supabase
        .from('partner_stock')
        .update({ quantity: initialQuantity, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      // Create new stock record
      await supabase
        .from('partner_stock')
        .insert({
          partner_id: partnerId,
          product_id: productId,
          quantity: initialQuantity,
          created_at: new Date().toISOString(),
        });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deduct stock when order is assigned to partner
 */
export async function deductPartnerStock(
  partnerId: string,
  productId: string,
  quantity: number = 1
): Promise<{ success: boolean; newQuantity?: number; error?: string }> {
  try {
    const supabase = await createAdminClient();

    // Get current stock
    const { data: stock } = await supabase
      .from('partner_stock')
      .select('id, quantity')
      .eq('partner_id', partnerId)
      .eq('product_id', productId)
      .single();

    if (!stock) {
      return { success: false, error: 'Stock record not found' };
    }

    if (stock.quantity < quantity) {
      return { success: false, error: 'Insufficient stock' };
    }

    const newQuantity = stock.quantity - quantity;

    await supabase
      .from('partner_stock')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', stock.id);

    return { success: true, newQuantity };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Add stock when shipment received
 */
export async function addPartnerStock(
  partnerId: string,
  productId: string,
  quantity: number
): Promise<{ success: boolean; newQuantity?: number; error?: string }> {
  try {
    const supabase = await createAdminClient();

    const { data: stock } = await supabase
      .from('partner_stock')
      .select('id, quantity')
      .eq('partner_id', partnerId)
      .eq('product_id', productId)
      .single();

    if (!stock) {
      // Create new record
      await supabase
        .from('partner_stock')
        .insert({
          partner_id: partnerId,
          product_id: productId,
          quantity,
          created_at: new Date().toISOString(),
        });
      return { success: true, newQuantity: quantity };
    }

    const newQuantity = stock.quantity + quantity;

    await supabase
      .from('partner_stock')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', stock.id);

    return { success: true, newQuantity };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get all stock for a partner
 */
export async function getPartnerStock(partnerId: string): Promise<{
  success: boolean;
  stock?: any[];
  error?: string;
}> {
  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('partner_stock')
      .select(`
        id, quantity, updated_at,
        product:products (id, name, primary_image_url, sku)
      `)
      .eq('partner_id', partnerId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { success: true, stock: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get low stock items across all partners
 */
export async function getLowStockItems(threshold: number = 3): Promise<{
  success: boolean;
  items?: any[];
  error?: string;
}> {
  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('partner_stock')
      .select(`
        id, quantity, updated_at,
        partner:zone_partners (id, zone_id),
        product:products (id, name, sku)
      `)
      .lte('quantity', threshold)
      .order('quantity', { ascending: true });

    if (error) throw error;
    return { success: true, items: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get restock report for agent portal
 */
export async function getRestockReport(): Promise<{
  success: boolean;
  report?: any[];
  error?: string;
}> {
  try {
    const supabase = await createAdminClient();

    // Get all low stock items grouped by product
    const { data: lowStock } = await supabase
      .from('partner_stock')
      .select(`
        quantity,
        partner_id,
        product_id,
        product:products (id, name, sku, source_1688_url)
      `)
      .lte('quantity', 3);

    // Aggregate by product
    const productMap = new Map<string, {
      product: any;
      partnersLow: number;
      totalNeeded: number;
    }>();

    lowStock?.forEach(item => {
      const productId = item.product_id;
      const needed = Math.max(0, 10 - item.quantity); // Restock to 10

      if (productMap.has(productId)) {
        const existing = productMap.get(productId)!;
        existing.partnersLow++;
        existing.totalNeeded += needed;
      } else {
        productMap.set(productId, {
          product: item.product,
          partnersLow: 1,
          totalNeeded: needed,
        });
      }
    });

    return {
      success: true,
      report: Array.from(productMap.values()),
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
