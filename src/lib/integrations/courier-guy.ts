/**
 * The Courier Guy Integration Framework
 * South African shipping & logistics
 * 
 * To activate: Add these env vars:
 * - COURIER_GUY_API_KEY
 * - COURIER_GUY_ACCOUNT_ID
 */

const COURIER_GUY_API = 'https://api.thecourierguy.co.za/v1';

interface Address {
  company?: string;
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
}

interface ShipmentData {
  from: Address;
  to: Address;
  parcels: Array<{
    weight: number; // kg
    length: number; // cm
    width: number;
    height: number;
  }>;
  reference?: string;
}

interface QuoteResponse {
  rates: Array<{
    service: string;
    price: number;
    estimatedDays: number;
  }>;
}

export async function getShippingQuotes(data: ShipmentData): Promise<QuoteResponse> {
  const apiKey = process.env.COURIER_GUY_API_KEY;
  
  if (!apiKey) {
    // Return mock data for development
    return {
      rates: [
        { service: 'Economy', price: 9900, estimatedDays: 5 },
        { service: 'Standard', price: 14900, estimatedDays: 3 },
        { service: 'Express', price: 24900, estimatedDays: 1 },
      ],
    };
  }

  const response = await fetch(`${COURIER_GUY_API}/quotes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to get shipping quotes');
  }

  return response.json();
}

export async function createShipment(data: ShipmentData & { service: string }): Promise<{ trackingNumber: string; labelUrl: string }> {
  const apiKey = process.env.COURIER_GUY_API_KEY;
  
  if (!apiKey) {
    // Mock response for development
    return {
      trackingNumber: `TCG${Date.now()}`,
      labelUrl: 'https://example.com/label.pdf',
    };
  }

  const response = await fetch(`${COURIER_GUY_API}/shipments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create shipment');
  }

  return response.json();
}

export async function trackShipment(trackingNumber: string): Promise<{ status: string; events: Array<{ date: string; description: string }> }> {
  const apiKey = process.env.COURIER_GUY_API_KEY;
  
  if (!apiKey) {
    return {
      status: 'in_transit',
      events: [
        { date: new Date().toISOString(), description: 'Parcel collected' },
        { date: new Date().toISOString(), description: 'In transit to destination' },
      ],
    };
  }

  const response = await fetch(`${COURIER_GUY_API}/tracking/${trackingNumber}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });

  return response.json();
}

// Default sender address (your warehouse)
export const DEFAULT_SENDER: Address = {
  company: 'Jeffy Commerce',
  street: '123 Main Road',
  suburb: 'Sandton',
  city: 'Johannesburg',
  province: 'Gauteng',
  postalCode: '2196',
  country: 'ZA',
};
