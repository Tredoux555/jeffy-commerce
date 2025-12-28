import QRCode from 'qrcode';
import crypto from 'crypto';

export interface QRCodeData {
  orderId: string;
  orderNumber: string;
  verificationCode: string;
  type: 'delivery' | 'confirmation';
  createdAt: string;
}

/**
 * Generate a unique verification code for an order
 */
export function generateVerificationCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Create QR code data payload
 */
export function createQRPayload(
  orderId: string,
  orderNumber: string,
  verificationCode: string,
  type: 'delivery' | 'confirmation' = 'delivery'
): QRCodeData {
  return {
    orderId,
    orderNumber,
    verificationCode,
    type,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate QR code as data URL (for display in browser)
 */
export async function generateQRCodeDataURL(data: QRCodeData): Promise<string> {
  const payload = JSON.stringify(data);
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(data: QRCodeData): Promise<string> {
  const payload = JSON.stringify(data);
  return QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    width: 200,
    margin: 1,
  });
}

/**
 * Generate a simple URL-based QR code for scanning
 * This creates a URL that the Jeffy app/website can handle
 */
export async function generateDeliveryQRCode(
  orderId: string,
  orderNumber: string,
  verificationCode: string,
  baseUrl: string = 'https://jeffy.co.za'
): Promise<string> {
  // URL format: /delivery/scan/ORDER_NUMBER/VERIFICATION_CODE
  const scanUrl = `${baseUrl}/delivery/scan/${orderNumber}/${verificationCode}`;
  
  return QRCode.toDataURL(scanUrl, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
  });
}

/**
 * Parse QR code data from scanned payload
 */
export function parseQRPayload(payload: string): QRCodeData | null {
  try {
    // First try JSON format
    const data = JSON.parse(payload);
    if (data.orderId && data.orderNumber && data.verificationCode) {
      return data as QRCodeData;
    }
  } catch {
    // If not JSON, try URL format
    const urlMatch = payload.match(/\/delivery\/scan\/([^\/]+)\/([^\/]+)/);
    if (urlMatch) {
      return {
        orderId: '', // Will need to look up from orderNumber
        orderNumber: urlMatch[1],
        verificationCode: urlMatch[2],
        type: 'delivery',
        createdAt: new Date().toISOString(),
      };
    }
  }
  return null;
}
