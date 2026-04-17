/**
 * Memoized Household Dashboard Component
 * Optimized version with React.memo and useMemo for better performance
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import {
  Home,
  Users,
  MapPin,
  Globe,
  Edit,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Household, HouseholdMember } from '../types/household.types';
import { calculateAge } from '../utils/householdUtils';
import { HouseholdInfoManager } from './HouseholdInfoManager';
import { LanguagePreferenceManager } from './LanguagePreferenceManager';

interface MemoizedHouseholdDashboardProps {
  household: Household;
  members: HouseholdMember[];
  onEditMember?: (member: HouseholdMember) => void;
  onMemberStatusChange?: (member: HouseholdMember) => Promise<void>;
  onHouseholdUpdate?: (householdData: any) => Promise<void>;
  onError?: (error: string) => void;
  className?: string;
  onEditHousehold?: () => void;
  onAddMember?: () => void;
  onManageMembers?: () => void;
}

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  childrenCount: number;
  adultsCount: number;
  seniorsCount: number;
  lastUpdated?: string;
}

// Memoized stats calculation
const useDashboardStats = (household: Household, members: HouseholdMember[]) => {
  return useMemo(() => {
    if (!household || !members) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        childrenCount: 0,
        adultsCount: 0,
        seniorsCount: 0,
      };
    }

    const activeMembers = members.filter((member) => member.status === 'active');
    const childrenCount = activeMembers.filter((member) => {
      const ageCalculation = calculateAge(member.date_of_birth);
      return ageCalculation.years < 18;
    }).length;
    const seniorsCount = activeMembers.filter((member) => {
      const ageCalculation = calculateAge(member.date_of_birth);
      return ageCalculation.years >= 60;
    }).length;
    const adultsCount = activeMembers.length - childrenCount - seniorsCount;

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      childrenCount,
      adultsCount,
      seniorsCount,
      lastUpdated: new Date().toISOString(),
    };
  }, [household, members]);
};

// Memoized address formatter
const useAddressFormatter = () => {
  return useCallback((household: Household): string => {
    const parts = [
      household.address_line_1,
      household.address_line_2,
      household.city,
      household.state,
      household.zip_code,
    ].filter(Boolean);

    return parts.join(', ');
  }, []);
};

// Removed unused useDateFormatter hook

// Memoized stats cards component
const StatsCards = memo(({ stats }: { stats: DashboardStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Members</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Active Members</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Children</p>
            <p className="text-2xl font-bold text-gray-900">{stats.childrenCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Adults</p>
            <p className="text-2xl font-bold text-gray-900">{stats.adultsCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
));

StatsCards.displayName = 'StatsCards';

// Memoized household info card component
const HouseholdInfoCard = memo(
  ({
    household,
    formatAddress,
    onEditHousehold,
    onEditLanguagePreferences,
  }: {
    household: Household;
    formatAddress: (household: Household) => string;
    onEditHousehold?: () => void;
    onEditLanguagePreferences?: () => void;
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Home className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Household Information</CardTitle>
              <CardDescription>Basic information about your household</CardDescription>
            </div>
          </div>
          <Button onClick={onEditHousehold} variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Address</p>
              <p className="text-sm text-gray-600">{formatAddress(household)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Preferred Language</p>
              <p className="text-sm text-gray-600 capitalize">{household.preferred_language}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Primary Contact</p>
              <p className="text-sm text-gray-600">
                {household.primary_first_name} {household.primary_last_name}
              </p>
              {household.primary_email && (
                <p className="text-sm text-gray-500">{household.primary_email}</p>
              )}
              {household.primary_phone && (
                <p className="text-sm text-gray-500">{household.primary_phone}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Language Preferences</p>
              <p className="text-sm text-gray-600 capitalize">{household.preferred_language}</p>
            </div>
          </div>
          <Button onClick={onEditLanguagePreferences} variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {household.notes && (
          <>
            <Separator />
            <div>
              <p className="font-medium text-gray-900 mb-2">Notes</p>
              <p className="text-sm text-gray-600">{household.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  ),
);

HouseholdInfoCard.displayName = 'HouseholdInfoCard';

// Memoized member overview card component
const MemberOverviewCard = memo(({ stats }: { stats: DashboardStats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Users className="w-5 h-5" />
        <span>Member Overview</span>
      </CardTitle>
      <CardDescription>Overview of household members by age group</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">Total Members</span>
          </div>
          <Badge variant="outline">{stats.totalMembers}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">Active Members</span>
          </div>
          <Badge variant="outline">{stats.activeMembers}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-medium">Children (18 and under)</span>
          </div>
          <Badge variant="outline">{stats.childrenCount}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <span className="font-medium">Adults (18-59)</span>
          </div>
          <Badge variant="outline">{stats.adultsCount}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <span className="font-medium">Seniors (60+)</span>
          </div>
          <Badge variant="outline">{stats.seniorsCount}</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
));

MemberOverviewCard.displayName = 'MemberOverviewCard';

export const MemoizedHouseholdDashboard: React.FC<MemoizedHouseholdDashboardProps> = ({
  household: propHousehold,
  members: propMembers,
  onEditMember,
  onMemberStatusChange,
  onHouseholdUpdate,
  onError,
  className = '',
  onEditHousehold,
  onAddMember,
  onManageMembers,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingHouseholdInfo, setIsEditingHouseholdInfo] = useState(false);
  const [isEditingLanguagePreferences, setIsEditingLanguagePreferences] = useState(false);

  // Memoized calculations
  const stats = useDashboardStats(propHousehold, propMembers);
  const formatAddress = useAddressFormatter();

  // Memoized handlers
  const handleEditHouseholdInfo = useCallback(() => {
    setIsEditingHouseholdInfo(true);
  }, []);

  const handleCancelEditHouseholdInfo = useCallback(() => {
    setIsEditingHouseholdInfo(false);
  }, []);

  const handleUpdateHouseholdInfo = useCallback(
    async (updatedHousehold: Household) => {
      try {
        await onHouseholdUpdate?.(updatedHousehold);
        setIsEditingHouseholdInfo(false);
      } catch (error) {
        onError?.(error instanceof Error ? error.message : 'Failed to update household');
      }
    },
    [onHouseholdUpdate, onError],
  );

  const handleEditLanguagePreferences = useCallback(() => {
    setIsEditingLanguagePreferences(true);
  }, []);

  const handleCancelEditLanguagePreferences = useCallback(() => {
    setIsEditingLanguagePreferences(false);
  }, []);

  const handleUpdateLanguagePreferences = useCallback(
    async (data: any) => {
      try {
        if (propHousehold) {
          const updatedHousehold: any = {
            ...propHousehold,
            ...(data.language_id !== undefined && { language_id: data.language_id }),
          };
          await onHouseholdUpdate?.(updatedHousehold);
          setIsEditingLanguagePreferences(false);
        }
      } catch (error) {
        console.error('Error updating language preferences:', error);
        onError?.(error instanceof Error ? error.message : 'Failed to update language preferences');
      }
    },
    [propHousehold, onHouseholdUpdate, onError],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Refresh is handled by parent component
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error('Error refreshing household data:', err);
      onError?.(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, [onError]);

  // Loading and error states are handled by parent component

  if (!propHousehold) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Household Found</h2>
          <p className="text-gray-600 mb-4">It looks like you haven't set up your household yet.</p>
          <Button onClick={onAddMember} className="bg-highlight text-white hover:bg-highlight-dark">
            <Plus className="w-4 h-4 mr-2" />
            Set Up Household
          </Button>
        </div>
      </div>
    );
  }

  // If editing household info, show the HouseholdInfoManager (defaultEditMode so preferred language dropdown is visible immediately)
  if (isEditingHouseholdInfo) {
    return (
      <HouseholdInfoManager
        household={propHousehold}
        onUpdate={handleUpdateHouseholdInfo}
        onCancel={handleCancelEditHouseholdInfo}
        className={className}
        defaultEditMode
      />
    );
  }

  // If editing language preferences, show the LanguagePreferenceManager
  if (isEditingLanguagePreferences) {
    return (
      <LanguagePreferenceManager
        household={propHousehold}
        members={propMembers}
        onUpdate={handleUpdateLanguagePreferences}
        onCancel={handleCancelEditLanguagePreferences}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Household Dashboard</h1>
            <p className="text-green-100">Manage your household and family members</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={onAddMember}
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
            <Button
              onClick={handleRefresh}
              variant="secondary"
              disabled={isRefreshing}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Household Information */}
        <HouseholdInfoCard
          household={propHousehold}
          formatAddress={formatAddress}
          onEditHousehold={handleEditHouseholdInfo}
          onEditLanguagePreferences={handleEditLanguagePreferences}
        />

        {/* Member Overview */}
        <MemberOverviewCard stats={stats} />
      </div>
    </div>
  );
};
