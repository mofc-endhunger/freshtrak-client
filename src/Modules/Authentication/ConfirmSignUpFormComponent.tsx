import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from './AuthContext';
import { ConfirmSignUpFormData } from './types/authentication.types';
import localization from '../Localization/LocalizationComponent';

const getConfirmSignUpSchema = () =>
  z.object({
    email: z.string().email(localization.error_valid_email),
    code: z.string().min(6, localization.error_confirmation_code_length),
  });

interface ConfirmSignUpFormComponentProps {
  email?: string;
  onSuccess?: () => void | Promise<void>;
  onError?: (error: string) => void;
  onResendCode?: () => void;
  onBackToSignUp?: () => void;
}

/**
 * ConfirmSignUpFormComponent - Form component for email verification
 *
 * This component provides a form for users to enter their confirmation code
 * after signing up. It includes validation and error handling.
 *
 * @component
 * @param {ConfirmSignUpFormComponentProps} props - Component props
 * @returns {JSX.Element} The confirmation form component
 */
const ConfirmSignUpFormComponent: React.FC<ConfirmSignUpFormComponentProps> = ({
  email = '',
  onSuccess,
  onError,
  onResendCode,
  onBackToSignUp,
}) => {
  const { confirmSignUp, resendConfirmationCode, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConfirmSignUpFormData>({
    resolver: zodResolver(getConfirmSignUpSchema()),
    defaultValues: {
      email,
    },
  });

  const onSubmit = async (data: ConfirmSignUpFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      await confirmSignUp(data.email, data.code);
      reset();
      const result = onSuccess?.();
      if (result instanceof Promise) {
        await result;
      }
    } catch (error: any) {
      console.error('Confirmation error:', error);
      onError?.(error.message || 'Failed to confirm account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    try {
      setIsResending(true);
      const emailValue = (document.getElementById('email') as HTMLInputElement)?.value || email;
      await resendConfirmationCode(emailValue);
      onResendCode?.();
    } catch (error: any) {
      console.error('Resend code error:', error);
      onError?.(error.message || 'Failed to resend confirmation code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">{localization.text_sent_confirmation_code}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{localization.label_email}</Label>
        <Input
          id="email"
          type="email"
          placeholder={localization.placeholder_enter_email_simple}
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">{localization.label_confirmation_code}</Label>
        <Input
          id="code"
          type="text"
          placeholder={localization.placeholder_enter_confirmation_code}
          {...register('code')}
          className={errors.code ? 'border-red-500' : ''}
        />
        {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full bg-primary text-white min-h-12 uppercase"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{localization.text_confirming}</span>
            </div>
          ) : (
            localization.button_confirm_account
          )}
        </Button>

        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResendCode}
            disabled={isResending || isLoading}
            className="w-full"
          >
            {isResending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <span>{localization.text_resending}</span>
              </div>
            ) : (
              localization.button_resend_code
            )}
          </Button>

          {onBackToSignUp && (
            <Button type="button" variant="ghost" onClick={onBackToSignUp} className="w-full">
              {localization.button_back_to_sign_up}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default ConfirmSignUpFormComponent;
