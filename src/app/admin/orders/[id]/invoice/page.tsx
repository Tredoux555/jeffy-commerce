import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id, quantity, unit_price_cents, total_cents,
        product:products (name, sku)
      )
    `)
    .eq('id', id)
    .single();

  if (!order) notFound();

  return (
    <html>
      <head>
        <title>Invoice {order.order_number}</title>
        <style>{`
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
          body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: bold; color: #ff6b35; }
          .invoice-title { font-size: 32px; color: #333; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .meta-box { background: #f9f9f9; padding: 20px; border-radius: 8px; }
          .meta-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { text-align: left; padding: 12px; background: #f3f4f6; border-bottom: 2px solid #e5e7eb; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .totals { margin-left: auto; width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-row.grand { font-size: 20px; font-weight: bold; border-top: 2px solid #333; padding-top: 16px; }
          .footer { margin-top: 60px; text-align: center; color: #666; font-size: 14px; }
          .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #ff6b35; color: white; border: none; border-radius: 8px; cursor: pointer; }
          @media print { .print-btn { display: none; } }
        `}</style>
      </head>
      <body>
        <button className="print-btn" id="printBtn">Print Invoice</button>
        <script dangerouslySetInnerHTML={{ __html: `document.getElementById('printBtn').onclick = function() { window.print(); }` }} />
        
        <div className="header">
          <div>
            <div className="logo">Jeffy Commerce</div>
            <p>South Africa's Deal Hub</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="invoice-title">INVOICE</div>
            <p><strong>{order.order_number}</strong></p>
            <p>{formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="meta">
          <div className="meta-box">
            <div className="meta-label">Bill To</div>
            <p><strong>{order.customer_name || 'Customer'}</strong></p>
            {order.customer_email && <p>{order.customer_email}</p>}
            {order.customer_phone && <p>{order.customer_phone}</p>}
          </div>
          <div className="meta-box">
            <div className="meta-label">Ship To</div>
            <p style={{ whiteSpace: 'pre-line' }}>{order.delivery_address}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>SKU</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item: any) => (
              <tr key={item.id}>
                <td>{item.product?.name || 'Product'}</td>
                <td>{item.product?.sku || '-'}</td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(item.unit_price_cents)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(item.total_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals">
          <div className="total-row">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal_cents || order.total_cents)}</span>
          </div>
          <div className="total-row">
            <span>Delivery</span>
            <span>{formatCurrency(order.delivery_fee_cents || 0)}</span>
          </div>
          <div className="total-row grand">
            <span>Total</span>
            <span>{formatCurrency(order.total_cents)}</span>
          </div>
        </div>

        <div className="footer">
          <p>Thank you for shopping with Jeffy Commerce!</p>
          <p>Questions? Contact us at support@jeffy.co.za</p>
        </div>
      </body>
    </html>
  );
}
