import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Folder, Plus, Edit, Trash2, ChevronRight, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getCategories() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*, products:products(count)')
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Categories fetch error:', error);
    return [];
  }
  return categories || [];
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  
  // Organize into parent/child structure
  const parentCategories = categories.filter(c => !c.parent_id);
  const childCategories = categories.filter(c => c.parent_id);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage product categories and organization</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 bg-jeffy-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Folder className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{parentCategories.length}</p>
              <p className="text-sm text-gray-500">Main Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChevronRight className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{childCategories.length}</p>
              <p className="text-sm text-gray-500">Sub-Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.reduce((sum, c) => sum + (c.products?.[0]?.count || 0), 0)}</p>
              <p className="text-sm text-gray-500">Total Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Category</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Slug</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Products</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Order</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {parentCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">No categories yet</p>
                  <p className="text-sm">Create your first category to organize products</p>
                  <Link
                    href="/admin/categories/new"
                    className="inline-flex items-center gap-2 mt-4 text-jeffy-orange hover:underline"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Link>
                </td>
              </tr>
            ) : (
              parentCategories.map((category) => {
                const children = childCategories.filter(c => c.parent_id === category.id);
                const productCount = category.products?.[0]?.count || 0;
                
                return (
                  <>
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {category.image_url ? (
                            <img src={category.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Folder className="h-5 w-5 text-orange-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{category.name}</p>
                            {category.description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">{category.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                          {productCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {category.is_active ? (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {category.sort_order}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/categories/${category.id}`}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Sub-categories */}
                    {children.map((child) => (
                      <tr key={child.id} className="hover:bg-gray-50 bg-gray-50/50">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3 pl-8">
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            {child.image_url ? (
                              <img src={child.image_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                            ) : (
                              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Folder className="h-4 w-4 text-blue-600" />
                              </div>
                            )}
                            <span className="text-sm">{child.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{child.slug}</code>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="text-xs text-gray-500">{child.products?.[0]?.count || 0}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          {child.is_active ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Active</span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">Inactive</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center text-xs text-gray-500">{child.sort_order}</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/categories/${child.id}`}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
