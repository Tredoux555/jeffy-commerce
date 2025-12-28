import { createClient } from '@/lib/supabase/server';

const BASE_URL = 'https://jeffy.co.za';

export async function GET() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'active');

  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .eq('is_active', true);

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/categories', priority: '0.8', changefreq: 'weekly' },
    { url: '/wants', priority: '0.9', changefreq: 'daily' },
    { url: '/wants/create', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'monthly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${(products || []).map(product => `  <url>
    <loc>${BASE_URL}/products/${product.slug}</loc>
    <lastmod>${new Date(product.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
${(categories || []).map(category => `  <url>
    <loc>${BASE_URL}/products?category=${category.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
