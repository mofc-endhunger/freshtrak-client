import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import localization from './LocalizationComponent';
import { getTranslatedLanguageOptions } from './languageOptions';

interface CountryListComponentProps {
  change: (event: React.ChangeEvent<HTMLSelectElement>, data: { value: string }) => void;
  /** Current language code from Redux; keeps dropdown in sync when language is set from household setup or on load */
  currentLanguage?: string;
}

const CountryListComponent: React.FC<CountryListComponentProps> = (props) => {
  const [selectedValue, setSelectedValue] = useState<string>(props.currentLanguage ?? '');

  useEffect(() => {
    if (props.currentLanguage !== undefined && props.currentLanguage !== '') {
      setSelectedValue(props.currentLanguage);
    }
  }, [props.currentLanguage]);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    // Create a synthetic event to maintain compatibility with existing code
    const syntheticEvent = {
      target: { value },
    } as React.ChangeEvent<HTMLSelectElement>;
    props.change(syntheticEvent, { value });
  };

  return (
    <Select value={selectedValue} onValueChange={handleValueChange}>
      <SelectTrigger
        className="bg-white text-gray-400 border border-white rounded px-2 md:px-3 py-1 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 h-auto min-w-[140px]"
        data-testid="language-selector"
      >
        <SelectValue placeholder={localization.placeholder_select_language} />
      </SelectTrigger>
      <SelectContent className="bg-white z-[10000]">
        {getTranslatedLanguageOptions().map((option) => (
          <SelectItem key={option.code} value={option.code} className="text-gray-900">
            {option.text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountryListComponent;
