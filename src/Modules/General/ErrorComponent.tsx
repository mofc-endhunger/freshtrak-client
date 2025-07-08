import React, { Fragment } from "react";
import { RENDER_URL } from "../../Utils/Urls";
import { Link } from "react-router-dom";

interface ErrorItem {
	status: string;
	code: string;
	message: string;
}

interface ErrorData {
	status: string;
	message: string;
	event_date?: ErrorItem[];
}

interface ErrorComponentProps {
	error: ErrorData;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({ error }) => {
	const errors = error.event_date;

	const viewErrors = (): React.ReactElement | null => {
		if (!errors) {
			return (
				<div>
					<h2 className="text-danger text-center mt-5 mb-5 mobile-mb">
						Oops..! page not found
					</h2>
					<h4>
						status: <b> {error.status} </b> <br />
						message: <b> {error.message} </b>
					</h4>
				</div>
			);
		} else if (errors) {
			return (
				<div>
					<h2 className="text-danger mt-5 mb-5 mobile-mb">
						validation errors found on event....!
					</h2>
					{errors &&
						errors.map((error, index) => {
							return (
								<p key={`error-${error.status}`} className="">
									status: <b> {error.code} </b> <br />{" "}
									message: <b> {error.message} </b>
								</p>
							);
						})}
				</div>
			);
		} else {
			return null;
		}
	};

	return (
		<Fragment>
			<div className="mt-4">
				<section className="container pt-100 pb-100 ">
					{viewErrors()}
					<div className="button-wrap mt-4">
						<Link to={RENDER_URL.HOME_URL}>
							<button
								type="submit"
								className="btn custom-button"
								data-testid="continue button"
							>
								Back To Home
							</button>
						</Link>
					</div>
				</section>
			</div>
		</Fragment>
	);
};

export default ErrorComponent;
