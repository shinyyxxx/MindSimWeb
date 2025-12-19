/// <reference types="vite/client" />

// React Three Fiber JSX types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      primitive: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
    }
  }
}

export {};


