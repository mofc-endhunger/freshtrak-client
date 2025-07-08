declare module 'react-gtm-module' {
  interface TagManagerArgs {
    gtmId: string;
  }

  interface DataLayerArgs {
    dataLayer: {
      event: string;
      [key: string]: any;
    };
  }

  interface TagManager {
    initialize(args: TagManagerArgs): void;
    dataLayer(args: DataLayerArgs): void;
  }

  const TagManager: TagManager;
  export default TagManager;
} 