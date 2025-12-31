import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a Zone Partner | Jeffy - Deliver & Earn 50%',
  description: 'Join Jeffy as a Zone Partner. Deliver products in your area, earn 50% profit share. Low startup cost, your own business.',
  openGraph: {
    title: 'Become a Jeffy Zone Partner',
    description: 'Deliver products, earn 50% profit. Your own business with low startup cost.',
    url: 'https://jeffy.co.za/zone-partners',
    siteName: 'Jeffy',
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become a Jeffy Zone Partner',
    description: 'Deliver products, earn 50% profit. Your own business.',
  },
};

export default function ZonePartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
