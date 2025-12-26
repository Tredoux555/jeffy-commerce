import Link from 'next/link';
import { ArrowRight, Gift, Users, Truck, Shield, Star, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import FloatingWantsPromo from '@/components/floating-wants-promo';

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

  // Get wants stats
  const { count: totalWants } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true });

  const { count: successfulWants } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true })
    .gte('current_agrees', 10);

  return (
    <div>
      <FloatingWantsPromo />

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#ff6b35] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#ff6b35]/20 text-[#ff6b35] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                New: Get Products FREE!
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Eish, These<br/>
                <span className="text-[#ff6b35]">Prices!</span> 🔥
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-lg">
                Quality products sourced directly from manufacturers. 
                No middlemen, no markup — just lekker savings for South Africa.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-[#ff6b35] hover:bg-orange-600 text-white px-8 w-full sm:w-auto">
                    Start Shopping
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/wants/create">
                  <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/50 px-8 w-full sm:w-auto">
                    <Gift className="mr-2 h-5 w-5" />
                    Get Something FREE
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Right - FREE STUFF Card */}
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-[#ff6b35] to-orange-600 rounded-3xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform">
                <div className="bg-white/20 rounded-2xl p-6 backdrop-blur">
                  <Gift className="h-16 w-16 text-white mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Jeffy Wants</h3>
                  <p className="text-white/90 mb-4">
                    Create a want, share with 10 friends who agree, and get your product completely FREE!
                  </p>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span>✓ No purchase required</span>
                    <span>✓ 7 days to collect</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#ff6b35] py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            <div>
              <p className="text-3xl font-bold">{totalWants || 0}+</p>
              <p className="text-white/80 text-sm">Wants Created</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{successfulWants || 0}</p>
              <p className="text-white/80 text-sm">Free Products Given</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50%+</p>
              <p className="text-white/80 text-sm">Average Savings</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24hr</p>
              <p className="text-white/80 text-sm">Fast Dispatch</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - Wants */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Products FREE 🎁</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              It's simple: Create a want, share with friends, and if 10 people agree — you get it FREE!
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="font-bold text-lg mb-2">Create a Want</h3>
              <p className="text-gray-600 text-sm">Tell us what product you want (under R1,000 guaranteed)</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="font-bold text-lg mb-2">Share Your Link</h3>
              <p className="text-gray-600 text-sm">Send to friends on WhatsApp — they just need to agree</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="font-bold text-lg mb-2">Get It FREE!</h3>
              <p className="text-gray-600 text-sm">Once 10 friends agree, we source and deliver your product</p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link href="/wants/create">
              <Button size="lg" className="bg-[#ff6b35] hover:bg-orange-600 text-white">
                Create Your Want Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Link href="/categories" className="text-[#ff6b35] hover:underline flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`} className="group">
                <div className="bg-gray-100 rounded-xl p-6 text-center hover:bg-orange-50 hover:shadow-lg transition-all">
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

      {/* PRODUCTS */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Hot Right Now 🔥</h2>
          <Link href="/products" className="text-[#ff6b35] hover:underline flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      {/* TRUST BADGES */}
      <section className="bg-[#0f172a] py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-[#ff6b35]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Fast Delivery</h3>
              <p className="text-gray-400 text-sm">Quick delivery across Mzansi via Zone Partners</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-[#ff6b35]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Quality Guaranteed</h3>
              <p className="text-gray-400 text-sm">Every product checked before shipping</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[#ff6b35]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Zone Partners</h3>
              <p className="text-gray-400 text-sm">Local delivery partners in your area</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-[#ff6b35]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Best Prices</h3>
              <p className="text-gray-400 text-sm">Direct sourcing, no middlemen</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-gradient-to-r from-[#ff6b35] to-orange-500 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Save?</h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Join thousands of South Africans who are getting amazing products at unbeatable prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-white text-[#ff6b35] hover:bg-gray-100 px-8">
                Shop Now
              </Button>
            </Link>
            <Link href="/zone-partner/apply">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                Become a Zone Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
// Rebuild trigger: 1735216800
