/**
 * Type definitions for Eligibility components
 */

/**
 * Props for EligibilityModalComponent
 */
export interface EligibilityModalComponentProps {
    show: boolean;
    close: () => void;
    columnData: string[];
    rowsData: (string | number)[][];
    addOnData: string;
    header: string;
    footer: string;
}

/**
 * Props for HouseHoldEligibilityComponent
 */
export interface HouseHoldEligibilityComponentProps {
    header?: string;
    body?: string;
    footer?: string;
}

/**
 * Parsed body data structure
 */
export interface ParsedBodyData {
    columns?: string[];
    rows?: (string | number)[][];
    addon?: string;
}

