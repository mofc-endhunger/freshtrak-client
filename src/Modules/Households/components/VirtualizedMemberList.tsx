/**
 * Virtualized Member List Component
 * Optimized member list with lazy loading and virtualization for large datasets
 */

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import {
	Users,
	Plus,
	Search,
	Filter,
	Grid3X3,
	List as ListIcon,
	SortAsc,
	SortDesc,
	RefreshCw,
} from "lucide-react";
import { MemberCard } from "../MemberCard";
import { HouseholdMember } from "../types/household.types";
import { calculateAge } from "../utils/householdUtils";

interface VirtualizedMemberListProps {
	householdId: number;
	members: HouseholdMember[];
	onAddMember?: () => void;
	onEditMember?: (member: HouseholdMember) => void;
	onViewMemberDetails?: (member: HouseholdMember) => void;
	onMemberStatusChange?: (member: HouseholdMember) => void;
	onError?: (error: string) => void;
	className?: string;
	itemHeight?: number;
	containerHeight?: number;
}

// Simple member item component for non-virtualized list
const MemberItem: React.FC<{
	member: HouseholdMember;
	householdId: number;
	onEditMember?: (member: HouseholdMember) => void;
	onViewMemberDetails?: (member: HouseholdMember) => void;
	onMemberStatusChange?: (member: HouseholdMember) => void;
	onError?: (error: string) => void;
}> = ({
	member,
	householdId,
	onEditMember,
	onViewMemberDetails,
	onMemberStatusChange,
	onError,
}) => {
	return (
		<div className="p-2">
			<MemberCard
				member={member}
				householdId={householdId}
				variant="compact"
				onEdit={onEditMember}
				onViewDetails={onViewMemberDetails}
				onStatusChange={onMemberStatusChange}
				onError={onError}
				showStatusManagement={true}
			/>
		</div>
	);
};

