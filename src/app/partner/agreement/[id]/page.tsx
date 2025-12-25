'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import ZonePartnerAgreement from '@/components/zone-partner-agreement';

export default function AgreementPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAgreement, setShowAgreement] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [acceptanceError, setAcceptanceError] = useState<string | null>(null);

  useEffect(() => {
    const loadPartner = async () => {
      try {
        const supabase = createClient();
        const { data, error: queryError } = await supabase
          .from('zone_partners')
          .select('*')
          .eq('id', partnerId)
          .single();

        if (queryError || !data) {
          setError('Partner not found');
          setLoading(false);
          return;
        }

        if (data.agreed_to_terms) {
          setTimeout(() => {
            router.push('/partner/dashboard');
          }, 2000);
          return;
        }

        setPartner(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading partner:', err);
        setError('Failed to load partner information');
        setLoading(false);
      }
    };

    loadPartner();
  }, [partnerId, router]);

  const handleAcceptAgreement = async (acceptanceData: any) => {
    setAccepting(true);
    setAcceptanceError(null);

    try {
      const supabase = createClient();

      const { error: acceptanceError } = await supabase
        .from('zone_partner_acceptances')
        .insert({
          zone_partner_id: partnerId,
          full_name: partner.full_legal_name,
          email: partner.email,
          phone: partner.mobile,
          zone_name: partner.zone_name,
          accepted_at: acceptanceData.acceptedAt,
          accepted_ip: acceptanceData.ipAddress,
          accepted_device: acceptanceData.device,
          accepted_user_agent: acceptanceData.userAgent,
          agreement_version: '1.0',
          agreement_hash: acceptanceData.agreementHash,
        });

      if (acceptanceError) {
        console.error('Acceptance record error:', acceptanceError);
        throw new Error('Failed to record acceptance');
      }

      const { error: updateError } = await supabase
        .from('zone_partners')
        .update({
          agreed_to_terms: true,
          agreement_accepted_at: acceptanceData.acceptedAt,
          agreement_accepted_ip: acceptanceData.ipAddress,
          agreement_accepted_device: acceptanceData.device,
        })
        .eq('id', partnerId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Failed to update partner status');
      }

      const emailResponse = await fetch('/api/partner/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId,
          email: partner.email,
          fullName: partner.full_legal_name,
          zoneName: partner.zone_name,
          acceptedAt: acceptanceData.acceptedAt,
          phone: partner.mobile,
        }),
      });

      if (!emailResponse.ok) {
        console.warn('Email sending may have failed, but acceptance was recorded');
      }

      await supabase
        .from('zone_partner_acceptances')
        .update({
          confirmation_email_sent: emailResponse.ok,
          confirmation_email_sent_at: new Date().toISOString(),
        })
        .eq('zone_partner_id', partnerId);

      setTimeout(() => {
        router.push('/admin/partners/acceptances');
      }, 2000);
    } catch (err: any) {
      console.error('Error accepting agreement:', err);
      setAcceptanceError(err.message || 'Failed to accept agreement. Please try again.');
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Something went wrong'}</p>
          <Button onClick={() => router.push('/')} className="w-full bg-gradient-to-r from-orange-500 to-yellow-500">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!showAgreement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h1>
            <p className="text-xl text-orange-600 font-semibold mb-2">
              You've been qualified as a Zone Partner
            </p>
            <p className="text-lg text-gray-700">
              for <strong>{partner.zone_name}</strong>
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 my-8 border border-orange-200">
            <p className="text-sm font-semibold text-orange-900 mb-3">Here's what comes next:</p>
            <ul className="text-sm text-orange-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">✓</span>
                <span>Review and accept the Zone Partner Agreement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">✓</span>
                <span>Receive confirmation email with agreement details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">✓</span>
                <span>Access your Zone Partner Dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">✓</span>
                <span>Start receiving delivery requests in {partner.zone_name}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">✓</span>
                <span>Earn 50% commission on every delivery</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={() => setShowAgreement(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white py-6 rounded-lg font-semibold mb-3 text-lg"
          >
            Review Agreement & Accept
          </Button>

          <p className="text-xs text-gray-600 text-center">
            You have 10 business days to review and accept the agreement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <ZonePartnerAgreement
          partnerData={{
            fullName: partner.full_legal_name,
            email: partner.email,
            phone: partner.mobile,
            zoneName: partner.zone_name,
            acceptanceDate: new Date().toISOString(),
          }}
          onAccept={handleAcceptAgreement}
          isLoading={accepting}
          error={acceptanceError}
        />
      </div>
    </div>
  );
}

