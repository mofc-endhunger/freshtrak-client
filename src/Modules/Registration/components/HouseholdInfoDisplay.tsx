import React from 'react';
import { HouseholdInfoDisplayProps } from '../types/household-registration.types';
import localization from '../../Localization/LocalizationComponent';

const HouseholdInfoDisplay: React.FC<HouseholdInfoDisplayProps> = ({
  householdData,
  className = '',
}) => {
  const { adults = 0, children = 0, seniors = 0 } = householdData.counts ?? {};

  const formatMemberCounts = () => {
    const counts = [];

    if (adults > 0) counts.push(`${adults} ${localization.label_adults}`);
    if (children > 0) counts.push(`${children} ${localization.label_children}`);
    if (seniors > 0) counts.push(`${seniors} ${localization.label_seniors}`);

    return counts.length > 0 ? counts.join(', ') : localization.label_no_members;
  };

  const formatAddress = () => {
    const parts = [
      householdData.address_line_1,
      householdData.address_line_2,
      householdData.city,
      householdData.state,
      householdData.zip_code,
    ].filter(Boolean);

    return parts.join(', ') || localization.label_no_address_provided;
  };

  const formatContactInfo = () => {
    const contact = [];
    if (householdData.phone)
      contact.push(`${localization.label_phone_colon} ${householdData.phone}`);
    if (householdData.email)
      contact.push(`${localization.label_email_colon} ${householdData.email}`);
    return contact.length > 0 ? contact.join(' • ') : localization.label_no_contact_info;
  };

  return (
    <div
      className={`space-y-4 ${className}`}
      data-testid="household-info-display"
      role="region"
      aria-labelledby="household-info-heading"
    >
      <h2 id="household-info-heading" className="sr-only">
        {localization.label_household_members}
      </h2>

      {householdData.name && (
        <div className="border-b border-gray-200 pb-3">
          <h3
            className="text-lg font-semibold text-gray-900"
            data-testid="household-name"
            id="household-name-heading"
          >
            {householdData.name}
          </h3>
        </div>
      )}

      <section className="space-y-2" aria-labelledby="address-heading">
        <h4
          id="address-heading"
          className="text-sm font-medium text-gray-700 uppercase tracking-wide"
        >
          {localization.label_address}
        </h4>
        <p
          className="text-sm text-gray-600"
          data-testid="household-address"
          aria-describedby="address-heading"
        >
          {formatAddress()}
        </p>
      </section>

      <section className="space-y-2" aria-labelledby="members-heading">
        <h4
          id="members-heading"
          className="text-sm font-medium text-gray-700 uppercase tracking-wide"
        >
          {localization.label_household_members}
        </h4>
        <p
          className="text-sm text-gray-600"
          data-testid="household-members"
          aria-describedby="members-heading"
        >
          {formatMemberCounts()}
        </p>
        <p className="text-xs text-gray-500">
          {localization.label_total_members}: {adults + children + seniors}
        </p>
      </section>

      <section className="space-y-2" aria-labelledby="contact-heading">
        <h4
          id="contact-heading"
          className="text-sm font-medium text-gray-700 uppercase tracking-wide"
        >
          {localization.label_contact_information}
        </h4>
        <p
          className="text-sm text-gray-600"
          data-testid="household-contact"
          aria-describedby="contact-heading"
        >
          {formatContactInfo()}
        </p>
      </section>
    </div>
  );
};

export default HouseholdInfoDisplay;
