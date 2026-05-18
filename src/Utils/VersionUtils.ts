/**
 * Version utility functions for FreshTrak app
 */

import packageJson from "../../package.json";

// Get version from package.json
export const getAppVersion = (): string => {
  return packageJson.version || "0.0.0";
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
