import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Star, Check, X, Clock } from 'lucide-react';

export default async function AdminReviewsPage() {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from('product_reviews')
    .select(`
      *,
      products (name, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  const pendingCount = reviews?.filter(r => r.status === 'pending').length || 0;
  const approvedCount = reviews?.filter(r => r.status === 'approved').length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Reviews</h1>
        <div className="flex gap-4 text-sm">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
            {pendingCount} pending
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
            {approvedCount} approved
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        {reviews && reviews.length > 0 ? (
          <div className="divide-y">
            {reviews.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{review.reviewer_name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        review.status === 'approved' 
                          ? 'bg-green-100 text-green-700'
                          : review.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    
                    {review.products && (
                      <Link 
                        href={`/products/${review.products.slug}`}
                        className="text-sm text-[#ff6b35] hover:underline"
                      >
                        {review.products.name}
                      </Link>
                    )}
                    
                    {review.review_text && (
                      <p className="text-gray-600 mt-2">{review.review_text}</p>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {review.status === 'pending' && (
                    <div className="flex gap-2">
                      <form action={`/api/admin/reviews/${review.id}/approve`} method="POST">
                        <button 
                          type="submit"
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </form>
                      <form action={`/api/admin/reviews/${review.id}/reject`} method="POST">
                        <button 
                          type="submit"
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
