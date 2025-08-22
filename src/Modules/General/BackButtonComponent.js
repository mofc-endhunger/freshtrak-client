import React, { Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import back from "../../Assets/img/back.svg";
import "../../Assets/scss/main.scss";

const BackButtonComponent = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const backHome = () => {
		const currentPath = location.pathname;
		const pathParts = currentPath.split("/");
		const hasTimeslotId = pathParts.length === 5; // /register/form/:eventDateId/:timeslotId (5 parts due to leading empty string)

		if (hasTimeslotId) {
			// Extract eventDateId from the URL (it's the 4th part, index 3)
			const eventDateId = pathParts[3];
			navigate(`/register/event/${eventDateId}`);
		} else {
			// If no timeslot ID, extract eventDateId from the 4th part (index 3)
			const eventDateId = pathParts[3];
			navigate(`/register/event/${eventDateId}`);
		}
	};

	return (
		<Fragment>
			<div className="row">
				<div className="col-md-12">
					<button
						type="button"
						className="btn back-button"
						onClick={backHome}
					>
						<span className="back-arrow">
							<img alt="back button" src={back} />
						</span>
						<span className="font-weight-bold text-uppercase ml-2">
							Back
						</span>
					</button>
				</div>
			</div>
		</Fragment>
	);
};

export default BackButtonComponent;
