import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AssessmentContainer from "../AssessmentContainer";

let mockModalState = "form";
const mockSaveProgress = jest.fn();

jest.mock("../components/AssessmentModal", () => {
	return function MockAssessmentModal(props: any) {
		return props.isOpen ? (
			<div data-testid="assessment-modal">
				<button data-testid="close-modal" onClick={props.onClose}>
					Close
				</button>
			</div>
		) : null;
	};
});

jest.mock("../components/AssessmentConfirmation", () => {
	return function MockAssessmentConfirmation(props: any) {
		return props.isOpen ? (
			<div data-testid="assessment-confirmation">
				<button
					data-testid="close-confirmation"
					onClick={props.onClose}
				>
					Close
				</button>
			</div>
		) : null;
	};
});

jest.mock("../context", () => ({
	AssessmentProvider: ({ children }: any) => (
		<div data-testid="assessment-provider">{children}</div>
	),
	useAssessment: () => ({
		modalState: mockModalState,
		saveProgress: mockSaveProgress,
	}),
}));

const defaultProps = {
	isOpen: true,
	onClose: jest.fn(),
};

describe("AssessmentContainer", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockModalState = "form";
	});

	it("returns null when isOpen is false", () => {
		const { container } = render(
			<AssessmentContainer {...defaultProps} isOpen={false} />,
		);

		expect(container.firstChild).toBeNull();
		expect(
			screen.queryByTestId("assessment-modal"),
		).not.toBeInTheDocument();
		expect(
			screen.queryByTestId("assessment-confirmation"),
		).not.toBeInTheDocument();
	});

	it("renders AssessmentModal when isOpen is true", () => {
		render(<AssessmentContainer {...defaultProps} />);

		expect(screen.getByTestId("assessment-modal")).toBeInTheDocument();
	});

	it("does NOT render AssessmentConfirmation initially", () => {
		render(<AssessmentContainer {...defaultProps} />);

		expect(screen.getByTestId("assessment-modal")).toBeInTheDocument();
		expect(
			screen.queryByTestId("assessment-confirmation"),
		).not.toBeInTheDocument();
	});

	it("calls saveProgress and onClose when form is closed", async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		render(<AssessmentContainer {...defaultProps} onClose={onClose} />);

		await user.click(screen.getByTestId("close-modal"));

		expect(mockSaveProgress).toHaveBeenCalledTimes(1);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("calls onSubmitComplete and onClose when confirmation is closed", async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		const onSubmitComplete = jest.fn();
		const { rerender } = render(
			<AssessmentContainer
				{...defaultProps}
				onClose={onClose}
				onSubmitComplete={onSubmitComplete}
			/>,
		);

		await act(async () => {
			mockModalState = "confirmation";
			rerender(
				<AssessmentContainer
					{...defaultProps}
					onClose={onClose}
					onSubmitComplete={onSubmitComplete}
				/>,
			);
		});

		expect(
			screen.getByTestId("assessment-confirmation"),
		).toBeInTheDocument();

		await act(async () => {
			await user.click(screen.getByTestId("close-confirmation"));
		});

		expect(onSubmitComplete).toHaveBeenCalledTimes(1);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("does NOT call onSubmitComplete when form is closed (only on confirmation close)", async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		const onSubmitComplete = jest.fn();
		render(
			<AssessmentContainer
				{...defaultProps}
				onClose={onClose}
				onSubmitComplete={onSubmitComplete}
			/>,
		);

		await user.click(screen.getByTestId("close-modal"));

		expect(onClose).toHaveBeenCalledTimes(1);
		expect(onSubmitComplete).not.toHaveBeenCalled();
	});

	it("wraps content in AssessmentProvider", () => {
		render(<AssessmentContainer {...defaultProps} />);

		expect(
			screen.getByTestId("assessment-provider"),
		).toBeInTheDocument();
	});
});
