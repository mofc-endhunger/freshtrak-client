import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Authentication/AuthContext";
import { RENDER_URL } from "../../../Utils/Urls";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import { Settings, LogOut, Home } from "lucide-react";
import localization from "../../Localization/LocalizationComponent";

/**
 * UserAccountButton - Displays user initials in a rounded button with dropdown menu
 *
 * This component provides:
 * - User initials in a circular button
 * - Dropdown menu with account options
 * - Navigation to account page
 * - Logout functionality
 * - Household setup prompts if needed
 *
 * @component
 * @returns {JSX.Element} The user account button with dropdown
 */
const UserAccountButton: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();
	const { user, signOut } = useAuth();

	/**
	 * Get user initials from name or email
	 */
	const getUserInitials = (): string => {
		if (!user) return "U";

		// Try to get initials from name first
		if (user.name && user.name !== user.email) {
			const nameParts = user.name.trim().split(" ");
			if (nameParts.length >= 2) {
				return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
			}
			return nameParts[0][0].toUpperCase();
		}

		// Fallback to email initials
		if (user.email) {
			const emailParts = user.email.split("@")[0];
			if (emailParts.length >= 2) {
				return emailParts.substring(0, 2).toUpperCase();
			}
			return emailParts[0].toUpperCase();
		}

		return "U";
	};

	/**
	 * Handle account page navigation
	 */
	const handleAccountClick = (): void => {
		setIsOpen(false);
		navigate(RENDER_URL.ACCOUNT_URL);
	};

	/**
	 * Handle logout
	 */
	const handleLogout = async (): Promise<void> => {
		try {
			setIsOpen(false);
			await signOut();
			navigate(RENDER_URL.ROOT_URL);
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	/**
	 * Handle home navigation
	 */
	const handleHomeClick = (): void => {
		setIsOpen(false);
		navigate(RENDER_URL.ROOT_URL);
	};

	if (!user) {
		return null;
	}

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold text-sm"
					aria-label={localization.aria_user_account_menu}
				>
					{getUserInitials()}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				side="bottom"
				className="w-56 bg-white border border-gray-200 shadow-lg z-[99999]"
				sideOffset={4}
				alignOffset={-4}
				collisionPadding={16}
				avoidCollisions={true}
			>
				{/* User Info Header */}
				<div className="px-3 py-2 border-b border-gray-100">
					<div className="flex items-center space-x-3">
						<div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
							{getUserInitials()}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{user.name && user.name !== user.email
									? user.name
									: localization.menu_user}
							</p>
							<p className="text-xs text-gray-500 truncate">
								{user.email}
							</p>
						</div>
					</div>
				</div>

				{/* Menu Items */}
				<DropdownMenuItem
					onClick={handleHomeClick}
					className="cursor-pointer hover:bg-gray-50"
				>
					<Home className="mr-2 h-4 w-4" />
					<span>{localization.menu_home}</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={handleAccountClick}
					className="cursor-pointer hover:bg-gray-50"
				>
					<Settings className="mr-2 h-4 w-4" />
					<span>{localization.text_profile}</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					onClick={handleLogout}
					className="cursor-pointer hover:bg-gray-50 text-red-600 focus:text-red-600"
				>
					<LogOut className="mr-2 h-4 w-4" />
					<span>{localization.button_sign_out}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserAccountButton;
