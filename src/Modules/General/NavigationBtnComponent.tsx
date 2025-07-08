/**
 * Button Component - Can be used for back Navigation
 */
import React from "react";
import backBtn from "../../Assets/img/back.svg";
import { useNavigate } from "react-router-dom";

const NavigationBtnComponent: React.FC = () => {
	const navigate = useNavigate();

	return (
		<button
			type="button"
			className="btn back-button"
			onClick={() => navigate(-1)}
		>
			<span className="back-arrow">
				<img aria-hidden="true" alt="Go back" src={backBtn} />
			</span>
			<span className="font-weight-bold text-uppercase ml-2">Back</span>
		</button>
	);
};

export default NavigationBtnComponent;
