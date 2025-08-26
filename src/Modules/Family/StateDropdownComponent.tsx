import React, { Fragment } from "react";

interface StateDropdownProps {
	register: any;
	errors?: any;
	value?: string;
}

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
				<option value="AK">Alaska</option>
				<option value="AL">Alabama</option>
				<option value="AR">Arkansas</option>
				<option value="AZ">Arizona</option>
				<option value="CA">California</option>
				<option value="CO">Colorado</option>
				<option value="CT">Connecticut</option>
				<option value="DC">District of Columbia</option>
				<option value="DE">Delaware</option>
				<option value="FL">Florida</option>
				<option value="GA">Georgia</option>
				<option value="HI">Hawaii</option>
				<option value="IA">Iowa</option>
				<option value="ID">Idaho</option>
				<option value="IL">Illinois</option>
				<option value="IN">Indiana</option>
				<option value="KS">Kansas</option>
				<option value="KY">Kentucky</option>
				<option value="LA">Louisiana</option>
				<option value="MA">Massachusetts</option>
				<option value="MD">Maryland</option>
				<option value="ME">Maine</option>
				<option value="MI">Michigan</option>
				<option value="MN">Minnesota</option>
				<option value="MO">Missouri</option>
				<option value="MS">Mississippi</option>
				<option value="MT">Montana</option>
				<option value="NC">North Carolina</option>
				<option value="ND">North Dakota</option>
				<option value="NE">Nebraska</option>
				<option value="NH">New Hampshire</option>
				<option value="NJ">New Jersey</option>
				<option value="NM">New Mexico</option>
				<option value="NV">Nevada</option>
				<option value="NY">New York</option>
				<option value="OH">Ohio</option>
				<option value="OK">Oklahoma</option>
				<option value="OR">Oregon</option>
				<option value="PA">Pennsylvania</option>
				<option value="PR">Puerto Rico</option>
				<option value="RI">Rhode Island</option>
				<option value="SC">South Carolina</option>
				<option value="SD">South Dakota</option>
				<option value="TN">Tennessee</option>
				<option value="TX">Texas</option>
				<option value="UT">Utah</option>
				<option value="VA">Virginia</option>
				<option value="VT">Vermont</option>
				<option value="WA">Washington</option>
				<option value="WI">Wisconsin</option>
				<option value="WV">West Virginia</option>
				<option value="WY">Wyoming</option>
			</select>
			{errors?.state && (
				<span className="text-sm text-red-600">
					This field is required
				</span>
			)}
		</div>
	</Fragment>
);

export default StateDropdownComponent;
