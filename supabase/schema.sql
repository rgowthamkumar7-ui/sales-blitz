-- ============================================
-- SALES BLITZ DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DISTRIBUTORS (WD - Wholesale Distributors)
-- ============================================
CREATE TABLE distributors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wd_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  section VARCHAR(50),
  ae_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USERS (Managers, Team Leaders, Salesmen)
-- ============================================
CREATE TYPE user_role AS ENUM ('salesman', 'team_leader', 'manager');
CREATE TYPE manager_level AS ENUM ('AM2', 'AM1', 'AE');

CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role user_role NOT NULL,
  manager_level manager_level,
  team_leader_id UUID REFERENCES users(id),
  distributor_id UUID REFERENCES distributors(id),
  total_mapped_outlets INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key after users table exists
ALTER TABLE distributors 
  ADD CONSTRAINT fk_ae_id FOREIGN KEY (ae_id) REFERENCES users(id);

-- ============================================
-- MANAGER-DISTRIBUTOR MAPPING (for AEs)
-- ============================================
CREATE TABLE manager_distributors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manager_id UUID REFERENCES users(id) ON DELETE CASCADE,
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(manager_id, distributor_id)
);

-- ============================================
-- OUTLETS
-- ============================================
CREATE TABLE outlets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  area VARCHAR(100),
  distributor_id UUID REFERENCES distributors(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SKUS (Products)
-- ============================================
CREATE TABLE skus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  points_per_unit INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FOCUS PRODUCTS (for rewards)
-- ============================================
CREATE TABLE focus_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  reward_per_unit DECIMAL(10,2) DEFAULT 0,
  color VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STOCK ISSUED (from TL to Salesmen)
-- ============================================
CREATE TABLE stock_issued (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  salesman_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  issued_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SALE TRANSACTIONS
-- ============================================
CREATE TABLE sale_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  salesman_id UUID REFERENCES users(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  outlet_count INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SALESMAN TARGETS
-- ============================================
CREATE TABLE salesman_targets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  salesman_id UUID REFERENCES users(id) ON DELETE CASCADE,
  focus_product_id UUID REFERENCES focus_products(id) ON DELETE CASCADE,
  target_quantity INTEGER NOT NULL,
  month VARCHAR(7) NOT NULL,
  max_reward DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(salesman_id, focus_product_id, month)
);

-- ============================================
-- DS TARGETS (Manager uploaded)
-- ============================================
CREATE TABLE ds_targets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wd_code VARCHAR(20),
  wd_name VARCHAR(255),
  tl_name VARCHAR(255),
  tl_id UUID REFERENCES users(id),
  ds_name VARCHAR(255),
  ds_id UUID REFERENCES users(id),
  sku_name VARCHAR(255),
  month VARCHAR(20),
  target_qty INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id)
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_distributor ON users(distributor_id);
CREATE INDEX idx_users_team_leader ON users(team_leader_id);
CREATE INDEX idx_sale_transactions_salesman ON sale_transactions(salesman_id);
CREATE INDEX idx_sale_transactions_date ON sale_transactions(transaction_date);
CREATE INDEX idx_stock_issued_salesman ON stock_issued(salesman_id);
CREATE INDEX idx_stock_issued_date ON stock_issued(date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_issued ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE salesman_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ds_targets ENABLE ROW LEVEL SECURITY;

-- Policies for public read access (since we're using anon key for now)
CREATE POLICY "Allow read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON distributors FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON skus FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON focus_products FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON outlets FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON sale_transactions FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON stock_issued FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON manager_distributors FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON salesman_targets FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON ds_targets FOR SELECT USING (true);

-- Policies for insert/update (allow all for now)
CREATE POLICY "Allow insert" ON sale_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON stock_issued FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON ds_targets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON salesman_targets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON salesman_targets FOR UPDATE USING (true);
CREATE POLICY "Allow delete" ON ds_targets FOR DELETE USING (true);
