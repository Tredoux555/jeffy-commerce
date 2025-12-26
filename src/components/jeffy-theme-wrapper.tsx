'use client';

import { ReactNode } from 'react';

interface JeffyThemeWrapperProps {
  children: ReactNode;
}

export default function JeffyThemeWrapper({ children }: JeffyThemeWrapperProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          --jeffy-bg: #1a1a2e;
          --jeffy-text: #ffffff;
          --jeffy-orange: #ff6b35;
          --jeffy-accent: #ff8c42;
          --jeffy-card: #ffffff;
        }

        html, body {
          background-color: #1a1a2e !important;
          color: #ffffff !important;
        }

        body > div {
          background-color: #1a1a2e !important;
        }

        main, main > div, main > section {
          background-color: #1a1a2e !important;
          color: #ffffff !important;
        }

        h1, h2, h3, h4, h5, h6,
        [class*="heading"],
        [role="heading"] {
          color: #ff6b35 !important;
        }

        [class*="bg-gradient"],
        [class*="from-jeffy-orange"],
        [class*="to-jeffy-yellow"],
        [class*="bg-orange"],
        [class*="bg-yellow"] {
          background: #1a1a2e !important;
          background-color: #1a1a2e !important;
        }

        .bg-white,
        [class*="bg-white"],
        [class*="bg-gray-50"],
        [class*="bg-gray-100"],
        [class*="bg-gray-200"],
        [class*="bg-gray-300"],
        [class*="bg-gray-400"],
        [class*="bg-gray-500"],
        [class*="bg-gray-600"],
        [class*="bg-gray-700"],
        [class*="bg-gray-800"],
        [class*="bg-gray-900"],
        [class*="bg-slate"],
        [class*="bg-zinc"],
        [class*="bg-neutral"],
        [class*="bg-stone"],
        .card,
        [class*="card"],
        [class*="Card"] {
          background-color: #ffffff !important;
          color: #1a1a2e !important;
        }

        a, [role="link"] {
          color: #ff8c42 !important;
        }

        a:hover, [role="link"]:hover {
          color: #ff6b35 !important;
        }

        button[class*="bg-"],
        [role="button"][class*="bg-"],
        .btn {
          background-color: #ff6b35 !important;
          color: white !important;
        }

        button[class*="bg-"]:hover,
        [role="button"][class*="bg-"]:hover,
        .btn:hover {
          background-color: #ff8c42 !important;
        }

        footer {
          background-color: #1a1a2e !important;
          color: #ffffff !important;
        }
      `}</style>
      <div className="min-h-screen bg-[#1a1a2e] text-white">
        {children}
      </div>
    </>
  );
}

