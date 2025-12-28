/**
 * Yoco Integration Framework
 * South African card payments & POS
 * 
 * To activate: Add these env vars:
 * - YOCO_SECRET_KEY
 * - YOCO_PUBLIC_KEY
 */

const YOCO_API_URL = 'https://online.yoco.com/v1';

interface YocoPaymentData {
  amount: number; // in cents
  currency?: string;
  orderId: string;
  customerEmail?: string;
  description?: string;
}

interface YocoCheckoutResponse {
  id: string;
  redirectUrl: string;
}

export async function createYocoCheckout(data: YocoPaymentData): Promise<YocoCheckoutResponse> {
  const secretKey = process.env.YOCO_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('Yoco not configured. Add YOCO_SECRET_KEY to env vars.');
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jeffy.co.za';

  const response = await fetch(`${YOCO_API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: data.amount,
      currency: data.currency || 'ZAR',
      successUrl: `${baseUrl}/checkout/success?order_id=${data.orderId}`,
      cancelUrl: `${baseUrl}/checkout?cancelled=true`,
      failureUrl: `${baseUrl}/checkout?failed=true`,
      metadata: {
        orderId: data.orderId,
        email: data.customerEmail,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create Yoco checkout');
  }

  return response.json();
}

export async function verifyYocoPayment(checkoutId: string): Promise<boolean> {
  const secretKey = process.env.YOCO_SECRET_KEY;
  
  const response = await fetch(`${YOCO_API_URL}/checkouts/${checkoutId}`, {
    headers: {
      'Authorization': `Bearer ${secretKey}`,
    },
  });

  if (!response.ok) return false;
  
  const data = await response.json();
  return data.status === 'completed';
}

// Yoco Inline (for embedded payments)
export function getYocoPublicKey(): string {
  return process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY || 'pk_test_YOUR_KEY';
}
