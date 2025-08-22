import React, { Fragment } from "react";
import localization from "../Localization/LocalizationComponent";
import { MemberCountFormComponentProps } from "./types/family.types";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const MemberCountFormComponent: React.FC<MemberCountFormComponentProps> = ({
	register,
	event,
	watch,
	setValue,
}) => {
	const countSenior = watch("seniors_in_household") || 0;
	const countAdult = watch("adults_in_household") || 0;
	const countKid = watch("children_in_household") || 0;

	const seniorDecrementFunction = (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		e.preventDefault();
		const newCount = countSenior - 1;
		if (newCount >= 0) {
			setValue("seniors_in_household", newCount);
		}
	};

	const seniorIncrementFunction = (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		e.preventDefault();
		const newValue = Number(countSenior) + 1;
		setValue("seniors_in_household", newValue);
	};

	const adultDecrementFunction = (e: React.MouseEvent<HTMLButtonElement>) => {
		const newCount = countAdult - 1;
		e.preventDefault();
		if (newCount >= 0) {
			setValue("adults_in_household", newCount);
		}
	};

	const adultIncrementFunction = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		const newValue = Number(countAdult) + 1;
		setValue("adults_in_household", newValue);
	};

	const kidDecrementFunction = (e: React.MouseEvent<HTMLButtonElement>) => {
		const newCount = countKid - 1;
		e.preventDefault();
		if (newCount >= 0) {
			setValue("children_in_household", newCount);
		}
	};

	const kidIncrementFunction = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		const newValue = Number(countKid) + 1;
		setValue("children_in_household", newValue);
	};

	return (
		<Fragment>
			<div
				className="font-bold mt-2"
				data-testid="member-count-form-component"
			>
				<h2 className="text-2xl font-semibold text-text-color mb-2">
					{localization.register_about_family}
				</h2>
				<div className="text-content-text mb-3 text-xs">
					{localization.family_count}
				</div>

				{/* Seniors Section */}
				<div className="mt-3 pt-1">
					<div className="flex items-center pt-2 pb-2">
						<div className="text-sm font-medium text-text-color min-w-[120px]">
							{localization.seniors} ({event.seniorAge}+)
						</div>
						<div className="flex-grow"></div>
						<Button
							onClick={seniorDecrementFunction}
							data-testid="count_senior_dec"
							variant="outline"
							size="sm"
							className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-text-primary text-white"
							type="button"
							aria-label="Decrease number of seniors"
						>
							<span className="sr-only">
								Decrease number of seniors
							</span>
							<span
								aria-hidden="true"
								className="text-lg font-semibold"
							>
								-
							</span>
						</Button>
						<Label
							className="sr-only"
							htmlFor="seniors_in_household"
						>
							Number of Seniors (60+)
						</Label>
						<Input
							type="text"
							className="w-16 h-8 text-center mx-2 border-none"
							name="seniors_in_household"
							id="seniors_in_household"
							value={countSenior}
							onChange={() => {}}
							{...register("seniors_in_household")}
						/>
						<Button
							onClick={seniorIncrementFunction}
							data-testid="count_senior_inc"
							variant="outline"
							size="sm"
							className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-text-primary text-white"
							aria-label="Increase number of seniors"
						>
							<span className="sr-only">
								Increase number of seniors
							</span>
							<span
								aria-hidden="true"
								className="text-lg font-semibold"
							>
								+
							</span>
						</Button>
					</div>
				</div>

				{/* Adults Section */}
				<div className="flex items-center pt-2 pb-2">
					<div className="text-sm font-medium text-text-color min-w-[120px]">
						{localization.adults} ({event.adultAge}+)
					</div>
					<div className="flex-grow"></div>
					<Button
						onClick={adultDecrementFunction}
						data-testid="count_adult_dec"
						variant="outline"
						size="sm"
						className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-text-primary text-white"
						type="button"
						aria-label="Decrease number of adults"
					>
						<span className="sr-only">
							Decrease number of adults
						</span>
						<span
							aria-hidden="true"
							className="text-lg font-semibold"
						>
							-
						</span>
					</Button>
					<Label className="sr-only" htmlFor="adults_in_household">
						Number of Adults ({event.adultAge}+)
					</Label>
					<Input
						type="text"
						className="w-16 h-8 text-center mx-2 border-none"
						name="adults_in_household"
						id="adults_in_household"
						value={countAdult}
						onChange={() => {}}
						{...register("adults_in_household")}
					/>
					<Button
						onClick={adultIncrementFunction}
						data-testid="count_adult_inc"
						variant="outline"
						size="sm"
						className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-text-primary text-white"
						aria-label="Increase number of adults"
					>
						<span className="sr-only">
							Increase number of Adults
						</span>
						<span
							aria-hidden="true"
							className="text-lg font-semibold"
						>
							+
						</span>
					</Button>
				</div>

				{/* Kids Section */}
				<div className="flex items-center pt-2 pb-2">
					<div className="text-sm font-medium text-text-color min-w-[120px]">
						{localization.kids}
					</div>
					<div className="flex-grow"></div>
					<Button
						onClick={kidDecrementFunction}
						data-testid="count_kid_dec"
						variant="outline"
						size="sm"
						className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-text-primary text-white"
						type="button"
						aria-label="Decrease number of kids"
					>
						<span className="sr-only">Decrease number of kids</span>
						<span
							aria-hidden="true"
							className="text-lg font-semibold"
						>
							-
						</span>
					</Button>
					<Label className="sr-only" htmlFor="children_in_household">
						Number of Kids
					</Label>
					<Input
						type="text"
						className="w-16 h-8 text-center mx-2 border-none"
						name="children_in_household"
						id="children_in_household"
						value={countKid}
						onChange={() => {}}
						{...register("children_in_household")}
					/>
					<Button
						onClick={kidIncrementFunction}
						data-testid="count_kid_inc"
						variant="outline"
						size="sm"
						className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-text-primary text-white"
						aria-label="Increase number of kids"
					>
						<span className="sr-only">Increase number of kids</span>
						<span
							aria-hidden="true"
							className="text-lg font-semibold"
						>
							+
						</span>
					</Button>
				</div>
			</div>
		</Fragment>
	);
};

export default MemberCountFormComponent;
