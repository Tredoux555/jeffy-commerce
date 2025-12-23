import Link from 'next/link';
import { Gift, Plus, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Jeffy Wants - Get Products FREE!',
  description: 'Create a want, share with friends, and get it FREE when 10 people agree!',
};

export default async function WantsPage() {
  const supabase = await createClient();

  const { data: wants } = await supabase
    .from('wants')
    .select('*')
    .eq('status', 'active')
    .order('current_agrees', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-jeffy-orange to-jeffy-yellow text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Jeffy Wants</h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Want something? Share it with friends. When 10 people agree, you get it FREE!
          </p>
          <Link href="/wants/new">
            <Button size="lg" className="bg-jeffy-dark text-white hover:bg-jeffy-dark/90">
              <Plus className="h-5 w-5 mr-2" />
              Create a Want
            </Button>
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-jeffy-orange font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-1">Create a Want</h3>
              <p className="text-sm text-gray-600">Tell us what product you want</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-jeffy-orange font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-1">Share on WhatsApp</h3>
              <p className="text-sm text-gray-600">Send your link to friends</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-jeffy-orange font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-1">Get 10 Agrees</h3>
              <p className="text-sm text-gray-600">Friends say "I want this too!"</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Get it FREE!</h3>
              <p className="text-sm text-gray-600">We source and deliver it to you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Discount Tiers */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Discount Tiers</h2>
          <div className="grid md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-jeffy-orange">3</div>
              <div className="text-sm text-gray-600">agrees</div>
              <div className="text-lg font-semibold mt-2">20% OFF</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-jeffy-orange">5</div>
              <div className="text-sm text-gray-600">agrees</div>
              <div className="text-lg font-semibold mt-2">40% OFF</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-jeffy-orange">7</div>
              <div className="text-sm text-gray-600">agrees</div>
              <div className="text-lg font-semibold mt-2">60% OFF</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-500">
              <div className="text-3xl font-bold text-green-600">10</div>
              <div className="text-sm text-gray-600">agrees</div>
              <div className="text-lg font-semibold mt-2 text-green-600">FREE!</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Wants */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-jeffy-orange" />
              <h2 className="text-2xl font-bold">Trending Wants</h2>
            </div>
            <Link href="/wants/new">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Yours
              </Button>
            </Link>
          </div>

          {wants && wants.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wants.map((want) => {
                const progress = (want.current_agrees / want.threshold) * 100;
                const remaining = want.threshold - want.current_agrees;

                return (
                  <Link key={want.id} href={`/wants/${want.share_code}`}>
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                      {want.reference_image_url && (
                        <div className="aspect-video bg-gray-100 relative">
                          <img
                            src={want.reference_image_url}
                            alt={want.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{want.title}</h3>

                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-jeffy-orange'}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{want.current_agrees} / {want.threshold}</span>
                          </div>
                          <span className={remaining > 0 ? 'text-jeffy-orange' : 'text-green-600'}>
                            {remaining > 0 ? `${remaining} more needed` : 'Goal reached!'}
                          </span>
                        </div>

                        <Button className="w-full mt-4" variant={remaining === 0 ? 'default' : 'outline'}>
                          {remaining === 0 ? 'View Details' : 'I Want This Too!'}
                        </Button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No active wants yet</h3>
              <p className="text-gray-600 mb-6">Be the first to create a want!</p>
              <Link href="/wants/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create a Want
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
