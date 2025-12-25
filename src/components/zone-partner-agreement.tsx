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
            <h2 className="text-3xl font-bold text-white mb-2">Agreement Accepted!</h2>
            <p className="text-white/90">
              A confirmation email has been sent to <strong>{partnerData.email}</strong>
            </p>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-4">
            You'll be redirected to your partner dashboard shortly...
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
        <p className="text-white/90 mt-1">Please review the agreement below</p>
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
          <div className="border-b-2 border-orange-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">JEFFY ZONE PARTNER AGREEMENT</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Effective Date</p>
                <p className="font-semibold text-gray-900">{acceptanceDate.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Zone</p>
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

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">1. WHAT IS A ZONE PARTNER?</h3>
            <p className="text-sm leading-relaxed text-gray-700">
              You are starting an independent delivery business in <strong>{partnerData.zoneName}</strong>. You are <strong>NOT an employee</strong> of Jeffy Commerce. You own and operate your own business, determine your own hours, can work with other platforms, and are responsible for your own taxes, insurance, and expenses.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">2. YOUR ZONE AND TERRITORY</h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-orange-900 mb-2">Your Delivery Zone: {partnerData.zoneName}</p>
              <p className="text-orange-800">
                You have the exclusive right to be the delivery partner in this zone. Jeffy will not assign other delivery partners to your territory.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">3. HOW YOU GET PAID (THE 50/50 SPLIT)</h3>
            <p className="text-sm mb-3 text-gray-700">You earn commission on every delivery completed in your zone.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm mb-3">
              <p className="font-semibold text-blue-900 mb-2">Commission Structure:</p>
              <div className="space-y-1 text-blue-800 font-mono">
                <p>You keep 100% of earnings from customers in {partnerData.zoneName}</p>
                <p>Jeffy handles platform costs and logistics</p>
                <p className="text-green-700 font-bold">You focus on delivering excellent service</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              Payments are made weekly by electronic transfer to your bank account.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">4. YOUR RESPONSIBILITIES</h3>
            <ul className="text-sm space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Vehicle:</strong> Own or control a reliable vehicle with valid insurance</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Performance:</strong> Complete 90%+ of deliveries with 4.0+ star rating</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Safety:</strong> Obey all traffic laws, no driving under influence</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Taxes:</strong> Register with SARS, pay your own income tax</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Insurance:</strong> Maintain R1-5 million public liability insurance</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">5. TAX RESPONSIBILITIES</h3>
            <p className="text-sm mb-2 text-gray-700">
              You are an independent contractor responsible for your own taxes:
            </p>
            <ul className="text-sm space-y-2 text-gray-700 ml-4">
              <li>• Declare all earnings on your annual ITR12</li>
              <li>• Pay provisional tax if earning over R91,250/year</li>
              <li>• Register for VAT if earning over R1,000,000/year</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">6. NON-COMPETE (12 MONTHS POST-PARTNERSHIP)</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-900">
              <p>
                For <strong>12 months after partnership ends</strong>, you cannot work as a delivery partner in <strong>{partnerData.zoneName}</strong> with other platforms.
              </p>
            </div>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-xs text-gray-700 mt-6">
            <p className="font-semibold mb-2">IMPORTANT LEGAL NOTICE</p>
            <p>
              This agreement is governed by South African law. You have <strong>10 business days</strong> after accepting to cancel without penalty.
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
            I have read and fully understand the Zone Partner Agreement. I confirm all information is accurate and agree to be an independent contractor. <span className="text-red-500 font-bold">*</span>
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
                Accepting...
              </>
            ) : (
              '✓ Accept Agreement'
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-600 text-center pt-2">
          Confirming acceptance on {acceptanceDate.toLocaleDateString()}.
          <br />
          Confirmation email will be sent to {partnerData.email}.
        </p>
      </div>
    </div>
  );
}

function generateAgreementText(partnerData: any): string {
  const date = new Date(partnerData.acceptanceDate);
  return `
ZONE_PARTNER_AGREEMENT
Partner: ${partnerData.fullName}
Zone: ${partnerData.zoneName}
Email: ${partnerData.email}
Phone: ${partnerData.phone}
Accepted: ${date.toISOString()}
Version: 1.0
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

