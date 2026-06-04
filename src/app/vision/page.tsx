import Link from 'next/link';
import { ArrowLeft, ArrowRight, GraduationCap, Home, Factory, Wheat, Pill, Cpu, Shirt, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'The Vision | Jeffy Schools',
  description: 'The true purpose of Jeffy: Free schools that create self-sufficient graduates.',
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
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-orange-500 font-medium mb-4">The True Purpose</p>
          <h1 className="text-4xl md:text-6xl font-black mb-6">Jeffy Is Just the Engine</h1>
          <p className="text-xl text-gray-400">
            The schools are the destination.
          </p>
        </div>
      </section>

      {/* The Vision */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">The Vision</h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              A South Africa where every child, regardless of circumstance, has access to an education that doesn't teach them to fit into a broken system—but <span className="text-orange-400">equips them to build a better one.</span>
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              A nation where graduates leave school not with debt and dependency, but with <span className="text-orange-400">land, a home, mastery of essential skills, and the freedom to create their own path.</span>
            </p>
          </div>
        </div>
      </section>

      {/* What Graduates Receive */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">What Every Graduate Receives</h2>
            <p className="text-gray-400 text-center mb-12">Free. No debt. No strings.</p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wheat className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">1 Hectare of Land</h3>
                <p className="text-gray-400">Theirs. Free and clear. Space to build a life.</p>
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">A Home They Built</h3>
                <p className="text-gray-400">Using skills learned in school. Their family can join them.</p>
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Factory className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">A Production Facility</h3>
                <p className="text-gray-400">For their chosen craft. To pursue their passion.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Curriculum */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Students Learn to Manufacture Everything</h2>
            <p className="text-gray-400 text-center mb-12">True independence comes from the ability to create what you need.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Wheat, label: 'Food', color: 'green' },
                { icon: Pill, label: 'Medicine', color: 'red' },
                { icon: Cpu, label: 'Technology', color: 'blue' },
                { icon: Shirt, label: 'Clothing', color: 'purple' },
                { icon: Home, label: 'Shelter', color: 'orange' },
                { icon: Factory, label: 'Everything', color: 'gray' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-4 text-center">
                  <item.icon className={`h-8 w-8 mx-auto mb-2 text-${item.color}-500`} />
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-400 mt-8">
              Computers. Drones. Vehicles. Kitchen utensils. <span className="text-orange-400">Everything.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Merit Over Money */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-8 border border-orange-500/20">
              <h2 className="text-2xl font-bold mb-4 text-center">Merit Over Money</h2>
              <p className="text-gray-300 text-center mb-6">
                Selection is based purely on potential, character, and determination—<span className="text-orange-400">never financial advantage.</span>
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Academic performance',
                  'Character assessment',
                  'Demonstrated potential',
                  'Interviews',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-white">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-orange-400 mt-6 font-medium">
                NOT financial status. Ever.
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
              10-30 leaders who help build this system from the ground floor.
            </p>

            <div className="bg-gray-800 rounded-2xl p-6 text-left mb-8">
              <h3 className="font-bold text-orange-400 mb-4">What Founding Partners Receive:</h3>
              <div className="space-y-3">
                {[
                  'Priority school placement for their families',
                  'Leadership roles as the system expands',
                  'Zone Partner entry at lowest cost (R10-30k)',
                  'A seat at the table as we design the future',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xl text-white mb-2">
              I don't just need partners or money.
            </p>
            <p className="text-2xl font-bold text-orange-500">
              I need leaders.
            </p>
          </div>
        </div>
      </section>

      {/* The Expansion */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">The Long Game</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-xl p-6 border-l-4 border-orange-500">
                <h3 className="font-bold text-orange-400 mb-2">Phase 1: Prove It Works</h3>
                <p className="text-gray-300">Jeffy Commerce funds the first school. Zone Partners build the distribution network.</p>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6 border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-400 mb-2">Phase 2: The First School</h3>
                <p className="text-gray-300">Built on family farm land (R30M purchase, R300M value). First graduates receive their land, homes, and facilities.</p>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6 border-l-4 border-green-500">
                <h3 className="font-bold text-green-400 mb-2">Phase 3: Self-Sustaining Expansion</h3>
                <p className="text-gray-300">Products made by students: FREE within school system. Sold externally: profits fund new schools. Each school specializes.</p>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6 border-l-4 border-purple-500">
                <h3 className="font-bold text-purple-400 mb-2">Phase 4: The World</h3>
                <p className="text-gray-300">Schools become communities. Communities become a system. An alternative to what's failing us now—through demonstration, not revolution.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Annual Gathering */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">The Annual Gathering</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Once a year, all schools gather. They showcase their advances. They share technology. They improve together. 
              <span className="text-orange-400"> The system accelerates.</span>
            </p>
          </div>
        </div>
      </section>

      {/* The Quote */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-2xl md:text-4xl font-light italic text-gray-300 leading-relaxed mb-6">
              "If economic collapse comes—and it may—these communities will be the leading light. 100% self-sufficient. A beacon."
            </p>
            <p className="text-gray-500">
              By then, I'll be long gone. But the shade of these trees will shelter generations I'll never meet.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-orange-600/20 to-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Are You In?</h2>
            <p className="text-gray-300 text-lg mb-8">
              Jeffy isn't about making money. It's about building an empire that empowers people. 
              Fair products for fair prices. And with the proceeds, a school system that could replace the social structure we have now.
            </p>
            <p className="text-xl text-orange-400 mb-8">
              Starting in South Africa. Spreading to the world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/distributors/join">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Become a Reseller
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/wants/create">
                <Button size="lg" className="bg-white/10 hover:bg-white/20 border border-white/30">
                  Start with a Want
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
            <p className="text-gray-500 text-sm">
              Founded by Tredoux Willemse · December 2025
            </p>
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
