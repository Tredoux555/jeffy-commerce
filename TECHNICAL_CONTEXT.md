# Jeffy Commerce - Technical Context for Product Editing Debug

## 1. Project Overview

### Tech Stack
- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript 5.7.2
- **UI Library**: React 18.2.0
- **Styling**: Tailwind CSS 3.4.17
- **Database**: Supabase (PostgreSQL)
- **Database Client**: @supabase/supabase-js 2.47.10, @supabase/ssr 0.5.2
- **State Management**: Zustand 5.0.2
- **Icons**: Lucide React 0.468.0
- **AI Integration**: @anthropic-ai/sdk 0.71.2 (Claude Sonnet 4)
- **Maps**: @react-google-maps/api 2.20.8
- **QR Scanner**: jsqr 1.4.0

### Project Structure
```
jeffy-mvp/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   │   ├── products/       # Product management
│   │   │   │   ├── page.tsx    # Products list (links to edit)
│   │   │   │   └── new/        # Create new product
│   │   │   │       └── page.tsx
│   │   │   └── ...
│   │   ├── api/                # API routes
│   │   │   ├── product/        # Product-related APIs
│   │   │   │   └── generate/   # AI product generation
│   │   │   └── ...
│   │   └── ...
│   ├── components/             # React components
│   │   ├── ui/                 # UI primitives (Button, Input)
│   │   └── admin/              # Admin-specific components
│   ├── lib/                    # Utility libraries
│   │   ├── supabase/           # Supabase clients
│   │   │   ├── client.ts       # Browser client
│   │   │   └── server.ts       # Server client + admin client
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript types
│       └── database.ts         # Database schema types
└── ...
```

### Data Flow Architecture
1. **Client-Side (Browser)**:
   - Uses `createClient()` from `@/lib/supabase/client`
   - Creates browser client with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Direct Supabase queries from client components

2. **Server-Side (Server Components/API Routes)**:
   - Uses `createClient()` from `@/lib/supabase/server`
   - Creates server client with cookie-based auth
   - Admin operations can use `createAdminClient()` with service role key

3. **API Routes**:
   - Located in `src/app/api/`
   - Use server-side Supabase client
   - Handle POST/GET requests for mutations/queries

---

## 2. Product Editing Feature

### Current State: **MISSING/INCOMPLETE**

#### Issue Identified
The product edit functionality is **not implemented**. The admin products list page links to `/admin/products/${product.id}`, but:
- ❌ **No edit page exists** at `src/app/admin/products/[id]/page.tsx`
- ❌ **No API route exists** for updating products
- ✅ **Create page exists** at `src/app/admin/products/new/page.tsx`
- ✅ **List page exists** at `src/app/admin/products/page.tsx` (with broken edit links)

### File Paths

#### Existing Files:
1. **Product List Page**: `src/app/admin/products/page.tsx`
   - Lists all products
   - Links to edit: `/admin/products/${product.id}` (line 98)
   - **This link is broken** - page doesn't exist

2. **Product Create Page**: `src/app/admin/products/new/page.tsx`
   - Full form for creating products
   - Can be used as reference for edit form structure

3. **Product Types**: `src/types/database.ts`
   - Contains Product type definitions
   - Update type: `Partial<Database['public']['Tables']['products']['Insert']>`

#### Missing Files:
1. **Product Edit Page**: `src/app/admin/products/[id]/page.tsx` - **DOES NOT EXIST**
2. **Product Update API**: `src/app/api/product/[id]/route.ts` - **DOES NOT EXIST** (optional, if using API route)

### Product Create Form (Reference Implementation)

