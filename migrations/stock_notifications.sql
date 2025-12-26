-- Stock Notifications Table
CREATE TABLE IF NOT EXISTS stock_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  is_notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, email)
);

CREATE INDEX IF NOT EXISTS idx_stock_notifications_product ON stock_notifications(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_notifications_notified ON stock_notifications(is_notified);
