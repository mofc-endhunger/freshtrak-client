/**
 * Performance Monitoring Hook
 * Monitors component performance, API calls, and user interactions
 */

import { useEffect, useRef, useCallback, useState, useMemo } from "react";

interface PerformanceMetrics {
	componentRenderTime: number;
	apiCallTime: number;
	userInteractionTime: number;
	memoryUsage?: number;
	errorCount: number;
}

interface PerformanceConfig {
	enableMonitoring: boolean;
	logToConsole: boolean;
	sendToAnalytics: boolean;
	thresholds: {
		slowRender: number; // ms
		slowApiCall: number; // ms
		slowInteraction: number; // ms
	};
}

interface ApiCallMetrics {
	url: string;
	method: string;
	duration: number;
	status: "success" | "error";
	timestamp: number;
}

interface UserInteractionMetrics {
	action: string;
	duration: number;
	timestamp: number;
}

const defaultConfig: PerformanceConfig = {
	enableMonitoring: true,
	logToConsole: false,
	sendToAnalytics: false,
	thresholds: {
		slowRender: 100, // 100ms
		slowApiCall: 1000, // 1 second
		slowInteraction: 500, // 500ms
	},
};

export const usePerformanceMonitor = (
	componentName: string,
	config: Partial<PerformanceConfig> = {}
) => {
	const mergedConfig = useMemo(
		() => ({ ...defaultConfig, ...config }),
		[config]
	);
	const renderStartTime = useRef<number>(0);
	const [metrics, setMetrics] = useState<PerformanceMetrics>({
		componentRenderTime: 0,
		apiCallTime: 0,
		userInteractionTime: 0,
		errorCount: 0,
	});
	const apiCallsRef = useRef<ApiCallMetrics[]>([]);
	const interactionsRef = useRef<UserInteractionMetrics[]>([]);

	// Track component render time
	useEffect(() => {
		if (!mergedConfig.enableMonitoring) return;

		renderStartTime.current = performance.now();

		return () => {
			const renderTime = performance.now() - renderStartTime.current;

			setMetrics(prev => ({
				...prev,
				componentRenderTime: renderTime,
			}));

			if (
				mergedConfig.logToConsole &&
				renderTime > mergedConfig.thresholds.slowRender
			) {
				console.warn(
					`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(
						2
					)}ms`
				);
			}

			if (mergedConfig.sendToAnalytics) {
				// Send to analytics service
				sendToAnalytics("component_render", {
					component: componentName,
					duration: renderTime,
					isSlow: renderTime > mergedConfig.thresholds.slowRender,
				});
			}
		};
	}, [componentName, mergedConfig]);

	// Track API calls
	const trackApiCall = useCallback(
		async <T,>(
			apiCall: () => Promise<T>,
			url: string,
			method: string = "GET"
		): Promise<T> => {
			if (!mergedConfig.enableMonitoring) {
				return apiCall();
			}

			const startTime = performance.now();
			const timestamp = Date.now();

			try {
				const result = await apiCall();
				const duration = performance.now() - startTime;

				const apiMetric: ApiCallMetrics = {
					url,
					method,
					duration,
					status: "success",
					timestamp,
				};

				apiCallsRef.current.push(apiMetric);
				setMetrics(prev => ({
					...prev,
					apiCallTime: duration,
				}));

				if (
					mergedConfig.logToConsole &&
					duration > mergedConfig.thresholds.slowApiCall
				) {
					console.warn(
						`🐌 Slow API call detected: ${method} ${url} took ${duration.toFixed(
							2
						)}ms`
					);
				}

				if (mergedConfig.sendToAnalytics) {
					sendToAnalytics("api_call", {
						url,
						method,
						duration,
						status: "success",
						isSlow: duration > mergedConfig.thresholds.slowApiCall,
					});
				}

				return result;
			} catch (error) {
				const duration = performance.now() - startTime;

				const apiMetric: ApiCallMetrics = {
					url,
					method,
					duration,
					status: "error",
					timestamp,
				};

				apiCallsRef.current.push(apiMetric);
				setMetrics(prev => ({
					...prev,
					apiCallTime: duration,
					errorCount: prev.errorCount + 1,
				}));

				if (mergedConfig.logToConsole) {
					console.error(
						`❌ API call failed: ${method} ${url} after ${duration.toFixed(
							2
						)}ms`,
						error
					);
				}

				if (mergedConfig.sendToAnalytics) {
					sendToAnalytics("api_call", {
						url,
						method,
						duration,
						status: "error",
						error:
							error instanceof Error
								? error.message
								: "Unknown error",
					});
				}

				throw error;
			}
		},
		[mergedConfig]
	);

	// Track user interactions
	const trackUserInteraction = useCallback(
		async <T,>(
			interaction: () => Promise<T>,
			action: string
		): Promise<T> => {
			if (!mergedConfig.enableMonitoring) {
				return interaction();
			}

			const startTime = performance.now();
			const timestamp = Date.now();

			try {
				const result = await interaction();
				const duration = performance.now() - startTime;

				const interactionMetric: UserInteractionMetrics = {
					action,
					duration,
					timestamp,
				};

				interactionsRef.current.push(interactionMetric);
				setMetrics(prev => ({
					...prev,
					userInteractionTime: duration,
				}));

				if (
					mergedConfig.logToConsole &&
					duration > mergedConfig.thresholds.slowInteraction
				) {
					console.warn(
						`🐌 Slow user interaction detected: ${action} took ${duration.toFixed(
							2
						)}ms`
					);
				}

				if (mergedConfig.sendToAnalytics) {
					sendToAnalytics("user_interaction", {
						action,
						duration,
						isSlow:
							duration > mergedConfig.thresholds.slowInteraction,
					});
				}

				return result;
			} catch (error) {
				const duration = performance.now() - startTime;

				if (mergedConfig.logToConsole) {
					console.error(
						`❌ User interaction failed: ${action} after ${duration.toFixed(
							2
						)}ms`,
						error
					);
				}

				if (mergedConfig.sendToAnalytics) {
					sendToAnalytics("user_interaction", {
						action,
						duration,
						status: "error",
						error:
							error instanceof Error
								? error.message
								: "Unknown error",
					});
				}

				throw error;
			}
		},
		[mergedConfig]
	);

	// Get performance summary
	const getPerformanceSummary = useCallback(() => {
		const apiCalls = apiCallsRef.current;
		const interactions = interactionsRef.current;

		const avgApiCallTime =
			apiCalls.length > 0
				? apiCalls.reduce((sum, call) => sum + call.duration, 0) /
				  apiCalls.length
				: 0;

		const avgInteractionTime =
			interactions.length > 0
				? interactions.reduce(
						(sum, interaction) => sum + interaction.duration,
						0
				  ) / interactions.length
				: 0;

		const errorRate =
			apiCalls.length > 0
				? apiCalls.filter(call => call.status === "error").length /
				  apiCalls.length
				: 0;

		return {
			component: componentName,
			metrics,
			summary: {
				totalApiCalls: apiCalls.length,
				totalInteractions: interactions.length,
				avgApiCallTime,
				avgInteractionTime,
				errorRate,
				slowApiCalls: apiCalls.filter(
					call => call.duration > mergedConfig.thresholds.slowApiCall
				).length,
				slowInteractions: interactions.filter(
					interaction =>
						interaction.duration >
						mergedConfig.thresholds.slowInteraction
				).length,
			},
			apiCalls: apiCalls.slice(-10), // Last 10 API calls
			interactions: interactions.slice(-10), // Last 10 interactions
		};
	}, [componentName, metrics, mergedConfig]);

	// Clear metrics
	const clearMetrics = useCallback(() => {
		apiCallsRef.current = [];
		interactionsRef.current = [];
		setMetrics({
			componentRenderTime: 0,
			apiCallTime: 0,
			userInteractionTime: 0,
			errorCount: 0,
		});
	}, []);

	// Monitor memory usage (if available)
	useEffect(() => {
		if (!mergedConfig.enableMonitoring || !("memory" in performance))
			return;

		const updateMemoryUsage = () => {
			const memory = (performance as any).memory;
			if (memory) {
				setMetrics(prev => ({
					...prev,
					memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
				}));
			}
		};

		const interval = setInterval(updateMemoryUsage, 5000); // Update every 5 seconds
		return () => clearInterval(interval);
	}, [mergedConfig.enableMonitoring]);

	return {
		metrics,
		trackApiCall,
		trackUserInteraction,
		getPerformanceSummary,
		clearMetrics,
	};
};

