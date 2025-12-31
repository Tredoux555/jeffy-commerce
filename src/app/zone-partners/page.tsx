'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Check, MapPin, Truck, DollarSign, Users, ChevronDown, Award, Clock, MessageCircle, Copy, Star, TrendingUp, Shield, Zap, ArrowRight, Gift, AlertCircle } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  city: string;
  province: string;
  maxPartners: number;
  currentCount: number;
  spotsLeft: number;
  status: 'open' | 'limited' | 'waitlist';
}

interface Benefits {
  tier: string;
  benefits: string[];
  profitSplit: string;
}

interface UserData {
  email: string;
  zoneId: string;
  zoneName: string;
  position: number;
  referralCode: string;
  referralCount: number;
  benefits: Benefits;
}

const STATUS_COLORS = {
  open: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Open' },
  limited: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Limited Spots' },
  waitlist: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Waitlist Only' },
};

export default function ZonePartnersPage() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const [zones, setZones] = useState<Zone[]>([]);
  const [totalPartners, setTotalPartners] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [copied, setCopied] = useState(false);
  const [filterCity, setFilterCity] = useState<string>('all');

  // Load zones
  useEffect(() => {
    fetchZones();
    // Check for existing signup
    const stored = localStorage.getItem('jeffy_zone_partner');
    if (stored) {
      const parsed = JSON.parse(stored);
      refreshUserPosition(parsed.email);
    }
  }, []);

  const fetchZones = async () => {
    try {
      const res = await fetch('/api/zone-partners');
      const data = await res.json();
      if (data.success) {
        setZones(data.zones);
        setTotalPartners(data.totalPartners);
      }
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserPosition = async (userEmail: string) => {
    try {
      const res = await fetch(`/api/zone-partners?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setZones(data.zones);
      }
    } catch (error) {
      console.error('Error refreshing position:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedZone || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/zone-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          zone_id: selectedZone,
          whatsapp: whatsapp || null,
          referral_code: refCode
        })
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('jeffy_zone_partner', JSON.stringify(data.user));
        fetchZones(); // Refresh zone counts
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const shareUrl = user ? `https://jeffy.co.za/zone-partners?ref=${user.referralCode}` : '';
  const whatsappMessage = user
    ? `🚚 I just applied to be a Jeffy Zone Partner in ${user.zoneName}! Earn 50% of every delivery.\n\nJoin me and get better position: ${shareUrl}`
    : '';

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
  };

  const cities = [...new Set(zones.map(z => z.city))];
  const filteredZones = filterCity === 'all' ? zones : zones.filter(z => z.city === filterCity);

  const selectedZoneData = zones.find(z => z.id === selectedZone);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-6">
            <Truck className="h-4 w-4" /> Now Recruiting Partners
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            Become a Jeffy<br />
            <span className="text-amber-400">Zone Partner</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Earn <span className="text-white font-bold">50% of every delivery</span> in your zone.
            Be your own boss. Set your own hours.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-400">{totalPartners}</p>
              <p className="text-sm text-gray-500">Partners Applied</p>
            </div>
            <div className="h-12 w-px bg-gray-700" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{zones.filter(z => z.status === 'open').length}</p>
              <p className="text-sm text-gray-500">Zones Open</p>
            </div>
            <div className="h-12 w-px bg-gray-700" />
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">50%</p>
              <p className="text-sm text-gray-500">Profit Share</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {!user ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Zone Selection */}
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-400" /> Select Your Zone
                </h2>

                {/* City Filter */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  <button
                    onClick={() => setFilterCity('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                      filterCity === 'all' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    All Cities
                  </button>
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => setFilterCity(city)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                        filterCity === city ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                {/* Zone List */}
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {filteredZones.map(zone => {
                      const status = STATUS_COLORS[zone.status];
                      return (
                        <button
                          key={zone.id}
                          onClick={() => setSelectedZone(zone.id)}
                          className={`w-full p-3 rounded-xl border-2 transition text-left ${
                            selectedZone === zone.id
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-white">{zone.name}</p>
                              <p className="text-sm text-gray-400">{zone.city}, {zone.province}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {zone.spotsLeft > 0 ? `${zone.spotsLeft} spots left` : 'Join waitlist'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Signup Form */}
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-400" /> Join the Waitlist
                </h2>

                {selectedZoneData && (
                  <div className={`mb-4 p-3 rounded-lg ${STATUS_COLORS[selectedZoneData.status].bg}`}>
                    <p className={`font-medium ${STATUS_COLORS[selectedZoneData.status].text}`}>
                      {selectedZoneData.name} - {STATUS_COLORS[selectedZoneData.status].label}
                    </p>
                    {selectedZoneData.spotsLeft > 0 ? (
                      <p className="text-sm opacity-80">Only {selectedZoneData.spotsLeft} founding partner spots available!</p>
                    ) : (
                      <p className="text-sm opacity-80">Join the waitlist - positions still matter for priority!</p>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp (optional)</label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+27 XX XXX XXXX"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                    />
                  </div>

                  {refCode && (
                    <p className="text-sm text-green-400 flex items-center gap-1">
                      <Check className="h-4 w-4" /> Referred! You&apos;ll get priority position.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedZone || submitting}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 font-bold text-lg rounded-xl hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>Claim My Spot <ArrowRight className="h-5 w-5" /></>
                    )}
                  </button>
                </form>

                {/* Position Benefits Preview */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">POSITION BENEFITS</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-gray-300">Positions 1-10:</span>
                      <span className="text-amber-400 font-medium">55/45 profit split (6 months)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="text-gray-300">Positions 11-25:</span>
                      <span className="text-purple-400 font-medium">Founding Partner badge</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-gray-300">Positions 26-50:</span>
                      <span className="text-blue-400 font-medium">Early launch access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="max-w-lg mx-auto">
              <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-10 w-10 text-green-400" />
                </div>

                <h2 className="text-2xl font-bold mb-2">You&apos;re In!</h2>
                <p className="text-gray-400 mb-6">{user.email}</p>

                {/* Zone & Position */}
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-6 mb-6">
                  <p className="text-amber-400 font-medium mb-1">{user.zoneName}</p>
                  <p className="text-5xl font-black text-white mb-2">#{user.position}</p>
                  <p className="text-gray-400">in your zone</p>
                </div>

                {/* Benefits */}
                <div className="bg-purple-500/20 rounded-xl p-4 mb-6">
                  <p className="text-purple-400 font-medium">{user.benefits.tier}</p>
                  <p className="text-xl font-bold text-white">{user.benefits.profitSplit} Profit Split</p>
                  <ul className="text-sm text-gray-300 mt-2 space-y-1">
                    {user.benefits.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2 justify-center">
                        <Check className="h-3 w-3 text-purple-400" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Referral Stats */}
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
                  <Gift className="h-5 w-5 text-amber-500" />
                  <span><strong className="text-white">{user.referralCount}</strong> partners referred</span>
                </div>

                {/* Share Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={shareWhatsApp}
                    className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" /> Share on WhatsApp
                  </button>

                  <button
                    onClick={copyLink}
                    className={`w-full py-3 border-2 font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                      copied
                        ? 'border-green-500 text-green-400 bg-green-500/10'
                        : 'border-gray-600 text-gray-300 hover:border-amber-500'
                    }`}
                  >
                    {copied ? <><Check className="h-5 w-5" /> Link Copied!</> : <><Copy className="h-5 w-5" /> Copy Referral Link</>}
                  </button>
                </div>

                {/* Move Up Message */}
                <div className="mt-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  <p className="text-amber-400 font-medium">🚀 Move up the line!</p>
                  <p className="text-sm text-gray-400">Each partner referral moves you up 3 positions.</p>
                </div>

                {/* Referral Code */}
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Your referral code</p>
                  <p className="font-mono font-bold text-amber-400">{user.referralCode}</p>
                </div>

                {/* Next Step */}
                <Link
                  href="/partner/apply"
                  className="mt-6 inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium"
                >
                  Complete Full Application <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How Zone Partners Work</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: 'Claim Your Zone', desc: 'Select the area you want to deliver in. Each zone has limited spots.' },
              { icon: Truck, title: 'Deliver Orders', desc: 'Pick up from our warehouse, deliver to customers in your zone.' },
              { icon: DollarSign, title: 'Earn 50%', desc: 'Keep 50% of every delivery fee. Weekly payouts to your bank.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Why Become a Zone Partner?</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: DollarSign, title: '50% Profit Share', desc: 'Industry-leading split. You keep half of every delivery.' },
              { icon: Clock, title: 'Flexible Hours', desc: 'Work when you want. Set your own schedule.' },
              { icon: Shield, title: 'Exclusive Territory', desc: 'Your zone is yours. No competition from other partners.' },
              { icon: TrendingUp, title: 'Growth Potential', desc: 'Build a delivery business. Hire sub-contractors as you grow.' },
              { icon: Zap, title: 'Quick Payouts', desc: 'Weekly payments direct to your bank account.' },
              { icon: Users, title: 'Community', desc: 'Join a network of partners building together.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="shrink-0 w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{title}</h3>
                  <p className="text-sm text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-800/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Common Questions</h2>

          <div className="space-y-4">
            {[
              { q: 'Do I need my own vehicle?', a: 'Yes, you&aposll need a car, motorcycle, or scooter for deliveries. If you don&apost have one yet, select "Will acquire" when applying.' },
              { q: 'How much can I earn?', a: 'Partners earn R25-50 per delivery on average. Active partners doing 20+ deliveries weekly earn R2,000-4,000/week.' },
              { q: 'What are the requirements?', a: 'Valid SA drivers license, smartphone, reliable vehicle, and proof of insurance. Background check required.' },
              { q: 'When does Jeffy launch?', a: 'We&aposre launching zone-by-zone. Partners in top positions get first access. Join now to secure your spot!' },
            ].map(({ q, a }, i) => (
              <div key={i} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-sm text-gray-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-gray-400 mb-8">Spots are limited. Claim your zone before someone else does.</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 font-bold text-lg rounded-xl hover:from-amber-400 hover:to-orange-400"
            >
              Claim My Spot Now
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>© 2025 Jeffy Commerce. South Africa.</p>
        <Link href="/coming-soon" className="text-amber-400 hover:underline mt-2 inline-block">
          ← Back to Customer Waitlist
        </Link>
      </footer>
    </div>
  );
}
