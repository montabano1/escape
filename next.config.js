/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
}

module.exports = nextConfig

