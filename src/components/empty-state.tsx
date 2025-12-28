import { ReactNode } from 'react';
import { Package, ShoppingCart, FileText, Users, Bell, Heart } from 'lucide-react';

type EmptyStateType = 'products' | 'cart' | 'orders' | 'customers' | 'notifications' | 'wishlist' | 'generic';

const EMPTY_STATE_CONFIG: Record<EmptyStateType, { icon: any; title: string; description: string }> = {
  products: {
    icon: Package,
    title: 'No products yet',
    description: 'Products will appear here once added.',
  },
  cart: {
    icon: ShoppingCart,
    title: 'Your cart is empty',
    description: 'Add some products to get started!',
  },
  orders: {
    icon: FileText,
    title: 'No orders yet',
    description: 'Orders will appear here once placed.',
  },
  customers: {
    icon: Users,
    title: 'No customers yet',
    description: 'Customers will appear here once they sign up.',
  },
  notifications: {
    icon: Bell,
    title: 'No notifications',
    description: "You're all caught up!",
  },
  wishlist: {
    icon: Heart,
    title: 'Your wishlist is empty',
    description: 'Save items you love for later.',
  },
  generic: {
    icon: Package,
    title: 'Nothing here yet',
    description: 'Check back later.',
  },
};

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ type = 'generic', title, description, action }: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title || config.title}</h3>
      <p className="text-gray-500 text-sm mb-4">{description || config.description}</p>
      {action}
    </div>
  );
}
