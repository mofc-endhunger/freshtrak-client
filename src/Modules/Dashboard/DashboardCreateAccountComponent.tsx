import React from 'react';
import { useNavigate } from 'react-router-dom';
import CalenderIcon from '../../Assets/img/calendar.svg';
import FindFoodIcon from '../../Assets/img/findfood.svg';
import localization from '../Localization/LocalizationComponent';
import { DashboardCreateAccountComponentProps } from './types/dashboard.types';
import FeatureCard from './components/FeatureCard';
import { Button } from '../../components/ui/button';
import { RENDER_URL } from '../../Utils/Urls';

/**
 * DashboardCreateAccountComponent - Displays feature information and call-to-action elements
 *
 * This component showcases the main features of FreshTrak using FeatureCard components.
 * It displays information about staying up to date and finding food resources,
 * with localized content support for multiple languages.
 *
 * @component
 * @param {DashboardCreateAccountComponentProps} props - Component props (currently empty for future extensibility)
 * @returns {JSX.Element} The feature showcase section with icons and descriptions
 *
 * @example
 * ```tsx
 * <DashboardCreateAccountComponent />
 * ```
 */
const DashboardCreateAccountComponent: React.FC<DashboardCreateAccountComponentProps> = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="mb-5 font-bold text-center text-2xl">{localization.home_freshtrack}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-center justify-between">
        <div className="flex flex-row content-center justify-center">
          <FeatureCard
            title={localization.home_stay}
            content={localization.home_comming_soon}
            imageUrl={CalenderIcon}
            className="w-2/3 stay-up-to-date border-none shadow-none"
            action={
              <Button
                onClick={() => navigate(RENDER_URL.LOGIN_URL)}
                data-testid="create-account-button"
              >
                {localization.home_create_account_button}
              </Button>
            }
          />
        </div>
        <div className="flex flex-row content-center justify-center">
          <FeatureCard
            title={localization.home_findfood}
            content={localization.home_zip_details}
            imageUrl={FindFoodIcon}
            className="w-2/3 find-food border-none shadow-none"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardCreateAccountComponent;
