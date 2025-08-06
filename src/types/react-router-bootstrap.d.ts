declare module 'react-router-bootstrap' {
  import { ComponentType } from 'react';

  interface LinkContainerProps {
    to: string;
    children: React.ReactElement;
    [key: string]: any;
  }

  export const LinkContainer: ComponentType<LinkContainerProps>;
} 