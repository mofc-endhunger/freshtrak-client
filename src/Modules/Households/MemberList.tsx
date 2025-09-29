/**
 * Member List Component
 * Displays all household members with filtering, sorting, and management options
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import {
	Users,
	Plus,
	Search,
	Filter,
	Grid3X3,
	List,
	SortAsc,
	SortDesc,
	RefreshCw,
	AlertCircle,
} from "lucide-react";
import { MemberCard } from "./MemberCard";
import { HouseholdMember } from "./types/household.types";
import { calculateAge } from "./utils/householdUtils";
import { HouseholdsApiService } from "../../Services/HouseholdsApiService";
import { useHouseholdSignUpIntegration } from "./services/HouseholdSignUpIntegration";

interface MemberListProps {
	householdId: number;
	onAddMember?: () => void;
	onEditMember?: (member: HouseholdMember) => void;
	onViewMemberDetails?: (member: HouseholdMember) => void;
	onMemberStatusChange?: (member: HouseholdMember) => void;
	onError?: (error: string) => void;
	className?: string;
}

interface FilterOptions {
	status: "all" | "active" | "inactive";
	ageGroup: "all" | "children" | "adults" | "seniors";
	freshtrakUser: "all" | "yes" | "no";
}

interface SortOptions {
	field: "name" | "age" | "status" | "created_at";
	direction: "asc" | "desc";
}

export const MemberList: React.FC<MemberListProps> = ({
	householdId,
	onAddMember,
	onEditMember,
	onViewMemberDetails,
	onMemberStatusChange,
	onError,
	className = "",
}) => {
	const { getHouseholdId } = useHouseholdSignUpIntegration();
	const [members, setMembers] = useState<HouseholdMember[]>([]);
	const [filteredMembers, setFilteredMembers] = useState<HouseholdMember[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState<FilterOptions>({
		status: "all",
		ageGroup: "all",
		freshtrakUser: "all",
	});
	const [sortOptions, setSortOptions] = useState<SortOptions>({
		field: "name",
		direction: "asc",
	});

	const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

	// Load members data
	useEffect(() => {
		const loadMembers = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const householdId = getHouseholdId();
				if (!householdId) {
					setError(
						"No household found. Please set up your household first."
					);
					return;
				}

				const response = await householdsApiService.getHousehold(
					householdId
				);
				const membersData = response.data.members || [];
				setMembers(membersData);
				setFilteredMembers(membersData);
			} catch (err) {
				console.error("Error loading members:", err);
				setError("Failed to load household members. Please try again.");
			} finally {
				setIsLoading(false);
			}
		};

		loadMembers();
	}, [getHouseholdId, householdsApiService]);

	// Apply filters and search
	useEffect(() => {
		let filtered = [...members];

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(member => {
				const fullName =
					`${member.first_name} ${member.last_name}`.toLowerCase();
				const email = member.email?.toLowerCase() || "";
				return fullName.includes(query) || email.includes(query);
			});
		}

		// Apply status filter
		if (filters.status !== "all") {
			filtered = filtered.filter(
				member => member.status === filters.status
			);
		}

		// Apply age group filter
		if (filters.ageGroup !== "all") {
			filtered = filtered.filter(member => {
				const ageCalculation = calculateAge(member.date_of_birth);
				const age = ageCalculation.years;
				switch (filters.ageGroup) {
					case "children":
						return age < 18;
					case "adults":
						return age >= 18 && age < 60;
					case "seniors":
						return age >= 60;
					default:
						return true;
				}
			});
		}

		// Apply FreshTrak user filter
		if (filters.freshtrakUser !== "all") {
			filtered = filtered.filter(member => {
				if (filters.freshtrakUser === "yes") {
					return member.is_freshtrak_user;
				} else {
					return !member.is_freshtrak_user;
				}
			});
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let aValue: any;
			let bValue: any;

			switch (sortOptions.field) {
				case "name":
					aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
					bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
					break;
				case "age":
					aValue = calculateAge(a.date_of_birth).years;
					bValue = calculateAge(b.date_of_birth).years;
					break;
				case "status":
					aValue = a.status;
					bValue = b.status;
					break;
				case "created_at":
					aValue = new Date(a.created_at);
					bValue = new Date(b.created_at);
					break;
				default:
					return 0;
			}

			if (aValue < bValue) {
				return sortOptions.direction === "asc" ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortOptions.direction === "asc" ? 1 : -1;
			}
			return 0;
		});

		setFilteredMembers(filtered);
	}, [members, searchQuery, filters, sortOptions]);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			const householdId = getHouseholdId();
			if (householdId) {
				const response = await householdsApiService.getHousehold(
					householdId
				);
				const membersData = response.data.members || [];
				setMembers(membersData);
			}
		} catch (err) {
			console.error("Error refreshing members:", err);
			setError("Failed to refresh members. Please try again.");
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleFilterChange = (
		filterType: keyof FilterOptions,
		value: string
	) => {
		setFilters(prev => ({
			...prev,
			[filterType]: value,
		}));
	};

	const handleSortChange = (field: SortOptions["field"]) => {
		setSortOptions(prev => ({
			field,
			direction:
				prev.field === field && prev.direction === "asc"
					? "desc"
					: "asc",
		}));
	};

	const clearFilters = () => {
		setSearchQuery("");
		setFilters({
			status: "all",
			ageGroup: "all",
			freshtrakUser: "all",
		});
	};

	const getActiveFiltersCount = (): number => {
		let count = 0;
		if (searchQuery.trim()) count++;
		if (filters.status !== "all") count++;
		if (filters.ageGroup !== "all") count++;
		if (filters.freshtrakUser !== "all") count++;
		return count;
	};

	if (isLoading) {
		return (
			<div
				className={`flex items-center justify-center min-h-64 ${className}`}
			>
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto mb-4"></div>
					<p className="text-gray-600">
						Loading household members...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className={`flex items-center justify-center min-h-64 ${className}`}
			>
				<div className="text-center max-w-md">
					<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						Error Loading Members
					</h3>
					<p className="text-gray-600 mb-4">{error}</p>
					<Button
						onClick={handleRefresh}
						className="bg-highlight text-white hover:bg-highlight-dark"
					>
						<RefreshCw className="w-4 h-4 mr-2" />
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center space-x-2">
								<Users className="w-6 h-6 text-highlight" />
								<span>Household Members</span>
							</CardTitle>
							<CardDescription>
								Manage your household members and their
								information
							</CardDescription>
						</div>
						<div className="flex space-x-2">
							<Button
								onClick={handleRefresh}
								variant="outline"
								size="sm"
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
								onClick={onAddMember}
								className="bg-highlight text-white hover:bg-highlight-dark"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Member
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent>
					{/* Search and Filters */}
					<div className="space-y-4">
						{/* Search Bar */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
							<Input
								placeholder="Search members by name or email..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						{/* Filters */}
						<div className="flex flex-wrap items-center gap-4">
							<div className="flex items-center space-x-2">
								<Filter className="w-4 h-4 text-gray-400" />
								<span className="text-sm text-gray-600">
									Filters:
								</span>
							</div>

							<Select
								value={filters.status}
								onValueChange={value =>
									handleFilterChange("status", value)
								}
							>
								<SelectTrigger className="w-32">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										All Status
									</SelectItem>
									<SelectItem value="active">
										Active
									</SelectItem>
									<SelectItem value="inactive">
										Inactive
									</SelectItem>
								</SelectContent>
							</Select>

							<Select
								value={filters.ageGroup}
								onValueChange={value =>
									handleFilterChange("ageGroup", value)
								}
							>
								<SelectTrigger className="w-32">
									<SelectValue placeholder="Age Group" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										All Ages
									</SelectItem>
									<SelectItem value="children">
										Children
									</SelectItem>
									<SelectItem value="adults">
										Adults
									</SelectItem>
									<SelectItem value="seniors">
										Seniors
									</SelectItem>
								</SelectContent>
							</Select>

							<Select
								value={filters.freshtrakUser}
								onValueChange={value =>
									handleFilterChange("freshtrakUser", value)
								}
							>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="FreshTrak User" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										All Users
									</SelectItem>
									<SelectItem value="yes">
										FreshTrak Users
									</SelectItem>
									<SelectItem value="no">
										Non-FreshTrak Users
									</SelectItem>
								</SelectContent>
							</Select>

							{getActiveFiltersCount() > 0 && (
								<Button
									onClick={clearFilters}
									variant="outline"
									size="sm"
								>
									Clear Filters ({getActiveFiltersCount()})
								</Button>
							)}
						</div>

						{/* Sort and View Options */}
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2">
									<span className="text-sm text-gray-600">
										Sort by:
									</span>
									<Button
										onClick={() => handleSortChange("name")}
										variant={
											sortOptions.field === "name"
												? "default"
												: "outline"
										}
										size="sm"
									>
										Name
										{sortOptions.field === "name" &&
											(sortOptions.direction === "asc" ? (
												<SortAsc className="w-3 h-3 ml-1" />
											) : (
												<SortDesc className="w-3 h-3 ml-1" />
											))}
									</Button>
									<Button
										onClick={() => handleSortChange("age")}
										variant={
											sortOptions.field === "age"
												? "default"
												: "outline"
										}
										size="sm"
									>
										Age
										{sortOptions.field === "age" &&
											(sortOptions.direction === "asc" ? (
												<SortAsc className="w-3 h-3 ml-1" />
											) : (
												<SortDesc className="w-3 h-3 ml-1" />
											))}
									</Button>
								</div>
							</div>

							<div className="flex items-center space-x-2">
								<span className="text-sm text-gray-600">
									View:
								</span>
								<Button
									onClick={() => setViewMode("grid")}
									variant={
										viewMode === "grid"
											? "default"
											: "outline"
									}
									size="sm"
									className="h-8 w-8 p-0"
								>
									<Grid3X3 className="w-4 h-4" />
								</Button>
								<Button
									onClick={() => setViewMode("list")}
									variant={
										viewMode === "list"
											? "default"
											: "outline"
									}
									size="sm"
									className="h-8 w-8 p-0"
								>
									<List className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Members Display */}
			<div className="space-y-4">
				{/* Results Summary */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<span className="text-sm text-gray-600">
							Showing {filteredMembers.length} of {members.length}{" "}
							members
						</span>
						{getActiveFiltersCount() > 0 && (
							<Badge variant="outline">
								{getActiveFiltersCount()} filter
								{getActiveFiltersCount() > 1 ? "s" : ""} applied
							</Badge>
						)}
					</div>
				</div>

				{/* Members Grid/List */}
				{filteredMembers.length === 0 ? (
					<Card>
						<CardContent className="p-12 text-center">
							<Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								{members.length === 0
									? "No Members Yet"
									: "No Members Found"}
							</h3>
							<p className="text-gray-600 mb-4">
								{members.length === 0
									? "Start by adding your first household member."
									: "Try adjusting your search or filters to find members."}
							</p>
							{members.length === 0 && (
								<Button
									onClick={onAddMember}
									className="bg-highlight text-white hover:bg-highlight-dark"
								>
									<Plus className="w-4 h-4 mr-2" />
									Add First Member
								</Button>
							)}
						</CardContent>
					</Card>
				) : (
					<div
						className={
							viewMode === "grid"
								? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
								: "space-y-4"
						}
					>
						{filteredMembers.map(member => (
							<MemberCard
								key={member.id}
								member={member}
								householdId={householdId}
								variant={
									viewMode === "grid" ? "default" : "compact"
								}
								onEdit={onEditMember}
								onViewDetails={onViewMemberDetails}
								onStatusChange={onMemberStatusChange}
								onError={onError}
								showStatusManagement={true}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

/**
 * Hook for managing member list operations
 * Provides utilities for member management
 */
export const useMemberList = () => {
	const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

	const selectMember = (memberId: number) => {
		setSelectedMembers(prev => [...prev, memberId]);
	};

	const deselectMember = (memberId: number) => {
		setSelectedMembers(prev => prev.filter(id => id !== memberId));
	};

	const selectAllMembers = (memberIds: number[]) => {
		setSelectedMembers(memberIds);
	};

	const clearSelection = () => {
		setSelectedMembers([]);
	};

	const isMemberSelected = (memberId: number): boolean => {
		return selectedMembers.includes(memberId);
	};

	return {
		selectedMembers,
		selectMember,
		deselectMember,
		selectAllMembers,
		clearSelection,
		isMemberSelected,
	};
};
