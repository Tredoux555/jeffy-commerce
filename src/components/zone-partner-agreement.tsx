'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZonePartnerAgreementProps {
  partnerData: {
    fullName: string;
    email: string;
    phone: string;
    zoneName: string;
    acceptanceDate: string;
  };
  onAccept: (data: any) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function ZonePartnerAgreement({
  partnerData,
  onAccept,
  isLoading = false,
  error = null,
}: ZonePartnerAgreementProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const scrollPercent = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    setScrollProgress(scrollPercent);
  };

  const handleAcceptClick = async () => {
    if (!accepted) {
      alert('Please read and accept the agreement');
      return;
    }

    setSubmitting(true);

    try {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const device = typeof navigator !== 'undefined'
        ? /Mobile|Android|iPhone|iPad/.test(userAgent)
          ? 'mobile'
          : 'desktop'
        : 'unknown';

      let ipAddress = 'unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
        if (ipResponse?.ok) {
          const { ip } = await ipResponse.json();
          ipAddress = ip;
        }
      } catch (err) {
        console.log('Could not fetch IP address');
      }

      const agreementText = generateAgreementText(partnerData);
      const agreementHash = await generateHash(agreementText);

      await onAccept({
        accepted: true,
        acceptedAt: new Date().toISOString(),
        ipAddress,
        device,
        userAgent,
        agreementHash,
      });

      setSuccess(true);
    } catch (err) {
      console.error('Error accepting agreement:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-12">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Welcome, Partner!</h2>
            <p className="text-white/90">
              Confirmation sent to <strong>{partnerData.email}</strong>
            </p>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-4">
            We'll WhatsApp you to arrange your first stock order...
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-orange-500 mx-auto" />
        </div>
      </div>
    );
  }

  const acceptanceDate = new Date(partnerData.acceptanceDate);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-8 py-6">
        <h1 className="text-2xl font-bold text-white">Zone Partner Agreement</h1>
        <p className="text-white/90 mt-1">Wholesale Partnership Agreement</p>
      </div>

      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-200"
          style={{ width: `${Math.max(scrollProgress * 100 + 5, 5)}%` }}
        />
      </div>

      <div
        className="p-8 overflow-y-auto max-h-[500px] border-b-2 border-gray-200 bg-gradient-to-b from-white to-gray-50"
        onScroll={handleScroll}
      >
        <div className="space-y-6 text-gray-800 max-w-3xl">
          {/* Header */}
          <div className="border-b-2 border-orange-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">JEFFY ZONE PARTNER AGREEMENT</h2>
            <p className="text-sm text-gray-600 mb-4">Wholesale Purchase Agreement with Trade Credit</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Effective Date</p>
                <p className="font-semibold text-gray-900">{acceptanceDate.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Your Zone</p>
                <p className="font-semibold text-orange-600">{partnerData.zoneName}</p>
              </div>
              <div>
                <p className="text-gray-600">Partner Name</p>
                <p className="font-semibold text-gray-900">{partnerData.fullName}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold text-gray-900 text-sm break-all">{partnerData.email}</p>
              </div>
            </div>
          </div>

          {/* 1. The Relationship */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">1. WHAT THIS IS</h3>
            <p className="text-sm leading-relaxed text-gray-700 mb-3">
              This is a <strong>wholesale purchase agreement</strong>. You are starting your own independent business in <strong>{partnerData.zoneName}</strong>. You buy products from Jeffy at wholesale prices and sell them to your customers at retail prices. You keep the profit.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-blue-900 mb-2">You are an INDEPENDENT BUSINESS OWNER:</p>
              <ul className="text-blue-800 space-y-1">
                <li>• You buy stock from Jeffy - you OWN that stock</li>
                <li>• You set your own selling prices</li>
                <li>• You keep all profit above your purchase price</li>
                <li>• You work your own hours</li>
                <li>• You can work with other suppliers (Makro, wholesalers, etc.)</li>
                <li>• You can hire your own staff or subcontract deliveries</li>
                <li>• You are NOT a Jeffy employee</li>
              </ul>
            </div>
          </div>

          {/* 2. How Buying Works */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">2. HOW STOCK BUYING WORKS</h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm mb-3">
              <p className="font-semibold text-orange-900 mb-2">The Deal:</p>
              <ul className="text-orange-800 space-y-1">
                <li>• <strong>Starter Deposit:</strong> R500 (refundable after 3 successful payment cycles)</li>
                <li>• <strong>First Order:</strong> R2,500 worth of stock</li>
                <li>• <strong>Payment Terms:</strong> Net 7 (pay within 7 days of receiving stock)</li>
                <li>• <strong>Balance Due:</strong> R2,000 within 7 days</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-green-900 mb-2">After 3 Successful Cycles:</p>
              <ul className="text-green-800 space-y-1">
                <li>• Deposit refunded or applied to stock</li>
                <li>• Credit limit increases based on performance</li>
                <li>• Payment terms may extend to Net 14</li>
              </ul>
            </div>
          </div>

          {/* 3. Ownership & Risk */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">3. OWNERSHIP AND RISK</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-purple-900 mb-2">When stock is delivered to you:</p>
              <ul className="text-purple-800 space-y-1">
                <li>• <strong>Ownership transfers to YOU</strong> at delivery</li>
                <li>• The stock is YOUR property</li>
                <li>• You owe Jeffy the purchase price (trade credit)</li>
                <li>• Risk of loss, theft, or damage is YOURS</li>
                <li>• If stock doesn't sell, that is YOUR business risk</li>
              </ul>
            </div>
            <p className="text-sm text-gray-700 mt-3">
              This is how all wholesale businesses work. You are a real business owner with real business risk.
            </p>
          </div>

          {/* 4. Your Zone */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">4. YOUR EXCLUSIVE ZONE</h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-orange-900 mb-2">Your Territory: {partnerData.zoneName}</p>
              <p className="text-orange-800">
                Jeffy will not appoint other Zone Partners to operate in your designated area. You have exclusive rights to service customers in this zone through the Jeffy platform.
              </p>
            </div>
          </div>

          {/* 5. Pricing */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">5. PRICING</h3>
            <p className="text-sm text-gray-700 mb-3">
              You buy from Jeffy at <strong>wholesale prices</strong>. You sell at <strong>whatever price you choose</strong>.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-green-900 mb-2">Example:</p>
              <div className="space-y-1 text-green-800">
                <p>You buy from Jeffy: <strong>R100</strong></p>
                <p>Suggested retail: <strong>R199</strong></p>
                <p>Your profit if sold at suggested: <strong>R99</strong></p>
                <p className="text-gray-600 text-xs mt-2">You can sell higher or lower - it's your business.</p>
              </div>
            </div>
          </div>

          {/* 6. Payment Terms */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">6. PAYMENT TERMS</h3>
            <ul className="text-sm space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Due Date:</strong> Payment is due within 7 days of stock delivery</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Method:</strong> EFT to Jeffy's bank account or approved payment method</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Late Payment:</strong> Stock supply will be paused until account is settled</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Non-Payment:</strong> Outstanding amounts are debts owed to Jeffy and may be pursued through legal debt collection</span>
              </li>
            </ul>
          </div>

          {/* 7. Your Responsibilities */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">7. YOUR RESPONSIBILITIES</h3>
            <ul className="text-sm space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Vehicle:</strong> Provide your own reliable vehicle with valid license and insurance</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Phone:</strong> Provide your own smartphone with WhatsApp</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Expenses:</strong> Pay your own fuel, airtime, and business expenses</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Stock Care:</strong> Keep purchased stock safe and in sellable condition</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Customer Service:</strong> Deliver professionally and handle customer queries</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Taxes:</strong> Register with SARS and pay your own income tax</span>
              </li>
            </ul>
          </div>

          {/* 8. Tax */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">8. TAX RESPONSIBILITIES</h3>
            <p className="text-sm mb-2 text-gray-700">
              You are an independent business owner responsible for your own taxes:
            </p>
            <ul className="text-sm space-y-2 text-gray-700 ml-4">
              <li>• Declare all business income on your annual tax return (ITR12)</li>
              <li>• Register for provisional tax if earning over R91,250/year</li>
              <li>• Register for VAT if turnover exceeds R1,000,000/year</li>
              <li>• Keep records of all purchases from Jeffy and all sales</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              Jeffy will provide you with invoices for all stock purchases for your records.
            </p>
          </div>

          {/* 9. Termination */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">9. ENDING THE PARTNERSHIP</h3>
            <ul className="text-sm space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Cooling Off:</strong> You have 10 business days to cancel without penalty</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Notice:</strong> Either party may terminate with 14 days written notice</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Outstanding Payments:</strong> All amounts owed must be settled on termination</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Deposit:</strong> Refunded within 14 days of termination if no amounts outstanding</span>
              </li>
            </ul>
          </div>

          {/* 10. Governing Law */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-xs text-gray-700">
            <p className="font-semibold mb-2">GOVERNING LAW</p>
            <p>
              This agreement is governed by the laws of South Africa. Any disputes will be resolved through mediation, and if necessary, the courts of South Africa.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 bg-gradient-to-b from-white to-gray-50 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            id="agree"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            disabled={isLoading || submitting}
            className="w-5 h-5 mt-1 rounded border-gray-300 text-orange-500 cursor-pointer flex-shrink-0"
          />
          <span className="text-sm text-gray-700">
            I have read and understand this Wholesale Partnership Agreement. I confirm I am starting an <strong>independent business</strong>, NOT becoming an employee. I understand I am <strong>buying stock</strong> from Jeffy and am responsible for payment within 7 days. <span className="text-red-500 font-bold">*</span>
          </span>
        </label>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            disabled={submitting || isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAcceptClick}
            disabled={!accepted || isLoading || submitting}
            className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
          >
            {submitting || isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              '✓ Accept & Start My Business'
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-600 text-center pt-2">
          Agreement dated {acceptanceDate.toLocaleDateString()}.
          <br />
          Confirmation will be sent to {partnerData.email}.
        </p>
      </div>
    </div>
  );
}

function generateAgreementText(partnerData: any): string {
  const date = new Date(partnerData.acceptanceDate);
  return `
ZONE_PARTNER_WHOLESALE_AGREEMENT
Version: 2.0
Type: Wholesale Purchase Agreement with Trade Credit
Partner: ${partnerData.fullName}
Zone: ${partnerData.zoneName}
Email: ${partnerData.email}
Phone: ${partnerData.phone}
Accepted: ${date.toISOString()}
Terms: Net 7, R500 deposit, R2500 starter stock
  `.trim();
}

async function generateHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}