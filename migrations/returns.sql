-- Returns and Refunds System (RMA)

CREATE TABLE IF NOT EXISTS return_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rma_number TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'received', 'inspecting', 
    'refund_pending', 'refunded', 'exchange_pending', 'exchanged', 'closed'
  )),
  return_type TEXT NOT NULL CHECK (return_type IN ('refund', 'exchange', 'store_credit')),
  reason TEXT NOT NULL CHECK (reason IN (
    'defective', 'wrong_item', 'not_as_described', 'changed_mind', 
    'too_small', 'too_large', 'damaged_shipping', 'other'
  )),
  reason_details TEXT,
  items JSONB NOT NULL, -- [{product_id, name, quantity, price_cents}]
  total_refund_cents INTEGER NOT NULL,
  refund_method TEXT CHECK (refund_method IN ('original_payment', 'store_credit', 'bank_transfer')),
  shipping_label_url TEXT,
  tracking_number TEXT,
  received_at TIMESTAMP WITH TIME ZONE,
  inspected_at TIMESTAMP WITH TIME ZONE,
  inspection_notes TEXT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Return request images (proof)
CREATE TABLE IF NOT EXISTS return_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  return_request_id UUID NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Return settings
CREATE TABLE IF NOT EXISTS return_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  return_window_days INTEGER DEFAULT 14,
  require_images BOOLEAN DEFAULT TRUE,
  auto_approve_under_cents INTEGER DEFAULT 50000, -- Auto-approve returns under R500
  restocking_fee_percent INTEGER DEFAULT 0,
  free_return_shipping BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO return_settings (id, return_window_days) 
VALUES ('00000000-0000-0000-0000-000000000001', 14)
ON CONFLICT (id) DO NOTHING;

-- Generate RMA number function
CREATE OR REPLACE FUNCTION generate_rma_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'RMA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
         UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$ LANGUAGE plpgsql;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_returns_customer ON return_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_returns_order ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON return_requests(status);
CREATE INDEX IF NOT EXISTS idx_returns_rma ON return_requests(rma_number);
