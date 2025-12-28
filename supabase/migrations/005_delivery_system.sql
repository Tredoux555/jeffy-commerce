-- Add verification and QR code columns to orders table
-- These are used for the delivery confirmation system

ALTER TABLE orders ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_confirmed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10, 8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(11, 8);

-- Create deliveries table if it doesn't exist
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  franchisee_id UUID,
  qr_code VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  scheduled_date DATE,
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(50),
  delivered_at TIMESTAMPTZ,
  photo_proof_url TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_franchisee_id ON deliveries(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_orders_verification_code ON orders(verification_code);
