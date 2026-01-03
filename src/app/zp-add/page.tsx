'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function QuickAddPartnerPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Clean phone number
      let cleanPhone = phone.replace(/[^0-9+]/g, '');
      
      // Generate a simple email placeholder if needed
      const placeholderEmail = `${cleanPhone}@whatsapp.temp`;

      const { error: insertError } = await supabase
        .from('zone_partners')
        .insert({
          full_name: name.trim(),
          phone: cleanPhone,
          email: placeholderEmail,
          zone_name: area.trim() || null,
          status: 'inquiry',
          notes: `WhatsApp inquiry - ${new Date().toLocaleDateString()}`,
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      
      // Reset for next entry after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setPhone('');
        setArea('');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-green-500 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <CheckCircle2 className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Saved!</h1>
          <p className="text-green-100">{name} added to pipeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <MessageCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Quick Add</h1>
            <p className="text-sm text-gray-400">WhatsApp inquiry</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Thabo Mokoena"
              className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg placeholder:text-gray-500 focus:outline-none focus:border-green-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              WhatsApp Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="082 123 4567"
              className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg placeholder:text-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Area/Township
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Soweto, Alex, etc."
              className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg placeholder:text-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-bold text-lg rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Lead'
            )}
          </button>
        </form>

        {/* Quick tip */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Status will be set to "inquiry"<br />
          View in Admin → Partners
        </p>
      </div>
    </div>
  );
}
