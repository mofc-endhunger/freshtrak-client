import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { selectEvent } from "../../Store/Events/eventSlice";
import { Event, FormData } from "../../types";
import RegistrationHeaderComponent from "../Registration/RegistrationHeaderComponent";
import RegistrationTextComponent from "../Registration/RegistrationTextComponent";
import AddressComponent from "./AddressComponent";
import MemberCountFormComponent from "./MemberCountFormComponent";
import ContactInformationComponent from "./ContactInformationComponent";
import PrimaryInfoFormComponent from "./PrimaryInfoFormComponent";

import "../../Assets/scss/main.scss";

const FamilyContainer: React.FC = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		getValues,
		setValue,
		watch,
	} = useForm<FormData>();
	const event = useSelector(selectEvent) as Event;

	const onSubmit = (data: FormData): void => {
		console.log(data);
	};

	return (
		<Fragment>
			<div className="main-wrapper mt-4">
				<section className="container pt-100 pb-100 register-confirmation">
					<div>
						<RegistrationHeaderComponent event={event} />
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
									getValues={getValues}
								/>
								<AddressComponent
									register={register}
									errors={errors as any}
									watch={watch}
									setValue={setValue}
								/>
								<ContactInformationComponent
									register={register}
									errors={errors as any}
									getValues={getValues}
									watch={watch}
									setValue={setValue}
								/>
								<MemberCountFormComponent
									register={register}
									event={event}
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
