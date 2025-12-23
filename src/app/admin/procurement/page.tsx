import Link from 'next/link';
import { Plus, Search, Package, Gift, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export default async function ProcurementPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('procurement_orders')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: wantsReady } = await supabase
    .from('wants')
    .select('id')
    .gte('current_agrees', 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Procurement</h1>
          <p className="text-gray-600">Manage 1688 sourcing and orders</p>
        </div>
        <Link href="/admin/procurement/research">
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Research Products
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/procurement/research">
          <div className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Research 1688</h3>
                <p className="text-sm text-gray-500">Search or paste product URL</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/wants">
          <div className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Wants to Source</h3>
                <p className="text-sm text-gray-500">{wantsReady?.length || 0} ready for sourcing</p>
              </div>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-jeffy-orange" />
            </div>
            <div>
              <h3 className="font-medium">Pending Orders</h3>
              <p className="text-sm text-gray-500">{orders?.length || 0} orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Procurement Orders</h2>
        </div>

        {orders && orders.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Order ID</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Total</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm">{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">R{((order.total_cost_cents || 0) / 100).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No procurement orders yet</p>
            <p className="text-sm mt-1">Research products on 1688 to create orders</p>
          </div>
        )}
      </div>

      {/* How it Works */}
      <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
        <h3 className="font-medium text-orange-900 mb-4">Procurement Flow</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-jeffy-orange text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
            <p className="text-sm text-orange-800">Want reaches 10 agrees</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-jeffy-orange text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
            <p className="text-sm text-orange-800">Research product on 1688</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-jeffy-orange text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
            <p className="text-sm text-orange-800">Paste URL for agent</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-jeffy-orange text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">4</div>
            <p className="text-sm text-orange-800">Agent orders & ships</p>
          </div>
        </div>
      </div>
    </div>
  );
}
