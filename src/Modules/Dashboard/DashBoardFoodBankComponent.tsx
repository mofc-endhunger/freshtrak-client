import React from "react";
import BoxComponent from "../General/BoxComponent";
// import ButtonComponent from '../General/ButtonComponent';
import PredictIcon from "../../Assets/img/predict.svg";
import ServeFoodIcon from "../../Assets/img/serve-food.svg";
import MoveQuickIcon from "../../Assets/img/move-quick.svg";
import localization from "../Localization/LocalizationComponent";

const DashBoardFoodBankComponent: React.FC = () => (
	<div className="container pt-150 pb-150">
		<div className="text-uppercase mobile-text-left text-center">
			{localization.for_foodbanks}
		</div>
		<h2 className="mb-2 font-weight-bold mobile-text-left text-center">
			{localization.home_dashboard}
			{/* Serve More Families */}
		</h2>
		<p className="mobile-text-left text-center caption-text">
			{localization.home_dashboard_org}
			{/* Prepare your organization for the influx of demand for food by
      streamlining registration, planning service windows, and forecasting
      needs. Serve more families—both current and new—in your community. */}
		</p>
		<div className="row mt-5 text-center">
			<BoxComponent
				title={localization.home_before_footer1_header}
				content={localization.home_before_footer1}
				imageUrl={PredictIcon}
				className=""
			/>
			<BoxComponent
				title={localization.home_before_footer2_header}
				content={localization.home_before_footer2}
				imageUrl={ServeFoodIcon}
				className=""
			/>
			<BoxComponent
				title={localization.home_before_footer3_header}
				content={localization.home_before_footer3}
				imageUrl={MoveQuickIcon}
				className=""
			/>
		</div>
		{/* Out of scope */}
		{/* <div className="row mt-5 text-center">
                <div className="col-12">
                    <ButtonComponent type ='button' name="registerfoodbank" dataid= '' id="register-food-bank" value="Register Food Bank" className = 'btn custom-button' onClickfunction={handleClick} />
                </div> 
            </div> */}
	</div>
);

export default DashBoardFoodBankComponent;
