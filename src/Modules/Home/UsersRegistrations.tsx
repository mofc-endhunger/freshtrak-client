import React, { Fragment } from "react";
import "../../Assets/scss/main.scss";
import EventCardComponent from "../Events/EventCardComponent";
import "../../Assets/scss/main.scss";

interface UsersRegistrationsProps {
	reservedEvents?: any[];
}

const UsersRegistrations: React.FC<UsersRegistrationsProps> = props => {
	const events = props.reservedEvents;
	// const [usersReservation,setUsersReservation] = useState();

	return (
		<Fragment>
			<h2 className="font-weight-bold mt-60">
				Your UpComing Reservations
			</h2>
			<div className="search-results-list">
				<div className="row mt-5">
					<div className="col-md-12">
						<div className="day-view">
							<div className="row mt-2">
								{events &&
									events.map((event: any) => (
										<EventCardComponent
											key={event.id}
											event={event}
											alreadyRegistered={true}
										/>
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
