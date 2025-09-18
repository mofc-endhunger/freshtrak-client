/**
 * Loading States Hook for Households Module
 * Manages loading states for all async operations
 */

import { useState, useCallback, useRef } from "react";

export interface LoadingState {
	isLoading: boolean;
	operation?: string;
	progress?: number;
	startTime?: number;
}

export interface LoadingStates {
	[key: string]: LoadingState;
}

export interface UseLoadingStatesReturn {
	loadingStates: LoadingStates;
	startLoading: (operation: string) => void;
	stopLoading: (operation: string) => void;
	setProgress: (operation: string, progress: number) => void;
	isLoading: (operation: string) => boolean;
	isAnyLoading: boolean;
	getLoadingOperations: () => string[];
	clearAllLoading: () => void;
}

/**
 * Hook for managing multiple loading states
 */
export const useLoadingStates = (): UseLoadingStatesReturn => {
	const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
	const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

	const startLoading = useCallback((operation: string) => {
		setLoadingStates(prev => ({
			...prev,
			[operation]: {
				isLoading: true,
				operation,
				startTime: Date.now(),
				progress: 0,
			},
		}));

		// Set a timeout to prevent infinite loading states
		const timeout = setTimeout(() => {
			setLoadingStates(prev => ({
				...prev,
				[operation]: {
					...prev[operation],
					isLoading: false,
				},
			}));
		}, 30000); // 30 second timeout

		timeoutsRef.current.set(operation, timeout);
	}, []);

	const stopLoading = useCallback((operation: string) => {
		// Clear timeout if it exists
		const timeout = timeoutsRef.current.get(operation);
		if (timeout) {
			clearTimeout(timeout);
			timeoutsRef.current.delete(operation);
		}

		setLoadingStates(prev => ({
			...prev,
			[operation]: {
				...prev[operation],
				isLoading: false,
				progress: 100,
			},
		}));

		// Remove the loading state after a short delay to show completion
		setTimeout(() => {
			setLoadingStates(prev => {
				const newStates = { ...prev };
				delete newStates[operation];
				return newStates;
			});
		}, 500);
	}, []);

	const setProgress = useCallback((operation: string, progress: number) => {
		setLoadingStates(prev => ({
			...prev,
			[operation]: {
				...prev[operation],
				progress: Math.max(0, Math.min(100, progress)),
			},
		}));
	}, []);

	const isLoading = useCallback(
		(operation: string): boolean => {
			return loadingStates[operation]?.isLoading || false;
		},
		[loadingStates]
	);

	const isAnyLoading = Object.values(loadingStates).some(
		state => state.isLoading
	);

	const getLoadingOperations = useCallback((): string[] => {
		return Object.entries(loadingStates)
			.filter(([_, state]) => state.isLoading)
			.map(([operation, _]) => operation);
	}, [loadingStates]);

	const clearAllLoading = useCallback(() => {
		// Clear all timeouts
		timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
		timeoutsRef.current.clear();

		setLoadingStates({});
	}, []);

	return {
		loadingStates,
		startLoading,
		stopLoading,
		setProgress,
		isLoading,
		isAnyLoading,
		getLoadingOperations,
		clearAllLoading,
	};
};

/**
 * Hook for managing a single loading state
 */
export const useLoadingState = (operation: string) => {
	const { startLoading, stopLoading, setProgress, isLoading } =
		useLoadingStates();

	const start = useCallback(() => {
		startLoading(operation);
	}, [startLoading, operation]);

	const stop = useCallback(() => {
		stopLoading(operation);
	}, [stopLoading, operation]);

	const updateProgress = useCallback(
		(progress: number) => {
			setProgress(operation, progress);
		},
		[setProgress, operation]
	);

	const loading = isLoading(operation);

	return {
		loading,
		startLoading: start,
		stopLoading: stop,
		setProgress: updateProgress,
	};
};

/**
 * Hook for managing loading states with automatic cleanup
 */
export const useAsyncLoading = () => {
	const { startLoading, stopLoading, isLoading } = useLoadingStates();

	const executeWithLoading = useCallback(
		async <T,>(
			operation: string,
			asyncFunction: () => Promise<T>
		): Promise<T> => {
			startLoading(operation);
			try {
				const result = await asyncFunction();
				return result;
			} finally {
				stopLoading(operation);
			}
		},
		[startLoading, stopLoading]
	);

	return {
		executeWithLoading,
		isLoading,
	};
};