**File**: `src/app/admin/products/new/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category } from '@/types/database';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    costPrice: '',
    sellingPrice: '',
    compareAtPrice: '',
    quantity: '0',
    imageUrl: '',
    status: 'draft',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleNameChange = (name: string) => {
    setForm({
      ...form,
      name,
      slug: slugify(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.from('products').insert({
        name: form.name,
        slug: form.slug,
        short_description: form.shortDescription || null,
        description: form.description || null,
        category_id: form.categoryId || null,
        cost_price_cents: Math.round(parseFloat(form.costPrice || '0') * 100),
        selling_price_cents: Math.round(parseFloat(form.sellingPrice || '0') * 100),
        compare_at_price_cents: form.compareAtPrice
          ? Math.round(parseFloat(form.compareAtPrice) * 100)
          : null,
        quantity: parseInt(form.quantity || '0', 10),
        primary_image_url: form.imageUrl || null,
        status: form.status,
      });

      if (error) throw error;

      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Link>

      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <Input
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Wireless Bluetooth Earbuds"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="wireless-bluetooth-earbuds"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <Input
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              placeholder="Brief product summary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed product description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="w-full h-10 border rounded-lg px-3"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Pricing</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cost Price (R) *</label>
              <Input
                type="number"
                step="0.01"
                required
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Selling Price (R) *</label>
              <Input
                type="number"
                step="0.01"
                required
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare At Price (R)</label>
              <Input
                type="number"
                step="0.01"
                value={form.compareAtPrice}
                onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Inventory</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
            <Input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Media</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <Input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a direct URL to the product image
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Status</h2>

          <div>
            <select
              className="w-full h-10 border rounded-lg px-3"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Product'
            )}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
```

### Product Update Database Query Pattern

Based on the create pattern and Supabase conventions, the update query should be:

```typescript
const supabase = createClient();

const { data, error } = await supabase
  .from('products')
  .update({
    name: form.name,
    slug: form.slug,
    short_description: form.shortDescription || null,
    description: form.description || null,
    category_id: form.categoryId || null,
    cost_price_cents: Math.round(parseFloat(form.costPrice || '0') * 100),
    selling_price_cents: Math.round(parseFloat(form.sellingPrice || '0') * 100),
    compare_at_price_cents: form.compareAtPrice
      ? Math.round(parseFloat(form.compareAtPrice) * 100)
      : null,
    quantity: parseInt(form.quantity || '0', 10),
    primary_image_url: form.imageUrl || null,
    status: form.status,
    updated_at: new Date().toISOString(), // Supabase may auto-update this
  })
  .eq('id', productId)
  .select()
  .single();
```

### Error Behavior

**Current Error**: When clicking "Edit" on a product in `/admin/products`:
- User is navigated to `/admin/products/{productId}`
- Next.js shows a 404 Not Found page
- No error in console (standard Next.js 404)
- The route simply doesn't exist

**What Should Happen**:
- Load product data by ID
- Populate form with existing values
- Allow editing
- Save updates to database
- Redirect back to products list

---

## 3. Database Schema

### Products Table Structure

**File**: `src/types/database.ts`

```typescript
products: {
  Row: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    category_id: string | null;
    tags: string[] | null;
    cost_price_cents: number;
    selling_price_cents: number;
    compare_at_price_cents: number | null;
    quantity: number;
    low_stock_threshold: number;
    track_inventory: boolean;
    primary_image_url: string | null;
    images: string[] | null;
    video_url: string | null;
    source_1688_url: string | null;
    source_1688_item_id: string | null;
    status: 'draft' | 'active' | 'out_of_stock' | 'discontinued';
    meta_title: string | null;
    meta_description: string | null;
    total_sold: number;
    total_views: number;
    average_rating: number | null;
    review_count: number;
    created_at: string;
    updated_at: string;
  };
  Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at' | 'quantity' | 'low_stock_threshold' | 'track_inventory' | 'total_sold' | 'total_views' | 'review_count'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
    quantity?: number;
    low_stock_threshold?: number;
    track_inventory?: boolean;
    total_sold?: number;
    total_views?: number;
    review_count?: number;
  };
  Update: Partial<Database['public']['Tables']['products']['Insert']>;
}
```

### Key Fields for Editing:
- **Required**: `name`, `slug`, `cost_price_cents`, `selling_price_cents`
- **Optional**: `description`, `short_description`, `category_id`, `tags`, `compare_at_price_cents`, `quantity`, `primary_image_url`, `images`, `status`
- **Auto-managed**: `id`, `created_at`, `updated_at`, `total_sold`, `total_views`, `review_count`

### Relationships:
- `category_id` → `categories.id` (foreign key)
- Products can be queried with category: `.select('*, categories(name)')`

### Database Middleware/Hooks:
- No explicit middleware found in codebase
- Supabase may have RLS (Row Level Security) policies
- `updated_at` may be auto-updated by database trigger (not confirmed in code)

