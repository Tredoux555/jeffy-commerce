import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jeffy - Quality Products at China Prices | Join the Waitlist',
  description: 'Skip the middleman. Get quality products direct from manufacturers at prices SA has never seen. Every purchase funds free schools.',
  openGraph: {
    title: 'Jeffy - Quality Products at China Prices',
    description: 'Skip the middleman. Get quality products direct from manufacturers. Every purchase funds free schools.',
    url: 'https://jeffy.co.za/coming-soon',
    siteName: 'Jeffy',
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jeffy - Quality Products at China Prices',
    description: 'Skip the middleman. Every purchase funds free schools.',
  },
};

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
