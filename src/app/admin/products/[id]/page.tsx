'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles, Check, X, Scan, Star, Wand2, Trash2, ZoomIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category, Product } from '@/types/database';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [translating, setTranslating] = useState<string | null>(null);
  const [originalTitle, setOriginalTitle] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<any>(null);
  const [enhancing, setEnhancing] = useState<number | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    costPrice: '',
    sellingPrice: '',
    compareAtPrice: '',
    quantity: '0',
    imageUrl: '',
    status: 'draft' as 'draft' | 'active' | 'out_of_stock' | 'discontinued',
    source1688Url: '',
    source1688ItemId: '',
    source1688SupplierName: '',
    source1688PriceCNY: '',
  });

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      try {
        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('name');
        if (cats) setCategories(cats);

        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error || !product) {
          setNotFound(true);
          return;
        }

        const source1688Data = product.source_1688_data || {};

        // Load images array
        if (product.images && Array.isArray(product.images)) {
          setImages(product.images);
        } else if (product.primary_image_url) {
          setImages([product.primary_image_url]);
        }

        // Save original title for translation reference
        setOriginalTitle(source1688Data?.titleOriginal || product.name || '');

        setForm({
          name: product.name || '',
          slug: product.slug || '',
          shortDescription: product.short_description || '',
          description: product.description || '',
          categoryId: product.category_id || '',
          costPrice: product.cost_price_cents ? (product.cost_price_cents / 100).toString() : '0',
          sellingPrice: product.selling_price_cents ? (product.selling_price_cents / 100).toString() : '0',
          compareAtPrice: product.compare_at_price_cents ? (product.compare_at_price_cents / 100).toString() : '',
          quantity: product.quantity?.toString() || '0',
          imageUrl: product.primary_image_url || '',
          status: product.status || 'draft',
          source1688Url: product.source_1688_url || '',
          source1688ItemId: product.source_1688_item_id || '',
          source1688SupplierName: source1688Data?.supplierName || '',
          source1688PriceCNY: source1688Data?.priceCNY || '',
        });
      } catch (error) {
        console.error('Error loading product:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  const handleNameChange = (name: string) => {
    setForm({
      ...form,
      name,
      slug: slugify(name),
    });
  };

  const handleTranslate = async (field: 'title' | 'description') => {
    const text = field === 'title' ? (originalTitle || form.name) : form.description;
    if (!text) return;
    
    setTranslating(field);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type: field }),
      });
      const data = await res.json();
      if (data.success && data.translation) {
        if (field === 'title') {
          handleNameChange(data.translation);
        } else {
          setForm({ ...form, description: data.translation });
        }
      } else {
        alert(data.error || 'Translation failed');
      }
    } catch (error) {
      alert('Translation failed');
    }
    setTranslating(null);
  };

  const selectImage = (url: string) => {
    setForm({ ...form, imageUrl: url });
  };

  const deleteImage = (index: number) => {
    const imageToDelete = images[index];
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    // If the deleted image was selected, clear selection or select first available
    if (form.imageUrl === imageToDelete) {
      setForm({ ...form, imageUrl: newImages[0] || '' });
    }
    
    // Clear analysis since indices changed
    setImageAnalysis(null);
  };

  const analyzeImages = async () => {
    if (images.length === 0) return;
    setAnalyzing(true);
    setImageAnalysis(null);
    
    try {
      const res = await fetch('/api/images/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: images }),
      });
      const data = await res.json();
      
      if (data.success) {
        setImageAnalysis(data);
        // Auto-select the best image
        if (data.bestImageIndex !== undefined && images[data.bestImageIndex]) {
          setForm({ ...form, imageUrl: images[data.bestImageIndex] });
        }
      } else {
        alert(data.error || 'Analysis failed');
      }
    } catch (error) {
      alert('Analysis failed');
    }
    setAnalyzing(false);
  };

  const enhanceImage = async (imageUrl: string, index: number) => {
    setEnhancing(index);
    try {
      const res = await fetch('/api/images/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, productId }),
      });
      const data = await res.json();
      
      if (data.success && data.enhancedUrl && data.wasEnhanced) {
        // Replace the image in the array
        const newImages = [...images];
        newImages[index] = data.enhancedUrl;
        setImages(newImages);
        // If this was the selected image, update it
        if (form.imageUrl === imageUrl) {
          setForm({ ...form, imageUrl: data.enhancedUrl });
        }
        alert(`✅ Enhanced! ${data.analysis?.featuresCount || 0} features translated.`);
      } else {
        alert(data.message || 'No text to enhance - image is clean!');
      }
    } catch (error) {
      alert('Enhancement failed');
    }
    setEnhancing(null);
  };

  // NEW: Replace Chinese text with English directly on image
  const replaceTextInImage = async (imageUrl: string, index: number) => {
    setEnhancing(index); // Reuse enhancing state for loading
    try {
      const res = await fetch('/api/images/replace-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, productId }),
      });
      const data = await res.json();
      
      if (data.success && data.enhancedUrl && data.wasEnhanced) {
        const newImages = [...images];
        newImages[index] = data.enhancedUrl;
        setImages(newImages);
        if (form.imageUrl === imageUrl) {
          setForm({ ...form, imageUrl: data.enhancedUrl });
        }
        alert(`✅ Replaced ${data.regionsReplaced} text region(s) with English!`);
      } else {
        alert(data.message || 'No text to replace - image is clean!');
      }
    } catch (error) {
      alert('Text replacement failed');
    }
    setEnhancing(null);
  };

  const enhanceAllImages = async () => {
    if (!imageAnalysis?.analyses) return;
    const textImages = imageAnalysis.analyses.filter((a: any) => !a.isClean);
    
    if (textImages.length === 0) {
      alert('All images are already clean!');
      return;
    }

    setBatchProgress({ current: 0, total: textImages.length });
    
    let successCount = 0;
    for (let i = 0; i < textImages.length; i++) {
      const analysis = textImages[i];
      setBatchProgress({ current: i + 1, total: textImages.length });
      
      try {
        const res = await fetch('/api/images/enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: images[analysis.index], productId }),
        });
        const data = await res.json();
        
        if (data.success && data.enhancedUrl && data.wasEnhanced) {
          const newImages = [...images];
          newImages[analysis.index] = data.enhancedUrl;
          setImages(newImages);
          if (form.imageUrl === images[analysis.index]) {
            setForm({ ...form, imageUrl: data.enhancedUrl });
          }
          successCount++;
        }
      } catch (error) {
        console.error(`Failed to enhance image ${analysis.index}:`, error);
      }
    }
    
    setBatchProgress(null);
    alert(`✅ Batch complete! Enhanced ${successCount} of ${textImages.length} images.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const supabase = createClient();

      const source1688Data = form.source1688SupplierName || form.source1688PriceCNY 
        ? {
            supplierName: form.source1688SupplierName || null,
            priceCNY: form.source1688PriceCNY ? parseFloat(form.source1688PriceCNY) : null,
            lastUpdated: new Date().toISOString(),
          }
        : null;

      const { error } = await supabase
        .from('products')
        .update({
          name: form.name,
          slug: form.slug,
          short_description: form.shortDescription || null,
          description: form.description || null,
          category_id: form.categoryId || null,
          cost_price_cents: Math.round(parseFloat(form.costPrice || '0') * 100),
          selling_price_cents: Math.round(parseFloat(form.sellingPrice || '0') * 100),
          compare_at_price_cents: form.compareAtPrice
            ? Math.round(parseFloat(form.compareAtPrice) * 100)
            : null,
          quantity: parseInt(form.quantity || '0', 10),
          primary_image_url: form.imageUrl || null,
          images: images, // Save the updated images array
          status: form.status,
          source_1688_url: form.source1688Url || null,
          source_1688_item_id: form.source1688ItemId || null,
          source_1688_data: source1688Data,
        })
        .eq('id', productId);

      if (error) throw error;

      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-jeffy-orange mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
        <Link href="/admin/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Link>

      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <div className="flex gap-2">
              <Input
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Wireless Bluetooth Earbuds"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => handleTranslate('title')}
                disabled={translating === 'title'}
                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 flex items-center gap-1"
                title="AI Translate to English"
              >
                {translating === 'title' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Translate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="wireless-bluetooth-earbuds"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <Input
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              placeholder="Brief product summary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Description</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => handleTranslate('description')}
                disabled={translating === 'description'}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 flex items-center gap-1 text-sm"
              >
                {translating === 'description' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                AI Translate & Beautify
              </button>
            </div>
            <textarea
              className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed product description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="w-full h-10 border rounded-lg px-3"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Pricing</h2>

          {/* Price Calculator Helper */}
          {form.source1688PriceCNY && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <span className="font-medium">1688 Price:</span> ¥{form.source1688PriceCNY} CNY
              <span className="mx-2">→</span>
              <span className="font-medium">Suggested:</span> R{Math.ceil(((parseFloat(form.source1688PriceCNY) * 3.2 + 75) * 2.5) / 5) * 5}
              <span className="text-gray-500 ml-2">(2.5x markup + R75 shipping)</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cost Price (R) *</label>
              <Input
                type="number"
                step="0.01"
                required
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Selling Price (R) *</label>
              <Input
                type="number"
                step="0.01"
                required
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare At Price (R)</label>
              <Input
                type="number"
                step="0.01"
                value={form.compareAtPrice}
                onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Inventory</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
            <Input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Media</h2>
            <div className="flex gap-2">
              {images.length > 0 && (
                <button
                  type="button"
                  onClick={analyzeImages}
                  disabled={analyzing}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
                  {analyzing ? 'Analyzing...' : 'AI Analyze'}
                </button>
              )}
              {imageAnalysis?.summary?.imagesWithChineseText > 0 && (
                <button
                  type="button"
                  onClick={enhanceAllImages}
                  disabled={enhancing !== null || batchProgress !== null}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {batchProgress ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {batchProgress.current}/{batchProgress.total}
                    </>
                  ) : enhancing !== null ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {batchProgress ? 'Enhancing...' : 'Enhance All'}
                </button>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          {imageAnalysis && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-800 font-medium">
                <Scan className="h-4 w-4" />
                Analysis Complete
              </div>
              <div className="text-sm text-blue-700">
                {imageAnalysis.summary.cleanImages} of {imageAnalysis.summary.totalAnalyzed} images are clean. 
                {imageAnalysis.summary.imagesWithChineseText > 0 && 
                  ` ${imageAnalysis.summary.imagesWithChineseText} have Chinese text.`}
              </div>
              {imageAnalysis.analyses.map((a: any, idx: number) => (
                a.chineseTextFound?.length > 0 && (
                  <div key={idx} className="text-xs bg-white rounded p-2">
                    <span className="font-medium">Image {a.index + 1}:</span>
                    {a.chineseTextFound.map((text: string, i: number) => (
                      <div key={i} className="ml-2">
                        "{text}" → <span className="text-green-700">{a.englishTranslations?.[i] || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Image Gallery */}
          {images.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Available Images (click to select)</label>
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => {
                  const analysis = imageAnalysis?.analyses?.find((a: any) => a.index === idx);
                  const isBest = imageAnalysis?.bestImageIndex === idx;
                  const hasText = analysis && !analysis.isClean;
                  return (
                    <div key={idx} className="relative group">
                      <button
                        type="button"
                        onClick={() => selectImage(img)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 w-full ${
                          form.imageUrl === img ? 'border-jeffy-orange ring-2 ring-jeffy-orange' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                        {form.imageUrl === img && (
                          <div className="absolute top-1 right-1 bg-jeffy-orange text-white rounded-full p-0.5">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        {isBest && (
                          <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-0.5" title="Recommended">
                            <Star className="h-3 w-3" />
                          </div>
                        )}
                        {analysis && (
                          <div className={`absolute bottom-0 left-0 right-0 text-[10px] px-1 py-0.5 text-center ${
                            analysis.isClean ? 'bg-green-500/80 text-white' : 'bg-orange-500/80 text-white'
                          }`}>
                            {analysis.textAmount}
                          </div>
                        )}
                      </button>
                      {/* Zoom button - shows on hover */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setZoomImage(img); }}
                        className="absolute top-1 left-1 p-1 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 z-20"
                        title="Zoom image"
                      >
                        <ZoomIn className="h-3 w-3" />
                      </button>
                      {/* Delete button - shows on hover */}
                      <button
                        type="button"
                        onClick={() => deleteImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                        title="Remove image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      {hasText && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                          <button
                            type="button"
                            onClick={() => replaceTextInImage(img, idx)}
                            disabled={enhancing === idx}
                            className="px-2 py-0.5 bg-green-600 text-white text-[10px] rounded-full hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
                            title="Replace Chinese text with English directly on image"
                          >
                            {enhancing === idx ? '...' : '🔄 Replace'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Image Preview */}
          {form.imageUrl && (
            <div>
              <label className="block text-sm font-medium mb-2">Selected Image</label>
              <div className="w-48 h-48 rounded-lg overflow-hidden border bg-gray-100">
                <img src={form.imageUrl} alt="Selected" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <Input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Select from gallery above or enter a direct URL
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Status</h2>

          <div>
            <select
              className="w-full h-10 border rounded-lg px-3"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl border border-orange-200 p-6 space-y-4">
          <h2 className="font-semibold text-orange-900">1688 Supplier Information</h2>
          <p className="text-sm text-orange-700">
            This information helps the agent find and restock the product
          </p>

          <div>
            <label className="block text-sm font-medium mb-1">1688 Product URL</label>
            <Input
              type="url"
              value={form.source1688Url}
              onChange={(e) => setForm({ ...form, source1688Url: e.target.value })}
              placeholder="https://1688.com/offer/xxxxx.html"
            />
            <p className="text-xs text-gray-500 mt-1">
              Direct link to the product on 1688.com
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">1688 Item ID</label>
            <Input
              value={form.source1688ItemId}
              onChange={(e) => setForm({ ...form, source1688ItemId: e.target.value })}
              placeholder="e.g., 123456789"
            />
            <p className="text-xs text-gray-500 mt-1">
              The product ID from the 1688 URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Supplier Name</label>
            <Input
              value={form.source1688SupplierName}
              onChange={(e) => setForm({ ...form, source1688SupplierName: e.target.value })}
              placeholder="e.g., Shanghai Tech Manufacturing"
            />
            <p className="text-xs text-gray-500 mt-1">
              The name of the supplier on 1688
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Unit Price (CNY)</label>
            <Input
              type="number"
              step="0.01"
              value={form.source1688PriceCNY}
              onChange={(e) => setForm({ ...form, source1688PriceCNY: e.target.value })}
              placeholder="45.50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Price per unit in Chinese Yuan (used for cost analysis)
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      {/* Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            onClick={() => setZoomImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <img 
            src={zoomImage} 
            alt="Zoomed" 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}


