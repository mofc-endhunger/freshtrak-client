import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AssessmentModal from "../AssessmentModal";

const mockSubmitAssessment = jest.fn().mockResolvedValue(true);
const mockReload = jest.fn();
const mockGoToNextSection = jest.fn();
const mockSkipSection = jest.fn();
const mockSetQuestionResponse = jest.fn();

let mockContextValue: any = {};

jest.mock("../../context", () => ({
	useAssessment: () => mockContextValue,
}));

jest.mock("../../../Feedback/components/QuestionnaireRenderer", () => {
	return function MockQuestionnaireRenderer() {
		return <div data-testid="questionnaire-renderer" />;
	};
});

jest.mock("../../../Localization/LocalizationComponent", () => ({
	assessment_title: "Enrollment Assessment",
	assessment_description: "Please complete the following assessment.",
	assessment_error_generic: "An error occurred",
	assessment_no_questions: "No questions available for this assessment.",
	assessment_already_submitted: "You have already completed this assessment.",
	assessment_close: "Close",
	assessment_submitting: "Submitting...",
	assessment_submit: "Submit",
	assessment_next: "Next",
	assessment_skip: "Skip",
	button_try_again: "Try Again",
}));

const baseContext = {
	bundle: null,
	questions: [],
	sections: [
		{
			id: 1,
			order: 0,
			title: "Section 1",
			questions: [
				{
					id: 1,
					type: "free_text",
					prompt: "Q1",
					order: 1,
					section_id: 1,
					required: false,
					options: [],
					answerType: { id: 1, name: "Free Text", code: "free_text" },
				},
			],
		},
	],
	surveyTitle: "Test Assessment",
	formState: { responses: new Map() },
	modalState: "form" as const,
	currentSectionIndex: 0,
	totalSections: 1,
	canSubmit: true,
	error: null,
	setQuestionResponse: mockSetQuestionResponse,
	submitAssessment: mockSubmitAssessment,
	saveProgress: jest.fn(),
	resetForm: jest.fn(),
	clearError: jest.fn(),
	reload: mockReload,
	goToNextSection: mockGoToNextSection,
	skipSection: mockSkipSection,
};

describe("AssessmentModal", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockContextValue = { ...baseContext, modalState: "form" };
	});

	it("does not render when isOpen is false", () => {
		render(
			<AssessmentModal isOpen={false} onClose={jest.fn()} />,
		);

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("renders loading state", () => {
		mockContextValue = { ...baseContext, modalState: "loading" };
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("renders error state with retry button", async () => {
		const user = userEvent.setup();
		mockContextValue = {
			...baseContext,
			modalState: "error",
			error: "Something went wrong",
		};
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Try Again" }));
		expect(mockReload).toHaveBeenCalledTimes(1);
	});

	it("renders no_survey_found state", () => {
		mockContextValue = { ...baseContext, modalState: "no_survey_found" };
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		expect(
			screen.getByText("No questions available for this assessment."),
		).toBeInTheDocument();
	});

	it("renders already_submitted state", () => {
		mockContextValue = {
			...baseContext,
			modalState: "already_submitted",
		};
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		expect(
			screen.getByText("You have already completed this assessment."),
		).toBeInTheDocument();
	});

	it("renders form with questionnaire renderer", () => {
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		expect(
			screen.getByTestId("questionnaire-renderer"),
		).toBeInTheDocument();
	});

	it("shows Submit button on last section", () => {
		mockContextValue = {
			...baseContext,
			currentSectionIndex: 0,
			totalSections: 1,
		};
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		expect(
			screen.getByTestId("assessment-next-btn"),
		).toHaveTextContent("Submit");
	});

	it("shows Next button when not on last section", () => {
		mockContextValue = {
			...baseContext,
			currentSectionIndex: 0,
			totalSections: 3,
		};
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		expect(
			screen.getByTestId("assessment-next-btn"),
		).toHaveTextContent("Next");
	});

	it("shows Skip button", () => {
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		expect(screen.getByTestId("assessment-skip-btn")).toBeInTheDocument();
	});

	it("calls submitAssessment when clicking Submit on last section", async () => {
		const user = userEvent.setup();
		mockContextValue = {
			...baseContext,
			currentSectionIndex: 0,
			totalSections: 1,
		};
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		await user.click(screen.getByTestId("assessment-next-btn"));
		expect(mockSubmitAssessment).toHaveBeenCalledTimes(1);
	});

	it("calls goToNextSection when clicking Next on non-last section", async () => {
		const user = userEvent.setup();
		mockContextValue = {
			...baseContext,
			currentSectionIndex: 0,
			totalSections: 3,
		};
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		await user.click(screen.getByTestId("assessment-next-btn"));
		expect(mockGoToNextSection).toHaveBeenCalledTimes(1);
	});

	it("calls skipSection when clicking Skip on non-last section", async () => {
		const user = userEvent.setup();
		mockContextValue = {
			...baseContext,
			currentSectionIndex: 0,
			totalSections: 3,
		};
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		await user.click(screen.getByTestId("assessment-skip-btn"));
		expect(mockSkipSection).toHaveBeenCalledTimes(1);
	});

	it("renders section title when available", () => {
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		expect(screen.getByText("Section 1")).toBeInTheDocument();
	});

	it("renders progress bar for multi-section survey", () => {
		mockContextValue = {
			...baseContext,
			currentSectionIndex: 1,
			totalSections: 3,
		};
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		expect(screen.getByTestId("assessment-form")).toBeInTheDocument();
	});

	it("renders the dialog header with title", () => {
		render(
			<AssessmentModal isOpen={true} onClose={jest.fn()} />,
		);

		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});
});
