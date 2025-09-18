/**
 * Household Dashboard Component
 * Main dashboard for displaying and managing household information
 */

import React, { useState, useEffect, useMemo } from "react";
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
	Home,
	Users,
	MapPin,
	Globe,
	Edit,
	Plus,
	Calendar,
	CheckCircle,
	Clock,
	RefreshCw,
} from "lucide-react";
import { HouseholdsApiService } from "../../Services/HouseholdsApiService";
import { Household, HouseholdMember } from "./types/household.types";
import { useHouseholdSignUpIntegration } from "./services/HouseholdSignUpIntegration";
import { calculateAge } from "./utils/householdUtils";
import { HouseholdInfoManager } from "./components/HouseholdInfoManager";
import { LanguagePreferenceManager } from "./components/LanguagePreferenceManager";

interface HouseholdDashboardProps {
	household: Household;
	members: HouseholdMember[];
	onEditMember?: (member: HouseholdMember) => void;
	onMemberStatusChange?: (member: HouseholdMember) => Promise<void>;
	onHouseholdUpdate?: (householdData: any) => Promise<void>;
	onError?: (error: string) => void;
	className?: string;
	onEditHousehold?: () => void;
	onAddMember?: () => void;
	onManageMembers?: () => void;
}

interface DashboardStats {
	totalMembers: number;
	activeMembers: number;
	childrenCount: number;
	adultsCount: number;
	seniorsCount: number;
	lastUpdated?: string;
}

