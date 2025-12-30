'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Star, Check, Loader2 } from 'lucide-react';

const RATING_TAGS = [
  { id: 'fast', label: '⚡ Fast Delivery' },
  { id: 'friendly', label: '😊 Friendly' },
  { id: 'professional', label: '👔 Professional' },
  { id: 'careful', label: '📦 Careful Handling' },
  { id: 'communicative', label: '💬 Good Communication' },
  { id: 'on_time', label: '⏰ On Time' },
];

const NEGATIVE_TAGS = [
  { id: 'late', label: '⏰ Late' },
  { id: 'rude', label: '😤 Rude' },
  { id: 'damaged', label: '📦 Package Damaged' },
  { id: 'no_contact', label: '📵 Hard to Contact' },
];

export default function RateOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, zone_partners(id, full_name, business_name)')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        
        // Check if already rated
        const { data: existingRating } = await supabase
          .from('order_ratings')
          .select('id')
          .eq('order_id', orderId)
          .single();

        if (existingRating) {
          setSubmitted(true);
        }
        
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (stars === 0) {
      setError('Please select a star rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/ratings/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          zonePartnerId: order.zone_partners?.id,
          stars,
          tags: selectedTags,
          comment: comment.trim() || null
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-jeffy-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <div className="bg-navy-800 rounded-xl p-6 text-center">
          <p className="text-white">Order not found</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <div className="bg-navy-800 rounded-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-navy-300 mb-6">
            Your feedback helps us improve and rewards great Zone Partners.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-jeffy-500 text-white rounded-lg hover:bg-jeffy-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const partnerName = order.zone_partners?.business_name || order.zone_partners?.full_name || 'Your Zone Partner';
  const availableTags = stars >= 4 ? RATING_TAGS : [...RATING_TAGS, ...NEGATIVE_TAGS];

  return (
    <div className="min-h-screen bg-navy-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Rate Your Delivery</h1>
          <p className="text-navy-300">Order #{order.order_number}</p>
        </div>

        {/* Partner Info */}
        <div className="bg-navy-800 rounded-xl p-4 mb-6">
          <p className="text-navy-400 text-sm">Delivered by</p>
          <p className="text-white font-semibold text-lg">{partnerName}</p>
        </div>

        {/* Star Rating */}
        <div className="bg-navy-800 rounded-xl p-6 mb-6">
          <p className="text-white font-medium mb-4 text-center">How was your delivery?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setStars(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoveredStar || stars)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-navy-600'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center mt-3 text-navy-400 text-sm">
            {stars === 0 && 'Tap to rate'}
            {stars === 1 && 'Poor'}
            {stars === 2 && 'Fair'}
            {stars === 3 && 'Good'}
            {stars === 4 && 'Great'}
            {stars === 5 && 'Excellent!'}
          </p>
        </div>

        {/* Tags */}
        {stars > 0 && (
          <div className="bg-navy-800 rounded-xl p-6 mb-6">
            <p className="text-white font-medium mb-4">What stood out? (optional)</p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-2 rounded-full text-sm transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'bg-jeffy-500 text-white'
                      : 'bg-navy-700 text-navy-300 hover:bg-navy-600'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comment */}
        {stars > 0 && (
          <div className="bg-navy-800 rounded-xl p-6 mb-6">
            <p className="text-white font-medium mb-4">Additional comments (optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience..."
              rows={3}
              className="w-full bg-navy-700 border border-navy-600 rounded-lg px-4 py-3 text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-jeffy-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={stars === 0 || submitting}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            stars === 0
              ? 'bg-navy-700 text-navy-500 cursor-not-allowed'
              : 'bg-jeffy-500 text-white hover:bg-jeffy-600'
          }`}
        >
          {submitting ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            'Submit Rating'
          )}
        </button>
      </div>
    </div>
  );
}



