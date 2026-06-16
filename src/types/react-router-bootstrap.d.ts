declare module 'react-router-bootstrap' {
  import { ComponentType } from 'react';

  interface LinkContainerProps {
    to: string | { pathname: string; state?: any };
    children: React.ReactElement;
    [key: string]: any;
  }

  export const LinkContainer: ComponentType<LinkContainerProps>;
}
