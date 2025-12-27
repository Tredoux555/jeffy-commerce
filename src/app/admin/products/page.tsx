import Link from 'next/link';
import { Plus, Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { ProductsTable } from '@/components/admin/ProductsTable';

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, primary_image_url, selling_price_cents, quantity, status')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <a href="/api/admin/products/export" download>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </a>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>
      <ProductsTable initialProducts={(products || []) as any} />
    </div>
  );
}
