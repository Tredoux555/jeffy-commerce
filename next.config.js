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
  // Redirects removed for launch - site is now LIVE
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/coming-soon',
  //       permanent: false,
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
