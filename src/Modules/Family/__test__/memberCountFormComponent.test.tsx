import React from "react";
import { render, fireEvent } from "@testing-library/react";
import MemberCountFormComponent from "../MemberCountFormComponent";
import { preformattedEventData, noop } from "../../../Testing";

test("should render without error", () => {
	expect(() => {
		render(
			<MemberCountFormComponent
				register={noop as any}
				event={preformattedEventData as any}
				watch={noop as any}
				setValue={noop as any}
			/>
		);
	}).not.toThrow();
});

test("should not allow member count to go below zero", () => {
	const { getByTestId, getByLabelText } = render(
		<MemberCountFormComponent
			register={noop as any}
			event={preformattedEventData as any}
			watch={noop as any}
			setValue={noop as any}
		/>
	);
	const input = getByLabelText(
		"Number of Seniors (" + preformattedEventData.seniorAge + "+)"
	) as HTMLInputElement;
	expect(input.value).toEqual("0");
	fireEvent.click(getByTestId(/count_senior_dec/i));
	expect(input.value).toEqual("0");
	fireEvent.click(getByTestId(/count_senior_inc/i));
	// expect(input.value).toEqual('1');
	// update tests
});
