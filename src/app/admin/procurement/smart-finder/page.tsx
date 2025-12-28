'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { calculateImportCosts, formatZAR, detectCategory } from '@/lib/import-calculator';

interface ProductImage {
  id: string;
  url: string;
  selected: boolean;
}

interface GeneratedProduct {
  title: string;
  description: string;
  shortDescription: string;
  tags: string[];
  category: string;
  extractedText?: string;
}

export default function SmartFinderPage() {
  // Form state
  const [productUrl, setProductUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [priceCNY, setPriceCNY] = useState<number>(0);
  const [supplierName, setSupplierName] = useState('');
  const [moq, setMoq] = useState<number>(1);
  
  // Images state
  const [images, setImages] = useState<ProductImage[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  
  // AI generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProduct, setGeneratedProduct] = useState<GeneratedProduct | null>(null);
  
  // Editable fields after generation
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editShortDescription, setEditShortDescription] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  
  // Categories
  const [categories, setCategories] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Costs
  const [costs, setCosts] = useState<any>(null);

  // Load categories on mount
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

  // Add image from URL
  const addImageFromUrl = () => {
    if (!imageUrlInput.trim()) return;
    
    const newImage: ProductImage = {
      id: Date.now().toString(),
      url: imageUrlInput.trim(),
      selected: true,
    };
    
    setImages([...images, newImage]);
    setImageUrlInput('');
  };

  // Handle files selected
  const handleFilesSelected = async (files: File[]) => {
    for (const file of files) {
      // Convert to base64 for preview and AI analysis
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newImage: ProductImage = {
          id: Date.now().toString() + Math.random(),
          url: base64,
          selected: true,
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle image selection
  const toggleImageSelection = (id: string) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, selected: !img.selected } : img
    ));
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  // Generate product with AI
  const generateProduct = async () => {
    if (!productName && images.length === 0) {
      alert('Please add a product name or at least one image');
      return;
    }

    setIsGenerating(true);
    
    try {
      const selectedImages = images.filter(img => img.selected);
      
      const response = await fetch('/api/smart-finder/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          priceCNY,
          supplierName,
          images: selectedImages.map(img => img.url),
          url: productUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate product');
      }

      const data = await response.json();
      setGeneratedProduct(data);
      
      // Calculate costs
      const category = detectCategory(data.title || productName);
      const calculatedCosts = calculateImportCosts({
        productPriceCNY: priceCNY,
        category,
      });
      setCosts(calculatedCosts);
      
      // Set editable fields
      setEditTitle(data.title || productName);
      setEditDescription(data.description || '');
      setEditShortDescription(data.shortDescription || '');
      setEditPrice(calculatedCosts.suggestedRetailPrice);
      setEditTags(data.tags || []);
      
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate product. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save to store
  const saveToStore = async () => {
    if (!editTitle || editPrice <= 0) {
      alert('Please enter a title and price');
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();
      const selectedImages = images.filter(img => img.selected).map(img => img.url);
      
      // Generate slug from title
      const slug = editTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now().toString(36);

      // Create the product with correct column names
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          name: editTitle,
          slug: editTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            + '-' + Date.now().toString(36),
          description: editDescription || '',
          short_description: editShortDescription || '',
          selling_price_cents: Math.round(editPrice * 100),
          cost_price_cents: Math.round((costs?.totalLandedCost || priceCNY * 3.2) * 100) || 100,
          compare_at_price_cents: Math.round(editPrice * 1.3 * 100),
          category_id: selectedCategoryId || null,
          quantity: 100,
          status: 'active',
          tags: editTags || [],
          primary_image_url: images.filter(img => img.selected)[0]?.url || null,
          images: images.filter(img => img.selected).map(img => img.url) || [],
          source_1688_url: productUrl || null,
          source_1688_data: {
            supplierName: supplierName || '',
            priceCNY: priceCNY || 0,
            moq: moq || 1,
            importedAt: new Date().toISOString(),
          },
          metadata: {
            costs: costs || {},
          },
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Create procurement record for agent
      await supabase.from('procurement_orders').insert({
        product_id: product.id,
        supplier_name: supplierName,
        supplier_url: productUrl,
        unit_cost_cny: priceCNY,
        unit_cost_zar: costs?.productCostZAR || 0,
        quantity: 0,
        total_cost_zar: 0,
        status: 'active',
        notes: `MOQ: ${moq}`,
      });

      alert('🎉 Product added to store! The 1688 link is saved for your agent.');
      
      // Reset form
      setProductUrl('');
      setProductName('');
      setPriceCNY(0);
      setSupplierName('');
      setMoq(1);
      setImages([]);
      setGeneratedProduct(null);
      setCosts(null);
      setEditTitle('');
      setEditDescription('');
      setEditShortDescription('');
      setEditPrice(0);
      setEditTags([]);
      
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">📦</span>
            Smart Product Importer
          </h1>
          <p className="text-gray-500 mt-2">
            Paste a 1688 link, add images, and AI creates your product listing
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Product Link */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold">1</span>
                Product Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    1688 Product URL *
                  </label>
                  <input
                    type="text"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://detail.1688.com/offer/123456789.html"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Professional Compound Bow"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (¥ CNY) *
                    </label>
                    <input
                      type="number"
                      value={priceCNY || ''}
                      onChange={(e) => setPriceCNY(Number(e.target.value))}
                      placeholder="693"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MOQ
                    </label>
                    <input
                      type="number"
                      value={moq || ''}
                      onChange={(e) => setMoq(Number(e.target.value))}
                      placeholder="1"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g., Junxing Archery Co."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold">2</span>
                Product Images
              </h2>
              
              <p className="text-sm text-gray-500 mb-4">
                Right-click images on 1688 → "Copy image address" → Paste here. AI will read any Chinese text in images.
              </p>

              {/* Add image from URL */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addImageFromUrl()}
                  placeholder="Paste image URL here..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={addImageFromUrl}
                  type="button"
                  className="px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium"
                >
                  Add
                </button>
              </div>

              {/* Or upload */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Drag and drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    handleFilesSelected(Array.from(files));
                  }
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                      handleFilesSelected(Array.from(files));
                    }
                  };
                  input.click();
                }}
                className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Drop images here or click to upload</span>
                <span className="text-xs text-gray-400">PNG, JPG up to 10MB</span>
              </div>

              {/* Image Grid */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        img.selected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
                      }`}
                      onClick={() => toggleImageSelection(img.id)}
                    >
                      <img
                        src={img.url}
                        alt="Product"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.png';
                        }}
                      />
                      {img.selected && (
                        <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Click images to select/deselect. Selected images will be used for the product.
                </p>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateProduct}
              disabled={isGenerating || (!productName && images.length === 0)}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-3 shadow-lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  AI is working its magic...
                </>
              ) : (
                <>
                  <span className="text-2xl">✨</span>
                  Generate Product Listing
                </>
              )}
            </button>
          </div>

          {/* Right Column - Preview & Edit */}
          <div className="space-y-6">
            {!generatedProduct && !isGenerating && (
              <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Product Preview</h3>
                <p className="text-gray-500 text-sm">
                  Fill in the product details on the left and click "Generate" to see your AI-created listing here.
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI is creating your listing...</h3>
                <p className="text-gray-500 text-sm">
                  Analyzing images, writing description, optimizing for SEO...
                </p>
              </div>
            )}

            {generatedProduct && !isGenerating && (
              <>
                {/* Cost Breakdown */}
                {costs && (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-5">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span>💰</span> Import Cost Breakdown
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-gray-500 text-xs">Product Cost</p>
                        <p className="font-semibold">{formatZAR(costs.productCostZAR)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-gray-500 text-xs">Shipping</p>
                        <p className="font-semibold">{formatZAR(costs.shippingZAR)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-gray-500 text-xs">Duty ({(costs.customsDutyRate * 100).toFixed(0)}%)</p>
                        <p className="font-semibold">{formatZAR(costs.customsDutyZAR)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-gray-500 text-xs">VAT (15%)</p>
                        <p className="font-semibold">{formatZAR(costs.vatZAR)}</p>
                      </div>
                      <div className="bg-orange-100 rounded-lg p-3">
                        <p className="text-orange-700 text-xs font-medium">Total Landed Cost</p>
                        <p className="font-bold text-orange-700">{formatZAR(costs.totalLandedCost)}</p>
                      </div>
                      <div className="bg-green-100 rounded-lg p-3">
                        <p className="text-green-700 text-xs font-medium">Suggested Price</p>
                        <p className="font-bold text-green-700">{formatZAR(costs.suggestedRetailPrice)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Editable Product Details */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>✏️</span> Edit Product Listing
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={editShortDescription}
                        onChange={(e) => setEditShortDescription(e.target.value)}
                        maxLength={150}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Description
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Selling Price (ZAR)
                        </label>
                        <input
                          type="number"
                          value={editPrice || ''}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                        />
                        {costs && editPrice < costs.totalLandedCost && (
                          <p className="text-red-500 text-xs mt-1">⚠️ Below landed cost!</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={selectedCategoryId}
                          onChange={(e) => setSelectedCategoryId(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Select...</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={editTags.join(', ')}
                        onChange={(e) => setEditTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Extracted Text (if any) */}
                    {generatedProduct.extractedText && (
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-xs font-medium text-blue-700 mb-1">📝 Text extracted from images:</p>
                        <p className="text-sm text-blue-800">{generatedProduct.extractedText}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={saveToStore}
                  disabled={isSaving || !editTitle || editPrice <= 0}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-3 shadow-lg"
                >
                  {isSaving ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">🚀</span>
                      Add to Store
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Product will go live on your store. The 1688 link will be saved for your agent.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
