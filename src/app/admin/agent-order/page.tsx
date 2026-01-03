'use client';

import { useState, useEffect } from 'react';
import { Package, Loader2, Copy, Check, ExternalLink, Truck, Calculator, FileText, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Variant {
  name: string;
  image?: string;
  in_stock: boolean;
  price_adjustment?: number;
}

interface Product {
  id: string;
  name: string;
  source_url: string;
  source_1688_item_id: string;
  primary_image_url: string | null;
  source_data: {
    costPriceCNY?: number;
    categorySuggestion?: string;
    variants?: Variant[];
    titleOriginal?: string;
  };
}

interface OrderItem {
  product: Product;
  qty: number;
  selectedVariant: string;
  unitCostCNY: number;
}

// Starter Kit Configuration
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

export default function AgentOrderPage() {
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [showOrderDoc, setShowOrderDoc] = useState(false);

  useEffect(() => {
    loadStarterKit();
  }, []);

  const loadStarterKit = async () => {
    const supabase = createClient();
    
    const { data: products } = await supabase
      .from('products')
      .select('id, name, source_url, source_1688_item_id, primary_image_url, source_data')
      .eq('source', '1688')
      .order('created_at', { ascending: false });

    if (!products) {
      setLoading(false);
      return;
    }

    // Filter products with valid CNY prices
    const validProducts = products.filter(p => {
      const cny = p.source_data?.costPriceCNY || 0;
      const name = p.name || '';
      return cny > 0 && cny < 50 && !name.includes('有限公司');
    });

    // Build order items
    const items: OrderItem[] = [];
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
        
        let qty = catConfig.qtyPerItem;
        if (costZAR > 20) qty = Math.floor(qty / 2);
        if (costZAR > 40) qty = Math.floor(qty / 2);
        
        const itemTotal = costZAR * qty;
        
        if (totalCost + itemTotal <= stockBudget) {
          // Get first valid variant name
          const variants = product.source_data?.variants || [];
          const firstVariant = variants.find((v: Variant) => v.name && !v.name.includes('Specifications'))?.name || 'Default';
          
          items.push({
            product,
            qty,
            selectedVariant: firstVariant,
            unitCostCNY: cny
          });
          totalCost += itemTotal;
        }
      }
    }

    setOrderItems(items);
    setLoading(false);
  };

  const updateVariant = (index: number, variant: string) => {
    setOrderItems(prev => {
      const updated = [...prev];
      updated[index].selectedVariant = variant;
      return updated;
    });
  };

  const updateQty = (index: number, qty: number) => {
    setOrderItems(prev => {
      const updated = [...prev];
      updated[index].qty = Math.max(1, qty);
      return updated;
    });
  };

  // Calculate totals
  const totalItems = orderItems.reduce((sum, item) => sum + item.qty, 0);
  const totalCNY = orderItems.reduce((sum, item) => sum + (item.unitCostCNY * item.qty), 0);
  const totalZAR = totalCNY * 3.2;

  // Generate order document
  const generateOrderText = () => {
    const date = new Date().toLocaleDateString('en-ZA');
    let text = `JEFFY COMMERCE - STARTER KIT ORDER\n`;
    text += `杰菲商城 - 入门套餐订单\n`;
    text += `${'='.repeat(50)}\n`;
    text += `Date / 日期: ${date}\n`;
    text += `Total Items / 总件数: ${totalItems}\n`;
    text += `Total Cost / 总金额: ¥${totalCNY.toFixed(0)} (~R${totalZAR.toFixed(0)})\n`;
    text += `${'='.repeat(50)}\n\n`;

    // Group by category
    const grouped = orderItems.reduce((acc, item) => {
      const cat = item.product.source_data?.categorySuggestion || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);

    Object.entries(grouped).forEach(([category, items]) => {
      text += `\n【${category}】\n`;
      text += `${'-'.repeat(40)}\n`;
      
      items.forEach((item, idx) => {
        const originalTitle = item.product.source_data?.titleOriginal || item.product.name;
        text += `\n${idx + 1}. ${item.product.name}\n`;
        text += `   中文: ${originalTitle.substring(0, 50)}...\n`;
        text += `   链接: ${item.product.source_url}\n`;
        text += `   规格: ${item.selectedVariant}\n`;
        text += `   数量: ${item.qty}\n`;
        text += `   单价: ¥${item.unitCostCNY}\n`;
        text += `   小计: ¥${item.unitCostCNY * item.qty}\n`;
      });
    });

    text += `\n${'='.repeat(50)}\n`;
    text += `SHIPPING INSTRUCTIONS / 发货说明:\n`;
    text += `- Sea freight to South Africa / 海运到南非\n`;
    text += `- Pack securely for international shipping / 国际运输包装要求\n`;
    text += `- Mark all boxes with item counts / 每箱标注数量\n`;
    text += `${'='.repeat(50)}\n`;

    return text;
  };

  const copyOrderText = () => {
    navigator.clipboard.writeText(generateOrderText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-7 w-7 text-jeffy-orange" />
            Agent Shipping Request
          </h1>
          <p className="text-gray-600 mt-1">
            Generate a starter kit order to send to your China agent
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowOrderDoc(!showOrderDoc)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {showOrderDoc ? 'Hide' : 'View'} Order Doc
          </button>
          <button
            onClick={copyOrderText}
            className="px-4 py-2 bg-jeffy-orange text-white rounded-lg hover:bg-jeffy-orange/90 flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Order'}
          </button>
        </div>
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
              <p className="text-xl font-bold">{orderItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-xl font-bold">{totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calculator className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total (CNY)</p>
              <p className="text-xl font-bold">¥{totalCNY.toFixed(0)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calculator className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Est. ZAR</p>
              <p className="text-xl font-bold">~R{totalZAR.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Document Preview */}
      {showOrderDoc && (
        <div className="bg-gray-900 text-green-400 rounded-xl p-6 mb-6 font-mono text-sm overflow-x-auto whitespace-pre">
          {generateOrderText()}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-semibold">Order Items</h3>
        </div>
        
        <table className="w-full">
          <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">1688 Link</th>
              <th className="px-4 py-3 text-left">Variant</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-right">Unit (CNY)</th>
              <th className="px-4 py-3 text-right">Total (CNY)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orderItems.map((item, index) => {
              const variants = item.product.source_data?.variants || [];
              const validVariants = variants.filter(v => 
                v.name && 
                !v.name.includes('Specifications') && 
                v.name.length < 50
              );
              
              return (
                <tr key={item.product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.primary_image_url ? (
                          <img 
                            src={item.product.primary_image_url} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate" style={{ maxWidth: '200px' }}>
                          {item.product.name.substring(0, 40)}...
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.product.source_data?.categorySuggestion}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={item.product.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {item.product.source_1688_item_id}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {validVariants.length > 0 ? (
                      <div className="relative">
                        <select
                          value={item.selectedVariant}
                          onChange={(e) => updateVariant(index, e.target.value)}
                          className="appearance-none bg-gray-50 border rounded px-3 py-1.5 pr-8 text-sm w-full max-w-[180px]"
                        >
                          {validVariants.map((v, i) => (
                            <option key={i} value={v.name}>
                              {v.name.substring(0, 30)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Default</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateQty(index, parseInt(e.target.value) || 1)}
                      className="w-16 text-center border rounded py-1 text-sm"
                      min="1"
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    ¥{item.unitCostCNY}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ¥{(item.unitCostCNY * item.qty).toFixed(0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-semibold">
                Order Total:
              </td>
              <td className="px-4 py-3 text-center font-bold">
                {totalItems}
              </td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-right font-bold text-lg text-jeffy-orange">
                ¥{totalCNY.toFixed(0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Agent Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
        <h4 className="font-semibold text-blue-800 mb-2">📋 How to Use This Order</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Review the products and adjust quantities/variants as needed</li>
          <li>Click "Copy Order" to copy the formatted order document</li>
          <li>Send to your agent via WeChat or email</li>
          <li>Agent clicks 1688 links, orders products, consolidates shipment</li>
          <li>Sea freight to SA (~3-4 weeks), then distribute to Zone Partners</li>
        </ol>
      </div>
    </div>
  );
}
