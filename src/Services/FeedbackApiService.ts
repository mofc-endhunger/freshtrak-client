/**
 * Feedback API Service
 *
 * Calls the survey client-bundle and submit endpoints.
 *
 *   GET  /api/surveys/client-bundle?registration_id=...&language_id=...&survey_type=feedback
 *   POST /api/surveys/submit
 */

import { StorageService } from "../Utils/StorageService";
import axios, { AxiosInstance, AxiosError } from "axios";
import {
    ClientBundleResponse,
    SurveySubmitRequest,
    SurveySubmitResponse,
    FeedbackApiError,
} from "../Modules/Feedback/types";
import config from "../config";

const API_CONFIG = {
    baseUrl: config.REGISTRATION_API || "",
    endpoints: {
        clientBundle: "api/surveys/client-bundle",
        submit: "api/surveys/submit",
    },
    timeout: 30000,
};

export class FeedbackApiService {
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
     * GET /api/surveys/client-bundle?registration_id=...&language_id=...&survey_type=feedback
     * survey_type=feedback ensures the backend returns a feedback survey, not an assessment, when multiple survey types exist for the same language.
     */
    async getClientBundle(
        registrationId: number,
        languageId: number,
    ): Promise<ClientBundleResponse> {
        try {
            const response = await this.axiosInstance.get<ClientBundleResponse>(
                API_CONFIG.endpoints.clientBundle,
                {
                    params: {
                        registration_id: registrationId,
                        language_id: languageId,
                        survey_type: "feedback",
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
    async submitSurvey(data: SurveySubmitRequest): Promise<SurveySubmitResponse> {
        try {
            const response = await this.axiosInstance.post<SurveySubmitResponse>(
                API_CONFIG.endpoints.submit,
                data,
            );
            return response.data;
        } catch (error) {
            throw this.parseError(error as AxiosError);
        }
    }
}

export const feedbackApiService = new FeedbackApiService();
