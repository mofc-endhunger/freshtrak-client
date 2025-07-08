import React from "react";
import { render } from "@testing-library/react";
import FoodbankTextComponent from "../FoodbankTextComponent";
import { mockFoodbankText } from "../../../Testing";

test(`should display the fb_texts data`, () => {
	const { getByText } = render(
		<FoodbankTextComponent
			text={mockFoodbankText.text}
			imageUrl={mockFoodbankText.image_resource}
		/>
	);
	getByText(mockFoodbankText.text);
});
