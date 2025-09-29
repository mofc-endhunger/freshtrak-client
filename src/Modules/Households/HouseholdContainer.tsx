/**
 * HouseholdContainer - Main container component for household management
 *
 * This component provides the main interface for household management including:
 * - Household dashboard with overview and statistics
 * - Member management (add, edit, remove members)
 * - Household information editing
 * - Integration with authentication and API services
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { HouseholdDashboard } from "./HouseholdDashboard";
import { HouseholdsApiService } from "../../Services/HouseholdsApiService";
import { Household, HouseholdMember } from "./types/household.types";
import { AddMemberForm } from "./AddMemberForm";
import { EditMemberForm } from "./EditMemberForm";
import HouseholdRegistrationComponent from "./components/HouseholdRegistrationComponent";
import { AuthGuard } from "./components/AuthGuard";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { Plus, Home, Settings } from "lucide-react";

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
	const [members, setMembers] = useState<HouseholdMember[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showAddMember, setShowAddMember] = useState(false);
	const [editingMember, setEditingMember] = useState<HouseholdMember | null>(
		null
	);
	const [showSetupWizard, setShowSetupWizard] = useState(false);

	const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

	// Load household data
	useEffect(() => {
		const loadHouseholdData = async () => {
			if (!isAuthenticated || !user) {
				setIsLoading(false);
				return;
			}

			// Check if this is a new user who should see the setup wizard
			const shouldShowSetupWizard = localStorage.getItem(
				"shouldShowSetupWizard"
			);
			if (shouldShowSetupWizard === "true") {
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

				// Get members data
				if (householdResponse.data.id) {
					const membersResponse =
						await householdsApiService.getMembers(
							householdResponse.data.id
						);
					setMembers(membersResponse.data);
				}
			} catch (error: any) {
				console.error("Error loading household data:", error);
				setError(error.message || "Failed to load household data");
			} finally {
				setIsLoading(false);
			}
		};

		loadHouseholdData();
	}, [isAuthenticated, user, householdsApiService]);

	// Handle adding new member
	const handleAddMember = async (memberData: any) => {
		if (!household?.id) return;

		try {
			const response = await householdsApiService.addMember(
				household.id,
				memberData
			);
			setMembers(prev => [...prev, response.data]);
			setShowAddMember(false);
		} catch (error: any) {
			console.error("Error adding member:", error);
			setError(error.message || "Failed to add member");
		}
	};

	// Handle editing member
	const handleEditMember = async (memberId: number, memberData: any) => {
		if (!household?.id) return;

		try {
			const response = await householdsApiService.updateMember(
				household.id,
				memberId,
				memberData
			);
			setMembers(prev =>
				prev.map(member =>
					member.id === memberId ? response.data : member
				)
			);
			setEditingMember(null);
		} catch (error: any) {
			console.error("Error updating member:", error);
			setError(error.message || "Failed to update member");
		}
	};

	// Handle member status change
	const handleMemberStatusChange = async (member: HouseholdMember) => {
		if (!household?.id) return;

		try {
			const newStatus =
				member.status === "active" ? "inactive" : "active";
			const response = await householdsApiService.updateMember(
				household.id,
				member.id,
				{
					status: newStatus,
				}
			);

			setMembers(prev =>
				prev.map(m => (m.id === member.id ? response.data : m))
			);
		} catch (error: any) {
			console.error("Error updating member status:", error);
			setError(error.message || "Failed to update member status");
		}
	};

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

	// Show setup wizard for new users
	const handleSetupHousehold = () => {
		setShowSetupWizard(true);
	};

	// Handle registration completion
	const handleSetupComplete = async (registrationData: any) => {
		try {
			setIsLoading(true);
			setError(null);

			// Map registration data to the expected format
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
				children_in_household: registrationData.children_in_household,
				preferred_language: "en",
				primary_date_of_birth: registrationData.date_of_birth,
			};

			// Create user via POST API call
			const response = await householdsApiService.createHousehold(
				householdData
			);

			// Store user ID and household ID in localStorage
			const householdStorage = {
				userId: response.data.primary_user_id,
				household_id: response.data.id,
			};
			localStorage.setItem("household", JSON.stringify(householdStorage));

			// Set household data
			setHousehold(response.data);
			setShowSetupWizard(false);

			// Clear the setup wizard flag
			localStorage.removeItem("shouldShowSetupWizard");

			// Redirect based on where user came from
			if (searchParams.get("from") === "account") {
				navigate("/account");
			} else {
				navigate("/");
			}
		} catch (error: any) {
			console.error("Error creating user:", error);
			setError(error.message || "Failed to create user");
		} finally {
			setIsLoading(false);
		}
	};

	// Handle skipping setup wizard
	const handleSkipSetup = async (): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);

			// Mark that user skipped setup
			localStorage.setItem("skippedSetupWizard", "true");

			// Clear the setup wizard flag
			localStorage.removeItem("shouldShowSetupWizard");

			// Redirect based on where user came from
			const fromAccount = searchParams.get("from") === "account";
			if (fromAccount) {
				navigate("/account");
			} else {
				navigate("/");
			}
		} catch (error: any) {
			console.error("Error skipping setup:", error);
			setError(error.message || "Failed to skip setup");
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
				<Card className="max-w-md w-full">
					<CardHeader>
						<CardTitle className="text-red-600">Error</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-600 mb-4">{error}</p>
						<Button
							onClick={() => window.location.reload()}
							className="w-full"
						>
							Retry
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Show setup wizard for new users without household
	if (!household && !showSetupWizard) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<Card className="max-w-md w-full">
					<CardHeader className="text-center">
						<div className="w-16 h-16 bg-highlight/10 rounded-full flex items-center justify-center mx-auto mb-4">
							<Home className="w-8 h-8 text-highlight" />
						</div>
						<CardTitle>Set Up Your Household</CardTitle>
						<CardDescription>
							Create your household profile to manage family
							members and preferences
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<Button
								onClick={handleSetupHousehold}
								className="w-full bg-highlight text-white hover:bg-highlight-dark"
							>
								<Plus className="w-4 h-4 mr-2" />
								Set Up Household
							</Button>
							<Button
								onClick={handleSkipSetup}
								variant="ghost"
								className="w-full text-gray-600 hover:text-gray-900"
							>
								Skip for Now
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Show registration component
	if (showSetupWizard) {
		return (
			<HouseholdRegistrationComponent
				onComplete={handleSetupComplete}
				onCancel={() => {
					setShowSetupWizard(false);
					// If user came from Account Settings, redirect back there
					if (searchParams.get("from") === "account") {
						navigate("/account");
					}
				}}
			/>
		);
	}

	// Show add member form
	if (showAddMember && household) {
		return (
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="max-w-2xl mx-auto">
					<div className="mb-6">
						<Button
							variant="outline"
							onClick={() => setShowAddMember(false)}
							className="mb-4"
						>
							← Back to Household
						</Button>
						<h1 className="text-2xl font-bold text-gray-900">
							Add Family Member
						</h1>
					</div>
					<AddMemberForm
						householdId={household.id}
						onSave={handleAddMember}
						onCancel={() => setShowAddMember(false)}
					/>
				</div>
			</div>
		);
	}

	// Show edit member form
	if (editingMember && household) {
		return (
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="max-w-2xl mx-auto">
					<div className="mb-6">
						<Button
							variant="outline"
							onClick={() => setEditingMember(null)}
							className="mb-4"
						>
							← Back to Household
						</Button>
						<h1 className="text-2xl font-bold text-gray-900">
							Edit Family Member
						</h1>
					</div>
					<EditMemberForm
						member={editingMember}
						householdId={household.id}
						onSave={memberData =>
							handleEditMember(editingMember.id, memberData)
						}
						onCancel={() => setEditingMember(null)}
					/>
				</div>
			</div>
		);
	}

	// Show main household dashboard
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
									onClick={() => setShowAddMember(true)}
									className="bg-highlight text-white hover:bg-highlight-dark"
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Member
								</Button>
								<Button
									variant="outline"
									onClick={() => setShowSetupWizard(true)}
								>
									<Settings className="w-4 h-4 mr-2" />
									Setup Wizard
								</Button>
							</div>
						</div>
					</div>

					{/* Household Dashboard */}
					{household && (
						<HouseholdDashboard
							household={household}
							members={members}
							onEditMember={setEditingMember}
							onMemberStatusChange={handleMemberStatusChange}
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