---

## 4. Recent Changes

### Missing Edit Feature
The edit feature appears to have **never been implemented**. The link exists in the products list, but the page was never created.

### Files That Should Exist But Don't:
1. `src/app/admin/products/[id]/page.tsx` - Edit page
2. Potentially: `src/app/api/product/[id]/route.ts` - Update API (if using API route pattern)

### Similar Patterns in Codebase:
- Other admin pages use direct Supabase client calls (not API routes)
- Create page uses client-side Supabase client
- No API routes for product CRUD operations found

---

## 5. Environment

### Database
- **Type**: Supabase (PostgreSQL)
- **Client Library**: @supabase/supabase-js, @supabase/ssr

### Environment Variables Required:
```bash
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anonymous/public key
SUPABASE_SERVICE_ROLE_KEY=         # Service role key (for admin operations, bypasses RLS)
```

### Supabase Client Configuration

**Browser Client** (`src/lib/supabase/client.ts`):
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Server Client** (`src/lib/supabase/server.ts`):
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  );
}

// Admin client with service role (bypasses RLS)
export async function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
```

---

## 6. Error Details

### Current Error Behavior

**Steps to Reproduce**:
1. Navigate to `/admin/products`
2. Click "Edit" link on any product
3. Browser navigates to `/admin/products/{productId}`
4. **Result**: Next.js 404 Not Found page

**Console Errors**: None (standard Next.js 404)

**Network Requests**: 
- No API calls made (page doesn't exist)
- Browser shows 404 in network tab for the route

**Server Errors**: None (route doesn't exist, so no server processing)

### What Should Happen

1. **Page Load**:
   - Fetch product by ID from Supabase
   - Load categories for dropdown
   - Populate form with product data

2. **Form Submission**:
   - Validate form data
   - Convert prices to cents
   - Update product in Supabase
   - Handle errors
   - Redirect to products list

### Expected Implementation Pattern

Based on the create page pattern, the edit page should:

1. **Be a Client Component** (`'use client'`)
2. **Use `useParams()` to get product ID** from route
3. **Fetch product data on mount** using `useEffect`
4. **Populate form state** with fetched data
5. **Use `.update()` instead of `.insert()`** for save
6. **Handle loading and error states**

### Example Edit Page Structure (Not Implemented)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
// ... similar to new/page.tsx but:
// - Fetch product by ID
// - Populate form with existing data
// - Use .update() instead of .insert()
// - Handle not found case
```

---

## Summary

### The Problem
**Product editing functionality is completely missing**. The UI links to edit pages, but the pages don't exist.

### What Needs to Be Built
1. **Edit Page**: `src/app/admin/products/[id]/page.tsx`
   - Fetch product by ID
   - Display form with existing data
   - Update product on submit
   - Handle errors and loading states

2. **Optional**: API route for updates (if preferred pattern)
   - `src/app/api/product/[id]/route.ts` with PUT/PATCH handler

### Implementation Notes
- Follow the pattern from `new/page.tsx`
- Use `useParams()` to get product ID
- Fetch product data on component mount
- Use Supabase `.update()` method
- Convert prices to cents (multiply by 100)
- Handle null/optional fields correctly
- Redirect to products list on success

### Testing Checklist
- [ ] Edit page loads with product data
- [ ] Form fields are pre-populated
- [ ] Can update product name, price, description, etc.
- [ ] Changes save to database
- [ ] Redirects to products list after save
- [ ] Error handling works (product not found, save failures)
- [ ] Loading states display correctly

---

## Additional Context

### Utility Functions Available

**File**: `src/lib/utils.ts`

```typescript
export function formatCurrency(cents: number): string {
  return `R${(cents / 100).toFixed(2)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}
```

### UI Components Available

**Button**: `src/components/ui/button.tsx`
- Variants: `default`, `outline`, `ghost`, `destructive`
- Sizes: `default`, `sm`, `lg`, `icon`

**Input**: `src/components/ui/input.tsx`
- Standard input with Tailwind styling

### Admin Layout
- Admin pages are wrapped in `src/app/admin/layout.tsx`
- Includes sidebar navigation
- Uses `jeffy-orange` color scheme

---

**End of Technical Context Document**

