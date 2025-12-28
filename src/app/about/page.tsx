import Link from 'next/link';
import { Gift, Users, Truck, Star } from 'lucide-react';

export const metadata = {
  title: 'About Us | Jeffy Commerce',
  description: 'Learn about Jeffy Commerce - South Africa\'s most exciting shopping experience',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#ff6b35] to-orange-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">About Jeffy</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            We're revolutionizing how South Africans shop by bringing the best products 
            from around the world at unbeatable prices.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Mission */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Eish, These Prices! 🔥</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Jeffy Commerce was founded with a simple mission: to give South Africans access to 
            high-quality products at prices that make you say "Eish!" We source directly from 
            manufacturers, cutting out the middlemen so you save more.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white/5 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Free Products</h3>
            <p className="text-gray-400 text-sm">
              Create a want, get 10 friends to agree, and receive your product FREE!
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Zone Partners</h3>
            <p className="text-gray-400 text-sm">
              Local entrepreneurs delivering to your neighborhood with care.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Direct Sourcing</h3>
            <p className="text-gray-400 text-sm">
              We source directly from verified manufacturers worldwide.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Quality Guaranteed</h3>
            <p className="text-gray-400 text-sm">
              Every product is checked for quality before it reaches you.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Ready to Save?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <button className="bg-[#ff6b35] text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition">
                Shop Now
              </button>
            </Link>
            <Link href="/wants/create">
              <button className="bg-white/10 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/20 transition border border-white/20">
                Get Something FREE
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
