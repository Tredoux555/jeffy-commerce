import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Package, ArrowLeft, TrendingUp, Phone, ChevronDown } from 'lucide-react';

export const metadata = {
  title: 'Spaza Kit Products | See What You Get',
  description: 'Preview all products in the R5K Spaza Starter Kit. See wholesale prices, retail prices, and your profit per item.',
};

// Pricing formula - sea freight
const CNY_TO_ZAR = 3.2;
const SEA_FREIGHT_PER_ITEM = 1;

function calculatePrices(costCNY: number) {
  if (!costCNY || costCNY <= 0) return null;
  
  const landed = (costCNY * CNY_TO_ZAR) + SEA_FREIGHT_PER_ITEM;
  const wholesale = Math.ceil(landed * 1.3); // What kit buyer pays
  const retail = Math.ceil((landed * 2.5) / 5) * 5; // What they sell for (rounded to R5)
  const profit = retail - wholesale;
  
  return { landed, wholesale, retail, profit };
}

interface Variant {
  name: string;
  image?: string;
  price_adjustment?: number;
}

export default async function KitCatalogPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('id, name, primary_image_url, source_data, images')
    .eq('source', '1688')
    .eq('status', 'active')
    .order('name');

  // Filter valid products and calculate prices
  const catalogProducts = (products || [])
    .filter(p => {
      const cny = p.source_data?.costPriceCNY;
      const name = p.name || '';
      return cny && cny > 0 && !name.includes('有限公司');
    })
    .map(p => {
      const cny = p.source_data?.costPriceCNY || 0;
      const prices = calculatePrices(cny);
      const variants: Variant[] = p.source_data?.variants || [];
      const validVariants = variants.filter(v => 
        v.name && 
        !v.name.includes('Specifications') && 
        v.name.length < 50
      );
      
      return {
        ...p,
        cny,
        prices,
        variants: validVariants,
        category: p.source_data?.categorySuggestion || 'Other'
      };
    })
    .filter(p => p.prices);

  // Group by category
  const categories: Record<string, typeof catalogProducts> = {};
  catalogProducts.forEach(p => {
    if (!categories[p.category]) categories[p.category] = [];
    categories[p.category].push(p);
  });

  // Calculate totals
  const totalProducts = catalogProducts.length;
  const totalWholesale = catalogProducts.reduce((sum, p) => sum + (p.prices?.wholesale || 0), 0);
  const totalRetail = catalogProducts.reduce((sum, p) => sum + (p.prices?.retail || 0), 0);
  const totalProfit = totalRetail - totalWholesale;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-green-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/hustle" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-green-500">SPAZA KIT</span>
          </div>
          <a 
            href="https://wa.me/27738439496?text=I%20want%20a%20Spaza%20Kit"
            className="bg-green-500 text-black font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Order Now
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 border-b border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            What's In <span className="text-green-500">The Kit</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {totalProducts} products ready to sell. See exactly what you're buying, 
            what you pay, and what you make.
          </p>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-8 bg-green-500/5 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-white">{totalProducts}</div>
              <div className="text-sm text-gray-400">Products</div>
            </div>
            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-green-500">R{totalWholesale.toLocaleString()}</div>
              <div className="text-sm text-gray-400">You Pay</div>
            </div>
            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-white">R{totalRetail.toLocaleString()}</div>
              <div className="text-sm text-gray-400">You Sell For</div>
            </div>
            <div className="bg-green-500 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-black">R{totalProfit.toLocaleString()}</div>
              <div className="text-sm text-black/70">Your Profit</div>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            * Prices shown are per single item. Kit includes multiple units of top sellers.
          </p>
        </div>
      </section>

      {/* Price Legend */}
      <section className="py-4 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              <span className="text-gray-400">You Pay (Wholesale)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-white rounded"></span>
              <span className="text-gray-400">Sell Price (Retail)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded"></span>
              <span className="text-gray-400">Your Profit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products by Category */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {Object.entries(categories)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([category, items]) => (
              <div key={category} className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {category}
                    <span className="text-gray-500 text-lg ml-2">({items.length})</span>
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map(product => (
                    <div 
                      key={product.id} 
                      className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-green-500/50 transition"
                    >
                      {/* Image */}
                      <div className="aspect-square bg-gray-800 relative">
                        {product.primary_image_url ? (
                          <img 
                            src={product.primary_image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <Package className="h-12 w-12" />
                          </div>
                        )}
                        {/* Profit badge */}
                        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                          +R{product.prices?.profit}
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-medium text-white text-sm mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {/* Prices */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-xs text-gray-500">You Pay</div>
                            <div className="text-green-500 font-bold">R{product.prices?.wholesale}</div>
                          </div>
                          <div className="text-gray-600">→</div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Sell For</div>
                            <div className="text-white font-bold">R{product.prices?.retail}</div>
                          </div>
                        </div>
                        
                        {/* Variants */}
                        {product.variants.length > 0 && (
                          <div className="border-t border-gray-800 pt-3">
                            <div className="text-xs text-gray-500 mb-2">
                              {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {product.variants.slice(0, 3).map((v, i) => (
                                <span 
                                  key={i}
                                  className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded"
                                >
                                  {v.name.length > 15 ? v.name.substring(0, 15) + '...' : v.name}
                                </span>
                              ))}
                              {product.variants.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{product.variants.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-black mb-4">
            Ready To Start Selling?
          </h2>
          <p className="text-black/70 text-lg mb-8 max-w-xl mx-auto">
            Get all {totalProducts} products delivered to your door. 
            Start making money this week.
          </p>
          <a 
            href="https://wa.me/27738439496?text=I%20want%20a%20Spaza%20Kit%20with%20all%20the%20products%20I%20saw!"
            className="inline-flex items-center gap-2 bg-black text-green-500 text-xl font-bold px-8 py-4 rounded-xl hover:bg-gray-900 transition"
          >
            <Phone className="h-6 w-6" />
            WhatsApp To Order
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            <Link href="/hustle" className="text-gray-400 hover:text-white">← Back to The Spaza Project</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
