import Link from 'next/link';
import { ArrowRight, Gift, Users, Truck, Shield, Star, Sparkles, CheckCircle, Zap, MapPin, TrendingUp } from 'lucide-react';
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

  const { count: totalWants } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true });

  const { count: successfulWants } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true })
    .gte('current_agrees', 10);

  return (
    <div className="bg-gray-950">
      <FloatingWantsPromo />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-gray-950 to-gray-950" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
        
        {/* Nav */}
        <nav className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
          <span className="text-3xl font-black text-orange-500">JEFFY</span>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/wants" className="text-gray-300 hover:text-white transition">Wants</Link>
            <Link href="/products" className="text-gray-300 hover:text-white transition">Shop</Link>
            <Link href="/partner/apply">
              <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                Become a Zone Partner
              </Button>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 pt-12 pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm mb-8">
              <Sparkles className="h-4 w-4" />
              South Africa's First Community-Powered Commerce Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white">
              <span className="text-orange-500">"Eish,</span> These Prices!"
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto">
              You tell us what you want. We make it happen.
            </p>
            <p className="text-lg text-orange-400 mb-8">
              No middlemen. No markup madness.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/wants/create">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg h-14 px-8 w-full sm:w-auto">
                  🎁 Get Something FREE
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" className="bg-transparent border-2 border-gray-500 text-white hover:bg-gray-800 text-lg h-14 px-8 w-full sm:w-auto">
                  Browse Products →
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">{totalWants || 0}+</p>
                <p className="text-sm text-gray-400">Wants Created</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{successfulWants || 0}</p>
                <p className="text-sm text-gray-400">Products Added</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">50%</p>
                <p className="text-sm text-gray-400">Partner Profit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              You know what's broken about online shopping in SA?
            </h2>
            <p className="text-xl text-orange-500 font-bold mb-8">Everything.</p>
            <p className="text-lg text-gray-300 leading-relaxed">
              The prices are inflated because someone's paying for a warehouse in Midrand, 
              a fleet of branded trucks, call centres, and executives in glass offices. 
              <span className="text-orange-400"> You're paying for all of that.</span> 
              And then you wait a week for delivery anyway.
            </p>
          </div>
        </div>
      </section>

      {/* WE FLIPPED IT */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            We Flipped It.
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-xl mx-auto">
            The Jeffy model eliminates the overhead that inflates every price you see online.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-bold text-white mb-2">No Warehouse</h3>
              <p className="text-gray-400 text-sm">Zone Partners keep stock at home</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <Truck className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-bold text-white mb-2">No Fleet</h3>
              <p className="text-gray-400 text-sm">Partners use their own vehicles, one run per day</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-bold text-white mb-2">No Employees</h3>
              <p className="text-gray-400 text-sm">Zone Partners are independent entrepreneurs</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-bold text-white mb-2">No Guessing</h3>
              <p className="text-gray-400 text-sm">Our community tells us exactly what they want</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW WANTS WORK */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                How <span className="text-orange-500">"Wants"</span> Work
              </h2>
              <p className="text-gray-400">Get what you want for FREE. Seriously.</p>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
              {[
                { num: '1', text: 'Tell us what you want' },
                { num: '2', text: 'Get 10 people to agree' },
                { num: '3', text: 'We add it to Jeffy' },
                { num: '4', text: 'You get yours FREE' },
                { num: '5', text: '+ 10 more to sell!' },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-white">
                    {step.num}
                  </div>
                  <p className="text-white font-medium text-sm">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-lg text-gray-300 mb-6">
                You're not just a customer. <span className="text-orange-400">You're building the catalogue with us.</span>
              </p>
              <Link href="/wants/create">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Create Your First Want
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUALITY GUARANTEE */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-3xl p-8 md:p-12 border border-orange-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-8 w-8 text-orange-500" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">The Jeffy Quality Guarantee</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                {[
                  'Every product personally tested by our founder in China',
                  'We find 3 variants, test them all, choose the best',
                  'Direct from factory — no middlemen',
                  'Only then does it go on Jeffy'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300">{item}</p>
                  </div>
                ))}
              </div>

              <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/30">
                <h3 className="font-bold text-green-400 mb-2">100% No-Reason Returns</h3>
                <p className="text-gray-300">
                  Don't like it? Return it. No questions asked. Full refund. 
                  <span className="text-green-400"> This is our promise to every customer.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ZONE PARTNER CTA */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Become a <span className="text-orange-500">Zone Partner</span>
                </h2>
                <p className="text-gray-300 mb-6">
                  Keep 50% of every sale. Own your zone. Build passive income.
                </p>
                
                <div className="space-y-3 mb-8">
                  {[
                    'No boss. No schedule. No ceiling.',
                    'System handles orders, labels, routes',
                    'One delivery run per day',
                    'Early adopters lock in their zones'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-orange-500" />
                      <p className="text-white">{item}</p>
                    </div>
                  ))}
                </div>

                <Link href="/partner/apply">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                    Apply Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4 text-center">Why 50% Beats the Gig Economy</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-400">Uber/Bolt</span>
                    <span className="text-red-400 font-bold">23-25%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-400">Mr D/UberEats</span>
                    <span className="text-red-400 font-bold">~25%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-orange-500/20 rounded-lg px-3">
                    <span className="text-orange-400 font-medium">Jeffy Zone Partner</span>
                    <span className="text-orange-500 font-bold text-xl">50%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      {products && products.length > 0 && (
        <section className="py-20 bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Latest Products</h2>
              <Link href="/products" className="text-orange-500 hover:text-orange-400 flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          {/* The deeper story teaser */}
          <div className="text-center mb-10 pb-10 border-b border-gray-800">
            <p className="text-gray-500 mb-2">There's more to Jeffy than meets the eye.</p>
            <Link href="/story" className="text-orange-500 hover:text-orange-400 font-medium">
              Discover the real mission →
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-2xl font-black text-orange-500">JEFFY</span>
              <p className="text-gray-400 text-sm mt-1">"Eish, These Prices!"</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <Link href="/products" className="hover:text-white">Shop</Link>
              <Link href="/wants" className="hover:text-white">Wants</Link>
              <Link href="/partner/apply" className="hover:text-white">Zone Partners</Link>
              <Link href="/story" className="hover:text-white">Our Story</Link>
              <Link href="/vision" className="hover:text-white">The Vision</Link>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 Jeffy Commerce. South Africa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
