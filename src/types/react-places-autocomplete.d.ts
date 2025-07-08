declare module 'react-places-autocomplete' {
  import React from 'react';

  interface Suggestion {
    id: string;
    description: string;
    place_id: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
    terms: Array<{
      offset: number;
      value: string;
    }>;
    types: string[];
  }

  interface PlacesAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (address: string) => void;
    onError?: (error: string) => void;
    searchOptions?: {
      componentRestrictions?: {
        country: string | string[];
      };
      types?: string[];
    };
    debounce?: number;
    highlightFirstSuggestion?: boolean;
    children: (props: {
      getInputProps: (options?: any) => any;
      suggestions: Suggestion[];
      getSuggestionItemProps: (suggestion: Suggestion) => any;
      loading: boolean;
    }) => React.ReactElement;
  }

  const PlacesAutocomplete: React.FC<PlacesAutocompleteProps>;
  export default PlacesAutocomplete;

  export function geocodeByAddress(address: string): Promise<any[]>;
  export function getLatLng(place: any): Promise<{ lat: number; lng: number }>;
} 