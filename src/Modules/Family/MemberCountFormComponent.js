import React, { Fragment } from "react";
import localization from "../Localization/LocalizationComponent";

const MemberCountFormComponent = ({ register, event, watch, setValue }) => {
	const countSenior = watch("seniors_in_household") || 0;
	const countAdult = watch("adults_in_household") || 0;
	const countKid = watch("children_in_household") || 0;

	const seniorDecrementFunction = e => {
		e.preventDefault();
		const newCount = countSenior - 1;
		if (newCount >= 0) {
			setValue("seniors_in_household", newCount);
		}
	};

	const seniorIncrementFunction = e => {
		e.preventDefault();
		const newValue = Number(countSenior) + 1;
		setValue("seniors_in_household", newValue);
	};

	const adultDecrementFunction = e => {
		const newCount = countAdult - 1;
		e.preventDefault();
		if (newCount >= 0) {
			setValue("adults_in_household", newCount);
		}
	};

	const adultIncrementFunction = e => {
		e.preventDefault();
		const newValue = Number(countAdult) + 1;
		setValue("adults_in_household", newValue);
	};

	const kidDecrementFunction = e => {
		const newCount = countKid - 1;
		e.preventDefault();
		if (newCount >= 0) {
			setValue("children_in_household", newCount);
		}
	};

	const kidIncrementFunction = e => {
		e.preventDefault();
		const newValue = Number(countKid) + 1;
		setValue("children_in_household", newValue);
	};

	return (
		<Fragment>
			<h2>{localization.register_family_count}</h2>
			<div className="form-group">
				<label htmlFor="seniors_in_household">
					{localization.seniors}
				</label>
				<div className="input-group">
					<button
						className="btn btn-secondary"
						onClick={seniorDecrementFunction}
					>
						-
					</button>
					<input
						type="number"
						className="form-control"
						name="seniors_in_household"
						id="seniors_in_household"
						value={countSenior}
						readOnly
						{...register("seniors_in_household")}
					/>
					<button
						className="btn btn-secondary"
						onClick={seniorIncrementFunction}
					>
						+
					</button>
				</div>
			</div>
			<div className="form-group">
				<label htmlFor="adults_in_household">
					{localization.adults}
				</label>
				<div className="input-group">
					<button
						className="btn btn-secondary"
						onClick={adultDecrementFunction}
					>
						-
					</button>
					<input
						type="number"
						className="form-control"
						name="adults_in_household"
						id="adults_in_household"
						value={countAdult}
						readOnly
						{...register("adults_in_household")}
					/>
					<button
						className="btn btn-secondary"
						onClick={adultIncrementFunction}
					>
						+
					</button>
				</div>
			</div>
			<div className="form-group">
				<label htmlFor="children_in_household">
					{localization.kids}
				</label>
				<div className="input-group">
					<button
						className="btn btn-secondary"
						onClick={kidDecrementFunction}
					>
						-
					</button>
					<input
						type="number"
						className="form-control"
						name="children_in_household"
						id="children_in_household"
						value={countKid}
						readOnly
						{...register("children_in_household")}
					/>
					<button
						className="btn btn-secondary"
						onClick={kidIncrementFunction}
					>
						+
					</button>
				</div>
			</div>
		</Fragment>
	);
};

export default MemberCountFormComponent;
