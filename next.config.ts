import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'landinggo.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
    // Serve static files from assets directory
    async rewrites() {
      return [
        {
          source: '/assets/eresources/:path*',
          destination: '/api/serve-eresource/:path*',
        },
        {
          source: '/assets/:path*',
          destination: '/assets/:path*',
        },
      ];
    },

};

export default nextConfig;
