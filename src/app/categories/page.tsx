import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function CategoriesPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: prodCats }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .is('parent_id', null)
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('category_id')
      .eq('status', 'active'),
  ]);

  // Only surface categories that actually contain at least one live product
  const nonEmpty = new Set((prodCats || []).map((p: any) => p.category_id).filter(Boolean));
  const visibleCategories = (categories || []).filter((c: any) => nonEmpty.has(c.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shop by Category</h1>

      {visibleCategories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group"
            >
              <div className="bg-white rounded-xl border p-8 text-center hover:shadow-lg hover:border-primary-200 transition-all">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                  <span className="text-4xl">📦</span>
                </div>
                <h2 className="font-semibold text-lg text-gray-900">{category.name}</h2>
                {category.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{category.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No categories available yet.</p>
        </div>
      )}
    </div>
  );
}
