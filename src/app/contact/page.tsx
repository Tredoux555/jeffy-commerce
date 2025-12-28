'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSuccess(true);
    setLoading(false);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const whatsappNumber = '27123456789'; // Replace with actual number
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hi%20Jeffy%2C%20I%20have%20a%20question`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#0f172a] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Have a question or need help? We're here for you. Reach out and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-[#ff6b35]" />
                </div>
                <div>
                  <h3 className="font-bold">WhatsApp</h3>
                  <p className="text-sm text-gray-500">Fastest response</p>
                </div>
              </div>
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                Chat on WhatsApp
              </a>
            </div>

            <div className="bg-white rounded-xl p-6 border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold">Email</h3>
                  <a href="mailto:hello@jeffy.co.za" className="text-[#ff6b35] hover:underline">
                    hello@jeffy.co.za
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Phone className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold">Phone</h3>
                  <a href="tel:+27123456789" className="text-gray-600">
                    +27 12 345 6789
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold">Location</h3>
                  <p className="text-gray-600 text-sm">
                    Johannesburg, South Africa<br/>
                    Serving all of Mzansi 🇿🇦
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
              <h3 className="font-bold text-orange-800 mb-2">Business Hours</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>Monday - Friday: 8am - 6pm</li>
                <li>Saturday: 9am - 2pm</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 border">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              
              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-6">We'll get back to you as soon as possible.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="text-[#ff6b35] hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
                        placeholder="082 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject *</label>
                      <select
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none"
                      >
                        <option value="">Select a topic</option>
                        <option value="order">Order Inquiry</option>
                        <option value="product">Product Question</option>
                        <option value="delivery">Delivery Issue</option>
                        <option value="returns">Returns & Refunds</option>
                        <option value="wants">Jeffy Wants Program</option>
                        <option value="partner">Zone Partner Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ff6b35] text-white py-4 rounded-lg font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="h-5 w-5" /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className="mt-12 text-center bg-white rounded-xl p-8 border">
          <h2 className="text-xl font-bold mb-2">Looking for quick answers?</h2>
          <p className="text-gray-600 mb-4">Check out our frequently asked questions.</p>
          <Link href="/faq">
            <button className="bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg font-semibold transition">
              View FAQ →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
