/** @type {import('next').NextConfig} */

// Load environment-specific configuration
const loadEnvConfig = () => {
  const appEnv = process.env.APP_ENV || process.env.NODE_ENV || 'local';
  
  // Using production domain for all environments as requested
  // unified-ai-engine-api.brevo.tech
  const productionDomain = 'https://unified-ai-engine-api.brevo.tech';
  
  // Environment-specific API configurations
  const envConfigs = {
    local: {
      apiBaseUrl: productionDomain,
      rewriteDestination: productionDomain,
    },
    development: {
      apiBaseUrl: productionDomain,
      rewriteDestination: productionDomain,
    },
    staging: {
      apiBaseUrl: productionDomain,
      rewriteDestination: productionDomain,
    },
    production: {
      apiBaseUrl: productionDomain,
      rewriteDestination: productionDomain,
    },
  };

  return envConfigs[appEnv] || envConfigs.local;
};

const envConfig = loadEnvConfig();

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Exclude workflow-frontend from compilation
  experimental: {
    externalDir: true,
  },

  // Exclude certain directories from compilation
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude workflow-frontend directory
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push('workflow-frontend/**/*');
    }

    // Add environment-specific plugins or configurations
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.BUILD_ID': JSON.stringify(buildId),
        'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
      })
    );

    // Environment-specific optimizations
    if (process.env.APP_ENV === 'production') {
      // Additional production optimizations
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
      };
    }

    return config;
  },
  
  // Environment variables available to the client
  env: {
    APP_ENV: process.env.APP_ENV || 'local',
    API_BASE_URL: envConfig.apiBaseUrl,
  },

  // Public runtime configuration
  publicRuntimeConfig: {
    appEnv: process.env.APP_ENV || 'local',
    apiBaseUrl: envConfig.apiBaseUrl,
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  },

  async rewrites() {
    // Only use rewrites for local development to avoid CORS issues
    if (process.env.APP_ENV === 'local' || process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: `${envConfig.rewriteDestination}/api/:path*`,
        },
        {
          source: '/health',
          destination: `${envConfig.rewriteDestination}/health`,
        },
      ];
    }
    return [];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Environment',
            value: process.env.APP_ENV || 'local',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // Output configuration for different environments
  output: process.env.APP_ENV === 'production' ? 'standalone' : undefined,

  // Compression for production builds
  compress: process.env.APP_ENV === 'production',

  // Power of 2 for better caching
  generateBuildId: async () => {
    // Use environment and timestamp for build ID
    const env = process.env.APP_ENV || 'local';
    const timestamp = new Date().getTime();
    return `${env}-${timestamp}`;
  },
};

module.exports = nextConfig;