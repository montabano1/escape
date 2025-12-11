/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure basePath for subdirectory deployment (e.g., /escape-room)
  // Set NEXT_PUBLIC_BASE_PATH environment variable or leave empty for root deployment
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  typescript: {
    // Exclude main and functions directories from type checking
    ignoreBuildErrors: false,
  },
  // Exclude main directory from webpack compilation
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/main', '**/functions'],
    };
    return config;
  },
  // Add security headers that may help with corporate proxies
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Help proxies understand this is a legitimate web application
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

