import React from "react";
import PropTypes from "prop-types";

const ButtonComponent = ({
	type = "button",
	name,
	dataid = null,
	id,
	value = "Button",
	className = "",
	onClickfunction,
	variant = "custom", // Add variant prop for button styling
}) => {
	// Button variant mapping to Tailwind classes
	const variantClasses = {
		custom: "bg-secondary text-white px-9 py-3 min-h-12 rounded-lg uppercase text-sm tracking-wide font-bold min-w-55 w-full sm:w-auto",
		default:
			"bg-default-button text-secondary px-9 py-3 min-h-12 rounded-lg uppercase text-sm tracking-wide font-bold min-w-55 w-full sm:w-auto",
		primary:
			"bg-primary text-white px-9 py-3 min-h-12 rounded-lg uppercase text-sm tracking-wide font-bold min-w-55 w-full sm:w-auto",
		search: "bg-secondary text-white px-9 py-3 min-h-12 rounded-lg uppercase text-sm tracking-wide font-bold min-w-55 w-full sm:w-auto mt-2.5 sm:mt-0",
	};

	const baseClasses =
		"border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 hover:opacity-90";
	const buttonClasses = `${variantClasses[variant]} ${baseClasses} ${className}`;

	return (
		<button
			type={type}
			name={name}
			data-id={dataid}
			id={id}
			className={buttonClasses}
			onClick={onClickfunction}
		>
			{value}
		</button>
	);
};

ButtonComponent.propTypes = {
	type: PropTypes.string,
	value: PropTypes.string,
	name: PropTypes.string.isRequired,
	id: PropTypes.string,
	className: PropTypes.string,
	onClickfunction: PropTypes.func.isRequired,
	variant: PropTypes.oneOf(["custom", "default", "primary", "search"]),
};

export default ButtonComponent;
