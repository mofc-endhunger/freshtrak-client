import React from "react";
import PredictIcon from "../../Assets/img/predict.svg";
import ServeFoodIcon from "../../Assets/img/serve-food.svg";
import MoveQuickIcon from "../../Assets/img/move-quick.svg";
import localization from "../Localization/LocalizationComponent";
import { DashBoardFoodBankComponentProps } from "./types/dashboard.types";
import FeatureCard from "./components/FeatureCard";

/**
 * DashBoardFoodBankComponent - Displays information for food bank organizations
 *
 * This component showcases the services and benefits that FreshTrak provides to food banks
 * and organizations. It displays three main service categories using FeatureCard components
 * with localized content support for multiple languages.
 *
 * @component
 * @param {DashBoardFoodBankComponentProps} props - Component props (currently empty for future extensibility)
 * @returns {JSX.Element} The food bank services information section
 *
 * @example
 * ```tsx
 * <DashBoardFoodBankComponent />
 * ```
 */
const DashBoardFoodBankComponent: React.FC<
	DashBoardFoodBankComponentProps
> = () => (
	<div className="container mx-auto px-4 pt-24 pb-24 max-w-7xl">
		<div className="text-center uppercase">
			{localization.for_foodbanks}
		</div>
		<h2 className="my-2 font-bold text-center text-2xl">
			{localization.home_dashboard}
		</h2>
		<p className="text-center caption-text">
			{localization.home_dashboard_org}
		</p>
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5 text-center">
			<FeatureCard
				title={localization.home_before_footer1_header}
				content={localization.home_before_footer1}
				imageUrl={PredictIcon}
				className="border-none shadow-none"
			/>
			<FeatureCard
				title={localization.home_before_footer2_header}
				content={localization.home_before_footer2}
				imageUrl={ServeFoodIcon}
				className="border-none shadow-none"
			/>
			<FeatureCard
				title={localization.home_before_footer3_header}
				content={localization.home_before_footer3}
				imageUrl={MoveQuickIcon}
				className="border-none shadow-none"
			/>
		</div>
	</div>
);

export default DashBoardFoodBankComponent;
