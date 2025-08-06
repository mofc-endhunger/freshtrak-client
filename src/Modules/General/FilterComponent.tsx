import React, { forwardRef } from "react";
import { Fragment } from "react";
import localization from "../Localization/LocalizationComponent";
import closeIcon from "../../Assets/img/close.svg";
import funnelIcon from "../../Assets/img/funnel.svg";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

interface ServiceCategory {
	id: number;
	service_category_name: string;
}

interface FilterOption {
	show: boolean;
	defaultValue: string;
	onChangeHandler: (event: { target: { value: string } }) => void;
}

interface ServiceCategoryFilter extends FilterOption {
	data: ServiceCategory[];
}

interface FilterComponentProps {
	distance: FilterOption;
	serviceCat: ServiceCategoryFilter;
	closeFilter: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const FilterComponent = forwardRef<HTMLDivElement, FilterComponentProps>(
	({ distance, serviceCat, closeFilter }, ref) => {
		return (
			<Fragment>
				{(distance.show || serviceCat.show) && (
					<div
						className="border border-[#cbd4dc] rounded-sm p-5 mt-2.5 text-xs"
						ref={ref}
					>
						<div className="flex justify-between items-center">
							<div className="flex items-center">
								<span className=" flex flex-row items-center text-[#495057] font-bold text-sm uppercase">
									<img
										alt="filter"
										className="mr-1 w-4 h-4"
										src={funnelIcon}
									/>
									{localization.refine_your_results}
								</span>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={e => closeFilter(e)}
								className="p-1 h-auto bg-[#392947] hover:bg-[#392947]/90"
							>
								<img
									alt="close filter"
									src={closeIcon}
									className="w-4 h-4"
								/>
							</Button>
						</div>
						<div className="flex flex-col sm:flex-row flex-wrap items-end gap-4 pt-3">
							<div className="w-full sm:flex-1 min-w-0">
								{distance.show && (
									<div className="space-y-2">
										<Label htmlFor="distance">
											{localization.by_distance}
										</Label>
										<Select
											defaultValue={distance.defaultValue}
											onValueChange={value => {
												distance.onChangeHandler({
													target: { value },
												});
											}}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select distance" />
											</SelectTrigger>
											<SelectContent className="bg-white">
												<SelectItem value="All distances">
													All distances
												</SelectItem>
												<SelectItem value="3">
													3 mi
												</SelectItem>
												<SelectItem value="5">
													5 mi
												</SelectItem>
												<SelectItem value="10">
													10 mi
												</SelectItem>
												<SelectItem value="25">
													25 mi
												</SelectItem>
												<SelectItem value="50">
													50 mi
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								)}
							</div>
							<div className="w-full sm:flex-1 min-w-0">
								{serviceCat.show && (
									<div className="space-y-2">
										<Label htmlFor="serviceCat">
											{localization.by_service_catogory}
										</Label>
										<Select
											defaultValue={
												serviceCat.defaultValue
											}
											onValueChange={value => {
												serviceCat.onChangeHandler({
													target: { value },
												});
											}}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="All" />
											</SelectTrigger>
											<SelectContent className="bg-white">
												<SelectItem value="All">
													All
												</SelectItem>
												{serviceCat.data.map(item => (
													<SelectItem
														key={item.id}
														value={
															item.service_category_name
														}
													>
														{
															item.service_category_name
														}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}
							</div>
							<div className="w-full sm:flex-1 min-w-0"></div>
							<div className="w-full sm:flex-1 min-w-0"></div>
						</div>
					</div>
				)}
			</Fragment>
		);
	}
);

FilterComponent.displayName = "FilterComponent";

export default FilterComponent;
