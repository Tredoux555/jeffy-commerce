import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Jeffy Commerce",
  description: "Zone partner application system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="bg-[#0f172a] text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">© 2024 Jeffy Commerce. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
