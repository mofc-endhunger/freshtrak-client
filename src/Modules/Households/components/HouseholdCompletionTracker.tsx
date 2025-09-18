/**
 * Household Completion Tracker Component
 * Tracks and manages household profile completion with progressive enhancement
 */

import React, { useState, useEffect } from "react";
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
	CheckCircle,
	AlertCircle,
	Clock,
	Calendar,
	Users,
	Home,
	MapPin,
	Globe,
	Bell,
	Target,
	TrendingUp,
} from "lucide-react";
import { useHouseholdSignUpIntegration } from "../services/HouseholdSignUpIntegration";
import { useAuth } from "../../Authentication/AuthContext";

interface HouseholdCompletionTrackerProps {
	onSetupHousehold?: () => void;
	onManageHousehold?: () => void;
	className?: string;
}

interface CompletionMilestone {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	completed: boolean;
	completionDate?: string;
	priority: "high" | "medium" | "low";
	estimatedTime: string;
	benefits: string[];
}

interface CompletionStats {
	totalMilestones: number;
	completedMilestones: number;
	completionPercentage: number;
	nextMilestone?: CompletionMilestone;
	timeToComplete?: string;
	lastActivity?: string;
}

const COMPLETION_MILESTONES: CompletionMilestone[] = [
	{
		id: "basic_profile",
		title: "Basic Profile Setup",
		description: "Complete your basic personal information",
		icon: <Users className="w-5 h-5" />,
		completed: false,
		priority: "high",
		estimatedTime: "2 minutes",
		benefits: ["Personalized experience", "Account security"],
	},
	{
		id: "household_address",
		title: "Household Address",
		description: "Add your household address information",
		icon: <MapPin className="w-5 h-5" />,
		completed: false,
		priority: "high",
		estimatedTime: "3 minutes",
		benefits: ["Location-based services", "Local event recommendations"],
	},
	{
		id: "primary_contact",
		title: "Primary Contact Information",
		description: "Add your contact details and preferences",
		icon: <Home className="w-5 h-5" />,
		completed: false,
		priority: "medium",
		estimatedTime: "2 minutes",
		benefits: ["Event notifications", "Direct communication"],
	},
	{
		id: "language_preferences",
		title: "Language Preferences",
		description: "Set your preferred language and communication settings",
		icon: <Globe className="w-5 h-5" />,
		completed: false,
		priority: "medium",
		estimatedTime: "1 minute",
		benefits: ["Localized content", "Better accessibility"],
	},
	{
		id: "family_members",
		title: "Family Members",
		description: "Add family members to your household",
		icon: <Users className="w-5 h-5" />,
		completed: false,
		priority: "low",
		estimatedTime: "5 minutes",
		benefits: ["Family event registration", "Member management"],
	},
];

export const HouseholdCompletionTracker: React.FC<
	HouseholdCompletionTrackerProps
