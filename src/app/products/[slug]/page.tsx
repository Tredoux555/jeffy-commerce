import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductClient } from './product-client';
import { ProductDetailClient } from './product-detail-client';
import { RelatedProducts } from '@/components/related-products';

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

  // Prepare data
  const images = product.images?.length 
    ? product.images 
    : (product.primary_image_url ? [product.primary_image_url] : []);
  const variants = product.source_data?.variants || [];
  const features = product.source_data?.features || [];
  const specs = product.source_data?.specs || {};
  
  // Extract category info (comes as object from join)
  const category = product.categories as { name: string; slug: string } | null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Track recently viewed */}
      <ProductDetailClient product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.selling_price_cents,
        image: product.primary_image_url,
      }} />

      {/* Main product section */}
      <ProductClient
        product={product}
        variants={variants}
        images={images}
        features={features}
        specs={specs}
        categoryName={category?.name}
        categorySlug={category?.slug}
      />

      {/* Related products */}
      <RelatedProducts 
        currentProductId={product.id} 
        categoryId={product.category_id} 
      />
    </div>
  );
}
