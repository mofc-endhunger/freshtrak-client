import React from "react";
import { Button } from "../../components/ui/button";
import { GuestLoginButtonComponentProps } from "./types/authentication.types";

/**
 * GuestLoginButtonComponent - Button component for guest login functionality
 *
 * This component provides a styled button for guest login with proper accessibility
 * features, disabled state handling, and consistent styling using shadcn/ui Button.
 *
 * @component
 * @param {GuestLoginButtonComponentProps} props - Component props
 * @returns {JSX.Element} A styled guest login button
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
			Continue as Guest
		</Button>
	);
};

export default GuestLoginButtonComponent;
