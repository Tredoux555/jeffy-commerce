'use client';

import { useState } from 'react';
import { Users, UserPlus, Mail, Tag, Filter, Download, MoreHorizontal, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
  tags: string[];
  status: 'active' | 'inactive';
}

interface CustomerManagerProps {
  customers: Customer[];
  onExport: () => void;
  onSendEmail: (customerIds: string[]) => void;
  onAddTag: (customerIds: string[], tag: string) => Promise<void>;
}

export function CustomerManager({ customers, onExport, onSendEmail, onAddTag }: CustomerManagerProps) {
  const [search, setSearch] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'spent' | 'orders'>('recent');

  const allTags = [...new Set(customers.flatMap(c => c.tags))];

  const filteredCustomers = customers
    .filter(c => {
      const matchesSearch = 
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase());
      const matchesTag = !filterTag || c.tags.includes(filterTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
      if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue: customers.length > 0 
      ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.totalOrders, 0)
      : 0
  };

  const toggleSelect = (id: string) => {
    setSelectedCustomers(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedCustomers(
      selectedCustomers.length === filteredCustomers.length 
        ? [] 
        : filteredCustomers.map(c => c.id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <Users className="h-5 w-5 text-[#ff6b35] mb-2" />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Customers</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <UserPlus className="h-5 w-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats.active}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <Tag className="h-5 w-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <Tag className="h-5 w-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</p>
          <p className="text-sm text-gray-600">Avg Order Value</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="recent">Most Recent</option>
          <option value="spent">Highest Spent</option>
          <option value="orders">Most Orders</option>
        </select>

        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        {selectedCustomers.length > 0 && (
          <Button onClick={() => onSendEmail(selectedCustomers)}>
            <Mail className="h-4 w-4 mr-2" />
            Email ({selectedCustomers.length})
          </Button>
        )}
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  onChange={selectAll}
                  checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                />
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium">Customer</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Orders</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Total Spent</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Tags</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Joined</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => toggleSelect(customer.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">
                      {customer.firstName || customer.lastName 
                        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                        : 'No name'
                      }
                    </p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">{customer.totalOrders}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(customer.totalSpent)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {customer.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                    {customer.tags.length > 2 && (
                      <span className="text-xs text-gray-500">+{customer.tags.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Customer detail card
export function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">
            {customer.firstName} {customer.lastName}
          </h3>
          <p className="text-gray-500">{customer.email}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {customer.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-2xl font-bold">{customer.totalOrders}</p>
          <p className="text-sm text-gray-500">Orders</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{formatCurrency(customer.totalSpent)}</p>
          <p className="text-sm text-gray-500">Total Spent</p>
        </div>
        <div>
          <p className="text-2xl font-bold">
            {customer.totalOrders > 0 ? formatCurrency(customer.totalSpent / customer.totalOrders) : 'R0'}
          </p>
          <p className="text-sm text-gray-500">Avg Order</p>
        </div>
      </div>

      {customer.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {customer.tags.map(tag => (
            <span key={tag} className="text-xs bg-[#ff6b35]/10 text-[#ff6b35] px-2 py-1 rounded">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
