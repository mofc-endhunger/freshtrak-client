/**
 * AlreadyRegisteredPage Component
 *
 * Page component that displays when a user tries to register for an event
 * they're already registered for.
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlreadyRegisteredError } from '../../components/shared';
import { RENDER_URL } from '../../Utils/Urls';

const AlreadyRegisteredPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get event name from location state if available
  const eventName = (location.state as { eventName?: string })?.eventName;

  const handleBackToHome = () => {
    navigate(RENDER_URL.ROOT_URL);
  };

  return <AlreadyRegisteredError eventName={eventName} onBackToHome={handleBackToHome} />;
};

export default AlreadyRegisteredPage;
