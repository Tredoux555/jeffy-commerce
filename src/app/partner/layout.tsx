import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What is Jeffy | Zone Partners',
  description: 'This isn\'t a store. It\'s a movement. Join us as a Zone Partner and be part of the future.',
  openGraph: {
    title: 'What is Jeffy - Zone Partners',
    description: 'This isn\'t a store. It\'s a movement.',
    url: 'https://jeffy.co.za/partner',
    siteName: 'Jeffy',
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What is Jeffy - Zone Partners',
    description: 'This isn\'t a store. It\'s a movement.',
  },
};

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
