/**
 * Address and Contact Manager Component
 * Enhanced address and contact management with autocomplete and validation
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Checkbox } from "../../../components/ui/checkbox";
import {
	MapPin,
	Phone,
	Mail,
	User,
	CheckCircle,
	Home,
	Building,
	Navigation,
} from "lucide-react";
import { HouseholdMember } from "../types/household.types";
import { formatPhoneNumber } from "../utils/householdUtils";
import { HouseholdsApiService } from "../../../Services/HouseholdsApiService";

interface AddressContactManagerProps {
	member: HouseholdMember;
	onUpdate: (data: AddressContactData) => Promise<void>;
	onCancel?: () => void;
	className?: string;
	mode?: "view" | "edit";
}

interface AddressContactData {
	phone?: string;
	email?: string;
	address_line_1?: string;
	address_line_2?: string;
	city?: string;
	state?: string;
	zip_code?: string;
	preferred_contact_method?: "phone" | "email" | "both";
	use_household_address?: boolean;
	notes?: string;
}

interface AddressSuggestion {
	formatted_address: string;
	address_line_1: string;
	address_line_2?: string;
	city: string;
	state: string;
	zip_code: string;
	place_id: string;
}

interface ContactValidation {
	phone: boolean;
	email: boolean;
	address: boolean;
}

export const AddressContactManager: React.FC<AddressContactManagerProps> = ({
	member,
	onUpdate,
	onCancel,
	className = "",
	mode = "edit",
}) => {
	const [isEditing, setIsEditing] = useState(mode === "edit");
	const [isLoading, setIsLoading] = useState(false);
	const [addressSuggestions, setAddressSuggestions] = useState<
		AddressSuggestion[]
	>([]);
	const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
	const [validation, setValidation] = useState<ContactValidation>({
		phone: true,
		email: true,
		address: true,
	});

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isDirty },
		reset,
	} = useForm<AddressContactData>({
		defaultValues: {
			phone: member.phone || "",
			email: member.email || "",
			address_line_1: member.address_line_1 || "",
			address_line_2: member.address_line_2 || "",
			city: member.city || "",
			state: member.state || "",
			zip_code: member.zip_code || "",
			preferred_contact_method: "both",
			use_household_address: !member.address_line_1,
			notes: member.notes || "",
		},
	});

	const watchedValues = watch();

	// Validate contact information in real-time
	useEffect(() => {
		const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
		const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
		const addressRegex = /^.{5,}$/;

		setValidation({
			phone: !watchedValues.phone || phoneRegex.test(watchedValues.phone),
			email: !watchedValues.email || emailRegex.test(watchedValues.email),
			address:
				!watchedValues.address_line_1 ||
				addressRegex.test(watchedValues.address_line_1),
		});
	}, [watchedValues]);

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPhoneNumber(e.target.value);
		setValue("phone", formatted, { shouldDirty: true });
	};

	const handleAddressSearch = async (query: string) => {
		if (query.length < 3) {
			setAddressSuggestions([]);
			setShowAddressSuggestions(false);
			return;
		}

		try {
			// Simulate Google Places API call
			// In a real implementation, this would call the Google Places API
			const mockSuggestions: AddressSuggestion[] = [
				{
					formatted_address: "123 Main Street, Columbus, OH 43215",
					address_line_1: "123 Main Street",
					city: "Columbus",
					state: "OH",
					zip_code: "43215",
					place_id: "place_1",
				},
				{
					formatted_address: "456 Oak Avenue, Columbus, OH 43210",
					address_line_1: "456 Oak Avenue",
					city: "Columbus",
					state: "OH",
					zip_code: "43210",
					place_id: "place_2",
				},
			];

			setAddressSuggestions(mockSuggestions);
			setShowAddressSuggestions(true);
		} catch (error) {
			console.error("Error fetching address suggestions:", error);
		}
	};

	const selectAddressSuggestion = (suggestion: AddressSuggestion) => {
		setValue("address_line_1", suggestion.address_line_1, {
			shouldDirty: true,
		});
		setValue("city", suggestion.city, { shouldDirty: true });
		setValue("state", suggestion.state, { shouldDirty: true });
		setValue("zip_code", suggestion.zip_code, { shouldDirty: true });
		setShowAddressSuggestions(false);
	};

	const onSubmit = async (data: AddressContactData) => {
		setIsLoading(true);
		try {
			await onUpdate(data);
			setIsEditing(false);
		} catch (error) {
			console.error("Error updating address and contact:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		reset();
		setIsEditing(false);
		onCancel?.();
	};

	const getContactMethodIcon = (method: string) => {
		switch (method) {
			case "phone":
				return <Phone className="w-4 h-4" />;
			case "email":
				return <Mail className="w-4 h-4" />;
			case "both":
				return <User className="w-4 h-4" />;
			default:
				return <User className="w-4 h-4" />;
		}
	};

	const getContactMethodLabel = (method: string) => {
		switch (method) {
			case "phone":
				return "Phone Only";
			case "email":
				return "Email Only";
			case "both":
				return "Phone & Email";
			default:
				return "Both";
		}
	};

	const renderViewMode = () => (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<MapPin className="w-5 h-5 text-highlight" />
					<span>Address & Contact Information</span>
				</CardTitle>
				<CardDescription>
					Contact details and address for {member.first_name}{" "}
					{member.last_name}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Contact Information */}
				<div className="space-y-4">
					<h4 className="font-semibold text-gray-900 flex items-center space-x-2">
						<User className="w-4 h-4" />
						<span>Contact Information</span>
					</h4>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{member.phone && (
							<div className="flex items-center space-x-2">
								<Phone className="w-4 h-4 text-gray-400" />
								<span className="text-sm text-gray-600">
									{member.phone}
								</span>
								{validation.phone && (
									<CheckCircle className="w-4 h-4 text-green-500" />
								)}
							</div>
						)}

						{member.email && (
							<div className="flex items-center space-x-2">
								<Mail className="w-4 h-4 text-gray-400" />
								<span className="text-sm text-gray-600">
									{member.email}
								</span>
								{validation.email && (
									<CheckCircle className="w-4 h-4 text-green-500" />
								)}
							</div>
						)}
					</div>

					{watchedValues.preferred_contact_method && (
						<div className="flex items-center space-x-2">
							<Badge className="bg-blue-100 text-blue-800 border-blue-200">
								<div className="flex items-center space-x-1">
									{getContactMethodIcon(
										watchedValues.preferred_contact_method
									)}
									<span>
										{getContactMethodLabel(
											watchedValues.preferred_contact_method
										)}
									</span>
								</div>
							</Badge>
						</div>
					)}
				</div>

				{/* Address Information */}
				<div className="space-y-4">
					<h4 className="font-semibold text-gray-900 flex items-center space-x-2">
						<Home className="w-4 h-4" />
						<span>Address Information</span>
					</h4>

					{watchedValues.use_household_address ? (
						<div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
							<Building className="w-4 h-4 text-gray-400" />
							<span className="text-sm text-gray-600">
								Uses household address
							</span>
						</div>
					) : (
						<div className="space-y-2">
							{member.address_line_1 && (
								<div className="flex items-center space-x-2">
									<MapPin className="w-4 h-4 text-gray-400" />
									<span className="text-sm text-gray-600">
										{[
											member.address_line_1,
											member.address_line_2,
											member.city,
											member.state,
											member.zip_code,
										]
											.filter(Boolean)
											.join(", ")}
									</span>
									{validation.address && (
										<CheckCircle className="w-4 h-4 text-green-500" />
									)}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Notes */}
				{member.notes && (
					<div className="space-y-2">
						<h4 className="font-semibold text-gray-900">Notes</h4>
						<p className="text-sm text-gray-600">{member.notes}</p>
					</div>
				)}

				{/* Actions */}
				<div className="flex justify-end space-x-2">
					<Button
						onClick={() => setIsEditing(true)}
						variant="outline"
						size="sm"
					>
						Edit Information
					</Button>
				</div>
			</CardContent>
		</Card>
	);

	const renderEditMode = () => (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<MapPin className="w-5 h-5 text-highlight" />
					<span>Edit Address & Contact</span>
				</CardTitle>
				<CardDescription>
					Update contact details and address for {member.first_name}{" "}
					{member.last_name}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Contact Information */}
					<div className="space-y-4">
						<h4 className="font-semibold text-gray-900 flex items-center space-x-2">
							<User className="w-4 h-4" />
							<span>Contact Information</span>
						</h4>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="phone">Phone Number</Label>
								<Input
									id="phone"
									type="tel"
									{...register("phone", {
										pattern: {
											value: /^\(\d{3}\) \d{3}-\d{4}$/,
											message:
												"Please enter a valid phone number",
										},
									})}
									onChange={handlePhoneChange}
									placeholder="(555) 123-4567"
									className={
										!validation.phone
											? "border-red-500"
											: ""
									}
								/>
								{errors.phone && (
									<p className="text-sm text-red-600 mt-1">
										{errors.phone.message}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									type="email"
									{...register("email", {
										pattern: {
											value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
											message:
												"Please enter a valid email address",
										},
									})}
									placeholder="john@example.com"
									className={
										!validation.email
											? "border-red-500"
											: ""
									}
								/>
								{errors.email && (
									<p className="text-sm text-red-600 mt-1">
										{errors.email.message}
									</p>
								)}
							</div>
						</div>

						<div>
							<Label htmlFor="preferred_contact_method">
								Preferred Contact Method
							</Label>
							<Select
								value={watchedValues.preferred_contact_method}
								onValueChange={value =>
									setValue(
										"preferred_contact_method",
										value as any,
										{ shouldDirty: true }
									)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select contact method" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="both">
										<div className="flex items-center space-x-2">
											<User className="w-4 h-4" />
											<span>Phone & Email</span>
										</div>
									</SelectItem>
									<SelectItem value="phone">
										<div className="flex items-center space-x-2">
											<Phone className="w-4 h-4" />
											<span>Phone Only</span>
										</div>
									</SelectItem>
									<SelectItem value="email">
										<div className="flex items-center space-x-2">
											<Mail className="w-4 h-4" />
											<span>Email Only</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Address Information */}
					<div className="space-y-4">
						<h4 className="font-semibold text-gray-900 flex items-center space-x-2">
							<Home className="w-4 h-4" />
							<span>Address Information</span>
						</h4>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="use_household_address"
								checked={watchedValues.use_household_address}
								onCheckedChange={checked =>
									setValue(
										"use_household_address",
										!!checked,
										{ shouldDirty: true }
									)
								}
							/>
							<Label htmlFor="use_household_address">
								Use household address
							</Label>
						</div>

						{!watchedValues.use_household_address && (
							<div className="space-y-4">
								<div>
									<Label htmlFor="address_line_1">
										Street Address
									</Label>
									<div className="relative">
										<Input
											id="address_line_1"
											{...register("address_line_1")}
											placeholder="123 Main Street"
											onChange={e => {
												setValue(
													"address_line_1",
													e.target.value,
													{ shouldDirty: true }
												);
												handleAddressSearch(
													e.target.value
												);
											}}
											className={
												!validation.address
													? "border-red-500"
													: ""
											}
										/>
										{showAddressSuggestions &&
											addressSuggestions.length > 0 && (
												<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
													{addressSuggestions.map(
														suggestion => (
															<button
																key={
																	suggestion.place_id
																}
																type="button"
																onClick={() =>
																	selectAddressSuggestion(
																		suggestion
																	)
																}
																className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
															>
																<Navigation className="w-4 h-4 text-gray-400" />
																<span>
																	{
																		suggestion.formatted_address
																	}
																</span>
															</button>
														)
													)}
												</div>
											)}
									</div>
								</div>

								<div>
									<Label htmlFor="address_line_2">
										Apartment, Suite, etc.
									</Label>
									<Input
										id="address_line_2"
										{...register("address_line_2")}
										placeholder="Apt 4B"
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<Label htmlFor="city">City</Label>
										<Input
											id="city"
											{...register("city")}
											placeholder="Columbus"
										/>
									</div>

									<div>
										<Label htmlFor="state">State</Label>
										<Input
											id="state"
											{...register("state")}
											placeholder="OH"
											maxLength={2}
										/>
									</div>

									<div>
										<Label htmlFor="zip_code">
											ZIP Code
										</Label>
										<Input
											id="zip_code"
											{...register("zip_code")}
											placeholder="43215"
											maxLength={10}
										/>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Notes */}
					<div>
						<Label htmlFor="notes">Notes</Label>
						<Textarea
							id="notes"
							{...register("notes")}
							placeholder="Additional notes about this member..."
							rows={3}
						/>
					</div>

					{/* Actions */}
					<div className="flex justify-end space-x-2">
						<Button
							type="button"
							onClick={handleCancel}
							variant="outline"
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading || !isDirty}
							className="bg-highlight text-white hover:bg-highlight-dark"
						>
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);

	return isEditing ? renderEditMode() : renderViewMode();
};

/**
 * Hook for managing address and contact operations
 */
export const useAddressContactManager = () => {
	const [isLoading, setIsLoading] = useState(false);

	const updateMemberAddressContact = async (
		householdId: number,
		memberId: number,
		data: AddressContactData
	): Promise<void> => {
		setIsLoading(true);
		try {
			const householdsApiService = new HouseholdsApiService();
			await householdsApiService.updateMember(
				householdId,
				memberId,
				data
			);
		} finally {
			setIsLoading(false);
		}
	};

	const validateAddress = (address: Partial<AddressContactData>): boolean => {
		if (address.use_household_address) return true;

		return !!(
			address.address_line_1 &&
			address.city &&
			address.state &&
			address.zip_code
		);
	};

	const validateContact = (contact: Partial<AddressContactData>): boolean => {
		return !!(contact.phone || contact.email);
	};

	return {
		updateMemberAddressContact,
		validateAddress,
		validateContact,
		isLoading,
	};
};
