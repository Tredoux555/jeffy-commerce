'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Loader2, ShoppingBag, TrendingUp, DollarSign, Truck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  primary_image_url: string | null;
  selling_price_cents: number;
  source_data: {
    costPriceCNY?: number;
    categorySuggestion?: string;
    features?: string[];
  };
}

interface KitItem {
  product: Product;
  qty: number;
  costZAR: number;
  totalCost: number;
}

// Starter Kit Configuration - products under R30 with good margins
const STARTER_KIT_CONFIG = {
  budget: 5000,
  shipping: 400,
  categories: [
    { name: 'Beauty & Skincare', maxProducts: 6, qtyPerItem: 30 },
    { name: 'Hair Care', maxProducts: 4, qtyPerItem: 20 },
    { name: 'Fashion & Accessories', maxProducts: 6, qtyPerItem: 30 },
    { name: 'Health & Wellness', maxProducts: 2, qtyPerItem: 10 },
    { name: 'Home & Living', maxProducts: 5, qtyPerItem: 20 },
    { name: 'Electronics', maxProducts: 4, qtyPerItem: 10 },
  ]
};

export default function StarterKitPage() {
  const [loading, setLoading] = useState(true);
  const [kitItems, setKitItems] = useState<KitItem[]>([]);
  const [totals, setTotals] = useState({ items: 0, stockCost: 0, landed: 0 });

  useEffect(() => {
    loadStarterKit();
  }, []);

  const loadStarterKit = async () => {
    const supabase = createClient();
    
    // Fetch all 1688 products with source_data
    const { data: products } = await supabase
      .from('products')
      .select('id, name, slug, primary_image_url, selling_price_cents, source_data')
      .eq('source', '1688')
      .order('created_at', { ascending: false });

    if (!products) {
      setLoading(false);
      return;
    }

    // Filter products with valid CNY prices and organize by category
    const validProducts = products.filter(p => {
      const cny = p.source_data?.costPriceCNY || 0;
      const name = p.name || '';
      return cny > 0 && cny < 50 && !name.includes('有限公司');
    });

    // Build starter kit
    const kit: KitItem[] = [];
    let totalCost = 0;
    const stockBudget = STARTER_KIT_CONFIG.budget - STARTER_KIT_CONFIG.shipping;

    for (const catConfig of STARTER_KIT_CONFIG.categories) {
      const catProducts = validProducts
        .filter(p => p.source_data?.categorySuggestion === catConfig.name)
        .sort((a, b) => (a.source_data?.costPriceCNY || 0) - (b.source_data?.costPriceCNY || 0))
        .slice(0, catConfig.maxProducts);

      for (const product of catProducts) {
        const cny = product.source_data?.costPriceCNY || 0;
        const costZAR = cny * 3.2;
        
        // Adjust qty based on price
        let qty = catConfig.qtyPerItem;
        if (costZAR > 20) qty = Math.floor(qty / 2);
        if (costZAR > 40) qty = Math.floor(qty / 2);
        
        const itemTotal = costZAR * qty;
        
        if (totalCost + itemTotal <= stockBudget) {
          kit.push({
            product,
            qty,
            costZAR,
            totalCost: itemTotal
          });
          totalCost += itemTotal;
        }
      }
    }

    // Calculate totals
    const totalItems = kit.reduce((sum, item) => sum + item.qty, 0);
    const landed = totalCost + STARTER_KIT_CONFIG.shipping;

    setKitItems(kit);
    setTotals({ items: totalItems, stockCost: totalCost, landed });
    setLoading(false);
  };

  // Group by category
  const groupedItems = kitItems.reduce((acc, item) => {
    const cat = item.product.source_data?.categorySuggestion || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, KitItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-jeffy-orange" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-7 w-7 text-jeffy-orange" />
          R5,000 Zone Partner Starter Kit
        </h1>
        <p className="text-gray-600 mt-1">
          Curated selection of best-selling products for new Zone Partners
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Products</p>
              <p className="text-xl font-bold">{kitItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-xl font-bold">{totals.items}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Landed Cost</p>
              <p className="text-xl font-bold">R{totals.landed.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sells at 2x</p>
              <p className="text-xl font-bold text-green-600">R{(totals.landed * 2).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Breakdown */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-green-800 mb-2">💰 Zone Partner Profit Projection</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-green-600">Investment</p>
            <p className="text-lg font-bold text-green-800">R{totals.landed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-green-600">Revenue (2x markup)</p>
            <p className="text-lg font-bold text-green-800">R{(totals.landed * 2).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-green-600">Profit</p>
            <p className="text-lg font-bold text-green-800">R{totals.landed.toLocaleString()} (100% ROI)</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Truck className="h-5 w-5 text-gray-500" />
          Cost Breakdown
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Stock cost (China)</span>
            <span className="font-medium">R{totals.stockCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sea freight (shared CBM)</span>
            <span className="font-medium">R{STARTER_KIT_CONFIG.shipping}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total Landed</span>
            <span className="text-jeffy-orange">R{totals.landed.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Products by Category */}
      {Object.entries(groupedItems).map(([category, items]) => {
        const catTotal = items.reduce((sum, i) => sum + i.totalCost, 0);
        const catQty = items.reduce((sum, i) => sum + i.qty, 0);
        
        return (
          <div key={category} className="bg-white rounded-xl border mb-4 overflow-hidden">
            {/* Category Header */}
            <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                📦 {category}
              </h3>
              <div className="text-sm text-gray-500">
                {catQty} items | R{catTotal.toFixed(0)} cost
              </div>
            </div>
            
            {/* Products Table */}
            <table className="w-full">
              <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-center">Qty</th>
                  <th className="px-4 py-2 text-right">Unit Cost</th>
                  <th className="px-4 py-2 text-right">Total Cost</th>
                  <th className="px-4 py-2 text-right">Sell Price (2x)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.primary_image_url ? (
                            <img 
                              src={item.product.primary_image_url} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link 
                            href={`/admin/products/${item.product.id}`} 
                            className="font-medium text-gray-900 hover:text-jeffy-orange truncate block text-sm"
                          >
                            {item.product.name.substring(0, 45)}...
                          </Link>
                          <p className="text-xs text-gray-400">
                            ¥{item.product.source_data?.costPriceCNY || 0} CNY
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                        {item.qty}x
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      R{item.costZAR.toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      R{item.totalCost.toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                      R{(item.totalCost * 2).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Footer Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
        <h4 className="font-semibold text-yellow-800 mb-1">📝 Note for Zone Partners</h4>
        <p className="text-sm text-yellow-700">
          This starter kit is designed to give you a diverse product range across popular categories.
          All prices are based on sea freight shipping (R1/item vs R75/item air freight), 
          making your margins much healthier. Sell at 2x for 100% profit!
        </p>
      </div>
    </div>
  );
}
