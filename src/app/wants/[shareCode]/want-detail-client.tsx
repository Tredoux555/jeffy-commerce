'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
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

  // ============ MAIN VIEW: Two buttons ============
  if (step === 'view') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
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
