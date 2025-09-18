/**
 * Error Display Component for Households Module
 * Displays user-friendly error messages with retry options
 */

import React from "react";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { ErrorMessage } from "../utils/errorHandling";

interface ErrorDisplayProps {
	error: ErrorMessage;
	onRetry?: () => void;
	onDismiss?: () => void;
	showDetails?: boolean;
	className?: string;
}

const getSeverityColor = (severity: ErrorMessage["severity"]) => {
	switch (severity) {
		case "low":
			return "bg-blue-50 border-blue-200 text-blue-800";
		case "medium":
			return "bg-yellow-50 border-yellow-200 text-yellow-800";
		case "high":
			return "bg-orange-50 border-orange-200 text-orange-800";
		case "critical":
			return "bg-red-50 border-red-200 text-red-800";
		default:
			return "bg-gray-50 border-gray-200 text-gray-800";
	}
};

const getSeverityIcon = (severity: ErrorMessage["severity"]) => {
	switch (severity) {
		case "low":
			return <AlertCircle className="w-5 h-5 text-blue-600" />;
		case "medium":
			return <AlertCircle className="w-5 h-5 text-yellow-600" />;
		case "high":
			return <AlertCircle className="w-5 h-5 text-orange-600" />;
		case "critical":
			return <AlertCircle className="w-5 h-5 text-red-600" />;
		default:
			return <AlertCircle className="w-5 h-5 text-gray-600" />;
	}
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
	error,
	onRetry,
	onDismiss,
	showDetails = false,
	className = "",
}) => {
	const severityColor = getSeverityColor(error.severity);
	const severityIcon = getSeverityIcon(error.severity);

	return (
		<Card className={`border-l-4 ${severityColor} ${className}`}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						{severityIcon}
						<CardTitle className="text-lg">{error.title}</CardTitle>
					</div>
					<div className="flex items-center space-x-2">
						<Badge variant="outline" className={severityColor}>
							{error.severity}
						</Badge>
						{onDismiss && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onDismiss}
								className="text-gray-500 hover:text-gray-700"
							>
								×
							</Button>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-gray-700">{error.message}</p>

				{error.action && (
					<div className="bg-gray-50 p-3 rounded-md">
						<p className="text-sm text-gray-600">
							<strong>Suggestion:</strong> {error.action}
						</p>
					</div>
				)}

				{error.retryable && onRetry && (
					<div className="flex items-center space-x-3">
						<Button
							onClick={onRetry}
							variant="outline"
							size="sm"
							className="flex items-center space-x-2"
						>
							<RefreshCw className="w-4 h-4" />
							<span>Try Again</span>
						</Button>
					</div>
				)}

				{showDetails && (
					<details className="text-sm text-gray-500">
						<summary className="cursor-pointer hover:text-gray-700">
							Technical Details
						</summary>
						<div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
							<p>Severity: {error.severity}</p>
							<p>Retryable: {error.retryable ? "Yes" : "No"}</p>
							<p>Timestamp: {new Date().toISOString()}</p>
						</div>
					</details>
				)}
			</CardContent>
		</Card>
	);
};

/**
 * Inline error display for forms and smaller spaces
 */
export const InlineErrorDisplay: React.FC<{
	error: ErrorMessage;
	onRetry?: () => void;
	className?: string;
}> = ({ error, onRetry, className = "" }) => {
	const severityColor = getSeverityColor(error.severity);
	const severityIcon = getSeverityIcon(error.severity);

	return (
		<div
			className={`flex items-center space-x-2 p-3 rounded-md border ${severityColor} ${className}`}
		>
			{severityIcon}
			<div className="flex-1">
				<p className="text-sm font-medium">{error.title}</p>
				<p className="text-xs">{error.message}</p>
			</div>
			{error.retryable && onRetry && (
				<Button
					onClick={onRetry}
					variant="ghost"
					size="sm"
					className="flex items-center space-x-1"
				>
					<RefreshCw className="w-3 h-3" />
					<span>Retry</span>
				</Button>
			)}
		</div>
	);
};

/**
 * Offline indicator component
 */
export const OfflineIndicator: React.FC<{
	isOffline: boolean;
	className?: string;
}> = ({ isOffline, className = "" }) => {
	if (!isOffline) return null;

	return (
		<div
			className={`flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md ${className}`}
		>
			<WifiOff className="w-4 h-4 text-yellow-600" />
			<span className="text-sm text-yellow-800">
				You're currently offline. Some features may be limited.
			</span>
		</div>
	);
};

/**
 * Connection status indicator
 */
export const ConnectionStatus: React.FC<{
	isOffline: boolean;
	wasOffline: boolean;
	className?: string;
}> = ({ isOffline, wasOffline, className = "" }) => {
	if (!isOffline && !wasOffline) return null;

	return (
		<div
			className={`flex items-center space-x-2 p-2 rounded-md ${className}`}
		>
			{isOffline ? (
				<>
					<WifiOff className="w-4 h-4 text-red-600" />
					<span className="text-sm text-red-800">Offline</span>
				</>
			) : (
				<>
					<Wifi className="w-4 h-4 text-green-600" />
					<span className="text-sm text-green-800">Back Online</span>
				</>
			)}
		</div>
	);
};
