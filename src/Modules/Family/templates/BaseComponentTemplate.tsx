// Base Component Template with TypeScript and Tailwind Patterns
// This template provides a foundation for all Family module components

import React from "react";
import { cn } from "../../../lib/utils";

// Base component props interface
export interface BaseComponentProps {
	className?: string;
	children?: React.ReactNode;
	"data-testid"?: string;
}

// Form component props interface
export interface BaseFormComponentProps extends BaseComponentProps {
	onSubmit?: (data: any) => void;
	onCancel?: () => void;
	isLoading?: boolean;
	isDisabled?: boolean;
}

// Input component props interface
export interface BaseInputComponentProps extends BaseComponentProps {
	name: string;
	label?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	value?: string;
	onChange?: (value: string) => void;
	onBlur?: () => void;
	onFocus?: () => void;
}

// Container component props interface
export interface BaseContainerComponentProps extends BaseComponentProps {
	title?: string;
	subtitle?: string;
	showHeader?: boolean;
	showFooter?: boolean;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

// Base Container Component Template
export const BaseContainer: React.FC<BaseContainerComponentProps> = ({
	className,
	children,
	title,
	subtitle,
	showHeader = true,
	showFooter = false,
	maxWidth = "lg",
	"data-testid": testId,
}) => {
	const maxWidthClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
		"2xl": "max-w-2xl",
		full: "max-w-full",
	};

	return (
		<div
			className={cn(
				"w-full mx-auto bg-white rounded-lg shadow-sm border border-gray-200",
				maxWidthClasses[maxWidth],
				className
			)}
			data-testid={testId}
		>
			{showHeader && (title || subtitle) && (
				<div className="px-6 py-4 border-b border-gray-200">
					{title && (
						<h2 className="text-xl font-semibold text-gray-900 mb-1">
							{title}
						</h2>
					)}
					{subtitle && (
						<p className="text-sm text-gray-600">{subtitle}</p>
					)}
				</div>
			)}

			<div className="px-6 py-4">{children}</div>

			{showFooter && (
				<div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
					{/* Footer content can be added here */}
				</div>
			)}
		</div>
	);
};

// Base Form Component Template
export const BaseForm: React.FC<BaseFormComponentProps> = ({
	className,
	children,
	onSubmit,
	onCancel,
	isLoading = false,
	isDisabled = false,
	"data-testid": testId,
}) => {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (onSubmit && !isLoading && !isDisabled) {
			// Form data handling would go here
			onSubmit({});
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={cn("space-y-6", className)}
			data-testid={testId}
		>
			<div className="space-y-4">{children}</div>

			<div className="flex justify-end space-x-3 pt-4">
				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						disabled={isLoading}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Cancel
					</button>
				)}

				<button
					type="submit"
					disabled={isLoading || isDisabled}
					className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? "Loading..." : "Submit"}
				</button>
			</div>
		</form>
	);
};

