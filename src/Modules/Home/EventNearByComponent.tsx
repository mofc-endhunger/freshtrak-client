import React, { Fragment, useState } from "react";

import { EventNearByComponentProps } from "./types/home.types";
import localization from "../Localization/LocalizationComponent";

/**
 * EventNearByComponent - Custom accordion component for displaying resource events
 *
 * This component has been migrated from JavaScript to TypeScript and from Bootstrap to Tailwind CSS.
 * It replaces the react-bootstrap Accordion with a custom, accessible implementation.
 *
 * Features:
 * - Custom accordion with single-open behavior (only one section open at a time)
 * - Responsive design using Tailwind CSS
 * - Type-safe implementation with TypeScript
 * - Full accessibility support with ARIA attributes
 * - Smooth animations and transitions
 * - Mobile-first responsive design
 *
 * Props:
 * - EventList: Component to render event lists for different time periods
 */

const EventNearByComponent: React.FC<EventNearByComponentProps> = props => {
	// Single-open behavior to match react-bootstrap Accordion (without alwaysOpen)
	const [activeKey, setActiveKey] = useState<string | null>("0");

	const toggleAccordion = (key: string) => {
		setActiveKey(prev => (prev === key ? null : key)); // Toggle or close if already active
	};

	const isActive = (key: string) => activeKey === key;

	return (
		<Fragment>
			<h2 className="font-bold mt-8 sm:mt-12 lg:mt-[60px]">
				{localization.title_resource_events || "Resource Events"}
			</h2>
			<div className="space-y-4">
				{/* Accordion Item 1: Events Today */}
				<div className="border border-gray-200 rounded-lg overflow-hidden">
					<button
						onClick={() => toggleAccordion("0")}
						className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
						aria-expanded={isActive("0")}
						aria-controls="accordion-content-0"
					>
						<span className="font-medium text-gray-900 text-sm sm:text-base">
							{localization.title_events_today || "Events Today"}
						</span>
						<span
							role="img"
							aria-label={localization.aria_expand_collapse}
							className={`transform transition-transform duration-200 ${
								isActive("0") ? "rotate-180" : ""
							}`}
						>
							👇🏻
						</span>
					</button>
					{isActive("0") && (
						<div
							id="accordion-content-0"
							className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-200"
						>
							<props.EventList filter="today" />
						</div>
					)}
				</div>

				{/* Accordion Item 2: Events for Next 7 days */}
				<div className="border border-gray-200 rounded-lg overflow-hidden">
					<button
						onClick={() => toggleAccordion("1")}
						className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
						aria-expanded={isActive("1")}
						aria-controls="accordion-content-1"
					>
						<span className="font-medium text-gray-900 text-sm sm:text-base">
							{localization.title_events_next_7_days || "Events for Next 7 days"}
						</span>
						<span
							role="img"
							aria-label={localization.aria_expand_collapse}
							className={`transform transition-transform duration-200 ${
								isActive("1") ? "rotate-180" : ""
							}`}
						>
							👇🏻
						</span>
					</button>
					{isActive("1") && (
						<div
							id="accordion-content-1"
							className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-200"
						>
							<props.EventList filter="week" />
						</div>
					)}
				</div>

				{/* Accordion Item 3: Events for Next 30 days */}
				<div className="border border-gray-200 rounded-lg overflow-hidden">
					<button
						onClick={() => toggleAccordion("2")}
						className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
						aria-expanded={isActive("2")}
						aria-controls="accordion-content-2"
					>
						<span className="font-medium text-gray-900 text-sm sm:text-base">
							{localization.title_events_next_30_days || "Events for Next 30 days"}
						</span>
						<span
							role="img"
							aria-label={localization.aria_expand_collapse}
							className={`transform transition-transform duration-200 ${
								isActive("2") ? "rotate-180" : ""
							}`}
						>
							👇🏻
						</span>
					</button>
					{isActive("2") && (
						<div
							id="accordion-content-2"
							className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-200"
						>
							<props.EventList filter="all" />
						</div>
					)}
				</div>
			</div>
		</Fragment>
	);
};

export default EventNearByComponent;
