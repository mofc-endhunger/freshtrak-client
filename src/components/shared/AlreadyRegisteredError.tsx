/**
 * AlreadyRegisteredError Component
 *
 * Displays a user-friendly message when a user tries to register for an event
 * they're already registered for, with options to navigate back or contact support.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { RENDER_URL } from '../../Utils/Urls';
import localization from '../../Modules/Localization/LocalizationComponent';

interface AlreadyRegisteredErrorProps {
  eventName?: string;
  onBackToHome?: () => void;
}

const AlreadyRegisteredError: React.FC<AlreadyRegisteredErrorProps> = ({
  eventName,
  onBackToHome,
}) => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      navigate(RENDER_URL.ROOT_URL);
    }
  };

  return (
    <div className="container mx-auto my-12 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            {localization.text_already_registered}
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 mb-6">
            {eventName ? (
              <>
                {localization.formatString(
                  localization.text_already_registered_for_named_event,
                  <strong>{eventName}</strong>,
                )}
              </>
            ) : (
              <>{localization.text_already_registered_for_event}</>
            )}
          </p>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 text-center">
              {localization.text_if_mistake_contact_us}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="button"
              variant="highlight"
              onClick={handleBackToHome}
              className="min-w-48"
            >
              {localization.button_back_to_home}
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              {localization.text_need_help_contact}{' '}
              <a
                href="mailto:support@freshtrak.org"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                support@freshtrak.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlreadyRegisteredError;
