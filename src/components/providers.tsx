'use client';

import { ToastProvider } from '@/components/toast-provider';
import { QuickViewProvider } from '@/components/quick-view-provider';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <QuickViewProvider />
    </ToastProvider>
  );
}
