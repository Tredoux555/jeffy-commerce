'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/product-card';
import { Loader2 } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sort, setSort] = useState<string>('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, sort]);

  const fetchProducts = async () => {
    const supabase = createClient();
    
    let query = supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('status', 'active');

    if (selectedCategory) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', selectedCategory)
        .single();

      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    switch (sort) {
      case 'price_asc':
        query = query.order('selling_price_cents', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('selling_price_cents', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('total_sold', { ascending: false });
    }

    const { data, error } = await query.limit(24);
    
    console.log('Products query result:', { data, error });
    
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (data) {
      setCategories(data);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border p-6 sticky top-20">
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`block py-1 text-left w-full ${!selectedCategory ? 'text-orange-500 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  All Products
                </button>
              </li>
              {categories?.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`block py-1 text-left w-full ${selectedCategory === category.slug ? 'text-orange-500 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>

            <hr className="my-6" />

            <h3 className="font-semibold mb-4">Sort By</h3>
            <ul className="space-y-2">
              {[
                { value: '', label: 'Popular' },
                { value: 'newest', label: 'Newest' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
              ].map((option) => (
                <li key={option.value}>
                  <button
                    onClick={() => setSort(option.value)}
                    className={`block py-1 text-left w-full ${sort === option.value ? 'text-orange-500 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">All Products</h1>
            <p className="text-gray-500">{products?.length || 0} products</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
