import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AssessmentConfirmation from "../AssessmentConfirmation";

jest.mock("../../../Localization/LocalizationComponent", () => ({
	assessment_whats_next: "What's Next?",
	assessment_confirmation_message:
		"We will use the information collected today to recommend personalized programs that you qualify for.",
	assessment_confirmation_supporting:
		"We will also periodically ask you to fill out other, more detailed, assessments.",
	assessment_close: "Close",
}));

describe("AssessmentConfirmation", () => {
	it("does not render content when isOpen is false", () => {
		render(
			<AssessmentConfirmation isOpen={false} onClose={jest.fn()} />,
		);

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(screen.queryByText("What's Next?")).not.toBeInTheDocument();
	});

	it("renders What's Next title and messages when open", () => {
		render(
			<AssessmentConfirmation isOpen={true} onClose={jest.fn()} />,
		);

		expect(screen.getByText("What's Next?")).toBeInTheDocument();
		expect(
			screen.getByText(
				"We will use the information collected today to recommend personalized programs that you qualify for.",
			),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"We will also periodically ask you to fill out other, more detailed, assessments.",
			),
		).toBeInTheDocument();
	});

	it("renders Close button when open", () => {
		render(
			<AssessmentConfirmation isOpen={true} onClose={jest.fn()} />,
		);

		expect(
			screen.getByRole("button", { name: "Close" }),
		).toBeInTheDocument();
	});

	it("calls onClose when Close button is clicked", async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		render(
			<AssessmentConfirmation isOpen={true} onClose={onClose} />,
		);

		await user.click(screen.getByRole("button", { name: "Close" }));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("renders FreshTrak branding", () => {
		render(
			<AssessmentConfirmation isOpen={true} onClose={jest.fn()} />,
		);

		expect(screen.getByText("FreshTrak")).toBeInTheDocument();
	});
});
