/**
 * Household Completion Prompt Component
 * Shows gentle reminders for users who skipped initial household setup
 */

import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { X, Home, Users, Bell } from "lucide-react";
import { useHouseholdSignUpIntegration } from "../services/HouseholdSignUpIntegration";
import { useAuth } from "../../Authentication/AuthContext";

interface HouseholdCompletionPromptProps {
	onSetup: () => void;
	onDismiss: () => void;
	className?: string;
	variant?: "banner" | "card" | "toast";
}

interface PromptConfig {
	title: string;
	description: string;
	icon: React.ReactNode;
	benefits: string[];
	ctaText: string;
	dismissText: string;
}

const PROMPT_VARIANTS: Record<string, PromptConfig> = {
	banner: {
		title: "Complete Your Household Profile",
		description:
			"Set up your household for personalized services and easier event registration.",
		icon: <Home className="w-6 h-6 text-blue-600" />,
		benefits: [
			"Personalized event recommendations",
			"Faster event registration",
			"Family member management",
			"Household-specific services",
		],
		ctaText: "Set Up Now",
		dismissText: "Maybe Later",
	},
	card: {
		title: "Missing Household Information",
		description: "Complete your profile to unlock all FreshTrak features.",
		icon: <Users className="w-6 h-6 text-green-600" />,
		benefits: [
			"Track family members",
			"Manage household preferences",
			"Access family services",
		],
		ctaText: "Complete Setup",
		dismissText: "Skip",
	},
	toast: {
		title: "Quick Setup Available",
		description: "Complete your household profile in just 2 minutes.",
		icon: <Bell className="w-5 h-5 text-orange-600" />,
		benefits: [],
		ctaText: "Set Up",
		dismissText: "Dismiss",
	},
};

export const HouseholdCompletionPrompt: React.FC<
	HouseholdCompletionPromptProps
> = ({ onSetup, onDismiss, className = "", variant = "banner" }) => {
	const { shouldShowPrompt, markPromptShown } =
		useHouseholdSignUpIntegration();
	const { user } = useAuth();
	const [isVisible, setIsVisible] = useState(false);
	const [promptConfig] = useState(PROMPT_VARIANTS[variant]);

	// Check if we should show the prompt
	useEffect(() => {
		if (user?.email && shouldShowPrompt(user.email)) {
			setIsVisible(true);
		}
	}, [shouldShowPrompt, user]);

	const handleDismiss = () => {
		markPromptShown();
		setIsVisible(false);
		onDismiss();
	};

	const handleSetup = () => {
		setIsVisible(false);
		onSetup();
	};

	if (!isVisible) {
		return null;
	}

	const renderPrompt = () => {
		switch (variant) {
			case "banner":
				return (
					<div
						className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 ${className}`}
					>
						<div className="flex items-start justify-between">
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									{promptConfig.icon}
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-semibold text-blue-900 mb-2">
										{promptConfig.title}
									</h3>
									<p className="text-blue-700 mb-4">
										{promptConfig.description}
									</p>
									<div className="grid grid-cols-2 gap-2 mb-4">
										{promptConfig.benefits.map(
											(benefit, index) => (
												<div
													key={index}
													className="flex items-center space-x-2"
												>
													<div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
													<span className="text-sm text-blue-700">
														{benefit}
													</span>
												</div>
											)
										)}
									</div>
									<div className="flex space-x-3">
										<Button
											onClick={handleSetup}
											className="bg-blue-600 text-white hover:bg-blue-700"
										>
											{promptConfig.ctaText}
										</Button>
										<Button
											onClick={handleDismiss}
											variant="outline"
											className="border-blue-300 text-blue-700 hover:bg-blue-50"
										>
											{promptConfig.dismissText}
										</Button>
									</div>
								</div>
							</div>
							<button
								onClick={handleDismiss}
								className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>
				);

			case "card":
				return (
					<Card
						className={`border-green-200 bg-green-50 ${className}`}
					>
						<CardContent className="p-6">
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									{promptConfig.icon}
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-semibold text-green-900 mb-2">
										{promptConfig.title}
									</h3>
									<p className="text-green-700 mb-4">
										{promptConfig.description}
									</p>
									<ul className="space-y-1 mb-4">
										{promptConfig.benefits.map(
											(benefit, index) => (
												<li
													key={index}
													className="flex items-center space-x-2 text-sm text-green-700"
												>
													<div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
													<span>{benefit}</span>
												</li>
											)
										)}
									</ul>
									<div className="flex space-x-3">
										<Button
											onClick={handleSetup}
											className="bg-green-600 text-white hover:bg-green-700"
										>
											{promptConfig.ctaText}
										</Button>
										<Button
											onClick={handleDismiss}
											variant="outline"
											className="border-green-300 text-green-700 hover:bg-green-50"
										>
											{promptConfig.dismissText}
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				);

			case "toast":
				return (
					<div
						className={`fixed bottom-4 right-4 bg-white border border-orange-200 rounded-lg shadow-lg p-4 max-w-sm z-50 ${className}`}
					>
						<div className="flex items-start space-x-3">
							<div className="flex-shrink-0">
								{promptConfig.icon}
							</div>
							<div className="flex-1">
								<h4 className="font-semibold text-gray-900 text-sm mb-1">
									{promptConfig.title}
								</h4>
								<p className="text-gray-600 text-xs mb-3">
									{promptConfig.description}
								</p>
								<div className="flex space-x-2">
									<Button
										onClick={handleSetup}
										size="sm"
										className="bg-orange-600 text-white hover:bg-orange-700 text-xs"
									>
										{promptConfig.ctaText}
									</Button>
									<Button
										onClick={handleDismiss}
										variant="outline"
										size="sm"
										className="border-orange-300 text-orange-700 hover:bg-orange-50 text-xs"
									>
										{promptConfig.dismissText}
									</Button>
								</div>
							</div>
							<button
								onClick={handleDismiss}
								className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return renderPrompt();
};

/**
 * Hook for managing household completion prompts
 * Provides utilities for showing different types of prompts
 */
export const useHouseholdCompletionPrompts = () => {
	const { shouldShowPrompt, getSignUpState } =
		useHouseholdSignUpIntegration();
	const { user } = useAuth();

	const getPromptFrequency = (): "immediate" | "delayed" | "periodic" => {
		const state = getSignUpState();

		if (state.userChoice === "later") {
			return "delayed";
		} else if (state.userChoice === "skip") {
			return "periodic";
		}

		return "immediate";
	};

	const shouldShowBannerPrompt = (): boolean => {
		return user?.email
			? shouldShowPrompt(user.email) &&
					getPromptFrequency() === "immediate"
			: false;
	};

	const shouldShowCardPrompt = (): boolean => {
		return user?.email
			? shouldShowPrompt(user.email) && getPromptFrequency() === "delayed"
			: false;
	};

	const shouldShowToastPrompt = (): boolean => {
		return user?.email
			? shouldShowPrompt(user.email) &&
					getPromptFrequency() === "periodic"
			: false;
	};

	return {
		shouldShowPrompt: user?.email ? shouldShowPrompt(user.email) : false,
		getPromptFrequency,
		shouldShowBannerPrompt: shouldShowBannerPrompt(),
		shouldShowCardPrompt: shouldShowCardPrompt(),
		shouldShowToastPrompt: shouldShowToastPrompt(),
	};
};
