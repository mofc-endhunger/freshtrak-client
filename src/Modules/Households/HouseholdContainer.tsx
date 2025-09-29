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
				setShowSetupWizard(true);
				setIsLoading(false);
				return;
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
			const response = await householdsApiService.updateHousehold(
				household.id,
				householdData
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

			// Check if user came from account page (update) or initial setup (create)
			const fromAccount = searchParams.get("from") === "account";

			if (fromAccount) {
				// User came from account page, update existing household
				const existingHouseholdId = localStorage.getItem("householdId");
				if (!existingHouseholdId) {
					throw new Error("No household ID found for update");
				}
				const updateData = {
					address_line_1: registrationData.address_line_1,
					address_line_2: registrationData.address_line_2,
					city: registrationData.city,
					state: registrationData.state,
					zip_code: registrationData.zip_code,
					preferred_language: "en",
					notes: "",
					members: registrationData.members || [],
				};

				// Remove undefined values
				Object.keys(updateData).forEach(key => {
					if (
						updateData[key as keyof typeof updateData] === undefined
					) {
						delete updateData[key as keyof typeof updateData];
					}
				});

				await householdsApiService.updateHousehold(
					parseInt(existingHouseholdId),
					updateData
				);

				// Redirect back to account page
				navigate("/account");
			} else {
				// User came from initial setup, create new household
				const householdData = {
					primary_first_name: registrationData.first_name,
					primary_last_name: registrationData.last_name,
					phone: registrationData.phone,
					address_line_1: registrationData.address_line_1,
					address_line_2: registrationData.address_line_2,
					city: registrationData.city,
					state: registrationData.state,
					zip_code: registrationData.zip_code,
					date_of_birth: registrationData.date_of_birth,
					permission_to_email: registrationData.permission_to_email,
					children_in_household:
						registrationData.children_in_household,
					preferred_language: "en",
					primary_date_of_birth: registrationData.date_of_birth,
				};

				// Create user via POST API call
				const response = await householdsApiService.createHousehold(
					householdData
				);

				// Store household ID and user ID
				const householdStorage = {
					userId: response.data.primary_user_id,
					household_id: response.data.id,
				};
				localStorage.setItem(
					"household",
					JSON.stringify(householdStorage)
				);
				localStorage.setItem(
					"householdId",
					response.data.id.toString()
				);

				// Set household data
				setHousehold(response.data);
				setShowSetupWizard(false);

				// Redirect to home page
				navigate("/");
			}
		} catch (error: any) {
			console.error("Error completing setup:", error);
			setError(error.message || "Failed to complete setup");
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
