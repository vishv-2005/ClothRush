-- ==================================================
-- VastraNow Row Level Security Policies
-- 002_rls_policies.sql
-- ==================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- HELPER FUNCTION: Get user role
-- ==========================================
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==========================================
-- PROFILES
-- ==========================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Service role full access profiles"
  ON profiles FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ==========================================
-- CATEGORIES (public read)
-- ==========================================
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage categories"
  ON categories FOR ALL
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ==========================================
-- STORES
-- ==========================================
CREATE POLICY "Anyone can view active stores"
  ON stores FOR SELECT
  USING (status = 'ACTIVE');

CREATE POLICY "Sellers can view own store"
  ON stores FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Sellers can update own store"
  ON stores FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Sellers can create store"
  ON stores FOR INSERT
  WITH CHECK (owner_id = auth.uid() AND get_user_role(auth.uid()) = 'SELLER');

CREATE POLICY "Admin can manage all stores"
  ON stores FOR ALL
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ==========================================
-- PRODUCTS
-- ==========================================
CREATE POLICY "Anyone can view published active products"
  ON products FOR SELECT
  USING (is_active = true AND is_published = true);

CREATE POLICY "Sellers can view own products"
  ON products FOR SELECT
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Sellers can create products for own store"
  ON products FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Admin can manage all products"
  ON products FOR ALL
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ==========================================
-- PRODUCT IMAGES
-- ==========================================
CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage own product images"
  ON product_images FOR ALL
  USING (product_id IN (
    SELECT p.id FROM products p
    JOIN stores s ON p.store_id = s.id
    WHERE s.owner_id = auth.uid()
  ));

CREATE POLICY "Admin can manage all product images"
  ON product_images FOR ALL
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ==========================================
-- INVENTORY
-- ==========================================
CREATE POLICY "Anyone can view inventory"
  ON inventory FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage own inventory"
  ON inventory FOR ALL
  USING (product_id IN (
    SELECT p.id FROM products p
    JOIN stores s ON p.store_id = s.id
    WHERE s.owner_id = auth.uid()
  ));

CREATE POLICY "Admin can manage all inventory"
  ON inventory FOR ALL
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ==========================================
-- CART ITEMS
-- ==========================================
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own cart"
  ON cart_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  USING (user_id = auth.uid());

-- ==========================================
-- ADDRESSES
-- ==========================================
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own addresses"
  ON addresses FOR ALL
  USING (user_id = auth.uid());

-- ==========================================
-- ORDERS
-- ==========================================
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Sellers can view own store orders"
  ON orders FOR SELECT
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Delivery partners can view assigned orders"
  ON orders FOR SELECT
  USING (delivery_partner_id IN (
    SELECT id FROM delivery_partners WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admin can view all orders"
  ON orders FOR SELECT
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can update any order"
  ON orders FOR UPDATE
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Sellers can update own store orders"
  ON orders FOR UPDATE
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- ==========================================
-- ORDER ITEMS
-- ==========================================
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Sellers can view own store order items"
  ON order_items FOR SELECT
  USING (order_id IN (
    SELECT o.id FROM orders o
    JOIN stores s ON o.store_id = s.id
    WHERE s.owner_id = auth.uid()
  ));

CREATE POLICY "Admin can view all order items"
  ON order_items FOR SELECT
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Users can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- ==========================================
-- ORDER STATUS HISTORY
-- ==========================================
CREATE POLICY "Users can view own order history"
  ON order_status_history FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Sellers can view own store order history"
  ON order_status_history FOR SELECT
  USING (order_id IN (
    SELECT o.id FROM orders o
    JOIN stores s ON o.store_id = s.id
    WHERE s.owner_id = auth.uid()
  ));

CREATE POLICY "Admin can view all order history"
  ON order_status_history FOR SELECT
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Authenticated can insert order history"
  ON order_status_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ==========================================
-- PAYMENTS
-- ==========================================
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Admin can view all payments"
  ON payments FOR ALL
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- ==========================================
-- DELIVERY PARTNERS
-- ==========================================
CREATE POLICY "Anyone can view active delivery partners"
  ON delivery_partners FOR SELECT
  USING (is_active = true);

CREATE POLICY "Partners can update own record"
  ON delivery_partners FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admin can manage delivery partners"
  ON delivery_partners FOR ALL
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ==========================================
-- DELIVERY ASSIGNMENTS
-- ==========================================
CREATE POLICY "Partners can view own assignments"
  ON delivery_assignments FOR SELECT
  USING (delivery_partner_id IN (
    SELECT id FROM delivery_partners WHERE user_id = auth.uid()
  ));

CREATE POLICY "Partners can update own assignments"
  ON delivery_assignments FOR UPDATE
  USING (delivery_partner_id IN (
    SELECT id FROM delivery_partners WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admin can manage assignments"
  ON delivery_assignments FOR ALL
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Sellers can view assignments for own orders"
  ON delivery_assignments FOR SELECT
  USING (order_id IN (
    SELECT o.id FROM orders o
    JOIN stores s ON o.store_id = s.id
    WHERE s.owner_id = auth.uid()
  ));

-- ==========================================
-- WISHLISTS
-- ==========================================
CREATE POLICY "Users can manage own wishlist"
  ON wishlists FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own wishlist items"
  ON wishlist_items FOR ALL
  USING (wishlist_id IN (SELECT id FROM wishlists WHERE user_id = auth.uid()));

-- ==========================================
-- REVIEWS
-- ==========================================
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create own reviews"
  ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid());

-- ==========================================
-- AI GENERATIONS
-- ==========================================
CREATE POLICY "Users can view own AI generations"
  ON ai_generations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create AI generations"
  ON ai_generations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all AI generations"
  ON ai_generations FOR ALL
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ==========================================
-- NOTIFICATIONS
-- ==========================================
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ==========================================
-- STORAGE POLICIES
-- ==========================================

-- Products Original bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('products-original', 'products-original', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('products-ai', 'products-ai', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('store-images', 'store-images', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view product images storage"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('products-original', 'products-ai', 'avatars', 'store-images'));

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('products-original', 'products-ai', 'store-images')
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own uploads"
  ON storage.objects FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  USING (auth.uid() IS NOT NULL);
