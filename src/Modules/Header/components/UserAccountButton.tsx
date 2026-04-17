import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Authentication/AuthContext';
import { RENDER_URL } from '../../../Utils/Urls';
import { StorageService } from '../../../Utils/StorageService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Settings, LogOut, Home, ClipboardList, Users } from 'lucide-react';
import localization from '../../Localization/LocalizationComponent';

/**
 * UserAccountButton - Displays user initials in a rounded button with dropdown menu
 *
 * This component provides:
 * - User initials in a circular button
 * - Dropdown menu with account options
 * - Navigation to account page
 * - Logout functionality
 * - Household setup prompts if needed
 *
 * @component
 * @returns {JSX.Element} The user account button with dropdown
 */
const UserAccountButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  /**
   * Get user initials from name or email
   */
  const getUserInitials = (): string => {
    if (!user) return 'U';

    // Try to get initials from name first
    if (user.name && user.name !== user.email) {
      const nameParts = user.name.trim().split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }

    // Fallback to email initials
    if (user.email) {
      const emailParts = user.email.split('@')[0];
      if (emailParts.length >= 2) {
        return emailParts.substring(0, 2).toUpperCase();
      }
      return emailParts[0].toUpperCase();
    }

    return 'U';
  };

  /**
   * Handle account page navigation
   */
  const handleAccountClick = (): void => {
    setIsOpen(false);
    navigate(RENDER_URL.ACCOUNT_URL);
  };

  /**
   * Handle logout
   */
  const handleLogout = async (): Promise<void> => {
    try {
      setIsOpen(false);
      await signOut();
      navigate(RENDER_URL.ROOT_URL);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Handle home navigation
   */
  const handleHomeClick = (): void => {
    setIsOpen(false);
    navigate(RENDER_URL.ROOT_URL);
  };

  const isCaseManager = StorageService.isCaseManager();

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center justify-center"
            aria-label={localization.aria_user_account_menu}
            data-testid="user-account-button"
          >
            {getUserInitials()}
          </button>
        </DropdownMenuTrigger>
        {isCaseManager && (
          <ClipboardList className="absolute -top-2 -right-2 h-5 w-5 text-white bg-color-red rounded-full p-0.5 pointer-events-none" />
        )}
      </div>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-56 bg-white border border-gray-200 shadow-lg z-[99999]"
        sideOffset={4}
        alignOffset={-4}
        collisionPadding={16}
        avoidCollisions={true}
      >
        {/* User Info Header */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name && user.name !== user.email ? user.name : localization.menu_user}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              {isCaseManager && (
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-800 rounded">
                  {localization.cm_badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <DropdownMenuItem onClick={handleHomeClick} className="cursor-pointer hover:bg-gray-50">
          <Home className="mr-2 h-4 w-4" />
          <span>{localization.menu_home}</span>
        </DropdownMenuItem>

        {isCaseManager && (
          <DropdownMenuItem
            onClick={() => {
              setIsOpen(false);
              navigate(RENDER_URL.CASE_MANAGER_REGISTRATIONS_URL);
            }}
            className="cursor-pointer hover:bg-gray-50"
          >
            <Users className="mr-2 h-4 w-4" />
            <span>{localization.cm_my_registrations || 'My Registrations'}</span>
          </DropdownMenuItem>
        )}

        {!isCaseManager && (
          <DropdownMenuItem
            onClick={handleAccountClick}
            className="cursor-pointer hover:bg-gray-50"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>{localization.title_account_settings}</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer hover:bg-gray-50 text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{localization.button_sign_out}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountButton;
