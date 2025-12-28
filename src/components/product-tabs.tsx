'use client';

import { useState } from 'react';
import { Package, FileText, HelpCircle, Star, MessageSquare, Ruler, Truck } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface ProductTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function ProductTabs({ tabs, defaultTab }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap border-b-2 transition ${
              activeTab === tab.id
                ? 'border-[#ff6b35] text-[#ff6b35] bg-orange-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeContent}
      </div>
    </div>
  );
}

// Pre-built product detail tabs
interface ProductDetailTabsProps {
  description: string;
  specifications?: Record<string, string>;
  shippingInfo?: string;
  returnPolicy?: string;
  reviewCount?: number;
  questionCount?: number;
  onReviewsClick?: () => void;
  onQuestionsClick?: () => void;
}

export function ProductDetailTabs({
  description,
  specifications,
  shippingInfo,
  returnPolicy,
  reviewCount = 0,
  questionCount = 0,
  onReviewsClick,
  onQuestionsClick
}: ProductDetailTabsProps) {
  const tabs: Tab[] = [
    {
      id: 'description',
      label: 'Description',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }} />
        </div>
      )
    },
    ...(specifications && Object.keys(specifications).length > 0 ? [{
      id: 'specifications',
      label: 'Specifications',
      icon: <Ruler className="h-4 w-4" />,
      content: (
        <table className="w-full">
          <tbody>
            {Object.entries(specifications).map(([key, value]) => (
              <tr key={key} className="border-b">
                <td className="py-3 pr-4 text-gray-600 font-medium w-1/3">{key}</td>
                <td className="py-3">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }] : []),
    {
      id: 'shipping',
      label: 'Shipping',
      icon: <Truck className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-[#ff6b35] mt-0.5" />
            <div>
              <h4 className="font-medium">Standard Delivery</h4>
              <p className="text-sm text-gray-600">3-5 business days • R65 or FREE over R500</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-[#ff6b35] mt-0.5" />
            <div>
              <h4 className="font-medium">Express Delivery</h4>
              <p className="text-sm text-gray-600">1-2 business days • R120</p>
            </div>
          </div>
          {shippingInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              {shippingInfo}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'returns',
      label: 'Returns',
      icon: <HelpCircle className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">✓</span>
            </div>
            <div>
              <h4 className="font-medium">30-Day Returns</h4>
              <p className="text-sm text-gray-600">
                Not happy with your purchase? Return it within 30 days for a full refund.
              </p>
            </div>
          </div>
          {returnPolicy && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              {returnPolicy}
            </div>
          )}
          <div className="text-sm text-gray-500">
            <p>• Items must be unused and in original packaging</p>
            <p>• Return shipping is free for defective items</p>
            <p>• Refunds processed within 5-7 business days</p>
          </div>
        </div>
      )
    },
    {
      id: 'reviews',
      label: `Reviews (${reviewCount})`,
      icon: <Star className="h-4 w-4" />,
      content: (
        <div className="text-center py-8">
          <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {reviewCount > 0 
              ? `See all ${reviewCount} reviews`
              : 'No reviews yet. Be the first to review!'
            }
          </p>
          <button
            onClick={onReviewsClick}
            className="text-[#ff6b35] font-medium hover:underline"
          >
            {reviewCount > 0 ? 'View All Reviews' : 'Write a Review'}
          </button>
        </div>
      )
    },
    {
      id: 'questions',
      label: `Q&A (${questionCount})`,
      icon: <MessageSquare className="h-4 w-4" />,
      content: (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {questionCount > 0 
              ? `${questionCount} questions answered`
              : 'Have a question about this product?'
            }
          </p>
          <button
            onClick={onQuestionsClick}
            className="text-[#ff6b35] font-medium hover:underline"
          >
            {questionCount > 0 ? 'View All Questions' : 'Ask a Question'}
          </button>
        </div>
      )
    }
  ];

  return <ProductTabs tabs={tabs} defaultTab="description" />;
}

// Vertical tabs for sidebar
export function VerticalTabs({ tabs, defaultTab }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const activeContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className="flex gap-6">
      {/* Tab List */}
      <div className="w-48 flex-shrink-0 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg text-left transition ${
              activeTab === tab.id
                ? 'bg-[#ff6b35] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 border rounded-xl p-6">
        {activeContent}
      </div>
    </div>
  );
}
