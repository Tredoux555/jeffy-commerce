'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Share2, Gift, Users, ExternalLink, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createBrowserClient } from '@supabase/ssr';

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
}

interface WantDetailClientProps {
  want: Want;
}

const milestones = [
  { count: 3, discount: 20 },
  { count: 5, discount: 40 },
  { count: 7, discount: 60 },
  { count: 10, discount: 100 },
];

export function WantDetailClient({ want }: WantDetailClientProps) {
  const [loading, setLoading] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [currentAgrees, setCurrentAgrees] = useState(want.current_agrees);
  const [showAgreeForm, setShowAgreeForm] = useState(false);
  const [agreeForm, setAgreeForm] = useState({ name: '', phone: '' });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const remaining = want.threshold - currentAgrees;
  const progress = (currentAgrees / want.threshold) * 100;
  const creatorName = want.creator_name || 'Someone';

  const currentDiscount = milestones
    .filter(m => currentAgrees >= m.count)
    .pop()?.discount || 0;

  const handleAgree = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeForm.name.trim() || !agreeForm.phone.trim()) {
      alert('Please enter your name and phone number');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('want_agrees')
        .insert({
          want_id: want.id,
          name: agreeForm.name.trim(),
          phone: agreeForm.phone.trim(),
        });

      if (error) throw error;

      const newCount = currentAgrees + 1;
      await supabase
        .from('wants')
        .update({ current_agrees: newCount })
        .eq('id', want.id);

      setHasAgreed(true);
      setCurrentAgrees(newCount);
      setShowAgreeForm(false);

      alert('You agreed! 🎉 Thanks for helping out!');
    } catch (error: any) {
      console.error('Error agreeing:', error);
      alert('Failed to agree: ' + (error.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Help ${creatorName} get "${want.title}" FREE! Only ${remaining} more people needed! 🎁`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/wants" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Wants
      </Link>

      {want.reference_image_url && (
        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-6">
          <img
            src={want.reference_image_url}
            alt={want.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{want.title}</h1>
        <p className="text-gray-600">{creatorName} wants this product</p>
      </div>

      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-jeffy-orange" />
            <span className="font-semibold">{currentAgrees} / {want.threshold} agrees</span>
          </div>
          {remaining > 0 ? (
            <span className="text-jeffy-orange font-medium">{remaining} more needed</span>
          ) : (
            <span className="text-green-600 font-medium flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Goal reached!
            </span>
          )}
        </div>

        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-green-500' : 'bg-jeffy-orange'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs">
          {milestones.map((milestone) => (
            <div
              key={milestone.count}
              className={`text-center ${currentAgrees >= milestone.count ? 'text-green-600 font-medium' : 'text-gray-400'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${currentAgrees >= milestone.count ? 'bg-green-100' : 'bg-gray-100'}`}>
                {milestone.count}
              </div>
              <div>{milestone.discount === 100 ? 'FREE!' : `${milestone.discount}% off`}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-orange-50 rounded-lg text-center">
          {currentDiscount === 100 ? (
            <span className="text-green-600 font-semibold">🎉 This product is FREE for {creatorName}!</span>
          ) : currentDiscount > 0 ? (
            <span className="text-jeffy-orange font-semibold">Currently at {currentDiscount}% discount!</span>
          ) : (
            <span className="text-gray-600">Get 3 agrees to unlock 20% off!</span>
          )}
        </div>
      </div>

      {want.description && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Why they want it:</h2>
          <p className="text-gray-600">{want.description}</p>
        </div>
      )}

      {want.reference_url && (
        <Link
          href={want.reference_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-jeffy-orange hover:underline mb-6"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          View product reference
        </Link>
      )}

      {showAgreeForm && !hasAgreed && remaining > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-4">Add your support!</h3>
          <form onSubmit={handleAgree} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <Input
                placeholder="John"
                value={agreeForm.name}
                onChange={(e) => setAgreeForm({ ...agreeForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your WhatsApp Number</label>
              <Input
                type="tel"
                placeholder="082 123 4567"
                value={agreeForm.phone}
                onChange={(e) => setAgreeForm({ ...agreeForm, phone: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Adding...' : 'I Want This Too!'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAgreeForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {!hasAgreed && remaining > 0 && !showAgreeForm && (
          <Button size="lg" className="w-full" onClick={() => setShowAgreeForm(true)}>
            <Gift className="h-5 w-5 mr-2" />
            I Want This Too!
          </Button>
        )}

        {hasAgreed && (
          <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" disabled>
            <CheckCircle className="h-5 w-5 mr-2" />
            You agreed! Thanks!
          </Button>
        )}

        <Button size="lg" variant="outline" className="w-full" onClick={handleShare}>
          <Share2 className="h-5 w-5 mr-2" />
          Share on WhatsApp
        </Button>
      </div>

      <div className="mt-8 p-4 bg-orange-50 rounded-lg">
        <h3 className="font-semibold mb-2">How does this work?</h3>
        <p className="text-sm text-gray-700">
          When enough people agree they want this product, we source it directly from 
          manufacturers and the creator gets it at a huge discount (or FREE with 10 agrees)!
          Everyone who agrees also gets notified when the product becomes available.
        </p>
      </div>
    </div>
  );
}
