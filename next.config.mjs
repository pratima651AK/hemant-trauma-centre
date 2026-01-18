/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      formats: ['image/avif', 'image/webp'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
    },
    async headers() {
      return [
        {
          source: '/assets/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ];
    },
    experimental: {
      optimizePackageImports: ['lucide-react'],
    },
    reactStrictMode: true,
};

// Optional: Enable Bundle Analyzer if needed by the user in future
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// });
// export default withBundleAnalyzer(nextConfig);

export default nextConfig;
