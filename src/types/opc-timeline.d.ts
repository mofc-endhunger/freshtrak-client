declare namespace JSX {
  interface IntrinsicElements {
    'opc-timeline': {
      id?: string;
      'current-step-index'?: number;
      children?: React.ReactNode;
    };
  }
}

declare global {
  interface HTMLElement {
    steps?: string[];
  }
}
