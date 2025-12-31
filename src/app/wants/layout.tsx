import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request Products | Jeffy - Vote for What You Want',
  description: '50 votes = we source it. First requester gets it FREE. Request any product and share to get votes.',
  openGraph: {
    title: 'Request Products on Jeffy',
    description: '50 votes = we source it. First requester gets it FREE!',
    url: 'https://jeffy.co.za/wants',
    siteName: 'Jeffy',
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Request Products on Jeffy',
    description: '50 votes = we source it. First requester gets it FREE!',
  },
};

export default function WantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
