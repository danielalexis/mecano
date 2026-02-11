import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@firebase/auth', '@firebase/firestore', '@firebase/storage'],
  
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'protobufjs': 'protobufjs/minimal',
    }
    
    // Externalize Firebase from server/worker bundle
    if (isServer) {
      config.externals = config.externals || [];
      
      // Add Firebase packages to externals for server-side
      const firebaseExternals = [
        'firebase',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
        '@firebase/app',
        '@firebase/auth',
        '@firebase/firestore',
        '@firebase/storage',
        '@firebase/component',
        '@firebase/util',
        '@firebase/logger',
      ];

      if (Array.isArray(config.externals)) {
        config.externals.push(...firebaseExternals);
      }
    } else {
      // Client-side configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },
  
  // Add empty turbopack config to silence the warning
  turbopack: {},
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/file',
        search: '*',
      },
    ],
  },
};

export default nextConfig;
