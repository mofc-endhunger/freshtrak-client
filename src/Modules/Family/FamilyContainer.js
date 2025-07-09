import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { selectEvent } from "../../Store/Events/eventSlice";
import RegistrationHeaderComponent from "../Registration/RegistrationHeaderComponent";
import RegistrationTextComponent from "../Registration/RegistrationTextComponent";
import AddressComponent from "./AddressComponent";
import MemberCountFormComponent from "./MemberCountFormComponent";
import ContactInformationComponent from "./ContactInformationComponent";
import PrimaryInfoFormComponent from "./PrimaryInfoFormComponent";

import "../../Assets/scss/main.scss";

const FamilyContainer = () => {
	const {
		register,
		handleSubmit,
		getValues,
		setValue,
		watch,
		formState: { errors },
	} = useForm();
	const event = useSelector(selectEvent);
	const onSubmit = data => {
		console.log(data);
	};
	return (
		<Fragment>
			<div className="main-wrapper mt-4">
				<section className="container pt-100 pb-100 register-confirmation">
					<div>
						<RegistrationHeaderComponent />
					</div>
					<div className="registration-form">
						<div className="content-wrapper">
							<RegistrationTextComponent event={event} />
							<form onSubmit={handleSubmit(onSubmit)}>
								<PrimaryInfoFormComponent
									register={register}
									errors={errors}
									setValue={setValue}
									watch={watch}
								/>
								<AddressComponent
									register={register}
									errors={errors}
									watch={watch}
									setValue={setValue}
								/>
								<ContactInformationComponent
									register={register}
									errors={errors}
									getValues={getValues}
									watch={watch}
								/>
								<MemberCountFormComponent
									register={register}
									event={event}
									errors={errors}
									watch={watch}
									setValue={setValue}
								/>
								<div className="button-wrap mt-4">
									<button
										type="submit"
										className="btn custom-button"
										data-testid="continue button"
									>
										Continue
									</button>
								</div>
							</form>
						</div>
					</div>
				</section>
			</div>
		</Fragment>
	);
};

export default FamilyContainer;
