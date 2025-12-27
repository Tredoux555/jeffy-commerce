import Link from 'next/link';
import { ArrowLeft, ArrowRight, Quote, Heart, Users, Shield, Sparkles, Eye, Lightbulb, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'The Jeffy Manifesto | Our Story',
  description: 'A Vision for South Africa. A Blueprint for the World.',
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
      <section className="container mx-auto px-4 pt-12 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-orange-500 font-medium mb-6">The Jeffy Manifesto</p>
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            A Vision for South Africa.<br/>
            <span className="text-orange-500">A Blueprint for the World.</span>
          </h1>
          <p className="text-xl md:text-2xl italic text-gray-400">
            "Wise men plant trees under whose shade they will never sit."
          </p>
        </div>
      </section>

      {/* The Vision */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-orange-500">The Vision</h2>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-6">
              A South Africa where every child, regardless of circumstance, has access to an education that doesn't teach them to fit into a broken system—but <span className="text-orange-400">equips them to build a better one.</span>
            </p>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-6">
              A nation where graduates leave school not with debt and dependency, but with <span className="text-orange-400">land, a home, mastery of essential skills, and the freedom to create their own path.</span>
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              We envision communities that are 100% self-sufficient. Schools that become the beating heart of a new social structure. A system that starts in South Africa and eventually encompasses the earth—not through force or politics, but through pure demonstration of a better way to live.
            </p>
          </div>
        </div>
      </section>

      {/* The Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-orange-500">The Mission</h2>
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl p-8 border border-orange-500/20">
              <p className="text-lg text-gray-200 leading-relaxed">
                To build a commerce platform (Jeffy) that funds a revolutionary education system. To create schools where students learn to manufacture everything they need to live—food, medicine, technology, clothing, shelter—and graduate with <span className="text-orange-400">1 hectare of land, a home they built themselves, and a micro-facility to pursue their passion.</span> To prove that there is another way, and to invite the world to join us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Origin */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-orange-500">The Origin</h2>
            
            <div className="bg-orange-500/10 border-l-4 border-orange-500 p-6 rounded-r-xl mb-8">
              <Quote className="h-6 w-6 text-orange-500 mb-3" />
              <p className="text-lg md:text-xl italic text-gray-200 leading-relaxed">
                "I was born on a farm in South Africa. We lived in wealth and opulence, and just one kilometer away, people kept their entire worldly possessions in a single trunk. No education. No hot shower. No clean clothes. And somehow, we saw this as normal."
              </p>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              My family's roots in this country go back to its very founding—we are one of the original families. I had the best education money could buy, and I found it wanting.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              But what haunted me wasn't my education. It was the view from my childhood home. That contrast. The inequality that we'd somehow normalized.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              My family built a school for the local farm children—children who would otherwise walk 30 kilometers to learn. It was working. It was making a difference. <span className="text-red-400">Then corruption destroyed it.</span> Misappropriated funds. A bureaucratic shutdown. Hope, dismantled by greed.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              I've lived and worked on every continent except America and Antarctica. I tried to go back to South Africa. Several times. The politics, the systems, the decay—they pushed me away each time.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Now I'm in China, teaching kindergarten to support my family, sourcing products directly from factories. And I've realized something: <span className="text-orange-400">I'm in the perfect place to do what I've always dreamed of doing.</span>
            </p>

            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-8 border border-orange-500/20">
              <p className="text-xl md:text-2xl text-white leading-relaxed italic text-center">
                "The native people of South Africa are some of the smartest and most innovative people on the planet. They've just never had the opportunity to shine. <span className="text-orange-400">I want to provide that opportunity.</span> That is my dream. That is Jeffy."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-orange-500">Core Values</h2>
            <p className="text-gray-400 text-center mb-12">The principles that guide everything we do.</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <Scale className="h-6 w-6 text-orange-500" />
                  <h3 className="font-bold text-lg">Merit Over Money</h3>
                </div>
                <p className="text-gray-400">Selection is based purely on potential, character, and determination—never financial advantage. The best education should not be a privilege of the wealthy.</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="h-6 w-6 text-orange-500" />
                  <h3 className="font-bold text-lg">Self-Sufficiency as Freedom</h3>
                </div>
                <p className="text-gray-400">True independence comes from the ability to create what you need. We teach students to be producers, not just consumers.</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-6 w-6 text-orange-500" />
                  <h3 className="font-bold text-lg">Ubuntu Economics</h3>
                </div>
                <p className="text-gray-400">"I am because we are." Our system rewards contribution to the community. Zone Partners earn 50% because fair distribution creates prosperity for all.</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-6 w-6 text-orange-500" />
                  <h3 className="font-bold text-lg">Quality Without Compromise</h3>
                </div>
                <p className="text-gray-400">Every product personally tested. Three variants sourced and compared. Direct from factory. 100% returns, no questions.</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <Lightbulb className="h-6 w-6 text-orange-500" />
                  <h3 className="font-bold text-lg">Leadership Over Celebrity</h3>
                </div>
                <p className="text-gray-400">We don't need followers—we need leaders. Partners in this vision are building something that will outlast all of us.</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="h-6 w-6 text-orange-500" />
                  <h3 className="font-bold text-lg">Transparency Always</h3>
                </div>
                <p className="text-gray-400">No hidden agendas. No corruption. The school that inspired this vision was destroyed by misappropriated funds. We will never repeat that failure.</p>
              </div>

              <div className="md:col-span-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="h-6 w-6 text-orange-500" />
                  <h3 className="font-bold text-lg">Love as Strategy</h3>
                </div>
                <p className="text-gray-300">We change the system through pure love, freedom, and upliftment. Not through opposition, but through demonstration. Not through fighting the old, but through building the new.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">This Is Just The Beginning</h2>
            <p className="text-gray-400 text-lg mb-8">
              The story explains why. The vision explains how. Discover the complete system—the schools, what graduates receive, and how you can be part of it.
            </p>
            <Link href="/vision">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg h-14 px-8">
                Discover The Full Vision
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              Founded by Tredoux Willemse · December 2025
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/vision" className="hover:text-white">The Vision</Link>
              <Link href="/" className="hover:text-white">Back to Jeffy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
