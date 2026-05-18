import React, { Fragment, useMemo } from 'react';
import localization from '../Localization/LocalizationComponent';
import { MemberCountFormComponentProps } from './types/family.types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const MemberCountFormComponent: React.FC<MemberCountFormComponentProps> = ({
  register,
  event,
  watch,
  setValue,
  existingMembers = [],
  deletedMemberIds = [],
}) => {
  const countSenior = watch('seniors_in_household') || 0;
  const countAdult = watch('adults_in_household') || 0;
  const countKid = watch('children_in_household') || 0;

  // Calculate minimum counts based on existing members (excluding deleted and head of household)
  const existingCounts = useMemo(() => {
    // Calculate age from date of birth
    const calculateAge = (dateOfBirth: string): number => {
      if (!dateOfBirth || dateOfBirth === '1900-01-01') {
        return 0;
      }
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // Determine member category based on age
    const getMemberCategory = (dateOfBirth: string): 'senior' | 'adult' | 'child' | null => {
      const age = calculateAge(dateOfBirth);
      if (age === 0) return null; // Unknown age
      if (age >= 65) return 'senior';
      if (age >= 18) return 'adult';
      return 'child';
    };

    // Filter out deleted members
    const activeMembers = existingMembers.filter(
      (member: any) => !deletedMemberIds.includes(member.id),
    );

    // Count existing members by category (excluding head of household)
    // Include ALL members (even placeholders) to prevent accidental deletion
    let seniors = 0;
    let adults = 0;
    let children = 0;

    activeMembers.forEach((member: any) => {
      // Skip head of household - they are not counted in additional members
      if (member.is_head_of_household === 1) {
        return;
      }

      // Count members with valid date_of_birth to categorize
      if (member.date_of_birth && member.date_of_birth !== '1900-01-01') {
        const category = getMemberCategory(member.date_of_birth);
        if (category === 'senior') seniors++;
        else if (category === 'adult') adults++;
        else if (category === 'child') children++;
      }
    });

    return { seniors, adults, children };
  }, [existingMembers, deletedMemberIds]);

  // Check if decrement should be disabled
  const isSeniorDecrementDisabled = countSenior <= existingCounts.seniors;
  const isAdultDecrementDisabled = countAdult <= existingCounts.adults;
  const isChildDecrementDisabled = countKid <= existingCounts.children;

  const seniorDecrementFunction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newCount = countSenior - 1;
    // Allow decrement only if new count >= existing named members
    if (newCount >= existingCounts.seniors) {
      setValue('seniors_in_household', newCount);
    }
  };

  const seniorIncrementFunction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newValue = Number(countSenior) + 1;
    setValue('seniors_in_household', newValue);
  };

  const adultDecrementFunction = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newCount = countAdult - 1;
    e.preventDefault();
    // Allow decrement only if new count >= existing named members
    if (newCount >= existingCounts.adults) {
      setValue('adults_in_household', newCount);
    }
  };

  const adultIncrementFunction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newValue = Number(countAdult) + 1;
    setValue('adults_in_household', newValue);
  };

  const kidDecrementFunction = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newCount = countKid - 1;
    e.preventDefault();
    // Allow decrement only if new count >= existing named members
    if (newCount >= existingCounts.children) {
      setValue('children_in_household', newCount);
    }
  };

  const kidIncrementFunction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const newValue = Number(countKid) + 1;
    setValue('children_in_household', newValue);
  };

  return (
    <Fragment>
      <div className="font-bold mt-2" data-testid="member-count-form-component">
        <h2 className="text-2xl font-semibold text-text-color mb-2">
          {localization.register_about_family}
        </h2>
        <div className="text-content-text mb-3 text-xs">{localization.family_count}</div>

        {/* Seniors Section */}
        <div className="mt-3 pt-1">
          <div className="flex items-center pt-2 pb-2">
            <div className="text-sm font-medium text-text-color min-w-[120px]">
              {localization.seniors} ({event.seniorAge}+)
            </div>
            <div className="flex-grow"></div>
            <Button
              onClick={seniorDecrementFunction}
              data-testid="count_senior_dec"
              variant="outline"
              size="sm"
              className={`w-8 h-8 rounded-full p-0 flex items-center justify-center ${
                isSeniorDecrementDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-text-primary text-white'
              }`}
              type="button"
              disabled={isSeniorDecrementDisabled}
              aria-label={localization.aria_decrease_seniors}
            >
              <span className="sr-only">{localization.sr_decrease_seniors}</span>
              <span aria-hidden="true" className="text-lg font-semibold">
                -
              </span>
            </Button>
            <Label className="sr-only" htmlFor="seniors_in_household">
              {localization.sr_number_seniors}
            </Label>
            <Input
              type="text"
              className="w-16 h-8 text-center mx-2 border-none"
              name="seniors_in_household"
              id="seniors_in_household"
              data-testid="senior-count-input"
              value={countSenior}
              onChange={() => {}}
              {...register('seniors_in_household')}
            />
            <Button
              onClick={seniorIncrementFunction}
              data-testid="count_senior_inc"
              variant="outline"
              size="sm"
              className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-text-primary text-white"
              aria-label={localization.aria_increase_seniors}
            >
              <span className="sr-only">{localization.sr_increase_seniors}</span>
              <span aria-hidden="true" className="text-lg font-semibold">
                +
              </span>
            </Button>
          </div>
        </div>

        {/* Adults Section */}
        <div className="flex items-center pt-2 pb-2">
          <div className="text-sm font-medium text-text-color min-w-[120px]">
            {localization.adults} ({event.adultAge}+)
          </div>
          <div className="flex-grow"></div>
          <Button
            onClick={adultDecrementFunction}
            data-testid="count_adult_dec"
            variant="outline"
            size="sm"
            className={`w-8 h-8 rounded-full p-0 flex items-center justify-center ${
              isAdultDecrementDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-text-primary text-white'
            }`}
            type="button"
            disabled={isAdultDecrementDisabled}
            aria-label={localization.aria_decrease_adults}
          >
            <span className="sr-only">{localization.sr_decrease_adults}</span>
            <span aria-hidden="true" className="text-lg font-semibold">
              -
            </span>
          </Button>
          <Label className="sr-only" htmlFor="adults_in_household">
            {localization.sr_number_adults}
          </Label>
          <Input
            type="text"
            className="w-16 h-8 text-center mx-2 border-none"
            name="adults_in_household"
            id="adults_in_household"
            data-testid="adult-count-input"
            value={countAdult}
            onChange={() => {}}
            {...register('adults_in_household')}
          />
          <Button
            onClick={adultIncrementFunction}
            data-testid="count_adult_inc"
            variant="outline"
            size="sm"
            className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-text-primary text-white"
            aria-label={localization.aria_increase_adults}
          >
            <span className="sr-only">{localization.sr_increase_adults}</span>
            <span aria-hidden="true" className="text-lg font-semibold">
              +
            </span>
          </Button>
        </div>

        {/* Kids Section */}
        <div className="flex items-center pt-2 pb-2">
          <div className="text-sm font-medium text-text-color min-w-[120px]">
            {localization.kids}
          </div>
          <div className="flex-grow"></div>
          <Button
            onClick={kidDecrementFunction}
            data-testid="count_kid_dec"
            variant="outline"
            size="sm"
            className={`w-8 h-8 rounded-full p-0 flex items-center justify-center ${
              isChildDecrementDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-text-primary text-white'
            }`}
            type="button"
            disabled={isChildDecrementDisabled}
            aria-label={localization.aria_decrease_kids}
          >
            <span className="sr-only">{localization.sr_decrease_kids}</span>
            <span aria-hidden="true" className="text-lg font-semibold">
              -
            </span>
          </Button>
          <Label className="sr-only" htmlFor="children_in_household">
            {localization.sr_number_kids}
          </Label>
          <Input
            type="text"
            className="w-16 h-8 text-center mx-2 border-none"
            name="children_in_household"
            id="children_in_household"
            data-testid="child-count-input"
            value={countKid}
            onChange={() => {}}
            {...register('children_in_household')}
          />
          <Button
            onClick={kidIncrementFunction}
            data-testid="count_kid_inc"
            variant="outline"
            size="sm"
            className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-text-primary text-white"
            aria-label={localization.aria_increase_kids}
          >
            <span className="sr-only">{localization.sr_increase_kids}</span>
            <span aria-hidden="true" className="text-lg font-semibold">
              +
            </span>
          </Button>
        </div>
      </div>
    </Fragment>
  );
};

export default MemberCountFormComponent;
