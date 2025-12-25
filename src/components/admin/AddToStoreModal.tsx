'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatZAR } from '@/lib/import-calculator';

interface ProductSource {
  url: string;
  platform: string;
  supplierName: string;
  supplierRating: number;
  originalTitle: string;
  moq: number;
  sales30d: number;
}

interface ProductPricing {
  costCNY: number;
  costZAR: number;
  shippingZAR: number;
  customsDutyZAR: number;
  customsDutyRate: string;
  vatZAR: number;
  vatRate: string;
  customsClearanceFee: number;
  totalLandedCost: number;
  suggestedRetailPrice: number;
  profitMargin: string;
  grossProfit: number;
  platformFee: number;
  partnerShare: number;
  netProfit: number;
}

interface GeneratedProduct {
  title: string;
  description: string;
  shortDescription: string;
  tags: string[];
  suggestedCategory: string;
  source: ProductSource;
  pricing: ProductPricing;
  images: string[];
}

interface AddToStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  productInput: {
    url: string;
    titleChinese?: string;
    titleEnglish?: string;
    priceCNY: number;
    moq: number;
    sales30d: number;
    supplierName: string;
    rating: number;
    images?: string[];
  };
  onSuccess?: () => void;
}

export default function AddToStoreModal({ 
  isOpen, 
  onClose, 
  productInput,
  onSuccess 
}: AddToStoreModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedProduct, setGeneratedProduct] = useState<GeneratedProduct | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Editable fields
  const [editableData, setEditableData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    compareAtPrice: 0,
    categoryId: '',
    tags: [] as string[],
    sku: '',
    stock: 100,
    isActive: true,
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  // Generate product when modal opens
  useEffect(() => {
    if (isOpen && productInput) {
      generateProduct();
    }
  }, [isOpen, productInput]);

  const generateProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/product/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productInput),
      });

      if (!response.ok) {
        throw new Error('Failed to generate product');
      }

      const data: GeneratedProduct = await response.json();
      setGeneratedProduct(data);
      
      // Set editable fields with generated data
      setEditableData({
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.pricing.suggestedRetailPrice,
        compareAtPrice: Math.round(data.pricing.suggestedRetailPrice * 1.3), // Show "was" price
        categoryId: '',
        tags: data.tags,
        sku: `JEF-${Date.now().toString(36).toUpperCase()}`,
        stock: 100,
        isActive: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToStore = async () => {
    if (!generatedProduct) return;
    
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      // Create the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: editableData.title,
          description: editableData.description,
          short_description: editableData.shortDescription,
          price: editableData.price,
          compare_at_price: editableData.compareAtPrice,
          category_id: editableData.categoryId || null,
          sku: editableData.sku,
          stock_quantity: editableData.stock,
          is_active: editableData.isActive,
          tags: editableData.tags,
          // Store source info in metadata
          metadata: {
            source: generatedProduct.source,
            pricing: generatedProduct.pricing,
            importedAt: new Date().toISOString(),
          },
          // Use first image or placeholder
          image_url: generatedProduct.images?.[0] || '/placeholder-product.png',
          images: generatedProduct.images || [],
        })
        .select()
        .single();

      if (productError) throw productError;

      // Also create a procurement record for tracking
      await supabase.from('procurement_orders').insert({
        product_id: product.id,
        supplier_name: generatedProduct.source.supplierName,
        supplier_url: generatedProduct.source.url,
        unit_cost_cny: generatedProduct.pricing.costCNY,
        unit_cost_zar: generatedProduct.pricing.costZAR,
        quantity: editableData.stock,
        total_cost_zar: generatedProduct.pricing.totalLandedCost * editableData.stock,
        status: 'pending',
        notes: `MOQ: ${generatedProduct.source.moq}, 30d Sales: ${generatedProduct.source.sales30d}`,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add to Store</h2>
            <p className="text-sm text-gray-500">AI-generated product listing • Edit before saving</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">AI is generating your product listing...</p>
              <p className="text-sm text-gray-400 mt-2">Calculating import costs & writing description</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button 
                onClick={generateProduct}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Try Again
              </button>
            </div>
          ) : generatedProduct ? (
            <div className="space-y-6">
              {/* Cost Breakdown Card */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">💰</span> Import Cost Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Product Cost</p>
                    <p className="font-semibold">{formatZAR(generatedProduct.pricing.costZAR)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Shipping</p>
                    <p className="font-semibold">{formatZAR(generatedProduct.pricing.shippingZAR)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Customs Duty ({generatedProduct.pricing.customsDutyRate})</p>
                    <p className="font-semibold">{formatZAR(generatedProduct.pricing.customsDutyZAR)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">VAT ({generatedProduct.pricing.vatRate})</p>
                    <p className="font-semibold">{formatZAR(generatedProduct.pricing.vatZAR)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Clearance Fee</p>
                    <p className="font-semibold">{formatZAR(generatedProduct.pricing.customsClearanceFee)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 -m-1">
                    <p className="text-gray-500">Total Landed Cost</p>
                    <p className="font-bold text-lg text-orange-600">{formatZAR(generatedProduct.pricing.totalLandedCost)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 -m-1">
                    <p className="text-gray-500">Suggested Price</p>
                    <p className="font-bold text-lg text-green-600">{formatZAR(generatedProduct.pricing.suggestedRetailPrice)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Profit Margin</p>
                    <p className="font-bold text-green-600">{generatedProduct.pricing.profitMargin}</p>
                  </div>
                </div>
                
                {/* Profit Split */}
                <div className="mt-4 pt-4 border-t border-orange-200">
                  <p className="text-xs text-gray-500 mb-2">Profit Split (per sale)</p>
                  <div className="flex gap-4 text-sm">
                    <div className="flex-1 bg-white rounded-lg p-2 text-center">
                      <p className="text-gray-500 text-xs">Platform Fee</p>
                      <p className="font-semibold text-orange-600">{formatZAR(generatedProduct.pricing.platformFee)}</p>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-2 text-center">
                      <p className="text-gray-500 text-xs">Partner Share</p>
                      <p className="font-semibold text-blue-600">{formatZAR(generatedProduct.pricing.partnerShare)}</p>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-2 text-center">
                      <p className="text-gray-500 text-xs">Your Profit</p>
                      <p className="font-semibold text-green-600">{formatZAR(generatedProduct.pricing.netProfit)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Product Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      value={editableData.title}
                      onChange={(e) => setEditableData({ ...editableData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={editableData.shortDescription}
                      onChange={(e) => setEditableData({ ...editableData, shortDescription: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      maxLength={150}
                    />
                    <p className="text-xs text-gray-400 mt-1">{editableData.shortDescription.length}/150</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Description
                    </label>
                    <textarea
                      value={editableData.description}
                      onChange={(e) => setEditableData({ ...editableData, description: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={editableData.tags.join(', ')}
                      onChange={(e) => setEditableData({ 
                        ...editableData, 
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Right Column - Pricing & Settings */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selling Price (ZAR) *
                      </label>
                      <input
                        type="number"
                        value={editableData.price}
                        onChange={(e) => setEditableData({ ...editableData, price: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Compare at Price
                      </label>
                      <input
                        type="number"
                        value={editableData.compareAtPrice}
                        onChange={(e) => setEditableData({ ...editableData, compareAtPrice: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Real-time margin calculator */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Your margin at {formatZAR(editableData.price)}:</span>
                      <span className={`font-bold ${
                        editableData.price > generatedProduct.pricing.totalLandedCost 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatZAR(editableData.price - generatedProduct.pricing.totalLandedCost)} 
                        ({((editableData.price - generatedProduct.pricing.totalLandedCost) / editableData.price * 100).toFixed(0)}%)
                      </span>
                    </div>
                    {editableData.price < generatedProduct.pricing.totalLandedCost && (
                      <p className="text-red-500 text-xs mt-1">⚠️ Price below landed cost!</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editableData.categoryId}
                      onChange={(e) => setEditableData({ ...editableData, categoryId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select category...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">AI suggested: {generatedProduct.suggestedCategory}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={editableData.sku}
                        onChange={(e) => setEditableData({ ...editableData, sku: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Initial Stock
                      </label>
                      <input
                        type="number"
                        value={editableData.stock}
                        onChange={(e) => setEditableData({ ...editableData, stock: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editableData.isActive}
                      onChange={(e) => setEditableData({ ...editableData, isActive: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Publish immediately (visible in store)
                    </label>
                  </div>

                  {/* Source Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Source Information</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Supplier: {generatedProduct.source.supplierName} ⭐ {generatedProduct.source.supplierRating}</p>
                      <p>MOQ: {generatedProduct.source.moq} units • 30d Sales: {generatedProduct.source.sales30d}</p>
                      <a 
                        href={generatedProduct.source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline"
                      >
                        View on 1688 →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {!loading && !error && generatedProduct && (
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between items-center rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              <button
                onClick={generateProduct}
                className="px-6 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 font-medium"
              >
                🔄 Regenerate
              </button>
              <button
                onClick={handleSaveToStore}
                disabled={saving || !editableData.title || editableData.price <= 0}
                className="px-8 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    Add to Store
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



