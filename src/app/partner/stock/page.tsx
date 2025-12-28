'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, AlertTriangle, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface StockItem {
  id: string;
  quantity: number;
  updated_at: string;
  product: {
    id: string;
    name: string;
    primary_image_url: string;
    sku: string;
  };
}

export default function PartnerStockPage() {
  const router = useRouter();
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  useEffect(() => {
    loadPartner();
  }, []);

  const loadPartner = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login?redirect=/partner/stock');
        return;
      }

      const { data: partner } = await supabase
        .from('zone_partners')
        .select('id, agreed_to_terms')
        .eq('user_id', user.id)
        .single();

      if (!partner) {
        router.push('/partner/apply');
        return;
      }

      if (!partner.agreed_to_terms) {
        router.push(`/partner/agreement/${partner.id}`);
        return;
      }

      setPartnerId(partner.id);
      localStorage.setItem('zonePartnerId', partner.id);
      await fetchStock(partner.id);
    } catch (err) {
      console.error('Error loading partner:', err);
    }
    setLoading(false);
  };

  const fetchStock = async (pid: string) => {
    try {
      const res = await fetch(`/api/partner/stock?partnerId=${pid}`);
      const data = await res.json();
      if (data.success) {
        setStock(data.stock || []);
      }
    } catch (err) {
      console.error('Failed to fetch stock:', err);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { color: 'text-red-500', bg: 'bg-red-500/20', label: 'Out of Stock' };
    if (quantity <= 3) return { color: 'text-orange-500', bg: 'bg-orange-500/20', label: 'Low Stock' };
    return { color: 'text-green-500', bg: 'bg-green-500/20', label: 'In Stock' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!partnerId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Partner Stock</h1>
        <p className="text-gray-400 mb-6">Please log in to view your inventory</p>
        <Link href="/partner/apply">
          <Button className="bg-orange-500">Apply to be a Zone Partner</Button>
        </Link>
      </div>
    );
  }

  const lowStockCount = stock.filter(s => s.quantity <= 3).length;
  const totalUnits = stock.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/partner/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-400">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-bold text-xl">My Stock</h1>
          </div>
          <Button onClick={() => fetchStock(partnerId)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <Package className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stock.length}</p>
            <p className="text-xs text-gray-400">Products</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{totalUnits}</p>
            <p className="text-xs text-gray-400">Total Units</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold text-orange-500">{lowStockCount}</p>
            <p className="text-xs text-gray-400">Low Stock</p>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockCount > 0 && (
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-400">{lowStockCount} item{lowStockCount > 1 ? 's' : ''} running low</p>
                <p className="text-sm text-orange-300/70">New stock will arrive with next shipment</p>
              </div>
            </div>
          </div>
        )}

        {/* Stock List */}
        <div className="space-y-3">
          {stock.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No stock assigned yet</p>
              <p className="text-sm text-gray-500">Stock will appear here when allocated</p>
            </div>
          ) : (
            stock.map(item => {
              const status = getStockStatus(item.quantity);
              return (
                <div key={item.id} className="bg-gray-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.primary_image_url ? (
                      <img src={item.product.primary_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product?.name || 'Product'}</p>
                    <p className="text-xs text-gray-400">SKU: {item.product?.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${status.color}`}>{item.quantity}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
