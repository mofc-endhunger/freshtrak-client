import React, { Fragment } from "react";
import "../../Assets/scss/main.scss";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";

interface EventNearByComponentProps {
	EventList: React.ComponentType<{ filter?: string }>;
}

const EventNearByComponent: React.FC<EventNearByComponentProps> = props => {
	return (
		<Fragment>
			<h2 className="font-weight-bold mt-60">Resource Events</h2>
			<div>
				{/* <div className="events-nearby-header">
          Events Within your area.
        </div> */}
				{/* <div className="events-nearby-header">
          Events Within your area.
        </div> */}
			</div>
			<Accordion defaultActiveKey="0">
				<Card>
					<Card.Header>
						{(Accordion.Button as any)({
							eventKey: "0",
							children: "Events Today",
						})}
						<span role="img" aria-label="emoji">
							👇🏻
						</span>
					</Card.Header>
					<Accordion.Collapse eventKey="0">
						<Card.Body>
							<props.EventList filter="today" />
						</Card.Body>
					</Accordion.Collapse>
				</Card>
				<Card>
					<Card.Header>
						{(Accordion.Button as any)({
							eventKey: "1",
							children: "Events for Next 7 days",
						})}
						<span role="img" aria-label="emoji">
							👇🏻
						</span>
					</Card.Header>
					<Accordion.Collapse eventKey="1">
						<Card.Body>
							<props.EventList filter="week" />
						</Card.Body>
					</Accordion.Collapse>
				</Card>
				<Card>
					<Card.Header>
						{(Accordion.Button as any)({
							eventKey: "2",
							children: "Events for Next 30 days",
						})}
						<span role="img" aria-label="emoji">
							👇🏻
						</span>
					</Card.Header>
					<Accordion.Collapse eventKey="2">
						<Card.Body>
							<props.EventList />
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
		</Fragment>
	);
};

export default EventNearByComponent;
