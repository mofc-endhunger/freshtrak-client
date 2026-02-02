/**
 * Version utility functions for FreshTrak app
 */

// Get version from package.json
export const getAppVersion = (): string => {
  try {
    // Import package.json dynamically to avoid build issues
    const packageJson = require('../../package.json');
    return packageJson.version || '0.0.0';
  } catch (error) {
    console.warn('Could not read package.json version, using fallback');
    return '0.0.0';
  }
};

// Format version with 'v' prefix
export const formatVersion = (version: string): string => {
  return `v${version}`;
};

// Get formatted app version
export const getFormattedAppVersion = (): string => {
  const version = getAppVersion();
  return formatVersion(version);
};

// Version check result interface
export interface VersionCheckResult {
  needsUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  buildTime?: string;
}

/**
 * Check if app version matches server version
 * Fetches /version.json with cache-busting to get the latest deployed version
 * 
 * Note: Only runs in production. In development, version.json doesn't exist.
 */
export const checkAppVersion = async (): Promise<VersionCheckResult> => {
  const currentVersion = getAppVersion();

  // Skip version check in development mode
  if (process.env.NODE_ENV === 'development') {
    return { needsUpdate: false, currentVersion };
  }

  try {
    // Fetch version.json with cache-busting query param
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      // version.json doesn't exist yet or server error - don't show update notification
      return { needsUpdate: false, currentVersion };
    }

    // Check content-type to avoid parsing HTML error pages as JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Server returned non-JSON (likely HTML 404 page)
      return { needsUpdate: false, currentVersion };
    }

    const { version: latestVersion, buildTime } = await response.json();

    return {
      needsUpdate: latestVersion !== currentVersion,
      currentVersion,
      latestVersion,
      buildTime,
    };
  } catch (error) {
    // Silently fail - don't spam console in expected scenarios
    return { needsUpdate: false, currentVersion };
  }
};

/**
 * Force clear all caches and reload the application
 * Used when user clicks "Refresh Now" on update notification
 */
export const forceAppRefresh = (): void => {
  // Clear service worker caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }

  // Unregister service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  }

  // Clear dismissed version from localStorage
  localStorage.removeItem('ft_app_version_dismissed');

  // Hard reload (bypass cache)
  window.location.reload();
};