export const HouseholdDashboard: React.FC<HouseholdDashboardProps> = ({
	household: propHousehold,
	members: propMembers,
	onEditMember,
	onMemberStatusChange,
	onHouseholdUpdate,
	onError,
	className = "",
	onEditHousehold,
	onAddMember,
	onManageMembers,
}) => {
	const [stats, setStats] = useState<DashboardStats>({
		totalMembers: 0,
		activeMembers: 0,
		childrenCount: 0,
		adultsCount: 0,
		seniorsCount: 0,
	});
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isEditingHouseholdInfo, setIsEditingHouseholdInfo] = useState(false);
	const [isEditingLanguagePreferences, setIsEditingLanguagePreferences] =
		useState(false);

	// Use props data and calculate stats
	useEffect(() => {
		if (propHousehold && propMembers) {
			// Calculate stats from props
			const activeMembers = propMembers.filter(
				member => member.status === "active"
			);
			const childrenCount = activeMembers.filter(member => {
				const ageCalculation = calculateAge(member.date_of_birth);
				return ageCalculation.years < 18;
			}).length;
			const seniorsCount = activeMembers.filter(member => {
				const ageCalculation = calculateAge(member.date_of_birth);
				return ageCalculation.years >= 60;
			}).length;
			const adultsCount =
				activeMembers.length - childrenCount - seniorsCount;

			setStats({
				totalMembers: propMembers.length,
				activeMembers: activeMembers.length,
				childrenCount,
				adultsCount,
				seniorsCount,
				lastUpdated: new Date().toISOString(),
			});
		}
	}, [propHousehold, propMembers]);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			// Refresh is handled by parent component
			// Just recalculate stats from current props
			if (propHousehold && propMembers) {
				const activeMembers = propMembers.filter(
					member => member.status === "active"
				);
				const childrenCount = activeMembers.filter(member => {
					const ageCalculation = calculateAge(member.date_of_birth);
					return ageCalculation.years < 18;
				}).length;
				const seniorsCount = activeMembers.filter(member => {
					const ageCalculation = calculateAge(member.date_of_birth);
					return ageCalculation.years >= 60;
				}).length;
				const adultsCount =
					activeMembers.length - childrenCount - seniorsCount;

				setStats({
					totalMembers: propMembers.length,
					activeMembers: activeMembers.length,
					childrenCount,
					adultsCount,
					seniorsCount,
					lastUpdated: new Date().toISOString(),
				});
			}
		} catch (err) {
			console.error("Error refreshing household data:", err);
			onError?.(
				err instanceof Error ? err.message : "Failed to refresh data"
			);
		} finally {
			setIsRefreshing(false);
		}
	};

	const formatAddress = (household: Household): string => {
		const parts = [
			household.address_line_1,
			household.address_line_2,
			household.city,
			household.state,
			household.zip_code,
		].filter(Boolean);

		return parts.join(", ");
	};

	const formatLastUpdated = (dateString?: string): string => {
		if (!dateString) return "Never";
		const date = new Date(dateString);
		return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
	};

	// Event handlers

	const handleEditHouseholdInfo = () => {
		setIsEditingHouseholdInfo(true);
	};

	const handleCancelEditHouseholdInfo = () => {
		setIsEditingHouseholdInfo(false);
	};

	const handleUpdateHouseholdInfo = async (updatedHousehold: Household) => {
		try {
			await onHouseholdUpdate?.(updatedHousehold);
			setIsEditingHouseholdInfo(false);
		} catch (error) {
			onError?.(
				error instanceof Error
					? error.message
					: "Failed to update household"
			);
		}
	};

	const handleEditLanguagePreferences = () => {
		setIsEditingLanguagePreferences(true);
	};

	const handleCancelEditLanguagePreferences = () => {
		setIsEditingLanguagePreferences(false);
	};

	const handleUpdateLanguagePreferences = async (data: any) => {
		try {
			// Update household language preferences
			if (propHousehold) {
				// Update household preferred language
				const updatedHousehold = {
					...propHousehold,
					preferred_language: data.household_preferred_language,
				};
				await onHouseholdUpdate?.(updatedHousehold);
				setIsEditingLanguagePreferences(false);
			}
		} catch (error) {
			console.error("Error updating language preferences:", error);
			onError?.(
				error instanceof Error
					? error.message
					: "Failed to update language preferences"
			);
		}
	};

	// Loading and error states are handled by parent component

	if (!propHousehold) {
		return (
			<div
				className={`flex items-center justify-center min-h-screen ${className}`}
			>
				<div className="text-center max-w-md">
					<Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						No Household Found
					</h2>
					<p className="text-gray-600 mb-4">
						It looks like you haven't set up your household yet.
						Let's get started!
					</p>
					<Button
						onClick={onEditHousehold}
						className="bg-highlight text-white hover:bg-highlight-dark"
					>
						<Plus className="w-4 h-4 mr-2" />
						Set Up Household
					</Button>
				</div>
			</div>
		);
	}

	// If editing household info, show the HouseholdInfoManager
	if (isEditingHouseholdInfo) {
		return (
			<HouseholdInfoManager
				household={propHousehold}
				onUpdate={handleUpdateHouseholdInfo}
				onCancel={handleCancelEditHouseholdInfo}
				className={className}
			/>
		);
	}

	// If editing language preferences, show the LanguagePreferenceManager
	if (isEditingLanguagePreferences) {
		return (
			<LanguagePreferenceManager
				household={propHousehold}
				members={propMembers}
				onUpdate={handleUpdateLanguagePreferences}
				onCancel={handleCancelEditLanguagePreferences}
				className={className}
			/>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<Home className="w-8 h-8" />
						<div>
							<h1 className="text-2xl font-bold">
								Household Dashboard
							</h1>
							<p className="text-green-100">
								Manage your household and family members
							</p>
						</div>
					</div>
					<div className="flex space-x-2">
						<Button
							onClick={handleRefresh}
							variant="outline"
							size="sm"
							className="bg-white/10 border-white/20 text-white hover:bg-white/20"
							disabled={isRefreshing}
						>
							<RefreshCw
								className={`w-4 h-4 mr-2 ${
									isRefreshing ? "animate-spin" : ""
								}`}
							/>
							Refresh
						</Button>
						<Button
							onClick={handleEditHouseholdInfo}
							variant="outline"
							size="sm"
							className="bg-white/10 border-white/20 text-white hover:bg-white/20"
						>
							<Edit className="w-4 h-4 mr-2" />
							Edit Info
						</Button>
					</div>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-blue-100 rounded-lg">
								<Users className="w-6 h-6 text-blue-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">
									Total Members
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.totalMembers}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-green-100 rounded-lg">
								<CheckCircle className="w-6 h-6 text-green-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">
									Active Members
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.activeMembers}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-purple-100 rounded-lg">
								<Calendar className="w-6 h-6 text-purple-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">
									Children
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.childrenCount}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-orange-100 rounded-lg">
								<Clock className="w-6 h-6 text-orange-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Seniors</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.seniorsCount}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Household Information */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Home className="w-5 h-5 text-highlight" />
							<span>Household Information</span>
						</CardTitle>
						<CardDescription>
							Basic information about your household
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<MapPin className="w-5 h-5 text-gray-400" />
								<div>
									<p className="font-medium text-gray-900">
										Address
									</p>
									<p className="text-sm text-gray-600">
										{formatAddress(propHousehold)}
									</p>
								</div>
							</div>
							<Button
								onClick={onEditHousehold}
								variant="outline"
								size="sm"
							>
								<Edit className="w-4 h-4" />
							</Button>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<Globe className="w-5 h-5 text-gray-400" />
								<div>
									<p className="font-medium text-gray-900">
										Preferred Language
									</p>
									<p className="text-sm text-gray-600 capitalize">
										{propHousehold.preferred_language}
									</p>
								</div>
							</div>
							<Button
								onClick={handleEditLanguagePreferences}
								variant="outline"
								size="sm"
							>
								<Edit className="w-4 h-4" />
							</Button>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<Users className="w-5 h-5 text-gray-400" />
								<div>
									<p className="font-medium text-gray-900">
										Primary Contact
									</p>
									<p className="text-sm text-gray-600">
										{propHousehold.primary_first_name}{" "}
										{propHousehold.primary_last_name}
									</p>
									{propHousehold.primary_email && (
										<p className="text-sm text-gray-500">
											{propHousehold.primary_email}
										</p>
									)}
									{propHousehold.primary_phone && (
										<p className="text-sm text-gray-500">
											{propHousehold.primary_phone}
										</p>
									)}
								</div>
							</div>
							<Button
								onClick={onEditHousehold}
								variant="outline"
								size="sm"
							>
								<Edit className="w-4 h-4" />
							</Button>
						</div>

						{propHousehold.notes && (
							<>
								<Separator />
								<div>
									<p className="font-medium text-gray-900 mb-2">
										Notes
									</p>
									<p className="text-sm text-gray-600">
										{propHousehold.notes}
									</p>
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Member Summary */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Users className="w-5 h-5 text-highlight" />
							<span>Member Summary</span>
						</CardTitle>
						<CardDescription>
							Overview of household members by age group
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
									<span className="font-medium text-gray-900">
										Children (Under 18)
									</span>
								</div>
								<Badge
									variant="outline"
									className="bg-blue-100 text-blue-800 border-blue-200"
								>
									{stats.childrenCount}
								</Badge>
							</div>

							<div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="w-3 h-3 bg-green-500 rounded-full"></div>
									<span className="font-medium text-gray-900">
										Adults (18-59)
									</span>
								</div>
								<Badge
									variant="outline"
									className="bg-green-100 text-green-800 border-green-200"
								>
									{stats.adultsCount}
								</Badge>
							</div>

							<div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="w-3 h-3 bg-orange-500 rounded-full"></div>
									<span className="font-medium text-gray-900">
										Seniors (60+)
									</span>
								</div>
								<Badge
									variant="outline"
									className="bg-orange-100 text-orange-800 border-orange-200"
								>
									{stats.seniorsCount}
								</Badge>
							</div>
						</div>

						<Separator />

						<div className="flex space-x-2">
							<Button
								onClick={onAddMember}
								className="flex-1 bg-highlight text-white hover:bg-highlight-dark"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Member
							</Button>
							<Button
								onClick={onManageMembers}
								variant="outline"
								className="flex-1"
							>
								<Users className="w-4 h-4 mr-2" />
								Manage All
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Last Updated */}
			{stats.lastUpdated && (
				<div className="text-center text-sm text-gray-500">
					Last updated: {formatLastUpdated(stats.lastUpdated)}
				</div>
			)}
		</div>
	);
};

/**
 * Hook for managing household dashboard data
 * Provides utilities for loading and managing household information
 */
export const useHouseholdDashboard = () => {
	const { getHouseholdId } = useHouseholdSignUpIntegration();
	const [household, setHousehold] = useState<Household | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

	const loadHousehold = async (
		householdId: number
	): Promise<Household | null> => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await householdsApiService.getHousehold(
				householdId
			);
			const householdData = response.data;
			setHousehold(householdData);
			return householdData;
		} catch (err) {
			console.error("Error loading household:", err);
			setError("Failed to load household data");
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const refreshHousehold = async (): Promise<void> => {
		const householdId = getHouseholdId();
		if (householdId) {
			await loadHousehold(householdId);
		}
	};

	return {
		household,
		isLoading,
		error,
		loadHousehold,
		refreshHousehold,
		clearError: () => setError(null),
	};
};
