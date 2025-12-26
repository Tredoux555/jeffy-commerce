'use client';

import { useState } from 'react';
import { 
  Link2, Search, Loader2, Check, AlertCircle, Package, 
  ChevronRight, Image as ImageIcon, Plus
} from 'lucide-react';
import {
  parse1688Url,
  mockScrapeWithDelay,
  processProduct,
  validateProduct,
  formatZAR,
  formatCNY,
  DEFAULT_PRICING_CONFIG,
} from '@/lib/scraper';
import type { Raw1688Product, JeffyProductImport } from '@/lib/scraper';

export function SingleProductImporter() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'parsing' | 'scraping' | 'processing' | 'ready' | 'error'>('idle');
  const [error, setError] = useState('');
  const [rawProduct, setRawProduct] = useState<Raw1688Product | null>(null);
  const [processedProduct, setProcessedProduct] = useState<JeffyProductImport | null>(null);

  const handleImport = async () => {
    setError('');
    setStatus('parsing');
    
    const parsed = parse1688Url(url);
    if (!parsed.isValid) {
      setError(parsed.error || 'Invalid 1688 URL');
      setStatus('error');
      return;
    }
    
    setStatus('scraping');
    try {
      const raw = await mockScrapeWithDelay(parsed.productId, 2000);
      setRawProduct(raw);
      
      setStatus('processing');
      const processed = processProduct(raw, DEFAULT_PRICING_CONFIG);
      const validation = validateProduct(processed);
      
      if (!validation.isValid) {
        setError(`Validation errors: ${validation.errors.join(', ')}`);
        setStatus('error');
        return;
      }
      
      setProcessedProduct(processed);
      setStatus('ready');
    } catch (err) {
      setError('Failed to scrape product. Please try again.');
      setStatus('error');
    }
  };

  const handleAddToStore = async () => {
    if (!processedProduct) return;
    alert('Product would be saved!\n\nConnect to database to actually save.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-[#ff6b35]" />
          Import from 1688
        </h2>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste 1688 product URL or product ID..."
            className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
          />
          <button
            onClick={handleImport}
            disabled={!url || status === 'scraping' || status === 'processing'}
            className="px-6 py-3 bg-[#ff6b35] text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
          >
            {status === 'scraping' || status === 'processing' ? (
              <><Loader2 className="h-5 w-5 animate-spin" />{status === 'scraping' ? 'Scraping...' : 'Processing...'}</>
            ) : (
              <><Search className="h-5 w-5" />Import</>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />{error}
          </div>
        )}
        
        {status !== 'idle' && status !== 'error' && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            <StatusStep label="Parse URL" done={status !== 'parsing'} active={status === 'parsing'} />
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <StatusStep label="Scrape Product" done={status === 'processing' || status === 'ready'} active={status === 'scraping'} />
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <StatusStep label="Process Data" done={status === 'ready'} active={status === 'processing'} />
          </div>
        )}
      </div>

      {processedProduct && status === 'ready' && rawProduct && (
        <ProductPreview product={processedProduct} rawProduct={rawProduct} onSave={handleAddToStore} />
      )}
    </div>
  );
}

function StatusStep({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${done ? 'text-green-600' : active ? 'text-[#ff6b35]' : 'text-gray-400'}`}>
      {done ? <Check className="h-4 w-4" /> : active ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="h-4 w-4 rounded-full border-2" />}
      {label}
    </div>
  );
}

function ProductPreview({ product, rawProduct, onSave }: { product: JeffyProductImport; rawProduct: Raw1688Product; onSave: () => void }) {
  const [editedProduct, setEditedProduct] = useState(product);

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-4 border-b bg-green-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-700">
          <Check className="h-5 w-5" /><span className="font-medium">Product Ready for Import</span>
        </div>
        <button onClick={onSave} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />Add to Store
        </button>
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-6">
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            {product.mainImage ? (
              <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-16 w-16 text-gray-300" /></div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {product.images.slice(0, 5).map((img, i) => (
              <div key={i} className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Product Name</label>
            <input type="text" value={editedProduct.name} onChange={(e) => setEditedProduct(prev => ({ ...prev, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Selling Price</label>
              <div className="text-2xl font-bold text-[#ff6b35]">{formatZAR(editedProduct.sellingPrice)}</div>
              <div className="text-sm text-gray-400 line-through">{formatZAR(editedProduct.comparePrice || 0)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Cost (CNY)</label>
              <div className="text-xl font-medium">{formatCNY(rawProduct.price.min)}</div>
              <div className="text-sm text-gray-500">Cost: {formatZAR(editedProduct.costPrice)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">SKU</label>
              <input type="text" value={editedProduct.sku} onChange={(e) => setEditedProduct(prev => ({ ...prev, sku: e.target.value }))} className="w-full border rounded-lg px-3 py-2 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Stock</label>
              <input type="number" value={editedProduct.stock} onChange={(e) => setEditedProduct(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          {editedProduct.variants.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Variants ({editedProduct.variants.length})</label>
              <div className="flex flex-wrap gap-2">
                {editedProduct.variants.slice(0, 8).map((v, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">{Object.values(v.options).join(' / ')}</span>
                ))}
                {editedProduct.variants.length > 8 && <span className="px-2 py-1 text-gray-500 text-sm">+{editedProduct.variants.length - 8} more</span>}
              </div>
            </div>
          )}

          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-gray-600 mb-1"><Package className="h-4 w-4" /><span>Source: 1688.com</span></div>
            <div className="text-gray-500">Seller: {rawProduct.seller.name} ({rawProduct.seller.location})</div>
            <div className="text-gray-500">MOQ: {rawProduct.moq} units</div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t">
        <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
        <textarea value={editedProduct.description} onChange={(e) => setEditedProduct(prev => ({ ...prev, description: e.target.value }))} rows={4} className="w-full border rounded-lg px-3 py-2 resize-none" />
      </div>
    </div>
  );
}
