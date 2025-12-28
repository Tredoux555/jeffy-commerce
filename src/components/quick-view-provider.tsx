'use client';

import { QuickViewModal, useQuickView } from '@/components/quick-view-modal';

export function QuickViewProvider() {
  const { product, isOpen, closeQuickView } = useQuickView();

  if (!product) return null;

  return (
    <QuickViewModal
      product={product}
      isOpen={isOpen}
      onClose={closeQuickView}
    />
  );
}
