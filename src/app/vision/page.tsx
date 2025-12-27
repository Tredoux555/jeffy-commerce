import Link from 'next/link';
import { ArrowLeft, ArrowRight, GraduationCap, Home, Factory, Wheat, Pill, Cpu, Shirt, Users, CheckCircle, Rocket, Globe, Building, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'The Vision | The System',
  description: 'The complete Jeffy system: Commerce that funds schools that change the world.',
};

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/story" className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          The Story
        </Link>
        <span className="text-2xl font-black text-orange-500">JEFFY</span>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-12 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-orange-500 font-medium mb-4">The System</p>
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            From Commerce<br/>
            <span className="text-orange-500">To Communities</span>
          </h1>
          <p className="text-xl text-gray-400">
            Four phases. One vision. A complete transformation.
          </p>
        </div>
      </section>

      {/* Phase 1: Jeffy Commerce */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-2xl font-bold">1</div>
              <div>
                <p className="text-orange-400 text-sm font-medium">Phase One</p>
                <h2 className="text-2xl md:text-3xl font-bold">Jeffy Commerce</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-3 text-orange-400">The "Wants" System</h3>
                <p className="text-gray-300 mb-4">
                  Users submit products they need—something overpriced, hard to find, or lacking a reliable supplier. When 10 people agree on a want, someone gets it free. Community-powered demand, factory-direct supply, quality guaranteed.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3 text-orange-400">Zone Partners</h3>
                <p className="text-gray-300 mb-4">
                  Not gig workers—entrepreneurs. Zone Partners buy stock (R10,000-20,000 entry), manage deliveries in their zone, and keep <span className="text-orange-400 font-bold">50% of profit</span> on every sale. Compare that to Uber's 25%. This is ownership, not exploitation.
                </p>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-bold text-lg mb-3 text-orange-400">Quality Guarantee</h3>
                <p className="text-gray-300">
                  I personally test every product in China. Three variants sourced, compared, best selected. Direct from factory verification. 100% no-questions returns. We're not dropshipping—we're curating.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 2: The School */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">2</div>
              <div>
                <p className="text-blue-400 text-sm font-medium">Phase Two</p>
                <h2 className="text-2xl md:text-3xl font-bold">The School</h2>
              </div>
            </div>

            <p className="text-gray-300 text-lg mb-8">
              <span className="text-blue-400 font-medium">Location:</span> A family farm in South Africa. Land already approved for development. Value: R300 million. Available to us for R30 million. This is where we build.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="font-bold text-lg mb-3 text-blue-400">The Curriculum</h3>
                <p className="text-gray-300 mb-4">
                  Students learn to physically manufacture everything needed for daily life:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Wheat, label: 'Food' },
                    { icon: Pill, label: 'Medicine' },
                    { icon: Cpu, label: 'Technology' },
                    { icon: Shirt, label: 'Clothing' },
                    { icon: Home, label: 'Shelter' },
                    { icon: Factory, label: 'Everything' },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-2 bg-gray-800 rounded-lg">
                      <item.icon className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                      <p className="text-xs text-gray-400">{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-400 text-sm mt-4">
                  Computers. Drones. Vehicles. Kitchen utensils. We partner with corporate manufacturers. Students learn from the source.
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="font-bold text-lg mb-3 text-blue-400">Selection</h3>
                <p className="text-gray-300 mb-4">Pure merit. Free education for all accepted students.</p>
                <div className="space-y-2">
                  {['Academic performance', 'Character assessment', 'Demonstrated potential', 'Interviews'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-orange-400 text-sm mt-4 font-medium">
                  One exception: those who helped build this system have priority for their children. Loyalty matters.
                </p>
              </div>
            </div>

            {/* Graduation */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
              <h3 className="font-bold text-xl mb-6 text-center">What Every Graduate Receives</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Wheat className="h-8 w-8 text-green-500" />
                  </div>
                  <h4 className="font-bold mb-2">1 Hectare of Land</h4>
                  <p className="text-gray-400 text-sm">Theirs. Free and clear. To build their future on.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Home className="h-8 w-8 text-blue-500" />
                  </div>
                  <h4 className="font-bold mb-2">A Home They Built</h4>
                  <p className="text-gray-400 text-sm">Skills learned in school. Their family joins them.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Factory className="h-8 w-8 text-purple-500" />
                  </div>
                  <h4 className="font-bold mb-2">A Micro-Facility</h4>
                  <p className="text-gray-400 text-sm">Food production, electronics, textiles—their passion.</p>
                </div>
              </div>
              <p className="text-center text-orange-400 mt-6 font-medium">
                They are free from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 3: Self-Sustaining Expansion */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-2xl font-bold">3</div>
              <div>
                <p className="text-green-400 text-sm font-medium">Phase Three</p>
                <h2 className="text-2xl md:text-3xl font-bold">Self-Sustaining Expansion</h2>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-gray-300 text-lg">
                Products created by students are <span className="text-green-400">free within the school system</span>, sold externally. When revenue exceeds costs, we franchise. More schools. More communities.
              </p>
              
              <p className="text-gray-300 text-lg">
                Each school specializes—one in agriculture, another in technology, another in medicine.
              </p>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3 text-green-400">The Annual Gathering</h3>
                <p className="text-gray-300">
                  Once a year, all schools gather. They showcase their advances. They share technology. They improve together. <span className="text-green-400">The system accelerates.</span>
                </p>
              </div>

              <p className="text-gray-300 text-lg italic">
                Eventually, the schools become communities. The communities become a system. The system becomes an alternative to what's failing us now. Not through revolution—through demonstration. Through offering something better.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 4: The World */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center text-2xl font-bold">4</div>
              <div>
                <p className="text-purple-400 text-sm font-medium">Phase Four</p>
                <h2 className="text-2xl md:text-3xl font-bold">The World</h2>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20">
              <p className="text-xl text-gray-200 leading-relaxed mb-6">
                If economic collapse comes—and it may—these communities will be the leading light. 100% self-sufficient. Capable of helping those outside the system. A beacon.
              </p>
              <p className="text-lg text-gray-400 italic">
                By then, I'll be long gone. But the shade of these trees will shelter generations I'll never meet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Founding Circle */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">The Founding Circle</h2>
            <p className="text-gray-400 mb-8">
              The first 10-30 partners who help build this system will have a guaranteed place in what we create.
            </p>

            <div className="bg-gray-800 rounded-2xl p-8 text-left">
              <div className="space-y-4">
                {[
                  'Priority for your children at the school',
                  'A seat at the table as we design the future',
                  'Zone Partner entry at lowest cost (R10-30k)',
                  'Leadership roles as the system expands',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Ask */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">The Ask</h2>
            <p className="text-gray-400 text-center mb-12">I don't just need partners. I don't just need money. I need leaders.</p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="text-orange-500 font-bold text-sm mb-2">IMMEDIATE</div>
                <h3 className="font-bold text-lg mb-3">Share Jeffy</h3>
                <p className="text-gray-400 text-sm">
                  Share Jeffy with your audience. Encourage people to submit products they want—things that are overpriced, hard to find, or lacking reliable suppliers. Help us prove the model works.
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="text-blue-500 font-bold text-sm mb-2">NEAR-TERM</div>
                <h3 className="font-bold text-lg mb-3">Become a Zone Partner</h3>
                <p className="text-gray-400 text-sm">
                  Lowest possible entry cost—just the stock you'll sell (R10,000-20,000). Own your zone. Build with us from the ground floor.
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="text-purple-500 font-bold text-sm mb-2">LONG-TERM</div>
                <h3 className="font-bold text-lg mb-3">Join the Founding Circle</h3>
                <p className="text-gray-400 text-sm">
                  The first 10-30 partners who help build this system will have a guaranteed place in what we create. Priority for your children. A seat at the table.
                </p>
              </div>
            </div>

            <p className="text-center text-gray-300 mt-8 text-lg">
              You have nothing to lose. Everything to gain. <span className="text-orange-400">And if we don't do this, no one will.</span>
            </p>
          </div>
        </div>
      </section>

      {/* The Promise / Are You In */}
      <section className="py-20 bg-gradient-to-br from-orange-600/20 via-gray-950 to-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">The Promise</h2>
            
            <p className="text-lg text-gray-300 mb-6">
              I want to make South Africa proud again. I want South Africans to be the most capable and advanced people on the planet. I want to equalize the playing field that has been tilted for centuries.
            </p>

            <p className="text-lg text-gray-300 mb-6">
              I'm not asking you to trust a stranger. I'm asking you to look at what I'm building, see if it aligns with what you believe, and decide if you want to be part of it.
            </p>

            <p className="text-lg text-gray-400 mb-8">
              This isn't about me being famous. I have no desire for the spotlight. I'd prefer others to lead publicly while I build in the background. But I'll stand there if I have to.
            </p>

            <div className="bg-gray-900/50 rounded-2xl p-8 border border-orange-500/30 mb-10">
              <p className="text-xl text-white leading-relaxed italic">
                "Jeffy isn't about making money. Jeffy is about building an empire that empowers people. Fair products for fair prices. And with the proceeds, a school system that could very well replace the social structure we have now. <span className="text-orange-400">Starting in South Africa. Spreading to the world.</span>"
              </p>
            </div>

            <h3 className="text-4xl md:text-5xl font-black text-orange-500 mb-8">Are You In?</h3>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/partner/apply">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg h-14 px-8">
                  Become a Zone Partner
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/wants/create">
                <Button size="lg" className="bg-white/10 hover:bg-white/20 border border-white/30 text-lg h-14 px-8">
                  Create a Want
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-500 text-sm">Founded by Tredoux Willemse · December 2025</p>
              <p className="text-gray-600 text-xs mt-1">Founder, Jeffy</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/story" className="hover:text-white">The Story</Link>
              <Link href="/" className="hover:text-white">Back to Jeffy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
