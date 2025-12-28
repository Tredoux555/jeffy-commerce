import Link from 'next/link';
import { Gift, Users, Share2, ArrowRight } from 'lucide-react';

export default function WantsPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="max-w-md w-full">
          {/* Logo/Icon */}
          <div className="w-20 h-20 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-8">
            <Gift className="h-10 w-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4">Get stuff FREE</h1>
          <p className="text-gray-400 text-lg mb-12">
            Tell us what you want. Get 10 friends to agree. We source it and ship it to you FREE.
          </p>

          {/* CREATE MY OWN WANT - Orange Box */}
          <Link href="/wants/create" className="block">
            <div className="w-full bg-[#ff6b35] text-black py-5 rounded-xl font-bold text-xl hover:bg-orange-500 transition">
              Create my own Want
            </div>
            <p className="text-[#ff6b35] font-semibold text-lg mt-3">and get it free</p>
          </Link>

          {/* How it works */}
          <div className="mt-16 space-y-6 text-left">
            <h3 className="text-center text-gray-500 text-sm uppercase tracking-wide mb-8">How it works</h3>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#ff6b35] font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold">Tell us what you want</p>
                <p className="text-gray-500 text-sm">Upload a pic or paste a link</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#ff6b35] font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold">Share on WhatsApp</p>
                <p className="text-gray-500 text-sm">Get 10 friends to agree they want it too</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#ff6b35] font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold">We source & ship FREE</p>
                <p className="text-gray-500 text-sm">Products under R1,000 guaranteed</p>
              </div>
            </div>
          </div>

          {/* CTA Again */}
          <Link href="/wants/create" className="block mt-12">
            <div className="w-full border-2 border-[#ff6b35] text-[#ff6b35] py-4 rounded-xl font-bold text-lg hover:bg-[#ff6b35] hover:text-black transition flex items-center justify-center gap-2">
              Start Now <ArrowRight className="h-5 w-5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-600 text-sm">
        <Link href="/wants/terms" className="hover:text-gray-400">Terms & Conditions</Link>
        <span className="mx-2">•</span>
        <Link href="/" className="hover:text-gray-400">Back to Jeffy</Link>
      </div>
    </div>
  );
}

