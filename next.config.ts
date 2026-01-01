import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Use Cloudinary for image optimization instead of Vercel
    loader: 'custom',
    loaderFile: './lib/cloudinary-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '*.ufs.sh',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '*.uploadthing.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'files.cdn.printful.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
