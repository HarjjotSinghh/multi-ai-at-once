/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize Playwright for server-side
      config.externals = [...(config.externals || []), 'playwright'];
    }
    return config;
  },
};

module.exports = nextConfig;
