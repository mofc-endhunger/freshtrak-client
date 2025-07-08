import React from "react";
import FacebookLogin from "react-facebook-login";

interface FacebookResponse {
	status: string;
	name?: string;
	email?: string;
	picture?: {
		data: {
			url: string;
		};
	};
	accessToken?: string;
	userID?: string;
}

interface FacebookLoginComponentProps {
	onFbLogin: (response: FacebookResponse) => void;
}

const FacebookLoginComponent: React.FC<FacebookLoginComponentProps> = ({
	onFbLogin,
}) => {
	const responseFacebook = async (
		response: FacebookResponse
	): Promise<void> => {
		console.log(response);
		if (response.status !== "unknown") {
			onFbLogin(response);
		}
	};

	const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID;

	return (
		<div style={{ width: "100%" }}>
			<FacebookLogin
				appId={FACEBOOK_APP_ID || ""}
				size="small"
				autoLoad={false}
				fields="name,email,picture"
				callback={responseFacebook}
				icon="fa-facebook"
				style={{ width: "100%" }}
			/>
		</div>
	);
};

export default FacebookLoginComponent;
