/**
 * Household Information Manager Component
 * Manages household address, language preference, and notes editing
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { Home, MapPin, Globe, FileText, Save, Edit3, AlertCircle } from 'lucide-react';
import { HouseholdsApiService } from '../../../Services/HouseholdsApiService';
import { Household, LanguagePreference, UpdateHouseholdRequest } from '../types/household.types';
import { useHouseholdSignUpIntegration } from '../services/HouseholdSignUpIntegration';
import localization from '../../Localization/LocalizationComponent';
import {
  LANGUAGE_OPTIONS,
  getLanguageOptionByCode,
  getLanguageOptionById,
  getLanguageCodes,
  getTranslatedLanguageOptions,
} from '../../Localization/languageOptions';
import { setLanguage } from '../../Localization/localizationUtils';
import { setCurrentLanguage } from '../../../Store/languageSlice';
import { useDispatch } from 'react-redux';

/** Resolve a language code from whatever the API gave us (preferred_language string or language_id number). */
function resolveLanguageCode(household: {
  preferred_language?: string | null;
  language_id?: number | null;
}): string {
  const codes = getLanguageCodes();
  if (household.preferred_language && codes.includes(household.preferred_language)) {
    return household.preferred_language;
  }
  if (typeof household.language_id === 'number') {
    return getLanguageOptionById(household.language_id)?.code ?? 'en';
  }
  return 'en';
}

// Form validation schema - using function to access localization
const getHouseholdInfoSchema = () =>
  z.object({
    address_line_1: z.string().min(1, localization.error_street_address_required),
    address_line_2: z.string().optional(),
    city: z.string().min(1, localization.error_city_required),
    state: z.string().min(1, localization.error_state_required),
    zip_code: z.string().min(5, localization.error_zip_code_min_length),
    preferred_language: z
      .string()
      .refine((val) => getTranslatedLanguageOptions().some((o) => o.code === val), {
        message: localization.error_please_select_valid_language,
      }),
    notes: z.string().optional(),
  });

type HouseholdInfoFormData = z.infer<ReturnType<typeof getHouseholdInfoSchema>>;

interface HouseholdInfoManagerProps {
  household: Household;
  onUpdate?: (updatedHousehold: Household) => void;
  onCancel?: () => void;
  className?: string;
  /** When true, show the edit form immediately (e.g. when opened from dashboard "Edit") so preferred language dropdown is visible without an extra click. */
  defaultEditMode?: boolean;
}

