import React from "react";
import FooterLogoIcon from "../../Assets/img/footer-logo.svg";

const LogoComponent = () => {
	return (
		<div className="w-full lg:w-1/2 xl:w-1/2">
			<div className="h-10">
				<img
					src={FooterLogoIcon}
					alt="Freshtrak Logo"
					className="max-w-full max-h-full"
				/>
			</div>
		</div>
	);
};

export default LogoComponent;
