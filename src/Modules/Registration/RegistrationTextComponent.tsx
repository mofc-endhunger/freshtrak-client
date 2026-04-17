import * as React from 'react';
import { useState, useEffect } from 'react';
import localization from '../Localization/LocalizationComponent';
import { Event } from './types/registration.types';

interface RegistrationTextComponentProps {
  event: Event;
}

const RegistrationTextComponent: React.FC<RegistrationTextComponentProps> = ({ event }) => {
  const [isRegRequired, setRegRequired] = useState<string>();
  useEffect(() => {
    if (event && event.acceptWalkin) {
      setRegRequired(localization.text_optional);
    } else {
      setRegRequired(localization.text_required);
    }
  }, [event]);

  return (
    <div>
      <div className="max-w-xl">
        <p className="text-xs">
          <span className="font-bold">
            {localization.advance_registration} {isRegRequired}.
          </span>{' '}
          {localization.by_registration}
        </p>
      </div>
    </div>
  );
};

export default RegistrationTextComponent;
