'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatZAR } from '@/lib/import-calculator';

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  supplierUrl: string;
  supplierName: string;
  unitCostCNY: number;
  quantity: number;
  orderNumbers: string[];
}

interface ProcurementOrder {
  id: string;
  product_id: string;
  supplier_name: string;
  supplier_url: string;
  unit_cost_cny: number;
  quantity: number;
  status: string;
  notes: string;
  last_ordered_at: string | null;
  products: {
    name: string;
    image_url: string;
  };
}

export default function AgentPortal() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFrequency, setOrderFrequency] = useState('weekly');
  const [lastOrderDate, setLastOrderDate] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Get all pending/processing orders with their items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          order_items (
            product_id,
            quantity,
            products (
              id,
              name,
              primary_image_url,
              source_1688_url,
              source_1688_data
            )
          )
        `)
        .in('status', ['paid', 'processing'])
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Aggregate by product
      const productMap = new Map<string, OrderItem>();

      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const product = item.products;
          if (!product) return;

          const source1688Data = product.source_1688_data || {};

          const existing = productMap.get(product.id);
          if (existing) {
            existing.quantity += item.quantity;
            if (!existing.orderNumbers.includes(order.order_number)) {
              existing.orderNumbers.push(order.order_number);
            }
          } else {
            productMap.set(product.id, {
              productId: product.id,
              productName: product.name,
              productImage: product.primary_image_url || '/placeholder-product.png',
              supplierUrl: product.source_1688_url || '',
              supplierName: source1688Data.supplierName || 'Unknown',
              unitCostCNY: source1688Data.priceCNY || 0,
              quantity: item.quantity,
              orderNumbers: [order.order_number],
            });
          }
        });
      });

      setOrderItems(Array.from(productMap.values()));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsOrdered = async (productId: string) => {
    const supabase = createClient();
    
    // Update procurement order
    await supabase
      .from('procurement_orders')
      .update({ 
        last_ordered_at: new Date().toISOString(),
        status: 'ordered'
      })
      .eq('product_id', productId);

    // Refresh
    fetchOrders();
  };

  const markAllAsOrdered = async () => {
    const supabase = createClient();
    const now = new Date().toISOString();
    
    for (const item of orderItems) {
      await supabase
        .from('procurement_orders')
        .update({ 
          last_ordered_at: now,
          status: 'ordered'
        })
        .eq('product_id', item.productId);
    }

    setLastOrderDate(now);
    alert('All items marked as ordered!');
    fetchOrders();
  };

  const copyAllLinks = () => {
    const links = orderItems
      .filter(item => item.supplierUrl)
      .map(item => `${item.productName}\nQty: ${item.quantity}\nLink: ${item.supplierUrl}`)
      .join('\n\n---\n\n');
    
    navigator.clipboard.writeText(links);
    alert('All product links copied to clipboard!');
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = ['Product Name', 'Quantity', 'Unit Cost (CNY)', 'Total (CNY)', '1688 Link', 'Order Numbers'];
    const rows = orderItems.map(item => [
      item.productName,
      item.quantity,
      item.unitCostCNY,
      item.unitCostCNY * item.quantity,
      item.supplierUrl,
      item.orderNumbers.join(', ')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jeffy-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getNextOrderDate = () => {
    const now = new Date();
    if (orderFrequency === 'weekly') {
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
      return nextMonday.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' });
    } else {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return nextMonth.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-4xl">📦</span>
                Agent Order Portal
              </h1>
              <p className="text-orange-100 mt-1">
                Products to order from 1688
              </p>
            </div>
            <div className="text-right">
              <p className="text-orange-100 text-sm">Order Frequency</p>
              <select
                value={orderFrequency}
                onChange={(e) => setOrderFrequency(e.target.value)}
                className="mt-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="weekly" className="text-gray-900">Weekly</option>
                <option value="monthly" className="text-gray-900">Monthly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-gray-500">Products to Order</p>
                <p className="text-2xl font-bold text-gray-900">{orderItems.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Cost</p>
                <p className="text-2xl font-bold text-orange-600">
                  ¥{orderItems.reduce((sum, item) => sum + (item.unitCostCNY * item.quantity), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Order</p>
                <p className="text-lg font-semibold text-gray-900">{getNextOrderDate()}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyAllLinks}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy All Links
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={markAllAsOrdered}
                disabled={orderItems.length === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark All Ordered
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orderItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No orders to fulfill</h3>
            <p className="text-gray-500">When customers place orders, products will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderItems.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex items-center p-4 gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.productName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Supplier: {item.supplierName}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Orders: {item.orderNumbers.join(', ')}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="text-center px-6">
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="text-2xl font-bold text-gray-900">{item.quantity}</p>
                  </div>

                  {/* Unit Price */}
                  <div className="text-center px-6">
                    <p className="text-sm text-gray-500">Unit Price</p>
                    <p className="text-lg font-semibold text-gray-900">¥{item.unitCostCNY}</p>
                  </div>

                  {/* Total */}
                  <div className="text-center px-6">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-bold text-orange-600">
                      ¥{(item.unitCostCNY * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pl-4 border-l">
                    {item.supplierUrl ? (
                      <a
                        href={item.supplierUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium flex items-center gap-2"
                      >
                        <span>Open 1688</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg">
                        No link
                      </span>
                    )}
                    <button
                      onClick={() => {
                        if (item.supplierUrl) {
                          navigator.clipboard.writeText(item.supplierUrl);
                          alert('Link copied!');
                        }
                      }}
                      disabled={!item.supplierUrl}
                      className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      title="Copy link"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => markAsOrdered(item.productId)}
                      className="p-2 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100"
                      title="Mark as ordered"
                    >
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span>💡</span> How to use this portal
          </h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Review the products and quantities needed</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Click "Open 1688" to go directly to the product page</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Place orders on 1688 for the quantities shown</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>Click the ✓ button to mark each item as ordered</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">5.</span>
              <span>Use "Export CSV" to download the full list for your records</span>
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}

