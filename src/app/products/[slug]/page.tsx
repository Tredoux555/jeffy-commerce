import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AddToCartButton } from './add-to-cart-button';
import { ShareButtons } from '@/components/share-buttons';
import { RelatedProducts } from '@/components/related-products';
import { ProductDetailClient } from './product-detail-client';
import { ProductImageGallery } from './product-image-gallery';
import { formatCurrency } from '@/lib/utils';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (!product) {
    notFound();
  }

  const hasDiscount = product.compare_at_price_cents && product.compare_at_price_cents > product.selling_price_cents;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.selling_price_cents / product.compare_at_price_cents!) * 100)
    : 0;

  const images = product.images?.length ? product.images : (product.primary_image_url ? [product.primary_image_url] : []);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetailClient product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.selling_price_cents,
        image: product.primary_image_url,
      }} />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images - Interactive Gallery */}
        <ProductImageGallery 
          images={images} 
          productName={product.name} 
          discountPercent={hasDiscount ? discountPercent : 0} 
        />

        {/* Product Info */}
        <div>
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4">
            <a href="/products" className="hover:text-gray-700">Products</a>
            {product.categories && (
              <>
                <span className="mx-2">/</span>
                <a href={`/products?category=${(product.categories as { slug: string }).slug}`} className="hover:text-gray-700">
                  {(product.categories as { name: string }).name}
                </a>
              </>
            )}
          </nav>

          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <ShareButtons url={`/products/${product.slug}`} title={product.name} price={product.selling_price_cents} />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.selling_price_cents)}</span>
            {hasDiscount && (
              <span className="text-xl text-gray-400 line-through">{formatCurrency(product.compare_at_price_cents!)}</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.quantity > 10 ? (
              <span className="text-green-600 font-medium">✓ In Stock</span>
            ) : product.quantity > 0 ? (
              <span className="text-orange-600 font-medium">Only {product.quantity} left!</span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          {product.short_description && (
            <p className="text-gray-600 mb-6">{product.short_description}</p>
          )}

          <div className="mb-8">
            <AddToCartButton product={product} />
          </div>

          {product.description && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <div className="text-gray-600 prose prose-sm max-w-none whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>

      <RelatedProducts currentProductId={product.id} categoryId={product.category_id} />
    </div>
  );
}
