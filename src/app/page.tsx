import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8);

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(6);

  return (
    <div>
      <section className="bg-gradient-to-r from-jeffy-orange to-jeffy-yellow text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Eish, These Prices! 🔥
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Quality products from China, lekker prices for South Africa. No middlemen, just savings.
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-jeffy-dark text-white hover:bg-jeffy-dark/90">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Link href="/categories" className="text-jeffy-orange hover:text-jeffy-accent flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group"
              >
                <div className="bg-gray-100 rounded-xl p-6 text-center hover:bg-orange-50 transition-colors">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                    <span className="text-2xl">📦</span>
                  </div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Hot Right Now 🔥</h2>
          <Link href="/products" className="text-jeffy-orange hover:text-jeffy-accent flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-4">No products available yet.</p>
            <p className="text-sm text-gray-400">Check back soon for amazing deals!</p>
          </div>
        )}
      </section>

      <section className="bg-jeffy-dark py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-jeffy-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Fast Delivery</h3>
              <p className="text-gray-400">Quick delivery across Mzansi</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-jeffy-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Lekker Prices</h3>
              <p className="text-gray-400">Direct from China, no middlemen</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-jeffy-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Quality Checked</h3>
              <p className="text-gray-400">Every product vetted before shipping</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}