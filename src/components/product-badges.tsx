'use client';

import { Flame, Zap, Clock, Award, TrendingUp, Star, Percent, Package, Gift, Sparkles } from 'lucide-react';

type BadgeType = 
  | 'sale' 
  | 'new' 
  | 'bestseller' 
  | 'limited' 
  | 'trending' 
  | 'popular' 
  | 'featured'
  | 'exclusive'
  | 'flash'
  | 'free-shipping'
  | 'gift';

interface ProductBadgeProps {
  type: BadgeType;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const badgeConfig: Record<BadgeType, { icon: React.ReactNode; defaultText: string; colors: string }> = {
  sale: {
    icon: <Percent className="h-3 w-3" />,
    defaultText: 'SALE',
    colors: 'bg-red-500 text-white'
  },
  new: {
    icon: <Sparkles className="h-3 w-3" />,
    defaultText: 'NEW',
    colors: 'bg-green-500 text-white'
  },
  bestseller: {
    icon: <Award className="h-3 w-3" />,
    defaultText: 'BESTSELLER',
    colors: 'bg-amber-500 text-white'
  },
  limited: {
    icon: <Clock className="h-3 w-3" />,
    defaultText: 'LIMITED',
    colors: 'bg-purple-500 text-white'
  },
  trending: {
    icon: <TrendingUp className="h-3 w-3" />,
    defaultText: 'TRENDING',
    colors: 'bg-blue-500 text-white'
  },
  popular: {
    icon: <Flame className="h-3 w-3" />,
    defaultText: 'POPULAR',
    colors: 'bg-orange-500 text-white'
  },
  featured: {
    icon: <Star className="h-3 w-3" />,
    defaultText: 'FEATURED',
    colors: 'bg-indigo-500 text-white'
  },
  exclusive: {
    icon: <Award className="h-3 w-3" />,
    defaultText: 'EXCLUSIVE',
    colors: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
  },
  flash: {
    icon: <Zap className="h-3 w-3" />,
    defaultText: 'FLASH DEAL',
    colors: 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse'
  },
  'free-shipping': {
    icon: <Package className="h-3 w-3" />,
    defaultText: 'FREE SHIPPING',
    colors: 'bg-teal-500 text-white'
  },
  gift: {
    icon: <Gift className="h-3 w-3" />,
    defaultText: 'FREE GIFT',
    colors: 'bg-pink-500 text-white'
  }
};

export function ProductBadge({ type, text, size = 'md', className = '' }: ProductBadgeProps) {
  const config = badgeConfig[type];
  
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span className={`inline-flex items-center gap-1 font-bold rounded ${config.colors} ${sizeClasses[size]} ${className}`}>
      {config.icon}
      {text || config.defaultText}
    </span>
  );
}

// Discount percentage badge
export function DiscountBadge({ percentage, size = 'md' }: { percentage: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span className={`inline-flex items-center gap-1 font-bold rounded bg-red-500 text-white ${sizeClasses[size]}`}>
      -{percentage}%
    </span>
  );
}

// Stock status badge
export function StockBadge({ quantity }: { quantity: number }) {
  if (quantity <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
        Out of Stock
      </span>
    );
  }
  
  if (quantity <= 5) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
        Only {quantity} left!
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
      In Stock
    </span>
  );
}

// Rating badge
export function RatingBadge({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
      {rating.toFixed(1)}
      {reviews !== undefined && (
        <span className="text-yellow-600/70">({reviews})</span>
      )}
    </span>
  );
}

// Multiple badges container
interface ProductBadgesProps {
  badges?: Array<{ type: BadgeType; text?: string }>;
  discount?: number;
  discountPercent?: number;
  rating?: number;
  reviews?: number;
  stock?: number;
  quantity?: number;
  isNew?: boolean;
  isHot?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function ProductBadges({ 
  badges = [], 
  discount,
  discountPercent,
  rating, 
  reviews, 
  stock,
  quantity,
  isNew,
  isHot,
  position = 'top-left' 
}: ProductBadgesProps) {
  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2'
  };

  const actualDiscount = discount || discountPercent;
  const actualStock = stock ?? quantity;

  return (
    <div className={`absolute ${positionClasses[position]} z-10 flex flex-col gap-1`}>
      {actualDiscount && actualDiscount > 0 && <DiscountBadge percentage={actualDiscount} />}
      {isNew && <ProductBadge type="new" size="sm" />}
      {isHot && <ProductBadge type="popular" size="sm" />}
      {badges.map((badge, i) => (
        <ProductBadge key={i} type={badge.type} text={badge.text} size="sm" />
      ))}
      {actualStock !== undefined && actualStock <= 5 && actualStock > 0 && <StockBadge quantity={actualStock} />}
    </div>
  );
}

// Category label
export function CategoryLabel({ name, href }: { name: string; href?: string }) {
  const Component = href ? 'a' : 'span';
  return (
    <Component 
      href={href}
      className="text-xs text-gray-500 hover:text-[#ff6b35] uppercase tracking-wide"
    >
      {name}
    </Component>
  );
}

// Shipping estimate badge
export function ShippingBadge({ days }: { days: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
      <Package className="h-3 w-3" />
      Delivery in {days} day{days !== 1 ? 's' : ''}
    </span>
  );
}

// Helper functions to determine product badges
export function isProductNew(createdAt: string | Date): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 14; // Product is "new" if created within 14 days
}

export function isProductHot(salesCount: number, viewCount?: number): boolean {
  // Product is "hot" if it has 10+ sales or 100+ views
  if (salesCount >= 10) return true;
  if (viewCount && viewCount >= 100) return true;
  return false;
}
