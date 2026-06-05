'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Gift, Truck, CreditCard, RotateCcw, Users } from 'lucide-react';
import Link from 'next/link';

const faqCategories = [
  {
    name: 'Jeffy Wish List',
    icon: Gift,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    questions: [
      { q: 'How does the Jeffy Wish List work?', a: 'Add a wish for any product you want — no purchase, no catch, ten seconds. Every week Jeffy draws winners completely at random and grants their wish free. Every wish you add is one entry into the draw.' },
      { q: 'How do I get something free?', a: 'Each week Jeffy draws winners at random from all eligible wishes — every winner gets their wish sourced and delivered free, and is celebrated on the radio, in the paper, and across social media. See the draw rules at /wish-list-rules.' },
      { q: 'Do I need to share my wish or get other people to sign up?', a: 'No. There is nothing to share and no one to convince. Just add your wish — each one is its own entry in the weekly random draw. Your wishes also tell us what to stock, so the shop fills with what people actually want.' },
      { q: 'Can I add multiple wishes?', a: 'Yes! Wish for up to ten things at a time — each is another entry in the weekly draw. You can have one active wish per product at a time.' },
    ],
  },
  {
    name: 'Orders & Delivery',
    icon: Truck,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    questions: [
      { q: 'How long does delivery take?', a: 'Local reseller delivery is usually 1-3 days once the product is in stock near you.' },
      { q: 'Do you deliver to my area?', a: 'We deliver across South Africa through our network of independent local resellers. Check at checkout if delivery is available.' },
      { q: 'How can I track my order?', a: 'Use the Track Order page with your order number and phone number.' },
    ],
  },
  {
    name: 'Payments',
    icon: CreditCard,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    questions: [
      { q: 'What payment methods do you accept?', a: 'Card payments (Visa, Mastercard, AMEX), Instant EFT through Ozow, and manual bank transfers.' },
      { q: 'Is it safe to pay online?', a: 'Yes! We use secure payment gateways and never store your card details.' },
      { q: 'Do you have discount codes?', a: 'Yes! Enter your code at checkout. Follow us on social media for the latest deals.' },
    ],
  },
  {
    name: 'Returns & Refunds',
    icon: RotateCcw,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    questions: [
      { q: 'What is your return policy?', a: 'Return most items within 14 days if unused and in original packaging.' },
      { q: 'What if my item arrives damaged?', a: 'Contact us immediately with photos. We\'ll arrange a replacement or full refund.' },
    ],
  },
  {
    name: 'Resellers',
    icon: Users,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    questions: [
      { q: 'How do I become a Jeffy reseller?', a: 'Apply through our reseller page (Become a Reseller). You buy stock at wholesale and keep the retail margin — you run it as your own independent business.' },
      { q: 'How does it work?', a: 'Resellers buy Jeffy stock at wholesale and resell at retail, keeping the margin. New resellers can start on credit and graduate to buying upfront as they grow.' },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0f172a] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <div className="max-w-lg mx-auto relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {filteredCategories.map((category) => (
          <div key={category.name} className="bg-white rounded-xl border overflow-hidden mb-6">
            <div className={`${category.bgColor} px-6 py-4 flex items-center gap-3`}>
              <category.icon className={`h-6 w-6 ${category.color}`} />
              <h2 className="font-bold text-lg">{category.name}</h2>
            </div>
            <div className="divide-y">
              {category.questions.map((item, idx) => {
                const itemId = `${category.name}-${idx}`;
                const isOpen = openItems.includes(itemId);
                return (
                  <div key={idx}>
                    <button onClick={() => toggleItem(itemId)} className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50">
                      <span className="font-medium pr-4">{item.q}</span>
                      {isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </button>
                    {isOpen && <div className="px-6 pb-4 text-gray-600">{item.a}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-8 text-center bg-white rounded-xl p-8 border">
          <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
          <p className="text-gray-600 mb-6">We're here to help!</p>
          <Link href="/contact">
            <button className="bg-[#ff6b35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600">Contact Us</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