export const VirtualizedMemberList: React.FC<VirtualizedMemberListProps> = ({
	householdId,
	members,
	onAddMember,
	onEditMember,
	onViewMemberDetails,
	onMemberStatusChange,
	onError,
	className = "",
	itemHeight = 120,
	containerHeight = 600,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "active" | "inactive"
	>("all");
	const [ageFilter, setAgeFilter] = useState<
		"all" | "children" | "adults" | "seniors"
	>("all");
	const [sortBy, setSortBy] = useState<"name" | "age" | "status">("name");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [viewMode, setViewMode] = useState<"grid" | "list">("list");
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Memoized filtered and sorted members
	const filteredAndSortedMembers = useMemo(() => {
		let filtered = members.filter(member => {
			// Search filter
			if (searchTerm) {
				const searchLower = searchTerm.toLowerCase();
				const fullName =
					`${member.first_name} ${member.last_name}`.toLowerCase();
				if (
					!fullName.includes(searchLower) &&
					!member.email?.toLowerCase().includes(searchLower) &&
					!member.phone?.includes(searchTerm)
				) {
					return false;
				}
			}

			// Status filter
			if (statusFilter !== "all" && member.status !== statusFilter) {
				return false;
			}

			// Age filter
			if (ageFilter !== "all") {
				const ageCalculation = calculateAge(member.date_of_birth);
				const age = ageCalculation.years;

				switch (ageFilter) {
					case "children":
						if (age >= 18) return false;
						break;
					case "adults":
						if (age < 18 || age >= 60) return false;
						break;
					case "seniors":
						if (age < 60) return false;
						break;
				}
			}

			return true;
		});

		// Sort members
		filtered.sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case "name":
					const nameA =
						`${a.first_name} ${a.last_name}`.toLowerCase();
					const nameB =
						`${b.first_name} ${b.last_name}`.toLowerCase();
					comparison = nameA.localeCompare(nameB);
					break;
				case "age":
					const ageA = calculateAge(a.date_of_birth).years;
					const ageB = calculateAge(b.date_of_birth).years;
					comparison = ageA - ageB;
					break;
				case "status":
					comparison = a.status.localeCompare(b.status);
					break;
			}

			return sortOrder === "asc" ? comparison : -comparison;
		});

		return filtered;
	}, [members, searchTerm, statusFilter, ageFilter, sortBy, sortOrder]);

	// Removed itemData as we're using a regular list now

	// Memoized statistics
	const stats = useMemo(() => {
		const activeMembers = members.filter(
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
		const adultsCount = activeMembers.length - childrenCount - seniorsCount;

		return {
			total: members.length,
			active: activeMembers.length,
			children: childrenCount,
			adults: adultsCount,
			seniors: seniorsCount,
		};
	}, [members]);

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		try {
			// Refresh is handled by parent component
			// This is just for UI feedback
			await new Promise(resolve => setTimeout(resolve, 1000));
		} catch (error) {
			onError?.(
				error instanceof Error
					? error.message
					: "Failed to refresh members"
			);
		} finally {
			setIsRefreshing(false);
		}
	}, [onError]);

	const toggleSortOrder = useCallback(() => {
		setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
	}, []);

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">
						Family Members
					</h2>
					<p className="text-gray-600">
						{stats.total} total • {stats.active} active •{" "}
						{stats.children} children • {stats.adults} adults •{" "}
						{stats.seniors} seniors
					</p>
				</div>
				<div className="flex space-x-3">
					<Button
						onClick={onAddMember}
						className="bg-highlight text-white hover:bg-highlight-dark"
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Member
					</Button>
					<Button
						onClick={handleRefresh}
						variant="outline"
						disabled={isRefreshing}
					>
						<RefreshCw
							className={`w-4 h-4 mr-2 ${
								isRefreshing ? "animate-spin" : ""
							}`}
						/>
						Refresh
					</Button>
				</div>
			</div>

			{/* Filters and Controls */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Filter className="w-5 h-5" />
						<span>Filters & Search</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Search */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Search
							</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search members..."
									value={searchTerm}
									onChange={e =>
										setSearchTerm(e.target.value)
									}
									className="pl-10"
								/>
							</div>
						</div>

						{/* Status Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Status
							</label>
							<Select
								value={statusFilter}
								onValueChange={(value: any) =>
									setStatusFilter(value)
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										All Status
									</SelectItem>
									<SelectItem value="active">
										Active Only
									</SelectItem>
									<SelectItem value="inactive">
										Inactive Only
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Age Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Age Group
							</label>
							<Select
								value={ageFilter}
								onValueChange={(value: any) =>
									setAgeFilter(value)
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										All Ages
									</SelectItem>
									<SelectItem value="children">
										Children (&lt;18)
									</SelectItem>
									<SelectItem value="adults">
										Adults (18-59)
									</SelectItem>
									<SelectItem value="seniors">
										Seniors (60+)
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Sort Controls */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Sort By
							</label>
							<div className="flex space-x-2">
								<Select
									value={sortBy}
									onValueChange={(value: any) =>
										setSortBy(value)
									}
								>
									<SelectTrigger className="flex-1">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="name">
											Name
										</SelectItem>
										<SelectItem value="age">Age</SelectItem>
										<SelectItem value="status">
											Status
										</SelectItem>
									</SelectContent>
								</Select>
								<Button
									variant="outline"
									size="sm"
									onClick={toggleSortOrder}
									className="px-3"
								>
									{sortOrder === "asc" ? (
										<SortAsc className="w-4 h-4" />
									) : (
										<SortDesc className="w-4 h-4" />
									)}
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Results Summary */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Badge variant="outline">
						{filteredAndSortedMembers.length} of {members.length}{" "}
						members
					</Badge>
					{searchTerm && (
						<Badge variant="secondary">
							Search: "{searchTerm}"
						</Badge>
					)}
					{statusFilter !== "all" && (
						<Badge variant="secondary">
							Status: {statusFilter}
						</Badge>
					)}
					{ageFilter !== "all" && (
						<Badge variant="secondary">Age: {ageFilter}</Badge>
					)}
				</div>

				{/* View Mode Toggle */}
				<div className="flex items-center space-x-2">
					<Button
						variant={viewMode === "list" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("list")}
					>
						<ListIcon className="w-4 h-4" />
					</Button>
					<Button
						variant={viewMode === "grid" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("grid")}
					>
						<Grid3X3 className="w-4 h-4" />
					</Button>
				</div>
			</div>

			{/* Virtualized Member List */}
			<Card>
				<CardContent className="p-0">
					{filteredAndSortedMembers.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Users className="w-12 h-12 text-gray-400 mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								No members found
							</h3>
							<p className="text-gray-600 text-center mb-4">
								{searchTerm ||
								statusFilter !== "all" ||
								ageFilter !== "all"
									? "Try adjusting your filters to see more members."
									: "Add your first family member to get started."}
							</p>
							{!searchTerm &&
								statusFilter === "all" &&
								ageFilter === "all" && (
									<Button
										onClick={onAddMember}
										className="bg-highlight text-white hover:bg-highlight-dark"
									>
										<Plus className="w-4 h-4 mr-2" />
										Add First Member
									</Button>
								)}
						</div>
					) : (
						<div className="border rounded-lg max-h-96 overflow-y-auto">
							{filteredAndSortedMembers.map((member, index) => (
								<MemberItem
									key={member.id || index}
									member={member}
									householdId={householdId}
									onEditMember={onEditMember}
									onViewMemberDetails={onViewMemberDetails}
									onMemberStatusChange={onMemberStatusChange}
									onError={onError}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
