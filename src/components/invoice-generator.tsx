'use client';

import { formatCurrency } from '@/lib/utils';

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const itemsHTML = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${data.orderNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; color: #1f2937; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .logo { font-size: 32px; font-weight: bold; color: #ff6b35; }
        .invoice-title { font-size: 24px; color: #6b7280; }
        .invoice-number { font-size: 14px; color: #9ca3af; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .detail-box h3 { font-size: 12px; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; }
        .detail-box p { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f9fafb; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; }
        .totals { margin-top: 20px; margin-left: auto; width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .totals-row.total { font-size: 18px; font-weight: bold; border-top: 2px solid #1f2937; padding-top: 12px; margin-top: 8px; }
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
        .paid-stamp { position: absolute; top: 100px; right: 40px; transform: rotate(-15deg); border: 4px solid #22c55e; color: #22c55e; padding: 10px 20px; font-size: 24px; font-weight: bold; border-radius: 8px; opacity: 0.8; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="container" style="position: relative;">
        ${data.paymentStatus === 'paid' ? '<div class="paid-stamp">PAID</div>' : ''}
        
        <div class="header">
          <div>
            <div class="logo">Jeffy</div>
            <p style="color: #6b7280; margin: 4px 0;">Commerce</p>
          </div>
          <div style="text-align: right;">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">${data.orderNumber}</div>
            <div class="invoice-number">${data.orderDate}</div>
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-box">
            <h3>Bill To</h3>
            <p><strong>${data.customer.name}</strong></p>
            <p>${data.customer.email}</p>
            <p>${data.customer.phone}</p>
            <p>${data.customer.address}</p>
          </div>
          <div class="detail-box">
            <h3>From</h3>
            <p><strong>Jeffy Commerce (Pty) Ltd</strong></p>
            <p>Reg: 2025/950712/07</p>
            <p>39 Panorama Drive, The Links</p>
            <p>Somerset West, 7130</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>${formatCurrency(data.subtotal)}</span>
          </div>
          ${data.discount ? `
          <div class="totals-row" style="color: #22c55e;">
            <span>Discount</span>
            <span>-${formatCurrency(data.discount)}</span>
          </div>
          ` : ''}
          <div class="totals-row">
            <span>Shipping</span>
            <span>${data.shipping === 0 ? 'FREE' : formatCurrency(data.shipping)}</span>
          </div>
          ${data.tax && data.tax > 0 ? `
          <div class="totals-row">
            <span>VAT (15%)</span>
            <span>${formatCurrency(data.tax)}</span>
          </div>
          ` : ''}
          <div class="totals-row total">
            <span>Total</span>
            <span>${formatCurrency(data.total)}</span>
          </div>
        </div>

        <div style="margin-top: 40px; padding: 16px; background: #f9fafb; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          <p style="margin: 4px 0 0; font-size: 14px;"><strong>Payment Status:</strong> ${data.paymentStatus}</p>
        </div>

        <div class="footer">
          <p>Thank you for shopping with Jeffy!</p>
          <p>Questions? Contact us at hello@jeffy.co.za</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Button component to download invoice
export function DownloadInvoiceButton({ orderData }: { orderData: InvoiceData }) {
  const handleDownload = () => {
    const html = generateInvoiceHTML(orderData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
    >
      📄 Download Invoice
    </button>
  );
}
