'use client';

import Link from 'next/link';
import { NewsletterSignup } from '@/components/newsletter-signup';

export function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <div className="space-y-2">
              <Link href="/products" className="block text-gray-400 hover:text-white text-sm">All Products</Link>
              <Link href="/categories" className="block text-gray-400 hover:text-white text-sm">Categories</Link>
              <Link href="/wants" className="block text-gray-400 hover:text-white text-sm">Free Stuff</Link>
              <Link href="/wishlist" className="block text-gray-400 hover:text-white text-sm">Wishlist</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Help</h4>
            <div className="space-y-2">
              <Link href="/faq" className="block text-gray-400 hover:text-white text-sm">FAQ</Link>
              <Link href="/contact" className="block text-gray-400 hover:text-white text-sm">Contact Us</Link>
              <Link href="/track" className="block text-gray-400 hover:text-white text-sm">Track Order</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-gray-400 hover:text-white text-sm">About Us</Link>
              <Link href="/partner/apply" className="block text-gray-400 hover:text-white text-sm">Become a Partner</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-gray-400 hover:text-white text-sm">Privacy Policy</Link>
              <Link href="/wants/terms" className="block text-gray-400 hover:text-white text-sm">Terms & Conditions</Link>
            </div>
          </div>
          <div>
                        <NewsletterSignup />
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2024 Jeffy Commerce (Pty) Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs">🇿🇦 Proudly South African</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
