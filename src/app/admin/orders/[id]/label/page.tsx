import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { generateDeliveryQRCode } from '@/lib/qr-code';

interface LabelPageProps {
  params: Promise<{ id: string }>;
}

export default async function LabelPage({ params }: LabelPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (!order) notFound();

  // Generate QR code
  const verificationCode = order.verification_code || order.tracking_number?.split('-')[2] || 'NOCODE';
  const qrCodeDataUrl = await generateDeliveryQRCode(
    order.id,
    order.order_number,
    verificationCode
  );

  return (
    <html>
      <head>
        <title>Shipping Label - {order.order_number}</title>
        <style>{`
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
            .label { page-break-after: always; }
          }
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .label {
            width: 4in;
            min-height: 6in;
            background: white;
            border: 2px solid #000;
            padding: 15px;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ff6b35;
            letter-spacing: 2px;
          }
          .order-number {
            font-size: 14px;
            font-family: monospace;
            margin-top: 5px;
          }
          .qr-section {
            text-align: center;
            padding: 15px 0;
            border-bottom: 1px dashed #ccc;
          }
          .qr-section img {
            width: 150px;
            height: 150px;
          }
          .scan-instruction {
            font-size: 10px;
            color: #666;
            margin-top: 8px;
          }
          .address-section {
            padding: 15px 0;
          }
          .section-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 5px;
          }
          .customer-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .address {
            font-size: 14px;
            line-height: 1.4;
            white-space: pre-line;
          }
          .phone {
            font-size: 14px;
            margin-top: 10px;
            font-weight: bold;
          }
          .footer {
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 15px;
            text-align: center;
          }
          .verification-code {
            font-family: monospace;
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 3px;
          }
          .print-btn {
            display: block;
            width: 4in;
            margin: 20px auto;
            padding: 15px;
            background: #ff6b35;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          }
          .print-btn:hover {
            background: #e55a2b;
          }
        `}</style>
      </head>
      <body>
        <button className="print-btn no-print" onClick="window.print()">
          🖨️ Print Label
        </button>

        <div className="label">
          <div className="header">
            <div className="logo">JEFFY</div>
            <div className="order-number">{order.order_number}</div>
          </div>

          <div className="qr-section">
            <img src={qrCodeDataUrl} alt="Delivery QR Code" />
            <div className="scan-instruction">
              Partner: Scan when packing<br/>
              Customer: Scan to confirm delivery
            </div>
          </div>

          <div className="address-section">
            <div className="section-label">Deliver To</div>
            <div className="customer-name">{order.customer_name || 'Customer'}</div>
            <div className="address">{order.delivery_address}</div>
            {order.customer_phone && (
              <div className="phone">📞 {order.customer_phone}</div>
            )}
          </div>

          <div className="footer">
            <div className="section-label">Verification Code</div>
            <div className="verification-code">{verificationCode}</div>
          </div>
        </div>

        <div className="no-print" style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          <p>Label size: 4" × 6" (standard shipping label)</p>
          <a href={`/admin/orders/${id}`} style={{ color: '#ff6b35' }}>← Back to Order</a>
        </div>
      </body>
    </html>
  );
}
