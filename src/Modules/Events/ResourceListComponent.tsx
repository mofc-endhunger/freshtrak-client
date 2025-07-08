import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { selectZip } from "../../Store/Search/searchSlice";
import FoodbankTextComponent from "../General/FoodbankTextComponent";
import HouseHoldEligibilityComponent from "../General/HouseHoldEligibilityComponent";

interface FoodbankText {
	show_eligibilty_box: number;
	eligibility_header?: string;
	eligibility_body?: string;
	eligibility_footer?: string;
	text: string;
	image_resource?: string;
	link_href?: string;
	link_text?: string;
}

interface Foodbank {
	name: string;
	address: string;
	city: string;
	state: string;
	zip: string;
	phone: string;
	display_url: string;
	logo: string;
	foodbank_texts: FoodbankText[];
}

interface FoodbankData {
	foodbanks: Foodbank[];
}

interface ResourceListComponentProps {
	dataToChild: FoodbankData;
}

const ResourceListComponent: React.FC<ResourceListComponentProps> = ({
	dataToChild,
}) => {
	const [foodBankArray, setFoodBankArray] = React.useState<
		{ foodbank: Foodbank }[]
	>([]);
	const searchedZip = useSelector(selectZip);

	const foodBankDisplay = (): string => {
		switch (foodBankArray.length) {
			case 0:
				return "No Food Banks found within the zip code";
			case 1:
				return `Food bank serving zip code [${searchedZip}]`;
			default:
				return `Food banks serving zip code [${searchedZip}]`;
		}
	};

	React.useEffect(() => {
		if (dataToChild) {
			const { foodbanks } = dataToChild;
			let foodBankArray = foodbanks.map(foodbank => {
				return { foodbank };
			});
			setFoodBankArray(foodBankArray);
		}
	}, [dataToChild]);

	return (
		<section className="search-results" aria-live="polite">
			<div className="search-list-title">{foodBankDisplay()}</div>
			{foodBankArray.map((value, index) => {
				const {
					foodbank: {
						name,
						address,
						city,
						state,
						zip,
						phone,
						display_url,
						logo,
						foodbank_texts,
					},
				} = value;
				return (
					<div key={index}>
						<div className="row align-items-center mt-2">
							<div className="col-lg-4 col-sm-6">
								<div className="d-flex align-items-center">
									<span className="search-list-logo">
										<img alt="logo" src={logo} />
									</span>
									<span className="font-weight-bold ml-2">
										{name}
									</span>
								</div>
							</div>
							<div className="col-lg-4 col-sm-6 caption-text">
								{address} {city}, {state} {zip}
							</div>
							<div className="col-lg-4 col-sm-6 caption-text">
								<div>{phone}</div>
								<div className="link-wrap">
									<a
										href={display_url}
										target="_blank"
										rel="noopener noreferrer"
									>
										{display_url}
									</a>
								</div>
							</div>
						</div>
						<ul className="list-group">
							{foodbank_texts.map((value, index) => {
								return (
									<li className="list-group-item" key={index}>
										{value.show_eligibilty_box === 1 && (
											<Fragment>
												<HouseHoldEligibilityComponent
													header={
														value.eligibility_header
													}
													body={
														value.eligibility_body
													}
													footer={
														value.eligibility_footer
													}
												/>
												<hr />
											</Fragment>
										)}
										<FoodbankTextComponent
											text={value.text}
											imageUrl={value.image_resource}
											LinkUrl={value.link_href}
											linkText={value.link_text}
										/>
									</li>
								);
							})}
						</ul>
						{/* Out of Scope
          <div className="row mt-2">
              <LinkContainer to={`${RENDER_URL.AGENCY_EVENT_LIST}/${id}`}>
                <Button variant="link">
                  View all of our upcoming distributions
                </Button>
              </LinkContainer>
            </div> */}
					</div>
				);
			})}
		</section>
	);
};

export default ResourceListComponent;
