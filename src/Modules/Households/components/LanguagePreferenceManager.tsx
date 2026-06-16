/**
 * Language Preference Manager Component
 * Manages language preferences for households and individual members
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Checkbox } from '../../../components/ui/checkbox';
import { Globe, Users, User, CheckCircle } from 'lucide-react';
import { HouseholdMember, Household } from '../types/household.types';
import { HouseholdsApiService } from '../../../Services/HouseholdsApiService';
import localization from '../../Localization/LocalizationComponent';
import { setLanguage } from '../../Localization/localizationUtils';
import { setCurrentLanguage } from '../../../Store/languageSlice';
import {
  getLanguageOptionByCode,
  getLanguageOptionById,
  getLanguageCodes,
  getTranslatedLanguageOptions,
} from '../../Localization/languageOptions';

interface LanguagePreferenceManagerProps {
  household: Household;
  members: HouseholdMember[];
  onUpdate: (data: LanguagePreferenceData) => Promise<void>;
  onCancel?: () => void;
  className?: string;
  mode?: 'view' | 'edit';
}

interface LanguagePreferenceData {
  household_preferred_language: string;
  member_language_overrides: Record<number, string>;
  use_household_language_for_all: boolean;
  fallback_language: string;
  /** Backend language table id; sent on PATCH so backend can return in GET /users/me */
  language_id?: number;
}

