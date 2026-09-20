-- ==================================================
-- VastraNow Seed Data
-- 003_seed_data.sql
-- ==================================================
-- NOTE: This seed script creates demo data ONLY.
-- Demo user accounts must be created via Supabase Auth Dashboard or the seed script.
-- See README.md for instructions on creating demo accounts.

-- ==========================================
-- CATEGORIES
-- ==========================================
INSERT INTO categories (id, name, slug, description, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Men', 'men', 'Men''s Fashion', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Women', 'women', 'Women''s Fashion', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Kids', 'kids', 'Kids'' Fashion', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Shirts', 'shirts', 'Casual & Formal Shirts', 4),
  ('c1000000-0000-0000-0000-000000000005', 'T-Shirts', 't-shirts', 'Graphic & Plain T-Shirts', 5),
  ('c1000000-0000-0000-0000-000000000006', 'Jeans', 'jeans', 'Denim Jeans', 6),
  ('c1000000-0000-0000-0000-000000000007', 'Kurtis', 'kurtis', 'Designer Kurtis', 7),
  ('c1000000-0000-0000-0000-000000000008', 'Dresses', 'dresses', 'Casual & Party Dresses', 8),
  ('c1000000-0000-0000-0000-000000000009', 'Sarees', 'sarees', 'Traditional Sarees', 9),
  ('c1000000-0000-0000-0000-000000000010', 'Jackets', 'jackets', 'Jackets & Blazers', 10),
  ('c1000000-0000-0000-0000-000000000011', 'Footwear', 'footwear', 'Shoes & Sandals', 11),
  ('c1000000-0000-0000-0000-000000000012', 'Trousers', 'trousers', 'Formal & Casual Trousers', 12)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- DEMO STORES
-- Note: owner_id will need to be updated after creating demo users
-- Using placeholder UUIDs that will be replaced by the seed script
-- ==========================================

-- We'll use a function to create stores linked to seller accounts
-- For now, create stores with placeholder data
-- The application seed script will handle user-store linking

INSERT INTO stores (id, owner_id, name, description, phone, address, city, pincode, latitude, longitude, status, rating, total_ratings, opening_time, closing_time, preparation_time) VALUES
  ('s1000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000000', -- placeholder, update after user creation
   'Raj Fashion',
   'Premium men''s clothing with latest trends. Quality fabrics and modern designs at affordable prices.',
   '9876543210',
   'Shop 12, Alkapuri Market, RC Dutt Road',
   'Vadodara', '390007',
   22.3106, 73.1723,
   'ACTIVE', 4.5, 128,
   '09:00', '21:00', 5),

  ('s1000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000000',
   'Style Hub',
   'Your one-stop destination for trendy women''s wear. From casual to ethnic, we have it all.',
   '9876543211',
   'Shop 7, Sayajigunj Complex',
   'Vadodara', '390005',
   22.3143, 73.1891,
   'ACTIVE', 4.3, 96,
   '10:00', '21:00', 5),

  ('s1000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000000',
   'Urban Wear',
   'Street style meets comfort. Hoodies, joggers, sneakers and more for the urban lifestyle.',
   '9876543212',
   'Ground Floor, Fatehgunj Main Road',
   'Vadodara', '390002',
   22.3225, 73.1857,
   'ACTIVE', 4.7, 215,
   '10:00', '22:00', 4),

  ('s1000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000000',
   'Fashion Point',
   'Family fashion store with something for everyone. Kids, men, and women''s collections.',
   '9876543213',
   'Shop 3, Manjalpur Shopping Centre',
   'Vadodara', '390011',
   22.2762, 73.1921,
   'ACTIVE', 4.1, 67,
   '09:30', '20:30', 6),

  ('s1000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000000',
   'Maya Collection',
   'Exclusive ethnic wear collection. Sarees, kurtis, and designer pieces for every occasion.',
   '9876543214',
   'First Floor, Race Course Circle',
   'Vadodara', '390007',
   22.3072, 73.1812,
   'ACTIVE', 4.6, 182,
   '10:00', '21:00', 5);

-- ==========================================
-- DEMO PRODUCTS
-- ==========================================

-- === RAJ FASHION (Store 1) - Men's Clothing ===

INSERT INTO products (id, store_id, name, description, short_description, category_id, gender, color, material, fit, price, original_price, tags, sizes, rating, total_ratings, is_active, is_published) VALUES

