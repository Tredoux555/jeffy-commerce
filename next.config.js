/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cbu01.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'cbu02.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'cbu03.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.1688.com',
      },
      {
        protocol: 'https',
        hostname: '**.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'img.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: true, // Skip optimization for external images
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // Experimental features for better performance
  experimental: {
    // optimizeCss removed - requires critters package
  },
};

module.exports = nextConfig;
