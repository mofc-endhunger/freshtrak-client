/**
 * Lazy Components for Household Module
 * Code splitting and lazy loading for better performance
 */

import React, { Suspense, lazy } from "react";
import { Card, CardContent } from "../../../components/ui/card";

// Loading component
const LoadingSpinner = () => (
	<Card>
		<CardContent className="flex items-center justify-center p-8">
			<div className="flex flex-col items-center space-y-4">
				<div className="w-8 h-8 border-4 border-highlight border-t-transparent rounded-full animate-spin"></div>
				<p className="text-gray-600">Loading...</p>
			</div>
		</CardContent>
	</Card>
);

// Error boundary component
interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

class ErrorBoundary extends React.Component<
	React.PropsWithChildren<{}>,
	ErrorBoundaryState
> {
	constructor(props: React.PropsWithChildren<{}>) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Lazy component error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<Card>
					<CardContent className="flex items-center justify-center p-8">
						<div className="text-center">
							<div className="text-red-500 mb-4">
								<svg
									className="w-12 h-12 mx-auto"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Something went wrong
							</h3>
							<p className="text-gray-600 mb-4">
								Failed to load component. Please try refreshing
								the page.
							</p>
							<button
								onClick={() => window.location.reload()}
								className="bg-highlight text-white px-4 py-2 rounded-md hover:bg-highlight-dark"
							>
								Refresh Page
							</button>
						</div>
					</CardContent>
				</Card>
			);
		}

		return this.props.children;
	}
}

// Lazy load heavy components
export const LazyHouseholdDashboard = lazy(() =>
	import("./MemoizedHouseholdDashboard").then(module => ({
		default: module.MemoizedHouseholdDashboard,
	}))
);

export const LazyVirtualizedMemberList = lazy(() =>
	import("./VirtualizedMemberList").then(module => ({
		default: module.VirtualizedMemberList,
	}))
);

export const LazyHouseholdSetupWizard = lazy(() =>
	import("./HouseholdSetupWizard").then(module => ({
		default: module.HouseholdSetupWizard,
	}))
);

export const LazyHouseholdInfoManager = lazy(() =>
	import("./HouseholdInfoManager").then(module => ({
		default: module.HouseholdInfoManager,
	}))
);

export const LazyLanguagePreferenceManager = lazy(() =>
	import("./LanguagePreferenceManager").then(module => ({
		default: module.LanguagePreferenceManager,
	}))
);

export const LazyMemberStatusManager = lazy(() =>
	import("./MemberStatusManager").then(module => ({
		default: module.MemberStatusManager,
	}))
);

export const LazyAddressContactManager = lazy(() =>
	import("./AddressContactManager").then(module => ({
		default: module.AddressContactManager,
	}))
);

// Wrapper components with error boundaries and loading states
export const HouseholdDashboardLazy: React.FC<any> = props => (
	<ErrorBoundary>
		<Suspense fallback={<LoadingSpinner />}>
			<LazyHouseholdDashboard {...props} />
		</Suspense>
	</ErrorBoundary>
);

export const VirtualizedMemberListLazy: React.FC<any> = props => (
	<ErrorBoundary>
		<Suspense fallback={<LoadingSpinner />}>
			<LazyVirtualizedMemberList {...props} />
		</Suspense>
	</ErrorBoundary>
);

export const HouseholdSetupWizardLazy: React.FC<any> = props => (
	<ErrorBoundary>
		<Suspense fallback={<LoadingSpinner />}>
			<LazyHouseholdSetupWizard {...props} />
		</Suspense>
	</ErrorBoundary>
);

export const HouseholdInfoManagerLazy: React.FC<any> = props => (
	<ErrorBoundary>
		<Suspense fallback={<LoadingSpinner />}>
			<LazyHouseholdInfoManager {...props} />
		</Suspense>
	</ErrorBoundary>
);

export const LanguagePreferenceManagerLazy: React.FC<any> = props => (
	<ErrorBoundary>
		<Suspense fallback={<LoadingSpinner />}>
			<LazyLanguagePreferenceManager {...props} />
		</Suspense>
	</ErrorBoundary>
);

export const MemberStatusManagerLazy: React.FC<any> = props => (
	<ErrorBoundary>
		<Suspense fallback={<LoadingSpinner />}>
			<LazyMemberStatusManager {...props} />
		</Suspense>
	</ErrorBoundary>
);

export const AddressContactManagerLazy: React.FC<any> = props => (
	<ErrorBoundary>
		<Suspense fallback={<LoadingSpinner />}>
			<LazyAddressContactManager {...props} />
		</Suspense>
	</ErrorBoundary>
);

// Preload function for critical components
export const preloadCriticalComponents = () => {
	// Preload components that are likely to be needed soon
	import("./MemoizedHouseholdDashboard");
	import("./VirtualizedMemberList");
};

// Preload function for secondary components
export const preloadSecondaryComponents = () => {
	// Preload components that might be needed
	import("./HouseholdSetupWizard");
	import("./HouseholdInfoManager");
	import("./LanguagePreferenceManager");
};

// Hook for intelligent preloading
export const useIntelligentPreload = () => {
	React.useEffect(() => {
		// Preload critical components immediately
		preloadCriticalComponents();

		// Preload secondary components after a delay
		const timer = setTimeout(() => {
			preloadSecondaryComponents();
		}, 2000);

		return () => clearTimeout(timer);
	}, []);
};
