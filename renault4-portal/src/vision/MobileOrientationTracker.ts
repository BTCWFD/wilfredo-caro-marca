import { CONFIG } from '../config';
import { EyeSource } from './EyeSource';
import type { Vec3 } from '../utils/math';
import { describeError } from '../utils/errors';

type OrientationPermissionApi = {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

/**
 * Giroscopio / acelerómetro vía DeviceOrientationEvent.
 * gamma (izquierda/derecha) y beta (adelante/atrás) se convierten en desplazamiento
 * del ojo. La vista neutra es la postura en el momento de calibrar.
 * En iOS 13+ el permiso debe pedirse dentro de un gesto del usuario.
 */
export class MobileOrientationTracker extends EyeSource {
  readonly kind = 'gyro' as const;

  private readonly onOrientation = (e: DeviceOrientationEvent): void => {
    if (e.beta === null || e.gamma === null) return;
    const k = CONFIG.orientation.rangeM / CONFIG.orientation.rangeDeg;
    const sy = CONFIG.orientation.invertY ? -1 : 1;
    const v: Vec3 = [e.gamma * k, sy * e.beta * k, CONFIG.eye.defaultDistanceM];
    this.setRaw(v);
  };

  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
  }

  async start(): Promise<void> {
    if (this.status === 'active') return;
    if (!MobileOrientationTracker.isSupported()) {
      this.status = 'error';
      this.error = 'Este dispositivo no expone sensores de orientación';
      throw new Error(this.error);
    }

    this.status = 'starting';
    this.error = null;
    try {
      const api = DeviceOrientationEvent as unknown as OrientationPermissionApi;
      if (typeof api.requestPermission === 'function') {
        const state = await api.requestPermission();
        if (state !== 'granted') throw new Error('Permiso de sensores denegado');
      }

      window.addEventListener('deviceorientation', this.onOrientation);
      const ok = await waitFor(() => this.raw !== null, CONFIG.orientation.waitMs);
      if (!ok) throw new Error('Sin lecturas del giroscopio');
      this.status = 'active';
    } catch (err) {
      this.stop();
      this.status = 'error';
      this.error = describeError(err);
      throw new Error(this.error);
    }
  }

  stop(): void {
    window.removeEventListener('deviceorientation', this.onOrientation);
    this.setRaw(null);
    this.status = 'idle';
  }
}

function waitFor(predicate: () => boolean, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (): void => {
      if (predicate()) return resolve(true);
      if (performance.now() - start > timeoutMs) return resolve(false);
      setTimeout(tick, 100);
    };
    tick();
  });
}
