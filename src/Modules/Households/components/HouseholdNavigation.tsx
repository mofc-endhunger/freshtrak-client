/**
 * Household Navigation Component
 * Provides seamless navigation between profile and household management
 */

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
	Home,
	Users,
	Settings,
	User,
	ChevronRight,
	MapPin,
	Calendar,
	Bell,
	Plus,
	Edit,
} from "lucide-react";
import { useHouseholdSignUpIntegration } from "../services/HouseholdSignUpIntegration";
import { useAuth } from "../../Authentication/AuthContext";

interface HouseholdNavigationProps {
	className?: string;
	showQuickActions?: boolean;
	showBreadcrumbs?: boolean;
	onNavigate?: (path: string) => void;
}

interface NavigationItem {
	id: string;
	label: string;
	path: string;
	icon: React.ReactNode;
	description: string;
	badge?: string;
	badgeVariant?: "default" | "secondary" | "destructive" | "outline";
	requiresAuth?: boolean;
	requiresHousehold?: boolean;
}

interface BreadcrumbItem {
	label: string;
	path?: string;
	icon?: React.ReactNode;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
	{
		id: "profile",
		label: "Profile",
		path: "/profile",
		icon: <User className="w-4 h-4" />,
		description: "Manage your personal information",
		requiresAuth: true,
	},
	{
		id: "household_setup",
		label: "Household Setup",
		path: "/households/setup",
		icon: <Plus className="w-4 h-4" />,
		description: "Set up your household information",
		requiresAuth: true,
	},
	{
		id: "household_manage",
		label: "Manage Household",
		path: "/households/manage",
		icon: <Settings className="w-4 h-4" />,
		description: "Manage your household and family members",
		requiresAuth: true,
		requiresHousehold: true,
	},
	{
		id: "household_members",
		label: "Family Members",
		path: "/households/members",
		icon: <Users className="w-4 h-4" />,
		description: "View and manage family members",
		requiresAuth: true,
		requiresHousehold: true,
	},
	{
		id: "events",
		label: "Events",
		path: "/events",
		icon: <Calendar className="w-4 h-4" />,
		description: "Browse and register for events",
		requiresAuth: true,
	},
	{
		id: "notifications",
		label: "Notifications",
		path: "/notifications",
		icon: <Bell className="w-4 h-4" />,
		description: "Manage your notifications",
		requiresAuth: true,
	},
];

