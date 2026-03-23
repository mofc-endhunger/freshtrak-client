import {
	createInitialAssessmentFormState,
	buildAssessmentSubmitRequest,
	isAssessmentFormValid,
	AssessmentFormState,
} from "../assessment.types";

describe("assessment.types", () => {
	describe("createInitialAssessmentFormState", () => {
		it("returns form state with empty responses map", () => {
			const state = createInitialAssessmentFormState();
			expect(state.responses).toBeInstanceOf(Map);
			expect(state.responses.size).toBe(0);
		});
	});

	describe("buildAssessmentSubmitRequest", () => {
		it("builds request with responses that have values", () => {
			const formState: AssessmentFormState = {
				responses: new Map([
					[1, { question_id: 1, answer_value: "yes" }],
					[2, { question_id: 2, answer_value: "no" }],
					[3, { question_id: 3 }],
				]),
			};

			const result = buildAssessmentSubmitRequest(formState, 10, 20, true);

			expect(result).toEqual({
				survey_id: 10,
				trigger_id: 20,
				is_final: true,
				responses: [
					{ question_id: 1, answer_value: "yes" },
					{ question_id: 2, answer_value: "no" },
				],
			});
		});

		it("excludes empty/whitespace-only answers", () => {
			const formState: AssessmentFormState = {
				responses: new Map([
					[1, { question_id: 1, answer_value: "  " }],
					[2, { question_id: 2, answer_value: "" }],
				]),
			};

			const result = buildAssessmentSubmitRequest(formState, 10, 20);

			expect(result.responses).toEqual([]);
		});

		it("defaults is_final to true", () => {
			const formState: AssessmentFormState = {
				responses: new Map(),
			};

			const result = buildAssessmentSubmitRequest(formState, 1, 2);

			expect(result.is_final).toBe(true);
		});

		it("respects is_final=false for progress saves", () => {
			const formState: AssessmentFormState = {
				responses: new Map([
					[1, { question_id: 1, answer_value: "test" }],
				]),
			};

			const result = buildAssessmentSubmitRequest(formState, 1, 2, false);

			expect(result.is_final).toBe(false);
		});

		it("does not include overall_rating or comments", () => {
			const formState: AssessmentFormState = {
				responses: new Map([
					[1, { question_id: 1, answer_value: "test" }],
				]),
			};

			const result = buildAssessmentSubmitRequest(formState, 1, 2);

			expect(result).not.toHaveProperty("overall_rating");
			expect(result).not.toHaveProperty("comments");
			expect(result).not.toHaveProperty("registration_id");
		});
	});

	describe("isAssessmentFormValid", () => {
		it("returns true when no questions provided", () => {
			const formState: AssessmentFormState = {
				responses: new Map(),
			};

			expect(isAssessmentFormValid(formState, null)).toBe(true);
		});

		it("returns true when all required questions are answered", () => {
			const formState: AssessmentFormState = {
				responses: new Map([
					[1, { question_id: 1, answer_value: "yes" }],
				]),
			};
			const questions = [{ id: 1, required: true }];

			expect(isAssessmentFormValid(formState, questions)).toBe(true);
		});

		it("returns false when required question has no answer", () => {
			const formState: AssessmentFormState = {
				responses: new Map([
					[1, { question_id: 1 }],
				]),
			};
			const questions = [{ id: 1, required: true }];

			expect(isAssessmentFormValid(formState, questions)).toBe(false);
		});

		it("returns false when required question has empty answer", () => {
			const formState: AssessmentFormState = {
				responses: new Map([
					[1, { question_id: 1, answer_value: "  " }],
				]),
			};
			const questions = [{ id: 1, required: true }];

			expect(isAssessmentFormValid(formState, questions)).toBe(false);
		});

		it("returns true when optional questions are unanswered", () => {
			const formState: AssessmentFormState = {
				responses: new Map(),
			};
			const questions = [{ id: 1, required: false }];

			expect(isAssessmentFormValid(formState, questions)).toBe(true);
		});

		it("handles mix of required and optional questions", () => {
			const formState: AssessmentFormState = {
				responses: new Map([
					[1, { question_id: 1, answer_value: "yes" }],
				]),
			};
			const questions = [
				{ id: 1, required: true },
				{ id: 2, required: false },
			];

			expect(isAssessmentFormValid(formState, questions)).toBe(true);
		});
	});
});
