/**
 * Generate version.json file for production builds
 *
 * This script creates a version.json file in the build directory
 * that the client app uses to detect when a new version is deployed.
 *
 * Usage: node scripts/generate-version.js
 * Called automatically after build via package.json scripts
 */

const fs = require('fs');
const path = require('path');

// Read version from package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = require(packageJsonPath);

const versionInfo = {
  version: packageJson.version,
  buildTime: new Date().toISOString(),
  name: packageJson.name,
};

// Output to build directory
const outputPath = path.join(__dirname, '..', 'build', 'version.json');

// Check if build directory exists
const buildDir = path.dirname(outputPath);
if (!fs.existsSync(buildDir)) {
  console.warn('Warning: build directory does not exist. Run this after build.');
  process.exit(0);
}

fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));

console.log(`✓ Generated version.json: v${versionInfo.version} at ${versionInfo.buildTime}`);
