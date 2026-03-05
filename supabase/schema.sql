-- ============================================================
-- Nucleus Database Schema — Run in Supabase SQL Editor
-- ============================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  health_score INTEGER DEFAULT 750,
  profile_picture TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  muhdo_kit_id TEXT,
  terra_user_id TEXT,
  date_of_birth DATE,
  gender TEXT,
  phone TEXT,
  address JSONB,
  clinic_id UUID,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Health data from Terra wearables
CREATE TABLE IF NOT EXISTS health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  data_type TEXT, -- 'daily', 'body', 'activity', 'sleep', 'nutrition'
  data JSONB,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_health_data_user ON health_data(user_id);
CREATE INDEX idx_health_data_synced ON health_data(synced_at DESC);

-- Terra wearable connections
CREATE TABLE IF NOT EXISTS terra_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT, -- 'apple', 'garmin', 'fitbit', etc.
  terra_user_id TEXT,
  status TEXT DEFAULT 'active',
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lab/blood results
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  test_type TEXT, -- 'blood', 'dna', 'epigenetic'
  test_date TIMESTAMPTZ,
  results JSONB,
  pdf_url TEXT,
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  patient_name TEXT,
  patient_email TEXT,
  patient_dob TEXT,
  matched BOOLEAN DEFAULT false,
  sftp_filename TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_lab_results_user ON lab_results(user_id);

-- Lab result individual parameters/biomarkers
CREATE TABLE IF NOT EXISTS lab_result_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,
  name TEXT,
  value TEXT,
  unit TEXT,
  reference_range TEXT,
  status TEXT, -- 'normal', 'low', 'high', 'critical'
  category TEXT
);

-- Clinics
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  address JSONB,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI insights/notifications
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT,
  category TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Supplements
CREATE TABLE IF NOT EXISTS supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  dosage TEXT,
  frequency TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Health tests catalog
CREATE TABLE IF NOT EXISTS health_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  price DECIMAL,
  category TEXT,
  active BOOLEAN DEFAULT true
);

-- Test orders
CREATE TABLE IF NOT EXISTS test_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES health_tests(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products (shop)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  price DECIMAL,
  image_url TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_date TIMESTAMPTZ DEFAULT now()
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_email TEXT,
  product_id UUID REFERENCES products(id),
  product_name TEXT,
  product_price DECIMAL,
  product_image TEXT,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_email TEXT,
  items JSONB,
  total DECIMAL,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  created_date TIMESTAMPTZ DEFAULT now()
);

-- Chat messages (AI agent)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT, -- 'user', 'assistant'
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Queries (generic query storage)
CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  query_type TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE terra_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Users can read their own health data
CREATE POLICY "Users can view own health data" ON health_data FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own lab results
CREATE POLICY "Users can view own lab results" ON lab_results FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all data (add admin check)
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can view all lab results" ON lab_results FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Products are public
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (true);

-- Health tests are public
ALTER TABLE health_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Health tests are publicly readable" ON health_tests FOR SELECT USING (true);

-- Users manage their own cart/orders
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own orders" ON orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own chat" ON chat_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own insights" ON ai_insights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own supplements" ON supplements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own connections" ON terra_connections FOR ALL USING (auth.uid() = user_id);

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true)
  ON CONFLICT (id) DO NOTHING;
