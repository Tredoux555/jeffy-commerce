import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wish List | Jeffy',
  description: 'Add the products you wish for. Popular wishes get sourced — and Jeffy grants one wish free every month.',
  openGraph: {
    title: 'The Jeffy Wish List',
    description: 'Add your wish. Popular wishes get sourced, and one is granted free every month.',
    url: 'https://jeffy.co.za/wants',
    siteName: 'Jeffy',
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Jeffy Wish List',
    description: 'Add your wish. Popular wishes get sourced, and one is granted free every month.',
  },
};

export default function WantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
