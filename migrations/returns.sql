-- Returns & Refunds System

CREATE TABLE IF NOT EXISTS return_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rma_number TEXT NOT NULL UNIQUE, -- Return Merchandise Authorization
  order_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  reason TEXT NOT NULL, -- damaged, wrong_item, not_as_described, changed_mind, defective, other
  reason_details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'shipped', 'received', 'refunded', 'cancelled')),
  refund_amount_cents INTEGER,
  refund_method TEXT, -- original_payment, store_credit, bank_transfer
  items JSONB NOT NULL, -- [{product_id, name, quantity, price}]
  images TEXT[], -- proof photos
  admin_notes TEXT,
  tracking_number TEXT, -- for return shipment
  received_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Return request updates/timeline
CREATE TABLE IF NOT EXISTS return_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id UUID NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  updated_by TEXT, -- admin email or 'customer' or 'system'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generate RMA number
CREATE OR REPLACE FUNCTION generate_rma_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'RMA' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Index
CREATE INDEX IF NOT EXISTS idx_returns_customer ON return_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_returns_order ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON return_requests(status);
