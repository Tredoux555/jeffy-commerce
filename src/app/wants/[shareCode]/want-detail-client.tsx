'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, HelpCircle, X } from 'lucide-react';
import { addWantAgreement } from '@/lib/wants-service';

interface Want {
  id: string;
  title: string;
  description: string | null;
  reference_url: string | null;
  reference_image_url: string | null;
  share_code: string;
  threshold: number;
  current_agrees: number;
  status: string;
  creator_name: string | null;
}

export function WantDetailClient({ want }: { want: Want }) {
  const [step, setStep] = useState<'view' | 'phone' | 'success'>('view');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const creatorName = want.creator_name || 'Someone';

  const handleAgreeClick = () => {
    setStep('phone');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await addWantAgreement(want.id, 'Friend', phone.trim());
      if (res.success) {
        setStep('success');
      } else {
        setError(res.error || 'Failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ============ HOW IT WORKS MODAL ============
  const HelpModal = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setShowHelp(false)}>
      <div className="bg-[#1e293b] rounded-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">How does it work?</h3>
          <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4 text-sm">
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-[#ff6b35] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
            <p className="text-gray-300">Your friend wants a product and needs 10 people to agree.</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-[#ff6b35] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
            <p className="text-gray-300">When you tap <span className="text-blue-400 font-semibold">Agree</span>, you help them get closer to their goal.</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-[#ff6b35] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
            <p className="text-gray-300">Once 10 people agree, Jeffy sources the product and your friend gets it <span className="text-green-400 font-semibold">FREE!</span></p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-[#ff6b35] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
            <p className="text-gray-300">Then YOU can create your own want and get 10 friends to help YOU get free stuff!</p>
          </div>
        </div>

        <div className="mt-6 p-3 bg-[#ff6b35]/20 rounded-lg border border-[#ff6b35]/30">
          <p className="text-[#ff6b35] text-sm font-medium text-center">
            It's a loop of friends helping friends! 🔄
          </p>
        </div>

        <button 
          onClick={() => setShowHelp(false)}
          className="w-full mt-4 bg-[#ff6b35] text-white py-3 rounded-xl font-bold"
        >
          Got it!
        </button>
      </div>
    </div>
  );

  // ============ MAIN VIEW: Two buttons ============
  if (step === 'view') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
        {showHelp && <HelpModal />}
        
        <div className="max-w-sm w-full text-center">
          {/* Help Icon */}
          <button 
            onClick={() => setShowHelp(true)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white flex items-center gap-1 text-sm"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="hidden sm:inline">How does it work?</span>
          </button>

          {/* Product Image */}
          {want.reference_image_url && want.reference_image_url.length > 50 && (
            <div className="w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden bg-gray-800">
              <img src={want.reference_image_url} alt={want.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Title */}
          <p className="text-gray-400 mb-1">{creatorName} wants:</p>
          <h1 className="text-xl font-bold mb-8">{want.title}</h1>

          {/* AGREE BUTTON - Blue */}
          <button
            onClick={handleAgreeClick}
            className="w-full bg-[#3b82f6] text-white py-4 rounded-xl font-bold text-xl hover:bg-blue-600 transition"
          >
            Agree
          </button>
          <p className="text-gray-500 text-sm mt-2 mb-10">(I think I also need one)</p>

          {/* CREATE MY OWN WANT - Orange Box */}
          <Link href="/wants/create" className="block">
            <div className="w-full bg-[#ff6b35] text-black py-4 rounded-xl font-bold text-lg hover:bg-orange-500 transition">
              Create my own Want
            </div>
          </Link>
          <p className="text-[#ff6b35] font-semibold mt-2">and get it free</p>

          {/* Small help link at bottom */}
          <button 
            onClick={() => setShowHelp(true)}
            className="text-gray-500 text-xs mt-8 underline"
          >
            How does this work?
          </button>
        </div>
      </div>
    );
  }

  // ============ PHONE INPUT ============
  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <h1 className="text-xl font-bold mb-2">Enter your number</h1>
          <p className="text-gray-400 text-sm mb-6">To confirm your support for {creatorName}</p>

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <input
              type="tel"
              placeholder="082 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white text-[#0f172a] p-4 rounded-xl text-center text-lg"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3b82f6] text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Get your friend their free want'}
            </button>
          </form>

          <button onClick={() => setStep('view')} className="text-gray-500 text-sm mt-6">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ============ SUCCESS ============
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-xl font-bold mb-2">Done!</h1>
        <p className="text-gray-400 mb-10">You're helping {creatorName} get their product free!</p>

        {/* GET YOUR FREE WANT */}
        <Link href="/wants/create" className="block">
          <div className="w-full bg-[#ff6b35] text-black py-4 rounded-xl font-bold text-lg hover:bg-orange-500 transition">
            Get your free want
          </div>
        </Link>
        <p className="text-gray-500 text-sm mt-3">Create your own & get 10 friends to agree</p>
      </div>
    </div>
  );
}