-- HERO PRODUCT (for demo)
('p1000000-0000-0000-0000-000000000001',
 's1000000-0000-0000-0000-000000000001',
 'Black Oversized Cotton Shirt',
 'Elevate your casual wardrobe with this premium oversized cotton shirt. Crafted from 100% breathable cotton with a relaxed fit that drapes perfectly. Features a classic collar, full button placket, and a slightly dropped shoulder for that effortlessly cool oversized silhouette. Perfect for layering or wearing solo.',
 'Premium oversized cotton shirt with relaxed fit',
 'c1000000-0000-0000-0000-000000000004', 'MEN', 'Black', 'Cotton', 'OVERSIZED',
 799, 1299, ARRAY['casual', 'oversized', 'cotton', 'black', 'shirt', 'trendy'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
 4.6, 45, true, true),

('p1000000-0000-0000-0000-000000000002',
 's1000000-0000-0000-0000-000000000001',
 'Navy Slim Fit Formal Shirt',
 'A sophisticated navy blue formal shirt designed for the modern professional. Made from premium poly-cotton blend with wrinkle-resistant properties. Slim fit cut ensures a sharp, tailored look. Features a spread collar and barrel cuffs.',
 'Sharp navy formal shirt for the modern professional',
 'c1000000-0000-0000-0000-000000000004', 'MEN', 'Navy Blue', 'Poly-Cotton', 'SLIM',
 899, 1499, ARRAY['formal', 'slim-fit', 'navy', 'office', 'shirt'], ARRAY['S', 'M', 'L', 'XL'],
 4.4, 32, true, true),

('p1000000-0000-0000-0000-000000000003',
 's1000000-0000-0000-0000-000000000001',
 'White Linen Casual Shirt',
 'Stay cool and stylish with this premium white linen shirt. Lightweight and breathable, perfect for summer outings. Features a mandarin collar and roll-up sleeves with tab holders.',
 'Breezy white linen shirt for summer',
 'c1000000-0000-0000-0000-000000000004', 'MEN', 'White', 'Linen', 'REGULAR',
 1199, 1899, ARRAY['linen', 'casual', 'white', 'summer', 'shirt'], ARRAY['S', 'M', 'L', 'XL'],
 4.7, 58, true, true),

('p1000000-0000-0000-0000-000000000004',
 's1000000-0000-0000-0000-000000000001',
 'Olive Cargo Joggers',
 'Utility meets comfort in these olive cargo joggers. Elastic waistband with drawstring, multiple cargo pockets, and ribbed ankle cuffs. Made from durable cotton twill with a hint of stretch.',
 'Versatile olive cargo joggers with stretch',
 'c1000000-0000-0000-0000-000000000012', 'MEN', 'Olive', 'Cotton Twill', 'REGULAR',
 999, 1599, ARRAY['cargo', 'joggers', 'olive', 'casual', 'pants'], ARRAY['S', 'M', 'L', 'XL'],
 4.3, 27, true, true),

('p1000000-0000-0000-0000-000000000005',
 's1000000-0000-0000-0000-000000000001',
 'Grey Graphic Oversized T-Shirt',
 'Make a statement with this grey oversized graphic tee. Features a bold urban print on premium 240 GSM cotton. Drop shoulders and a boxy fit for maximum street cred.',
 'Bold graphic tee with urban print',
 'c1000000-0000-0000-0000-000000000005', 'MEN', 'Grey', 'Cotton', 'OVERSIZED',
 599, 999, ARRAY['graphic', 't-shirt', 'oversized', 'grey', 'streetwear'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
 4.5, 89, true, true),

('p1000000-0000-0000-0000-000000000006',
 's1000000-0000-0000-0000-000000000001',
 'Indigo Slim Fit Denim Jeans',
 'Classic indigo denim jeans with a modern slim fit. Mid-rise with slight whisker wash for a lived-in look. Premium denim with 2% elastane for comfortable all-day wear.',
 'Classic indigo slim denim with stretch',
 'c1000000-0000-0000-0000-000000000006', 'MEN', 'Indigo', 'Denim', 'SLIM',
 1299, 1999, ARRAY['jeans', 'denim', 'slim-fit', 'indigo', 'classic'], ARRAY['28', '30', '32', '34', '36'],
 4.4, 63, true, true),

('p1000000-0000-0000-0000-000000000007',
 's1000000-0000-0000-0000-000000000001',
 'Maroon Henley Full Sleeve',
 'A wardrobe essential — this maroon henley features a three-button placket and full sleeves. Made from soft cotton jersey with ribbed cuffs. Perfect for layering under jackets.',
 'Essential maroon henley for layering',
 'c1000000-0000-0000-0000-000000000005', 'MEN', 'Maroon', 'Cotton Jersey', 'REGULAR',
 649, 1099, ARRAY['henley', 'full-sleeve', 'maroon', 'casual', 'layering'], ARRAY['S', 'M', 'L', 'XL'],
 4.2, 41, true, true),

('p1000000-0000-0000-0000-000000000008',
 's1000000-0000-0000-0000-000000000001',
 'Black Bomber Jacket',
 'Sleek black bomber jacket with ribbed collar, cuffs, and hem. Lightweight polyester shell with satin lining. Features two side pockets and an interior pocket. The perfect transitional piece.',
 'Classic black bomber with satin lining',
 'c1000000-0000-0000-0000-000000000010', 'MEN', 'Black', 'Polyester', 'REGULAR',
 1899, 2999, ARRAY['bomber', 'jacket', 'black', 'outerwear', 'winter'], ARRAY['S', 'M', 'L', 'XL'],
 4.8, 35, true, true),

-- === STYLE HUB (Store 2) - Women's Clothing ===

('p1000000-0000-0000-0000-000000000009',
 's1000000-0000-0000-0000-000000000002',
 'Emerald Green Anarkali Kurti',
 'Stunning emerald green Anarkali kurti with intricate gold zari work on the yoke and border. Flowing A-line silhouette with three-quarter sleeves. Made from premium rayon with cotton lining.',
 'Elegant Anarkali with gold zari detailing',
 'c1000000-0000-0000-0000-000000000007', 'WOMEN', 'Emerald Green', 'Rayon', 'REGULAR',
 1499, 2499, ARRAY['kurti', 'anarkali', 'ethnic', 'green', 'festive', 'zari'], ARRAY['XS', 'S', 'M', 'L', 'XL'],
 4.7, 73, true, true),

('p1000000-0000-0000-0000-000000000010',
 's1000000-0000-0000-0000-000000000002',
 'Blush Pink Chiffon Dress',
 'A dreamy blush pink chiffon dress that''s perfect for brunches and garden parties. Features delicate ruffle detailing, a fitted waist, and a flowing midi-length skirt. Lined for comfort.',
 'Dreamy chiffon midi dress with ruffles',
 'c1000000-0000-0000-0000-000000000008', 'WOMEN', 'Blush Pink', 'Chiffon', 'REGULAR',
 1799, 2799, ARRAY['dress', 'chiffon', 'pink', 'party', 'midi', 'elegant'], ARRAY['XS', 'S', 'M', 'L'],
 4.6, 54, true, true),

('p1000000-0000-0000-0000-000000000011',
 's1000000-0000-0000-0000-000000000002',
 'Royal Blue Printed Kurti Set',
 'Complete kurti set in royal blue with contemporary geometric prints. Includes a straight-cut kurti with side slits and matching palazzos. Comfortable cotton fabric with vibrant prints.',
 'Printed kurti set with matching palazzos',
 'c1000000-0000-0000-0000-000000000007', 'WOMEN', 'Royal Blue', 'Cotton', 'REGULAR',
 1299, 1999, ARRAY['kurti', 'set', 'printed', 'blue', 'palazzo', 'casual'], ARRAY['S', 'M', 'L', 'XL'],
 4.4, 46, true, true),

('p1000000-0000-0000-0000-000000000012',
 's1000000-0000-0000-0000-000000000002',
 'Ivory Embroidered Top',
 'Elegant ivory top with delicate floral embroidery on the front. Features a V-neck, three-quarter sleeves, and a relaxed fit. Made from soft viscose for a luxurious feel.',
 'Elegant embroidered top in ivory',
 'c1000000-0000-0000-0000-000000000004', 'WOMEN', 'Ivory', 'Viscose', 'REGULAR',
 899, 1399, ARRAY['top', 'embroidered', 'ivory', 'elegant', 'casual'], ARRAY['XS', 'S', 'M', 'L', 'XL'],
 4.3, 38, true, true),

('p1000000-0000-0000-0000-000000000013',
 's1000000-0000-0000-0000-000000000002',
 'Burgundy Velvet Blazer',
 'Make a statement with this luxurious burgundy velvet blazer. Single-button closure, notch lapel, and satin-lined interior. Perfect for evening events and festive occasions.',
 'Luxurious velvet blazer for special occasions',
 'c1000000-0000-0000-0000-000000000010', 'WOMEN', 'Burgundy', 'Velvet', 'SLIM',
 2499, 3999, ARRAY['blazer', 'velvet', 'burgundy', 'formal', 'party', 'premium'], ARRAY['XS', 'S', 'M', 'L'],
 4.8, 29, true, true),

-- === URBAN WEAR (Store 3) - Streetwear ===

('p1000000-0000-0000-0000-000000000014',
 's1000000-0000-0000-0000-000000000003',
 'Acid Wash Oversized Hoodie',
 'Ultimate streetwear staple — this acid wash hoodie features a kangaroo pocket, drawstring hood, and ribbed cuffs. Heavy 350 GSM cotton fleece for warmth and durability.',
 'Heavy acid wash hoodie for streetwear',
 'c1000000-0000-0000-0000-000000000010', 'UNISEX', 'Grey/Black', 'Cotton Fleece', 'OVERSIZED',
 1599, 2499, ARRAY['hoodie', 'acid-wash', 'oversized', 'streetwear', 'unisex'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
 4.7, 112, true, true),

('p1000000-0000-0000-0000-000000000015',
 's1000000-0000-0000-0000-000000000003',
 'Beige Wide Leg Cargo Pants',
 'Relaxed wide-leg cargo pants in beige. Six-pocket utility design with adjustable drawstring waist. Made from heavyweight cotton twill. The perfect fusion of function and fashion.',
 'Wide-leg utility cargo pants',
 'c1000000-0000-0000-0000-000000000012', 'UNISEX', 'Beige', 'Cotton Twill', 'LOOSE',
 1199, 1899, ARRAY['cargo', 'wide-leg', 'beige', 'utility', 'streetwear'], ARRAY['S', 'M', 'L', 'XL'],
 4.5, 67, true, true),

('p1000000-0000-0000-0000-000000000016',
 's1000000-0000-0000-0000-000000000003',
 'Tie-Dye Boxy T-Shirt',
 'Vibrant hand tie-dyed boxy t-shirt. Each piece is unique with swirl patterns in blue and purple. Made from 100% premium combed cotton.',
 'Unique hand-dyed boxy tee',
 'c1000000-0000-0000-0000-000000000005', 'UNISEX', 'Blue/Purple', 'Cotton', 'OVERSIZED',
 699, 1099, ARRAY['tie-dye', 't-shirt', 'boxy', 'colorful', 'unique', 'streetwear'], ARRAY['S', 'M', 'L', 'XL'],
 4.4, 83, true, true),

('p1000000-0000-0000-0000-000000000017',
 's1000000-0000-0000-0000-000000000003',
 'Black Distressed Skinny Jeans',
 'Edgy black distressed skinny jeans with authentic rip detailing at the knees. Premium stretch denim for a second-skin fit without sacrificing comfort.',
 'Edgy black distressed skinny denim',
 'c1000000-0000-0000-0000-000000000006', 'MEN', 'Black', 'Stretch Denim', 'SLIM',
 1399, 2199, ARRAY['jeans', 'distressed', 'black', 'skinny', 'edgy'], ARRAY['28', '30', '32', '34', '36'],
 4.3, 51, true, true),

('p1000000-0000-0000-0000-000000000018',
 's1000000-0000-0000-0000-000000000003',
 'Colour Block Windbreaker',
 'Retro-inspired colour block windbreaker in teal and cream. Water-resistant nylon shell with mesh lining. Features a half-zip, adjustable hood, and elastic cuffs.',
 'Retro colour block wind-resistant jacket',
 'c1000000-0000-0000-0000-000000000010', 'UNISEX', 'Teal/Cream', 'Nylon', 'REGULAR',
 1799, 2799, ARRAY['windbreaker', 'colour-block', 'teal', 'retro', 'jacket', 'unisex'], ARRAY['S', 'M', 'L', 'XL'],
 4.6, 44, true, true),

('p1000000-0000-0000-0000-000000000019',
 's1000000-0000-0000-0000-000000000003',
 'White Platform Canvas Sneakers',
 'Elevated classic canvas sneakers with a chunky platform sole. Clean all-white design with vulcanized rubber outsole. Cushioned insole for all-day comfort.',
 'Clean white platform canvas kicks',
 'c1000000-0000-0000-0000-000000000011', 'UNISEX', 'White', 'Canvas', 'REGULAR',
 1499, 2299, ARRAY['sneakers', 'platform', 'white', 'canvas', 'shoes', 'footwear'], ARRAY['UK6', 'UK7', 'UK8', 'UK9', 'UK10'],
 4.5, 72, true, true),

-- === FASHION POINT (Store 4) - Family ===

('p1000000-0000-0000-0000-000000000020',
 's1000000-0000-0000-0000-000000000004',
 'Kids Dinosaur Print T-Shirt',
 'Fun dinosaur print t-shirt for little adventurers. Bright colours and playful design. Made from soft 100% organic cotton that''s gentle on young skin.',
 'Fun dino tee for little adventurers',
 'c1000000-0000-0000-0000-000000000005', 'KIDS', 'Green', 'Organic Cotton', 'REGULAR',
 399, 699, ARRAY['kids', 'dinosaur', 't-shirt', 'fun', 'organic', 'boys'], ARRAY['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
 4.6, 95, true, true),

('p1000000-0000-0000-0000-000000000021',
 's1000000-0000-0000-0000-000000000004',
 'Girls Floral Cotton Frock',
 'Adorable floral print cotton frock with puff sleeves and a twirl-worthy skirt. Features a comfortable elastic waist and a cute bow detail at the back.',
 'Adorable floral frock with puff sleeves',
 'c1000000-0000-0000-0000-000000000008', 'KIDS', 'Yellow', 'Cotton', 'REGULAR',
 599, 999, ARRAY['kids', 'girls', 'frock', 'floral', 'cotton', 'cute'], ARRAY['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
 4.7, 68, true, true),

('p1000000-0000-0000-0000-000000000022',
 's1000000-0000-0000-0000-000000000004',
 'Checkered Casual Shirt - Men',
 'Classic red and black checkered casual shirt. Button-down collar with chest pocket. Made from soft brushed cotton flannel.',
 'Classic red-black flannel check shirt',
 'c1000000-0000-0000-0000-000000000004', 'MEN', 'Red/Black', 'Cotton Flannel', 'REGULAR',
 749, 1199, ARRAY['checkered', 'flannel', 'casual', 'red', 'shirt'], ARRAY['S', 'M', 'L', 'XL'],
 4.2, 37, true, true),

('p1000000-0000-0000-0000-000000000023',
 's1000000-0000-0000-0000-000000000004',
 'Women''s Denim A-Line Skirt',
 'Versatile denim A-line skirt that pairs with everything. Classic blue wash with a comfortable high waist. Features front button closure and two patch pockets.',
 'Classic denim A-line with button front',
 'c1000000-0000-0000-0000-000000000008', 'WOMEN', 'Blue', 'Denim', 'REGULAR',
 899, 1499, ARRAY['skirt', 'denim', 'a-line', 'blue', 'classic', 'women'], ARRAY['XS', 'S', 'M', 'L', 'XL'],
 4.4, 43, true, true),

('p1000000-0000-0000-0000-000000000024',
 's1000000-0000-0000-0000-000000000004',
 'Boys Jogger Set',
 'Comfortable jogger set for active boys. Includes a hoodie top and matching jogger bottoms. Made from soft terry cotton. Perfect for play and casual outings.',
 'Comfy hoodie + jogger set for boys',
 'c1000000-0000-0000-0000-000000000005', 'KIDS', 'Navy', 'Terry Cotton', 'REGULAR',
 799, 1299, ARRAY['kids', 'boys', 'jogger', 'set', 'hoodie', 'comfortable'], ARRAY['4-5Y', '6-7Y', '8-9Y', '10-11Y'],
 4.5, 52, true, true),

-- === MAYA COLLECTION (Store 5) - Ethnic Wear ===

('p1000000-0000-0000-0000-000000000025',
 's1000000-0000-0000-0000-000000000005',
 'Magenta Banarasi Silk Saree',
 'Exquisite magenta Banarasi silk saree with traditional gold zari weaving. Features an elaborate pallu with intricate motifs. Comes with an unstitched blouse piece. A timeless piece for weddings and festivities.',
 'Exquisite Banarasi silk with gold zari',
 'c1000000-0000-0000-0000-000000000009', 'WOMEN', 'Magenta', 'Banarasi Silk', 'REGULAR',
 3999, 6999, ARRAY['saree', 'banarasi', 'silk', 'magenta', 'wedding', 'festive', 'premium'], ARRAY['Free Size'],
 4.9, 41, true, true),

('p1000000-0000-0000-0000-000000000026',
 's1000000-0000-0000-0000-000000000005',
 'Teal Chanderi Cotton Saree',
 'Lightweight teal Chanderi cotton saree with subtle golden checks. A perfect blend of traditional craft and modern elegance. Easy to drape and comfortable for all-day wear.',
 'Lightweight Chanderi saree with golden checks',
 'c1000000-0000-0000-0000-000000000009', 'WOMEN', 'Teal', 'Chanderi Cotton', 'REGULAR',
 1899, 2999, ARRAY['saree', 'chanderi', 'cotton', 'teal', 'elegant', 'lightweight'], ARRAY['Free Size'],
 4.6, 57, true, true),

('p1000000-0000-0000-0000-000000000027',
 's1000000-0000-0000-0000-000000000005',
 'Mustard Mirror Work Kurti',
 'Vibrant mustard kurti with exquisite mirror work embroidery on the yoke and sleeves. A-line silhouette with three-quarter sleeves. Made from premium cotton with a soft inner lining.',
 'Festive kurti with mirror work detailing',
 'c1000000-0000-0000-0000-000000000007', 'WOMEN', 'Mustard', 'Cotton', 'REGULAR',
 1099, 1799, ARRAY['kurti', 'mirror-work', 'mustard', 'ethnic', 'festive'], ARRAY['XS', 'S', 'M', 'L', 'XL'],
 4.5, 64, true, true),

('p1000000-0000-0000-0000-000000000028',
 's1000000-0000-0000-0000-000000000005',
 'Black Palazzo with Gold Border',
 'Elegant black palazzo pants with a rich gold woven border at the hem. Elasticated waist for comfort. Made from flowing rayon fabric that drapes beautifully.',
 'Elegant palazzos with gold woven border',
 'c1000000-0000-0000-0000-000000000012', 'WOMEN', 'Black', 'Rayon', 'LOOSE',
 699, 1099, ARRAY['palazzo', 'black', 'gold', 'border', 'ethnic', 'elegant'], ARRAY['S', 'M', 'L', 'XL'],
 4.4, 48, true, true),

('p1000000-0000-0000-0000-000000000029',
 's1000000-0000-0000-0000-000000000005',
 'Coral Georgette Dupatta',
 'Beautiful coral georgette dupatta with delicate pearl work along the borders. Lightweight and versatile — pairs perfectly with any ethnic outfit.',
 'Georgette dupatta with pearl detailing',
 'c1000000-0000-0000-0000-000000000007', 'WOMEN', 'Coral', 'Georgette', 'REGULAR',
 499, 899, ARRAY['dupatta', 'georgette', 'coral', 'pearl', 'accessory', 'ethnic'], ARRAY['Free Size'],
 4.3, 36, true, true),

-- Additional products for variety

('p1000000-0000-0000-0000-000000000030',
 's1000000-0000-0000-0000-000000000001',
 'Charcoal Polo T-Shirt',
 'Classic charcoal polo with a modern twist. Premium pique cotton with tipped collar and cuffs. Features a subtle chest logo embroidery. A versatile piece for smart-casual occasions.',
 'Modern polo with premium pique cotton',
 'c1000000-0000-0000-0000-000000000005', 'MEN', 'Charcoal', 'Pique Cotton', 'REGULAR',
 699, 1199, ARRAY['polo', 't-shirt', 'charcoal', 'smart-casual', 'classic'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
 4.3, 55, true, true),

('p1000000-0000-0000-0000-000000000031',
 's1000000-0000-0000-0000-000000000002',
 'Lavender Wrap Dress',
 'Romantic lavender wrap dress with a flattering V-neck and tie waist. Flowing crepe fabric that moves beautifully. Perfect for date nights and celebrations.',
 'Romantic wrap dress in lavender crepe',
 'c1000000-0000-0000-0000-000000000008', 'WOMEN', 'Lavender', 'Crepe', 'REGULAR',
 1599, 2499, ARRAY['dress', 'wrap', 'lavender', 'romantic', 'date-night', 'elegant'], ARRAY['XS', 'S', 'M', 'L'],
 4.6, 39, true, true),

('p1000000-0000-0000-0000-000000000032',
 's1000000-0000-0000-0000-000000000003',
 'Rust Corduroy Shirt Jacket',
 'A versatile rust corduroy shirt jacket (shacket) that works as both a shirt and a light jacket. Features chest pockets, button closure, and a relaxed fit. Made from soft wide-wale corduroy.',
 'Versatile corduroy shacket in warm rust',
 'c1000000-0000-0000-0000-000000000010', 'UNISEX', 'Rust', 'Corduroy', 'REGULAR',
 1699, 2699, ARRAY['shacket', 'corduroy', 'rust', 'jacket', 'layering', 'autumn'], ARRAY['S', 'M', 'L', 'XL'],
 4.5, 31, true, true),

('p1000000-0000-0000-0000-000000000033',
 's1000000-0000-0000-0000-000000000004',
 'Girls Sequin Party Dress',
 'Sparkle and shine in this adorable sequin party dress. Features a tulle skirt with sequin bodice and a satin bow at the waist. Perfect for birthdays and celebrations.',
 'Sparkly sequin dress for little stars',
 'c1000000-0000-0000-0000-000000000008', 'KIDS', 'Pink', 'Polyester/Tulle', 'REGULAR',
 999, 1699, ARRAY['kids', 'girls', 'sequin', 'party', 'dress', 'sparkle'], ARRAY['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
 4.7, 44, true, true),

('p1000000-0000-0000-0000-000000000034',
 's1000000-0000-0000-0000-000000000005',
 'Peach Chikankari Kurti',
 'Delicate peach kurti with authentic Lucknowi chikankari embroidery. Hand-embroidered floral motifs on premium cotton. A masterpiece of Indian craftsmanship.',
 'Authentic Lucknowi chikankari in peach',
 'c1000000-0000-0000-0000-000000000007', 'WOMEN', 'Peach', 'Cotton', 'REGULAR',
 1399, 2199, ARRAY['kurti', 'chikankari', 'peach', 'ethnic', 'handwork', 'lucknowi'], ARRAY['XS', 'S', 'M', 'L', 'XL'],
 4.8, 71, true, true),

('p1000000-0000-0000-0000-000000000035',
 's1000000-0000-0000-0000-000000000001',
 'Khaki Chino Trousers',
 'Essential khaki chino trousers with a clean, sharp look. Made from premium stretch cotton twill. Features a flat front, belt loops, and a tailored fit through the leg.',
 'Sharp khaki chinos with stretch comfort',
 'c1000000-0000-0000-0000-000000000012', 'MEN', 'Khaki', 'Cotton Twill', 'SLIM',
 999, 1599, ARRAY['chinos', 'trousers', 'khaki', 'formal', 'smart-casual'], ARRAY['28', '30', '32', '34', '36'],
 4.4, 48, true, true),

('p1000000-0000-0000-0000-000000000036',
 's1000000-0000-0000-0000-000000000002',
 'Sage Green Linen Co-ord Set',
 'Effortlessly chic sage green co-ord set. Includes a relaxed crop top and high-waisted wide-leg pants. Made from breathable pure linen. Perfect for vacation vibes.',
 'Relaxed linen co-ord in sage green',
 'c1000000-0000-0000-0000-000000000008', 'WOMEN', 'Sage Green', 'Linen', 'REGULAR',
 1999, 3199, ARRAY['co-ord', 'linen', 'green', 'vacation', 'set', 'crop-top'], ARRAY['XS', 'S', 'M', 'L'],
 4.7, 33, true, true),

('p1000000-0000-0000-0000-000000000037',
 's1000000-0000-0000-0000-000000000003',
 'Washed Black Denim Jacket',
 'Essential washed black denim jacket with classic trucker styling. Button front, chest pockets, and adjustable waist tabs. Heavy-weight denim that ages beautifully.',
 'Classic washed black trucker denim',
 'c1000000-0000-0000-0000-000000000010', 'UNISEX', 'Washed Black', 'Denim', 'REGULAR',
 1899, 2999, ARRAY['denim', 'jacket', 'washed', 'black', 'trucker', 'classic'], ARRAY['S', 'M', 'L', 'XL'],
 4.6, 58, true, true),

('p1000000-0000-0000-0000-000000000038',
 's1000000-0000-0000-0000-000000000004',
 'Men''s Striped Kurta',
 'Contemporary striped kurta in earthy tones. Perfect for festive occasions and casual ethnic wear. Made from handloom cotton with natural dyes.',
 'Contemporary handloom cotton kurta',
 'c1000000-0000-0000-0000-000000000007', 'MEN', 'Brown/Cream', 'Handloom Cotton', 'REGULAR',
 999, 1599, ARRAY['kurta', 'striped', 'ethnic', 'handloom', 'men', 'festive'], ARRAY['S', 'M', 'L', 'XL', 'XXL'],
 4.3, 29, true, true),

('p1000000-0000-0000-0000-000000000039',
 's1000000-0000-0000-0000-000000000005',
 'Wine Red Silk Blend Kurti',
 'Rich wine red kurti in silk-cotton blend with subtle gold thread work. Features a mandarin collar, front pintucks, and three-quarter sleeves. Semi-formal elegance at its finest.',
 'Silk-blend kurti with gold threadwork',
 'c1000000-0000-0000-0000-000000000007', 'WOMEN', 'Wine Red', 'Silk-Cotton Blend', 'REGULAR',
 1599, 2499, ARRAY['kurti', 'silk', 'wine', 'gold', 'semi-formal', 'premium'], ARRAY['XS', 'S', 'M', 'L', 'XL'],
 4.6, 47, true, true),

('p1000000-0000-0000-0000-000000000040',
 's1000000-0000-0000-0000-000000000003',
 'Tan Faux Leather Slide Sandals',
 'Minimalist tan faux leather slide sandals with a contoured footbed. Wide single strap with crossover design. Memory foam cushioning for cloud-like comfort.',
 'Minimalist leather slides with memory foam',
 'c1000000-0000-0000-0000-000000000011', 'UNISEX', 'Tan', 'Faux Leather', 'REGULAR',
 799, 1299, ARRAY['sandals', 'slides', 'tan', 'leather', 'minimalist', 'footwear'], ARRAY['UK6', 'UK7', 'UK8', 'UK9', 'UK10'],
 4.4, 62, true, true),

('p1000000-0000-0000-0000-000000000041',
 's1000000-0000-0000-0000-000000000001',
 'Dusty Rose Linen Shirt',
 'A refined dusty rose linen shirt for the fashion-forward man. Relaxed fit with a mandarin collar and roll-up sleeves. Pure linen fabric ensures breathability.',
 'Fashion-forward linen shirt in dusty rose',
 'c1000000-0000-0000-0000-000000000004', 'MEN', 'Dusty Rose', 'Linen', 'REGULAR',
 1099, 1799, ARRAY['shirt', 'linen', 'pink', 'rose', 'mandarin-collar', 'summer'], ARRAY['S', 'M', 'L', 'XL'],
 4.5, 26, true, true),

('p1000000-0000-0000-0000-000000000042',
 's1000000-0000-0000-0000-000000000002',
 'Black Sequin Pencil Skirt',
 'Dazzling black sequin pencil skirt for glamorous evenings. Fully sequined exterior with a satin lining and back slit. High waist with concealed zip closure.',
 'Glamorous sequin pencil skirt',
 'c1000000-0000-0000-0000-000000000008', 'WOMEN', 'Black', 'Sequin/Satin', 'SLIM',
 1299, 2199, ARRAY['skirt', 'sequin', 'black', 'pencil', 'party', 'glamorous'], ARRAY['XS', 'S', 'M', 'L'],
 4.5, 33, true, true);

-- ==========================================
-- INVENTORY (create stock for all products)
-- ==========================================

-- Generate inventory for each product with their defined sizes
-- We'll use a simple approach: create inventory for each product-size combination

INSERT INTO inventory (product_id, size, quantity, low_stock_threshold) VALUES
-- Product 1 (Hero: Black Oversized Cotton Shirt)
('p1000000-0000-0000-0000-000000000001', 'S', 8, 3),
('p1000000-0000-0000-0000-000000000001', 'M', 12, 3),
('p1000000-0000-0000-0000-000000000001', 'L', 10, 3),
('p1000000-0000-0000-0000-000000000001', 'XL', 5, 2),
('p1000000-0000-0000-0000-000000000001', 'XXL', 3, 2),

-- Product 2
('p1000000-0000-0000-0000-000000000002', 'S', 6, 2),
('p1000000-0000-0000-0000-000000000002', 'M', 10, 3),
('p1000000-0000-0000-0000-000000000002', 'L', 8, 2),
('p1000000-0000-0000-0000-000000000002', 'XL', 4, 2),

-- Product 3
('p1000000-0000-0000-0000-000000000003', 'S', 5, 2),
('p1000000-0000-0000-0000-000000000003', 'M', 8, 3),
('p1000000-0000-0000-0000-000000000003', 'L', 7, 2),
('p1000000-0000-0000-0000-000000000003', 'XL', 3, 2),

-- Product 4
('p1000000-0000-0000-0000-000000000004', 'S', 7, 2),
('p1000000-0000-0000-0000-000000000004', 'M', 10, 3),
('p1000000-0000-0000-0000-000000000004', 'L', 8, 2),
('p1000000-0000-0000-0000-000000000004', 'XL', 4, 2),

-- Product 5
('p1000000-0000-0000-0000-000000000005', 'S', 15, 5),
('p1000000-0000-0000-0000-000000000005', 'M', 20, 5),
('p1000000-0000-0000-0000-000000000005', 'L', 18, 5),
('p1000000-0000-0000-0000-000000000005', 'XL', 10, 3),
('p1000000-0000-0000-0000-000000000005', 'XXL', 5, 2),

-- Product 6
('p1000000-0000-0000-0000-000000000006', '28', 4, 2),
('p1000000-0000-0000-0000-000000000006', '30', 8, 3),
('p1000000-0000-0000-0000-000000000006', '32', 10, 3),
('p1000000-0000-0000-0000-000000000006', '34', 7, 2),
('p1000000-0000-0000-0000-000000000006', '36', 3, 2),

-- Product 7
('p1000000-0000-0000-0000-000000000007', 'S', 8, 3),
('p1000000-0000-0000-0000-000000000007', 'M', 12, 3),
('p1000000-0000-0000-0000-000000000007', 'L', 10, 3),
('p1000000-0000-0000-0000-000000000007', 'XL', 5, 2),

-- Product 8
('p1000000-0000-0000-0000-000000000008', 'S', 4, 2),
('p1000000-0000-0000-0000-000000000008', 'M', 6, 2),
('p1000000-0000-0000-0000-000000000008', 'L', 5, 2),
('p1000000-0000-0000-0000-000000000008', 'XL', 3, 2),

-- Product 9
('p1000000-0000-0000-0000-000000000009', 'XS', 4, 2),
('p1000000-0000-0000-0000-000000000009', 'S', 7, 2),
('p1000000-0000-0000-0000-000000000009', 'M', 10, 3),
('p1000000-0000-0000-0000-000000000009', 'L', 8, 2),
('p1000000-0000-0000-0000-000000000009', 'XL', 4, 2),

-- Product 10
('p1000000-0000-0000-0000-000000000010', 'XS', 3, 2),
('p1000000-0000-0000-0000-000000000010', 'S', 5, 2),
('p1000000-0000-0000-0000-000000000010', 'M', 7, 2),
('p1000000-0000-0000-0000-000000000010', 'L', 4, 2);

-- Continue inventory for remaining products (abbreviated for space — all sizes get stock)
INSERT INTO inventory (product_id, size, quantity, low_stock_threshold)
SELECT p.id, s.size, 
  CASE WHEN random() > 0.7 THEN floor(random() * 5 + 2)::int 
       ELSE floor(random() * 15 + 5)::int END,
  3
FROM products p
CROSS JOIN LATERAL unnest(p.sizes) AS s(size)
WHERE p.id NOT IN (
  'p1000000-0000-0000-0000-000000000001',
  'p1000000-0000-0000-0000-000000000002',
  'p1000000-0000-0000-0000-000000000003',
  'p1000000-0000-0000-0000-000000000004',
  'p1000000-0000-0000-0000-000000000005',
  'p1000000-0000-0000-0000-000000000006',
  'p1000000-0000-0000-0000-000000000007',
  'p1000000-0000-0000-0000-000000000008',
  'p1000000-0000-0000-0000-000000000009',
  'p1000000-0000-0000-0000-000000000010'
)
ON CONFLICT (product_id, size) DO NOTHING;

-- ==========================================
-- DEMO DELIVERY PARTNERS
-- Note: user_id will need to be set after creating auth users
-- ==========================================

INSERT INTO delivery_partners (id, user_id, name, phone, availability, latitude, longitude, total_deliveries, rating) VALUES
('d1000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000000', -- placeholder
 'Rahul Kumar', '9876543220', 'AVAILABLE',
 22.3100, 73.1750, 156, 4.8),
('d1000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000000',
 'Amit Singh', '9876543221', 'AVAILABLE',
 22.3180, 73.1830, 89, 4.6),
('d1000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000000',
 'Priya Sharma', '9876543222', 'AVAILABLE',
 22.3050, 73.1900, 203, 4.9);
