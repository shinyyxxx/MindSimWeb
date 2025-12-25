/// <reference types="vite/client" />
/// <reference types="react" />

// React Three Fiber JSX types
declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      mesh: any;
      primitive: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      'model-viewer': {
        src?: string;
        alt?: string;
        'camera-controls'?: boolean;
        'disable-zoom'?: boolean;
        'auto-rotate'?: boolean;
        'rotation-per-second'?: string;
        'touch-action'?: string;
        style?: React.CSSProperties;
        children?: React.ReactNode;
      };
    }
  }
  
  // Also declare in the global JSX namespace for compatibility
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      primitive: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      'model-viewer': {
        src?: string;
        alt?: string;
        'camera-controls'?: boolean;
        'disable-zoom'?: boolean;
        'auto-rotate'?: boolean;
        'rotation-per-second'?: string;
        'touch-action'?: string;
        style?: React.CSSProperties;
        children?: React.ReactNode;
      };
    }
  }
}

export {};