const BREADCRUMB_PATHS: Record<string, BreadcrumbItem[]> = {
	"/profile": [
		{ label: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
		{ label: "Profile", icon: <User className="w-4 h-4" /> },
	],
	"/households/setup": [
		{ label: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
		{
			label: "Profile",
			path: "/profile",
			icon: <User className="w-4 h-4" />,
		},
		{ label: "Household Setup", icon: <Plus className="w-4 h-4" /> },
	],
	"/households/manage": [
		{ label: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
		{
			label: "Profile",
			path: "/profile",
			icon: <User className="w-4 h-4" />,
		},
		{
			label: "Household Management",
			icon: <Settings className="w-4 h-4" />,
		},
	],
	"/households/members": [
		{ label: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
		{
			label: "Profile",
			path: "/profile",
			icon: <User className="w-4 h-4" />,
		},
		{
			label: "Household Management",
			path: "/households/manage",
			icon: <Settings className="w-4 h-4" />,
		},
		{ label: "Family Members", icon: <Users className="w-4 h-4" /> },
	],
	"/events": [
		{ label: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
		{ label: "Events", icon: <Calendar className="w-4 h-4" /> },
	],
	"/notifications": [
		{ label: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
		{ label: "Notifications", icon: <Bell className="w-4 h-4" /> },
	],
};

export const HouseholdNavigation: React.FC<HouseholdNavigationProps> = ({
	className = "",
	showQuickActions = true,
	showBreadcrumbs = true,
	onNavigate,
}) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated, user } = useAuth();
	const { hasCompletedSetup, shouldShowPrompt } =
		useHouseholdSignUpIntegration();

	const handleNavigation = (path: string) => {
		if (onNavigate) {
			onNavigate(path);
		} else {
			navigate(path);
		}
	};

	const getAvailableNavigationItems = (): NavigationItem[] => {
		return NAVIGATION_ITEMS.filter(item => {
			// Check authentication requirement
			if (item.requiresAuth && !isAuthenticated) return false;

			// Check household requirement
			if (item.requiresHousehold && !hasCompletedSetup()) return false;

			return true;
		});
	};

	const getCurrentBreadcrumbs = (): BreadcrumbItem[] => {
		return (
			BREADCRUMB_PATHS[location.pathname] || [
				{
					label: "Home",
					path: "/",
					icon: <Home className="w-4 h-4" />,
				},
			]
		);
	};

	const getNavigationItemBadge = (
		item: NavigationItem
	): string | undefined => {
		switch (item.id) {
			case "household_setup":
				return user?.email && shouldShowPrompt(user.email)
					? "New"
					: undefined;
			case "household_manage":
				return hasCompletedSetup() ? "Active" : undefined;
			default:
				return undefined;
		}
	};

	const getNavigationItemBadgeVariant = (
		item: NavigationItem
	): "default" | "secondary" | "destructive" | "outline" => {
		switch (item.id) {
			case "household_setup":
				return user?.email && shouldShowPrompt(user.email)
					? "destructive"
					: "outline";
			case "household_manage":
				return hasCompletedSetup() ? "default" : "outline";
			default:
				return "outline";
		}
	};

	const isCurrentPath = (path: string): boolean => {
		return location.pathname === path;
	};

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Breadcrumbs */}
			{showBreadcrumbs && (
				<nav className="flex items-center space-x-2 text-sm text-gray-600">
					{getCurrentBreadcrumbs().map((breadcrumb, index) => (
						<React.Fragment key={index}>
							{breadcrumb.path ? (
								<button
									onClick={() =>
										handleNavigation(breadcrumb.path!)
									}
									className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
								>
									{breadcrumb.icon && (
										<span className="flex-shrink-0">
											{breadcrumb.icon}
										</span>
									)}
									<span>{breadcrumb.label}</span>
								</button>
							) : (
								<span className="flex items-center space-x-1 text-gray-900">
									{breadcrumb.icon && (
										<span className="flex-shrink-0">
											{breadcrumb.icon}
										</span>
									)}
									<span>{breadcrumb.label}</span>
								</span>
							)}
							{index < getCurrentBreadcrumbs().length - 1 && (
								<ChevronRight className="w-4 h-4 text-gray-400" />
							)}
						</React.Fragment>
					))}
				</nav>
			)}

			{/* Quick Actions */}
			{showQuickActions && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<MapPin className="w-5 h-5 text-highlight" />
							<span>Quick Navigation</span>
						</CardTitle>
						<CardDescription>
							Quick access to common tasks and features
						</CardDescription>
					</CardHeader>

					<CardContent>
						<div className="grid grid-cols-2 gap-3">
							{getAvailableNavigationItems().map(item => {
								const badge = getNavigationItemBadge(item);
								const badgeVariant =
									getNavigationItemBadgeVariant(item);
								const isCurrent = isCurrentPath(item.path);

								return (
									<Button
										key={item.id}
										onClick={() =>
											handleNavigation(item.path)
										}
										variant={
											isCurrent ? "default" : "outline"
										}
										className={`h-auto p-4 flex items-start space-x-3 ${
											isCurrent
												? "bg-highlight text-white border-highlight"
												: "hover:bg-gray-50"
										}`}
									>
										<div className="flex-shrink-0 mt-0.5">
											{item.icon}
										</div>
										<div className="flex-1 text-left">
											<div className="flex items-center space-x-2">
												<span className="font-medium">
													{item.label}
												</span>
												{badge && (
													<Badge
														variant={badgeVariant}
														className="text-xs"
													>
														{badge}
													</Badge>
												)}
											</div>
											<p className="text-xs opacity-75 mt-1">
												{item.description}
											</p>
										</div>
									</Button>
								);
							})}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Navigation Context */}
			<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
				<div className="flex items-center space-x-3">
					<div className="flex-shrink-0">
						<Home className="w-5 h-5 text-gray-600" />
					</div>
					<div>
						<h3 className="font-semibold text-gray-900">
							{hasCompletedSetup()
								? "Household Management"
								: "Profile Setup"}
						</h3>
						<p className="text-sm text-gray-600">
							{hasCompletedSetup()
								? "Manage your household and family members"
								: "Complete your profile to unlock all features"}
						</p>
					</div>
				</div>

				<div className="flex space-x-2">
					{hasCompletedSetup() ? (
						<>
							<Button
								onClick={() =>
									handleNavigation("/households/manage")
								}
								size="sm"
								className="bg-highlight text-white hover:bg-highlight-dark"
							>
								<Settings className="w-4 h-4 mr-2" />
								Manage
							</Button>
							<Button
								onClick={() =>
									handleNavigation("/households/members")
								}
								variant="outline"
								size="sm"
							>
								<Users className="w-4 h-4 mr-2" />
								Members
							</Button>
						</>
					) : (
						<>
							<Button
								onClick={() =>
									handleNavigation("/households/setup")
								}
								size="sm"
								className="bg-highlight text-white hover:bg-highlight-dark"
							>
								<Plus className="w-4 h-4 mr-2" />
								Set Up
							</Button>
							<Button
								onClick={() => handleNavigation("/profile")}
								variant="outline"
								size="sm"
							>
								<Edit className="w-4 h-4 mr-2" />
								Profile
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

/**
 * Hook for managing household navigation
 * Provides utilities for navigation and route management
 */
export const useHouseholdNavigation = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated, user } = useAuth();
	const { hasCompletedSetup, shouldShowPrompt } =
		useHouseholdSignUpIntegration();

	const navigateToProfile = () => {
		navigate("/profile");
	};

	const navigateToHouseholdSetup = () => {
		navigate("/households/setup");
	};

	const navigateToHouseholdManagement = () => {
		navigate("/households/manage");
	};

	const navigateToHouseholdMembers = () => {
		navigate("/households/members");
	};

	const navigateToEvents = () => {
		navigate("/events");
	};

	const navigateToNotifications = () => {
		navigate("/notifications");
	};

	const navigateBack = () => {
		navigate(-1);
	};

	const navigateHome = () => {
		navigate("/");
	};

	const getCurrentPath = (): string => {
		return location.pathname;
	};

	const isCurrentPath = (path: string): boolean => {
		return location.pathname === path;
	};

	const canAccessHouseholdFeatures = (): boolean => {
		return isAuthenticated && hasCompletedSetup();
	};

	const shouldShowHouseholdSetup = (): boolean => {
		return isAuthenticated && user?.email && shouldShowPrompt(user.email);
	};

	return {
		navigateToProfile,
		navigateToHouseholdSetup,
		navigateToHouseholdManagement,
		navigateToHouseholdMembers,
		navigateToEvents,
		navigateToNotifications,
		navigateBack,
		navigateHome,
		getCurrentPath,
		isCurrentPath,
		canAccessHouseholdFeatures,
		shouldShowHouseholdSetup,
	};
};
