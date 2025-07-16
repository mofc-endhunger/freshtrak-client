import React, { Fragment } from "react";

const normalizeInput = value => {
	try {
		if (typeof value !== "string" && typeof value !== "number") {
			console.error(
				"[PhoneInputComponent] normalizeInput received invalid value:",
				value,
				typeof value
			);
			return "";
		}
		const strValue = String(value);
		const currentValue = strValue.replace(/[^\d]/g, "");
		const cvLength = currentValue.length;

		if (strValue.length) {
			if (cvLength < 4) return currentValue;
			if (cvLength < 7)
				return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3)}`;
			return `(${currentValue.slice(0, 3)}) ${currentValue.slice(
				3,
				6
			)}-${currentValue.slice(6, 10)}`;
		} else {
			return value;
		}
	} catch (err) {
		console.error("[normalizeInput] Exception:", err, value);
		return "";
	}
};

const PhoneInputComponent = props => {
	const fieldName = props.name;
	const formatPhone = e => {
		const value = e.target.value;
		const updatedPhone = normalizeInput(value);
		props.onChange(updatedPhone);
	};

	return (
		<Fragment>
			<input
				type="text"
				className={props.className}
				name={fieldName}
				placeholder={props.placeholder}
				id={props.id}
				value={normalizeInput(props.value)}
				onChange={e => formatPhone(e)}
			/>
		</Fragment>
	);
};

export default PhoneInputComponent;
