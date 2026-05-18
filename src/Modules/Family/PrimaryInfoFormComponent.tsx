import React, { useEffect } from 'react';
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  UseFormGetValues,
  UseFormTrigger,
  FieldErrors,
} from 'react-hook-form';
import localization from '../Localization/LocalizationComponent';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { validateDobText, formatDateInput } from './utils/dateValidation';
import { getTranslatedLanguageOptions } from '../Localization/languageOptions';

import type { RegistrationFormData } from '../Registration/types/registration.types';

interface PrimaryInfoFormComponentProps {
  register: UseFormRegister<RegistrationFormData>;
  watch: UseFormWatch<RegistrationFormData>;
  setValue: UseFormSetValue<RegistrationFormData>;
  getValues: UseFormGetValues<RegistrationFormData>;
  trigger: UseFormTrigger<RegistrationFormData>;
  errors: FieldErrors<RegistrationFormData>;
  continueHandler?: (values: Partial<RegistrationFormData>) => void;
  className?: string;
  'data-testid'?: string;
  isHouseholdSetup?: boolean;
}

const SUFFIX_NONE_VALUE = 'none';

const PrimaryInfoFormComponent: React.FC<PrimaryInfoFormComponentProps> = ({
  register,
  watch,
  setValue,
  getValues,
  trigger,
  errors,
  continueHandler,
  className = '',
  'data-testid': testId = 'primary-info-form-component',
  isHouseholdSetup = false,
}) => {
  const date_of_birth = watch('date_of_birth') || '';
  const suffixValue = watch('suffix') || '';
  const genderValue = watch('gender') || '';
  const preferredLanguageValue = watch('preferred_language') || '';

  useEffect(() => {
    if (!isHouseholdSetup) return;
    register('preferred_language', { required: true });
  }, [register, isHouseholdSetup]);

  const handleChangeDob = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatDateInput(e.target.value);
    setValue('date_of_birth', formattedValue);
  };

  const handleContinue = async () => {
    const values = getValues();
    const result = await trigger(['first_name', 'last_name', 'date_of_birth', 'gender']);
    if (result && continueHandler) {
      continueHandler(values);
    }
  };

  return (
    <div className={`space-y-6 ${className}`} data-testid={testId}>
      <h2 className="text-lg font-semibold text-highlight">{localization.register_who_are_you}</h2>

      {/* First Name Field */}
      <div className="space-y-2">
        <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
          {localization?.first_name}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          className={`h-[42px] bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary ${errors?.first_name ? 'border-red-500' : ''}`}
          id="first_name"
          aria-invalid={!!errors?.first_name}
          data-testid="first-name-input"
          {...register('first_name', { required: true })}
        />
        {errors?.first_name && (
          <span className="text-sm text-red-600" data-testid="first-name-error">
            {localization.error_first_name_required}
          </span>
        )}
      </div>

      {/* Middle Name Field */}
      <div className="space-y-2">
        <Label htmlFor="middle_name" className="text-sm font-medium text-gray-700">
          {localization.middle_name}
        </Label>
        <Input
          type="text"
          className="h-[42px] bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
          id="middle_name"
          data-testid="middle-name-input"
          {...register('middle_name')}
        />
      </div>

      {/* Last Name Field */}
      <div className="space-y-2">
        <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
          {localization?.last_name}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          className={`h-[42px] bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary ${errors?.last_name ? 'border-red-500' : ''}`}
          id="last_name"
          aria-invalid={!!errors?.last_name}
          data-testid="last-name-input"
          {...register('last_name', { required: true })}
        />
        {errors?.last_name && (
          <span className="text-sm text-red-600" data-testid="last-name-error">
            {localization.error_last_name_required}
          </span>
        )}
      </div>

      {/* Suffix Field */}
      <div className="space-y-2">
        <Label htmlFor="suffix" className="text-sm font-medium text-gray-700">
          {localization.suffix}
        </Label>
        <input type="hidden" {...register('suffix')} />
        <Select
          value={suffixValue || SUFFIX_NONE_VALUE}
          onValueChange={(val) =>
            setValue('suffix', val === SUFFIX_NONE_VALUE ? '' : val, { shouldDirty: true })
          }
        >
          <SelectTrigger
            id="suffix"
            className="w-full bg-white border-gray-300 data-[size=default]:h-[42px] focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
            data-testid="suffix-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value={SUFFIX_NONE_VALUE}>{localization.option_suffix_none}</SelectItem>
            <SelectItem value="Jr">{localization.option_suffix_jr}</SelectItem>
            <SelectItem value="Sr">{localization.option_suffix_sr}</SelectItem>
            <SelectItem value="II">{localization.option_suffix_ii}</SelectItem>
            <SelectItem value="III">{localization.option_suffix_iii}</SelectItem>
            <SelectItem value="IV">{localization.option_suffix_iv}</SelectItem>
            <SelectItem value="V">{localization.option_suffix_v}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date of Birth Field */}
      <div className="space-y-2">
        <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700">
          {localization.dob}
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          type="text"
          className={`h-[42px] bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary ${errors?.date_of_birth ? 'border-red-500' : ''}`}
          id="date_of_birth"
          value={date_of_birth}
          placeholder={localization.placeholder_date_format}
          aria-invalid={!!errors?.date_of_birth}
          data-testid="date-of-birth-input"
          {...register('date_of_birth', {
            validate: validateDobText,
            onChange: handleChangeDob,
          })}
        />
        {errors?.date_of_birth && (
          <span className="text-sm text-red-600" data-testid="date-of-birth-error">
            {String(errors.date_of_birth?.message || localization.error_please_enter_valid_date)}
          </span>
        )}
      </div>

      {/* Gender Field */}
      <div className="space-y-2">
        <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
          {localization?.gender}
          <span className="text-red-500">*</span>
        </Label>
        <input type="hidden" {...register('gender', { required: true })} />
        <Select
          value={genderValue}
          onValueChange={(val) =>
            setValue('gender', val, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
        >
          <SelectTrigger
            id="gender"
            className={`w-full bg-white border-gray-300 data-[size=default]:h-[42px] focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary ${errors?.gender ? 'border-red-500' : ''}`}
            aria-invalid={!!errors?.gender}
            data-testid="gender-select"
          >
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="male">{localization.option_gender_male}</SelectItem>
            <SelectItem value="female">{localization.option_gender_female}</SelectItem>
            <SelectItem value="other">{localization.option_gender_other}</SelectItem>
            <SelectItem value="not_specify">
              {localization.option_gender_prefer_not_to_say}
            </SelectItem>
          </SelectContent>
        </Select>
        {errors?.gender && (
          <span className="text-sm text-red-600" data-testid="gender-error">
            {localization.error_field_required}
          </span>
        )}
      </div>

      {/* Preferred Language (household setup only) */}
      {isHouseholdSetup && (
        <div className="space-y-2">
          <Label htmlFor="preferred_language" className="text-sm font-medium text-gray-700">
            {localization.label_preferred_language || 'Preferred language'}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={preferredLanguageValue}
            onValueChange={(val) =>
              setValue('preferred_language', val, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger
              id="preferred_language"
              className="w-full bg-white border-gray-300 data-[size=default]:h-[42px] focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
              aria-invalid={!!errors?.preferred_language}
              data-testid="preferred-language-select"
            >
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {getTranslatedLanguageOptions().map((opt) => (
                <SelectItem key={opt.id} value={opt.code}>
                  {opt.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.preferred_language && (
            <span className="text-sm text-red-600" data-testid="preferred-language-error">
              {localization.error_please_select_valid_language || 'Please select a language'}
            </span>
          )}
        </div>
      )}

      {/* Continue Button */}
      {!isHouseholdSetup && (
        <div className="flex justify-start pt-4">
          <Button
            type="button"
            onClick={handleContinue}
            variant="highlight"
            data-testid="continue-button"
          >
            {localization.button_continue}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PrimaryInfoFormComponent;