// Helper function to send metrics to analytics
const sendToAnalytics = (event: string, data: any) => {
	// This would integrate with your analytics service
	// For now, we'll just log it
	console.log(`📊 Analytics: ${event}`, data);

	// Example integration with Google Analytics:
	// if (typeof gtag !== 'undefined') {
	//   gtag('event', event, data);
	// }
};

// Hook for monitoring specific API calls
export const useApiPerformanceMonitor = (
	config: Partial<PerformanceConfig> = {}
) => {
	const monitorApiCall = useCallback(
		async <T,>(
			apiCall: () => Promise<T>,
			url: string,
			method: string = "GET"
		): Promise<T> => {
			const mergedConfig = { ...defaultConfig, ...config };

			if (!mergedConfig.enableMonitoring) {
				return apiCall();
			}

			const startTime = performance.now();

			try {
				const result = await apiCall();
				const duration = performance.now() - startTime;

				if (
					mergedConfig.logToConsole &&
					duration > mergedConfig.thresholds.slowApiCall
				) {
					console.warn(
						`🐌 Slow API call: ${method} ${url} took ${duration.toFixed(
							2
						)}ms`
					);
				}

				if (mergedConfig.sendToAnalytics) {
					sendToAnalytics("api_call", {
						url,
						method,
						duration,
						status: "success",
						isSlow: duration > mergedConfig.thresholds.slowApiCall,
					});
				}

				return result;
			} catch (error) {
				const duration = performance.now() - startTime;

				if (mergedConfig.logToConsole) {
					console.error(
						`❌ API call failed: ${method} ${url} after ${duration.toFixed(
							2
						)}ms`,
						error
					);
				}

				if (mergedConfig.sendToAnalytics) {
					sendToAnalytics("api_call", {
						url,
						method,
						duration,
						status: "error",
						error:
							error instanceof Error
								? error.message
								: "Unknown error",
					});
				}

				throw error;
			}
		},
		[config]
	);

	return { monitorApiCall };
};
