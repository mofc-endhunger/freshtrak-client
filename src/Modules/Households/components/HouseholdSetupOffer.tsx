/**
 * Household Setup Offer Component
 * Shows after email confirmation to offer household setup with skip option
 */

import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { CheckCircle, Home, Users, MapPin, Globe } from "lucide-react";

interface HouseholdSetupOfferProps {
	onSetupNow: () => void;
	onSetupLater: () => void;
	isLoading?: boolean;
}

/**
 * Household Setup Offer Component
 * Displays after email confirmation to encourage household setup
 */
export const HouseholdSetupOffer: React.FC<HouseholdSetupOfferProps> = ({
	onSetupNow,
	onSetupLater,
	isLoading = false,
}) => {
	const [isProcessing, setIsProcessing] = useState(false);

	const handleSetupNow = async () => {
		setIsProcessing(true);
		try {
			await onSetupNow();
		} finally {
			setIsProcessing(false);
		}
	};

	const handleSetupLater = async () => {
		setIsProcessing(true);
		try {
			await onSetupLater();
		} finally {
			setIsProcessing(false);
		}
	};

	const benefits = [
		{
			icon: <Users className="w-6 h-6 text-highlight" />,
			title: "Family Management",
			description: "Add family members and manage household information",
		},
		{
			icon: <MapPin className="w-6 h-6 text-highlight" />,
			title: "Location Services",
			description:
				"Get personalized recommendations based on your location",
		},
		{
			icon: <Globe className="w-6 h-6 text-highlight" />,
			title: "Language Preferences",
			description: "Set your preferred language for better experience",
		},
		{
			icon: <Home className="w-6 h-6 text-highlight" />,
			title: "Complete Profile",
			description:
				"Have a complete profile for seamless event registration",
		},
	];

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-2xl w-full">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="mx-auto w-20 h-20 bg-highlight/10 rounded-full flex items-center justify-center mb-6">
						<CheckCircle className="w-10 h-10 text-highlight" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						Welcome to FreshTrak!
					</h1>
					<p className="text-lg text-gray-600">
						Your account has been successfully created. Let's set up
						your household to get the most out of FreshTrak.
					</p>
				</div>

				{/* Benefits Card */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="text-xl text-center">
							Why Set Up Your Household?
						</CardTitle>
						<CardDescription className="text-center">
							Setting up your household helps us provide you with
							personalized services
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{benefits.map((benefit, index) => (
								<div
									key={index}
									className="flex items-start space-x-3"
								>
									<div className="flex-shrink-0 mt-1">
										{benefit.icon}
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 mb-1">
											{benefit.title}
										</h3>
										<p className="text-sm text-gray-600">
											{benefit.description}
										</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="space-y-4">
					<Button
						onClick={handleSetupNow}
						disabled={isLoading || isProcessing}
						className="w-full bg-highlight text-white min-h-12 uppercase min-w-48 hover:bg-highlight-dark transition-colors"
					>
						{isLoading || isProcessing ? (
							<div className="flex items-center space-x-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								<span>Setting Up...</span>
							</div>
						) : (
							"Set Up Household Now"
						)}
					</Button>

					<div className="flex space-x-4">
						<Button
							onClick={handleSetupLater}
							disabled={isLoading || isProcessing}
							variant="outline"
							className="flex-1 min-h-12"
						>
							Set Up Later
						</Button>
					</div>
				</div>

				{/* Additional Info */}
				<div className="mt-8 text-center">
					<p className="text-sm text-gray-500">
						You can always set up your household later in your
						account profile. This helps us provide you with better
						personalized services.
					</p>
				</div>
			</div>
		</div>
	);
};

/**
 * Compact version for dashboard prompts
 * Shows a smaller version for users who skipped initial setup
 */
export const HouseholdSetupPrompt: React.FC<{
	onSetup: () => void;
	onDismiss: () => void;
	className?: string;
}> = ({ onSetup, onDismiss, className = "" }) => {
	return (
		<Card className={`border-highlight/20 bg-highlight/5 ${className}`}>
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-highlight/10 rounded-full flex items-center justify-center">
							<Home className="w-5 h-5 text-highlight" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900">
								Complete Your Profile
							</h3>
							<p className="text-sm text-gray-600">
								Set up your household for personalized services
							</p>
						</div>
					</div>
					<div className="flex space-x-2">
						<Button
							onClick={onSetup}
							size="sm"
							className="bg-highlight text-white hover:bg-highlight-dark"
						>
							Set Up
						</Button>
						<Button
							onClick={onDismiss}
							size="sm"
							variant="ghost"
							className="text-gray-500 hover:text-gray-700"
						>
							Later
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
