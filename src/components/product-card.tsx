'use client';

import Link from 'next/link';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '@/types/database';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { ProductBadges, isProductNew, isProductHot } from '@/components/product-badges';
import { useQuickView } from '@/components/quick-view-modal';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openQuickView = useQuickView((state) => state.openQuickView);
  
  const hasDiscount = product.compare_at_price_cents && product.compare_at_price_cents > product.selling_price_cents;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.selling_price_cents / product.compare_at_price_cents!) * 100)
    : 0;

  // Check if product has variants
  const variants = (product as any).source_data?.variants || [];
  const hasVariants = variants.length > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If has variants, go to product page instead
    if (hasVariants) {
      window.location.href = `/products/${product.slug}`;
      return;
    }
    
    addItem(product, 1);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView({
      id: product.id,
      name: product.name,
      slug: product.slug,
      selling_price_cents: product.selling_price_cents,
      compare_at_price_cents: product.compare_at_price_cents,
      primary_image_url: product.primary_image_url,
      images: product.images || undefined,
      short_description: product.short_description,
      quantity: product.quantity,
    });
  };

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100">
          {product.primary_image_url ? (
            <img
              src={product.primary_image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No image
            </div>
          )}
          
          {/* Badges */}
          <ProductBadges
            discountPercent={discountPercent}
            isNew={isProductNew(product.created_at)}
            isHot={isProductHot(product.total_sold || 0)}
            quantity={product.quantity}
          />

          {/* Variants Badge */}
          {hasVariants && (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {variants.length} Options
            </span>
          )}

          {/* Quick View Button - Shows on hover */}
          <button
            onClick={handleQuickView}
            className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <Eye className="h-4 w-4 text-gray-700" />
          </button>

          {/* Out of Stock Overlay */}
          {product.quantity <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-3 py-1 rounded font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[48px]">
            {product.name}
          </h3>
          
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(product.selling_price_cents)}
              </span>
              {hasDiscount && (
                <span className="ml-2 text-sm text-gray-400 line-through">
                  {formatCurrency(product.compare_at_price_cents!)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.quantity <= 0}
            className="w-full mt-3"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {hasVariants ? 'Select Options' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Link>
  );
}
