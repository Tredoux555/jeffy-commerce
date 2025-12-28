'use client';

import { useState } from 'react';
import { Package, Download, Send, FileText, Truck, Check, Copy, Globe } from 'lucide-react';
import type { AgentOrder } from '@/lib/scraper';
import { formatCNY } from '@/lib/scraper';

// Mock pending orders that need to be sent to China agent
const MOCK_ORDERS: AgentOrder[] = [
  {
    id: '1',
    orderNumber: 'JF-2024-001',
    items: [
      { productId: '728591234567', url: 'https://detail.1688.com/offer/728591234567.html', title: '无线蓝牙耳机', variant: 'Black', quantity: 5, unitPrice: 28, totalPrice: 140, notes: '' },
      { productId: '728591234568', url: 'https://detail.1688.com/offer/728591234568.html', title: 'USB充电线', variant: '1m White', quantity: 10, unitPrice: 5, totalPrice: 50 },
    ],
    totalCNY: 190,
    customerName: 'John Doe',
    shippingAddress: '123 Main St, Johannesburg',
    status: 'pending',
    createdAt: '2024-12-26T10:00:00Z',
  },
  {
    id: '2',
    orderNumber: 'JF-2024-002',
    items: [
      { productId: '728591234569', url: 'https://detail.1688.com/offer/728591234569.html', title: 'LED台灯', variant: 'White', quantity: 3, unitPrice: 45, totalPrice: 135 },
    ],
    totalCNY: 135,
    customerName: 'Jane Smith',
    shippingAddress: '456 Oak Ave, Cape Town',
    status: 'pending',
    createdAt: '2024-12-26T11:00:00Z',
  },
];

export function AgentOrderExport() {
  const [orders, setOrders] = useState<AgentOrder[]>(MOCK_ORDERS);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'wechat'>('wechat');

  const toggleOrder = (id: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedOrders(newSelected);
  };

  const selectAll = () => {
    if (selectedOrders.size === orders.filter(o => o.status === 'pending').length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.filter(o => o.status === 'pending').map(o => o.id)));
    }
  };

  const generateWeChatMessage = () => {
    const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id));
    let message = `🛒 新订单 - Jeffy Commerce\n`;
    message += `📅 ${new Date().toLocaleDateString('zh-CN')}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    selectedOrdersList.forEach((order, idx) => {
      message += `📦 订单 ${idx + 1}: ${order.orderNumber}\n`;
      order.items.forEach(item => {
        message += `• ${item.title}\n`;
        message += `  规格: ${item.variant}\n`;
        message += `  数量: ${item.quantity}\n`;
        message += `  单价: ¥${item.unitPrice}\n`;
        message += `  链接: ${item.url}\n`;
        if (item.notes) message += `  备注: ${item.notes}\n`;
        message += `\n`;
      });
      message += `小计: ¥${order.totalCNY}\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    });

    const totalCNY = selectedOrdersList.reduce((sum, o) => sum + o.totalCNY, 0);
    const totalItems = selectedOrdersList.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    
    message += `📊 汇总:\n`;
    message += `订单数: ${selectedOrdersList.length}\n`;
    message += `商品数: ${totalItems}\n`;
    message += `总金额: ¥${totalCNY}\n\n`;
    message += `请确认后采购，谢谢！🙏`;

    return message;
  };

  const generateCSV = () => {
    const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id));
    let csv = 'Order Number,Product ID,1688 URL,Title,Variant,Quantity,Unit Price (CNY),Total (CNY),Notes\n';
    
    selectedOrdersList.forEach(order => {
      order.items.forEach(item => {
        csv += `${order.orderNumber},${item.productId},"${item.url}","${item.title}",${item.variant},${item.quantity},${item.unitPrice},${item.totalPrice},"${item.notes || ''}"\n`;
      });
    });
    
    return csv;
  };

  const generateJSON = () => {
    const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id));
    return JSON.stringify(selectedOrdersList, null, 2);
  };

  const handleExport = () => {
    let content = '';
    let filename = '';
    let mimeType = '';
    
    switch (exportFormat) {
      case 'wechat':
        content = generateWeChatMessage();
        navigator.clipboard.writeText(content);
        alert('WeChat message copied to clipboard! Paste it in WeChat.');
        return;
      case 'csv':
        content = generateCSV();
        filename = `agent-orders-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      case 'json':
        content = generateJSON();
        filename = `agent-orders-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const markAsOrdered = () => {
    setOrders(prev => prev.map(o => 
      selectedOrders.has(o.id) ? { ...o, status: 'ordered' as const } : o
    ));
    setSelectedOrders(new Set());
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const totalSelected = orders.filter(o => selectedOrders.has(o.id)).reduce((sum, o) => sum + o.totalCNY, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Globe className="h-5 w-5 text-[#ff6b35]" />
          China Agent Orders
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Truck className="h-4 w-4" />
          <span>{pendingOrders.length} orders pending</span>
        </div>
      </div>

      {/* Export Controls */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedOrders.size === pendingOrders.length && pendingOrders.length > 0}
              onChange={selectAll}
              className="rounded"
            />
            <span className="text-sm">Select All ({pendingOrders.length})</span>
          </label>
          
          {selectedOrders.size > 0 && (
            <span className="text-sm text-gray-500">
              Selected: {selectedOrders.size} orders • {formatCNY(totalSelected)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="wechat">WeChat Message (Chinese)</option>
            <option value="csv">CSV Spreadsheet</option>
            <option value="json">JSON Data</option>
          </select>
          
          <button
            onClick={handleExport}
            disabled={selectedOrders.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {exportFormat === 'wechat' ? <Copy className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            {exportFormat === 'wechat' ? 'Copy Message' : 'Download'}
          </button>
          
          <button
            onClick={markAsOrdered}
            disabled={selectedOrders.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Mark Ordered
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className={`bg-white rounded-xl border overflow-hidden ${order.status !== 'pending' ? 'opacity-60' : ''}`}>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                {order.status === 'pending' && (
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.id)}
                    onChange={() => toggleOrder(order.id)}
                    className="rounded"
                  />
                )}
                <div>
                  <p className="font-bold">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#ff6b35]">{formatCNY(order.totalCNY)}</p>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            
            <div className="p-4">
              <table className="w-full text-sm">
                <thead className="text-gray-500">
                  <tr>
                    <th className="text-left pb-2">Product</th>
                    <th className="text-left pb-2">Variant</th>
                    <th className="text-right pb-2">Qty</th>
                    <th className="text-right pb-2">Price</th>
                    <th className="text-right pb-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2">
                        <p className="font-medium">{item.title}</p>
                        <a href={item.url} target="_blank" className="text-xs text-[#ff6b35] hover:underline">
                          View on 1688 →
                        </a>
                      </td>
                      <td className="py-2">{item.variant}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">¥{item.unitPrice}</td>
                      <td className="py-2 text-right font-medium">¥{item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-500">No orders to export</h3>
          <p className="text-sm text-gray-400 mt-1">Orders with 1688 products will appear here</p>
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: AgentOrder['status'] }) {
  const configs = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
    ordered: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ordered' },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Shipped' },
    received: { bg: 'bg-green-100', text: 'text-green-700', label: 'Received' },
  };
  const config = configs[status];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
