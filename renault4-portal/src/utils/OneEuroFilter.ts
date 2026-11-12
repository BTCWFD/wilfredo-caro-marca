import type { Vec3 } from './math';

/**
 * One Euro Filter (Casiez et al., CHI 2012).
 * Suaviza el jitter en reposo y mantiene baja latencia cuando el movimiento es rápido.
 */
export class OneEuroFilter {
  private prevX: number | null = null;
  private prevDx = 0;
  private prevT: number | null = null;

  constructor(
    private readonly minCutoff: number,
    private readonly beta: number,
    private readonly dCutoff: number,
  ) {}

  reset(): void {
    this.prevX = null;
    this.prevT = null;
    this.prevDx = 0;
  }

  /** @param t marca de tiempo en segundos (monotónica). */
  filter(x: number, t: number): number {
    if (this.prevX === null || this.prevT === null) {
      this.prevX = x;
      this.prevT = t;
      return x;
    }
    const dt = Math.max(t - this.prevT, 1e-4);
    this.prevT = t;

    const dx = (x - this.prevX) / dt;
    const aD = smoothingFactor(this.dCutoff, dt);
    this.prevDx = aD * dx + (1 - aD) * this.prevDx;

    const cutoff = this.minCutoff + this.beta * Math.abs(this.prevDx);
    const a = smoothingFactor(cutoff, dt);
    this.prevX = a * x + (1 - a) * this.prevX;
    return this.prevX;
  }
}

/** Filtro One Euro independiente para cada eje de un vector. */
export class Vec3OneEuro {
  private readonly fx: OneEuroFilter;
  private readonly fy: OneEuroFilter;
  private readonly fz: OneEuroFilter;

  constructor(opts: { minCutoff: number; beta: number; dCutoff: number }) {
    this.fx = new OneEuroFilter(opts.minCutoff, opts.beta, opts.dCutoff);
    this.fy = new OneEuroFilter(opts.minCutoff, opts.beta, opts.dCutoff);
    this.fz = new OneEuroFilter(opts.minCutoff, opts.beta, opts.dCutoff);
  }

  filter(v: Vec3, t: number): Vec3 {
    return [this.fx.filter(v[0], t), this.fy.filter(v[1], t), this.fz.filter(v[2], t)];
  }

  reset(): void {
    this.fx.reset();
    this.fy.reset();
    this.fz.reset();
  }
}

function smoothingFactor(cutoff: number, dt: number): number {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
}
