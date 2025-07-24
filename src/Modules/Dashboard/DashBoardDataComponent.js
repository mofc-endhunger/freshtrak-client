import React from "react";
import { useNavigate } from "react-router-dom";
import SearchComponent from "../General/SearchComponent";
import DashboardCreateAccountComponent from "./DashboardCreateAccountComponent";
import { useForm } from "react-hook-form";
import { DEFAULT_DISTANCE } from "../../Utils/Constants";

const DashBoardDataComponent = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const navigate = useNavigate();
	// Removed Facebook login logic

	const onSubmit = ({ zip_code, distance }) => {
		let url = `/events/list/`;
		if (zip_code) {
			url += zip_code + "/";
		}
		if (distance) {
			url += distance + "/";
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
