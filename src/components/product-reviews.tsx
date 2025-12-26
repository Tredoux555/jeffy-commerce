'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, User, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  title: string;
  review_text: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stats, setStats] = useState({ avg: 0, count: 0, distribution: [0,0,0,0,0] });

  const [form, setForm] = useState({
    name: '', email: '', rating: 5, title: '', review: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data);
      // Calculate stats
      const count = data.length;
      const avg = count > 0 ? data.reduce((s, r) => s + r.rating, 0) / count : 0;
      const dist = [0,0,0,0,0];
      data.forEach(r => dist[r.rating - 1]++);
      setStats({ avg, count, distribution: dist });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const supabase = createClient();
    await supabase.from('product_reviews').insert({
      product_id: productId,
      user_name: form.name,
      user_email: form.email,
      rating: form.rating,
      title: form.title,
      review_text: form.review,
      is_approved: false,
    });

    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
  };

  const handleHelpful = async (reviewId: string) => {
    const supabase = createClient();
    await supabase.rpc('increment_helpful', { review_id: reviewId });
    fetchReviews();
  };

  const StarRating = ({ rating, size = 'md', interactive = false, onChange }: { rating: number; size?: 'sm' | 'md' | 'lg'; interactive?: boolean; onChange?: (r: number) => void }) => {
    const sizes = { sm: 'h-3 w-3', md: 'h-5 w-5', lg: 'h-6 w-6' };
    return (
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map((i) => (
          <button key={i} type="button" disabled={!interactive} onClick={() => onChange?.(i)} className={interactive ? 'cursor-pointer' : ''}>
            <Star className={`${sizes[size]} ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-12 border-t pt-12">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl font-bold">{stats.avg.toFixed(1)}</div>
            <div>
              <StarRating rating={Math.round(stats.avg)} />
              <p className="text-sm text-gray-500 mt-1">{stats.count} review{stats.count !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="space-y-2">
            {[5,4,3,2,1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-8">{star}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${stats.count > 0 ? (stats.distribution[star-1] / stats.count) * 100 : 0}%` }} />
                </div>
                <span className="w-8 text-gray-500">{stats.distribution[star-1]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          {submitted ? (
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-bold text-green-800">Thank you for your review!</p>
              <p className="text-sm text-green-600">It will appear after approval.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">Bought this product? Share your experience!</p>
              <button onClick={() => setShowForm(!showForm)} className="bg-[#ff6b35] text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition">
                Write a Review
              </button>
            </>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">Write Your Review</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Rating *</label>
              <StarRating rating={form.rating} size="lg" interactive onChange={(r) => setForm({ ...form, rating: r })} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email (optional)</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Review Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Summarize your experience" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Review *</label>
              <textarea required rows={4} value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="What did you like or dislike?" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="bg-[#ff6b35] text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Submitting...</> : 'Submit Review'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border rounded-lg">Cancel</button>
            </div>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.user_name}</span>
                      {review.is_verified_purchase && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified Purchase</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              {review.title && <p className="font-semibold mb-1">{review.title}</p>}
              <p className="text-gray-600">{review.review_text}</p>
              <button onClick={() => handleHelpful(review.id)} className="mt-3 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" /> Helpful ({review.helpful_count})
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
}
