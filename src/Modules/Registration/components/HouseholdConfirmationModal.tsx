import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogHeader,
} from '../../../components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '../../../components/ui/button';
import HouseholdInfoDisplay from './HouseholdInfoDisplay';
import { HouseholdConfirmationModalProps } from '../types/household-registration.types';
import LoadingSpinner from '../../General/LoadingSpinner';
import localization from '../../Localization/LocalizationComponent';

/**
 * HouseholdConfirmationModal Component
 *
 * Modal that displays household information and asks user to confirm registration
 * using their existing household data or proceed with review/update flow.
 */
const HouseholdConfirmationModal: React.FC<HouseholdConfirmationModalProps> = ({
  isOpen,
  onClose,
  onBackHome,
  onConfirm,
  onReview,
  householdData,
  isLoading,
  selectedSlot,
  error,
}) => {
  // Handle confirm action
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  // Handle review action
  const handleReview = () => {
    if (!isLoading) {
      onReview();
    }
  };

  // Handle close action
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <VisuallyHidden>
        <DialogTitle>
          {localization.dialog_use_household_info_title || 'Use your household information?'}
        </DialogTitle>
        <DialogDescription>
          {localization.dialog_use_household_info_description ||
            'We found household information on your account. Would you like to register using this information?'}
        </DialogDescription>
      </VisuallyHidden>
      <DialogContent
        className="sm:max-w-lg bg-white border border-gray-200"
        showCloseButton={!isLoading}
        data-testid="household-confirmation-modal"
      >
        <DialogHeader>
          <DialogTitle id="household-modal-title" className="text-xl font-semibold text-gray-900">
            {localization.dialog_use_household_info_title || 'Use your household information?'}
          </DialogTitle>
          <DialogDescription id="household-modal-description" className="text-gray-600">
            {localization.dialog_use_household_info_description ||
              'We found household information on your account. Would you like to register using this information?'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4" role="main" aria-live="polite">
          {isLoading ? (
            <div
              className="flex flex-col items-center justify-center py-8 space-y-4"
              role="status"
              aria-label={localization.aria_processing_registration}
            >
              <LoadingSpinner size="medium" />
              <p className="text-sm text-gray-600">
                {localization.loading_processing_registration}
              </p>
            </div>
          ) : error ? (
            <div
              className="bg-red-50 border border-red-200 rounded-md p-4"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {localization.error_title_registration_error || 'Registration Error'}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReview}
                      className="text-red-700 border-red-300 hover:bg-red-50"
                      aria-describedby="error-description"
                    >
                      {localization.button_review_update_instead || 'Review & Update Instead'}
                    </Button>
                    {/* Take back home button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBackHome}
                      className="text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      {localization.button_back_to_home}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : householdData ? (
            <HouseholdInfoDisplay
              householdData={householdData}
              className="bg-gray-50 rounded-lg p-4"
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">
                {localization.text_no_household_info_available ||
                  'No household information available.'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="highlightOutline"
            onClick={handleReview}
            disabled={isLoading}
            className="w-full sm:w-auto bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            data-testid="review-update-button"
            aria-describedby="review-button-description"
          >
            {localization.button_no_review_update || 'No, review & update'}
          </Button>
          <Button
            variant="highlight"
            onClick={handleConfirm}
            disabled={isLoading || !householdData}
            className="w-full sm:w-auto"
            data-testid="confirm-register-button"
            aria-describedby="confirm-button-description"
          >
            {localization.button_yes_register || 'Yes, register'}
          </Button>
        </DialogFooter>

        {/* Hidden descriptions for screen readers */}
        <div id="review-button-description" className="sr-only">
          Navigate to the registration form to review and update your household information before
          registering.
        </div>
        <div id="confirm-button-description" className="sr-only">
          Register immediately using your existing household information.
        </div>
        <div id="error-description" className="sr-only">
          An error occurred during registration. You can review and update your information instead.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HouseholdConfirmationModal;
