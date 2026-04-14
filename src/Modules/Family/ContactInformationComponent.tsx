import React, { useEffect } from 'react';
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  UseFormGetValues,
  FieldErrors,
} from 'react-hook-form';
import PhoneInputComponent from './PhoneInputComponent';
import localization from '../Localization/LocalizationComponent';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';

import type { RegistrationFormData } from '../Registration/types/registration.types';

interface ContactInformationComponentProps {
  register: UseFormRegister<RegistrationFormData>;
  errors?: FieldErrors<RegistrationFormData>;
  getValues?: UseFormGetValues<RegistrationFormData>;
  setValue: UseFormSetValue<RegistrationFormData>;
  watch: UseFormWatch<RegistrationFormData>;
  className?: string;
  'data-testid'?: string;
}

const ContactInformationComponent: React.FC<ContactInformationComponentProps> = ({
  register,
  errors = {},
  setValue,
  watch,
  className = '',
  'data-testid': testId = 'contact-information-component',
}) => {
  const showPhonePermissions = !watch('no_phone_number');
  const showEmailPermissions = !watch('no_email');
  const phone = watch('phone') || '';
  const email = watch('email') || '';

  const noPhoneChecked = !!watch('no_phone_number');
  const permissionToTextChecked = !!watch('permission_to_text');
  const noEmailChecked = !!watch('no_email');
  const permissionToEmailChecked = !!watch('permission_to_email');

  const phoneFieldName = 'phone';

  useEffect(() => {
    register('no_phone_number');
    register('permission_to_text');
    register('no_email');
    register('permission_to_email');
  }, [register]);

  return (
    <div className={`space-y-6 ${className} mt-6`} data-testid={testId}>
      <h2 className="text-lg font-semibold text-gray-900">
        {localization.register_how_to_contact}
      </h2>

      {/* Phone Number Section */}
      {showPhonePermissions && (
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            {localization.phone_number}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <PhoneInputComponent
            type="text"
            className={`
							h-[42px] w-full bg-white border-gray-300 rounded-md shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary
							${errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
						`}
            name={phoneFieldName}
            placeholder="(xxx) xxx-xxxx"
            id="phone"
            value={phone}
            onChange={(e: string) => {
              setValue('phone', e, { shouldValidate: true });
            }}
          />
          <input
            type="hidden"
            {...register('phone', {
              required: !watch('no_phone_number')
                ? localization.error_phone_number_required
                : false,
            })}
          />
          {errors.phone && (
            <span className="text-sm text-red-600" data-testid="phone-error">
              {localization.error_field_required}
            </span>
          )}
        </div>
      )}

      {/* No Phone Checkbox */}
      {phone === '' && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="no_phone_number"
            checked={noPhoneChecked}
            onCheckedChange={(checked) =>
              setValue('no_phone_number', !!checked, {
                shouldDirty: true,
              })
            }
          />
          <Label htmlFor="no_phone_number" className="text-sm text-gray-700 font-normal">
            {localization.no_phone}
          </Label>
        </div>
      )}

      {/* Phone Permission Checkbox */}
      {showPhonePermissions && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="permission_to_text"
            checked={permissionToTextChecked}
            onCheckedChange={(checked) =>
              setValue('permission_to_text', !!checked, {
                shouldDirty: true,
              })
            }
          />
          <Label htmlFor="permission_to_text" className="text-sm text-gray-700 font-normal">
            <span data-testid="phone permission">{localization.phone_contact_you}</span>
          </Label>
        </div>
      )}

      {/* Email Section */}
      {showEmailPermissions && (
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {localization.label_email}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            type="email"
            className={`h-[42px] w-full bg-white border-gray-300 rounded-md shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
            id="email"
            autoComplete="off"
            aria-invalid={!!errors.email}
            data-testid="email-input"
            {...register('email', {
              required: !watch('no_email') ? localization.error_email_required : false,
            })}
          />
          <div className="text-sm text-gray-500">
            {localization.label_no_email_question}{' '}
            <a
              href="https://support.google.com/mail/answer/56256"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500 underline"
            >
              {localization.label_get_free_email}
            </a>
          </div>
          {errors.email && (
            <span className="text-sm text-red-600" data-testid="email-error">
              {localization.error_field_required}
            </span>
          )}
        </div>
      )}

      {/* No Email Checkbox */}
      {email === '' && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="no_email"
            checked={noEmailChecked}
            onCheckedChange={(checked) =>
              setValue('no_email', !!checked, {
                shouldDirty: true,
              })
            }
          />
          <Label htmlFor="no_email" className="text-sm text-gray-700 font-normal">
            {localization.no_email}
          </Label>
        </div>
      )}

      {/* Email Permission Checkbox */}
      {showEmailPermissions && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="permission_to_email"
            checked={permissionToEmailChecked}
            onCheckedChange={(checked) =>
              setValue('permission_to_email', !!checked, {
                shouldDirty: true,
              })
            }
          />
          <Label htmlFor="permission_to_email" className="text-sm text-gray-700 font-normal">
            <span data-testid="email permission">{localization.email_contact_you}</span>
          </Label>
        </div>
      )}
    </div>
  );
};

export default ContactInformationComponent;
