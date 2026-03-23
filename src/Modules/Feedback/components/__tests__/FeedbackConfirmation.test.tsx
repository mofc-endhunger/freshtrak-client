import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedbackConfirmation from "../FeedbackConfirmation";

jest.mock("../../../Localization/LocalizationComponent", () => ({
	feedback_thank_you_title: "Thank You For Providing Feedback!",
	feedback_thank_you_message:
		"With your help, we can improve your experience and better serve our community.",
	feedback_close: "Close",
}));

describe("FeedbackConfirmation", () => {
	it("does not render content when isOpen is false", () => {
		render(<FeedbackConfirmation isOpen={false} onClose={jest.fn()} />);

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(screen.queryByText("Thank You For Providing Feedback!")).not.toBeInTheDocument();
		expect(screen.queryByText("FreshTrak")).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
	});

	it("renders thank you title and message when open", () => {
		render(<FeedbackConfirmation isOpen={true} onClose={jest.fn()} />);

		expect(screen.getByText("Thank You For Providing Feedback!")).toBeInTheDocument();
		expect(
			screen.getByText(
				"With your help, we can improve your experience and better serve our community."
			)
		).toBeInTheDocument();
	});

	it("renders Close button when open", () => {
		render(<FeedbackConfirmation isOpen={true} onClose={jest.fn()} />);

		expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
	});

	it("calls onClose when Close button is clicked", async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		render(<FeedbackConfirmation isOpen={true} onClose={onClose} />);

		await user.click(screen.getByRole("button", { name: "Close" }));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("renders FreshTrak branding", () => {
		render(<FeedbackConfirmation isOpen={true} onClose={jest.fn()} />);

		expect(screen.getByText("FreshTrak")).toBeInTheDocument();
	});
});
