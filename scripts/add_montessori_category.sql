-- JEFFY MONTESSORI CATEGORY SETUP
-- Run this in Supabase SQL Editor
-- Date: January 9, 2026

-- Insert Montessori parent category
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
  ('Montessori', 'montessori', 'Montessori vocabulary baskets and educational materials', NULL, 8)
ON CONFLICT (slug) DO NOTHING;

-- Montessori sub-categories (6 vocabulary baskets)
INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Animals Basket', 'montessori-animals', 'Safari Ltd TOOBS - realistic plastic animal figurines for vocabulary work', id, 1
FROM categories WHERE slug = 'montessori'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Kitchen Basket', 'montessori-kitchen', 'Mini pots, cups, utensils - real miniature items from Daiso/Miniso', id, 2
FROM categories WHERE slug = 'montessori'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Classroom Basket', 'montessori-classroom', 'Pens, pencils, rulers - real classroom objects for vocabulary', id, 3
FROM categories WHERE slug = 'montessori'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Clothing Basket', 'montessori-clothing', 'Doll clothes and baby socks - for adjective and clothing vocabulary', id, 4
FROM categories WHERE slug = 'montessori'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Home Items Basket', 'montessori-home', 'Dollhouse furniture sets - bed, lamp, chair, table vocabulary', id, 5
FROM categories WHERE slug = 'montessori'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id, sort_order)
SELECT 'Food Basket', 'montessori-food', 'Wooden play food - Melissa & Doug style fruit and vegetable vocabulary', id, 6
FROM categories WHERE slug = 'montessori'
ON CONFLICT (slug) DO NOTHING;

-- Verify
SELECT c.name, c.slug, p.name as parent_name, c.sort_order
FROM categories c 
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.slug LIKE 'montessori%'
ORDER BY c.parent_id NULLS FIRST, c.sort_order;
