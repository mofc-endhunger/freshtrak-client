import React from "react";

interface BoxComponentProps {
	title?: string;
	content?: string | null;
	imageUrl?: string;
	className?: string;
	LinkUrl?: string;
}

const BoxComponent: React.FC<BoxComponentProps> = ({
	title = "",
	content = null,
	imageUrl = "",
	className = "",
	LinkUrl = "",
}) => {
	return (
		<div className="col-12 col-lg-4 col-xl-4">
			<div className="mobile-flex">
				<div className="item-icon">
					<img alt={title} src={imageUrl} />
				</div>
				<div className="item-details">
					<h4>{title}</h4>
					<p>{content}</p>
				</div>
			</div>
		</div>
	);
};

export default BoxComponent;
