import Link from 'next/link';
import { Home, Search, Gift, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="text-[150px] font-bold text-[#ff6b35] leading-none mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Eish! Page Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Looks like this page took a wrong turn somewhere. Don't worry, we'll help you find your way back!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <button className="inline-flex items-center gap-2 bg-[#ff6b35] text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition">
              <Home className="h-5 w-5" />
              Go Home
            </button>
          </Link>
          <Link href="/products">
            <button className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition">
              <Search className="h-5 w-5" />
              Browse Products
            </button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t max-w-sm mx-auto">
          <p className="text-gray-500 text-sm mb-4">Or try getting something for FREE!</p>
          <Link href="/wants/create">
            <button className="inline-flex items-center gap-2 text-[#ff6b35] font-semibold hover:underline">
              <Gift className="h-4 w-4" />
              Create a Want
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
