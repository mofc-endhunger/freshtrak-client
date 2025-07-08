import React from "react";
import MainHeadingComponent from "../General/MainHeadingComponent";
import NavigationBtnComponent from "../General/NavigationBtnComponent";
import "../../Assets/scss/main.scss";
import BoxComponent from "../General/BoxComponent";
import PredictIcon from "../../Assets/img/predict.svg";
import ServeFoodIcon from "../../Assets/img/serve-food.svg";
import MoveQuickIcon from "../../Assets/img/move-quick.svg";
import ExpectImage from "../../Assets/img/freshTrak.jpg";
import ExpectImageMobile from "../../Assets/img/freshTrak-mobile.jpg";

const WorkingWithFreshTrakComponent: React.FC = () => {
	return (
		<React.Fragment>
			<section>
				<div className="container pt-100 pb-100 register-confirmation">
					<div className="row d-none-xs">
						<div className="col-md-12">
							<NavigationBtnComponent />
						</div>
					</div>
					<div className="row">
						<div className="col-12">
							<MainHeadingComponent text="Partners in Ending Hunger" />
						</div>
					</div>
					<div className="row mt-3">
						<div className="col-12">
							<div className="mb-2 medium-title font-weight-bold">
								Because no one should go hungry.
							</div>
							<div className="mobile-text-left caption-text">
								<p>
									Through the Feeding America network of 200
									foodbanks we've been working on a national
									scale to learn, share, and organize in an
									effort to get meals to as many hungry
									families as possible.
								</p>
								<p>
									With FreshTrak, we're looking to leverage
									our experience to create a tool that feeds
									families faster, more securely, with
									solutions that fit their unique challenges.
									This new tool is designed for food banks to
									do the work that we do, while leveraging our
									collective power to help get meals where
									they are needed the most.
								</p>
								<p>
									When you register with FreshTrak, you'll get
									access to reporting that helps you know
									where to distribute your food, what sort of
									resources to provide your community, and
									reduce wait times at your events by
									pre-registering recipients ahead of time.
								</p>
							</div>
						</div>
					</div>
				</div>
				<div className="info-banner">
					<img
						src={ExpectImage}
						alt="Shopping at store"
						className="img-fluid desktop-view"
					/>
					<img
						src={ExpectImageMobile}
						alt="Shopping at store"
						className="img-fluid mobile-view"
					/>
				</div>
			</section>
			<section className="gray-bg">
				<div className="container pt-150 pb-150">
					<div className="row mt-5 text-center">
						<BoxComponent
							title="Predict Need"
							content="Register neighbors ahead of time or,where possible, schedule a pick-up appointment, your organization can plan for any increase in demand."
							imageUrl={PredictIcon}
							className=""
						/>
						<BoxComponent
							title="Serve Food"
							content={
								'You post food access "events" in your community—anything from daily pantry hours to pop-up food events—and neighbors enter their zip code to get connected to them.'
							}
							imageUrl={ServeFoodIcon}
							className=""
						/>
						<BoxComponent
							title="Move Quickly"
							content="Remove the bottleneck from distribution with online customer pre-registration. Serve more customers, safely!"
							imageUrl={MoveQuickIcon}
							className=""
						/>
					</div>
				</div>
			</section>
			<div className="container pt-100 pb-100 register-confirmation">
				<div className="row">
					<div className="col-12">
						<p className="mobile-text-left caption-text">
							We all share a common cause and commitment to our
							local communities. FreshTrak is purpose built as a
							tool to aid in that mission.
						</p>
					</div>
				</div>
				<div className="row mt-5 text-center">
					<div className="col-12">
						{/* Out of Scope */}
						{/* No action event specified for button. onClickfunction is specified as it is mandatory */}
						{/* <ButtonComponent type='button' name="findFood" dataid='' id="find-food" value="Find Food In Your Area" className='btn custom-button' onClickfunction={()=>{}}/> */}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default WorkingWithFreshTrakComponent;
