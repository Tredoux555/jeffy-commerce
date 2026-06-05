import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wish List | Jeffy',
  description: 'Tell us what you want — no purchase, no catch. Every week Jeffy draws winners at random and grants their wish free.',
  openGraph: {
    title: 'The Jeffy Wish List',
    description: 'Make a wish. Every week we draw winners at random and grant their wish free.',
    url: 'https://jeffy.co.za/wants',
    siteName: 'Jeffy',
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Jeffy Wish List',
    description: 'Make a wish. Every week we draw winners at random and grant their wish free.',
  },
};

export default function WantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
