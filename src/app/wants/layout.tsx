import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create a Want | Jeffy',
  description: 'Request any product. Get 10 people to agree. If we source it, you get it FREE.',
  openGraph: {
    title: 'Create a Want on Jeffy',
    description: 'Request any product. Get 10 votes. Get it FREE!',
    url: 'https://jeffy.co.za/wants',
    siteName: 'Jeffy',
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create a Want on Jeffy',
    description: 'Request any product. Get 10 votes. Get it FREE!',
  },
};

export default function WantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
