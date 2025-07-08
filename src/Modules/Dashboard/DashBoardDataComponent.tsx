import React from "react";
import { useNavigate } from "react-router-dom";
import SearchComponent from "../General/SearchComponent";
import DashboardCreateAccountComponent from "./DashboardCreateAccountComponent";
import { useForm } from "react-hook-form";
import { DEFAULT_DISTANCE } from "../../Utils/Constants";

interface FormData {
	zip_code: string;
	street?: string;
	lat?: string;
	long?: string;
	distance?: string;
	serviceCat?: string;
}

const DashBoardDataComponent: React.FC = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>();

	const navigate = useNavigate();
	const isFaceBookLoggedIn = localStorage.getItem("isLoggedIn");

	//Flag to turn off/on Home Page Container for Loggedin user feature
	if (isFaceBookLoggedIn === "true") {
		navigate("/home");
	}

	const onSubmit = (data: Partial<FormData>) => {
		let url = `/events/list/`;
		if (data.zip_code) {
			url += data.zip_code + "/";
		}
		if (data.distance) {
			url += data.distance + "/";
		}
		navigate(url);
	};

	return (
		<div className="container pt-150 pb-150">
			<div className="search-area text-left">
				<form onSubmit={handleSubmit(onSubmit)}>
					<SearchComponent
						register={register}
						errors={errors}
						onSubmitHandler={onSubmit}
						range={DEFAULT_DISTANCE}
						enableFilter={false}
					/>
				</form>
			</div>

			<DashboardCreateAccountComponent />
		</div>
	);
};

export default DashBoardDataComponent;
