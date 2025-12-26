import { Metadata } from 'next';

const BASE_URL = 'https://jeffy.co.za';

interface GenerateMetadataParams {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  path = '',
  image = '/og-image.png',
  noIndex = false,
}: GenerateMetadataParams): Metadata {
  const url = `${BASE_URL}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Jeffy Commerce',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_ZA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: url,
    },
  };
}

// Pre-built metadata for common pages
export const pageMetadata = {
  home: generateMetadata({
    title: 'Jeffy Commerce - Eish, These Prices!',
    description: 'Get products FREE with Jeffy Wants! Create a want, share with 10 friends, and get your product completely FREE. South Africa\'s most exciting shopping experience.',
    path: '/',
  }),

  products: generateMetadata({
    title: 'All Products - Shop Quality Items at Amazing Prices',
    description: 'Browse our collection of quality products sourced directly from manufacturers. No middlemen, just lekker savings.',
    path: '/products',
  }),

  wants: generateMetadata({
    title: 'Jeffy Wants - Get Products FREE',
    description: 'Create a want, share with 10 friends, and get your product completely FREE! The most exciting way to shop in South Africa.',
    path: '/wants',
  }),

  about: generateMetadata({
    title: 'About Us - Jeffy Commerce',
    description: 'Learn about Jeffy Commerce and our mission to bring quality products to South Africa at unbeatable prices.',
    path: '/about',
  }),

  contact: generateMetadata({
    title: 'Contact Us - Jeffy Commerce',
    description: 'Get in touch with Jeffy Commerce. We\'re here to help with orders, products, or any questions.',
    path: '/contact',
  }),

  faq: generateMetadata({
    title: 'FAQ - Frequently Asked Questions',
    description: 'Find answers to common questions about Jeffy Commerce, orders, delivery, and the Jeffy Wants program.',
    path: '/faq',
  }),

  wishlist: generateMetadata({
    title: 'My Wishlist - Saved Products',
    description: 'View and manage your saved products on Jeffy Commerce.',
    path: '/wishlist',
    noIndex: true,
  }),

  cart: generateMetadata({
    title: 'Shopping Cart',
    description: 'Review your cart and checkout with Jeffy Commerce.',
    path: '/cart',
    noIndex: true,
  }),
};

// Generate product-specific metadata
export function generateProductMetadata(product: {
  name: string;
  description?: string;
  slug: string;
  image?: string;
  price: number;
}): Metadata {
  const priceStr = `R${(product.price / 100).toFixed(2)}`;
  return generateMetadata({
    title: `${product.name} - ${priceStr}`,
    description: product.description || `Buy ${product.name} for only ${priceStr}. Quality products at amazing prices on Jeffy Commerce.`,
    path: `/products/${product.slug}`,
    image: product.image || '/og-image.png',
  });
}
