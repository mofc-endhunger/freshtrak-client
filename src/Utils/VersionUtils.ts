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
