# Version Control Feature

## Overview

The FreshTrak app now includes a version control feature that displays the current app version in the footer. This allows developers and users to easily identify which version of the app is currently running in production.

## How It Works

-   The version is automatically read from the `package.json` file
-   The version is displayed in the footer below the copyright text
-   The version format follows the pattern: `vX.X.X` (e.g., `v0.1.0`)

## Updating the Version

To update the app version:

1. **Edit `package.json`**: Update the `version` field in the root `package.json` file

    ```json
    {
      "name": "frontend",
      "version": "0.1.1",  // Change this value
      "private": true,
      ...
    }
    ```

2. **Rebuild and Deploy**: After updating the version, rebuild and deploy the app
    ```bash
    npm run build:production
    ```

## Display Location

The version is displayed in the footer component at the bottom of every page:

-   **Current**: `© 2025 FreshTrak`
-   **Version**: `v0.1.0` (below the copyright text)

## Technical Implementation

-   **File**: `src/Utils/VersionUtils.ts`
-   **Component**: `src/Modules/Footer/FooterComponent.tsx`
-   **Function**: `getFormattedAppVersion()` - Returns the formatted version string

## Benefits

-   **Developer Experience**: Easy to identify deployed versions
-   **User Experience**: Users can report issues with specific version information
-   **Deployment Tracking**: Clear visibility of what version is in production
-   **Maintenance**: Simplified version management through package.json

## Example

When you update `package.json` from `"version": "0.1.0"` to `"version": "0.1.1"`, the footer will automatically display `v0.1.1` after the next build and deployment.