export const HouseholdInfoManager: React.FC<HouseholdInfoManagerProps> = ({
  household,
  onUpdate,
  onCancel,
  className = '',
  defaultEditMode = false,
}) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(defaultEditMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Memoized API service instance
  const householdsApiService = useMemo(() => new HouseholdsApiService(), []);
  const { getHouseholdId } = useHouseholdSignUpIntegration();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<HouseholdInfoFormData>({
    resolver: zodResolver(getHouseholdInfoSchema()),
    defaultValues: {
      address_line_1: household.address_line_1,
      address_line_2: household.address_line_2 || '',
      city: household.city,
      state: household.state,
      zip_code: household.zip_code,
      preferred_language: resolveLanguageCode(household) as LanguagePreference,
      notes: household.notes || '',
    },
  });

  // Watch for form changes
  const watchedValues = watch();
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // Language options (shared list with header/household setup)
  const languageOptions = useMemo(
    () =>
      getTranslatedLanguageOptions().map((opt) => ({
        value: opt.code,
        label: opt.text,
      })),
    [],
  );

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    // Reset form with current household so preferred_language is in sync (e.g. after API load)
    reset({
      address_line_1: household.address_line_1,
      address_line_2: household.address_line_2 || '',
      city: household.city,
      state: household.state,
      zip_code: household.zip_code,
      preferred_language: resolveLanguageCode(household) as LanguagePreference,
      notes: household.notes || '',
    });
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      reset();
      setIsEditing(false);
      setError(null);
      onCancel?.();
    }
  };

  const handleConfirmCancel = () => {
    reset();
    setIsEditing(false);
    setError(null);
    setShowConfirmDialog(false);
    onCancel?.();
  };

  const onSubmit = async (data: HouseholdInfoFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const householdId = getHouseholdId();
      if (!householdId) {
        throw new Error(localization.error_household_id_not_found);
      }

      // Get current household data from /users/me to ensure we have complete object
      const currentHouseholdData = await householdsApiService.getUsersMe();

      // Prepare update data - merge current data with address updates
      // Exclude updated_at, preferred_language (API expects language_id only, not code)
      const {
        updated_at,
        preferred_language: _omitLangCode,
        ...currentDataWithoutTimestamp
      } = currentHouseholdData;
      const languageOption = getLanguageOptionByCode(data.preferred_language);
      const updatePayload = {
        ...currentDataWithoutTimestamp,
        address_line_1: data.address_line_1 || null,
        address_line_2: data.address_line_2 || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zip_code || null,
        ...(languageOption?.id !== undefined && { language_id: languageOption.id }),
      } as UpdateHouseholdRequest;

      // Update via API
      const response = await householdsApiService.updateHousehold(householdId, updatePayload);

      // Success - update local state
      setIsEditing(false);
      setHasUnsavedChanges(false);
      onUpdate?.(response.data);

      // Sync site language with the saved preference
      const savedLang = getLanguageOptionById(languageOption?.id ?? 0);
      const langCode = savedLang?.code ?? 'en';
      dispatch(setCurrentLanguage(langCode));
      setLanguage(langCode);

      // Show success feedback
      setTimeout(() => {
        // Could add a toast notification here
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : localization.error_failed_to_update_household);
      // Rollback optimistic update
      reset();
    } finally {
      setIsLoading(false);
    }
  };

  const renderViewMode = () => (
    <div className="space-y-6">
      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-highlight" />
            <span>{localization.header_address_information}</span>
          </CardTitle>
          <CardDescription>{localization.subtitle_primary_address}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-gray-600">
              {localization.label_address}
            </Label>
            <p className="text-gray-900">
              {household.address_line_1}
              {household.address_line_2 && (
                <span>
                  <br />
                  {household.address_line_2}
                </span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">{localization.label_city}</Label>
              <p className="text-gray-900">{household.city}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                {localization.label_state}
              </Label>
              <p className="text-gray-900">{household.state}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                {localization.label_zip_code}
              </Label>
              <p className="text-gray-900">{household.zip_code}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-highlight" />
            <span>{localization.header_language_preference}</span>
          </CardTitle>
          <CardDescription>{localization.subtitle_preferred_language_comm}</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-sm font-medium text-gray-600">
              {localization.label_preferred_language}
            </Label>
            <p className="text-gray-900">
              {languageOptions.find((opt) => opt.value === household.preferred_language)?.label ||
                household.preferred_language}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {household.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-highlight" />
              <span>{localization.header_household_notes}</span>
            </CardTitle>
            <CardDescription>{localization.subtitle_additional_info}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 whitespace-pre-wrap">{household.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button onClick={handleEdit} variant="outline" className="flex items-center space-x-2">
          <Edit3 className="w-4 h-4" />
          <span>{localization.button_edit_information}</span>
        </Button>
      </div>
    </div>
  );

  const renderEditMode = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-highlight" />
            <span>{localization.header_address_information}</span>
          </CardTitle>
          <CardDescription>{localization.subtitle_update_address}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address_line_1">{localization.label_address_line_1}</Label>
            <Input
              id="address_line_1"
              {...register('address_line_1')}
              className={errors.address_line_1 ? 'border-red-500' : ''}
            />
            {errors.address_line_1 && (
              <p className="text-sm text-red-600 mt-1">{errors.address_line_1.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address_line_2">{localization.label_address_line_2}</Label>
            <Input
              id="address_line_2"
              {...register('address_line_2')}
              placeholder={localization.placeholder_apartment_suite_unit}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">{localization.label_city_required}</Label>
              <Input
                id="city"
                {...register('city')}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <Label htmlFor="state">{localization.label_state_required}</Label>
              <Input
                id="state"
                {...register('state')}
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <Label htmlFor="zip_code">{localization.label_zip_code_required}</Label>
              <Input
                id="zip_code"
                {...register('zip_code')}
                className={errors.zip_code ? 'border-red-500' : ''}
              />
              {errors.zip_code && (
                <p className="text-sm text-red-600 mt-1">{errors.zip_code.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-highlight" />
            <span>{localization.header_language_preference}</span>
          </CardTitle>
          <CardDescription>{localization.subtitle_select_language_comm}</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="preferred_language">
              {localization.label_preferred_language_required}
            </Label>
            <Select
              value={
                languageOptions.some((o) => o.value === watchedValues.preferred_language)
                  ? watchedValues.preferred_language
                  : 'en'
              }
              onValueChange={(value) => setValue('preferred_language', value as LanguagePreference)}
            >
              <SelectTrigger
                id="preferred_language"
                className={errors.preferred_language ? 'border-red-500' : ''}
              >
                <SelectValue placeholder={localization.placeholder_select_a_language} />
              </SelectTrigger>
              <SelectContent className="z-[10000]" position="popper">
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.preferred_language && (
              <p className="text-sm text-red-600 mt-1">{errors.preferred_language.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-highlight" />
            <span>{localization.header_household_notes}</span>
          </CardTitle>
          <CardDescription>{localization.subtitle_add_additional_info}</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="notes">{localization.label_notes}</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder={localization.placeholder_household_notes}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{localization.text_error}</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button type="button" onClick={handleCancel} variant="outline" disabled={isLoading}>
          {localization.button_cancel}
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !isDirty}
          className="bg-highlight text-white hover:bg-highlight-dark"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {localization.button_saving}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {localization.button_save_changes}
            </>
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Home className="w-6 h-6 text-highlight" />
            <span>{localization.title_household_information}</span>
          </h2>
          <p className="text-gray-600 mt-1">{localization.subtitle_manage_household}</p>
        </div>
      </div>

      {/* Content */}
      {isEditing ? renderEditMode() : renderViewMode()}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{localization.dialog_discard_changes_title}</AlertDialogTitle>
            <AlertDialogDescription>
              {localization.dialog_discard_changes_description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              {localization.dialog_keep_editing}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              {localization.dialog_discard_changes}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
