const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  // Image optimization for Render.com
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
