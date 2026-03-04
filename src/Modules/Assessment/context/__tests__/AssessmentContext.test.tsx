import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AssessmentProvider, useAssessment } from "../AssessmentContext";

const mockGetClientBundle = jest.fn();
const mockSubmitSurvey = jest.fn();

jest.mock("../../../../Services/AssessmentApiService", () => ({
	assessmentApiService: {
		getClientBundle: (...args: any[]) => mockGetClientBundle(...args),
		submitSurvey: (...args: any[]) => mockSubmitSurvey(...args),
	},
}));

jest.mock("react-redux", () => ({
	useSelector: () => "en",
}));

jest.mock("../../../Localization/languageOptions", () => ({
	getLanguageOptionByCode: () => ({ id: 1, code: "en" }),
}));

const mockBundleResponse = {
	has_active: true,
	survey: {
		id: 1,
		title: "Test Assessment",
		language_id: 1,
		questions: [
			{
				id: 10,
				type: "free_text",
				prompt: "Question 1",
				order: 1,
				section_id: null,
				required: false,
				options: [],
				answerType: { id: 1, name: "Free Text", code: "free_text" },
			},
			{
				id: 20,
				type: "free_text",
				prompt: "Question 2",
				order: 2,
				section_id: null,
				required: true,
				options: [],
				answerType: { id: 1, name: "Free Text", code: "free_text" },
			},
		],
		sections: [],
		previous_responses: [],
	},
	trigger: { id: 5, type: "manual" },
	progress: { family_id: 0, status: "new", next_section_id: null },
	engine: { survey_id: 1, language_id: 1, sections: [], questions: [], questionsById: {}, optionsByQuestionId: {}, rules: { skipLogic: [], requiredByQuestionId: {} } },
};

const TestConsumer: React.FC = () => {
	const ctx = useAssessment();
	return (
		<div>
			<span data-testid="modal-state">{ctx.modalState}</span>
			<span data-testid="survey-title">{ctx.surveyTitle}</span>
			<span data-testid="questions-count">{ctx.questions.length}</span>
			<span data-testid="can-submit">{String(ctx.canSubmit)}</span>
			<span data-testid="error">{ctx.error ?? "none"}</span>
			<button
				data-testid="submit-btn"
				onClick={() => ctx.submitAssessment()}
			/>
			<button
				data-testid="save-progress-btn"
				onClick={() => ctx.saveProgress()}
			/>
			<button
				data-testid="set-response-btn"
				onClick={() =>
					ctx.setQuestionResponse(20, { answerValue: "test answer" })
				}
			/>
			<button
				data-testid="reset-btn"
				onClick={() => ctx.resetForm()}
			/>
			<button
				data-testid="clear-error-btn"
				onClick={() => ctx.clearError()}
			/>
		</div>
	);
};

describe("AssessmentContext", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetClientBundle.mockResolvedValue(mockBundleResponse);
		mockSubmitSurvey.mockResolvedValue({
			success: true,
			message: "ok",
		});
	});

	it("loads bundle on mount and transitions to form state", async () => {
		render(
			<AssessmentProvider>
				<TestConsumer />
			</AssessmentProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("modal-state")).toHaveTextContent(
				"form",
			);
		});
		expect(screen.getByTestId("survey-title")).toHaveTextContent(
			"Test Assessment",
		);
		expect(screen.getByTestId("questions-count")).toHaveTextContent("2");
	});

	it("shows no_survey_found when bundle has no active survey", async () => {
		mockGetClientBundle.mockResolvedValue({
			...mockBundleResponse,
			has_active: false,
		});

		render(
			<AssessmentProvider>
				<TestConsumer />
			</AssessmentProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("modal-state")).toHaveTextContent(
				"no_survey_found",
			);
		});
	});

	it("shows already_submitted when progress is completed", async () => {
		mockGetClientBundle.mockResolvedValue({
			...mockBundleResponse,
			progress: { family_id: 1, status: "completed", next_section_id: null },
		});

		render(
			<AssessmentProvider>
				<TestConsumer />
			</AssessmentProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("modal-state")).toHaveTextContent(
				"already_submitted",
			);
		});
	});

	it("shows error state when bundle fetch fails", async () => {
		mockGetClientBundle.mockRejectedValue(
			new Error("Network failure"),
		);

		render(
			<AssessmentProvider>
				<TestConsumer />
			</AssessmentProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("modal-state")).toHaveTextContent(
				"error",
			);
		});
		expect(screen.getByTestId("error")).toHaveTextContent(
			"Network failure",
		);
	});

	it("submits assessment and transitions to confirmation", async () => {
		render(
			<AssessmentProvider>
				<TestConsumer />
			</AssessmentProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("modal-state")).toHaveTextContent(
				"form",
			);
		});

		await act(async () => {
			screen.getByTestId("submit-btn").click();
		});

		await waitFor(() => {
			expect(screen.getByTestId("modal-state")).toHaveTextContent(
				"confirmation",
			);
		});
		expect(mockSubmitSurvey).toHaveBeenCalledTimes(1);
	});

	it("saves progress with is_final=false", async () => {
		render(
			<AssessmentProvider>
				<TestConsumer />
			</AssessmentProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("modal-state")).toHaveTextContent(
				"form",
			);
		});

		await act(async () => {
			screen.getByTestId("set-response-btn").click();
		});

		await act(async () => {
			screen.getByTestId("save-progress-btn").click();
		});

		expect(mockSubmitSurvey).toHaveBeenCalledWith(
			expect.objectContaining({ is_final: false }),
		);
	});

	it("does not save progress when no answers provided", async () => {
		render(
			<AssessmentProvider>
				<TestConsumer />
			</AssessmentProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("modal-state")).toHaveTextContent(
				"form",
			);
		});

		await act(async () => {
			screen.getByTestId("save-progress-btn").click();
		});

		expect(mockSubmitSurvey).not.toHaveBeenCalled();
	});

	it("resumes from previous responses", async () => {
		mockGetClientBundle.mockResolvedValue({
			...mockBundleResponse,
			survey: {
				...mockBundleResponse.survey,
				previous_responses: [
					{
						question_id: 10,
						answer_id: null,
						answer_value: "previous answer",
						answer_text: null,
					},
				],
			},
		});

		render(
			<AssessmentProvider>
				<TestConsumer />
			</AssessmentProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("modal-state")).toHaveTextContent(
				"form",
			);
		});
	});

	it("sets question response", async () => {
		render(
			<AssessmentProvider>
				<TestConsumer />
			</AssessmentProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("modal-state")).toHaveTextContent(
				"form",
			);
		});

		await act(async () => {
			screen.getByTestId("set-response-btn").click();
		});
	});

	it("resets form", async () => {
		render(
			<AssessmentProvider>
				<TestConsumer />
			</AssessmentProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("modal-state")).toHaveTextContent(
				"form",
			);
		});

		await act(async () => {
			screen.getByTestId("reset-btn").click();
		});

		expect(screen.getByTestId("modal-state")).toHaveTextContent("form");
	});

	it("throws when useAssessment is used outside provider", () => {
		const consoleError = jest
			.spyOn(console, "error")
			.mockImplementation();
		expect(() => render(<TestConsumer />)).toThrow(
			"useAssessment must be used within an AssessmentProvider",
		);
		consoleError.mockRestore();
	});
});
