import { TRACKING_LABELS, type TrackingKind } from '../vision/EyeSource';
import type { SceneLoadResult } from '../scene/GaussianSceneManager';
import type { Vec3 } from '../utils/math';

export type Tone = 'info' | 'ok' | 'warn' | 'error';

export interface HudHandlers {
  onEnter: () => void;
  onSource: (kind: TrackingKind) => void;
  onCalibrate: () => void;
  onDebugToggle: (on: boolean) => void;
  onPipToggle: (on: boolean) => void;
}

const TEMPLATE = `
<section data-start class="fixed inset-0 z-30 flex items-center justify-center bg-ink/90 px-4 backdrop-blur-sm transition-opacity duration-700">
  <div class="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center shadow-2xl sm:p-8">
    <p class="text-[11px] uppercase tracking-[0.35em] text-signal">Portal 3D · Gaussian Splatting</p>
    <h1 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Renault 4</h1>
    <p class="mt-3 text-sm leading-relaxed text-chrome/70">
      Mira a través de la ventana. Tu cabeza, el móvil o el ratón cambian el ángulo de la proyección óptica real.
    </p>
    <button type="button" data-enter class="mt-6 w-full rounded-xl bg-signal px-5 py-3 font-medium text-ink transition hover:brightness-110 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">
      Entrar al Portal (Activar Cámara / Sensores)
    </button>
    <p class="mt-4 text-xs text-chrome/50">
      La cámara sólo se usa en tu navegador para estimar la posición de tu cabeza. Ningún vídeo sale de tu dispositivo.
    </p>
  </div>
</section>

<header class="pointer-events-none fixed inset-x-4 top-4 z-20 flex flex-col items-start gap-2 sm:inset-x-6 sm:top-6">
  <div data-chip class="pointer-events-auto max-w-full rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs text-chrome/80 backdrop-blur">
    <span data-chip-text>Preparando…</span>
  </div>
  <p data-status class="hidden rounded-lg border border-white/10 bg-black/55 px-3 py-1.5 text-xs text-chrome/80 backdrop-blur"></p>
</header>

<div data-toolbar class="pointer-events-auto fixed inset-x-4 bottom-4 z-20 mx-auto flex max-w-fit flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-md sm:bottom-6">
  <div role="group" aria-label="Fuente de tracking" class="flex rounded-xl bg-white/5 p-1">
    <button type="button" data-source="webcam" aria-pressed="false" class="seg-btn">Webcam</button>
    <button type="button" data-source="mouse" aria-pressed="false" class="seg-btn">Ratón</button>
    <button type="button" data-source="gyro" aria-pressed="false" class="seg-btn">Giroscopio</button>
  </div>
  <button type="button" data-calibrate class="btn">Recalibrar Vista</button>
  <button type="button" data-debug aria-pressed="false" class="btn">Debug</button>
  <button type="button" data-pip aria-pressed="false" class="btn">Vista cámara</button>
</div>

<canvas data-pip-canvas width="192" height="144" aria-label="Previsualización de landmarks faciales" class="pointer-events-none fixed bottom-24 right-4 z-20 hidden h-[108px] w-[144px] rounded-lg border border-white/15 bg-black/70 sm:bottom-28"></canvas>

<pre data-eye class="pointer-events-none fixed bottom-4 left-4 z-20 hidden rounded-lg border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] leading-5 text-chrome/85 sm:bottom-6 sm:left-6"></pre>

<div data-toast role="status" aria-live="polite" class="pointer-events-none fixed left-1/2 top-24 z-40 hidden max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border px-4 py-2 text-sm shadow-lg"></div>
`;

const TONE_CLASSES: Record<Tone, string> = {
  info: 'border-white/10 bg-black/70 text-chrome',
  ok: 'border-emerald-400/30 bg-emerald-950/80 text-emerald-100',
  warn: 'border-amber-400/30 bg-amber-950/80 text-amber-100',
  error: 'border-rose-400/30 bg-rose-950/80 text-rose-100',
};

/**
 * HUD en JavaScript puro con Tailwind. Gestiona el DOM y no conoce la escena:
 * sólo emite eventos a través de `handlers`.
 */
export class OverlayHUD {
  readonly pipCanvas: HTMLCanvasElement;

  private readonly startEl: HTMLElement;
  private readonly enterBtn: HTMLButtonElement;
  private readonly chipText: HTMLElement;
  private readonly statusEl: HTMLElement;
  private readonly sourceBtns: HTMLButtonElement[];
  private readonly debugBtn: HTMLButtonElement;
  private readonly pipBtn: HTMLButtonElement;
  private readonly eyeEl: HTMLElement;
  private readonly toastEl: HTMLElement;
  private toastTimer = 0;

