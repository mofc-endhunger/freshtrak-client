/**
 * Error Boundary Component for Households Module
 * Catches JavaScript errors anywhere in the component tree
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { ErrorDisplay } from "./ErrorDisplay";
import {
	formatErrorForDisplay,
	createErrorContext,
	logError,
} from "../utils/errorHandling";

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
	errorId: string;
}

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
	resetOnPropsChange?: boolean;
	resetKeys?: Array<string | number>;
	className?: string;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	private resetTimeoutId: number | null = null;

	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
			errorId: "",
		};
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return {
			hasError: true,
			error,
			errorId: `error_${Date.now()}_${Math.random()
				.toString(36)
				.substr(2, 9)}`,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		const context = createErrorContext("error_boundary", {
			component: this.constructor.name,
		});

		// Log the error
		logError(error, context, {
			componentStack: errorInfo.componentStack,
			errorBoundary: true,
		});

		this.setState({
			errorInfo,
		});

		// Call the onError callback if provided
		this.props.onError?.(error, errorInfo);
	}

	componentDidUpdate(prevProps: ErrorBoundaryProps) {
		const { resetKeys, resetOnPropsChange } = this.props;
		const { hasError } = this.state;

		if (hasError && prevProps.resetKeys !== resetKeys) {
			if (resetOnPropsChange) {
				this.resetErrorBoundary();
			}
		}
	}

	componentWillUnmount() {
		if (this.resetTimeoutId) {
			clearTimeout(this.resetTimeoutId);
		}
	}

	resetErrorBoundary = () => {
		if (this.resetTimeoutId) {
			clearTimeout(this.resetTimeoutId);
		}

		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
			errorId: "",
		});
	};

	render() {
		const { hasError, error, errorInfo } = this.state;
		const { children, fallback, className = "" } = this.props;

		if (hasError && error) {
			// Use custom fallback if provided
			if (fallback) {
				return fallback(error, errorInfo!);
			}

			// Default error UI
			return (
				<div
					className={`min-h-screen flex items-center justify-center p-4 ${className}`}
				>
					<Card className="w-full max-w-md">
						<CardHeader className="text-center">
							<div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
								<AlertCircle className="w-6 h-6 text-red-600" />
							</div>
							<CardTitle className="text-xl text-gray-900">
								Something went wrong
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-gray-600 text-center">
								We're sorry, but something unexpected happened.
								Our team has been notified.
							</p>

							<div className="space-y-3">
								<Button
									onClick={this.resetErrorBoundary}
									className="w-full flex items-center justify-center space-x-2"
								>
									<RefreshCw className="w-4 h-4" />
									<span>Try Again</span>
								</Button>

								<Button
									onClick={() => (window.location.href = "/")}
									variant="outline"
									className="w-full flex items-center justify-center space-x-2"
								>
									<Home className="w-4 h-4" />
									<span>Go Home</span>
								</Button>
							</div>

							{process.env.NODE_ENV === "development" &&
								errorInfo && (
									<details className="mt-4">
										<summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
											Error Details (Development)
										</summary>
										<div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
											<div className="mb-2">
												<strong>Error:</strong>
												<pre className="whitespace-pre-wrap">
													{error.toString()}
												</pre>
											</div>
											<div>
												<strong>
													Component Stack:
												</strong>
												<pre className="whitespace-pre-wrap">
													{errorInfo.componentStack}
												</pre>
											</div>
										</div>
									</details>
								)}
						</CardContent>
					</Card>
				</div>
			);
		}

		return children;
	}
}

/**
 * Hook-based error boundary for functional components
 */
export const useErrorHandler = () => {
	const handleError = (error: Error, errorInfo?: ErrorInfo) => {
		const context = createErrorContext("use_error_handler");
		logError(error, context, { errorInfo });
	};

	return { handleError };
};

/**
 * Higher-order component for error boundary
 */
export const withErrorBoundary = <P extends object>(
	Component: React.ComponentType<P>,
	errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) => {
	const WrappedComponent = (props: P) => (
		<ErrorBoundary {...errorBoundaryProps}>
			<Component {...props} />
		</ErrorBoundary>
	);

	WrappedComponent.displayName = `withErrorBoundary(${
		Component.displayName || Component.name
	})`;

	return WrappedComponent;
};

/**
 * Error boundary specifically for household operations
 */
export const HouseholdErrorBoundary: React.FC<{
	children: ReactNode;
	operation?: string;
	onError?: (error: Error) => void;
}> = ({ children, operation = "household_operation", onError }) => {
	return (
		<ErrorBoundary
			onError={(error, errorInfo) => {
				const context = createErrorContext(operation);
				logError(error, context, { errorInfo });
				onError?.(error);
			}}
			fallback={error => {
				const errorMessage = formatErrorForDisplay(
					error,
					createErrorContext(operation)
				);
				return (
					<div className="p-4">
						<ErrorDisplay
							error={errorMessage}
							onRetry={() => window.location.reload()}
							showDetails={process.env.NODE_ENV === "development"}
						/>
					</div>
				);
			}}
		>
			{children}
		</ErrorBoundary>
	);
};
