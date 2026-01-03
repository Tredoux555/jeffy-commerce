'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Check, X, Scan, Star, Trash2, ZoomIn, Upload, Plus, ImageIcon } from 'lucide-react';
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
  const [analyzing, setAnalyzing] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<any>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  
  // New states for enhanced media section
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
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

  const selectImage = (url: string) => {
    setForm({ ...form, imageUrl: url });
  };

  const deleteImage = (index: number) => {
    const imageToDelete = images[index];
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    if (form.imageUrl === imageToDelete) {
      setForm({ ...form, imageUrl: newImages[0] || '' });
    }
    
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

  // Add image from URL
  const addImageFromUrl = () => {
    if (!newImageUrl.trim()) return;
    
    try {
      new URL(newImageUrl);
    } catch {
      alert('Please enter a valid URL');
      return;
    }
    
    if (!images.includes(newImageUrl.trim())) {
      setImages([...images, newImageUrl.trim()]);
    }
    setNewImageUrl('');
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      if (!images.includes(url)) {
        setImages(prev => [...prev, url]);
      }
      return;
    }
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      await uploadFiles(files);
    }
  }, [images]);

  // Handle file upload
  const uploadFiles = async (files: File[]) => {
    setUploadingImage(true);
    const supabase = createClient();
    
    for (const file of files) {
      try {
        const filename = `products/${productId}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filename, file);
        
        if (error) {
          console.error('Upload error:', error);
          continue;
        }
        
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filename);
        
        if (urlData.publicUrl) {
          setImages(prev => [...prev, urlData.publicUrl]);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    setUploadingImage(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      uploadFiles(files);
    }
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
          images: images,
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
            <Input
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Wireless Bluetooth Earbuds"
            />
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

        {/* Media Section */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Media</h2>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              isDragging 
                ? 'border-jeffy-orange bg-orange-50 scale-[1.02]' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            
            {uploadingImage ? (
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">
                  Drag images here from 1688 or your computer
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  or{' '}
                  <label htmlFor="image-upload" className="text-jeffy-orange cursor-pointer hover:underline">
                    click to browse
                  </label>
                </p>
              </>
            )}
          </div>

          {/* Add from URL */}
          <div className="flex gap-2">
            <Input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageFromUrl())}
              placeholder="Paste image URL here..."
              className="flex-1"
            />
            <button
              type="button"
              onClick={addImageFromUrl}
              disabled={!newImageUrl.trim()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          {/* Chinese Text Analyzer */}
          {images.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Scan className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Chinese Text Detector</h3>
                    <p className="text-xs text-gray-500">Find clean images for SA market</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={analyzeImages}
                  disabled={analyzing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4" />
                      Scan All Images
                    </>
                  )}
                </button>
              </div>
              
              {imageAnalysis ? (
                <div className="bg-white/80 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span><strong>{imageAnalysis.summary.cleanImages}</strong> clean</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span><strong>{imageAnalysis.summary.imagesWithChineseText}</strong> have Chinese</span>
                    </div>
                    {imageAnalysis.bestImageIndex !== undefined && (
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <Star className="h-3 w-3" />
                        <span>Best: Image #{imageAnalysis.bestImageIndex + 1}</span>
                      </div>
                    )}
                  </div>
                  {imageAnalysis.summary.imagesWithChineseText > 0 && (
                    <p className="text-xs text-gray-600">
                      💡 Images with Chinese text may need editing before use
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Click "Scan All Images" to detect which images have Chinese text
                </p>
              )}
            </div>
          )}

          {/* Image Gallery */}
          {images.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Images ({images.length}) - click to select as primary
              </label>
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => {
                  const analysis = imageAnalysis?.analyses?.find((a: any) => a.index === idx);
                  const isBest = imageAnalysis?.bestImageIndex === idx;
                  const hasChineseText = analysis && !analysis.isClean;
                  
                  return (
                    <div key={idx} className="relative group">
                      <button
                        type="button"
                        onClick={() => selectImage(img)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 w-full ${
                          form.imageUrl === img 
                            ? 'border-jeffy-orange ring-2 ring-jeffy-orange' 
                            : 'border-gray-200 hover:border-gray-400'
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
                        
                        {hasChineseText && (
                          <div className="absolute bottom-0 left-0 right-0 bg-orange-500/90 text-white text-[10px] px-1 py-0.5 text-center">
                            中文 Chinese Text
                          </div>
                        )}
                      </button>
                      
                      <div className="absolute top-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setZoomImage(img); }}
                          className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                          title="Zoom"
                        >
                          <ZoomIn className="h-3 w-3" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteImage(idx); }}
                          className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                          title="Remove"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {form.imageUrl && (
            <div>
              <label className="block text-sm font-medium mb-2">Selected Primary Image</label>
              <div className="w-48 h-48 rounded-lg overflow-hidden border bg-gray-100">
                <img src={form.imageUrl} alt="Selected" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Image URL (manual)</label>
            <Input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">1688 Item ID</label>
            <Input
              value={form.source1688ItemId}
              onChange={(e) => setForm({ ...form, source1688ItemId: e.target.value })}
              placeholder="e.g., 123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Supplier Name</label>
            <Input
              value={form.source1688SupplierName}
              onChange={(e) => setForm({ ...form, source1688SupplierName: e.target.value })}
              placeholder="e.g., Shanghai Tech Manufacturing"
            />
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
