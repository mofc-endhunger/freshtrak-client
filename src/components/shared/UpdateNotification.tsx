import React from 'react';
import { useVersionCheck } from '../../hooks/useVersionCheck';
import { Button } from '../ui/button';
import { RefreshCw, X } from 'lucide-react';

/**
 * UpdateNotification Component
 *
 * Displays a notification when a new version of the app is available.
 * Positioned at the bottom-right of the screen.
 *
 * Features:
 * - "Refresh Now" button to update immediately
 * - "Later" option to dismiss (remembered per version)
 * - Shows version change information
 */
export const UpdateNotification: React.FC = () => {
  const { updateAvailable, versionInfo, dismiss, refresh } = useVersionCheck({
    checkInterval: 5 * 60 * 1000, // Check every 5 minutes
    checkOnFocus: true,
  });

  if (!updateAvailable) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] max-w-sm 
                 bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4
                 animate-in slide-in-from-bottom-5 duration-300"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <RefreshCw className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-amber-800">
            Update Available
          </h4>
          <p className="text-sm text-amber-700 mt-1">
            A new version of FreshTrak is available.
          </p>
          {versionInfo?.latestVersion && (
            <p className="text-xs mt-1 text-amber-600">
              v{versionInfo.currentVersion} → v{versionInfo.latestVersion}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <Button
              onClick={refresh}
              variant="highlight"
              className="min-h-10 min-w-32 text-xs px-4"
            >
              Refresh Now
            </Button>
            <Button
              variant="ghost"
              onClick={dismiss}
              className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 text-xs"
            >
              Later
            </Button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="flex-shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
          aria-label="Dismiss update notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
