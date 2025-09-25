import React, { Fragment } from "react";

/**
 * YourPantriesComponent - Static informational component about user pantries
 *
 * This component has been migrated from JavaScript to TypeScript and from Bootstrap to Tailwind CSS.
 * It displays a simple informational message about user pantries functionality.
 *
 * Features:
 * - Clean, minimal design using Tailwind CSS
 * - Type-safe implementation with TypeScript
 * - Informational content for user guidance
 * - Responsive text styling
 *
 * Note: This component currently displays static content and will be enhanced
 * when the pantry functionality is implemented.
 */

import { YourPantriesComponentProps } from "./types/home.types";

const YourPantriesComponent: React.FC<YourPantriesComponentProps> = () => {
	return (
		<Fragment>
			<h2 className="font-bold text-left">Your Pantries</h2>
			<div className="text-gray-600 mt-4">
				Once you visited a pantry. Your Pantries will populate here!
				Explore the events below to get started!
			</div>
		</Fragment>
	);
};

export default YourPantriesComponent;