> = ({ onSetupHousehold, onManageHousehold, className = "" }) => {
	const { user } = useAuth();
	const { hasCompletedSetup, getHouseholdId, getSignUpState } =
		useHouseholdSignUpIntegration();

	const [milestones, setMilestones] = useState<CompletionMilestone[]>(
		COMPLETION_MILESTONES
	);
	const [stats, setStats] = useState<CompletionStats>({
		totalMilestones: 0,
		completedMilestones: 0,
		completionPercentage: 0,
	});

	// Update milestone completion status
	useEffect(() => {
		const updateMilestoneStatus = () => {
			const isHouseholdComplete = hasCompletedSetup();
			const hasHousehold = !!getHouseholdId();

			const updatedMilestones = milestones.map(milestone => {
				let completed = false;
				let completionDate: string | undefined;

				switch (milestone.id) {
					case "basic_profile":
						completed = !!(user?.name && user?.email);
						if (completed)
							completionDate =
								user?.updatedAt || new Date().toISOString();
						break;
					case "household_address":
						completed = isHouseholdComplete && hasHousehold;
						if (completed)
							completionDate = new Date().toISOString();
						break;
					case "primary_contact":
						completed = isHouseholdComplete && hasHousehold;
						if (completed)
							completionDate = new Date().toISOString();
						break;
					case "language_preferences":
						completed = isHouseholdComplete && hasHousehold;
						if (completed)
							completionDate = new Date().toISOString();
						break;
					case "family_members":
						completed = isHouseholdComplete && hasHousehold;
						if (completed)
							completionDate = new Date().toISOString();
						break;
				}

				return { ...milestone, completed, completionDate };
			});

			setMilestones(updatedMilestones);

			// Calculate stats
			const completedCount = updatedMilestones.filter(
				m => m.completed
			).length;
			const totalCount = updatedMilestones.length;
			const percentage = Math.round((completedCount / totalCount) * 100);
			const nextMilestone = updatedMilestones.find(m => !m.completed);

			setStats({
				totalMilestones: totalCount,
				completedMilestones: completedCount,
				completionPercentage: percentage,
				nextMilestone,
				timeToComplete: nextMilestone?.estimatedTime,
				lastActivity: updatedMilestones
					.filter(m => m.completed && m.completionDate)
					.sort(
						(a, b) =>
							new Date(b.completionDate!).getTime() -
							new Date(a.completionDate!).getTime()
					)[0]?.completionDate,
			});
		};

		updateMilestoneStatus();
	}, [user, hasCompletedSetup, getHouseholdId, getSignUpState, milestones]);

	const getPriorityColor = (priority: string): string => {
		switch (priority) {
			case "high":
				return "bg-red-100 text-red-800 border-red-200";
			case "medium":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			default:
				return "bg-green-100 text-green-800 border-green-200";
		}
	};

	const getPriorityIcon = (priority: string): React.ReactNode => {
		switch (priority) {
			case "high":
				return <AlertCircle className="w-4 h-4" />;
			case "medium":
				return <Clock className="w-4 h-4" />;
			default:
				return <CheckCircle className="w-4 h-4" />;
		}
	};

	const formatCompletionDate = (dateString?: string): string => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString();
	};

	const handleMilestoneAction = (milestone: CompletionMilestone) => {
		if (milestone.completed) {
			onManageHousehold?.();
		} else {
			onSetupHousehold?.();
		}
	};

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Completion Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Target className="w-6 h-6 text-highlight" />
						<span>Profile Completion Tracker</span>
					</CardTitle>
					<CardDescription>
						Track your progress and unlock all FreshTrak features
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Stats Overview */}
					<div className="grid grid-cols-3 gap-4">
						<div className="text-center p-4 bg-gray-50 rounded-lg">
							<div className="text-2xl font-bold text-gray-900">
								{stats.completedMilestones}/
								{stats.totalMilestones}
							</div>
							<div className="text-sm text-gray-600">
								Milestones
							</div>
						</div>
						<div className="text-center p-4 bg-gray-50 rounded-lg">
							<div className="text-2xl font-bold text-gray-900">
								{stats.completionPercentage}%
							</div>
							<div className="text-sm text-gray-600">
								Complete
							</div>
						</div>
						<div className="text-center p-4 bg-gray-50 rounded-lg">
							<div className="text-2xl font-bold text-gray-900">
								{stats.timeToComplete || "N/A"}
							</div>
							<div className="text-sm text-gray-600">
								Next Step
							</div>
						</div>
					</div>

					{/* Progress Bar */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">
								Overall Progress
							</span>
							<span className="font-medium">
								{stats.completionPercentage}%
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-3">
							<div
								className="h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
								style={{
									width: `${stats.completionPercentage}%`,
								}}
							></div>
						</div>
					</div>

					{/* Next Milestone */}
					{stats.nextMilestone && (
						<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<div className="flex items-center space-x-3">
								<div className="flex-shrink-0">
									<Bell className="w-5 h-5 text-blue-600" />
								</div>
								<div className="flex-1">
									<h3 className="font-semibold text-blue-900">
										Next: {stats.nextMilestone.title}
									</h3>
									<p className="text-sm text-blue-700">
										{stats.nextMilestone.description}
									</p>
									<p className="text-xs text-blue-600 mt-1">
										Estimated time:{" "}
										{stats.nextMilestone.estimatedTime}
									</p>
								</div>
								<Button
									onClick={() =>
										handleMilestoneAction(
											stats.nextMilestone!
										)
									}
									size="sm"
									className="bg-blue-600 text-white hover:bg-blue-700"
								>
									{stats.nextMilestone.completed
										? "Manage"
										: "Start"}
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Milestones List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<TrendingUp className="w-6 h-6 text-highlight" />
						<span>Completion Milestones</span>
					</CardTitle>
					<CardDescription>
						Complete these steps to unlock all features
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{milestones.map((milestone, index) => (
						<div
							key={milestone.id}
							className={`p-4 border rounded-lg ${
								milestone.completed
									? "bg-green-50 border-green-200"
									: "bg-white border-gray-200"
							}`}
						>
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center ${
											milestone.completed
												? "bg-green-100 text-green-600"
												: "bg-gray-100 text-gray-400"
										}`}
									>
										{milestone.completed ? (
											<CheckCircle className="w-5 h-5" />
										) : (
											milestone.icon
										)}
									</div>
								</div>

								<div className="flex-1">
									<div className="flex items-center space-x-2 mb-2">
										<h3 className="font-semibold text-gray-900">
											{milestone.title}
										</h3>
										<Badge
											className={`text-xs ${getPriorityColor(
												milestone.priority
											)}`}
										>
											<div className="flex items-center space-x-1">
												{getPriorityIcon(
													milestone.priority
												)}
												<span className="capitalize">
													{milestone.priority}
												</span>
											</div>
										</Badge>
									</div>

									<p className="text-sm text-gray-600 mb-3">
										{milestone.description}
									</p>

									<div className="flex items-center space-x-4 text-xs text-gray-500">
										<span className="flex items-center space-x-1">
											<Clock className="w-3 h-3" />
											<span>
												{milestone.estimatedTime}
											</span>
										</span>
										{milestone.completionDate && (
											<span className="flex items-center space-x-1">
												<Calendar className="w-3 h-3" />
												<span>
													Completed:{" "}
													{formatCompletionDate(
														milestone.completionDate
													)}
												</span>
											</span>
										)}
									</div>

									{/* Benefits */}
									{milestone.benefits.length > 0 && (
										<div className="mt-3">
											<h4 className="text-xs font-medium text-gray-700 mb-1">
												Benefits:
											</h4>
											<ul className="flex flex-wrap gap-2">
												{milestone.benefits.map(
													(benefit, benefitIndex) => (
														<li
															key={benefitIndex}
															className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
														>
															{benefit}
														</li>
													)
												)}
											</ul>
										</div>
									)}
								</div>

								<div className="flex-shrink-0">
									<Button
										onClick={() =>
											handleMilestoneAction(milestone)
										}
										size="sm"
										variant={
											milestone.completed
												? "outline"
												: "default"
										}
										className={
											milestone.completed
												? "border-green-300 text-green-700 hover:bg-green-50"
												: "bg-highlight text-white hover:bg-highlight-dark"
										}
									>
										{milestone.completed
											? "Manage"
											: "Start"}
									</Button>
								</div>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
};

/**
 * Hook for managing household completion tracking
 * Provides utilities for tracking progress and managing milestones
 */
export const useHouseholdCompletionTracker = () => {
	const { user } = useAuth();
	const { hasCompletedSetup, getHouseholdId, shouldShowPrompt } =
		useHouseholdSignUpIntegration();

	const getCompletionStats = (): CompletionStats => {
		const isHouseholdComplete = hasCompletedSetup();
		const hasHousehold = !!getHouseholdId();

		let completedCount = 0;
		const totalCount = COMPLETION_MILESTONES.length;

		// Check basic profile
		if (user?.name && user?.email) completedCount++;

		// Check household completion
		if (isHouseholdComplete && hasHousehold) {
			completedCount += 4; // Address, contact, language, family members
		}

		const percentage = Math.round((completedCount / totalCount) * 100);
		const nextMilestone = COMPLETION_MILESTONES.find(m => {
			if (m.id === "basic_profile") return !(user?.name && user?.email);
			if (m.id === "household_address")
				return !(isHouseholdComplete && hasHousehold);
			return false;
		});

		return {
			totalMilestones: totalCount,
			completedMilestones: completedCount,
			completionPercentage: percentage,
			nextMilestone,
			timeToComplete: nextMilestone?.estimatedTime,
		};
	};

	const needsHouseholdSetup = (): boolean => {
		return (
			!hasCompletedSetup() && user?.email && shouldShowPrompt(user.email)
		);
	};

	const canManageHousehold = (): boolean => {
		return hasCompletedSetup() && !!getHouseholdId();
	};

	return {
		getCompletionStats,
		needsHouseholdSetup,
		canManageHousehold,
		shouldShowPrompt: user?.email ? shouldShowPrompt(user.email) : false,
		milestones: COMPLETION_MILESTONES,
	};
};
