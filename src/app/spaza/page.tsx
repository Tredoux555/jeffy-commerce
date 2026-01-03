import Link from 'next/link';
import { Package, TrendingUp, Truck, Phone, CheckCircle, ArrowRight, Zap, Users, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'The Spaza Project | R5K Starter Kit - Start Your Business Today',
  description: 'Get 630 products for R5,000. Sell at 2x. Make R5,000 profit. Start your township business tomorrow.',
};

export default async function SpazaPage() {
  const supabase = await createClient();

  // Get product counts by category
  const { data: products } = await supabase
    .from('products')
    .select('source_data')
    .eq('source', '1688')
    .eq('status', 'active');

  const categories: Record<string, number> = {};
  products?.forEach(p => {
    const cat = p.source_data?.categorySuggestion || 'Other';
    categories[cat] = (categories[cat] || 0) + 1;
  });

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
          <a 
            href="https://wa.me/27XXXXXXXXX?text=I%20want%20a%20Spaza%20Kit"
            className="bg-green-500 text-black font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            WhatsApp Us
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-black to-black" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm mb-6 border border-green-500/30">
              <Zap className="h-4 w-4" />
              Township Business Starter Kit
            </div>
            
            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="text-green-500">R5,000</span>
              <br />
              <span className="text-white">Start Selling Tomorrow</span>
            </h1>
            
            {/* Sub */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              630 products. Beauty, hair, accessories. 
              <span className="text-green-400 font-semibold"> Sell at 2x. Double your money.</span>
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a 
                href="https://wa.me/27XXXXXXXXX?text=I%20want%20a%20Spaza%20Kit"
                className="bg-green-500 hover:bg-green-400 text-black text-lg font-bold h-14 px-8 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Phone className="h-5 w-5" />
                Get Your Kit Now
              </a>
              <a 
                href="#how-it-works"
                className="border-2 border-gray-600 hover:border-gray-400 text-white text-lg h-14 px-8 rounded-xl flex items-center justify-center gap-2 transition"
              >
                How It Works
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No experience needed
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Products delivered to you
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Keep 100% of profit
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Math - Simple */}
      <section className="py-16 bg-green-500/5 border-y border-green-500/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
            The <span className="text-green-500">Math</span> Is Simple
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-black/50 border border-green-500/30 rounded-2xl p-8">
                <div className="text-5xl font-black text-green-500 mb-2">R5K</div>
                <div className="text-gray-400">You Pay</div>
              </div>
              <div className="bg-black/50 border border-green-500/30 rounded-2xl p-8">
                <div className="text-5xl font-black text-white mb-2">R10K</div>
                <div className="text-gray-400">You Sell For</div>
              </div>
              <div className="bg-green-500 rounded-2xl p-8">
                <div className="text-5xl font-black text-black mb-2">R5K</div>
                <div className="text-black/70 font-semibold">Your Profit</div>
              </div>
            </div>
            
            <p className="text-center text-xl text-gray-300 mt-8">
              That's <span className="text-green-400 font-bold">100% return</span> on your investment.
              <br />
              <span className="text-gray-500">Sell everything in a month? That's R60K/year profit.</span>
            </p>
          </div>
        </div>
      </section>

      {/* What's In The Kit */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4">
            What's In <span className="text-green-500">The Kit</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            630 products across categories that sell fast in townships
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {Object.entries(categories)
              .filter(([cat]) => !['Other', 'Uncategorized', 'Adult'].includes(cat))
              .sort((a, b) => b[1] - a[1])
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
          
          <div className="text-center mt-8">
            <p className="text-gray-500">
              Beauty products • Hair care • Skincare • Accessories • Electronics • More
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
            How It <span className="text-green-500">Works</span>
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: '1',
                  title: 'WhatsApp Us',
                  desc: 'Send us a message. We\'ll answer your questions and confirm your order.',
                  icon: Phone
                },
                {
                  step: '2',
                  title: 'Pay R5,000',
                  desc: 'EFT or cash. Once payment clears, we prepare your kit.',
                  icon: CheckCircle
                },
                {
                  step: '3',
                  title: 'Get Your Kit',
                  desc: 'We deliver to your door. 630 products, price list included.',
                  icon: Truck
                },
                {
                  step: '4',
                  title: 'Start Selling',
                  desc: 'Sell to neighbors, at the taxi rank, door-to-door. You keep all profit.',
                  icon: TrendingUp
                }
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-black text-xl">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
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
              {
                q: 'Do I need a shop?',
                a: 'No. Sell from home, at work, door-to-door, at the taxi rank. Anywhere people are.'
              },
              {
                q: 'Do I need experience?',
                a: 'No. We give you the products and price list. You just need to talk to people.'
              },
              {
                q: 'How fast can I sell?',
                a: 'Depends on you. Some people sell out in 2 weeks. Some take 2 months. Your hustle = your profit.'
              },
              {
                q: 'Can I reorder?',
                a: 'Yes! Once you sell out, order another kit. Or order specific products you need more of.'
              },
              {
                q: 'What if products don\'t sell?',
                a: 'Everything in the kit is tested - these are products township customers actually buy. But we\'ll help you with tips if you\'re stuck.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-green-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-black mb-4">
            Ready To Start?
          </h2>
          <p className="text-black/70 text-xl mb-8 max-w-xl mx-auto">
            R5,000 today. R10,000 back when you sell. Your business starts now.
          </p>
          <a 
            href="https://wa.me/27XXXXXXXXX?text=I%20want%20a%20Spaza%20Kit%20-%20let's%20do%20this!"
            className="inline-flex items-center gap-2 bg-black text-green-500 text-xl font-bold px-8 py-4 rounded-xl hover:bg-gray-900 transition"
          >
            <Phone className="h-6 w-6" />
            WhatsApp Us Now
          </a>
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
              Powered by <Link href="/" className="text-gray-400 hover:text-white">Jeffy</Link> • Building township businesses
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
