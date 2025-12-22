import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product-card';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('status', 'active');

  // Filter by category
  if (params.category) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single();

    if (category) {
      query = query.eq('category_id', category.id);
    }
  }

  // Search
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }

  // Sort
  switch (params.sort) {
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

  const { data: products } = await query.limit(24);

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border p-6 sticky top-20">
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/products"
                  className={`block py-1 ${!params.category ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  All Products
                </a>
              </li>
              {categories?.map((category) => (
                <li key={category.id}>
                  <a
                    href={`/products?category=${category.slug}`}
                    className={`block py-1 ${params.category === category.slug ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {category.name}
                  </a>
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
                  <a
                    href={`/products?${params.category ? `category=${params.category}&` : ''}sort=${option.value}`}
                    className={`block py-1 ${(params.sort || '') === option.value ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {option.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {params.category ? `${params.category.charAt(0).toUpperCase() + params.category.slice(1)}` : 'All Products'}
            </h1>
            <p className="text-gray-500">{products?.length || 0} products</p>
          </div>

          {products && products.length > 0 ? (
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
