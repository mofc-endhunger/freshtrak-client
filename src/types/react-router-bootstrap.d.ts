declare module 'react-router-bootstrap' {
  import React from 'react';
  import { LinkProps } from 'react-router-dom';

  interface LinkContainerProps extends LinkProps {
    children: React.ReactElement;
  }

  export const LinkContainer: React.FC<LinkContainerProps>;
} 