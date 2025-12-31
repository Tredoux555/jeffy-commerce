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
        hostname: '**.1688.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/coming-soon',
        permanent: false, // Use false so it's easy to remove later
      },
    ];
  },
};

module.exports = nextConfig;
