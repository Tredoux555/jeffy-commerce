import { addDays, differenceInDays, isSaturday, isSunday, addBusinessDays } from 'date-fns';

/**
 * CPA (Consumer Protection Act) Compliance Functions
 * South Africa requires these waiting periods for franchise agreements
 */

/**
 * Check if partner can sign agreement (14-day wait after disclosure)
 */
export function canSignAgreement(disclosureSentAt: Date | null): { 
  allowed: boolean; 
  daysRemaining: number;
  canSignAfter: Date | null;
} {
  if (!disclosureSentAt) {
    return { 
      allowed: false, 
      daysRemaining: 14,
      canSignAfter: null
    };
  }

  const disclosureDate = new Date(disclosureSentAt);
  const canSignAfter = addDays(disclosureDate, 14);
  const today = new Date();
  
  const daysRemaining = Math.max(0, differenceInDays(canSignAfter, today));
  const allowed = today >= canSignAfter;

  return {
    allowed,
    daysRemaining,
    canSignAfter
  };
}

/**
 * Get cooling off period status (10 BUSINESS days after signing)
 * Partner can cancel freely during this period
 */
export function getCoolingOffStatus(agreementSignedAt: Date | null): { 
  inCoolingOff: boolean; 
  businessDaysRemaining: number;
  coolingOffEnds: Date | null;
} {
  if (!agreementSignedAt) {
    return { 
      inCoolingOff: false, 
      businessDaysRemaining: 0,
      coolingOffEnds: null
    };
  }

  const signedDate = new Date(agreementSignedAt);
  const coolingOffEnds = addBusinessDays(signedDate, 10);
  const today = new Date();
  
  // Count remaining business days
  let businessDaysRemaining = 0;
  let checkDate = new Date(today);
  
  while (checkDate < coolingOffEnds) {
    checkDate = addDays(checkDate, 1);
    if (!isSaturday(checkDate) && !isSunday(checkDate)) {
      businessDaysRemaining++;
    }
  }

  const inCoolingOff = today < coolingOffEnds;

  return {
    inCoolingOff,
    businessDaysRemaining: Math.max(0, businessDaysRemaining),
    coolingOffEnds
  };
}

/**
 * Calculate refund amount if partner exits
 * - Full refund during cooling off period
 * - Deduct damaged stock value after cooling off
 */
export function calculateExitRefund(
  depositCents: number, 
  inCoolingOff: boolean, 
  damagedStockCents: number = 0
): { 
  refundCents: number;
  deductionCents: number;
  reason: string;
} {
  if (inCoolingOff) {
    // Full refund during cooling off - CPA requirement
    return {
      refundCents: depositCents,
      deductionCents: 0,
      reason: 'Full refund - within 10 business day cooling off period'
    };
  }

  // After cooling off, can deduct damaged/used stock
  const deductionCents = Math.min(damagedStockCents, depositCents);
  const refundCents = depositCents - deductionCents;

  return {
    refundCents,
    deductionCents,
    reason: deductionCents > 0 
      ? `Refund after deducting R${(deductionCents / 100).toFixed(2)} for damaged/used stock`
      : 'Full refund - no stock deductions'
  };
}

/**
 * Get full compliance status for a partner
 */
export function getPartnerComplianceStatus(partner: {
  disclosure_sent_at: Date | null;
  agreement_signed_at: Date | null;
  deposit_paid_at: Date | null;
  training_completed_at: Date | null;
  stock_received_at: Date | null;
  is_active: boolean;
}) {
  const signStatus = canSignAgreement(partner.disclosure_sent_at);
  const coolingStatus = getCoolingOffStatus(partner.agreement_signed_at);

  const steps = [
    { 
      name: 'Disclosure Sent', 
      complete: !!partner.disclosure_sent_at,
      date: partner.disclosure_sent_at
    },
    { 
      name: '14-Day Wait', 
      complete: signStatus.allowed,
      daysRemaining: signStatus.daysRemaining
    },
    { 
      name: 'Agreement Signed', 
      complete: !!partner.agreement_signed_at,
      date: partner.agreement_signed_at
    },
    { 
      name: 'Cooling Off Period', 
      complete: !coolingStatus.inCoolingOff && !!partner.agreement_signed_at,
      inProgress: coolingStatus.inCoolingOff,
      businessDaysRemaining: coolingStatus.businessDaysRemaining
    },
    { 
      name: 'Deposit Paid', 
      complete: !!partner.deposit_paid_at,
      date: partner.deposit_paid_at
    },
    { 
      name: 'Training Completed', 
      complete: !!partner.training_completed_at,
      date: partner.training_completed_at
    },
    { 
      name: 'Stock Received', 
      complete: !!partner.stock_received_at,
      date: partner.stock_received_at
    },
  ];

  const completedSteps = steps.filter(s => s.complete).length;
  const canActivate = completedSteps === steps.length;

  return {
    steps,
    completedSteps,
    totalSteps: steps.length,
    canActivate,
    isActive: partner.is_active,
    signStatus,
    coolingStatus
  };
}



