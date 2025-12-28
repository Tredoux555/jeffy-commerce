/**
 * SARS Tax Reporting Framework
 * South African Revenue Service compliance
 * 
 * VAT Rate: 15%
 * Company Tax: 27%
 */

export const VAT_RATE = 0.15;
export const COMPANY_TAX_RATE = 0.27;

interface SalesData {
  totalSales: number; // in cents, VAT inclusive
  totalPurchases: number; // in cents, VAT inclusive
  period: { from: string; to: string };
}

interface VATReturn {
  outputVAT: number; // VAT on sales
  inputVAT: number; // VAT on purchases
  vatPayable: number; // outputVAT - inputVAT
  netSales: number;
  netPurchases: number;
  period: { from: string; to: string };
}

export function calculateVATReturn(data: SalesData): VATReturn {
  // VAT is 15/115 of the VAT-inclusive amount
  const outputVAT = Math.round(data.totalSales * (VAT_RATE / (1 + VAT_RATE)));
  const inputVAT = Math.round(data.totalPurchases * (VAT_RATE / (1 + VAT_RATE)));
  
  return {
    outputVAT,
    inputVAT,
    vatPayable: outputVAT - inputVAT,
    netSales: data.totalSales - outputVAT,
    netPurchases: data.totalPurchases - inputVAT,
    period: data.period,
  };
}

export function formatVATNumber(number: string): string {
  // SA VAT numbers are 10 digits
  return number.replace(/\D/g, '').padStart(10, '0');
}

interface TaxInvoiceData {
  invoiceNumber: string;
  date: string;
  seller: {
    name: string;
    vatNumber: string;
    address: string;
  };
  buyer: {
    name: string;
    vatNumber?: string;
    address: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number; // ex VAT
    vatAmount: number;
    total: number; // inc VAT
  }>;
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
}

export function generateTaxInvoice(data: TaxInvoiceData): string {
  // Returns HTML for a SARS-compliant tax invoice
  const itemsHTML = data.items.map(item => `
    <tr>
      <td>${item.description}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">R${(item.unitPrice / 100).toFixed(2)}</td>
      <td style="text-align:right">R${(item.vatAmount / 100).toFixed(2)}</td>
      <td style="text-align:right">R${(item.total / 100).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><title>Tax Invoice ${data.invoiceNumber}</title></head>
    <body style="font-family: Arial, sans-serif; padding: 40px;">
      <h1>TAX INVOICE</h1>
      <p><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
      <p><strong>Date:</strong> ${data.date}</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 20px 0;">
        <div>
          <h3>From:</h3>
          <p><strong>${data.seller.name}</strong></p>
          <p>VAT: ${data.seller.vatNumber}</p>
          <p>${data.seller.address}</p>
        </div>
        <div>
          <h3>To:</h3>
          <p><strong>${data.buyer.name}</strong></p>
          ${data.buyer.vatNumber ? `<p>VAT: ${data.buyer.vatNumber}</p>` : ''}
          <p>${data.buyer.address}</p>
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="text-align:left; padding:8px;">Description</th>
            <th style="text-align:center; padding:8px;">Qty</th>
            <th style="text-align:right; padding:8px;">Unit (ex VAT)</th>
            <th style="text-align:right; padding:8px;">VAT (15%)</th>
            <th style="text-align:right; padding:8px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>
      
      <div style="margin-top: 20px; text-align: right;">
        <p>Subtotal (ex VAT): <strong>R${(data.subtotal / 100).toFixed(2)}</strong></p>
        <p>VAT (15%): <strong>R${(data.vatTotal / 100).toFixed(2)}</strong></p>
        <p style="font-size: 1.2em;">Total: <strong>R${(data.grandTotal / 100).toFixed(2)}</strong></p>
      </div>
    </body>
    </html>
  `;
}

// Monthly VAT periods
export function getVATPeriod(date: Date = new Date()): { from: string; to: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0);
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}
