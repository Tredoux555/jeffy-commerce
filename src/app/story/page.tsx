import Link from 'next/link';
import { ArrowLeft, ArrowRight, Quote, Heart, Globe, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'The Jeffy Story | Our Origin',
  description: 'How a farm in South Africa inspired a vision to change commerce and education forever.',
};

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Jeffy
        </Link>
        <span className="text-2xl font-black text-orange-500">JEFFY</span>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-orange-500 font-medium mb-4">The Origin</p>
          <h1 className="text-4xl md:text-6xl font-black mb-6">The Jeffy Story</h1>
          <p className="text-xl text-gray-400">
            How a view from a farm in South Africa planted a seed that would grow into something much bigger than commerce.
          </p>
        </div>
      </section>

      {/* The View */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-orange-500/10 border-l-4 border-orange-500 p-6 rounded-r-xl mb-8">
              <Quote className="h-8 w-8 text-orange-500 mb-4" />
              <p className="text-xl md:text-2xl italic text-gray-200 leading-relaxed">
                "I was born on a farm in South Africa. We lived in wealth and opulence, and just one kilometer away, people kept their entire worldly possessions in a single trunk. No education. No hot shower. No clean clothes. And somehow, we saw this as normal."
              </p>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              My family's roots in South Africa go back to its very founding—we are one of the original families. I had the best education money could buy, and I found it wanting.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed">
              But what haunted me wasn't my education. It was that view. That contrast. The inequality that we'd somehow normalized.
            </p>
          </div>
        </div>
      </section>

      {/* The School */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Sprout className="h-6 w-6 text-green-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">The School That Could Have Been</h2>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              My family built a school for the local farm children—children who would otherwise walk 30 kilometers each way just to learn. It was working. It was making a difference.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Then corruption destroyed it. Misappropriated funds. A bureaucratic shutdown. Hope, dismantled by greed.
            </p>

            <p className="text-orange-400 text-lg leading-relaxed font-medium">
              That school planted a seed. Jeffy is what grew from it.
            </p>
          </div>
        </div>
      </section>

      {/* The Journey */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">The Journey</h2>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              I've lived and worked on every continent except America and Antarctica. I left South Africa months after graduating university because despite my qualifications, there was no infrastructure for me unless I was born into wealth.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              I tried to go back. Several times. The politics, the systems, the decay—they pushed me away each time.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed">
              Now I'm in China, teaching kindergarten to support my family, sourcing products directly from factories. And I've realized something: <span className="text-orange-400">I'm in the perfect place to do what I've always dreamed of doing.</span>
            </p>
          </div>
        </div>
      </section>

      {/* The Belief */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">What I Believe</h2>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-8 border border-orange-500/20 mb-8">
              <p className="text-xl md:text-2xl text-white leading-relaxed">
                "The native people of South Africa are some of the <span className="text-orange-400">smartest and most innovative people on the planet.</span> They've just never had the opportunity to shine. I want to provide that opportunity."
              </p>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              I want to make South Africa proud again. I want South Africans to be the most capable and advanced people on the planet. I want to equalize the playing field that has been tilted for centuries.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed">
              I'm not asking you to trust a stranger. I'm asking you to look at what I'm building, see if it aligns with what you believe, and decide if you want to be part of it.
            </p>
          </div>
        </div>
      </section>

      {/* The Quote */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-2xl md:text-4xl font-light italic text-gray-300 leading-relaxed mb-6">
              "Truly great men plant trees under whose shade they will never sit."
            </p>
            <p className="text-orange-500 font-medium">— The philosophy behind Jeffy</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">There's More to This Story</h2>
            <p className="text-gray-400 mb-8">
              Jeffy isn't just about commerce. There's a bigger vision—schools, self-sufficiency, and a new way forward for South Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vision">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Discover the Full Vision
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="border-gray-600 text-white">
                  Back to Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Founded by Tredoux Willemse · December 2025</p>
        </div>
      </footer>
    </div>
  );
}
