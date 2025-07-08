declare module 'react-rangeslider' {
  import React from 'react';

  interface SliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    orientation?: 'horizontal' | 'vertical';
    reverse?: boolean;
    disabled?: boolean;
    labels?: { [key: number]: string };
    handleLabel?: string;
    format?: (value: number) => string;
    onChange?: (value: number) => void;
    onStart?: () => void;
    onChangeStart?: () => void;
    onChangeEnd?: () => void;
    tooltip?: boolean;
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
    id?: string;
  }

  const Slider: React.FC<SliderProps>;
  export default Slider;
} 