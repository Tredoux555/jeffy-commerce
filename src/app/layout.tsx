import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: 'Jeffy Commerce - Shop Smart, Save Big',
  description: 'South African e-commerce platform with products sourced directly from China.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gray-900 text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">© 2024 Jeffy Commerce. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
