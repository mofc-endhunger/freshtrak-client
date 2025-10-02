/**
 * HouseholdContainer - Dashboard component for household management
 *
 * This component provides the main dashboard interface for household management including:
 * - Household dashboard with overview and statistics
 * - Member management and household information display
 * - Integration with authentication and API services
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { HouseholdDashboard } from "./HouseholdDashboard";
import { HouseholdsApiService } from "../../Services/HouseholdsApiService";
import { ApiHouseholdMember } from "./types/api.types";
import { Household } from "./types/household.types";
import HouseholdRegistrationComponent from "./components/HouseholdRegistrationComponent";
import { AuthGuard } from "./components/AuthGuard";
import { Button } from "../../components/ui/button";
import { Settings } from "lucide-react";

interface HouseholdContainerProps {
	className?: string;
}

export const HouseholdContainer: React.FC<HouseholdContainerProps> = ({
	className = "",
}) => {
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [household, setHousehold] = useState<Household | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showSetupWizard, setShowSetupWizard] = useState(false);

	const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

	// Load household data and handle setup wizard
	useEffect(() => {
		const loadHouseholdData = async () => {
			if (!isAuthenticated || !user) {
				setIsLoading(false);
				return;
			}

			// Check if this is the setup route
			const isSetupRoute =
				window.location.pathname === "/households/setup";
			if (isSetupRoute) {
				// Check if user came from account page (update existing) or initial setup (create new)
				const fromAccount = searchParams.get("from") === "account";

				if (fromAccount) {
					// User came from account page, show setup wizard for updates
					setShowSetupWizard(true);
					setIsLoading(false);
					return;
				} else {
					// User came from email confirmation, need to create household first
					try {
						// Create initial household with basic info
						const initialHouseholdData = {
							primary_first_name: user.name?.split(" ")[0] || "",
							primary_last_name:
								user.name?.split(" ").slice(1).join(" ") || "",
							primary_email: user.email || "",
							address_line_1: "",
							address_line_2: "",
							city: "",
							state: "",
							zip_code: "",
							primary_date_of_birth: "",
							permission_to_email: true,
							preferred_language: "en",
							adult_count: 0,
							child_count: 0,
							senior_count: 0,
						};

						console.log("Creating initial household...");
						const response =
							await householdsApiService.createHousehold(
								initialHouseholdData
							);

						// Store household ID
						localStorage.setItem(
							"householdId",
							response.data.id.toString()
						);

						// Now show setup wizard for additional details
						setShowSetupWizard(true);
						console.log(
							"Initial household created, showing setup wizard"
						);
					} catch (error: any) {
						console.error(
							"Error creating initial household:",
							error
						);
						setError(error.message || "Failed to create household");
					} finally {
						setIsLoading(false);
					}
					return;
				}
			}

			try {
				setIsLoading(true);
				setError(null);

				// Get household ID from localStorage
				const householdId = localStorage.getItem("householdId");
				if (!householdId) {
					throw new Error("No household ID found");
				}

				// Get household data
				const householdResponse =
					await householdsApiService.getHousehold(
						parseInt(householdId)
					);
				setHousehold(householdResponse.data);
			} catch (error: any) {
				console.error("Error loading household data:", error);
				setError(error.message || "Failed to load household data");
			} finally {
				setIsLoading(false);
			}
		};

		loadHouseholdData();
	}, [isAuthenticated, user, householdsApiService]);

	// Handle household update
	const handleHouseholdUpdate = async (householdData: any) => {
		if (!household?.id) return;

		try {
			// Get current household data from /users/me to ensure we have complete object
			const currentHouseholdData =
				await householdsApiService.getUsersMe();

			// Merge current data with updates
			const updateData = {
				...currentHouseholdData,
				...householdData,
				updated_at: new Date().toISOString(),
			};

			const response = await householdsApiService.updateHousehold(
				household.id,
				updateData
			);
			setHousehold(response.data);
		} catch (error: any) {
			console.error("Error updating household:", error);
			setError(error.message || "Failed to update household");
		}
	};

	// Handle setup completion
	const handleSetupComplete = async (registrationData: any) => {
		try {
			setIsLoading(true);
			setError(null);

			// Always update existing household (household was created when setup wizard was shown)
			const currentHouseholdData =
				await householdsApiService.getUsersMe();

			// Update only the fields that were changed, keeping the rest from current data
			const updateData = {
				...currentHouseholdData,
				address_line_1: registrationData.address_line_1 || null,
				address_line_2: registrationData.address_line_2 || null,
				city: registrationData.city || null,
				state: registrationData.state || null,
				zip_code: registrationData.zip_code || null,
				phone: registrationData.phone || null,
				email: registrationData.email || null,
				members: (() => {
					// Start with existing members from /users/me
					const existingMembers = currentHouseholdData.members || [];

					// Update existing members and ensure proper data types, filter out deleted members
					const updatedMembers = existingMembers
						.filter(
							member =>
								!registrationData.deleted_member_ids?.includes(
									member.id
								)
						)
						.map(member => ({
							...member,
							gender_id: member.gender_id
								? Number(member.gender_id)
								: null,
							suffix_id: member.suffix_id
								? Number(member.suffix_id)
								: null,
						}));

					if (updatedMembers.length > 0) {
						// Update primary member details
						updatedMembers[0] = {
							...updatedMembers[0],
							first_name:
								registrationData.first_name ||
								updatedMembers[0].first_name,
							last_name:
								registrationData.last_name ||
								updatedMembers[0].last_name,
							middle_name:
								registrationData.middle_name ||
								updatedMembers[0].middle_name,
							date_of_birth:
								registrationData.date_of_birth ||
								updatedMembers[0].date_of_birth,
							updated_at: new Date().toISOString(),
						};
					}

					// Add new family members from setup wizard
					const newMembers = registrationData.family_members || [];
					const formattedNewMembers = newMembers.map(
						(member: any) => ({
							id: null, // New members get null ID
							household_id: currentHouseholdData.id,
							user_id: null, // New members don't have user_id
							number: null,
							first_name: member.first_name,
							middle_name: member.middle_name || null,
							last_name: member.last_name,
							date_of_birth: member.date_of_birth,
							is_head_of_household: 0,
							is_active: 1,
							added_by: currentHouseholdData.added_by.toString(),
							gender_id: member.gender_id
								? Number(member.gender_id)
								: null,
							suffix_id: member.suffix_id || null,
							created_at: null,
							updated_at: new Date().toISOString(),
						})
					);

					return [...updatedMembers, ...formattedNewMembers];
				})(),
				counts: (() => {
					// Calculate counts based on actual members
					const allMembers = (() => {
						const existingMembers =
							currentHouseholdData.members || [];
						const updatedMembers = [...existingMembers];
						if (updatedMembers.length > 0) {
							updatedMembers[0] = {
								...updatedMembers[0],
								first_name:
									registrationData.first_name ||
									updatedMembers[0].first_name,
								last_name:
									registrationData.last_name ||
									updatedMembers[0].last_name,
								middle_name:
									registrationData.middle_name ||
									updatedMembers[0].middle_name,
								date_of_birth:
									registrationData.date_of_birth ||
									updatedMembers[0].date_of_birth,
								updated_at: new Date().toISOString(),
							};
						}
						const newMembers =
							registrationData.family_members || [];
						return [...updatedMembers, ...newMembers];
					})();

					// Use provided counts if available, otherwise calculate from members
					if (registrationData.household_counts) {
						return registrationData.household_counts;
					}

					// Calculate counts from step 3 data as fallback
					return {
						seniors:
							Number(registrationData.seniors_in_household) || 0,
						adults:
							Number(registrationData.adults_in_household) || 0,
						children:
							Number(registrationData.children_in_household) || 0,
						total: allMembers.length,
					};
				})(),
				updated_at: new Date().toISOString(),
			};

			await householdsApiService.updateHousehold(
				currentHouseholdData.added_by,
				updateData
			);

			// Redirect back to account page
			navigate("/account");
		} catch (error: any) {
			console.error("Error updating household:", error);
			setError(error.message || "Failed to update household");
		} finally {
			setIsLoading(false);
		}
	};

	// Show loading state
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-4 border-highlight border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">Loading household data...</p>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-red-600 mb-4">
							Error
						</h2>
						<p className="text-gray-600 mb-4">{error}</p>
						<Button
							onClick={() => window.location.reload()}
							className="w-full"
						>
							Retry
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Show setup wizard
	if (showSetupWizard) {
		return (
			<HouseholdRegistrationComponent
				onComplete={handleSetupComplete}
				onCancel={() => {
					setShowSetupWizard(false);
					// If user came from Account Settings, redirect back there
					if (searchParams.get("from") === "account") {
						navigate("/account");
					} else {
						navigate("/");
					}
				}}
			/>
		);
	}

	// Show household dashboard
	return (
		<AuthGuard>
			<div className={`min-h-screen bg-gray-50 ${className}`}>
				<div className="max-w-7xl mx-auto p-4">
					{/* Header */}
					<div className="mb-8">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									Household Management
								</h1>
								<p className="text-gray-600 mt-2">
									Manage your family members and household
									information
								</p>
							</div>
							<div className="flex space-x-3">
								<Button
									variant="outline"
									onClick={() => navigate("/account")}
								>
									<Settings className="w-4 h-4 mr-2" />
									Account Settings
								</Button>
							</div>
						</div>
					</div>

					{/* Household Dashboard */}
					{household && (
						<HouseholdDashboard
							household={household}
							members={household.members || []}
							onMemberStatusChange={async () => {}}
							onHouseholdUpdate={handleHouseholdUpdate}
							onError={setError}
						/>
					)}
				</div>
			</div>
		</AuthGuard>
	);
};

export default HouseholdContainer;
