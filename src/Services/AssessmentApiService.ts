/**
 * Assessment API Service
 *
 * Calls the survey client-bundle and submit endpoints with survey_type=assessment.
 *
 *   GET  /api/surveys/client-bundle?survey_type=assessment&language_id=...
 *   POST /api/surveys/submit
 */

import { StorageService } from "../Utils/StorageService";
import axios, { AxiosInstance, AxiosError } from "axios";
import type {
	ClientBundleResponse,
	SurveySubmitRequest,
	SurveySubmitResponse,
	FeedbackApiError,
} from "../Modules/Assessment/types";
import config from "../config";

const API_CONFIG = {
	baseUrl: config.REGISTRATION_API || "",
	endpoints: {
		clientBundle: "api/surveys/client-bundle",
		submit: "api/surveys/submit",
	},
	timeout: 30000,
};

export class AssessmentApiService {
	private axiosInstance: AxiosInstance;

	constructor() {
		this.axiosInstance = axios.create({
			baseURL: API_CONFIG.baseUrl,
			timeout: API_CONFIG.timeout,
			headers: { "Content-Type": "application/json" },
		});

		this.axiosInstance.interceptors.request.use(
			(cfg) => {
				const token = this.getAuthToken();
				if (token) {
					cfg.headers = cfg.headers || {};
					cfg.headers.Authorization = `Bearer ${token}`;
				}
				return cfg;
			},
			(error) => Promise.reject(error),
		);
	}

	private getAuthToken(): string | null {
		try {
			const cognitoUser = StorageService.getCognitoUser();
			return cognitoUser?.accessToken ?? null;
		} catch {
			return null;
		}
	}

	private parseError(error: AxiosError): FeedbackApiError {
		if (error.response) {
			const data = error.response.data as any;
			return {
				status: error.response.status,
				message: data?.message || "An error occurred",
				errors: data?.errors,
			};
		}
		return { status: 0, message: error.message || "Network error" };
	}

	/**
	 * GET /api/surveys/client-bundle?survey_type=assessment&language_id=...
	 */
	async getClientBundle(languageId: number): Promise<ClientBundleResponse> {
		try {
			const response =
				await this.axiosInstance.get<ClientBundleResponse>(
					API_CONFIG.endpoints.clientBundle,
					{
						params: {
							survey_type: "assessment",
							language_id: languageId,
						},
					},
				);
			return response.data;
		} catch (error) {
			throw this.parseError(error as AxiosError);
		}
	}

	/**
	 * POST /api/surveys/submit
	 */
	async submitSurvey(
		data: SurveySubmitRequest,
	): Promise<SurveySubmitResponse> {
		try {
			const response =
				await this.axiosInstance.post<SurveySubmitResponse>(
					API_CONFIG.endpoints.submit,
					data,
				);
			return response.data;
		} catch (error) {
			throw this.parseError(error as AxiosError);
		}
	}
}

export const assessmentApiService = new AssessmentApiService();
