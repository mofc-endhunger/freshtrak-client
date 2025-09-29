/**
 * Offline Detection Hook for Households Module
 * Handles offline scenarios and provides offline-aware functionality
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface OfflineState {
	isOffline: boolean;
	wasOffline: boolean;
	lastOnlineTime?: string;
	lastOfflineTime?: string;
	reconnectAttempts: number;
}

export interface UseOfflineDetectionReturn {
	offlineState: OfflineState;
	isOffline: boolean;
	wasOffline: boolean;
	reconnectAttempts: number;
	handleOfflineAction: <T>(action: () => Promise<T>) => Promise<T>;
	queueAction: <T>(action: () => Promise<T>) => Promise<T>;
	clearQueue: () => void;
	retryQueuedActions: () => Promise<void>;
}

/**
 * Hook for detecting and handling offline states
 */
export const useOfflineDetection = (): UseOfflineDetectionReturn => {
	const [offlineState, setOfflineState] = useState<OfflineState>({
		isOffline: !navigator.onLine,
		wasOffline: false,
		reconnectAttempts: 0,
	});

	const actionQueueRef = useRef<Array<() => Promise<any>>>([]);

	// Update offline state when network status changes
	useEffect(() => {
		const handleOnline = () => {
			setOfflineState(prev => ({
				...prev,
				isOffline: false,
				wasOffline: prev.isOffline,
				lastOnlineTime: new Date().toISOString(),
				reconnectAttempts: 0,
			}));
		};

		const handleOffline = () => {
			setOfflineState(prev => ({
				...prev,
				isOffline: true,
				wasOffline: false,
				lastOfflineTime: new Date().toISOString(),
			}));
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	// Auto-retry queued actions when coming back online
	useEffect(() => {
		if (
			!offlineState.isOffline &&
			offlineState.wasOffline &&
			actionQueueRef.current.length > 0
		) {
			retryQueuedActions();
		}
		//TODO: check useEffect dependencies and make sure they are correct
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [offlineState.isOffline, offlineState.wasOffline]);

	const handleOfflineAction = useCallback(
		async <T,>(action: () => Promise<T>): Promise<T> => {
			if (offlineState.isOffline) {
				// Queue the action for later execution
				return new Promise((resolve, reject) => {
					actionQueueRef.current.push(async () => {
						try {
							const result = await action();
							resolve(result);
						} catch (error) {
							reject(error);
						}
					});
				});
			}

			return action();
		},
		[offlineState.isOffline]
	);

	const queueAction = useCallback(
		async <T,>(action: () => Promise<T>): Promise<T> => {
			return new Promise((resolve, reject) => {
				actionQueueRef.current.push(async () => {
					try {
						const result = await action();
						resolve(result);
					} catch (error) {
						reject(error);
					}
				});
			});
		},
		[]
	);

	const clearQueue = useCallback(() => {
		actionQueueRef.current = [];
	}, []);

	const retryQueuedActions = useCallback(async () => {
		if (actionQueueRef.current.length === 0) return;

		const actions = [...actionQueueRef.current];
		actionQueueRef.current = [];

		for (const action of actions) {
			try {
				await action();
			} catch (error) {
				console.error("Failed to execute queued action:", error);
				// Re-queue failed actions for next retry
				actionQueueRef.current.push(action);
			}
		}
	}, []);

	return {
		offlineState,
		isOffline: offlineState.isOffline,
		wasOffline: offlineState.wasOffline,
		reconnectAttempts: offlineState.reconnectAttempts,
		handleOfflineAction,
		queueAction,
		clearQueue,
		retryQueuedActions,
	};
};

/**
 * Hook for components that need to be offline-aware
 */
export const useOfflineAware = () => {
	const { isOffline, handleOfflineAction } = useOfflineDetection();

	const executeWhenOnline = useCallback(
		async <T,>(
			action: () => Promise<T>,
			fallback?: () => T
		): Promise<T> => {
			if (isOffline) {
				if (fallback) {
					return fallback();
				}
				throw new Error("Action cannot be performed while offline");
			}

			return handleOfflineAction(action);
		},
		[isOffline, handleOfflineAction]
	);

	return {
		isOffline,
		executeWhenOnline,
	};
};
