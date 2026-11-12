/**
 * Tipos mínimos para @mkkellogg/gaussian-splats-3d (la librería se distribuye sin .d.ts).
 * Reflejan la API de build/gaussian-splats-3d.module.js (v0.4.7) usada en este proyecto.
 */
declare module '@mkkellogg/gaussian-splats-3d' {
  import type * as THREE from 'three';

  export const SceneFormat: {
    readonly Splat: 0;
    readonly KSplat: 1;
    readonly Ply: 2;
    readonly Spz: 3;
  };
  export type SceneFormatValue = 0 | 1 | 2 | 3;

  export const RenderMode: { readonly Always: 0; readonly OnChange: 1; readonly Never: 2 };
  export const SceneRevealMode: { readonly Default: 0; readonly Gradual: 1; readonly Instant: 2 };
  export const LogLevel: {
    readonly None: 0;
    readonly Error: 1;
    readonly Warning: 2;
    readonly Info: 3;
    readonly Debug: 4;
  };

  /** LoaderStatus: 0 = Downloading, 1 = Processing, 2 = Done (según el build). */
  export type ProgressCallback = (percentComplete: number, label: string, status: number) => void;

  export interface SplatSceneOptions {
    path: string;
    format?: SceneFormatValue;
    position?: [number, number, number];
    /** Cuaternión en orden [x, y, z, w]. */
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
    splatAlphaRemovalThreshold?: number;
    showLoadingUI?: boolean;
    progressiveLoad?: boolean;
  }

  export interface ViewerOptions {
    renderer?: THREE.WebGLRenderer;
    camera?: THREE.Camera;
    threeScene?: THREE.Scene;
    rootElement?: HTMLElement;
    cameraUp?: [number, number, number];
    selfDrivenMode?: boolean;
    useBuiltInControls?: boolean;
    sharedMemoryForWorkers?: boolean;
    gpuAcceleratedSort?: boolean;
    integerBasedSort?: boolean;
    renderMode?: 0 | 1 | 2;
    sceneRevealMode?: 0 | 1 | 2;
    dynamicScene?: boolean;
    antialiased?: boolean;
    logLevel?: 0 | 1 | 2 | 3 | 4;
  }

  export class Viewer {
    constructor(options?: ViewerOptions);
    addSplatScenes(
      scenes: SplatSceneOptions[],
      showLoadingUI?: boolean,
      onProgress?: ProgressCallback,
    ): Promise<void>;
    /** Actualiza ordenado y uniformes. No renderiza. */
    update(renderer?: THREE.WebGLRenderer, camera?: THREE.Camera): void;
    /** Dibuja threeScene y después los splats con la cámara actual. */
    render(): void;
    dispose(): Promise<void>;
  }
}
