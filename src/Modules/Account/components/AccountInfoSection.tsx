/**
 * AccountInfoSection Component
 *
 * Left column of the Account tab displaying "Your Information"
 * with cards for Information, Address, and Contact details.
 * Shows the head of household's information.
 */

import React from 'react';
import InfoCard from './InfoCard';
import { UsersMeResponse } from '../../Households/types/api.types';
import { calculateAgeFromDOB } from '../utils/memberUtils';
import localization from '../../Localization/LocalizationComponent';
import { getSuffixFromId } from '../../Households/utils/householdUtils';

interface AccountInfoSectionProps {
  householdData: UsersMeResponse | null;
}

const AccountInfoSection: React.FC<AccountInfoSectionProps> = ({ householdData }) => {
  // Find head of household from members
  const headOfHousehold = householdData?.members?.find(
    (member: any) => member.is_head_of_household === 1,
  );

  // Format address
  const formatAddress = (): React.ReactNode => {
    if (!householdData) return localization.text_not_available || 'N/A';

    const { address_line_1, address_line_2, city, state, zip_code } = householdData;

    if (!address_line_1 && !city && !state && !zip_code) {
      return localization.text_not_available || 'N/A';
    }

    return (
      <>
        {address_line_1 && <div>{address_line_1}</div>}
        {address_line_2 && <div>{address_line_2}</div>}
        {(city || state || zip_code) && (
          <div>
            {[city, state].filter(Boolean).join(', ')}
            {zip_code && ` ${zip_code}`}
          </div>
        )}
      </>
    );
  };

  // Format contact info
  const formatContact = (): React.ReactNode => {
    const email = householdData?.email;
    const phone = householdData?.phone;

    if (!email && !phone) {
      return localization.text_not_available || 'N/A';
    }

    return (
      <>
        {email && <div>{email}</div>}
        {phone && <div>{phone}</div>}
      </>
    );
  };

  // Get head of household info
  const getHeadOfHouseholdInfo = (): React.ReactNode => {
    if (!headOfHousehold) {
      return localization.text_not_available || 'N/A';
    }

    const fullName = [
      headOfHousehold.first_name,
      headOfHousehold.middle_name,
      headOfHousehold.last_name,
      getSuffixFromId(headOfHousehold.suffix_id),
    ]
      .filter(Boolean)
      .join(' ');

    const dob = headOfHousehold.date_of_birth;

    // Format date of birth for display
    const formattedDOB =
      dob && dob !== '1900-01-01'
        ? new Date(dob).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : null;

    // Convert gender_id to readable label (handle both string and number)
    const getGenderLabel = (genderId: number | string | null): string | null => {
      if (!genderId) return null;
      const id = Number(genderId);
      switch (id) {
        case 1:
          return localization.option_gender_male || 'Male';
        case 2:
          return localization.option_gender_female || 'Female';
        case 3:
          return localization.option_gender_other || 'Other';
        case 4:
          return localization.option_gender_prefer_not_to_say || 'Prefer not to say';
        default:
          return null;
      }
    };

    const gender = getGenderLabel(headOfHousehold.gender_id);

    return (
      <>
        <div>{fullName}</div>
        {formattedDOB && (
          <div>
            {/* formatted DOB and age */}
            {formattedDOB} · {calculateAgeFromDOB(dob)} {localization.label_years_old}
          </div>
        )}
        <div className="capitalize">{gender || localization.text_not_available || 'N/A'}</div>
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <h2 className="font-noto-sans font-semibold text-lg text-gray-900">
        {localization.title_your_information || 'Your Information'}
      </h2>

      {/* Information Card */}
      <InfoCard title={localization.card_title_information || 'Information'}>
        {getHeadOfHouseholdInfo()}
      </InfoCard>

      {/* Address Card */}
      <InfoCard title={localization.card_title_address || 'Address'}>{formatAddress()}</InfoCard>

      {/* Contact Card */}
      <InfoCard title={localization.card_title_contact || 'Contact'}>{formatContact()}</InfoCard>
    </div>
  );
};

export default AccountInfoSection;
