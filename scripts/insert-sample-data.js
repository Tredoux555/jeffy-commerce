#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertSampleData() {
  try {
    console.log('🚀 Inserting sample data...');

    // Insert categories
    console.log('📁 Inserting categories...');
    const categories = [
      { name: 'Electronics', slug: 'electronics', description: 'Gadgets and tech', is_active: true },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and garden supplies', is_active: true },
      { name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories', is_active: true },
      { name: 'Sports', slug: 'sports', description: 'Sports equipment and apparel', is_active: true },
    ];

    for (const category of categories) {
      const { data, error } = await supabase
        .from('categories')
        .upsert(category, { onConflict: 'slug' });

      if (error) {
        console.error(`❌ Error inserting category ${category.name}:`, error);
      } else {
        console.log(`✅ Inserted category: ${category.name}`);
      }
    }

    // Get category IDs
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id, slug');

    const categoryMap = {};
    categoryData.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // Insert sample products
    console.log('📦 Inserting sample products...');
    const products = [
      {
        name: 'Wireless Earbuds Pro',
        slug: 'wireless-earbuds-pro',
        description: 'High quality wireless earbuds with noise cancellation. 24hr battery life.',
        category_id: categoryMap.electronics,
        cost_price_cents: 15000,
        selling_price_cents: 29900,
        compare_at_price_cents: 39900,
        quantity: 50,
        status: 'active'
      },
      {
        name: 'Smart Watch Series X',
        slug: 'smart-watch-series-x',
        description: 'Advanced smartwatch with health monitoring and GPS tracking.',
        category_id: categoryMap.electronics,
        cost_price_cents: 25000,
        selling_price_cents: 49900,
        compare_at_price_cents: 59900,
        quantity: 30,
        status: 'active'
      },
      {
        name: 'Bluetooth Speaker Mini',
        slug: 'bluetooth-speaker-mini',
        description: 'Compact wireless speaker with 360° sound and waterproof design.',
        category_id: categoryMap.electronics,
        cost_price_cents: 8000,
        selling_price_cents: 15900,
        compare_at_price_cents: null,
        quantity: 75,
        status: 'active'
      },
      {
        name: 'Garden Hose Set',
        slug: 'garden-hose-set',
        description: 'Heavy-duty garden hose with adjustable spray nozzle and 50ft length.',
        category_id: categoryMap['home-garden'],
        cost_price_cents: 12000,
        selling_price_cents: 24900,
        compare_at_price_cents: 29900,
        quantity: 40,
        status: 'active'
      }
    ];

    for (const product of products) {
      const { data, error } = await supabase
        .from('products')
        .upsert(product, { onConflict: 'slug' });

      if (error) {
        console.error(`❌ Error inserting product ${product.name}:`, error);
      } else {
        console.log(`✅ Inserted product: ${product.name}`);
      }
    }

    console.log('🎉 Sample data insertion complete!');
    console.log('📱 Visit /products to see your products');

  } catch (error) {
    console.error('💥 Error inserting sample data:', error);
    process.exit(1);
  }
}

insertSampleData();

