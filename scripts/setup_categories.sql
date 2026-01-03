-- JEFFY CATEGORIES SETUP
-- Run this in Supabase SQL Editor to create all product categories
-- Date: January 3, 2026

-- First, check existing categories
-- SELECT * FROM categories;

-- Insert parent categories first
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
  ('Hair', 'hair', 'Braiding hair, wigs, and hair accessories', NULL, 1),
  ('Nails', 'nails', 'Press-on nails, gel polish, and nail tools', NULL, 2),
  ('Makeup', 'makeup', 'Cosmetics and makeup tools', NULL, 3),
  ('Skincare', 'skincare', 'Face and body skincare products', NULL, 4),
  ('Fragrance', 'fragrance', 'Perfumes and body mists', NULL, 5),
  ('Accessories', 'accessories', 'Jewelry, bags, watches, and more', NULL, 6),
  ('Electronics', 'electronics', 'Phone cases, LED lights, and gadgets', NULL, 7)
ON CONFLICT (slug) DO NOTHING;

-- Now insert sub-categories (need parent IDs)
-- Hair sub-categories
INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Crochet Braids', 'hair-crochet-braids', 'Crochet braiding hair extensions', id, 1
FROM categories WHERE slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Box Braids', 'hair-box-braids', 'Pre-stretched box braiding hair', id, 2
FROM categories WHERE slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Passion Twist', 'hair-passion-twist', 'Passion twist crochet hair', id, 3
FROM categories WHERE slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Goddess Locs', 'hair-goddess-locs', 'Goddess locs and faux locs', id, 4
FROM categories WHERE slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Gypsy Locs', 'hair-gypsy-locs', 'Gypsy boho locs hair', id, 5
FROM categories WHERE slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'French Curl', 'hair-french-curl', 'French curl and ocean wave crochet', id, 6
FROM categories WHERE slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Hair Oil & Serum', 'hair-oil', 'Hair oils and treatment serums', id, 7
FROM categories WHERE slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

-- Nails sub-categories
INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Nail Tools', 'nails-tools', 'Nail art tools and equipment', id, 1
FROM categories WHERE slug = 'nails'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Press-On Nails', 'nails-press-on', 'Ready-to-wear press-on nail sets', id, 2
FROM categories WHERE slug = 'nails'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Gel Polish', 'nails-gel-polish', 'UV/LED gel nail polish', id, 3
FROM categories WHERE slug = 'nails'
ON CONFLICT (slug) DO NOTHING;

-- Makeup sub-categories
INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Eyelashes', 'makeup-eyelashes', 'False eyelashes and lash accessories', id, 1
FROM categories WHERE slug = 'makeup'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Lip Products', 'makeup-lips', 'Lip gloss, lipstick, and lip care', id, 2
FROM categories WHERE slug = 'makeup'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Makeup Brushes', 'makeup-brushes', 'Makeup brush sets and tools', id, 3
FROM categories WHERE slug = 'makeup'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Eyeshadow', 'makeup-eyeshadow', 'Eyeshadow palettes and singles', id, 4
FROM categories WHERE slug = 'makeup'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Concealer & Foundation', 'makeup-concealer', 'Face concealer and foundation', id, 5
FROM categories WHERE slug = 'makeup'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Setting Spray', 'makeup-setting-spray', 'Makeup setting and fixing sprays', id, 6
FROM categories WHERE slug = 'makeup'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Makeup Sponges', 'makeup-sponges', 'Beauty blenders and makeup sponges', id, 7
FROM categories WHERE slug = 'makeup'
ON CONFLICT (slug) DO NOTHING;

-- Skincare sub-categories
INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Face Serum', 'skincare-serum', 'Facial serums and treatments', id, 1
FROM categories WHERE slug = 'skincare'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Face Masks', 'skincare-face-mask', 'Sheet masks and face treatments', id, 2
FROM categories WHERE slug = 'skincare'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Body Care', 'skincare-body-scrub', 'Body scrubs, loofahs, and body care', id, 3
FROM categories WHERE slug = 'skincare'
ON CONFLICT (slug) DO NOTHING;

-- Fragrance sub-categories
INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Perfume', 'fragrance-perfume', 'Eau de parfum and perfumes', id, 1
FROM categories WHERE slug = 'fragrance'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Body Mist', 'fragrance-body-mist', 'Body sprays and mists', id, 2
FROM categories WHERE slug = 'fragrance'
ON CONFLICT (slug) DO NOTHING;

-- Accessories sub-categories
INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Sunglasses', 'accessories-sunglasses', 'Fashion sunglasses', id, 1
FROM categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Earrings', 'jewelry-earrings', 'Fashion earrings and ear accessories', id, 2
FROM categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Necklaces', 'jewelry-necklaces', 'Chains, pendants, and necklaces', id, 3
FROM categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Hair Clips', 'accessories-hair-clips', 'Claw clips and hair accessories', id, 4
FROM categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Watches', 'accessories-watches', 'Fashion watches', id, 5
FROM categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Bags', 'accessories-bags', 'Handbags and purses', id, 6
FROM categories WHERE slug = 'accessories'
ON CONFLICT (slug) DO NOTHING;

-- Electronics sub-categories
INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'LED Lights', 'electronics-led', 'LED strip lights and room lighting', id, 1
FROM categories WHERE slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Phone Cases', 'electronics-phone-cases', 'iPhone and phone cases', id, 2
FROM categories WHERE slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

-- Verify
SELECT c.name, c.slug, p.name as parent_name 
FROM categories c 
LEFT JOIN categories p ON c.parent_id = p.id
ORDER BY c.parent_id NULLS FIRST, c.sort_order;
