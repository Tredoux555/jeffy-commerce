// Auto-generated types matching Supabase schema
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          phone_verified: boolean;
          full_name: string | null;
          role: 'customer' | 'franchisee' | 'agent' | 'admin';
          avatar_url: string | null;
          default_latitude: number | null;
          default_longitude: number | null;
          default_address_notes: string | null;
          whatsapp_notifications: boolean;
          email_notifications: boolean;
          push_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'sort_order' | 'is_active'> & {
          id?: string;
          created_at?: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          category_id: string | null;
          tags: string[] | null;
          cost_price_cents: number;
          selling_price_cents: number;
          compare_at_price_cents: number | null;
          quantity: number;
          low_stock_threshold: number;
          track_inventory: boolean;
          primary_image_url: string | null;
          images: string[] | null;
          video_url: string | null;
          source_1688_url: string | null;
          source_1688_item_id: string | null;
          status: 'draft' | 'active' | 'out_of_stock' | 'discontinued';
          meta_title: string | null;
          meta_description: string | null;
          total_sold: number;
          total_views: number;
          average_rating: number | null;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at' | 'quantity' | 'low_stock_threshold' | 'track_inventory' | 'total_sold' | 'total_views' | 'review_count'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          quantity?: number;
          low_stock_threshold?: number;
          track_inventory?: boolean;
          total_sold?: number;
          total_views?: number;
          review_count?: number;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          delivery_latitude: number;
          delivery_longitude: number;
          delivery_address: string | null;
          delivery_notes: string | null;
          alternate_recipient_name: string | null;
          alternate_recipient_phone: string | null;
          franchise_id: string | null;
          zone_id: string | null;
          is_franchise_delivery: boolean;
          subtotal_cents: number;
          discount_cents: number;
          delivery_fee_cents: number;
          total_cents: number;
          discount_type: string | null;
          discount_reference: string | null;
          payment_method: string | null;
          payment_reference: string | null;
          payment_status: string;
          paid_at: string | null;
          status: 'pending_payment' | 'paid' | 'assigned_to_franchise' | 'preparing' | 'out_for_delivery' | 'delivered' | 'failed_delivery' | 'returned' | 'refunded' | 'cancelled';
          profit_cents: number | null;
          franchise_share_cents: number | null;
          platform_share_cents: number | null;
          created_at: string;
          updated_at: string;
          confirmed_at: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at' | 'discount_cents' | 'delivery_fee_cents' | 'is_franchise_delivery'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          discount_cents?: number;
          delivery_fee_cents?: number;
          is_franchise_delivery?: boolean;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string | null;
          product_name: string;
          variant_name: string | null;
          quantity: number;
          unit_price_cents: number;
          unit_cost_cents: number;
          total_cents: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      carts: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          subtotal_cents: number;
          item_count: number;
          abandoned_at: string | null;
          recovery_email_sent_at: string | null;
          recovery_whatsapp_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['carts']['Row'], 'id' | 'created_at' | 'updated_at' | 'subtotal_cents' | 'item_count'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          subtotal_cents?: number;
          item_count?: number;
        };
        Update: Partial<Database['public']['Tables']['carts']['Insert']>;
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          unit_price_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cart_items']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['cart_items']['Insert']>;
      };
    };
  };
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Cart = Database['public']['Tables']['carts']['Row'];
export type CartItem = Database['public']['Tables']['cart_items']['Row'];

// Cart item with product details (for client-side cart)
export interface CartItemWithProduct {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  price: number; // in cents
  quantity: number;
  variantId?: string;
  variantName?: string;
}
