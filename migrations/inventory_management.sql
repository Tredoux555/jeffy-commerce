-- Inventory Management System

-- Reorder rules
CREATE TABLE IF NOT EXISTS inventory_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reorder_point INTEGER NOT NULL DEFAULT 10, -- when to trigger reorder
  reorder_quantity INTEGER NOT NULL DEFAULT 50, -- how many to order
  supplier_id UUID,
  auto_reorder BOOLEAN DEFAULT FALSE,
  lead_time_days INTEGER DEFAULT 14,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id)
);

-- Reorder history
CREATE TABLE IF NOT EXISTS reorder_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_id UUID,
  quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'shipped', 'received', 'cancelled')),
  order_reference TEXT,
  expected_date DATE,
  received_date DATE,
  received_quantity INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  country TEXT DEFAULT 'China',
  payment_terms TEXT,
  lead_time_days INTEGER DEFAULT 14,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Warehouses (Multi-warehouse support)
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT,
  province TEXT,
  country TEXT DEFAULT 'South Africa',
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Warehouse inventory
CREATE TABLE IF NOT EXISTS warehouse_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- for pending orders
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(warehouse_id, product_id)
);

-- Stock transfers between warehouses
CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  to_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  shipped_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default warehouse
INSERT INTO warehouses (name, code, city, province, is_default) VALUES
('Main Warehouse', 'JHB-MAIN', 'Johannesburg', 'Gauteng', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_rules_product ON inventory_rules(product_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory ON warehouse_inventory(warehouse_id, product_id);
