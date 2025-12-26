'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="border rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
          >
            <span className="font-medium pr-4">{item.question}</span>
            <ChevronDown 
              className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${
                openIndex === index ? 'rotate-180' : ''
              }`} 
            />
          </button>
          {openIndex === index && (
            <div className="px-6 pb-4 text-gray-600">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Product page FAQ
export function ProductFAQ() {
  const defaultFAQs: FAQItem[] = [
    {
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 5-7 business days. Express delivery (2-3 days) and same-day delivery options are available at checkout.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for unused items in original packaging. Contact support@jeffy.co.za to initiate a return.'
    },
    {
      question: 'Is this product genuine?',
      answer: 'All products are sourced directly from verified manufacturers. We guarantee authenticity and quality.'
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes! Orders of 10+ units qualify for bulk pricing. Contact us for a custom quote.'
    },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
      <FAQAccordion items={defaultFAQs} />
    </div>
  );
}
