import React, { forwardRef } from 'react';
import { Fragment } from 'react';
import localization from '../Localization/LocalizationComponent';
import closeIcon from '../../Assets/img/close.svg';
import funnelIcon from '../../Assets/img/funnel.svg';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';

interface ServiceCategory {
  id: number;
  service_category_name: string;
}

interface FilterOption {
  show: boolean;
  defaultValue: string;
  onChangeHandler: (event: { target: { value: string } }) => void;
}

interface ReservationsFilterOption {
  show: boolean;
  defaultValue: boolean;
  onChangeHandler: (event: { target: { value: boolean } }) => void;
}

interface ServiceCategoryFilter extends FilterOption {
  data: ServiceCategory[];
}

interface FilterComponentProps {
  distance: FilterOption;
  serviceCat: ServiceCategoryFilter;
  availability: FilterOption; // New availability filter for time-based filtering
  reservations: ReservationsFilterOption; // New reservations filter for events that accept reservations
  closeFilter: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const FilterComponent = forwardRef<HTMLDivElement, FilterComponentProps>(
  ({ distance, serviceCat, availability, reservations, closeFilter }, ref) => {
    return (
      <Fragment>
        {(distance.show || serviceCat.show || availability.show || reservations.show) && (
          <div className="border border-[#cbd4dc] rounded-sm p-5 mt-2.5 text-xs" ref={ref}>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className=" flex flex-row items-center text-[#495057] font-bold text-sm uppercase">
                  <img
                    alt={localization.alt_filter || 'filter'}
                    className="mr-1 w-4 h-4"
                    src={funnelIcon}
                  />
                  {localization.refine_your_results}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => closeFilter(e)}
                className="p-1 h-auto bg-[#392947] hover:bg-[#392947]/90"
                data-testid="filter-close"
              >
                <img
                  alt={localization.alt_close_filter || 'close filter'}
                  src={closeIcon}
                  className="w-4 h-4"
                />
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap items-end gap-4 pt-3">
              <div className="w-full sm:flex-1 min-w-0">
                {distance.show && (
                  <div className="space-y-2" data-testid="filter-distance">
                    <Label htmlFor="distance">{localization.by_distance}</Label>
                    <Select
                      defaultValue={distance.defaultValue}
                      onValueChange={(value) => {
                        distance.onChangeHandler({
                          target: { value },
                        });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={localization.placeholder_select_distance} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="All distances">
                          {localization.option_all_distances || 'All distances'}
                        </SelectItem>
                        <SelectItem value="3">3 mi</SelectItem>
                        <SelectItem value="5">5 mi</SelectItem>
                        <SelectItem value="10">10 mi</SelectItem>
                        <SelectItem value="25">25 mi</SelectItem>
                        <SelectItem value="50">50 mi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="w-full sm:flex-1 min-w-0">
                {serviceCat.show && (
                  <div className="space-y-2">
                    <Label htmlFor="serviceCat">{localization.by_service_catogory}</Label>
                    <Select
                      defaultValue={serviceCat.defaultValue}
                      onValueChange={(value) => {
                        serviceCat.onChangeHandler({
                          target: { value },
                        });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={localization.option_sort_all} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="All">{localization.option_sort_all}</SelectItem>
                        {serviceCat.data.map((item) => (
                          <SelectItem key={item.id} value={item.service_category_name}>
                            {item.service_category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="w-full sm:flex-1 min-w-0">
                {availability.show && (
                  <div className="space-y-2" data-testid="filter-availability">
                    <Label htmlFor="availability">{localization.by_availability}</Label>
                    {/* Availability filter dropdown - filters events by time periods */}
                    <Select
                      value={(() => {
                        const val =
                          availability.defaultValue && availability.defaultValue.trim() !== ''
                            ? availability.defaultValue
                            : 'next_7_days';
                        // Map this_week to next_7_days for display
                        return val === 'this_week' ? 'next_7_days' : val;
                      })()}
                      onValueChange={(value) => {
                        // Always use next_7_days instead of this_week
                        const normalizedValue = value === 'this_week' ? 'next_7_days' : value;
                        availability.onChangeHandler({
                          target: { value: normalizedValue },
                        });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={localization.option_sort_all} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="All">{localization.option_sort_all}</SelectItem>
                        <SelectItem value="today">
                          {localization.option_availability_today || 'Today'}
                        </SelectItem>
                        <SelectItem value="tomorrow">
                          {localization.option_availability_tomorrow || 'Tomorrow'}
                        </SelectItem>
                        <SelectItem value="next_7_days">
                          {localization.option_availability_next_7_days || 'Next 7 Days'}
                        </SelectItem>
                        <SelectItem value="next_2_weeks">
                          {localization.option_availability_next_2_weeks || 'Next 2 Weeks'}
                        </SelectItem>
                        <SelectItem value="this_month">
                          {localization.option_availability_this_month || 'This Month'}
                        </SelectItem>
                        <SelectItem value="next_month">
                          {localization.option_availability_next_month || 'Next Month'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="w-full sm:flex-1 min-w-0">
                {reservations.show && (
                  <div className="space-y-2" data-testid="filter-reservations">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="reservations"
                        checked={reservations.defaultValue}
                        onCheckedChange={(checked: boolean) => {
                          reservations.onChangeHandler({
                            target: {
                              value: checked,
                            },
                          });
                        }}
                      />
                      <Label htmlFor="reservations" className="text-sm">
                        {localization.only_reservations}
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
  },
);

FilterComponent.displayName = 'FilterComponent';

export default FilterComponent;
