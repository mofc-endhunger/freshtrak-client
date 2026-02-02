import { useEffect, useState, useCallback } from 'react';
import {
  checkAppVersion,
  VersionCheckResult,
  forceAppRefresh,
} from '../Utils/VersionUtils';

interface UseVersionCheckOptions {
  /** Check interval in milliseconds (default: 5 minutes) */
  checkInterval?: number;
  /** Whether to check when window regains focus (default: true) */
  checkOnFocus?: boolean;
}

interface UseVersionCheckReturn {
  /** Whether a new version is available */
  updateAvailable: boolean;
  /** Version information from the last check */
  versionInfo: VersionCheckResult | null;
  /** Dismiss the update notification (remembers for this version) */
  dismiss: () => void;
  /** Force refresh the app to get the latest version */
  refresh: () => void;
  /** Manually trigger a version check */
  checkNow: () => Promise<void>;
}

/**
 * Hook to check for app updates and notify users
 *
 * Features:
 * - Periodic version checking (configurable interval)
 * - Checks on window focus (user returns to tab)
 * - Dismiss functionality with localStorage persistence
 * - Force refresh to clear caches and reload
 */
export const useVersionCheck = (
  options: UseVersionCheckOptions = {}
): UseVersionCheckReturn => {
  const {
    checkInterval = 5 * 60 * 1000, // 5 minutes default
    checkOnFocus = true,
  } = options;

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionCheckResult | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);

  // Check if this version was previously dismissed
  useEffect(() => {
    const dismissedVersion = localStorage.getItem('ft_app_version_dismissed');
    if (dismissedVersion && versionInfo?.latestVersion === dismissedVersion) {
      setDismissed(true);
    }
  }, [versionInfo?.latestVersion]);

  const checkVersion = useCallback(async () => {
    const result = await checkAppVersion();
    setVersionInfo(result);

    // Check if this version was dismissed
    const dismissedVersion = localStorage.getItem('ft_app_version_dismissed');
    const wasDismissed =
      dismissedVersion && result.latestVersion === dismissedVersion;

    if (result.needsUpdate && !wasDismissed) {
      setUpdateAvailable(true);
      setDismissed(false);
    } else if (!result.needsUpdate) {
      // Version matches, clear any dismissed state
      setUpdateAvailable(false);
      localStorage.removeItem('ft_app_version_dismissed');
    }
  }, []);

  // Initial check and interval
  useEffect(() => {
    checkVersion();

    const interval = setInterval(checkVersion, checkInterval);
    return () => clearInterval(interval);
  }, [checkVersion, checkInterval]);

  // Check on window focus
  useEffect(() => {
    if (!checkOnFocus) return;

    const handleFocus = () => {
      checkVersion();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkOnFocus, checkVersion]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    setUpdateAvailable(false);
    // Remember dismissal for this specific version
    if (versionInfo?.latestVersion) {
      localStorage.setItem(
        'ft_app_version_dismissed',
        versionInfo.latestVersion
      );
    }
  }, [versionInfo]);

  const refresh = useCallback(() => {
    forceAppRefresh();
  }, []);

  return {
    updateAvailable: updateAvailable && !dismissed,
    versionInfo,
    dismiss,
    refresh,
    checkNow: checkVersion,
  };
};
