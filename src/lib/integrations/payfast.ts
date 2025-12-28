/**
 * PayFast Integration Framework
 * South Africa's leading payment gateway
 * 
 * To activate: Add these env vars:
 * - PAYFAST_MERCHANT_ID
 * - PAYFAST_MERCHANT_KEY
 * - PAYFAST_PASSPHRASE
 * - PAYFAST_SANDBOX (true/false)
 */

const PAYFAST_SANDBOX_URL = 'https://sandbox.payfast.co.za/eng/process';
const PAYFAST_LIVE_URL = 'https://www.payfast.co.za/eng/process';

interface PayFastPaymentData {
  orderId: string;
  amount: number; // in cents
  itemName: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
}

export function generatePayFastForm(data: PayFastPaymentData): Record<string, string> {
  const merchantId = process.env.PAYFAST_MERCHANT_ID || 'YOUR_MERCHANT_ID';
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || 'YOUR_MERCHANT_KEY';
  const isSandbox = process.env.PAYFAST_SANDBOX === 'true';
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jeffy.co.za';
  
  return {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${baseUrl}/checkout/success?order_id=${data.orderId}`,
    cancel_url: `${baseUrl}/checkout?cancelled=true`,
    notify_url: `${baseUrl}/api/webhooks/payfast`,
    name_first: data.customerName?.split(' ')[0] || '',
    name_last: data.customerName?.split(' ').slice(1).join(' ') || '',
    email_address: data.customerEmail,
    cell_number: data.customerPhone || '',
    m_payment_id: data.orderId,
    amount: (data.amount / 100).toFixed(2),
    item_name: data.itemName,
  };
}

export function getPayFastUrl(): string {
  return process.env.PAYFAST_SANDBOX === 'true' ? PAYFAST_SANDBOX_URL : PAYFAST_LIVE_URL;
}

export function validatePayFastSignature(data: Record<string, string>, signature: string): boolean {
  // Implementation would use crypto to validate signature
  // For now, return true in sandbox mode
  if (process.env.PAYFAST_SANDBOX === 'true') return true;
  
  // TODO: Implement actual signature validation
  // const passphrase = process.env.PAYFAST_PASSPHRASE;
  // ...
  return false;
}

export const PayFastStatus = {
  COMPLETE: 'COMPLETE',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
} as const;
