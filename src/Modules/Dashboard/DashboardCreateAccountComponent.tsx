import React from "react";
import BoxComponent from "../General/BoxComponent";
// import ButtonComponent from '../General/ButtonComponent';
import CalenderIcon from "../../Assets/img/calendar.svg";
// import PreRegisteredIcon from '../../Assets/img/pre-register.svg';
import FindFoodIcon from "../../Assets/img/findfood.svg";
// import { RENDER_URL } from '../../Utils/Urls';
import "../../Assets/scss/main.scss";
import localization from "../Localization/LocalizationComponent";

const DashboardCreateAccountComponent: React.FC = () => {
	// const [lang, setLang] = useState("en");
	// const change = (event) => {
	//   localization.setLanguage(event.target.value);
	//   setLang(event.target.value);
	// }
	return (
		<div>
			<h2 className="mb-5 font-weight-bold mobile-text-left text-center">
				{localization.home_freshtrack}
			</h2>
			<center></center>
			<div className="row text-center justify-content-between">
				<BoxComponent
					title={localization.home_stay}
					content={localization.home_comming_soon}
					imageUrl={CalenderIcon}
					className="stay-up-to-date"
				/>
				{/* Out of scope */}
				{/* <BoxComponent
          title="Pre-Register"
          content="Make a FreshTrak account to stay up to date on local food access events."
          imageUrl={PreRegisteredIcon}
          className="pre-register"
        /> */}
				<BoxComponent
					title={localization.home_findfood}
					content={localization.home_zip_details}
					imageUrl={FindFoodIcon}
					className="find-food"
				/>
			</div>
			{/* Out of scope */}
			{/* <div className="row mt-5 text-center">
        <div className="col-12">
          <ButtonComponent
            type="button"
            name="createAnAccount"
            dataid=""
            id="search-resource"
            value="Create an Account"
            className="btn custom-button"
          />
        </div>
      </div> */}
		</div>
	);
};

export default DashboardCreateAccountComponent;
