declare module 'react-gtm-module' {
  interface TagManager {
    dataLayer: (dataLayer: { dataLayer: any }) => void;
  }

  const TagManager: TagManager;
  export default TagManager;
} 