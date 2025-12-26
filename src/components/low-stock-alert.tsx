import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  quantity: number;
  low_stock_threshold: number;
}

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const lowStockProducts = products.filter(p => p.quantity <= p.low_stock_threshold);

  if (lowStockProducts.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-amber-800 mb-2">
            Low Stock Alert ({lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''})
          </h3>
          <div className="space-y-2">
            {lowStockProducts.slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center justify-between text-sm">
                <span className="text-amber-700 truncate max-w-[200px]">{product.name}</span>
                <span className={`font-bold ${product.quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {product.quantity === 0 ? 'OUT OF STOCK' : `${product.quantity} left`}
                </span>
              </div>
            ))}
            {lowStockProducts.length > 5 && (
              <p className="text-amber-600 text-sm">
                +{lowStockProducts.length - 5} more products low on stock
              </p>
            )}
          </div>
          <Link href="/admin/products" className="inline-block mt-3 text-amber-700 hover:text-amber-900 font-medium text-sm">
            Manage Inventory →
          </Link>
        </div>
      </div>
    </div>
  );
}
