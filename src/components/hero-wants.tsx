'use client';

import { useEffect, useState } from 'react';
import { getWants } from '@/lib/wants-service';
import Link from 'next/link';

interface Want {
  id: string;
  title: string;
  share_code: string;
  threshold: number;
  current_agrees: number;
}

export default function HeroWants() {
  const [wants, setWants] = useState<Want[]>([]);

  useEffect(() => {
    const loadWants = async () => {
      const res = await getWants(6);
      if (res.success && res.wants) setWants(res.wants);
    };
    loadWants();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-[#ff6b35] to-yellow-500 overflow-hidden">
      {/* Floating Wants Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {wants.map((want, idx) => (
          <div
            key={want.id}
            className="absolute bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 animate-pulse"
            style={{
              left: `${(idx % 3) * 33}%`,
              top: `${(idx % 2) * 40}%`,
              animation: `float ${3 + idx}s ease-in-out infinite`,
            }}
          >
            <p className="text-white font-bold text-sm truncate">{want.title}</p>
            <p className="text-white/80 text-xs">
              {want.current_agrees}/{want.threshold}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-7xl font-bold text-white mb-4">Eish, These Prices! 🔥</h1>
          <p className="text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Quality products from China, lekker prices for South Africa. No middlemen, just savings.
          </p>

          <div className="space-y-4 mb-12">
            <Link href="/wants">
              <button className="bg-white text-[#ff6b35] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition inline-block">
                👀 See What People Want
              </button>
            </Link>

            <p className="text-white text-sm">
              Not what you want?{' '}
              <Link href="/wants/create" className="underline font-bold hover:text-gray-100">
                Create a Want
              </Link>
            </p>
          </div>

          {/* Featured Wants */}
          {wants.length > 0 && (
            <div className="mt-16">
              <p className="text-white/80 mb-4">People Want:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {wants.slice(0, 3).map(want => (
                  <Link key={want.id} href={`/wants/${want.share_code}`}>
                    <div className="bg-white/20 backdrop-blur-sm border border-white/40 rounded-full px-6 py-3 text-white font-semibold hover:bg-white/30 transition cursor-pointer">
                      {want.title} <span className="text-xs">({want.current_agrees}/{want.threshold})</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}


