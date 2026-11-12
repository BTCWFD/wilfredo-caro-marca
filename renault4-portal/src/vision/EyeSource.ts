import { CONFIG } from '../config';
import { Vec3OneEuro } from '../utils/OneEuroFilter';
import type { Vec3 } from '../utils/math';
import { clamp } from '../utils/math';

export type TrackingKind = 'webcam' | 'mouse' | 'gyro';
export type SourceStatus = 'idle' | 'starting' | 'active' | 'error';

export const TRACKING_LABELS: Record<TrackingKind, string> = {
  webcam: 'Webcam',
  mouse: 'Ratón / táctil',
  gyro: 'Giroscopio',
};

/**
 * Base común de las fuentes de tracking.
 *
 * Cada fuente publica una medición cruda en metros (`setRaw`). La base:
 *  - fija la vista neutra (la primera medición o la última recalibración),
 *  - traduce el desplazamiento respecto a esa vista a una posición de ojo,
 *  - aplica One Euro sobre la posición final,
 *  - mantiene la última posición válida si la fuente pierde la señal.
 */
export abstract class EyeSource {
  abstract readonly kind: TrackingKind;
  status: SourceStatus = 'idle';
  error: string | null = null;

  /** Última medición cruda válida (metros, relativa al sensor). null si no hay señal. */
  protected raw: Vec3 | null = null;

  private neutral: Vec3 | null = null;
  private eyeM: Vec3 = [0, 0, CONFIG.eye.defaultDistanceM];
  private readonly filter = new Vec3OneEuro(CONFIG.filter);

  abstract start(): Promise<void>;
  abstract stop(): void;

  protected setRaw(value: Vec3 | null): void {
    this.raw = value;
  }

  /** Fija una vista neutra de partida (por defecto, la primera medición válida). */
  protected setNeutral(value: Vec3): void {
    this.neutral = [value[0], value[1], value[2]];
  }

  /** Hace que la postura actual sea la vista central (frente al cristal). */
  calibrate(): void {
    if (this.raw) this.neutral = [this.raw[0], this.raw[1], this.raw[2]];
  }

  /** Posición del ojo en metros respecto al centro del monitor. */
  sample(nowSec: number): Vec3 {
    const raw = this.raw;
    if (raw) {
      if (!this.neutral) this.neutral = [raw[0], raw[1], raw[2]];
      const n = this.neutral;
      const target: Vec3 = [
        raw[0] - n[0],
        raw[1] - n[1],
        clamp(
          CONFIG.eye.defaultDistanceM + (raw[2] - n[2]),
          CONFIG.eye.minDistanceM,
          CONFIG.eye.maxDistanceM,
        ),
      ];
      this.eyeM = this.filter.filter(target, nowSec);
    }
    return this.eyeM;
  }
}