// Base Input Component Template
export const BaseInput: React.FC<BaseInputComponentProps> = ({
	className,
	name,
	label,
	placeholder,
	required = false,
	disabled = false,
	error,
	value,
	onChange,
	onBlur,
	onFocus,
	"data-testid": testId,
}) => {
	return (
		<div className="space-y-1">
			{label && (
				<label
					htmlFor={name}
					className="block text-sm font-medium text-gray-700"
				>
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}

			<input
				id={name}
				name={name}
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={e => onChange?.(e.target.value)}
				onBlur={onBlur}
				onFocus={onFocus}
				disabled={disabled}
				required={required}
				className={cn(
					"block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
					error &&
						"border-red-300 focus:ring-red-500 focus:border-red-500",
					disabled && "bg-gray-100 cursor-not-allowed",
					className
				)}
				data-testid={testId}
			/>

			{error && (
				<p
					className="text-sm text-red-600"
					data-testid={`${testId}-error`}
				>
					{error}
				</p>
			)}
		</div>
	);
};

// Base Select Component Template
export const BaseSelect: React.FC<
	BaseInputComponentProps & {
		options: Array<{ value: string; label: string }>;
	}
> = ({
	className,
	name,
	label,
	placeholder,
	required = false,
	disabled = false,
	error,
	value,
	onChange,
	onBlur,
	onFocus,
	options,
	"data-testid": testId,
}) => {
	return (
		<div className="space-y-1">
			{label && (
				<label
					htmlFor={name}
					className="block text-sm font-medium text-gray-700"
				>
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}

			<select
				id={name}
				name={name}
				value={value}
				onChange={e => onChange?.(e.target.value)}
				onBlur={onBlur}
				onFocus={onFocus}
				disabled={disabled}
				required={required}
				className={cn(
					"block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
					error &&
						"border-red-300 focus:ring-red-500 focus:border-red-500",
					disabled && "bg-gray-100 cursor-not-allowed",
					className
				)}
				data-testid={testId}
			>
				{placeholder && (
					<option value="" disabled>
						{placeholder}
					</option>
				)}

				{options.map(option => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>

			{error && (
				<p
					className="text-sm text-red-600"
					data-testid={`${testId}-error`}
				>
					{error}
				</p>
			)}
		</div>
	);
};

// Base Checkbox Component Template
export const BaseCheckbox: React.FC<
	BaseInputComponentProps & {
		checked?: boolean;
	}
> = ({
	className,
	name,
	label,
	required = false,
	disabled = false,
	error,
	checked,
	onChange,
	onBlur,
	onFocus,
	"data-testid": testId,
}) => {
	return (
		<div className="space-y-1">
			<div className="flex items-center">
				<input
					id={name}
					name={name}
					type="checkbox"
					checked={checked}
					onChange={e =>
						onChange?.(e.target.checked ? "true" : "false")
					}
					onBlur={onBlur}
					onFocus={onFocus}
					disabled={disabled}
					required={required}
					className={cn(
						"h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded",
						disabled && "bg-gray-100 cursor-not-allowed",
						className
					)}
					data-testid={testId}
				/>

				{label && (
					<label
						htmlFor={name}
						className="ml-2 block text-sm text-gray-900"
					>
						{label}
						{required && (
							<span className="text-red-500 ml-1">*</span>
						)}
					</label>
				)}
			</div>

			{error && (
				<p
					className="text-sm text-red-600"
					data-testid={`${testId}-error`}
				>
					{error}
				</p>
			)}
		</div>
	);
};

// Base Modal Component Template
export const BaseModal: React.FC<
	BaseComponentProps & {
		isOpen: boolean;
		onClose: () => void;
		title?: string;
		size?: "sm" | "md" | "lg" | "xl";
	}
> = ({
	className,
	children,
	isOpen,
	onClose,
	title,
	size = "md",
	"data-testid": testId,
}) => {
	if (!isOpen) return null;

	const sizeClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
	};

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto"
			data-testid={testId}
		>
			<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
				{/* Background overlay */}
				<div
					className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
					onClick={onClose}
				/>

				{/* Modal panel */}
				<div
					className={cn(
						"inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full",
						sizeClasses[size],
						className
					)}
				>
					{title && (
						<div className="px-6 py-4 border-b border-gray-200">
							<h3 className="text-lg font-medium text-gray-900">
								{title}
							</h3>
						</div>
					)}

					<div className="px-6 py-4">{children}</div>

					<div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

// Utility function for responsive classes
export const getResponsiveClasses = (
	baseClass: string,
	responsiveVariants: Record<string, string>
) => {
	return Object.entries(responsiveVariants)
		.map(([breakpoint, variant]) => {
			if (breakpoint === "default") {
				return `${baseClass}-${variant}`;
			}
			return `${breakpoint}:${baseClass}-${variant}`;
		})
		.join(" ");
};

// Export all base components
export {
	BaseContainer as Container,
	BaseForm as Form,
	BaseInput as Input,
	BaseSelect as Select,
	BaseCheckbox as Checkbox,
	BaseModal as Modal,
};
