import axios from "axios";
import { AssessmentApiService } from "../AssessmentApiService";

jest.mock("../../Utils/StorageService", () => ({
	StorageService: {
		getCognitoUser: jest.fn().mockReturnValue({ accessToken: "test-token" }),
	},
}));

jest.mock("../../config", () => ({
	__esModule: true,
	default: { REGISTRATION_API: "https://api.test.com" },
}));

jest.mock("axios", () => {
	const mockInstance = {
		get: jest.fn(),
		post: jest.fn(),
		interceptors: {
			request: { use: jest.fn() },
			response: { use: jest.fn() },
		},
	};
	return {
		create: jest.fn().mockReturnValue(mockInstance),
		__mockInstance: mockInstance,
	};
});

const getMockInstance = () => (axios as any).__mockInstance;

describe("AssessmentApiService", () => {
	let service: AssessmentApiService;

	beforeEach(() => {
		jest.clearAllMocks();
		service = new AssessmentApiService();
	});

	describe("getClientBundle", () => {
		it("calls GET with survey_type=assessment and language_id", async () => {
			const mockResponse = {
				data: {
					has_active: true,
					survey: { id: 1, title: "Test" },
				},
			};
			getMockInstance().get.mockResolvedValueOnce(mockResponse);

			const result = await service.getClientBundle(2);

			expect(getMockInstance().get).toHaveBeenCalledWith(
				"api/surveys/client-bundle",
				{
					params: {
						survey_type: "assessment",
						language_id: 2,
					},
				},
			);
			expect(result).toEqual(mockResponse.data);
		});

		it("throws parsed error on failure", async () => {
			const axiosError = {
				response: {
					status: 500,
					data: { message: "Server error" },
				},
				isAxiosError: true,
			};
			getMockInstance().get.mockRejectedValueOnce(axiosError);

			await expect(service.getClientBundle(1)).rejects.toEqual({
				status: 500,
				message: "Server error",
			});
		});

		it("throws network error when no response", async () => {
			const axiosError = {
				message: "Network Error",
				isAxiosError: true,
			};
			getMockInstance().get.mockRejectedValueOnce(axiosError);

			await expect(service.getClientBundle(1)).rejects.toEqual({
				status: 0,
				message: "Network Error",
			});
		});
	});

	describe("submitSurvey", () => {
		it("calls POST with survey data", async () => {
			const mockResponse = {
				data: { success: true, message: "ok" },
			};
			getMockInstance().post.mockResolvedValueOnce(mockResponse);

			const submitData = {
				survey_id: 1,
				trigger_id: 2,
				is_final: true,
				responses: [{ question_id: 1, answer_value: "yes" }],
			};

			const result = await service.submitSurvey(submitData);

			expect(getMockInstance().post).toHaveBeenCalledWith(
				"api/surveys/submit",
				submitData,
			);
			expect(result).toEqual(mockResponse.data);
		});

		it("throws parsed error on submit failure", async () => {
			const axiosError = {
				response: {
					status: 409,
					data: { message: "Duplicate" },
				},
				isAxiosError: true,
			};
			getMockInstance().post.mockRejectedValueOnce(axiosError);

			await expect(
				service.submitSurvey({
					survey_id: 1,
					trigger_id: 2,
					responses: [],
				}),
			).rejects.toEqual({
				status: 409,
				message: "Duplicate",
			});
		});
	});

	describe("constructor", () => {
		it("creates axios instance with correct config", () => {
			new AssessmentApiService();

			expect(axios.create).toHaveBeenCalledWith({
				baseURL: "https://api.test.com",
				timeout: 30000,
				headers: { "Content-Type": "application/json" },
			});
		});
	});
});
