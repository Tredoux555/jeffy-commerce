'use client';

import { useState } from 'react';
import { FileText, Download, Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  shipping: number;
  discount?: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}

// Generate printable invoice HTML
export function generateInvoiceHTML(data: InvoiceData): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${data.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #333; }
        .invoice-header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .logo { font-size: 32px; font-weight: bold; color: #ff6b35; }
        .invoice-title { font-size: 28px; color: #666; }
        .invoice-details { margin-bottom: 30px; }
        .invoice-details p { margin: 4px 0; }
        .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
        .address-box h4 { margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #f8f8f8; padding: 12px; text-align: left; font-weight: 600; }
        th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
        th:nth-child(2) { text-align: center; }
        .totals { margin-left: auto; width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .totals-row.total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 12px; }
        .footer { margin-top: 60px; text-align: center; color: #666; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="logo">Jeffy</div>
        <div class="invoice-title">INVOICE</div>
      </div>

      <div class="invoice-details">
        <p><strong>Invoice #:</strong> ${data.orderNumber}</p>
        <p><strong>Date:</strong> ${data.orderDate}</p>
        <p><strong>Payment Status:</strong> ${data.paymentStatus}</p>
      </div>

      <div class="address-grid">
        <div class="address-box">
          <h4>From</h4>
          <p><strong>Jeffy Commerce</strong></p>
          <p>123 Main Street</p>
          <p>Johannesburg, Gauteng 2000</p>
          <p>South Africa</p>
          <p>VAT: 4000123456</p>
        </div>
        <div class="address-box">
          <h4>Bill To</h4>
          <p><strong>${data.customerName}</strong></p>
          <p>${data.customerEmail}</p>
          <p>${data.shippingAddress.street}</p>
          <p>${data.shippingAddress.city}, ${data.shippingAddress.province} ${data.shippingAddress.postalCode}</p>
          <p>${data.shippingAddress.country}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(data.subtotal)}</span>
        </div>
        <div class="totals-row">
          <span>Shipping:</span>
          <span>${data.shipping === 0 ? 'FREE' : formatCurrency(data.shipping)}</span>
        </div>
        ${data.discount ? `
        <div class="totals-row" style="color: #22c55e;">
          <span>Discount:</span>
          <span>-${formatCurrency(data.discount)}</span>
        </div>
        ` : ''}
        <div class="totals-row">
          <span>VAT (15%):</span>
          <span>${formatCurrency(data.tax)}</span>
        </div>
        <div class="totals-row total">
          <span>Total:</span>
          <span>${formatCurrency(data.total)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for shopping with Jeffy!</p>
        <p>Questions? Contact us at support@jeffy.co.za</p>
        <p>www.jeffy.co.za</p>
      </div>
    </body>
    </html>
  `;
}

// Invoice download button
export function InvoiceDownloadButton({ orderData }: { orderData: InvoiceData }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    
    try {
      const html = generateInvoiceHTML(orderData);
      
      // Create blob and download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderData.orderNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to generate invoice:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const html = generateInvoiceHTML(orderData);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleDownload} disabled={loading} variant="outline" size="sm">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
        Download Invoice
      </Button>
      <Button onClick={handlePrint} variant="outline" size="sm">
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
    </div>
  );
}

// Invoice preview component
export function InvoicePreview({ orderData }: { orderData: InvoiceData }) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#ff6b35]">Jeffy</h2>
          <p className="text-sm text-gray-500">Invoice #{orderData.orderNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{orderData.orderDate}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${
            orderData.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {orderData.paymentStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-6 pb-6 border-b">
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Bill To</h4>
          <p className="font-medium">{orderData.customerName}</p>
          <p className="text-sm text-gray-600">{orderData.customerEmail}</p>
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Ship To</h4>
          <p className="text-sm text-gray-600">
            {orderData.shippingAddress.street}<br />
            {orderData.shippingAddress.city}, {orderData.shippingAddress.province}<br />
            {orderData.shippingAddress.postalCode}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Item</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {orderData.items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{item.name}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                <td className="py-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(orderData.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{orderData.shipping === 0 ? 'FREE' : formatCurrency(orderData.shipping)}</span>
          </div>
          {orderData.discount && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(orderData.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>VAT (15%)</span>
            <span>{formatCurrency(orderData.tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>{formatCurrency(orderData.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