  constructor(
    private readonly root: HTMLElement,
    private readonly handlers: HudHandlers,
  ) {
    root.innerHTML = TEMPLATE;
    const q = <T extends Element>(sel: string): T => {
      const el = root.querySelector<T>(sel);
      if (!el) throw new Error(`HUD: falta el elemento ${sel}`);
      return el;
    };

    this.startEl = q('[data-start]');
    this.enterBtn = q<HTMLButtonElement>('[data-enter]');
    this.chipText = q('[data-chip-text]');
    this.statusEl = q('[data-status]');
    this.sourceBtns = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-source]'));
    this.debugBtn = q<HTMLButtonElement>('[data-debug]');
    this.pipBtn = q<HTMLButtonElement>('[data-pip]');
    this.pipCanvas = q<HTMLCanvasElement>('[data-pip-canvas]');
    this.eyeEl = q('[data-eye]');
    this.toastEl = q('[data-toast]');

    this.enterBtn.addEventListener('click', () => this.handlers.onEnter());
    for (const btn of this.sourceBtns) {
      btn.addEventListener('click', () => {
        const kind = btn.dataset.source as TrackingKind | undefined;
        if (kind) this.handlers.onSource(kind);
      });
    }
    q<HTMLButtonElement>('[data-calibrate]').addEventListener('click', () => this.handlers.onCalibrate());
    this.debugBtn.addEventListener('click', () => {
      const on = this.debugBtn.getAttribute('aria-pressed') !== 'true';
      this.setToggle(this.debugBtn, on);
      this.eyeEl.classList.toggle('hidden', !on);
      this.handlers.onDebugToggle(on);
    });
    this.pipBtn.addEventListener('click', () => {
      const on = this.pipBtn.getAttribute('aria-pressed') !== 'true';
      this.setToggle(this.pipBtn, on);
      this.pipCanvas.classList.toggle('hidden', !on);
      this.handlers.onPipToggle(on);
    });
  }

  showStart(): void {
    this.startEl.classList.remove('hidden');
    this.enterBtn.disabled = false;
  }

  hideStart(): void {
    this.startEl.classList.add('pointer-events-none', 'opacity-0');
    window.setTimeout(() => this.startEl.classList.add('hidden'), 700);
  }

  setEnterBusy(busy: boolean): void {
    this.enterBtn.disabled = busy;
  }

  setChip(text: string): void {
    this.chipText.textContent = text;
  }

  setSceneResult(result: SceneLoadResult): void {
    if (result.mode === 'real') {
      this.setChip(`Escaneo 3DGS real · ${result.sourcePath ?? ''}`);
    } else {
      this.setChip(
        'Modo Demo Procedural — Coloca `renault4.ksplat` en `public/assets/` para el escaneo 3DGS real',
      );
    }
  }

  /** Mensaje de estado (carga, errores de sensores, etc.). Texto vacío lo oculta. */
  setStatus(text: string, tone: Tone = 'info'): void {
    if (!text) {
      this.statusEl.classList.add('hidden');
      return;
    }
    this.statusEl.textContent = text;
    this.statusEl.classList.remove('hidden');
    this.statusEl.className = `rounded-lg border px-3 py-1.5 text-xs backdrop-blur ${TONE_CLASSES[tone]}`;
  }

  setSource(kind: TrackingKind | null, status?: string): void {
    for (const btn of this.sourceBtns) {
      this.setToggle(btn, btn.dataset.source === kind);
    }
    if (kind && status) this.setStatus(`${TRACKING_LABELS[kind]}: ${status}`, 'info');
  }

  setDebugVisible(on: boolean): void {
    this.setToggle(this.debugBtn, on);
    this.eyeEl.classList.toggle('hidden', !on);
  }

  updateEye(eyeM: Vec3, kind: TrackingKind | null, fps: number): void {
    if (this.eyeEl.classList.contains('hidden')) return;
    const f = (v: number) => (v >= 0 ? '+' : '') + v.toFixed(3);
    this.eyeEl.textContent =
      `fuente  ${kind ? TRACKING_LABELS[kind] : '—'}\n` +
      `ojo X   ${f(eyeM[0])} m\n` +
      `ojo Y   ${f(eyeM[1])} m\n` +
      `ojo Z   ${eyeM[2].toFixed(3)} m\n` +
      `fps     ${fps.toFixed(0)}`;
  }

  toast(message: string, tone: Tone = 'info', durationMs = 3800): void {
    this.toastEl.textContent = message;
    this.toastEl.className = `pointer-events-none fixed left-1/2 top-24 z-40 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border px-4 py-2 text-sm shadow-lg ${TONE_CLASSES[tone]}`;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.add('hidden'), durationMs);
  }

  private setToggle(btn: HTMLButtonElement, on: boolean): void {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('is-on', on);
  }

  /** Rebuild-safe: quita el contenido del HUD. */
  destroy(): void {
    this.root.innerHTML = '';
  }
}
