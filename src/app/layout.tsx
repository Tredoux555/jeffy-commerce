import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { WhatsAppSupport } from "@/components/whatsapp-share";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { CartReminderBanner } from "@/components/cart-reminder-banner";
import { BackToTop } from "@/components/back-to-top";

export const metadata: Metadata = {
  title: {
    default: "Jeffy Commerce - Eish, These Prices!",
    template: "%s | Jeffy Commerce",
  },
  description: "Get products FREE with Jeffy Wants! Create a want, share with 10 friends, and get your product completely FREE. South Africa's most exciting shopping experience.",
  keywords: ["free products", "group buying", "South Africa", "shopping", "deals", "Jeffy"],
  authors: [{ name: "Jeffy Commerce" }],
  creator: "Jeffy Commerce (Pty) Ltd",
  publisher: "Jeffy Commerce (Pty) Ltd",
  metadataBase: new URL("https://jeffy.co.za"),
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://jeffy.co.za",
    siteName: "Jeffy Commerce",
    title: "Jeffy Commerce - Get Products FREE!",
    description: "Create a want, share with 10 friends, get your product FREE! South Africa's most exciting shopping experience.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jeffy Commerce - Eish, These Prices!",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jeffy Commerce - Get Products FREE!",
    description: "Create a want, share with 10 friends, get your product FREE!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ff6b35",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <Providers>
          <Header />
          <main className="pb-20 lg:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
          <CartReminderBanner />
          <BackToTop />
          <WhatsAppSupport />
        </Providers>
      </body>
    </html>
  );
}
// Build trigger Fri Dec 26 16:27:16 CST 2025
