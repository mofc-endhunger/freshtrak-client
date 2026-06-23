/**
 * HouseholdRegistrationComponent - Adapted registration flow for household setup
 *
 * This component now uses the unified HouseholdForm component for consistency.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAuth } from '../../Authentication/AuthContext';

// Component imports
import { HouseholdForm } from '../../../components/shared';
import LoadingSpinner from '../../General/LoadingSpinner';

// Service imports
import { HouseholdsApiService } from '../../../Services/HouseholdsApiService';

// Type imports
import { RegistrationFormData } from '../../Registration/types/registration.types';
import { ApiHouseholdMember } from '../types/api.types';
import {
  getGenderFromId,
  getSuffixFromId,
  getAdditionalMemberCounts,
} from '../utils/householdUtils';
import { getLanguageCodes, getLanguageOptionById } from '../../Localization/languageOptions';
import localization from '../../Localization/LocalizationComponent';

interface HouseholdRegistrationComponentProps {
  onComplete: (data: RegistrationFormData) => Promise<void>;
  onCancel: () => void;
}

const HouseholdRegistrationComponent: React.FC<HouseholdRegistrationComponentProps> = ({
  onComplete,
  onCancel,
}) => {
  const { user: authUser } = useAuth();

  // Memoized API service instance
  const householdsApiService = useMemo(() => new HouseholdsApiService(), []);

  // Set to true once /users/me returns a primary member. Used by the authUser
  // effect below to avoid overwriting API-sourced names with the coarser
  // Cognito display-name split if useAuth resolves after the API call.
  const apiDataLoadedRef = useRef<boolean>(false);

  // Component state — start loading immediately so the form never renders before API data arrives
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(true);
  const [prefilledData, setPrefilledData] = useState<Partial<RegistrationFormData>>({});
  const [currentHouseholdMembers, setCurrentHouseholdMembers] = useState<ApiHouseholdMember[]>([]);
  const [deletedMemberIds, setDeletedMemberIds] = useState<number[]>([]);

  // Utility function to convert date from yyyy-mm-dd to mm/dd/yyyy
  const convertDateFormat = (dateString: string): string => {
    if (!dateString || dateString === '1900-01-01') {
      return '';
    }

    try {
      const [year, month, day] = dateString.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return '';
      }

      if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
        return '';
      }

      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const yearStr = String(year);

      return `${monthStr}/${dayStr}/${yearStr}`;
    } catch (error) {
      return '';
    }
  };

  // Pre-populate form with data from /users/me
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUserData(true);
      try {
        const userData = await householdsApiService.getUsersMe();

        // Convert gender_id to the lowercase string form expected by the form.
        const getGenderForForm = (genderId: number | null): string => {
          if (!genderId) return '';
          const gender = getGenderFromId(genderId);
          if (!gender) return '';
          const genderMap: Record<string, string> = {
            male: 'male',
            female: 'female',
            other: 'other',
            prefer_not_to_say: 'not_specify',
          };
          return genderMap[gender] || '';
        };

        const preferredLang =
          (userData.preferred_language && getLanguageCodes().includes(userData.preferred_language)
            ? userData.preferred_language
            : null) ??
          (typeof userData.language_id === 'number'
            ? getLanguageOptionById(userData.language_id)?.code
            : undefined) ??
          'en';

        // Household-level fields (address, contact preferences, language) are
        // always applied when the API call succeeds, even when no members exist
        // yet. This prevents the authUser fallback from overwriting API-sourced
        // preferences (e.g. permission_to_email: false) for a newly-created
        // household that hasn't added members yet.
        const householdFields = {
          preferred_language: preferredLang,
          phone: userData.phone || '',
          email: userData.email || '',
          address_line_1: userData.address_line_1 || '',
          address_line_2: userData.address_line_2 || '',
          city: userData.city || '',
          state: userData.state || '',
          zip_code: userData.zip_code || '',
          permission_to_text: userData.permission_to_text ?? false,
          permission_to_email: userData.permission_to_email ?? false,
        };

        if (userData.members && userData.members.length > 0) {
          setCurrentHouseholdMembers(userData.members);
          const primaryMember = userData.members[0];

          // Compute additional-member counts (excludes HOH from the correct age bucket)
          const additionalCounts = getAdditionalMemberCounts(
            userData.counts || {},
            primaryMember.date_of_birth,
          );

          // Mark that authoritative API data is available. The authUser effect
          // checks this flag so it never replaces API-sourced names with the
          // coarser Cognito display-name split, regardless of which effect
          // resolves first.
          apiDataLoadedRef.current = true;
          setPrefilledData({
            ...householdFields,
            first_name: primaryMember.first_name || '',
            last_name: primaryMember.last_name || '',
            middle_name: primaryMember.middle_name || '',
            suffix: getSuffixFromId(primaryMember.suffix_id),
            date_of_birth: convertDateFormat(primaryMember.date_of_birth || ''),
            gender: getGenderForForm(primaryMember.gender_id || null),
            seniors_in_household: additionalCounts.seniors,
            adults_in_household: additionalCounts.adults,
            children_in_household: additionalCounts.children,
          });
        } else {
          // No members yet (new household or all members removed). Apply
          // household-level preferences (address, contact prefs) from the API
          // via functional merge so they take effect without blocking the authUser
          // name fallback. We intentionally do NOT set apiDataLoadedRef here:
          // the API returned no member names, so Cognito names remain the best
          // available source and the authUser effect must be allowed to run if
          // authUser resolves after this branch completes.
          setPrefilledData((prev) => ({ ...prev, ...householdFields }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Still allow the form to proceed even if API fails.
        // apiDataLoadedRef stays false, so the authUser effect provides fallback.
      } finally {
        // Always set loading to false to prevent infinite spinner
        setIsLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [householdsApiService]);

  // Pre-populate with auth user data as a fallback only when the /users/me
  // API has not already returned a primary member. If the API effect ran first
  // with member data (apiDataLoadedRef = true), those API-sourced names are
  // authoritative — a Cognito display name split on the first space cannot
  // reliably reconstruct separate first/last names.
  //
  // When the API returned no members (apiDataLoadedRef = false), the authUser
  // effect is still allowed to run so names are filled from Cognito. In that
  // case we use `prev.permission_to_email ?? true` so that if the API merge
  // already wrote a `false` preference into prev, it is preserved.  The `??`
  // only falls back to `true` when the field is still undefined (pre-API state).
  useEffect(() => {
    if (authUser && !apiDataLoadedRef.current) {
      const nameParts = authUser.name?.split(' ') || [];
      setPrefilledData((prev) => ({
        ...prev,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: authUser.email || '',
        permission_to_email: prev.permission_to_email ?? true,
      }));
    }
  }, [authUser]);

  // Handle member deletion
  const handleDeleteMember = (memberId: number): void => {
    setDeletedMemberIds((prev) => [...prev, memberId]);
  };

  // Loading state
  if (isLoadingUserData) {
    return <LoadingSpinner />;
  }

  return (
    <HouseholdForm
      mode="householdSetup"
      onSubmit={onComplete}
      onCancel={onCancel}
      prefilledData={prefilledData}
      title={localization.title_set_up_household}
      subtitle={localization.subtitle_complete_household_profile}
      submitButtonText={localization.button_complete_setup}
      cancelButtonText={localization.button_cancel}
      currentHouseholdMembers={currentHouseholdMembers}
      onDeleteMember={handleDeleteMember}
      deletedMemberIds={deletedMemberIds}
    />
  );
};

export default HouseholdRegistrationComponent;
