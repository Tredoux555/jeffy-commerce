'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Plus, Package, CheckCircle, Gift, X, MessageCircle, Filter, Users, Link2, Copy, Check, HelpCircle, ThumbsUp, ArrowRight, Sparkles, Heart, Share2, MapPin, Camera, ImagePlus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Want {
  id: string;
  product_name: string;
  description: string | null;
  category: string;
  vote_count: number;
  verified_count: number;
  popularity_clicks: number;
  status: string;
  creator_referral_code: string;
  image_url?: string;
  created_at: string;
}

interface Stats {
  voting: number;
  sourcing: number;
  available: number;
}

export default function WantsPage() {
  const [wants, setWants] = useState<Want[]>([]);
  const [stats, setStats] = useState<Stats>({ voting: 0, sourcing: 0, available: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'voting' | 'sourcing' | 'available'>('voting');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // New want form
  const [showForm, setShowForm] = useState(false);
  const [newWant, setNewWant] = useState({ product_name: '', description: '', category: 'General', email: '', price_willing: '', buy_frequency: '', suburb: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error' | 'similar'; text: string; similar?: Want[]; want?: Want } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image before upload
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        // Max 1200px on longest side
        const maxSize = 1200;
        let { width, height } = img;
        
        if (width > height && width > maxSize) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width / height) * maxSize;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              console.log(`Compressed: ${(file.size/1024).toFixed(0)}KB -> ${(compressedFile.size/1024).toFixed(0)}KB`);
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8 // 80% quality
        );
      };
      
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  // Load email from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('jeffy_voter_email');
    if (stored) {
      setNewWant(prev => ({ ...prev, email: stored }));
    }
  }, []);

  // Fetch wants
  useEffect(() => {
    fetchWants();
  }, [filter, sortBy]);

  const fetchWants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wants/public?status=${filter}&sort=${sortBy}`);
      const data = await res.json();
      if (data.success) {
        setWants(data.wants);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - be lenient for mobile (HEIC, empty type)
      const isImage = file.type.startsWith('image/') || 
                      file.type === '' || 
                      file.type === 'application/octet-stream' ||
                      file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|heic|heif)$/);
      if (!isImage) {
        setSubmitMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitMessage({ type: 'error', text: 'Image must be under 5MB' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setSubmitMessage(null);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    setUploadingImage(true);
    setSubmitMessage({ type: 'error', text: 'Compressing image...' });
    
    try {
      // Compress image first (reduces ~2MB to ~200KB)
      const compressedFile = await compressImage(imageFile);
      console.log('Original size:', imageFile.size, 'Compressed:', compressedFile.size);
      
      setSubmitMessage({ type: 'error', text: `Uploading (${Math.round(compressedFile.size/1024)}KB)...` });
      
      const formData = new FormData();
      formData.append('file', compressedFile);
      
      // Try upload with retry
      let attempts = 0;
      let lastError = '';
      
      while (attempts < 3) {
        attempts++;
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
          
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            signal: controller.signal
          });
          
          clearTimeout(timeout);
          const data = await res.json();
          console.log('Upload response:', data);
          
          if (data.success) {
            setSubmitMessage(null);
            return data.url;
          } else {
            lastError = data.error || 'Upload failed';
          }
        } catch (err: any) {
          console.log(`Attempt ${attempts} failed:`, err.message);
          lastError = err.name === 'AbortError' ? 'Upload timed out' : (err.message || 'Connection error');
          if (attempts < 3) {
            setSubmitMessage({ type: 'error', text: `Retrying... (attempt ${attempts + 1}/3)` });
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
      
      setSubmitMessage({ type: 'error', text: lastError });
      return null;
    } catch (error: any) {
      console.error('Upload error:', error);
      setSubmitMessage({ type: 'error', text: `Error: ${error?.message || 'Unknown'}` });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitWant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWant.product_name || !newWant.email) return;
    
    // Require image
    if (!imageFile) {
      setSubmitMessage({ type: 'error', text: 'Please upload a photo of the product you want' });
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      // Upload image first
      const imageUrl = await uploadImage();
      if (!imageUrl) {
        setSubmitMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/wants/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: newWant.product_name,
          description: newWant.description,
          category: newWant.category,
          user_email: newWant.email,
          image_url: imageUrl,
          price_willing_cents: newWant.price_willing ? Math.round(parseFloat(newWant.price_willing) * 100) : null,
          buy_frequency: newWant.buy_frequency || null,
          suburb: newWant.suburb || null
        })
      });
      const data = await res.json();

      if (data.success) {
        setSubmitMessage({ 
          type: 'success', 
          text: 'Product requested! Share your link to get verifications.',
          want: data.want
        });
        setNewWant({ product_name: '', description: '', category: 'General', email: newWant.email, price_willing: '', buy_frequency: '', suburb: '' });
        setImageFile(null);
        setImagePreview(null);
        localStorage.setItem('jeffy_voter_email', newWant.email);
        fetchWants();
      } else if (data.similar) {
        setSubmitMessage({ type: 'similar', text: data.message, similar: data.similar });
      } else {
        setSubmitMessage({ type: 'error', text: data.error || 'Failed to submit' });
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'Server error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getShareLink = (want: Want) => {
    return `https://jeffy.co.za/want/${want.id}?ref=${want.creator_referral_code}`;
  };

  const copyShareLink = async (want: Want) => {
    const link = getShareLink(want);
    await navigator.clipboard.writeText(link);
    setCopiedId(want.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareViaWhatsApp = (want: Want) => {
    const link = getShareLink(want);
    const message = `🛒 I want "${want.product_name}" on Jeffy! If 10 people verify, they'll source it and I get mine FREE! Would you buy this too? ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const resetForm = () => {
    setShowForm(false);
    setSubmitMessage(null);
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      
      {/* ============ CO-CREATOR HERO ============ */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[150px] opacity-20" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px] opacity-15" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm font-medium mb-8">
            <Heart className="h-4 w-4" />
            Your role to play
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-6">
            You&apos;re not a customer.
            <br />
            <span className="text-orange-400">You&apos;re a co-creator.</span>
          </h2>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12">
            You help us build the catalogue with products people <span className="italic">actually</span> want.
            Not what some buyer in Johannesburg thinks you want. What <span className="text-white font-semibold">you</span> want.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-xl px-10 py-5 rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all hover:scale-105 mb-8"
          >
            <Plus className="h-6 w-6" />
            Create Your Want
          </button>

          {/* The reward */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl p-8 border border-green-500/30 max-w-xl mx-auto">
            <p className="text-slate-400 text-lg mb-2">For your help?</p>
            <p className="text-3xl font-black text-white">
              Your product. <span className="text-green-400">100% free.</span>
            </p>
            <p className="text-lg text-slate-400 mt-2">Gratis. No strings attached.</p>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-orange-400 font-semibold uppercase tracking-wider mb-4">All you need to do</p>
            <h2 className="text-3xl md:text-4xl font-black">Prove there&apos;s demand.</h2>
            <p className="text-xl text-slate-400 mt-2">We do the rest.</p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-black shrink-0 text-sm">1</div>
              <div>
                <h3 className="font-bold mb-1">Request any product you want</h3>
                <p className="text-slate-400 text-sm">Something you saw on TikTok. Something a friend has. Anything.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-black shrink-0 text-sm">2</div>
              <div>
                <h3 className="font-bold mb-1">Get your unique link</h3>
                <p className="text-slate-400 text-sm">Every verification through it counts toward your goal.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-black shrink-0 text-sm">3</div>
              <div>
                <h3 className="font-bold mb-1">Share it with 10 people</h3>
                <p className="text-slate-400 text-sm">Friends. Family. Your WhatsApp group.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-black shrink-0 text-sm">4</div>
              <div>
                <h3 className="font-bold mb-1">They verify they&apos;re real</h3>
                <p className="text-slate-400 text-sm">Email or phone. Proving they&apos;re actual people with real interest.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-5 border border-green-500/30">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <Gift className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-bold mb-1 text-green-400">You get your product free. It gets added to the catalogue.</h3>
                <p className="text-slate-300 text-sm">You proved there&apos;s a market. You earned it.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOR YOUR FRIENDS ============ */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">And your friends?</h3>
            <p className="text-slate-300">
              They can <span className="text-white font-semibold">preorder at a discount</span> — or create their own Want and get theirs free.
            </p>
            <p className="text-lg text-white font-semibold mt-4">
              The loop continues. The catalogue grows. Prices drop.
            </p>
          </div>
        </div>
      </section>

      {/* ============ ZONE PARTNER BONUS ============ */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl p-8 border border-purple-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Bonus for early believers
              </div>
              
              <h3 className="text-2xl font-black mb-4">Want more than a free product?</h3>
              
              <p className="text-slate-300 mb-2">
                <span className="text-white font-bold">Become a Reseller.</span> Secure your territory. Build something real.
              </p>
              <p className="text-xl text-white font-black mb-6">
                This could change your life. <span className="text-purple-400">Your destiny.</span>
              </p>
              
              <Link 
                href="/distributors/join"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105"
              >
                <MapPin className="h-5 w-5" />
                Become a Reseller
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ NEW WANT MODAL ============ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-gray-900 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Your Want</h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitMessage?.type === 'success' && submitMessage.want ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Want Created! 🎉</h3>
                <p className="text-gray-500 mb-4">Check your email to set up your account and track verifications.</p>
                
                {/* Share Link */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Your verification link:</p>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={getShareLink(submitMessage.want)} className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm" />
                    <button onClick={() => copyShareLink(submitMessage.want!)} className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button onClick={() => shareViaWhatsApp(submitMessage.want!)} className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2 mb-4">
                  <MessageCircle className="h-5 w-5" /> Share on WhatsApp
                </button>

                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <p className="text-sm text-orange-800">
                    📧 <strong>Check your email!</strong> We sent you a link to set up your password and track your verifications.
                  </p>
                </div>

                <button 
                  onClick={resetForm} 
                  className="w-full py-3 mt-4 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50"
                >
                  Done
                </button>
              </div>
            ) : submitMessage?.type === 'similar' ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Great minds think alike! 🧠</h3>
                <p className="text-gray-500 mb-4">Someone already requested something similar. Help them hit 10!</p>
                
                <div className="space-y-2 mb-6">
                  {submitMessage.similar?.slice(0, 2).map((s) => (
                    <div key={s.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div className="text-left">
                        <span className="font-medium block">{s.product_name}</span>
                        <span className="text-xs text-gray-400">{s.verified_count || 0}/10 verifications</span>
                      </div>
                      <button onClick={() => { shareViaWhatsApp(s); }} className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600">
                        Share
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={() => setSubmitMessage(null)} className="w-full py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">
                  ← Request something different
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitWant} className="space-y-4">
                {/* Image Upload - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Photo *</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-xl border-2 border-orange-200"
                      />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 px-3 py-1 bg-white/90 rounded-lg text-sm font-medium hover:bg-white"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-orange-400 hover:bg-orange-50/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Camera className="h-6 w-6 text-orange-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-700">Upload a screenshot</p>
                        <p className="text-sm text-gray-500">Take a photo or screenshot of the product</p>
                      </div>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={newWant.product_name}
                    onChange={(e) => setNewWant(prev => ({ ...prev, product_name: e.target.value }))}
                    placeholder="e.g., Stanley 40oz Tumbler Dupe"
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <textarea
                    value={newWant.description}
                    onChange={(e) => setNewWant(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Any specific features or details..."
                    rows={2}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newWant.category}
                    onChange={(e) => setNewWant(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option>General</option>
                    <option>Drinkware</option>
                    <option>Electronics</option>
                    <option>Beauty</option>
                    <option>Home</option>
                    <option>Fashion</option>
                    <option>Fitness</option>
                    <option>Kitchen</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What would you pay? (R)</label>
                    <input
                      type="number"
                      min="0"
                      value={newWant.price_willing}
                      onChange={(e) => setNewWant(prev => ({ ...prev, price_willing: e.target.value }))}
                      placeholder="e.g. 150"
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">How often?</label>
                    <select
                      value={newWant.buy_frequency}
                      onChange={(e) => setNewWant(prev => ({ ...prev, buy_frequency: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">—</option>
                      <option value="once">Once-off</option>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your area / suburb</label>
                  <input
                    type="text"
                    value={newWant.suburb}
                    onChange={(e) => setNewWant(prev => ({ ...prev, suburb: e.target.value }))}
                    placeholder="e.g. Soweto, Sandton, Khayelitsha"
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Helps us send stock to a distributor near you.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
                  <input
                    type="email"
                    value={newWant.email}
                    onChange={(e) => setNewWant(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">We&apos;ll notify you when it&apos;s sourced + you get it FREE!</p>
                </div>

                {submitMessage?.type === 'error' && (
                  <p className="text-sm text-red-600">{submitMessage.text}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting || uploadingImage ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {uploadingImage ? 'Uploading image...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Create Want
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
