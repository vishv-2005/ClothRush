-- ==================================================
-- VastraNow Database Schema Migration
-- 001_initial_schema.sql
-- ==================================================

-- ==========================================
-- ENUMS
-- ==========================================

CREATE TYPE user_role AS ENUM ('CUSTOMER', 'SELLER', 'DELIVERY_PARTNER', 'ADMIN');
CREATE TYPE store_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');
CREATE TYPE stock_status AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK');
CREATE TYPE order_status AS ENUM (
  'PENDING_PAYMENT',
  'PAYMENT_FAILED',
  'CONFIRMED',
  'SELLER_ACCEPTED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'DELIVERY_ASSIGNED',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUND_PENDING',
  'REFUNDED'
);
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE delivery_partner_availability AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');
CREATE TYPE gender_type AS ENUM ('MEN', 'WOMEN', 'KIDS', 'UNISEX');
CREATE TYPE fit_type AS ENUM ('SLIM', 'REGULAR', 'LOOSE', 'OVERSIZED');

-- ==========================================
-- PROFILES (extends Supabase auth.users)
-- ==========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ==========================================
-- CATEGORIES
-- ==========================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ==========================================
-- STORES
-- ==========================================
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT NOT NULL DEFAULT 'Vadodara',
  state TEXT NOT NULL DEFAULT 'Gujarat',
  pincode TEXT,
  latitude DOUBLE PRECISION NOT NULL DEFAULT 22.3072,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 73.1812,
  logo_url TEXT,
  banner_url TEXT,
  status store_status NOT NULL DEFAULT 'PENDING',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  total_ratings INT NOT NULL DEFAULT 0,
  opening_time TIME NOT NULL DEFAULT '09:00',
  closing_time TIME NOT NULL DEFAULT '21:00',
  is_open BOOLEAN NOT NULL DEFAULT true,
  preparation_time INT NOT NULL DEFAULT 5, -- minutes
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_stores_location ON stores(latitude, longitude);

-- ==========================================
-- PRODUCTS
-- ==========================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  gender gender_type NOT NULL DEFAULT 'UNISEX',
  color TEXT,
  material TEXT,
  fit fit_type,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  tags TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{S,M,L,XL}',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  total_ratings INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT false,
  ai_generated_title TEXT,
  ai_generated_description TEXT,
  ai_confidence_score NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active, is_published);
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_tags ON products USING gin (tags);

-- ==========================================
-- PRODUCT IMAGES
-- ==========================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL DEFAULT 'original', -- 'original', 'ai_generated', 'additional'
  alt_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ==========================================
-- INVENTORY
-- ==========================================
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved INT NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 5,
  status stock_status NOT NULL DEFAULT 'IN_STOCK',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, size)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_status ON inventory(status);

-- ==========================================
-- ADDRESSES
-- ==========================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Vadodara',
  state TEXT NOT NULL DEFAULT 'Gujarat',
  pincode TEXT NOT NULL,
  latitude DOUBLE PRECISION DEFAULT 22.3072,
  longitude DOUBLE PRECISION DEFAULT 73.1812,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ==========================================
-- CART ITEMS
-- ==========================================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, size)
);

CREATE INDEX idx_cart_items_user ON cart_items(user_id);

