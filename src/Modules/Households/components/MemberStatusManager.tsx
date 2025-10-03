/**
 * Member Status Manager Component
 * Handles member deactivation/reactivation with confirmation dialogs
 */

import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
	UserX,
	UserCheck,
	MoreVertical,
	AlertTriangle,
	CheckCircle,
	Clock,
} from "lucide-react";
import { HouseholdMember } from "../types/household.types";

interface MemberStatusManagerProps {
	member: HouseholdMember;
	householdId: number;
	onStatusChange?: (member: HouseholdMember) => void;
	onError?: (error: string) => void;
	disabled?: boolean;
	variant?: "button" | "dropdown";
}

interface StatusChangeAction {
	action: "activate" | "deactivate";
	label: string;
	description: string;
	icon: React.ReactNode;
	variant: "default" | "destructive" | "secondary";
	confirmTitle: string;
	confirmDescription: string;
}

export const MemberStatusManager: React.FC<MemberStatusManagerProps> = ({
	member,
	householdId,
	onStatusChange,
	onError,
	disabled = false,
	variant = "dropdown",
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [pendingAction, setPendingAction] =
		useState<StatusChangeAction | null>(null);

	const getStatusChangeAction = (): StatusChangeAction => {
		if (member.status === "active") {
			return {
				action: "deactivate",
				label: "Deactivate Member",
				description: "Remove member from active household",
				icon: <UserX className="w-4 h-4" />,
				variant: "destructive",
				confirmTitle: "Deactivate Member",
				confirmDescription: `Are you sure you want to deactivate ${member.first_name} ${member.last_name}? They will be removed from active household operations but their information will be preserved.`,
			};
		} else {
			return {
				action: "activate",
				label: "Activate Member",
				description: "Add member back to active household",
				icon: <UserCheck className="w-4 h-4" />,
				variant: "default",
				confirmTitle: "Activate Member",
				confirmDescription: `Are you sure you want to activate ${member.first_name} ${member.last_name}? They will be added back to active household operations.`,
			};
		}
	};

	const handleStatusChange = async () => {
		if (!pendingAction) return;

		setIsLoading(true);
		try {
			// NOTE: Individual member status changes are not supported by the current API
			// This feature requires backend API support for per-member status operations
			throw new Error(
				"Individual member status changes are not supported by the current API. Use household update instead."
			);
		} catch (error) {
			console.error("Error changing member status:", error);
			onError?.(
				`Failed to ${pendingAction.action} member. Please try again.`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const openConfirmationDialog = () => {
		const action = getStatusChangeAction();
		setPendingAction(action);
		setIsDialogOpen(true);
	};

	const getStatusIcon = () => {
		switch (member.status) {
			case "active":
				return <CheckCircle className="w-4 h-4 text-green-600" />;
			case "inactive":
				return <Clock className="w-4 h-4 text-gray-500" />;
			default:
				return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
		}
	};

	const getStatusBadgeColor = () => {
		switch (member.status) {
			case "active":
				return "bg-green-100 text-green-800 border-green-200";
			case "inactive":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
		}
	};

	const renderButtonVariant = () => {
		const action = getStatusChangeAction();

		return (
			<AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<AlertDialogTrigger asChild>
					<Button
						variant={action.variant}
						size="sm"
						disabled={disabled || isLoading}
						onClick={openConfirmationDialog}
						className="flex items-center space-x-2"
					>
						{action.icon}
						<span>{action.label}</span>
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center space-x-2">
							{action.icon}
							<span>{action.confirmTitle}</span>
						</AlertDialogTitle>
						<AlertDialogDescription>
							{action.confirmDescription}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isLoading}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleStatusChange}
							disabled={isLoading}
							className={
								action.variant === "destructive"
									? "bg-red-600 hover:bg-red-700"
									: ""
							}
						>
							{isLoading ? "Processing..." : action.label}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	};

	const renderDropdownVariant = () => {
		const action = getStatusChangeAction();

		return (
			<AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							disabled={disabled || isLoading}
							className="flex items-center space-x-1"
						>
							<MoreVertical className="w-4 h-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={openConfirmationDialog}
							disabled={disabled || isLoading}
							className="flex items-center space-x-2"
						>
							{action.icon}
							<span>{action.label}</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center space-x-2">
							{action.icon}
							<span>{action.confirmTitle}</span>
						</AlertDialogTitle>
						<AlertDialogDescription>
							{action.confirmDescription}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isLoading}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleStatusChange}
							disabled={isLoading}
							className={
								action.variant === "destructive"
									? "bg-red-600 hover:bg-red-700"
									: ""
							}
						>
							{isLoading ? "Processing..." : action.label}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	};

	return (
		<div className="flex items-center space-x-2">
			{/* Status Indicator */}
			<div
				className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor()}`}
			>
				<div className="flex items-center space-x-1">
					{getStatusIcon()}
					<span className="capitalize">{member.status}</span>
				</div>
			</div>

			{/* Status Management Actions */}
			{variant === "button"
				? renderButtonVariant()
				: renderDropdownVariant()}
		</div>
	);
};

/**
 * Hook for managing member status operations
 */
export const useMemberStatusManager = () => {
	const [isLoading, setIsLoading] = useState(false);

	const changeMemberStatus = async (
		householdId: number,
		memberId: number,
		newStatus: "active" | "inactive"
	): Promise<HouseholdMember> => {
		setIsLoading(true);
		try {
			// NOTE: Individual member status changes are not supported by the current API
			// This feature requires backend API support for per-member status operations
			throw new Error(
				"Individual member status changes are not supported by the current API. Use household update instead."
			);
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusChangeHistory = (member: HouseholdMember) => {
		// This would integrate with audit trail functionality
		// For now, return basic status information
		return {
			currentStatus: member.status,
			lastUpdated: member.updated_at,
			canChangeStatus: true,
		};
	};

	return {
		changeMemberStatus,
		getStatusChangeHistory,
		isLoading,
	};
};
