'use client';

import { useEffect, useState } from 'react';
import PartnerEarningsDashboard from '@/components/partner-earnings-dashboard';

export default function PartnerEarningsPage() {
  // In production, get zonePartnerId from user session/auth
  // For now, using a demo ID
  const [zonePartnerId, setZonePartnerId] = useState<string>('');

  useEffect(() => {
    // TODO: Get actual zone_partner_id from authenticated user
    // For demo: use a sample ID from your database
    setZonePartnerId('demo-zone-partner-id');
  }, []);

  if (!zonePartnerId) {
    return <div className="min-h-screen bg-[#0f172a] text-white p-8 flex items-center justify-center"><p>Loading...</p></div>;
  }

  return <PartnerEarningsDashboard zonePartnerId={zonePartnerId} />;
}





