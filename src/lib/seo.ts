// SEO Meta Components for Product and Category Pages

interface ProductSEO {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  currency?: string;
  image?: string;
  images?: string[];
  brand?: string;
  sku?: string;
  gtin?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: number;
  reviewCount?: number;
  category?: string;
  url: string;
}

interface CategorySEO {
  name: string;
  description: string;
  image?: string;
  url: string;
  productCount?: number;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

// Generate Product Schema.org JSON-LD
export function generateProductSchema(product: ProductSEO): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images || (product.image ? [product.image] : []),
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand
    } : undefined,
    sku: product.sku,
    gtin: product.gtin,
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.currency || 'ZAR',
      price: (product.price / 100).toFixed(2),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      seller: {
        '@type': 'Organization',
        name: 'Jeffy Commerce'
      }
    },
    aggregateRating: product.rating && product.reviewCount ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1
    } : undefined
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));
  return JSON.stringify(cleanSchema);
}

// Generate Category Schema
export function generateCategorySchema(category: CategorySEO): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: category.url,
    image: category.image,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: category.productCount || 0
    }
  };

  return JSON.stringify(schema);
}

// Generate Breadcrumb Schema
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return JSON.stringify(schema);
}

// Generate Organization Schema
export function generateOrganizationSchema(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Jeffy Commerce',
    url: 'https://jeffy.co.za',
    logo: 'https://jeffy.co.za/logo.png',
    sameAs: [
      'https://facebook.com/jeffycommerce',
      'https://twitter.com/jeffycommerce',
      'https://instagram.com/jeffycommerce'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+27-10-123-4567',
      contactType: 'customer service',
      availableLanguage: ['English', 'Afrikaans']
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main Street',
      addressLocality: 'Johannesburg',
      addressRegion: 'Gauteng',
      postalCode: '2000',
      addressCountry: 'ZA'
    }
  };

  return JSON.stringify(schema);
}

// Generate WebSite Schema with SearchAction
export function generateWebsiteSchema(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Jeffy Commerce',
    url: 'https://jeffy.co.za',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://jeffy.co.za/products?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return JSON.stringify(schema);
}

// Generate FAQ Schema
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return JSON.stringify(schema);
}

// Generate Review Schema
export function generateReviewSchema(reviews: Array<{
  author: string;
  rating: number;
  content: string;
  date: string;
}>): string {
  return JSON.stringify(reviews.map(review => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1
    },
    reviewBody: review.content,
    datePublished: review.date
  })));
}

// Meta tags generator
export interface MetaTags {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: string;
}

export function generateMetaTags(meta: MetaTags): Record<string, string> {
  const tags: Record<string, string> = {
    // Basic
    'title': meta.title,
    'description': meta.description,
    
    // Open Graph
    'og:title': meta.title,
    'og:description': meta.description,
    'og:type': meta.type || 'website',
    'og:url': meta.url,
    'og:site_name': 'Jeffy Commerce',
    
    // Twitter
    'twitter:card': 'summary_large_image',
    'twitter:title': meta.title,
    'twitter:description': meta.description,
  };

  if (meta.image) {
    tags['og:image'] = meta.image;
    tags['twitter:image'] = meta.image;
  }

  if (meta.keywords && meta.keywords.length > 0) {
    tags['keywords'] = meta.keywords.join(', ');
  }

  if (meta.price) {
    tags['og:price:amount'] = (meta.price / 100).toFixed(2);
    tags['og:price:currency'] = meta.currency || 'ZAR';
  }

  if (meta.availability) {
    tags['og:availability'] = meta.availability;
  }

  return tags;
}

// Canonical URL helper
export function generateCanonicalUrl(path: string): string {
  const baseUrl = 'https://jeffy.co.za';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Robots meta helper
export function generateRobotsMeta(options: {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
}): string {
  const directives: string[] = [];
  
  directives.push(options.index !== false ? 'index' : 'noindex');
  directives.push(options.follow !== false ? 'follow' : 'nofollow');
  if (options.noarchive) directives.push('noarchive');
  if (options.nosnippet) directives.push('nosnippet');
  
  return directives.join(', ');
}
