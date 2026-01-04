import Link from 'next/link';
import { Package, TrendingUp, MapPin, Phone, CheckCircle, ArrowRight, Zap, Eye, Store, Users, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { FollowForm } from '@/components/follow-form';

export const metadata = {
  title: 'The Spaza Project | Find Local Suppliers Near You',
  description: 'Connect with local hustlers selling quality products in your area. Find suppliers, WhatsApp them, buy local.',
};

// Pricing formula for reference
const CNY_TO_ZAR = 3.2;
const SEA_FREIGHT_PER_ITEM = 1;

function calculatePrices(costCNY: number) {
  if (!costCNY || costCNY <= 0) return null;
  const landed = (costCNY * CNY_TO_ZAR) + SEA_FREIGHT_PER_ITEM;
  const wholesale = Math.ceil(landed * 1.3);
  const retail = Math.ceil((landed * 2.5) / 5) * 5;
  return { wholesale, retail, profit: retail - wholesale };
}

export default async function SpazaPage() {
  const supabase = await createClient();

  // Get product stats
  const { data: products } = await supabase
    .from('products')
    .select('name, source_data')
    .eq('source', '1688')
    .eq('status', 'active');

  // Calculate real stats
  let totalProducts = 0;
  const categories: Record<string, number> = {};

  products?.forEach(p => {
    const name = p.name || '';
    const sd = p.source_data || {};
    const cny = sd.costPriceCNY;
    
    if (name.includes('有限公司') || !cny || cny <= 0) return;
    
    const prices = calculatePrices(cny);
    if (!prices) return;
    
    totalProducts++;
    
    const cat = sd.categorySuggestion || 'Other';
    if (!['Other', 'Uncategorized'].includes(cat)) {
      categories[cat] = (categories[cat] || 0) + 1;
    }
  });

  // Get supplier count (will be 0 initially)
  const { count: supplierCount } = await supabase
    .from('suppliers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-green-500/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-black" />
            </div>
            <div>
              <span className="text-xl font-black text-green-500">SPAZA</span>
              <span className="text-xl font-light text-white ml-1">PROJECT</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/hustle/register"
              className="hidden sm:flex items-center gap-2 border border-green-500 text-green-500 font-bold px-4 py-2 rounded-lg hover:bg-green-500 hover:text-black transition"
            >
              <Store className="h-4 w-4" />
              Become a Supplier
            </Link>
            <a 
              href="https://wa.me/27738439496?text=Hi!%20I%20want%20to%20know%20more%20about%20the%20Spaza%20Project"
              className="bg-green-500 text-black font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp Us</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero - Supplier Directory Focus */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-black to-black" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm mb-6 border border-green-500/30">
              <MapPin className="h-4 w-4" />
              Township Supplier Directory
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="text-white">Find</span>
              <span className="text-green-500"> Local</span>
              <br />
              <span className="text-white">Suppliers</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {totalProducts} products. {supplierCount || 'New'} suppliers.
              <span className="text-green-400 font-semibold"> Buy from hustlers in your area.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                href="/hustle/kit"
                className="bg-green-500 hover:bg-green-400 text-black text-lg font-bold h-14 px-8 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Eye className="h-5 w-5" />
                Browse Products
              </Link>
              <Link 
                href="/hustle/register"
                className="border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black text-lg font-bold h-14 px-8 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Store className="h-5 w-5" />
                Register as Supplier
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                WhatsApp direct
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Buy local
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Support hustlers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Two Paths */}
      <section className="py-16 bg-green-500/5 border-y border-green-500/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
            How It <span className="text-green-500">Works</span>
          </h2>
          
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {/* For Customers */}
            <div className="bg-black/50 border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">For Customers</h3>
                  <p className="text-gray-400 text-sm">Find & buy locally</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { step: '1', text: 'Browse products on Jeffy' },
                  { step: '2', text: 'Click "Find Local Supplier"' },
                  { step: '3', text: 'See suppliers near you' },
                  { step: '4', text: 'WhatsApp them directly' },
                  { step: '5', text: 'Buy & collect locally' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-green-400 font-bold text-sm">{item.step}</span>
                    </div>
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
              
              <Link
                href="/hustle/kit"
                className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Eye className="h-5 w-5" />
                Start Browsing
              </Link>
            </div>

            {/* For Suppliers */}
            <div className="bg-black/50 border border-green-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Store className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">For Suppliers</h3>
                  <p className="text-gray-400 text-sm">Get free customers</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { step: '1', text: 'You already have stock to sell' },
                  { step: '2', text: 'Register on Jeffy (free)' },
                  { step: '3', text: 'Set your location & categories' },
                  { step: '4', text: 'Customers find you' },
                  { step: '5', text: 'Handle sales yourself' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-green-400 font-bold text-sm">{item.step}</span>
                    </div>
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
              
              <Link
                href="/hustle/register"
                className="mt-6 w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Store className="h-5 w-5" />
                Register Now - It's Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4">
            What's <span className="text-green-500">Available</span>
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            {totalProducts} products across categories that sell fast in townships
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            {Object.entries(categories)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([category, count]) => (
                <div 
                  key={category} 
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-green-500/50 transition"
                >
                  <div className="text-2xl font-bold text-green-500">{count}</div>
                  <div className="text-sm text-gray-300">{category}</div>
                </div>
              ))}
          </div>
          
          <div className="text-center">
            <Link 
              href="/hustle/kit"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition"
            >
              <Eye className="h-5 w-5" />
              View All {totalProducts} Products
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits for Suppliers */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4">
            Why <span className="text-green-500">Suppliers</span> Join
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            Already selling products? Get more customers for free.
          </p>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: Zap, 
                title: 'Free Listing', 
                desc: 'No fees. No commission. We just connect customers to you.' 
              },
              { 
                icon: MessageCircle, 
                title: 'Direct Contact', 
                desc: 'Customers WhatsApp you directly. You handle the sale.' 
              },
              { 
                icon: MapPin, 
                title: 'Local Reach', 
                desc: 'People in your area find you. No shipping needed.' 
              },
            ].map((item) => (
              <div 
                key={item.title}
                className="bg-black border border-gray-800 rounded-xl p-6 text-center hover:border-green-500/50 transition"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              href="/hustle/register"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-xl transition"
            >
              <Store className="h-5 w-5" />
              Become a Supplier
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
            Questions? <span className="text-green-500">Answers.</span>
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-6">
            {[
              { q: 'Is it really free for suppliers?', a: 'Yes. We don\'t charge suppliers anything. We want to grow the network first. In future we may offer premium features, but basic listing will always be free.' },
              { q: 'How do customers pay me?', a: 'That\'s between you and the customer. Cash, EFT, whatever works for you. We just connect you.' },
              { q: 'Do I need to have a shop?', a: 'No. Sell from home, your car, anywhere. Customers just need to know your area so they can collect.' },
              { q: 'How do I get products to sell?', a: 'That\'s up to you. Import from China, buy wholesale locally, or get a starter kit from us. We\'re the directory, not the supplier.' },
              { q: 'Can I see what products are popular?', a: 'Yes! Browse our product catalog to see what sells well in townships. These are the products your customers want.' }
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stay Connected */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <FollowForm 
              source="hustle"
              interests={['spaza']}
              title="Stay Updated"
              subtitle="Get notified when new suppliers join your area."
              buttonText="Keep Me Posted"
              variant="dark"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-green-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-black mb-4">
            Ready To Join?
          </h2>
          <p className="text-black/70 text-xl mb-8 max-w-xl mx-auto">
            List your business for free. Get customers from Jeffy. Grow your hustle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/hustle/register"
              className="inline-flex items-center gap-2 bg-black text-green-500 text-xl font-bold px-8 py-4 rounded-xl hover:bg-gray-900 transition"
            >
              <Store className="h-6 w-6" />
              Register as Supplier
            </Link>
            <Link 
              href="/hustle/kit"
              className="inline-flex items-center gap-2 bg-black/20 text-black text-xl font-bold px-8 py-4 rounded-xl hover:bg-black/30 transition"
            >
              <Eye className="h-6 w-6" />
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <Package className="h-4 w-4 text-black" />
              </div>
              <span className="font-bold text-green-500">SPAZA PROJECT</span>
            </div>
            <p className="text-gray-500 text-sm">
              Powered by <Link href="/" className="text-gray-400 hover:text-white">Jeffy</Link> • Connecting township communities
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
