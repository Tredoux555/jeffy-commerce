'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Clock, MapPin, Phone, RefreshCw, MessageCircle, User } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  location_name: string;
  categories: string[];
  bio: string | null;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'inactive'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/suppliers');
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const updateStatus = async (id: string, status: 'active' | 'inactive') => {
    setUpdating(id);
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      
      if (res.ok) {
        setSuppliers(prev => prev.map(s => 
          s.id === id ? { ...s, status } : s
        ));
      }
    } catch (error) {
      console.error('Failed to update supplier:', error);
    } finally {
      setUpdating(null);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    filter === 'all' ? true : s.status === filter
  );

  const counts = {
    all: suppliers.length,
    pending: suppliers.filter(s => s.status === 'pending').length,
    active: suppliers.filter(s => s.status === 'active').length,
    inactive: suppliers.filter(s => s.status === 'inactive').length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-white transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">Supplier Management</h1>
          </div>
          <button
            onClick={fetchSuppliers}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { key: 'all', label: 'Total', color: 'gray' },
            { key: 'pending', label: 'Pending', color: 'yellow' },
            { key: 'active', label: 'Active', color: 'green' },
            { key: 'inactive', label: 'Inactive', color: 'red' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as any)}
              className={`p-4 rounded-xl border transition ${
                filter === item.key
                  ? `bg-${item.color}-500/20 border-${item.color}-500`
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className={`text-2xl font-bold ${
                item.color === 'green' ? 'text-green-500' :
                item.color === 'yellow' ? 'text-yellow-500' :
                item.color === 'red' ? 'text-red-500' : 'text-white'
              }`}>
                {counts[item.key as keyof typeof counts]}
              </div>
              <div className="text-sm text-gray-400">{item.label}</div>
            </button>
          ))}
        </div>

        {/* Supplier List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Loading suppliers...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
            <User className="h-12 w-12 text-gray-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">No suppliers found</h3>
            <p className="text-gray-400">
              {filter === 'pending' ? 'No pending applications' : 'No suppliers in this category'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">{supplier.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        supplier.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        supplier.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {supplier.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {supplier.location_name}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {new Date(supplier.created_at).toLocaleDateString()}
                  </div>
                </div>

                {supplier.bio && (
                  <p className="text-gray-300 text-sm mb-4">{supplier.bio}</p>
                )}

                {supplier.categories && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {supplier.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                  {/* Contact */}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone className="h-4 w-4" />
                    {supplier.phone}
                  </div>
                  <a
                    href={`https://wa.me/${supplier.whatsapp?.replace(/[^0-9]/g, '').replace(/^0/, '27')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>

                  {/* Actions */}
                  <div className="ml-auto flex gap-2">
                    {supplier.status !== 'active' && (
                      <button
                        onClick={() => updateStatus(supplier.id, 'active')}
                        disabled={updating === supplier.id}
                        className="flex items-center gap-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-lg text-sm transition disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                    )}
                    {supplier.status !== 'inactive' && (
                      <button
                        onClick={() => updateStatus(supplier.id, 'inactive')}
                        disabled={updating === supplier.id}
                        className="flex items-center gap-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-lg text-sm transition disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        {supplier.status === 'active' ? 'Deactivate' : 'Reject'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
