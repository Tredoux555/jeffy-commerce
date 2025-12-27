'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Eye, EyeOff, Search, Loader2, Pencil, Check, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  primary_image_url: string | null;
  selling_price_cents: number;
  quantity: number;
  status: string;
}

export function ProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const draftCount = products.filter(p => p.status === 'draft').length;
  const liveCount = products.filter(p => p.status === 'active').length;

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    setLoadingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      if (res.ok) setProducts(products.filter(p => p.id !== product.id));
    } catch {}
    setLoadingId(null);
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} products?`)) return;
    setBulkLoading(true);
    for (const id of selected) {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    }
    setProducts(products.filter(p => !selected.has(p.id)));
    setSelected(new Set());
    setBulkLoading(false);
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    setLoadingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, is_active: newStatus === 'active' })
      });
      if (res.ok) setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    } catch {}
    setLoadingId(null);
  };

  const handlePublishAllDrafts = async () => {
    if (!confirm(`Publish all ${draftCount} draft products?`)) return;
    setBulkLoading(true);
    for (const p of products.filter(p => p.status === 'draft')) {
      await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active', is_active: true })
      });
    }
    setProducts(products.map(p => p.status === 'draft' ? { ...p, status: 'active' } : p));
    setBulkLoading(false);
  };
