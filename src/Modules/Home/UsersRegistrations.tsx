import React, { Fragment } from 'react';

/**
 * UsersRegistrations - Component for displaying user's upcoming event reservations
 *
 * This component has been migrated from JavaScript to TypeScript and from Bootstrap to Tailwind CSS.
 * It displays a grid of event cards showing the user's reserved events.
 *
 * Features:
 * - Responsive grid layout using Tailwind CSS
 * - Type-safe implementation with TypeScript
 * - Integration with EventCardComponent for consistent event display
 * - Mobile-first responsive design
 *
 * Props:
 * - reservedEvents: Array of ReservedEvent objects to display
 */

import EventCardComponent from '../Events/EventCardComponent';
import { UsersRegistrationsProps, ReservedEvent } from './types/home.types';

const UsersRegistrations: React.FC<UsersRegistrationsProps> = (props) => {
  const events: ReservedEvent[] = props.reservedEvents;
  // const [usersReservation,setUsersReservation] = useState();

  return (
    <Fragment>
      <h2 className="font-bold mt-8 sm:mt-12 lg:mt-16 text-lg sm:text-xl lg:text-2xl">
        Your UpComing Reservations
      </h2>
      <div className="space-y-4">
        <div className="mt-3 sm:mt-5">
          <div className="w-full">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-2">
                {events &&
                  events.map((event: ReservedEvent) => (
                    <EventCardComponent key={event.id} event={event} alreadyRegistered={true} />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UsersRegistrations;
