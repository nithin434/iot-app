/**
 * Environment Configuration
 * Handles different API endpoints for development and production
 */

const ENV = process.env.NODE_ENV || 'development';

interface IEnvConfig {
  API_BASE_URL: string;
  TIMEOUT: number;
  LOG_REQUESTS: boolean;
  ENABLE_ANALYTICS: boolean;
}

const envConfig: Record<string, IEnvConfig> = {
  development: {
    API_BASE_URL: 'http://localhost:8000/api',
    TIMEOUT: 30000,
    LOG_REQUESTS: true,
    ENABLE_ANALYTICS: false,
  },
  staging: {
    API_BASE_URL: 'https://staging-api.iotmarketplace.com/api',
    TIMEOUT: 15000,
    LOG_REQUESTS: true,
    ENABLE_ANALYTICS: true,
  },
  production: {
    API_BASE_URL: 'https://api.iotmarketplace.com/api',
    TIMEOUT: 15000,
    LOG_REQUESTS: false,
    ENABLE_ANALYTICS: true,
  },
};

export const config: IEnvConfig = envConfig[ENV] || envConfig.development;

// For mobile/web detection
export const isWeb = typeof window !== 'undefined';
export const isMobile = !isWeb;
