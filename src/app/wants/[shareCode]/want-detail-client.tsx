'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Users } from 'lucide-react';
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
  max_price_cents: number | null;
  created_at: string;
}

export function WantDetailClient({ want }: { want: Want }) {
  const [step, setStep] = useState<'view' | 'phone' | 'success'>('view');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAgrees, setCurrentAgrees] = useState(want.current_agrees);
  const [error, setError] = useState('');

  const creatorName = want.creator_name || 'Someone';
  const remaining = want.threshold - currentAgrees;
  const progress = (currentAgrees / want.threshold) * 100;

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

      if (res.success && res.want) {
        setCurrentAgrees(res.want.current_agrees);
        setStep('success');
      } else {
        setError(res.error || 'Failed to agree. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: View the want - Simple two buttons
  if (step === 'view') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          {/* Product Image */}
          {want.reference_image_url && (
            <div className="w-32 h-32 mx-auto mb-6 rounded-xl overflow-hidden bg-gray-800">
              <img src={want.reference_image_url} alt={want.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2">{want.title}</h1>
          <p className="text-gray-400 mb-6">{creatorName} wants this FREE</p>

          {/* Progress */}
          <div className="bg-gray-800 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#ff6b35]" />
                <span className="font-semibold">{currentAgrees}/{want.threshold}</span>
              </span>
              <span className="text-[#ff6b35]">{remaining} more needed</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#ff6b35] rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* AGREE BUTTON */}
          <button
            onClick={handleAgreeClick}
            className="w-full bg-[#3b82f6] text-white py-4 rounded-xl font-bold text-lg mb-3 hover:bg-blue-600 transition"
          >
            Agree
          </button>
          <p className="text-gray-500 text-sm mb-8">(I think I also need one)</p>

          {/* CREATE MY OWN WANT - Orange Box */}
          <Link href="/wants/create" className="block">
            <div className="w-full bg-[#ff6b35] text-black py-4 rounded-xl font-bold text-lg hover:bg-orange-500 transition">
              Create my own Want
            </div>
            <p className="text-[#ff6b35] font-semibold mt-2">and get it free</p>
          </Link>
        </div>
      </div>
    );
  }

  // STEP 2: Phone number input
  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Almost there!</h1>
          <p className="text-gray-400 mb-8">Enter your phone to confirm your support</p>

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
              className="w-full bg-white text-[#0f172a] p-4 rounded-xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3b82f6] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Get your friend their free want'}
            </button>
          </form>

          {/* Back link */}
          <button 
            onClick={() => setStep('view')}
            className="text-gray-500 text-sm mt-6 hover:text-gray-300"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  // STEP 3: Success - Loop back
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>

        <h1 className="text-2xl font-bold mb-2">You're helping {creatorName}!</h1>
        <p className="text-gray-400 mb-8">
          {currentAgrees >= want.threshold 
            ? `🎉 They reached ${want.threshold} agrees - they get it FREE!`
            : `${remaining} more people needed for their free product`
          }
        </p>

        {/* Updated progress */}
        <div className="bg-gray-800 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-5 w-5 text-green-500" />
            <span className="font-bold text-green-500">{currentAgrees}/{want.threshold} agrees</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.min((currentAgrees / want.threshold) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* GET YOUR FREE WANT - The Loop */}
        <Link href="/wants" className="block">
          <div className="w-full bg-[#ff6b35] text-black py-4 rounded-xl font-bold text-lg hover:bg-orange-500 transition">
            Get your free want
          </div>
        </Link>
        <p className="text-gray-500 text-sm mt-3">Create your own want and get 10 friends to agree!</p>
      </div>
    </div>
  );
}
