import React from "react";
import FacebookLogin from "@greatsumini/react-facebook-login";

const FacebookLoginComponent = ({ onFbLogin }) => {
	const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID;

	return (
		<div style={{ width: "100%" }}>
			<FacebookLogin
				appId={FACEBOOK_APP_ID}
				onSuccess={response => {
					console.log("Login Success!", response);
					onFbLogin(response);
				}}
				onFail={error => {
					console.log("Login Failed!", error);
				}}
				style={{
					width: "100%",
					padding: "8px",
					borderRadius: "4px",
					background: "#4267b2",
					color: "#fff",
					border: "none",
					fontSize: "16px",
				}}
				children={
					<span
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<i
							className="fa fa-facebook"
							style={{ marginRight: 8 }}
						/>
						Login with Facebook
					</span>
				}
			/>
		</div>
	);
};

export default FacebookLoginComponent;
