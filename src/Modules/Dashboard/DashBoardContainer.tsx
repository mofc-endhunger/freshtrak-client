import React from 'react';
import DashBoardDataComponent from './DashBoardDataComponent';
import DashBoardFoodBankComponent from './DashBoardFoodBankComponent';
import { DashBoardContainerProps } from './types/dashboard.types';

/**
 * DashBoardContainer - Main container component that orchestrates the dashboard layout
 *
 * This component serves as the primary wrapper for the Dashboard module, organizing
 * the layout into two main sections: the main content area and the food bank services section.
 *
 * @component
 * @param {DashBoardContainerProps} props - Component props (currently empty for future extensibility)
 * @returns {JSX.Element} The dashboard container with main content and food bank sections
 *
 * @example
 * ```tsx
 * <DashBoardContainer />
 * ```
 */
const DashBoardContainer: React.FC<DashBoardContainerProps> = () => {
  return (
    <React.Fragment>
      <section data-testid="dashboard-page">
        <DashBoardDataComponent />
      </section>
      <section className="bg-gray-100">
        <DashBoardFoodBankComponent />
      </section>
    </React.Fragment>
  );
};

export default DashBoardContainer;
