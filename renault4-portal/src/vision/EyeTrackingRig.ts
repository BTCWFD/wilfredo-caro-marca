import { CONFIG } from '../config';
import { HeadTracker } from './HeadTracker';
import { MobileOrientationTracker } from './MobileOrientationTracker';
import { PointerTracker } from './PointerTracker';
import { EyeSource, type TrackingKind } from './EyeSource';
import type { Vec3 } from '../utils/math';

/** Conmuta entre fuentes de tracking y entrega la posición activa del ojo. */
export class EyeTrackingRig {
  private readonly sources = new Map<TrackingKind, EyeSource>();
  private active: EyeSource | null = null;
  private preview: HTMLCanvasElement | null = null;

  get activeKind(): TrackingKind | null {
    return this.active?.kind ?? null;
  }

  setPreviewCanvas(canvas: HTMLCanvasElement | null): void {
    this.preview = canvas;
    const head = this.sources.get('webcam');
    if (head instanceof HeadTracker) head.setPreview(canvas);
  }

  /** Activa una fuente. Lanza error si no puede iniciarse (el llamador decide el fallback). */
  async use(kind: TrackingKind): Promise<void> {
    if (this.active?.kind === kind && this.active.status === 'active') return;
    this.active?.stop();
    this.active = null;

    const source = this.resolve(kind);
    await source.start();
    this.active = source;
  }

  /** Posición del ojo en metros. Sin fuente activa, vista frontal por defecto. */
  sample(nowSec: number): Vec3 {
    if (this.active) return this.active.sample(nowSec);
    return [0, 0, CONFIG.eye.defaultDistanceM];
  }

  calibrate(): void {
    this.active?.calibrate();
  }

  stopAll(): void {
    for (const s of this.sources.values()) s.stop();
    this.active = null;
  }

  private resolve(kind: TrackingKind): EyeSource {
    let source = this.sources.get(kind);
    if (!source) {
      if (kind === 'webcam') {
        const head = new HeadTracker();
        head.setPreview(this.preview);
        source = head;
      } else if (kind === 'gyro') {
        source = new MobileOrientationTracker();
      } else {
        source = new PointerTracker();
      }
      this.sources.set(kind, source);
    }
    return source;
  }
}