export const LanguagePreferenceManager: React.FC<LanguagePreferenceManagerProps> = ({
  household,
  members,
  onUpdate,
  onCancel,
  className = '',
  mode = 'edit',
}) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState({
    household: true,
    members: true,
  });

  const initialHouseholdLang = (() => {
    const codes = getLanguageCodes();
    if (household.preferred_language && codes.includes(household.preferred_language)) {
      return household.preferred_language;
    }
    if (typeof (household as any).language_id === 'number') {
      return getLanguageOptionById((household as any).language_id)?.code ?? 'en';
    }
    return 'en';
  })();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isDirty },
    reset,
  } = useForm<LanguagePreferenceData>({
    defaultValues: {
      household_preferred_language: initialHouseholdLang,
      member_language_overrides: {},
      use_household_language_for_all: true,
      fallback_language: 'en',
    },
  });

  const watchedValues = watch();

  // Initialize member language overrides
  useEffect(() => {
    const overrides: Record<number, string> = {};
    members.forEach((member) => {
      overrides[member.id] = initialHouseholdLang;
    });
    setValue('member_language_overrides', overrides);
  }, [members, initialHouseholdLang, setValue]);

  // Validate language preferences
  useEffect(() => {
    const householdValid = !!watchedValues.household_preferred_language;
    const membersValid =
      watchedValues.use_household_language_for_all ||
      Object.values(watchedValues.member_language_overrides || {}).every((lang) => !!lang);

    setValidation({
      household: householdValid,
      members: membersValid,
    });
  }, [watchedValues]);

  const onSubmit = async (data: LanguagePreferenceData) => {
    setIsLoading(true);
    try {
      const option = getLanguageOptionByCode(data.household_preferred_language);
      await onUpdate({ ...data, language_id: option?.id });
      setIsEditing(false);

      // Sync site language with the saved preference
      const langCode = option?.code ?? 'en';
      dispatch(setCurrentLanguage(langCode));
      setLanguage(langCode);
    } catch (error) {
      console.error('Error updating language preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    onCancel?.();
  };

  const getLanguageInfo = (code: string) => {
    return getLanguageOptionByCode(code) ?? getTranslatedLanguageOptions()[0];
  };

  const updateMemberLanguage = (memberId: number, languageCode: string) => {
    const currentOverrides = watchedValues.member_language_overrides || {};
    setValue(
      'member_language_overrides',
      {
        ...currentOverrides,
        [memberId]: languageCode,
      },
      { shouldDirty: true },
    );
  };

  const renderViewMode = () => (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-highlight" />
          <span>{localization.header_language_preferences}</span>
        </CardTitle>
        <CardDescription>{localization.subtitle_preferred_language_comm}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Household Language */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{localization.label_household_language}</span>
          </h4>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">
                {getLanguageInfo(watchedValues.household_preferred_language).text}
              </div>
              <div className="text-sm text-gray-600">
                {getLanguageInfo(watchedValues.household_preferred_language).code.toUpperCase()}
              </div>
            </div>
            {validation.household && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
        </div>

        {/* Member Languages */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{localization.label_member_language_settings}</span>
          </h4>

          {watchedValues.use_household_language_for_all ? (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                {localization.description_fallback_language}
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const memberLang =
                  watchedValues.member_language_overrides?.[member.id] ||
                  watchedValues.household_preferred_language;
                const langInfo = getLanguageInfo(memberLang);

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-sm text-gray-600">{langInfo.text}</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {langInfo.code.toUpperCase()}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fallback Language */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">{localization.label_fallback_language}</h4>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {getLanguageInfo(watchedValues.fallback_language).text}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            {localization.header_edit_language_preferences}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEditMode = () => (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-highlight" />
          <span>{localization.header_edit_language_preferences}</span>
        </CardTitle>
        <CardDescription>{localization.subtitle_select_language_comm}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Household Language */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{localization.label_household_language}</span>
            </h4>

            <div>
              <Label htmlFor="household_preferred_language">
                {localization.label_preferred_language}
              </Label>
              <Select
                value={watchedValues.household_preferred_language}
                onValueChange={(value) => {
                  setValue('household_preferred_language', value, { shouldDirty: true });
                  setLanguage(value);
                  dispatch(setCurrentLanguage(value));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={localization.placeholder_select_household_language} />
                </SelectTrigger>
                <SelectContent>
                  {getTranslatedLanguageOptions().map((opt) => (
                    <SelectItem key={opt.id} value={opt.code}>
                      {opt.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Member Language Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{localization.label_member_language_settings}</span>
            </h4>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="use_household_language_for_all"
                checked={watchedValues.use_household_language_for_all}
                onCheckedChange={(checked) =>
                  setValue('use_household_language_for_all', !!checked, { shouldDirty: true })
                }
              />
              <Label htmlFor="use_household_language_for_all">
                {localization.description_fallback_language}
              </Label>
            </div>

            {!watchedValues.use_household_language_for_all && (
              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">
                  {localization.label_household_members}
                </h5>
                {members.map((member) => {
                  const memberLang =
                    watchedValues.member_language_overrides?.[member.id] ||
                    watchedValues.household_preferred_language;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </span>
                      </div>
                      <Select
                        value={memberLang}
                        onValueChange={(value) => updateMemberLanguage(member.id, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getTranslatedLanguageOptions().map((opt) => (
                            <SelectItem key={opt.id} value={opt.code}>
                              {opt.text}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fallback Language */}
          <div>
            <Label htmlFor="fallback_language">{localization.label_fallback_language}</Label>
            <Select
              value={watchedValues.fallback_language}
              onValueChange={(value) =>
                setValue('fallback_language', value, {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={localization.placeholder_select_fallback_language} />
              </SelectTrigger>
              <SelectContent>
                {getTranslatedLanguageOptions().map((opt) => (
                  <SelectItem key={opt.id} value={opt.code}>
                    {opt.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              {localization.description_fallback_language}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" onClick={handleCancel} variant="outline" disabled={isLoading}>
              {localization.button_cancel}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="bg-highlight text-white hover:bg-highlight-dark"
            >
              {isLoading ? localization.button_saving : localization.button_save_preferences}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return isEditing ? renderEditMode() : renderViewMode();
};

/**
 * Hook for managing language preference operations
 */
export const useLanguagePreferenceManager = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Memoized API service instance
  const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

  const updateLanguagePreferences = async (
    householdId: number,
    data: LanguagePreferenceData,
  ): Promise<void> => {
    setIsLoading(true);
    try {
      // Get current household data from /users/me to ensure we have complete object
      const currentHouseholdData = await householdsApiService.getUsersMe();

      // Update household language preference - merge current data with language updates
      // Exclude updated_at, language_id, preferred_language (API expects language_id only, not code)
      const {
        updated_at,
        language_id: _currentLangId,
        preferred_language: _omitLangCode,
        ...currentDataWithoutTimestamp
      } = currentHouseholdData;
      const languageId =
        data.language_id !== undefined && data.language_id !== null
          ? data.language_id
          : _currentLangId !== undefined && _currentLangId !== null
            ? _currentLangId
            : undefined;
      await householdsApiService.updateHousehold(householdId, {
        ...currentDataWithoutTimestamp,
        ...(languageId !== undefined && { language_id: languageId }),
      });

      // Update individual member language preferences if not using household language
      if (!data.use_household_language_for_all) {
        // NOTE: Individual member language preferences are not supported by the current API
        // This feature requires backend API support for per-member language settings
        throw new Error(
          'Individual member language preferences are not supported by the current API. Use household language setting instead.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateLanguagePreferences = (data: LanguagePreferenceData): boolean => {
    return !!(
      data.household_preferred_language &&
      data.fallback_language &&
      (data.use_household_language_for_all ||
        Object.values(data.member_language_overrides || {}).every((lang) => !!lang))
    );
  };

  const getLanguageDisplayInfo = (code: string) => {
    return getLanguageOptionByCode(code) ?? getTranslatedLanguageOptions()[0];
  };

  return {
    updateLanguagePreferences,
    validateLanguagePreferences,
    getLanguageDisplayInfo,
    isLoading,
  };
};
