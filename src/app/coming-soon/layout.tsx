import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jeffy - The Future of Retail Starts Here',
  description: 'Make a wish or become a Reseller. Join the movement that could change everything.',
  openGraph: {
    title: 'Jeffy - The Future of Retail',
    description: 'Make a wish or become a Reseller. Join the movement.',
    url: 'https://jeffy.co.za/coming-soon',
    siteName: 'Jeffy',
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jeffy - The Future of Retail',
    description: 'Make a wish or become a Reseller. Join the movement.',
  },
};

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
