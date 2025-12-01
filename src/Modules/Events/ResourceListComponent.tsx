import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { selectZip } from "../../Store/Search/searchSlice";
import FoodbankTextComponent from "../General/FoodbankTextComponent";
import HouseHoldEligibilityComponent from "../General/HouseHoldEligibilityComponent";
import localization from "../Localization/LocalizationComponent";

interface FoodbankText {
	text: string;
	image_resource: string;
	link_href: string;
	link_text: string;
	show_eligibilty_box: number;
	eligibility_header?: string;
	eligibility_body?: string;
	eligibility_footer?: string;
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
	foodbank: Foodbank;
}

interface DataToChild {
	foodbanks: Foodbank[];
}

interface ResourceListComponentProps {
	dataToChild: DataToChild | null;
}

const ResourceListComponent: React.FC<ResourceListComponentProps> = ({
	dataToChild,
}) => {
	const [foodBankArray, setFoodBankArray] = React.useState<FoodbankData[]>(
		[]
	);
	const searchedZip = useSelector(selectZip);

	const foodBankDisplay = (): string => {
		switch (foodBankArray.length) {
			case 0:
				return localization.text_no_food_banks_found;
			case 1:
				return localization.text_food_bank_serving_zip_code.replace(
					"{zip}",
					searchedZip || ""
				);
			default:
				return localization.text_food_banks_serving_zip_code.replace(
					"{zip}",
					searchedZip || ""
				);
		}
	};

	React.useEffect(() => {
		if (dataToChild) {
			const { foodbanks } = dataToChild;
			let foodBankArray: FoodbankData[] = foodbanks.map((foodbank) => {
				return { foodbank };
			});
			setFoodBankArray(foodBankArray);
		}
	}, [dataToChild]);

	return (
		<section className="py-5 mt-2.5 text-xs" aria-live="polite">
			<div className="text-[#495057] font-bold text-sm uppercase mb-4">
				{foodBankDisplay()}
			</div>
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
					<div key={index} className="mb-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center mt-2">
							<div className="lg:col-span-1 sm:col-span-1">
								<div className="flex items-center">
									<span className="h-8">
										<img
											alt={
												localization.alt_logo || "logo"
											}
											src={logo}
											className="max-h-full"
										/>
									</span>
									<span className="font-bold ml-2 text-sm">
										{name}
									</span>
								</div>
							</div>
							<div className="lg:col-span-1 sm:col-span-1 font-varela tracking-wider text-xs">
								{address} {city} {state} {zip}
							</div>
							<div className="lg:col-span-1 sm:col-span-1 font-varela tracking-wider text-xs">
								<div>{phone}</div>
								<div className="break-words">
									<a
										href={display_url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 underline"
									>
										{display_url}
									</a>
								</div>
							</div>
						</div>
						<ul className="space-y-2 mt-4">
							{foodbank_texts.map((value, index) => {
								return (
									<li
										className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
										key={index}
									>
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
												<hr className="my-4 border-gray-300" />
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
