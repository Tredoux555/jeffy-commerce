-- Admin Activity Log System

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID,
  admin_email TEXT,
  admin_name TEXT,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'export', etc.
  resource_type TEXT NOT NULL, -- 'product', 'order', 'customer', 'settings', etc.
  resource_id UUID,
  resource_name TEXT,
  details JSONB, -- additional context
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_activity_created ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_admin ON admin_activity_log(admin_email);
CREATE INDEX IF NOT EXISTS idx_activity_resource ON admin_activity_log(resource_type, resource_id);

-- Function to log activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_admin_email TEXT,
  p_admin_name TEXT,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_resource_name TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO admin_activity_log (admin_email, admin_name, action, resource_type, resource_id, resource_name, details)
  VALUES (p_admin_email, p_admin_name, p_action, p_resource_type, p_resource_id, p_resource_name, p_details)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;
