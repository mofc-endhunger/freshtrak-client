import React from "react";
import { useForm, FieldErrors, UseFormRegister } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SignInFormComponent from "./SignInFormComponent";

interface SignInFormData {
	email: string;
	password: string;
}

const SignInContainer: React.FC = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInFormData>();
	const navigate = useNavigate();
	const onSubmit = (data: SignInFormData) => {
		console.log(data);
		if (data) {
			localStorage.setItem("isLoggedIn", "true");
			navigate(-1);
		}
	};

	return (
		<div className="d-flex justify-content-center">
			<form onSubmit={handleSubmit(onSubmit)} className="sign-in-form">
				<SignInFormComponent register={register} errors={errors} />
				<div className="button-wrap mt-4">
					<button
						type="submit"
						className="btn custom-button"
						data-testid="log in button"
					>
						Log In
					</button>
				</div>
			</form>
		</div>
	);
};

export default SignInContainer;
