import React, { Fragment, forwardRef } from "react";
import localization from "../Localization/LocalizationComponent";
import {
	UseFormRegister,
	UseFormSetValue,
	UseFormWatch,
} from "react-hook-form";

interface FormData {
	seniors_in_household?: number;
	adults_in_household?: number;
	children_in_household?: number;
	license_plate?: string;
	[key: string]: any;
}

interface EventData {
	seniorAge?: number;
	adultAge?: number;
	[key: string]: any;
}

interface MemberCountFormComponentProps {
	register: UseFormRegister<FormData>;
	event: EventData;
	watch: UseFormWatch<FormData>;
	setValue: UseFormSetValue<FormData>;
}

const MemberCountFormComponent = forwardRef<
	HTMLDivElement,
	MemberCountFormComponentProps
>(({ register, event, watch, setValue }, ref) => {
	const countSenior = watch("seniors_in_household") || 0;
	const countAdult = watch("adults_in_household") || 0;
	const countKid = watch("children_in_household") || 0;

	const seniorDecrementFunction = (
		e: React.MouseEvent<HTMLButtonElement>
	): void => {
		e.preventDefault();
		const newCount = countSenior - 1;
		if (newCount >= 0) {
			setValue("seniors_in_household", newCount);
		}
	};

	const seniorIncrementFunction = (
		e: React.MouseEvent<HTMLButtonElement>
	): void => {
		e.preventDefault();
		setValue("seniors_in_household", Number(countSenior) + 1);
	};

	const adultDecrementFunction = (
		e: React.MouseEvent<HTMLButtonElement>
	): void => {
		const newCount = countAdult - 1;
		e.preventDefault();
		if (newCount >= 0) {
			setValue("adults_in_household", newCount);
		}
	};

	const adultIncrementFunction = (
		e: React.MouseEvent<HTMLButtonElement>
	): void => {
		e.preventDefault();
		setValue("adults_in_household", Number(countAdult) + 1);
	};

	const kidDecrementFunction = (
		e: React.MouseEvent<HTMLButtonElement>
	): void => {
		const newCount = countKid - 1;
		e.preventDefault();
		if (newCount >= 0) {
			setValue("children_in_household", newCount);
		}
	};

	const kidIncrementFunction = (
		e: React.MouseEvent<HTMLButtonElement>
	): void => {
		e.preventDefault();
		setValue("children_in_household", Number(countKid) + 1);
	};

	return (
		<Fragment>
			<div className="form-sub-title font-weight-bold mt-2">
				<h2>{localization.register_about_family}</h2>
				{localization.family_count}
				<div className="mt-3 pt-1">
					<div className="d-flex align-items-center pt-2 pb-2">
						<div className="member-age">
							{localization.seniors} ({event.seniorAge}+)
						</div>
						<div className="button-wrap d-flex flex-grow-1"></div>
						<button
							onClick={seniorDecrementFunction}
							data-testid="count_senior_dec"
							className="rounded-button"
							type="button"
						>
							<span className="sr-only">
								Decrease number of seniors
							</span>
							<span aria-hidden="true">-</span>
						</button>
						<label
							className="sr-only"
							htmlFor="seniors_in_household"
						>
							Number of Seniors (60+)
						</label>
						<input
							type="text"
							className="number member-count"
							id="seniors_in_household"
							value={countSenior}
							{...register("seniors_in_household")}
						/>
						<button
							onClick={seniorIncrementFunction}
							data-testid="count_senior_inc"
							className="rounded-button"
						>
							<span className="sr-only">
								Increase number of seniors
							</span>
							<span aria-hidden="true">+</span>
						</button>
					</div>

					<div className="d-flex align-items-center pt-2 pb-2">
						<div className="member-age">
							{localization.adults} ({event.adultAge}+)
						</div>
						<div className="button-wrap d-flex flex-grow-1"></div>
						<button
							onClick={adultDecrementFunction}
							data-testid="count_adult_dec"
							className="rounded-button"
							type="button"
						>
							<span className="sr-only">
								Decrease number of adults
							</span>
							<span aria-hidden="true">-</span>
						</button>
						<label
							className="sr-only"
							htmlFor="adults_in_household"
						>
							Number of Adults ({event.adultAge}+)
						</label>
						<input
							type="text"
							className="number member-count"
							id="adults_in_household"
							value={countAdult}
							{...register("adults_in_household")}
						/>
						<button
							onClick={adultIncrementFunction}
							data-testid="count_adult_inc"
							className="rounded-button"
						>
							<span className="sr-only">
								Increase number of Adults
							</span>
							<span aria-hidden="true">+</span>
						</button>
					</div>

					<div className="d-flex align-items-center pt-2 pb-2">
						<div className="member-age">{localization.kids}</div>
						<div className="button-wrap d-flex flex-grow-1"></div>
						<button
							onClick={kidDecrementFunction}
							data-testid="count_kid_dec"
							className="rounded-button"
							type="button"
						>
							<span className="sr-only">
								Decrease number of kids
							</span>
							<span aria-hidden="true">-</span>
						</button>
						<label
							className="sr-only"
							htmlFor="children_in_household"
						>
							Number of Kids
						</label>
						<input
							type="text"
							className="number member-count"
							id="children_in_household"
							value={countKid}
							{...register("children_in_household")}
						/>
						<button
							onClick={kidIncrementFunction}
							data-testid="count_kid_inc"
							className="rounded-button"
						>
							<span className="sr-only">
								Increase number of kids
							</span>
							<span aria-hidden="true">+</span>
						</button>
					</div>
				</div>
			</div>
			<div className="form-group">
				<label htmlFor="license_plate">
					{localization.license_plate}
				</label>
				<input
					type="text"
					className="form-control"
					id="license_plate"
					{...register("license_plate")}
				/>
				<small>{localization.arrive_disribution}</small>
			</div>
		</Fragment>
	);
});

export default MemberCountFormComponent;
