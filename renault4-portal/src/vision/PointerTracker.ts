import { CONFIG } from '../config';
import { EyeSource } from './EyeSource';

/**
 * Fallback de escritorio y táctil: el puntero se toma como posición del ojo.
 * Mover el puntero a la derecha desplaza la vista a la derecha, como en la webcam.
 */
export class PointerTracker extends EyeSource {
  readonly kind = 'mouse' as const;

  constructor() {
    super();
    // El centro de la ventana es la vista neutra: el puntero en el centro no desplaza el ojo.
    this.setNeutral([0, 0, CONFIG.eye.defaultDistanceM]);
  }

  private readonly onMove = (e: PointerEvent): void => {
    const nx = e.clientX / Math.max(window.innerWidth, 1);
    const ny = e.clientY / Math.max(window.innerHeight, 1);
    const r = CONFIG.pointer.rangeM;
    this.setRaw([(nx - 0.5) * 2 * r, (0.5 - ny) * 2 * r, CONFIG.eye.defaultDistanceM]);
  };

  async start(): Promise<void> {
    if (this.status === 'active') return;
    window.addEventListener('pointermove', this.onMove, { passive: true });
    this.status = 'active';
    this.error = null;
  }

  stop(): void {
    window.removeEventListener('pointermove', this.onMove);
    this.setRaw(null);
    this.status = 'idle';
  }
}
