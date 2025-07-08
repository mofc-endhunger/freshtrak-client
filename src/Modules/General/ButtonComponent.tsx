import React from "react";
import { Button } from "react-bootstrap";

interface ButtonComponentProps {
	type?: "button" | "submit" | "reset";
	name: string;
	dataid?: string | null;
	id?: string;
	value?: string;
	className?: string;
	onClickfunction: () => void;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
	type,
	name,
	dataid = null,
	id,
	value = "Button",
	className,
	onClickfunction,
}) => {
	return (
		<Button
			type={type}
			name={name}
			id={id}
			className={className}
			onClick={onClickfunction}
		>
			{value}
		</Button>
	);
};

export default ButtonComponent;
