import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
	User,
	Mail,
	Calendar,
	Home,
	Users,
	Settings,
	ArrowLeft,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { useHouseholdSignUpIntegration } from "../Households/services/HouseholdSignUpIntegration";
import { HouseholdCompletionPrompt } from "../Households/components/HouseholdCompletionPrompt";

/**
 * AccountPage - User account management page
 *
 * This page provides:
 * - User profile information display
 * - Household setup completion prompts
 * - Account settings access
 * - Household management access
 *
 * @component
 * @returns {JSX.Element} The account page component
 */
const AccountPage: React.FC = () => {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuth();
	const {
		shouldShowPrompt,
		hasCompletedSetup,
		getHouseholdId,
		markPromptShown,
	} = useHouseholdSignUpIntegration();

	const [showHouseholdPrompt, setShowHouseholdPrompt] = useState(false);

	// Redirect if not authenticated
	useEffect(() => {
		if (!isAuthenticated || !user) {
			navigate("/login");
			return;
		}
	}, [isAuthenticated, user, navigate]);

	// Check if we should show household completion prompt
	useEffect(() => {
		if (
			user?.email &&
			shouldShowPrompt(user.email) &&
			!hasCompletedSetup()
		) {
			setShowHouseholdPrompt(true);
		}
	}, [user?.email, shouldShowPrompt, hasCompletedSetup]);

	/**
	 * Handle household setup
	 */
	const handleHouseholdSetup = (): void => {
		setShowHouseholdPrompt(false);
		navigate("/households");
	};

	/**
	 * Handle dismissing household prompt
	 */
	const handlePromptDismiss = (): void => {
		setShowHouseholdPrompt(false);
		markPromptShown();
	};

	/**
	 * Handle household management
	 */
	const handleManageHousehold = (): void => {
		navigate("/households");
	};

	/**
	 * Get user initials for display
	 */
	const getUserInitials = (): string => {
		if (!user) return "U";

		if (user.name && user.name !== user.email) {
			const nameParts = user.name.trim().split(" ");
			if (nameParts.length >= 2) {
				return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
			}
			return nameParts[0][0].toUpperCase();
		}

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
	 * Get account creation date (mock implementation)
	 */
	const getAccountCreationDate = (): string => {
		// In a real app, this would come from the user data
		return "January 2024";
	};

	if (!user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<Button
						variant="ghost"
						onClick={() => navigate("/")}
						className="mb-4 text-gray-600 hover:text-gray-900"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Home
					</Button>

					<h1 className="text-3xl font-bold text-gray-900">
						Account Settings
					</h1>
					<p className="text-gray-600 mt-2">
						Manage your account information and household details
					</p>
				</div>

				{/* Household Completion Prompt */}
				{showHouseholdPrompt && (
					<div className="mb-8">
						<HouseholdCompletionPrompt
							onSetup={handleHouseholdSetup}
							onDismiss={handlePromptDismiss}
							variant="card"
						/>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Profile Information */}
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<User className="mr-2 h-5 w-5" />
									Profile Information
								</CardTitle>
								<CardDescription>
									Your personal account details
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* User Avatar and Basic Info */}
								<div className="flex items-center space-x-4">
									<div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-xl">
										{getUserInitials()}
									</div>
									<div>
										<h3 className="text-lg font-semibold text-gray-900">
											{user.name &&
											user.name !== user.email
												? user.name
												: "User"}
										</h3>
										<p className="text-gray-600">
											{user.email}
										</p>
										<Badge
											variant="secondary"
											className="mt-1"
										>
											Member since{" "}
											{getAccountCreationDate()}
										</Badge>
									</div>
								</div>

								<Separator />

								{/* Account Details */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div className="flex items-center space-x-3">
											<Mail className="h-5 w-5 text-gray-400" />
											<div>
												<p className="text-sm font-medium text-gray-900">
													Email
												</p>
												<p className="text-sm text-gray-600">
													{user.email}
												</p>
											</div>
										</div>

										<div className="flex items-center space-x-3">
											<Calendar className="h-5 w-5 text-gray-400" />
											<div>
												<p className="text-sm font-medium text-gray-900">
													Account Created
												</p>
												<p className="text-sm text-gray-600">
													{getAccountCreationDate()}
												</p>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<div className="flex items-center space-x-3">
											<Home className="h-5 w-5 text-gray-400" />
											<div>
												<p className="text-sm font-medium text-gray-900">
													Account Status
												</p>
												<Badge
													variant="default"
													className="mt-1"
												>
													<CheckCircle className="mr-1 h-3 w-3" />
													Active
												</Badge>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions */}
					<div className="space-y-6">
						{/* Household Management */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Users className="mr-2 h-5 w-5" />
									Household
								</CardTitle>
								<CardDescription>
									Manage your household information
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{hasCompletedSetup() ? (
									<>
										<div className="flex items-center space-x-2 text-green-600">
											<CheckCircle className="h-4 w-4" />
											<span className="text-sm font-medium">
												Household Setup Complete
											</span>
										</div>
										<Button
											onClick={handleManageHousehold}
											className="w-full"
											variant="outline"
										>
											Manage Household
										</Button>
									</>
								) : (
									<>
										<div className="flex items-center space-x-2 text-amber-600">
											<AlertCircle className="h-4 w-4" />
											<span className="text-sm font-medium">
												Setup Required
											</span>
										</div>
										<Button
											onClick={handleHouseholdSetup}
											className="w-full"
										>
											Set Up Household
										</Button>
									</>
								)}
							</CardContent>
						</Card>

						{/* Account Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Settings className="mr-2 h-5 w-5" />
									Settings
								</CardTitle>
								<CardDescription>
									Account preferences and settings
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<Button
									variant="outline"
									className="w-full"
									disabled
								>
									Change Password
								</Button>
								<Button
									variant="outline"
									className="w-full"
									disabled
								>
									Notification Settings
								</Button>
								<Button
									variant="outline"
									className="w-full"
									disabled
								>
									Privacy Settings
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AccountPage;
