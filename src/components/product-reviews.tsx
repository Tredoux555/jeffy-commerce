'use client';

import { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface ProductReviewFormProps {
  productId: string;
  productName: string;
  orderId?: string;
  onSuccess?: () => void;
}

export function ProductReviewForm({ productId, productName, orderId, onSuccess }: ProductReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      const { error: insertError } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          order_id: orderId || null,
          rating,
          review_text: review || null,
          reviewer_name: name || 'Anonymous',
          status: 'pending', // Needs approval
        });

      if (insertError) throw insertError;
      
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Star className="h-6 w-6 text-green-600 fill-green-600" />
        </div>
        <h3 className="font-semibold text-green-800 mb-1">Thank you!</h3>
        <p className="text-sm text-green-600">Your review has been submitted and is pending approval.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating for {productName}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star 
                className={`h-8 w-8 ${
                  star <= (hoverRating || rating) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Your Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anonymous"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Your Review (optional)</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Tell others what you think about this product..."
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        Submit Review
      </Button>
    </form>
  );
}

// Display reviews
interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  reviewer_name: string;
  created_at: string;
}

export function ProductReviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p>No reviews yet. Be the first!</p>
      </div>
    );
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b">
        <div className="text-center">
          <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
          <div className="flex gap-0.5 justify-center mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                className={`h-4 w-4 ${star <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500 mt-1">{reviews.length} reviews</div>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                  {review.reviewer_name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{review.reviewer_name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            {review.review_text && (
              <p className="text-gray-700">{review.review_text}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
