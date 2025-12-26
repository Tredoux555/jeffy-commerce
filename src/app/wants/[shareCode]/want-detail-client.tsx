'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Share2, Gift, Users, ExternalLink, CheckCircle, ArrowLeft, Copy, Check, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface WantDetailClientProps {
  want: Want;
}

const milestones = [
  { count: 3, message: '🔥 Getting hot!' },
  { count: 5, message: '⚡ Halfway there!' },
  { count: 7, message: '🚀 Almost FREE!' },
  { count: 10, message: '🎁 FREE!' },
];

export function WantDetailClient({ want }: WantDetailClientProps) {
  const [loading, setLoading] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [currentAgrees, setCurrentAgrees] = useState(want.current_agrees);
  const [showAgreeForm, setShowAgreeForm] = useState(false);
  const [agreeForm, setAgreeForm] = useState({ name: '', phone: '' });
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Help ${want.creator_name || 'someone'} get "${want.title}" FREE! Only ${want.threshold - currentAgrees} more people needed! 🎁`;

  const remaining = want.threshold - currentAgrees;
  const progress = (currentAgrees / want.threshold) * 100;
  const creatorName = want.creator_name || 'Someone';

  // Calculate deadline (7 days from creation)
  const createdDate = new Date(want.created_at);
  const expiryDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft <= 2 && daysLeft > 0;

  const currentMilestone = milestones
    .filter(m => currentAgrees >= m.count)
    .pop();

  const handleAgree = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeForm.name.trim() || !agreeForm.phone.trim()) {
      alert('Please enter your name and phone number');
      return;
    }

    setLoading(true);

    try {
      const res = await addWantAgreement(want.id, agreeForm.name.trim(), agreeForm.phone.trim());

      if (res.success && res.want) {
        setHasAgreed(true);
        setCurrentAgrees(res.want.current_agrees);
        setShowAgreeForm(false);
        
        if (res.thresholdReached) {
          alert('🚀 THRESHOLD REACHED! ' + creatorName + ' gets their product FREE!');
        } else {
          alert('🎉 Thanks for helping! Now create YOUR want and get free stuff too!');
        }
      } else {
        alert(res.error || 'Failed to agree. Please try again.');
      }
    } catch (error: any) {
      console.error('Error agreeing:', error);
      alert('Failed to agree: ' + (error.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const viralMessage = `🔥 HELP ME GET THIS FREE! 🔥

I'm trying to get "${want.title}" completely FREE on Jeffy!

Just need ${remaining} more people to click and agree. Takes 10 seconds!

👇 Click here to help me out:
${url}

If I get 10 people, I get it FREE! Then YOU can create your own want and get free stuff too! 🎁`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(viralMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareFacebook = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const fbText = `Help me get "${want.title}" FREE! Only ${remaining} more people needed! 🎁 Click to help and then get YOUR free stuff!`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(fbText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const tweetText = `🔥 Help me get "${want.title}" FREE on @JeffyCommerce! Only ${remaining} more needed! Then YOU can get free stuff too! 🎁`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
        
        {/* Deadline Banner */}
        {isExpired ? (
          <div className="mt-3 bg-red-100 border border-red-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-700 font-medium">This want has expired</span>
            </div>
            <p className="text-sm text-red-600 mb-3">
              This want didn't reach {want.threshold} agrees within 7 days. 
              {creatorName} can create a new want to try again!
            </p>
            <Link href="/wants/create">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                Create New Want →
              </button>
            </Link>
          </div>
        ) : (
          <div className={`mt-3 rounded-lg p-3 flex items-center gap-2 ${isUrgent ? 'bg-orange-100 border border-orange-300' : 'bg-blue-50 border border-blue-200'}`}>
            <Clock className={`h-5 w-5 ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`} />
            <span className={`font-medium ${isUrgent ? 'text-orange-700' : 'text-blue-700'}`}>
              {daysLeft > 1 ? `${daysLeft} days left` : daysLeft === 1 ? '1 day left' : `${hoursLeft} hours left`} to reach {want.threshold} agrees!
            </span>
          </div>
        )}
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
              <div>{milestone.message}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-orange-50 rounded-lg text-center">
          {currentAgrees >= 10 ? (
            <span className="text-green-600 font-semibold">🎉 {creatorName} gets this product FREE!</span>
          ) : currentMilestone ? (
            <span className="text-jeffy-orange font-semibold">{currentMilestone.message} Share to reach 10!</span>
          ) : (
            <span className="text-gray-600">Help {creatorName} get 10 agrees for a FREE product!</span>
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
                {loading ? 'Adding...' : 'Help them get it FREE!'}
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
            Get 10 agrees to claim FREE product!
          </Button>
        )}

        {hasAgreed && (
          <>
            <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" disabled>
              <CheckCircle className="h-5 w-5 mr-2" />
              You're helping {creatorName}!
            </Button>
            <Link href="/wants/create" className="w-full">
              <Button size="lg" variant="outline" className="w-full mt-2 border-jeffy-orange text-jeffy-orange hover:bg-orange-50">
                <Gift className="h-5 w-5 mr-2" />
                Now create YOUR want & get FREE stuff!
              </Button>
            </Link>
          </>
        )}

        <Button size="lg" variant="outline" className="w-full" onClick={handleShare}>
          <Share2 className="h-5 w-5 mr-2" />
          Share on WhatsApp
        </Button>

        {/* Social Share Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button 
            variant="outline" 
            className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white border-none"
            onClick={handleShareFacebook}
          >
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </Button>

          <Button 
            variant="outline" 
            className="w-full bg-black hover:bg-gray-800 text-white border-none"
            onClick={handleShareTwitter}
          >
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X (Twitter)
          </Button>

          <Button 
            variant="outline" 
            className="w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white border-none"
            onClick={handleCopyLink}
          >
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            {copied ? 'Copied!' : 'Instagram'}
          </Button>

          <Button 
            variant="outline" 
            className="w-full bg-black hover:bg-gray-800 text-white border-none"
            onClick={handleCopyLink}
          >
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
            {copied ? 'Copied!' : 'TikTok'}
          </Button>
        </div>

        {/* Copy Link Button */}
        <Button 
          variant="outline" 
          className="w-full mt-3"
          onClick={handleCopyLink}
        >
          {copied ? <Check className="h-5 w-5 mr-2 text-green-500" /> : <Copy className="h-5 w-5 mr-2" />}
          {copied ? 'Link Copied!' : 'Copy Link to Share'}
        </Button>
      </div>

      <div className="mt-8 p-4 bg-orange-50 rounded-lg">
        <h3 className="font-semibold mb-2">How does this work?</h3>
        <p className="text-sm text-gray-700 mb-3">
          When 10 people agree they want this product, {creatorName} gets it completely FREE! 
          By agreeing, you also get to participate in the Jeffy Wants program - create your 
          own want and get YOUR friends to help YOU get products for free!
        </p>
        <div className="text-xs text-gray-500 space-y-1 border-t pt-3">
          <p><strong>Terms:</strong></p>
          <p>• First person to create a want for a product gets priority</p>
          <p>• 7-day deadline to reach 10 agrees</p>
          <p>• Products under R1,000 guaranteed | Over R1,000 subject to review</p>
          <p>• Only official agrees (with phone) count toward the goal</p>
        </div>
      </div>
    </div>
  );
}
