import React, { useState, useEffect, Fragment } from 'react';

/**
 * LocalFoodBankComponent - Component for displaying local food bank information
 *
 * This component has been migrated from JavaScript to TypeScript and from Bootstrap to Tailwind CSS.
 * It fetches and displays information about food banks in a given zip code area.
 *
 * Features:
 * - Responsive design using Tailwind CSS
 * - Type-safe implementation with TypeScript
 * - API integration for food bank data
 * - Redux integration for zip code state management
 * - Loading states and error handling
 * - Accessible UI components using shadcn/ui
 *
 * Props:
 * - zipCode: The zip code to search for food banks
 */
import { useDispatch } from 'react-redux';
import { API_URL } from '../../Utils/Urls';
import SpinnerComponent from '../General/SpinnerComponent';
import { setCurrentZip } from '../../Store/Search/searchSlice';
import axios from 'axios';

import { Badge } from '../../components/ui/badge';
import { LocalFoodBankComponentProps, FoodBank, FoodBankApiResponse } from './types/home.types';

const LocalFoodBankComponent: React.FC<LocalFoodBankComponentProps> = (props) => {
  const [foodBankData, setFoodBankData] = useState<
    FoodBank | 'no_foodbanks_found' | Record<string, never>
  >({});
  const dispatch = useDispatch();

  useEffect(() => {
    const zipCode = props.zipCode;
    if (zipCode) {
      dispatch(setCurrentZip(zipCode));
      getFoodbanks(zipCode);
    }
  }, [dispatch, props.zipCode]);

  const getFoodbanks = async (zip: string): Promise<void> => {
    if (zip) {
      let foodBankUri = API_URL.FOODBANK_LIST;

      try {
        const resp: { data: FoodBankApiResponse } = await axios.get(foodBankUri, {
          params: { zip_code: zip },
        });
        const { data } = resp;
        setFoodBankData(data?.foodbanks?.[0] || 'no_foodbanks_found');
      } catch (err) {
        // setServerError(true);
        // setLoading(false);
        console.error('Error fetching food banks:', err);
      }
    }
  };

  return (
    <Fragment>
      <h2 className="font-bold text-left text-lg sm:text-xl lg:text-2xl">Your Local Food Bank</h2>
      {Object.keys(foodBankData).length === 0 ? (
        <SpinnerComponent />
      ) : foodBankData === 'no_foodbanks_found' ? (
        <Badge variant="secondary" className="text-sm sm:text-base px-3 sm:px-4 py-2">
          NO FOOD BANKS FOUND WITHIN THE ZIP CODE
        </Badge>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start sm:items-center mt-2">
            <div className="order-1 sm:order-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <span className="inline-block h-[34px] mb-2 sm:mb-0">
                  <img alt="logo" src={(foodBankData as FoodBank).logo} className="max-h-full" />
                </span>
                <span className="font-bold ml-0 sm:ml-2 text-sm sm:text-base">
                  {(foodBankData as FoodBank).name}
                </span>
              </div>
            </div>
            <div className="text-sm text-content-text order-2 sm:order-2">
              {(foodBankData as FoodBank).address} {(foodBankData as FoodBank).city},{' '}
              {(foodBankData as FoodBank).state} {(foodBankData as FoodBank).zip}
            </div>
            <div className="text-sm text-content-text order-3 sm:order-3">
              <div>{(foodBankData as FoodBank).phone}</div>
              <div className="mt-2">
                <a
                  href={(foodBankData as FoodBank).display_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline break-all"
                >
                  {(foodBankData as FoodBank).display_url}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default LocalFoodBankComponent;
