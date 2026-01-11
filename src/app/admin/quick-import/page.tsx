'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ImportedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  created_at: string;
}

// Pricing formula: (CNY × 3.2 + shipping) × 2.5
// Shipping estimate: R75 for light items (0.5kg)
function calculatePrice(cnyPrice: number, weightKg: number = 0.5): number {
  const cnyToZar = 3.2;
  const shippingPerKg = 150;
  const markup = 2.5;
  const shipping = weightKg * shippingPerKg;
  return Math.ceil((cnyPrice * cnyToZar + shipping) * markup);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) + '-' + Date.now().toString(36);
}

function generateSKU(productId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `JEF-${productId.slice(-6)}-${timestamp}`;
}

export default function QuickImportPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentImports, setRecentImports] = useState<ImportedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [url1688, setUrl1688] = useState('');
  const [title, setTitle] = useState('');
  const [titleChinese, setTitleChinese] = useState('');
  const [cnyPrice, setCnyPrice] = useState('');
  const [weightKg, setWeightKg] = useState('0.5');
  const [imageUrls, setImageUrls] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState('');

  // Calculated price
  const calculatedPrice = cnyPrice ? calculatePrice(parseFloat(cnyPrice), parseFloat(weightKg) || 0.5) : 0;

  useEffect(() => {
    fetchCategories();
    fetchRecentImports();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchRecentImports = async () => {
    // Recent imports will show after successful imports in this session
    // Full product list available at /admin/products
  };

  // Extract product ID from 1688 URL
  const extract1688Id = (url: string): string | null => {
    const match = url.match(/offer\/(\d+)\.html/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const productId = extract1688Id(url1688);
      if (!productId) {
        throw new Error('Invalid 1688 URL. Must be like: https://detail.1688.com/offer/123456.html');
      }

      // Parse image URLs (one per line or comma separated)
      const images = imageUrls
        .split(/[\n,]/)
        .map(u => u.trim())
        .filter(u => u.startsWith('http'));

      const productData = {
        name: title,
        slug: generateSlug(title),
        description: description || `${title}\n\n${titleChinese ? `Chinese: ${titleChinese}\n\n` : ''}${variants ? `Available options: ${variants}` : ''}`,
        short_description: titleChinese || title.slice(0, 100),
        sku: generateSKU(productId),
        price: calculatedPrice,
        selling_price_cents: calculatedPrice * 100,
        compare_at_price: Math.ceil(calculatedPrice * 1.3),
        compare_at_price_cents: Math.ceil(calculatedPrice * 1.3) * 100,
        cost_price: Math.ceil(parseFloat(cnyPrice) * 3.2),
        cost_price_cents: Math.ceil(parseFloat(cnyPrice) * 3.2) * 100,
        stock: 10,
        quantity: 10,
        stock_quantity: 10,
        images: images,
        main_image: images[0] || null,
        primary_image_url: images[0] || null,
        source: '1688',
        source_product_id: productId,
        source_url: url1688,
        source_1688_url: url1688,
        source_1688_item_id: productId,
        source_data: {
          importedAt: new Date().toISOString(),
          cny_price: parseFloat(cnyPrice),
          weight_kg: parseFloat(weightKg),
          chinese_title: titleChinese,
          variants_note: variants,
          quick_import: true
        },
        category_id: categoryId || null,
        status: 'draft',
        is_active: false
      };

      const res = await fetch('/api/admin/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create product');
      }

      const data = await res.json();
      setSuccess(`Product imported! ID: ${data.product?.id || data.id}`);
      
      // Clear form
      setUrl1688('');
      setTitle('');
      setTitleChinese('');
      setCnyPrice('');
      setImageUrls('');
      setDescription('');
      setVariants('');
      
      // Refresh recent imports
      fetchRecentImports();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.includes('1688.com')) {
        setUrl1688(text);
      }
    } catch {
      // Clipboard access denied
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span>⚡</span>
            <span>Quick 1688 Import</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Paste product details from 1688.com to import instantly
          </p>
        </div>

        {/* Pricing Formula Card */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-4 mb-6">
          <h3 className="font-bold mb-2">💰 Pricing Formula</h3>
          <code className="text-sm bg-white/20 px-2 py-1 rounded">
            (CNY × 3.2 + shipping) × 2.5
          </code>
          <p className="text-sm text-blue-100 mt-2">
            Shipping: R150/kg • Markup: 2.5x
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Import Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-4">
              {/* 1688 URL */}
              <div>
                <label className="block text-sm font-medium mb-2">1688 Product URL *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url1688}
                    onChange={(e) => setUrl1688(e.target.value)}
                    placeholder="https://detail.1688.com/offer/123456.html"
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={handlePasteUrl}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Title (English) *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Crochet Braids Hair Extension 18 Inch"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Chinese Title (optional) */}
              <div>
                <label className="block text-sm font-medium mb-2">Chinese Title (optional)</label>
                <input
                  type="text"
                  value={titleChinese}
                  onChange={(e) => setTitleChinese(e.target.value)}
                  placeholder="钩针编织假发接发"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">CNY Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                    <input
                      type="number"
                      step="0.01"
                      value={cnyPrice}
                      onChange={(e) => setCnyPrice(e.target.value)}
                      placeholder="25.00"
                      className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="0.5"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Calculated Price Display */}
              {calculatedPrice > 0 && (
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-green-400">Calculated Selling Price:</span>
                    <span className="text-2xl font-bold text-green-400">R{calculatedPrice}</span>
                  </div>
                  <p className="text-xs text-green-400/70 mt-1">
                    Cost: R{Math.ceil(parseFloat(cnyPrice || '0') * 3.2)} • Profit: ~R{calculatedPrice - Math.ceil(parseFloat(cnyPrice || '0') * 3.2 + parseFloat(weightKg) * 150)}
                  </p>
                </div>
              )}

              {/* Image URLs */}
              <div>
                <label className="block text-sm font-medium mb-2">Image URLs (one per line)</label>
                <textarea
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  placeholder="https://cbu01.alicdn.com/img/...&#10;https://cbu01.alicdn.com/img/..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Variants Note */}
              <div>
                <label className="block text-sm font-medium mb-2">Available Variants (colors, sizes)</label>
                <input
                  type="text"
                  value={variants}
                  onChange={(e) => setVariants(e.target.value)}
                  placeholder="Colors: 1b, 2#, 4#, 1b/27, 99j | Sizes: 18in, 24in"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Additional Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Extra product details..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Import Product</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <div className="bg-gray-800 rounded-xl p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>💡</span> Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Right-click images on 1688 → Copy image address</li>
                <li>• Use Google Translate for Chinese titles</li>
                <li>• Estimate weight: Hair ~0.3kg, Accessories ~0.2kg</li>
                <li>• Products import as DRAFT - activate when ready</li>
              </ul>
            </div>

            {/* Recent Imports */}
            <div className="bg-gray-800 rounded-xl p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>📦</span> Recent Imports
              </h3>
              {recentImports.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent imports</p>
              ) : (
                <div className="space-y-3">
                  {recentImports.map(product => (
                    <a
                      key={product.id}
                      href={`/admin/products/${product.id}`}
                      className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      {product.image ? (
                        <img src={product.image} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-600 rounded flex items-center justify-center text-gray-400">📷</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">R{product.price}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Hair Color Reference */}
            <div className="bg-gray-800 rounded-xl p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>🎨</span> Hair Colors
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-700 px-2 py-1 rounded">1b - Natural Black</div>
                <div className="bg-gray-700 px-2 py-1 rounded">2# - Dark Brown</div>
                <div className="bg-gray-700 px-2 py-1 rounded">4# - Medium Brown</div>
                <div className="bg-gray-700 px-2 py-1 rounded">1b/27 - Ombre</div>
                <div className="bg-gray-700 px-2 py-1 rounded">99j - Burgundy</div>
                <div className="bg-gray-700 px-2 py-1 rounded">27# - Honey Blonde</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
