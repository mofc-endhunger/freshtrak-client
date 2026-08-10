import React, { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import HeaderComponent from '../Header/HeaderComponent';
import AddressComponent from './AddressComponent';
import MemberCountFormComponent from './MemberCountFormComponent';
import PrimaryInfoFormComponent from './PrimaryInfoFormComponent';
import SpinnerComponent from '../General/SpinnerComponent';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';

// Using fake data for now
import { mockFamily } from '../../Testing';

import type { RegistrationFormData } from '../Registration/types/registration.types';

const EditFamilyContainer: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
    watch,
    setValue,
    trigger,
    control,
  } = useForm<RegistrationFormData>();

  const onSubmit = (data: RegistrationFormData) => {
    // Form data processed successfully
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const {
        address_line_1,
        address_line_2,
        city,
        state,
        zip_code,
        first_name,
        last_name,
        middle_name,
        date_of_birth,
        email,
        seniors_in_household,
        children_in_household,
      } = mockFamily;

      reset({
        address_line_1,
        address_line_2,
        city,
        state,
        zip_code,
        first_name,
        last_name,
        middle_name,
        date_of_birth,
        email,
        seniors_in_household: seniors_in_household || 0,
        children_in_household: children_in_household || 0,
      });
      setLoading(false);
    }, 1000);
  }, [reset]);

  return (
    <Fragment>
      <HeaderComponent shortHeader={'navbar-green'} />
      <div className="min-h-screen bg-gray-50">
        <section className="container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Edit Family Information</h1>
              <p className="mt-2 text-gray-600">Update your family's information and preferences</p>
            </div>

            {!loading && (
              <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <AddressComponent
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                  />
                  <PrimaryInfoFormComponent
                    register={register}
                    errors={errors}
                    getValues={getValues}
                    watch={watch}
                    setValue={setValue}
                    trigger={trigger}
                    control={control}
                  />
                  <MemberCountFormComponent
                    register={register}
                    errors={errors}
                    event={{
                      id: '1',
                      acceptReservations: 1,
                    }}
                    watch={() => {}}
                    setValue={() => {}}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      {...register('email', {
                        required: 'Email is required',
                      })}
                      className={cn(
                        'w-full',
                        errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                      )}
                      placeholder="Enter your email address"
                    />
                    <p className="text-sm text-gray-500">
                      No Email?{' '}
                      <a
                        href="https://support.google.com/mail/answer/56256"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Get one free from Google.
                      </a>
                    </p>
                    {errors.email && (
                      <span className="text-sm text-red-600">
                        {errors.email.message || 'This field is required'}
                      </span>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                      data-testid="continue button"
                    >
                      Update Family Information
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {loading && <SpinnerComponent />}
          </div>
        </section>
      </div>
    </Fragment>
  );
};

export default EditFamilyContainer;
