import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import StateDropdownComponent from './StateDropdownComponent';
import localization from '../Localization/LocalizationComponent';
import GooglePlacesAutocomplete from '../General/GooglePlacesAutocomplete';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

import type { RegistrationFormData } from '../Registration/types/registration.types';
import type { GooglePlace, GooglePlaceComponent, GooglePlaceAddress } from './types/family.types';

interface AddressComponentProps {
  register: UseFormRegister<RegistrationFormData>;
  watch: UseFormWatch<RegistrationFormData>;
  setValue: UseFormSetValue<RegistrationFormData>;
  errors: FieldErrors<RegistrationFormData>;
  className?: string;
  'data-testid'?: string;
}

const AddressComponent: React.FC<AddressComponentProps> = ({
  register,
  watch,
  setValue,
  errors,
  className = '',
  'data-testid': testId = 'address-component',
}) => {
  const addressLine1 = watch('address_line_1') || '';
  const cityName = watch('city') || '';
  const shortStateName = watch('state') || '';
  const zip = watch('zip_code') || '';

  const handleSelect = async (value: string, place: GooglePlace) => {
    if (place && place.address_components) {
      const destructuredAddress = getDestructured(place.address_components);
      setValue(
        'address_line_1',
        destructuredAddress.street_number !== undefined
          ? `${destructuredAddress.street_number} ${destructuredAddress.route ?? ''}`
          : '',
        { shouldValidate: true },
      );
      setValue('city', destructuredAddress.locality ?? '', { shouldValidate: true });
      setValue('state', destructuredAddress.administrative_area_level_1_short ?? '', {
        shouldValidate: true,
      });
      setValue('zip_code', destructuredAddress.postal_code ?? '', { shouldValidate: true });
    }
  };

  const getDestructured = (address_components: GooglePlaceComponent[]): GooglePlaceAddress => {
    const destructured: GooglePlaceAddress = {};

    address_components.forEach((component) => {
      switch (component['types'][0]) {
        case 'neighborhood':
          destructured['neighborhood'] = component.long_name;
          break;
        case 'street_number':
          destructured['street_number'] = component.long_name;
          break;
        case 'route':
          destructured['route'] = component.short_name;
          break;
        case 'locality':
          destructured['locality'] = component.long_name;
          break;
        case 'administrative_area_level_1':
          destructured['administrative_area_level_1'] = component.long_name;
          destructured['administrative_area_level_1_short'] = component.short_name;
          break;
        case 'country':
          destructured['country'] = component.long_name;
          break;
        case 'postal_code':
          destructured['postal_code'] = component.long_name;
          break;
        default:
          break;
      }
    });
    return destructured;
  };

  const addressFieldName = 'address_line_1';

  return (
    <div className={`space-y-6 ${className}`} data-testid={testId}>
      <h2 className="text-lg font-semibold text-gray-900">
        {localization.register_where_you_live}
      </h2>

      {/* Street Address Field */}
      <div className="space-y-2">
        <Label htmlFor="address_line_1" className="text-sm font-medium text-gray-700">
          {localization.street_address}
          <span className="text-red-500 ">*</span>
        </Label>
        <GooglePlacesAutocomplete
          value={addressLine1}
          onSelect={handleSelect}
          className={`
						"h-[42px] w-full bg-white border-gray-300 rounded-md shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary
						${errors.address_line_1 ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
					`}
          id="address_line_1"
          data-testid="address-line-1-input"
          {...register(addressFieldName, {
            required: true,
          })}
        />
        {errors.address_line_1 && (
          <span className="text-sm text-red-600" data-testid="address-line-1-error">
            {localization.error_field_required}
          </span>
        )}
      </div>

      {/* Address Line 2 Field */}
      <div className="space-y-2">
        <Label htmlFor="address_line_2" className="text-sm font-medium text-gray-700">
          {localization.lot_suite}
        </Label>
        <Input
          type="text"
          className="h-[42px] w-full bg-white border-gray-300 rounded-md shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
          id="address_line_2"
          data-testid="address-line-2-input"
          {...register('address_line_2')}
        />
      </div>

      {/* City, State, Zip Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* City Field */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
            {localization.city}
            <span className="text-red-500 ">*</span>
          </Label>
          <Input
            type="text"
            className={`h-[42px] w-full bg-white border-gray-300 rounded-md shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary ${errors.city ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
            id="city"
            defaultValue={cityName}
            aria-invalid={!!errors.city}
            data-testid="city-input"
            {...register('city', { required: true })}
          />
          {errors.city && (
            <span className="text-sm text-red-600" data-testid="city-error">
              {localization.error_field_required}
            </span>
          )}
        </div>

        {/* State Dropdown */}
        <div>
          <input type="hidden" {...register('state', { required: true })} />
          <StateDropdownComponent
            value={shortStateName}
            onValueChange={(val) =>
              setValue('state', val, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            error={errors?.state ? localization.error_field_required : undefined}
          />
        </div>

        {/* Zip Code Field */}
        <div className="space-y-2">
          <Label htmlFor="zip_code" className="text-sm font-medium text-gray-700">
            {localization.zip_code}
            <span className="text-red-500 ">*</span>
          </Label>
          <Input
            type="text"
            className={`h-[42px] bg-white border-gray-300 rounded-md shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary ${errors.zip_code ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
            defaultValue={zip}
            id="zip_code"
            aria-invalid={!!errors.zip_code}
            data-testid="zip-code-input"
            {...register('zip_code', { required: true })}
          />
          {errors.zip_code && (
            <span className="text-sm text-red-600" data-testid="zip-code-error">
              {localization.error_field_required}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressComponent;
