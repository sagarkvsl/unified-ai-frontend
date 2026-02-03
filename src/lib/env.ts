// Simplified environment configuration for Next.js
// Avoiding singleton pattern that causes build issues

export interface EnvironmentConfig {
  APP_ENV: string;
  API_URL: string;
  CHAT_API_URL: string;
  HEALTH_CHECK_URL: string;
  ANALYTICS_API_URL: string;
  QUESTIONS_API_URL: string;
  USERS_API_URL: string;
  PUBLIC_URL: string;
  DEBUG_MODE: boolean;
  ENABLE_ANALYTICS: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  SENTRY_DSN?: string;
  GTM_ID?: string;
}

function getDefaultPublicUrl(env: string): string {
  switch (env) {
    case 'local':
      return 'http://localhost:3001';
    case 'development':
      return 'https://unified-ai-dev.brevo.com';
    case 'staging':
      return 'https://unified-ai-staging.brevo.com';
    case 'production':
      return 'https://unified-ai.brevo.com';
    default:
      return 'http://localhost:3001';
  }
}

function getDefaultLogLevel(env: string): 'debug' | 'info' | 'warn' | 'error' {
  switch (env) {
    case 'local':
      return 'debug';
    case 'development':
      return 'info';
    case 'staging':
      return 'warn';
    case 'production':
      return 'error';
    default:
      return 'debug';
  }
}

function getBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

function loadEnvironmentConfig(): EnvironmentConfig {
  // Determine environment from multiple sources
  const appEnv = process.env.APP_ENV || 
                 process.env.NEXT_PUBLIC_APP_ENV || 
                 process.env.NODE_ENV || 
                 'local';

  // Default API URL - using production domain for all environments as requested
  const defaultApiUrl = 'https://unified-ai-engine-api.brevo.tech';
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || defaultApiUrl;

  return {
    APP_ENV: appEnv,
    API_URL: apiUrl,
    CHAT_API_URL: process.env.CHAT_API_URL || `${apiUrl}/api/chat`,
    HEALTH_CHECK_URL: process.env.HEALTH_CHECK_URL || `${apiUrl}/health`,
    ANALYTICS_API_URL: process.env.ANALYTICS_API_URL || `${apiUrl}/api/analytics`,
    QUESTIONS_API_URL: process.env.QUESTIONS_API_URL || `${apiUrl}/api/questions`,
    USERS_API_URL: process.env.USERS_API_URL || `${apiUrl}/api/users`,
    PUBLIC_URL: process.env.PUBLIC_URL || getDefaultPublicUrl(appEnv),
    DEBUG_MODE: getBooleanEnv('NEXT_PUBLIC_DEBUG_MODE', appEnv === 'local'),
    ENABLE_ANALYTICS: getBooleanEnv('NEXT_PUBLIC_ENABLE_ANALYTICS', appEnv === 'production'),
    LOG_LEVEL: (process.env.NEXT_PUBLIC_LOG_LEVEL as any) || getDefaultLogLevel(appEnv),
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  };
}

// Load configuration once
const envConfig = loadEnvironmentConfig();

// Export configuration object
export const getEnvironmentConfig = (): EnvironmentConfig => envConfig;

// Export convenience functions
export const getEnvironment = (): string => envConfig.APP_ENV;

export const getApiUrl = (endpoint?: string): string => {
  const baseUrl = envConfig.API_URL;
  return endpoint ? `${baseUrl}${endpoint}` : baseUrl;
};

export const getChatApiUrl = (): string => envConfig.CHAT_API_URL;

export const getHealthCheckUrl = (): string => envConfig.HEALTH_CHECK_URL;

export const getAnalyticsApiUrl = (): string => envConfig.ANALYTICS_API_URL;

export const getQuestionsApiUrl = (): string => envConfig.QUESTIONS_API_URL;

export const getUsersApiUrl = (): string => envConfig.USERS_API_URL;

export const getPublicUrl = (): string => envConfig.PUBLIC_URL;

export const isDebugMode = (): boolean => envConfig.DEBUG_MODE;

export const isAnalyticsEnabled = (): boolean => envConfig.ENABLE_ANALYTICS;

export const getLogLevel = (): string => envConfig.LOG_LEVEL;

export const getSentryDsn = (): string | undefined => envConfig.SENTRY_DSN;

export const getGtmId = (): string | undefined => envConfig.GTM_ID;

export const isProduction = (): boolean => envConfig.APP_ENV === 'production';

export const isDevelopment = (): boolean => 
  envConfig.APP_ENV === 'development' || envConfig.APP_ENV === 'local';

export const validateConfiguration = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!envConfig.API_URL) {
    errors.push('API_URL is required');
  }

  if (!envConfig.PUBLIC_URL) {
    errors.push('PUBLIC_URL is required');
  }

  // Validate URLs
  try {
    new URL(envConfig.API_URL);
  } catch {
    errors.push('API_URL must be a valid URL');
  }

  try {
    new URL(envConfig.PUBLIC_URL);
  } catch {
    errors.push('PUBLIC_URL must be a valid URL');
  }

  // Environment-specific validations
  if (envConfig.APP_ENV === 'production') {
    if (!envConfig.SENTRY_DSN) {
      errors.push('SENTRY_DSN is required for production environment');
    }
    
    if (envConfig.DEBUG_MODE) {
      errors.push('DEBUG_MODE should be false in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getExternalConfig = (): Record<string, any> => {
  return {
    sentry: {
      dsn: envConfig.SENTRY_DSN,
      environment: envConfig.APP_ENV,
      debug: envConfig.DEBUG_MODE,
    },
    gtm: {
      id: envConfig.GTM_ID,
      enabled: envConfig.ENABLE_ANALYTICS,
    },
    api: {
      baseUrl: envConfig.API_URL,
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    }
  };
};