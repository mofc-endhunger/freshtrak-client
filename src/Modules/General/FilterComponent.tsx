import React, { forwardRef } from "react";
import { Fragment } from "react";
import closeIcon from "../../Assets/img/close.svg";
import funnelIcon from "../../Assets/img/funnel.svg";
import localization from "../Localization/LocalizationComponent";

interface DistanceFilter {
	show: boolean;
	defaultValue: string | number;
	onChangeHandler: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface ServiceCategory {
	id: number;
	service_category_name: string;
}

interface ServiceCatFilter {
	show: boolean;
	defaultValue: string;
	data: ServiceCategory[];
	onChangeHandler: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface FilterComponentProps {
	distance: DistanceFilter;
	serviceCat: ServiceCatFilter;
	closeFilter: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const FilterComponent = forwardRef<HTMLDivElement, FilterComponentProps>(
	({ distance, serviceCat, closeFilter }, ref) => {
		return (
			<Fragment>
				{(distance.show || serviceCat.show) && (
					<div className="advance-search-results search-results px-5">
						<div className="row">
							<div className="col-md-12">
								<span className="search-list-title">
									<img
										alt="filter"
										className="pb-1"
										src={funnelIcon}
									/>{" "}
									{localization.refine_your_results}
								</span>
								{/* <span
                  className="day-view-title float-right"
                  onClick={(e) => closeFilter(e)}
                > close</span> */}
								<button
									className="filter-close float-right"
									onClick={e => closeFilter(e)}
								>
									<img alt="close filter" src={closeIcon} />
								</button>
							</div>
						</div>
						<div className=" row align-items-end pt-3">
							<div className="col-sm-3 search-order-1">
								{distance.show && (
									<div className="form-group">
										<label htmlFor="distance">
											{localization.by_distance}
										</label>
										<select
											className={`form-control`}
											name="distance"
											id="distance"
											defaultValue={distance.defaultValue.toString()}
											onChange={e => {
												distance.onChangeHandler(e);
											}}
										>
											<option value=""></option>
											<option value="3">3 mi</option>
											<option value="5">5 mi</option>
											<option value="10">10 mi</option>
											<option value="25">25 mi</option>
											<option value="50">50 mi</option>
										</select>
									</div>
								)}
							</div>
							<div className="col-sm-3 search-order-1">
								{serviceCat.show && (
									<div className="form-group">
										<label htmlFor="distance">
											{localization.by_service_catogory}
										</label>
										<select
											className={`form-control`}
											name="serviceCat"
											id="serviceCat"
											defaultValue={
												serviceCat.defaultValue
											}
											onChange={e => {
												serviceCat.onChangeHandler(e);
											}}
										>
											<option value="">All</option>
											{serviceCat.data.map(item => (
												<option
													key={item.id}
													value={
														item.service_category_name
													}
												>
													{item.service_category_name}
												</option>
											))}
										</select>
									</div>
								)}
							</div>
							<div className="col-sm-3 search-order-1"></div>
							<div className="col-sm-3 search-order-1"></div>
						</div>
					</div>
				)}
			</Fragment>
		);
	}
);

export default FilterComponent;
