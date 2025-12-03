/**
 * Loading Spinner Components for Households Module
 * Various loading states and progress indicators
 */

import React from "react";
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import localization from "../../Localization/LocalizationComponent";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	size = "md",
	className = "",
}) => {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-6 h-6",
		lg: "w-8 h-8",
	};

	return (
		<Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
	);
};

interface LoadingStateProps {
	isLoading: boolean;
	operation?: string;
	progress?: number;
	className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
	isLoading,
	operation,
	progress,
	className = "",
}) => {
	if (!isLoading) return null;

	return (
		<div className={`flex items-center space-x-3 ${className}`}>
			<LoadingSpinner size="sm" />
			<div className="flex-1">
				<p className="text-sm text-gray-600">
					{operation || localization.loading_loading}
				</p>
				{progress !== undefined && (
					<div className="w-full bg-gray-200 rounded-full h-2 mt-1">
						<div
							className="bg-blue-600 h-2 rounded-full transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

interface LoadingCardProps {
	isLoading: boolean;
	operation?: string;
	progress?: number;
	children?: React.ReactNode;
	className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
	isLoading,
	operation,
	progress,
	children,
	className = "",
}) => {
	return (
		<Card className={className}>
			<CardContent className="p-6">
				{isLoading ? (
					<div className="flex flex-col items-center justify-center space-y-4">
						<LoadingSpinner size="lg" />
						<div className="text-center">
							<p className="text-lg font-medium text-gray-900">
								{operation || localization.loading_loading}
							</p>
							{progress !== undefined && (
								<div className="w-64 bg-gray-200 rounded-full h-2 mt-3">
									<div
										className="bg-blue-600 h-2 rounded-full transition-all duration-300"
										style={{ width: `${progress}%` }}
									/>
								</div>
							)}
						</div>
					</div>
				) : (
					children
				)}
			</CardContent>
		</Card>
	);
};

interface LoadingButtonProps {
	isLoading: boolean;
	loadingText?: string;
	children: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	variant?:
		| "default"
		| "outline"
		| "secondary"
		| "ghost"
		| "link"
		| "destructive";
	size?: "default" | "sm" | "lg" | "icon";
	className?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
	isLoading,
	loadingText = localization.loading_loading,
	children,
	onClick,
	disabled,
	variant = "default",
	size = "default",
	className = "",
}) => {
	return (
		<Button
			onClick={onClick}
			disabled={disabled || isLoading}
			variant={variant}
			size={size}
			className={className}
		>
			{isLoading ? (
				<>
					<LoadingSpinner size="sm" className="mr-2" />
					{loadingText}
				</>
			) : (
				children
			)}
		</Button>
	);
};

interface OperationStatusProps {
	status: "idle" | "loading" | "success" | "error";
	operation?: string;
	successMessage?: string;
	errorMessage?: string;
	onRetry?: () => void;
	className?: string;
}

export const OperationStatus: React.FC<OperationStatusProps> = ({
	status,
	operation,
	successMessage,
	errorMessage,
	onRetry,
	className = "",
}) => {
	if (status === "idle") return null;

	const getStatusIcon = () => {
		switch (status) {
			case "loading":
				return <LoadingSpinner size="sm" className="text-blue-600" />;
			case "success":
				return <CheckCircle className="w-5 h-5 text-green-600" />;
			case "error":
				return <AlertCircle className="w-5 h-5 text-red-600" />;
			default:
				return null;
		}
	};

	const getStatusColor = () => {
		switch (status) {
			case "loading":
				return "bg-blue-50 border-blue-200 text-blue-800";
			case "success":
				return "bg-green-50 border-green-200 text-green-800";
			case "error":
				return "bg-red-50 border-red-200 text-red-800";
			default:
				return "bg-gray-50 border-gray-200 text-gray-800";
		}
	};

	const getMessage = () => {
		switch (status) {
			case "loading":
				return operation ? `${operation}...` : localization.loading_loading;
			case "success":
				return successMessage || localization.status_operation_completed_successfully || "Operation completed successfully";
			case "error":
				return errorMessage || localization.error_something_went_wrong;
			default:
				return "";
		}
	};

	return (
		<div
			className={`flex items-center space-x-3 p-3 rounded-md border ${getStatusColor()} ${className}`}
		>
			{getStatusIcon()}
			<div className="flex-1">
				<p className="text-sm font-medium">{getMessage()}</p>
			</div>
			{status === "error" && onRetry && (
				<Button
					onClick={onRetry}
					variant="ghost"
					size="sm"
					className="flex items-center space-x-1"
				>
					<RefreshCw className="w-3 h-3" />
					<span>{localization.button_retry || "Retry"}</span>
				</Button>
			)}
		</div>
	);
};

interface SkeletonLoaderProps {
	lines?: number;
	className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
	lines = 3,
	className = "",
}) => {
	return (
		<div className={`space-y-3 ${className}`}>
			{Array.from({ length: lines }).map((_, index) => (
				<div
					key={index}
					className="h-4 bg-gray-200 rounded animate-pulse"
					style={{
						width: `${Math.random() * 40 + 60}%`,
					}}
				/>
			))}
		</div>
	);
};
