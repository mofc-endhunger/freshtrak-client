import React, { Fragment } from "react";
import localization from "../Localization/LocalizationComponent";

interface StateDropdownProps {
	register: any;
	errors?: any;
	value?: string;
}

// Mapping of state codes to localization keys
const STATE_LOCALIZATION_MAP: Record<string, string> = {
	AK: localization.option_state_alaska,
	AL: localization.option_state_alabama,
	AR: localization.option_state_arkansas,
	AZ: localization.option_state_arizona,
	CA: localization.option_state_california,
	CO: localization.option_state_colorado,
	CT: localization.option_state_connecticut,
	DC: localization.option_state_district_of_columbia,
	DE: localization.option_state_delaware,
	FL: localization.option_state_florida,
	GA: localization.option_state_georgia,
	HI: localization.option_state_hawaii,
	IA: localization.option_state_iowa,
	ID: localization.option_state_idaho,
	IL: localization.option_state_illinois,
	IN: localization.option_state_indiana,
	KS: localization.option_state_kansas,
	KY: localization.option_state_kentucky,
	LA: localization.option_state_louisiana,
	MA: localization.option_state_massachusetts,
	MD: localization.option_state_maryland,
	ME: localization.option_state_maine,
	MI: localization.option_state_michigan,
	MN: localization.option_state_minnesota,
	MO: localization.option_state_missouri,
	MS: localization.option_state_mississippi,
	MT: localization.option_state_montana,
	NC: localization.option_state_north_carolina,
	ND: localization.option_state_north_dakota,
	NE: localization.option_state_nebraska,
	NH: localization.option_state_new_hampshire,
	NJ: localization.option_state_new_jersey,
	NM: localization.option_state_new_mexico,
	NV: localization.option_state_nevada,
	NY: localization.option_state_new_york,
	OH: localization.option_state_ohio,
	OK: localization.option_state_oklahoma,
	OR: localization.option_state_oregon,
	PA: localization.option_state_pennsylvania,
	PR: localization.option_state_puerto_rico,
	RI: localization.option_state_rhode_island,
	SC: localization.option_state_south_carolina,
	SD: localization.option_state_south_dakota,
	TN: localization.option_state_tennessee,
	TX: localization.option_state_texas,
	UT: localization.option_state_utah,
	VA: localization.option_state_virginia,
	VT: localization.option_state_vermont,
	WA: localization.option_state_washington,
	WI: localization.option_state_wisconsin,
	WV: localization.option_state_west_virginia,
	WY: localization.option_state_wyoming,
};

const StateDropdownComponent: React.FC<StateDropdownProps> = ({
	register,
	errors = {},
	value,
}) => (
	<Fragment>
		<div className="ml-2 space-y-2">
			<label
				htmlFor="state"
				className="block text-sm font-medium text-gray-700"
			>
				State<span className="text-red-500 ml-1">*</span>
			</label>
			<select
				className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
					errors?.state
						? "border-red-500 focus:ring-red-500 focus:border-red-500"
						: "border-gray-300"
				}`}
				id="state"
				name="state"
				defaultValue={value}
				{...register("state", { required: true })}
			>
				<option value=""></option>
				{Object.entries(STATE_LOCALIZATION_MAP).map(([code, label]) => (
					<option key={code} value={code}>
						{label}
					</option>
				))}
			</select>
			{errors?.state && (
				<span className="text-sm text-red-600">
					{localization.error_field_required}
				</span>
			)}
		</div>
	</Fragment>
);

export default StateDropdownComponent;
