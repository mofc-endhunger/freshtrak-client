/**
 * FeedbackContext
 *
 * Context provider for managing the survey feedback form state and submission.
 * Uses the new client-bundle API:
 *   GET  /api/surveys/client-bundle?registration_id=...&language_id=...
 *   POST /api/surveys/submit
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  ClientBundleResponse,
  SurveyQuestion,
  FeedbackFormState,
  FeedbackModalState,
  QuestionResponsePayload,
  createInitialFormState,
  isFormValid,
  buildSubmitRequest,
} from '../types';
import { feedbackApiService } from '../../../Services/FeedbackApiService';
import { selectLanguage } from '../../../Store/languageSlice';
import { getLanguageOptionByCode } from '../../Localization/languageOptions';

// ============================================================================
// TYPES
// ============================================================================

interface FeedbackContextValue {
  registrationId: number;
  bundle: ClientBundleResponse | null;
  questions: SurveyQuestion[];
  surveyTitle: string;
  formState: FeedbackFormState;
  modalState: FeedbackModalState;
  canSubmit: boolean;
  error: string | null;
  setRating: (rating: number) => void;
  setComments: (comments: string) => void;
  setQuestionResponse: (questionId: number, payload: QuestionResponsePayload) => void;
  submitFeedback: () => Promise<boolean>;
  saveProgress: () => void;
  resetForm: () => void;
  clearError: () => void;
  reload: () => Promise<void>;
}

interface FeedbackProviderProps {
  registrationId: number;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: string) => void;
  children: React.ReactNode;
}

// ============================================================================
// CONTEXT
// ============================================================================

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({
  registrationId,
  onSubmitSuccess,
  onSubmitError,
  children,
}) => {
  const currentLanguage = useSelector(selectLanguage) as string;

  const [bundle, setBundle] = useState<ClientBundleResponse | null>(null);
  const [formState, setFormState] = useState<FeedbackFormState>(createInitialFormState());
  const [modalState, setModalState] = useState<FeedbackModalState>('loading');
  const [error, setError] = useState<string | null>(null);

  const questions = useMemo<SurveyQuestion[]>(() => {
    if (!bundle?.survey?.questions) return [];
    return [...bundle.survey.questions].sort((a, b) => a.order - b.order);
  }, [bundle]);

  const surveyTitle = bundle?.survey?.title ?? '';

  const loadBundle = useCallback(async () => {
    setModalState('loading');
    setError(null);

    const langOption = getLanguageOptionByCode(currentLanguage);
    const languageId = langOption?.id ?? 1;

    try {
      const response = await feedbackApiService.getClientBundle(registrationId, languageId);
      setBundle(response);

      if (!response.has_active || !response.survey?.questions?.length) {
        setModalState('no_survey_found');
        return;
      }

      if (response.progress?.status === 'completed') {
        setModalState('already_submitted');
        return;
      }

      setModalState('form');
      const newFormState = createInitialFormState();
      const prevMap = new Map<number, string>();
      (response.survey.previous_responses ?? []).forEach((pr) => {
        if (pr.question_id && pr.answer_value) {
          prevMap.set(pr.question_id, pr.answer_value);
        }
      });
      response.survey.questions.forEach((q) => {
        const prev = prevMap.get(q.id);
        newFormState.responses.set(q.id, {
          question_id: q.id,
          ...(prev !== undefined && { answer_value: prev }),
        });
      });
      setFormState(newFormState);
    } catch (err: any) {
      console.error('Failed to load survey bundle:', err);
      setError(err.message || 'Failed to load feedback form');
      setModalState('error');
    }
  }, [registrationId, currentLanguage]);

  useEffect(() => {
    loadBundle();
  }, [loadBundle]);

  const setRating = useCallback((rating: number) => {
    setFormState((prev) => ({ ...prev, overall_rating: rating }));
  }, []);

  const setComments = useCallback((comments: string) => {
    setFormState((prev) => ({ ...prev, comments }));
  }, []);

  const setQuestionResponse = useCallback(
    (questionId: number, payload: QuestionResponsePayload) => {
      setFormState((prev) => {
        const newResponses = new Map(prev.responses);
        const existing = newResponses.get(questionId) ?? { question_id: questionId };
        newResponses.set(questionId, { ...existing, answer_value: payload.answerValue });
        return { ...prev, responses: newResponses };
      });
    },
    [],
  );

  const canSubmit = useMemo(() => {
    return isFormValid(formState, questions.length > 0 ? questions : null);
  }, [formState, questions]);

  const submitFeedback = useCallback(async (): Promise<boolean> => {
    if (!canSubmit) {
      setError('Please complete all required fields');
      return false;
    }

    if (!bundle?.survey || !registrationId) {
      setError('No survey available');
      return false;
    }

    setModalState('submitting');
    setError(null);

    try {
      const request = buildSubmitRequest(
        formState,
        bundle.survey.id,
        bundle.trigger.id,
        registrationId,
        true,
      );
      await feedbackApiService.submitSurvey(request);
      setModalState('confirmation');
      onSubmitSuccess?.();
      return true;
    } catch (err: any) {
      console.error('Failed to submit survey:', err);
      const errorMessage = err.message || 'Failed to submit feedback';
      setError(errorMessage);
      setModalState('error');
      onSubmitError?.(errorMessage);
      return false;
    }
  }, [canSubmit, formState, bundle, registrationId, onSubmitSuccess, onSubmitError]);

  const saveProgress = useCallback(() => {
    if (!bundle?.survey || !registrationId) return;
    const hasAnyAnswer = Array.from(formState.responses.values()).some((d) =>
      d.answer_value?.trim(),
    );
    if (!hasAnyAnswer) return;

    const request = buildSubmitRequest(
      formState,
      bundle.survey.id,
      bundle.trigger.id,
      registrationId,
      false,
    );
    feedbackApiService.submitSurvey(request).catch((err) => {
      console.warn('Failed to save survey progress:', err);
    });
  }, [formState, bundle, registrationId]);

  const resetForm = useCallback(() => {
    const newFormState = createInitialFormState();
    if (bundle?.survey?.questions) {
      bundle.survey.questions.forEach((q) => {
        newFormState.responses.set(q.id, { question_id: q.id });
      });
    }
    setFormState(newFormState);
    setError(null);
    setModalState('form');
  }, [bundle]);

  const clearError = useCallback(() => {
    setError(null);
    if (modalState === 'error') {
      setModalState('form');
    }
  }, [modalState]);

  const reload = useCallback(async () => {
    await loadBundle();
  }, [loadBundle]);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      registrationId,
      bundle,
      questions,
      surveyTitle,
      formState,
      modalState,
      canSubmit,
      error,
      setRating,
      setComments,
      setQuestionResponse,
      submitFeedback,
      saveProgress,
      resetForm,
      clearError,
      reload,
    }),
    [
      registrationId,
      bundle,
      questions,
      surveyTitle,
      formState,
      modalState,
      canSubmit,
      error,
      setRating,
      setComments,
      setQuestionResponse,
      submitFeedback,
      saveProgress,
      resetForm,
      clearError,
      reload,
    ],
  );

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
};

// ============================================================================
// HOOK
// ============================================================================

export const useFeedback = (): FeedbackContextValue => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export default FeedbackContext;
