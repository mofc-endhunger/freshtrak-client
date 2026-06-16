import React, { Fragment } from 'react';
import { Input } from '../../components/ui/input';

export interface PhoneInputProps {
  name: string;
  value?: string | number;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  type?: string;
  'data-testid'?: string;
}

const normalizeInput = (value: unknown): string => {
  try {
    if (typeof value !== 'string' && typeof value !== 'number') {
      // Only string and number types are valid for phone normalization.
      // Other types (e.g., objects, booleans, undefined) cannot be converted to a phone number format and are considered invalid.
      return '';
    }
    const strValue = String(value);
    const currentValue = strValue.replace(/[^\d]/g, '');
    const cvLength = currentValue.length;

    if (strValue.length) {
      if (cvLength < 4) return currentValue;
      if (cvLength < 7) return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3)}`;
      return `(${currentValue.slice(0, 3)}) ${currentValue.slice(
        3,
        6,
      )}-${currentValue.slice(6, 10)}`;
    } else {
      return strValue;
    }
  } catch (err) {
    // Error handling for phone normalization
    return '';
  }
};

const PhoneInputComponent: React.FC<PhoneInputProps> = ({
  name,
  value,
  onChange,
  id,
  placeholder,
  className,
  type = 'text',
  'data-testid': testId,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedPhone = normalizeInput(e.target.value);
    onChange(updatedPhone);
  };

  return (
    <Fragment>
      <Input
        type={type}
        className={className}
        name={name}
        placeholder={placeholder}
        id={id}
        value={normalizeInput(value)}
        onChange={handleChange}
        data-testid={testId}
      />
    </Fragment>
  );
};

export default PhoneInputComponent;
