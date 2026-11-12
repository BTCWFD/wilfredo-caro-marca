import type { Vec3 } from './utils/math';

/**
 * Parámetros del portal. Todas las distancias de tracking están en metros;
 * la escena usa unidades propias. La conversión sale de `screen`.
 */
export const CONFIG = {
  screen: {
    /** Ancho de la ventana virtual en unidades de escena. */
    widthUnits: 1.6,
    /** Ancho físico del monitor en metros (un 27" ≈ 0.6 m). */
    widthMeters: 0.6,
    near: 0.05,
    far: 60,
  },

  eye: {
    /** Distancia típica de visionado al monitor. */
    defaultDistanceM: 0.6,
    minDistanceM: 0.2,
    maxDistanceM: 1.5,
  },

  /** Suavizado One Euro aplicado a la posición del ojo. */
  filter: {
    minCutoff: 1.0,
    beta: 0.02,
    dCutoff: 1.0,
  },

  webcam: {
    width: 640,
    height: 480,
    /** FOV horizontal aproximado de una webcam estándar. Afecta a la estimación de Z. */
    horizontalFovDeg: 60,
    /** Distancia media entre pupilas de un adulto. */
    interPupillaryM: 0.063,
    /** Límite de detección (≈30 fps). */
    detectIntervalMs: 33,
    /** Modelo oficial de MediaPipe Face Landmarker (float16). */
    modelUrl:
      'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
    /** WASM del mismo paquete que está instalado (@mediapipe/tasks-vision@1.2.2). */
    wasmBaseUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm',
  },

  pointer: {
    /** Recorrido del ojo virtual (metros) de borde a borde de la ventana. */
    rangeM: 0.35,
  },

  orientation: {
    /** Inclinación (grados) que equivale a `rangeM`. */
    rangeDeg: 35,
    rangeM: 0.35,
    /** Invierte el eje vertical si el giro se siente al revés. */
    invertY: false,
    waitMs: 2000,
  },

  /** Transformación de la escena 3DGS. Escala = unidades de escena por unidad del archivo. */
  scene: {
    position: [0, -0.22, -0.55] as Vec3,
    scale: 0.3,
    /** Giro del coche procedural: ~-0.5 rad deja el frontal visible en 3/4. */
    proceduralYawRad: -0.5,
    /** Escaneo real (3DGS), en orden de preferencia. Se sirven desde public/assets/. */
    realScanCandidates: [
      { path: '/assets/renault4.ksplat', format: 'ksplat' },
      { path: '/assets/renault4.splat', format: 'splat' },
      { path: '/assets/renault4.ply', format: 'ply' },
    ] as Array<{ path: string; format: 'ksplat' | 'splat' | 'ply' }>,
    /**
     * Ajustes del escaneo real. Capturas de Luma/Polycam suelen venir con Z hacia arriba:
     * en ese caso pon pitchRad: -Math.PI / 2.
     */
    realScan: {
      yawRad: -0.5,
      pitchRad: 0,
      alphaThreshold: 1,
    },
  },

  procedural: {
    seed: 1975,
    /** Splats por m² de superficie del coche. */
    carDensity: 6500,
    /** Splats por m² de suelo y paredes. */
    environmentDensity: 260,
  },

  renderer: {
    maxPixelRatio: 1.5,
  },
};

/** Conversión de metros de tracking a unidades de escena (1 m físico = widthUnits / widthMeters). */
export function metersToUnits(meters: number): number {
  return (meters * CONFIG.screen.widthUnits) / CONFIG.screen.widthMeters;
}
