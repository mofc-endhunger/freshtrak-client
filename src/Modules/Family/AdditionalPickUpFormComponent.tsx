import React, { forwardRef, useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import add from "../../Assets/img/add.svg";

interface PickupData {
	pickupInfo: string;
	pickupName: string;
	pickupNumberPlate: string;
}

interface AdditionalPickUpFormProps {
	onSelectedChild: (data: { pickupData: PickupData }) => void;
}

const AdditionalPickUpFormComponent = forwardRef<
	HTMLDivElement,
	AdditionalPickUpFormProps
>(({ onSelectedChild }, ref) => {
	const [pickupInfo, setPickupInfo] = useState<string>("");
	const [pickupName, setPickupName] = useState<string>("");
	const [pickupNumberPlate, setPickupNumberPlate] = useState<string>("");

	const buildAddressForm = (
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		event.preventDefault();
		const { name, value } = event.target;

		switch (name) {
			case "pickup_info":
				setPickupInfo(value);
				break;
			case "vehicle_number_plate":
				setPickupNumberPlate(value);
				break;
			case "pickup_name":
				setPickupName(value);
				break;
			default:
				break;
		}
	};

	const handleChange = () => {
		const data = {
			pickupData: {
				pickupInfo,
				pickupName,
				pickupNumberPlate,
			},
		};
		onSelectedChild(data);
	};

	useEffect(() => {
		handleChange();
	}, [pickupInfo, pickupName, pickupNumberPlate]);

	return (
		<div ref={ref} className="space-y-6 pt-12">
			<div className="text-center md:text-left">
				<h3 className="text-xl font-semibold text-gray-900 mb-2">
					Additional Pickup Information (Optional)
				</h3>
				<p className="text-sm text-gray-600">
					Provide details about who will be picking up your order
				</p>
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<Label
						htmlFor="pickup_type"
						className="text-sm font-medium text-gray-700"
					>
						Who's Picking up?
					</Label>
					<Select onValueChange={value => setPickupInfo(value)}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select pickup person" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="me">Me</SelectItem>
							<SelectItem value="someone_else">
								Someone Else
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label
						htmlFor="pickup_name"
						className="text-sm font-medium text-gray-700"
					>
						Name
					</Label>
					<Input
						type="text"
						id="pickup_name"
						name="pickup_name"
						onChange={buildAddressForm}
						className="w-full"
						placeholder="Enter pickup person's name"
					/>
				</div>

				<div className="space-y-2">
					<Label
						htmlFor="vehicle_number_plate"
						className="text-sm font-medium text-gray-700"
					>
						Vehicle License Plate Number
					</Label>
					<Input
						type="text"
						id="vehicle_number_plate"
						name="vehicle_number_plate"
						onChange={buildAddressForm}
						className="w-full"
						placeholder="Enter vehicle license plate"
					/>
				</div>
			</div>

			<div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
				<img src={add} alt="Add vehicle" className="w-5 h-5" />
				<span className="text-sm font-medium text-gray-700">
					Add a Vehicle
				</span>
			</div>

			<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
				<p className="text-sm text-blue-800">
					Where possible, when you arrive we'll look for your vehicle
					and bring your goods to you. See event details for more
					info.
				</p>
			</div>
		</div>
	);
});

AdditionalPickUpFormComponent.displayName = "AdditionalPickUpFormComponent";

export default AdditionalPickUpFormComponent;
