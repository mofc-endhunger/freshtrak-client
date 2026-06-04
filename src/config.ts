/**
 * Runtime configuration utility
 *
 * This module provides access to environment variables that work in both:
 * 1. Local development: Uses process.env (build-time from .env files)
 * 2. Production Docker: Uses window._env_ (runtime from ECS task definition)
 *
 * The runtime approach allows the same Docker image to be used across all environments.
 */

interface EnvConfig {
  CLIENT_URL: string;
  FRESHTRAK_PARTNERS_URL: string;
  GTM_ID: string;
  GA_ID?: string;
  PANTRY_FINDER_API: string;
  REGISTRATION_API: string;
  IMAGES_BASE_URL: string;
  GOOGLE_API_KEY: string;
  GOOGLE_GEOLOCATION_KEY: string;
  USER_POOL_ID: string;
  USER_POOL_CLIENT_ID: string;
  AWS_REGION: string;
  /** Set to "true" only on approved non-production hosts (e.g. beta2). */
  ALLOW_DEV_MOCK_IMAGES?: string;
}

// Check if running in browser with runtime config
const hasRuntimeConfig = typeof window !== 'undefined' && window._env_;

/**
 * Get a configuration value
 * Priority: window._env_ (runtime) > process.env (build-time)
 */
function getConfig(key: keyof EnvConfig): string {
  // First check runtime config (Docker/production)
  if (hasRuntimeConfig && window._env_ && window._env_[key]) {
    return window._env_[key];
  }

  // Fallback to build-time config (local development)
  const processEnvKey = `REACT_APP_${key}`;
  return process.env[processEnvKey] || '';
}

/**
 * Configuration object with all environment variables
 * Use this instead of process.env.REACT_APP_* throughout the app
 */
export const config: EnvConfig = {
  CLIENT_URL: getConfig('CLIENT_URL'),
  FRESHTRAK_PARTNERS_URL: getConfig('FRESHTRAK_PARTNERS_URL'),
  GTM_ID: getConfig('GTM_ID'),
  GA_ID: getConfig('GA_ID') || undefined,
  PANTRY_FINDER_API: getConfig('PANTRY_FINDER_API'),
  REGISTRATION_API: getConfig('REGISTRATION_API'),
  IMAGES_BASE_URL: getConfig('IMAGES_BASE_URL') || 'https://images.pantrytrak.com',
  GOOGLE_API_KEY: getConfig('GOOGLE_API_KEY'),
  GOOGLE_GEOLOCATION_KEY: getConfig('GOOGLE_GEOLOCATION_KEY'),
  USER_POOL_ID: getConfig('USER_POOL_ID'),
  USER_POOL_CLIENT_ID: getConfig('USER_POOL_CLIENT_ID'),
  AWS_REGION: getConfig('AWS_REGION'),
  ALLOW_DEV_MOCK_IMAGES: getConfig('ALLOW_DEV_MOCK_IMAGES') || undefined,
};

export default config;
