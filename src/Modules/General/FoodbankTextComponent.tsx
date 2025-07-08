import React from "react";

interface FoodbankTextComponentProps {
	text?: string;
	imageUrl?: string;
	LinkUrl?: string;
	linkText?: string;
}

const FoodbankTextComponent: React.FC<FoodbankTextComponentProps> = ({
	text = "",
	imageUrl = "",
	LinkUrl = "",
	linkText = "",
}) => {
	return (
		<div className="row align-items-center">
			<div className="col-sm-1 col-md-1 col-lg-1 col-xl-1 item-icon d-flex align-items-center">
				<img alt={text} src={imageUrl} />
			</div>
			<div className="col-sm-8 col-md-8 col-lg-8 col-xl-8 item-details">
				<p>{text}</p>
			</div>
			<div
				style={{ wordWrap: "break-word" }}
				className="col-sm-3 col-md-3 col-lg-3 col-xl-3"
			>
				<a href={LinkUrl} target="_blank" rel="noopener noreferrer">
					{" "}
					{linkText}
				</a>
			</div>
		</div>
	);
};

export default FoodbankTextComponent;