-- ==========================================
-- ORDERS
-- ==========================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  address_id UUID REFERENCES addresses(id),
  delivery_partner_id UUID,
  status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 29,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 10,
  total NUMERIC(10,2) NOT NULL,
  estimated_delivery_time INT, -- minutes
  delivery_address_snapshot JSONB, -- snapshot of address at order time
  notes TEXT,
  cancellation_reason TEXT,
  admin_override_reason TEXT,
  admin_override_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_delivery_partner ON orders(delivery_partner_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ==========================================
-- ORDER ITEMS
-- ==========================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  size TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ==========================================
-- ORDER STATUS HISTORY
-- ==========================================
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

-- ==========================================
-- PAYMENTS
-- ==========================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status payment_status NOT NULL DEFAULT 'PENDING',
  failure_reason TEXT,
  method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_razorpay ON payments(razorpay_order_id);

-- ==========================================
-- DELIVERY PARTNERS
-- ==========================================
CREATE TABLE delivery_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  availability delivery_partner_availability NOT NULL DEFAULT 'OFFLINE',
  current_order_id UUID,
  latitude DOUBLE PRECISION DEFAULT 22.3072,
  longitude DOUBLE PRECISION DEFAULT 73.1812,
  total_deliveries INT NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_partners_user ON delivery_partners(user_id);
CREATE INDEX idx_delivery_partners_availability ON delivery_partners(availability);

-- ==========================================
-- DELIVERY ASSIGNMENTS
-- ==========================================
CREATE TABLE delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_partner_id UUID NOT NULL REFERENCES delivery_partners(id),
  assigned_by UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'ASSIGNED', -- ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED
  pickup_time TIMESTAMPTZ,
  delivery_time TIMESTAMPTZ,
  estimated_distance NUMERIC(5,2), -- km
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_assignments_order ON delivery_assignments(order_id);
CREATE INDEX idx_delivery_assignments_partner ON delivery_assignments(delivery_partner_id);

-- ==========================================
-- WISHLISTS
-- ==========================================
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wishlist_id, product_id)
);

CREATE INDEX idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);

-- ==========================================
-- REVIEWS
-- ==========================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);

-- ==========================================
-- AI GENERATIONS (audit log)
-- ==========================================
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  input_image_url TEXT,
  generated_title TEXT,
  generated_description TEXT,
  generated_tags TEXT[],
  generated_category TEXT,
  generated_color TEXT,
  generated_material TEXT,
  generated_fit TEXT,
  generated_image_url TEXT,
  confidence_score NUMERIC(3,2),
  model_used TEXT,
  status TEXT NOT NULL DEFAULT 'COMPLETED', -- PENDING, COMPLETED, FAILED
  error_message TEXT,
  processing_time_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_generations_product ON ai_generations(product_id);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INFO', -- INFO, ORDER, DELIVERY, SYSTEM
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_delivery_partners_updated_at BEFORE UPDATE ON delivery_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_delivery_assignments_updated_at BEFORE UPDATE ON delivery_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CUSTOMER')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update inventory status
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity - NEW.reserved <= 0 THEN
    NEW.status = 'OUT_OF_STOCK';
  ELSIF NEW.quantity - NEW.reserved <= NEW.low_stock_threshold THEN
    NEW.status = 'LOW_STOCK';
  ELSE
    NEW.status = 'IN_STOCK';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_status_trigger
  BEFORE INSERT OR UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_inventory_status();

-- Reserve stock function (atomic)
CREATE OR REPLACE FUNCTION reserve_stock(
  p_product_id UUID,
  p_size TEXT,
  p_quantity INT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_available INT;
BEGIN
  SELECT quantity - reserved INTO v_available
  FROM inventory
  WHERE product_id = p_product_id AND size = p_size
  FOR UPDATE;

  IF v_available IS NULL OR v_available < p_quantity THEN
    RETURN FALSE;
  END IF;

  UPDATE inventory
  SET reserved = reserved + p_quantity
  WHERE product_id = p_product_id AND size = p_size;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Release stock function (atomic)
CREATE OR REPLACE FUNCTION release_stock(
  p_product_id UUID,
  p_size TEXT,
  p_quantity INT
)
RETURNS VOID AS $$
BEGIN
  UPDATE inventory
  SET reserved = GREATEST(reserved - p_quantity, 0)
  WHERE product_id = p_product_id AND size = p_size;
END;
$$ LANGUAGE plpgsql;

-- Confirm stock (convert reserved to sold)
CREATE OR REPLACE FUNCTION confirm_stock(
  p_product_id UUID,
  p_size TEXT,
  p_quantity INT
)
RETURNS VOID AS $$
BEGIN
  UPDATE inventory
  SET
    quantity = quantity - p_quantity,
    reserved = GREATEST(reserved - p_quantity, 0)
  WHERE product_id = p_product_id AND size = p_size;
END;
$$ LANGUAGE plpgsql;

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  v_count INT;
  v_number TEXT;
BEGIN
  SELECT COUNT(*) + 1000 INTO v_count FROM orders;
  v_number = 'VN' || v_count::TEXT;
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;
