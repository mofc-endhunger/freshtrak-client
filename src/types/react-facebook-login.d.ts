declare module 'react-facebook-login' {
  import React from 'react';

  interface FacebookLoginProps {
    appId: string;
    size?: 'small' | 'medium' | 'metro';
    autoLoad?: boolean;
    fields?: string;
    callback: (response: any) => void;
    icon?: string;
    style?: React.CSSProperties;
    textButton?: string;
    typeButton?: string;
    class?: string;
    xfbml?: boolean;
    cookie?: boolean;
    scope?: string;
    language?: string;
    version?: string;
    onFailure?: (response: any) => void;
    onClick?: () => void;
    isDisabled?: boolean;
    disableMobileRedirect?: boolean;
    redirectUri?: string;
    state?: string;
    responseType?: string;
    returnScopes?: boolean;
    authType?: string;
    reAuthenticate?: boolean;
    render?: (renderProps: any) => React.ReactElement;
  }

  const FacebookLogin: React.FC<FacebookLoginProps>;
  export default FacebookLogin;
} 