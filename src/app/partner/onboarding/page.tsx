'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { canSignAgreement, getCoolingOffStatus } from '@/lib/cpa-compliance';
import { 
  CheckCircle2, 
  Clock, 
  FileText,
  CreditCard,
  GraduationCap,
  Package,
  Rocket,
  AlertCircle,
  ChevronRight,
  Shield
} from 'lucide-react';
import Link from 'next/link';

interface PartnerData {
  id: string;
  full_name: string;
  email: string;
  disclosure_sent_at: string | null;
  can_sign_after: string | null;
  agreement_signed_at: string | null;
  cooling_off_ends_at: string | null;
  deposit_paid_at: string | null;
  training_completed_at: string | null;
  stock_received_at: string | null;
  is_active: boolean;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'complete' | 'current' | 'upcoming' | 'blocked';
  info?: string;
  action?: { label: string; href: string } | null;
}

export default function PartnerOnboardingPage() {
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Please log in to view your onboarding status');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('zone_partners')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error) throw error;
        setPartner(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, []);

  const getSteps = (partner: PartnerData): Step[] => {
    const signStatus = canSignAgreement(partner.disclosure_sent_at ? new Date(partner.disclosure_sent_at) : null);
    const coolingStatus = getCoolingOffStatus(partner.agreement_signed_at ? new Date(partner.agreement_signed_at) : null);
    
    const now = new Date();
    const canSign = partner.can_sign_after ? now >= new Date(partner.can_sign_after) : false;
    const coolingOffComplete = partner.agreement_signed_at && !coolingStatus.inCoolingOff;

    let currentStep = 0;
    if (partner.disclosure_sent_at) currentStep = 1;
    if (canSign) currentStep = 2;
    if (partner.agreement_signed_at) currentStep = 3;
    if (coolingOffComplete) currentStep = 4;
    if (partner.deposit_paid_at) currentStep = 5;
    if (partner.training_completed_at) currentStep = 6;
    if (partner.stock_received_at) currentStep = 7;
    if (partner.is_active) currentStep = 8;

    const getStatus = (stepNum: number, isBlocked: boolean = false): 'complete' | 'current' | 'upcoming' | 'blocked' => {
      if (stepNum < currentStep) return 'complete';
      if (stepNum === currentStep) return isBlocked ? 'blocked' : 'current';
      return 'upcoming';
    };

    return [
      {
        id: 'disclosure',
        title: 'Disclosure Document Sent',
        description: "We've sent you the CPA-required disclosure document",
        icon: <FileText className="w-6 h-6" />,
        status: partner.disclosure_sent_at ? 'complete' : 'current',
        info: partner.disclosure_sent_at 
          ? `Sent on ${new Date(partner.disclosure_sent_at).toLocaleDateString()}`
          : 'Waiting for admin approval',
      },
      {
        id: 'wait',
        title: '14-Day Waiting Period',
        description: 'Legal requirement before signing agreement',
        icon: <Clock className="w-6 h-6" />,
        status: getStatus(2, !partner.disclosure_sent_at),
        info: partner.can_sign_after
          ? canSign 
            ? '✓ Waiting period complete!'
            : `${signStatus.daysRemaining} days remaining (can sign after ${new Date(partner.can_sign_after).toLocaleDateString()})`
          : 'Starts when disclosure is sent',
      },
      {
        id: 'sign',
        title: 'Sign Agreement',
        description: 'Review and sign the Zone Partner agreement',
        icon: <Shield className="w-6 h-6" />,
        status: partner.agreement_signed_at ? 'complete' : getStatus(3, !canSign),
        info: partner.agreement_signed_at
          ? `Signed on ${new Date(partner.agreement_signed_at).toLocaleDateString()}`
          : canSign ? 'Ready to sign!' : 'Available after waiting period',
        action: !partner.agreement_signed_at && canSign 
          ? { label: 'Sign Agreement', href: `/partner/agreement/${partner.id}` }
          : null,
      },
      {
        id: 'cooling',
        title: 'Cooling-Off Period',
        description: '10 business days - you can cancel freely during this time',
        icon: <Clock className="w-6 h-6" />,
        status: coolingOffComplete ? 'complete' : getStatus(4, !partner.agreement_signed_at),
        info: partner.agreement_signed_at
          ? coolingStatus.inCoolingOff
            ? `${coolingStatus.businessDaysRemaining} business days remaining`
            : '✓ Cooling-off period complete'
          : 'Starts after signing',
      },
      {
        id: 'deposit',
        title: 'Pay Deposit',
        description: 'Secure your zone with the starter deposit',
        icon: <CreditCard className="w-6 h-6" />,
        status: partner.deposit_paid_at ? 'complete' : getStatus(5, !coolingOffComplete),
        info: partner.deposit_paid_at
          ? `Paid on ${new Date(partner.deposit_paid_at).toLocaleDateString()}`
          : coolingOffComplete ? 'Ready to pay' : 'Available after cooling-off period',
        action: !partner.deposit_paid_at && coolingOffComplete
          ? { label: 'Pay Deposit', href: '/partner/deposit' }
          : null,
      },
      {
        id: 'training',
        title: 'Complete Training',
        description: 'Watch training videos and pass the quiz',
        icon: <GraduationCap className="w-6 h-6" />,
        status: partner.training_completed_at ? 'complete' : getStatus(6, !partner.deposit_paid_at),
        info: partner.training_completed_at
          ? `Completed on ${new Date(partner.training_completed_at).toLocaleDateString()}`
          : partner.deposit_paid_at ? 'Ready to start' : 'Available after deposit',
        action: !partner.training_completed_at && partner.deposit_paid_at
          ? { label: 'Start Training', href: '/partner/training' }
          : null,
      },
      {
        id: 'stock',
        title: 'Receive Stock',
        description: 'Confirm delivery of your starter stock kit',
        icon: <Package className="w-6 h-6" />,
        status: partner.stock_received_at ? 'complete' : getStatus(7, !partner.training_completed_at),
        info: partner.stock_received_at
          ? `Received on ${new Date(partner.stock_received_at).toLocaleDateString()}`
          : partner.training_completed_at ? 'Confirm when delivered' : 'After training',
        action: !partner.stock_received_at && partner.training_completed_at
          ? { label: 'Confirm Receipt', href: '/partner/stock-confirm' }
          : null,
      },
      {
        id: 'golive',
        title: 'Go Live!',
        description: 'Start receiving orders in your zone',
        icon: <Rocket className="w-6 h-6" />,
        status: partner.is_active ? 'complete' : getStatus(8, !partner.stock_received_at),
        info: partner.is_active
          ? '🎉 You\'re live! Orders will be assigned to you.'
          : partner.stock_received_at ? 'Admin will activate your account' : 'Final step!',
      },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jeffy-500"></div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <div className="bg-navy-800 rounded-xl p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white mb-4">{error || 'Partner not found'}</p>
          <Link href="/partner/login" className="text-jeffy-400 hover:text-jeffy-300">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const steps = getSteps(partner);
  const completedSteps = steps.filter(s => s.status === 'complete').length;

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="bg-navy-800 border-b border-navy-700">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white">Partner Onboarding</h1>
          <p className="text-navy-300 mt-1">Welcome, {partner.full_name}!</p>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-navy-400 mb-2">
              <span>Progress</span>
              <span>{completedSteps} of {steps.length} steps</span>
            </div>
            <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-jeffy-500 to-jeffy-400 rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`rounded-xl p-4 transition-all ${
                step.status === 'complete' ? 'bg-navy-800/50 border border-green-500/30' :
                step.status === 'current' ? 'bg-navy-800 border-2 border-jeffy-500 shadow-lg shadow-jeffy-500/20' :
                'bg-navy-800/30 border border-navy-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  step.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                  step.status === 'current' ? 'bg-jeffy-500/20 text-jeffy-400' :
                  'bg-navy-700 text-navy-500'
                }`}>
                  {step.status === 'complete' ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${
                      step.status === 'complete' || step.status === 'current' ? 'text-white' : 'text-navy-400'
                    }`}>
                      {step.title}
                    </h3>
                    {step.status === 'current' && (
                      <span className="px-2 py-0.5 text-xs bg-jeffy-500 text-white rounded-full">Current</span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${
                    step.status === 'complete' || step.status === 'current' ? 'text-navy-300' : 'text-navy-500'
                  }`}>
                    {step.description}
                  </p>
                  {step.info && (
                    <p className={`text-sm mt-2 ${
                      step.status === 'complete' ? 'text-green-400' :
                      step.status === 'current' ? 'text-jeffy-400' : 'text-navy-500'
                    }`}>
                      {step.info}
                    </p>
                  )}
                  {step.action && (
                    <Link
                      href={step.action.href}
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-jeffy-500 text-white rounded-lg hover:bg-jeffy-600 transition-colors text-sm font-medium"
                    >
                      {step.action.label}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {partner.is_active && (
          <div className="mt-8 bg-gradient-to-r from-green-500/20 to-jeffy-500/20 rounded-xl p-6 border border-green-500/30 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-white">You're Live!</h2>
            <p className="text-navy-300 mt-2">Orders in your zone will now be assigned to you automatically.</p>
            <Link
              href="/partner/dashboard"
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-jeffy-500 text-white rounded-lg hover:bg-jeffy-600 transition-colors font-medium"
            >
              Go to Dashboard
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}



