import React from "react";
import { HouseholdInfoDisplayProps } from "../types/household-registration.types";

/**
 * HouseholdInfoDisplay Component
 *
 * Displays household information in a clean, readable format for the confirmation modal.
 * Shows address, member counts, contact information, and household name.
 */
const HouseholdInfoDisplay: React.FC<HouseholdInfoDisplayProps> = ({
	householdData,
	className = "",
}) => {
	// Format member counts into readable text
	const formatMemberCounts = () => {
		const { adults, children, seniors } = householdData.counts;
		const counts = [];

		if (adults > 0) counts.push(`${adults} adult${adults > 1 ? "s" : ""}`);
		if (children > 0)
			counts.push(`${children} child${children > 1 ? "ren" : ""}`);
		if (seniors > 0)
			counts.push(`${seniors} senior${seniors > 1 ? "s" : ""}`);

		return counts.length > 0 ? counts.join(", ") : "No members";
	};

	// Format address
	const formatAddress = () => {
		const parts = [
			householdData.address_line_1,
			householdData.address_line_2,
			householdData.city,
			householdData.state,
			householdData.zip_code,
		].filter(Boolean);

		return parts.join(", ") || "No address provided";
	};

	// Format contact information
	const formatContactInfo = () => {
		const contact = [];
		if (householdData.phone) contact.push(`Phone: ${householdData.phone}`);
		if (householdData.email) contact.push(`Email: ${householdData.email}`);
		return contact.length > 0
			? contact.join(" • ")
			: "No contact information";
	};

	return (
		<div
			className={`space-y-4 ${className}`}
			data-testid="household-info-display"
			role="region"
			aria-labelledby="household-info-heading"
		>
			<h2 id="household-info-heading" className="sr-only">
				Household Information Summary
			</h2>

			{/* Household Name */}
			{householdData.name && (
				<div className="border-b border-gray-200 pb-3">
					<h3
						className="text-lg font-semibold text-gray-900"
						data-testid="household-name"
						id="household-name-heading"
					>
						{householdData.name}
					</h3>
				</div>
			)}

			{/* Address Information */}
			<section className="space-y-2" aria-labelledby="address-heading">
				<h4
					id="address-heading"
					className="text-sm font-medium text-gray-700 uppercase tracking-wide"
				>
					Address
				</h4>
				<p
					className="text-sm text-gray-600"
					data-testid="household-address"
					aria-describedby="address-heading"
				>
					{formatAddress()}
				</p>
			</section>

			{/* Member Counts */}
			<section className="space-y-2" aria-labelledby="members-heading">
				<h4
					id="members-heading"
					className="text-sm font-medium text-gray-700 uppercase tracking-wide"
				>
					Household Members
				</h4>
				<p
					className="text-sm text-gray-600"
					data-testid="household-members"
					aria-describedby="members-heading"
				>
					{formatMemberCounts()}
				</p>
				<p
					className="text-xs text-gray-500"
					aria-label={`Total household members: ${householdData.counts.total}`}
				>
					Total: {householdData.counts.total} member
					{householdData.counts.total !== 1 ? "s" : ""}
				</p>
			</section>

			{/* Contact Information */}
			<section className="space-y-2" aria-labelledby="contact-heading">
				<h4
					id="contact-heading"
					className="text-sm font-medium text-gray-700 uppercase tracking-wide"
				>
					Contact Information
				</h4>
				<p
					className="text-sm text-gray-600"
					data-testid="household-contact"
					aria-describedby="contact-heading"
				>
					{formatContactInfo()}
				</p>
			</section>
		</div>
	);
};

export default HouseholdInfoDisplay;
