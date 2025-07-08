import React, { Fragment } from "react";
import { UseFormRegister } from "react-hook-form";

interface FormData {
	phone?: string;
	[key: string]: any;
}

interface PhoneInputComponentProps {
	type?: string;
	className?: string;
	name?: string;
	placeholder?: string;
	id?: string;
	value?: string;
	onChange: (value: string) => void;
	register: UseFormRegister<FormData>;
}

const PhoneInputComponent: React.FC<PhoneInputComponentProps> = props => {
	const normalizeInput = (value: string): string => {
		if (!value) return value;
		const currentValue = value.replace(/[^\d]/g, "");
		const cvLength = currentValue.length;

		if (value.length) {
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
	};

	const formatPhone = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const value = e.target.value;
		const updatedPhone = normalizeInput(value);
		props.onChange(updatedPhone);
	};

	return (
		<Fragment>
			<input
				type="text"
				className={props.className}
				placeholder={props.placeholder}
				id={props.id}
				value={props.value}
				{...props.register("phone", {
					validate: (value: string | undefined) =>
						(value || "").length >= 14,
				})}
			/>
		</Fragment>
	);
};

export default PhoneInputComponent;
