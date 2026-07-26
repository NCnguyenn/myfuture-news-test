import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/ban-tin.html',
        destination: '/ban-tin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
