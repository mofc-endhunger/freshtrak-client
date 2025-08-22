import React from "react";
import { Button } from "../../components/ui/button";
import { GuestLoginButtonComponentProps } from "./types/authentication.types";

/**
 * GuestLoginButtonComponent - Button component for guest login functionality
 *
 * This component provides a styled button for guest login with proper accessibility
 * features, disabled state handling, consistent styling using shadcn/ui Button,
 * and a loading spinner when the request is being processed.
 *
 * @component
 * @param {GuestLoginButtonComponentProps} props - Component props
 * @returns {JSX.Element} A styled guest login button with loading state
 *
 * @example
 * ```tsx
 * <GuestLoginButtonComponent
 *   onGuestLogin={handleGuestLogin}
 *   disabled={isLoading}
 * />
 * ```
 */
const GuestLoginButtonComponent: React.FC<GuestLoginButtonComponentProps> = ({
	onGuestLogin,
	disabled,
}) => {
	return (
		<Button
			type="submit"
			className="w-full bg-primary text-white min-h-12 uppercase"
			onClick={onGuestLogin}
			disabled={disabled}
			aria-label="Continue as guest"
		>
			{disabled ? (
				<div className="flex items-center justify-center space-x-2">
					<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
					<span>Processing...</span>
				</div>
			) : (
				"Continue as Guest"
			)}
		</Button>
	);
};

export default GuestLoginButtonComponent;
