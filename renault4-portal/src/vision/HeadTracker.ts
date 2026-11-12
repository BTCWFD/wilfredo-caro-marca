import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { CONFIG } from '../config';
import { EyeSource } from './EyeSource';
import { clamp, type Vec3 } from '../utils/math';
import { describeError } from '../utils/errors';

/** Índices de los centros de iris (MediaPipe Face Mesh con refinamiento de iris). */
const IRIS_RIGHT = 468;
const IRIS_LEFT = 473;

/**
 * Tracking facial 3D con MediaPipe FaceLandmarker (WASM / GPU) sobre la webcam.
 *
 * Profundidad: con el IPD (distancia entre iris) en píxeles y el IPD real (63 mm),
 * Z = f · IPD_real / IPD_px, con f = (W/2) / tan(FOV/2).
 * Lateral: se retro-proyecta el centro de los ojos a esa profundidad.
 */
export class HeadTracker extends EyeSource {
  readonly kind = 'webcam' as const;

  private readonly video: HTMLVideoElement;
  private landmarker: FaceLandmarker | null = null;
  private stream: MediaStream | null = null;
  private rafId = 0;
  private running = false;
  private lastDetectMs = 0;
  private preview: HTMLCanvasElement | null = null;

  constructor() {
    super();
    this.video = document.createElement('video');
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.setAttribute('aria-hidden', 'true');
    // Oculto pero presente en el DOM: algunos navegadores no reproducen fuera de él.
    Object.assign(this.video.style, {
      position: 'fixed',
      width: '1px',
      height: '1px',
      opacity: '0',
      pointerEvents: 'none',
      left: '0',
      top: '0',
    });
    document.body.appendChild(this.video);
  }

  setPreview(canvas: HTMLCanvasElement | null): void {
    this.preview = canvas;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.status = 'starting';
    this.error = null;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Este navegador no permite acceder a la cámara');
      }
      this.landmarker ??= await createFaceLandmarker();
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: { ideal: CONFIG.webcam.width },
          height: { ideal: CONFIG.webcam.height },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 30 },
        },
      });
      this.video.srcObject = this.stream;
      await this.video.play();
      this.running = true;
      this.status = 'active';
      this.rafId = requestAnimationFrame(this.onFrame);
    } catch (err) {
      this.stopCamera();
      this.status = 'error';
      this.error = describeError(err);
      throw new Error(this.error);
    }
  }

  stop(): void {
    this.stopCamera();
    this.status = 'idle';
  }

  private stopCamera(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.video.srcObject = null;
    this.setRaw(null);
  }

  private readonly onFrame = (nowMs: number): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.onFrame);

    if (nowMs - this.lastDetectMs < CONFIG.webcam.detectIntervalMs) return;
    const v = this.video;
    if (!this.landmarker || v.readyState < 2 || v.videoWidth === 0) return;

    this.lastDetectMs = nowMs;
    const result = this.landmarker.detectForVideo(v, nowMs);
    this.ingest(result);
    if (this.preview) this.drawPreview(result);
  };

  private ingest(result: FaceLandmarkerResult): void {
    const lm = result.faceLandmarks[0];
    if (!lm || lm.length <= IRIS_LEFT) {
      this.setRaw(null);
      return;
    }
    const w = this.video.videoWidth;
    const h = this.video.videoHeight;
    const a = lm[IRIS_RIGHT];
    const b = lm[IRIS_LEFT];

    // Distancia entre pupilas en píxeles de la imagen.
    const ipdPx = Math.hypot((b.x - a.x) * w, (b.y - a.y) * h);
    if (ipdPx < 4) {
      this.setRaw(null);
      return;
    }

    const tanH = Math.tan((CONFIG.webcam.horizontalFovDeg * Math.PI) / 360);
    const tanV = tanH * (h / w);
    const focalPx = w / 2 / tanH;

    const z = clamp(
      (focalPx * CONFIG.webcam.interPupillaryM) / ipdPx,
      CONFIG.eye.minDistanceM,
      CONFIG.eye.maxDistanceM,
    );

    // Centro entre ojos en coordenadas normalizadas [0, 1].
    const nx = (a.x + b.x) / 2;
    const ny = (a.y + b.y) / 2;

    // La imagen no está espejada: si el usuario se mueve a su derecha, nx baja.
    const x = (0.5 - nx) * 2 * z * tanH;
    const y = (0.5 - ny) * 2 * z * tanV;

    const v: Vec3 = [x, y, z];
    this.setRaw(v);
  }

  /** Dibuja la webcam (espejada) con los 478 landmarks y resalta los iris. */
  private drawPreview(result: FaceLandmarkerResult): void {
    const c = this.preview;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const { width: W, height: H } = c;

    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(this.video, 0, 0, W, H);
    ctx.restore();

    const lm = result.faceLandmarks[0];
    if (!lm) return;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    for (const p of lm) {
      ctx.fillRect((1 - p.x) * W, p.y * H, 1.2, 1.2);
    }
    ctx.fillStyle = '#ff7a1a';
    for (const idx of [IRIS_RIGHT, IRIS_LEFT]) {
      const p = lm[idx];
      ctx.beginPath();
      ctx.arc((1 - p.x) * W, p.y * H, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Carga el modelo en GPU y, si falla, en CPU. */
async function createFaceLandmarker(): Promise<FaceLandmarker> {
  const fileset = await FilesetResolver.forVisionTasks(CONFIG.webcam.wasmBaseUrl);
  const build = (delegate: 'GPU' | 'CPU') =>
    FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: CONFIG.webcam.modelUrl, delegate },
      runningMode: 'VIDEO',
      numFaces: 1,
    });
  try {
    return await build('GPU');
  } catch (gpuErr) {
    console.warn('FaceLandmarker en GPU no disponible, usando CPU:', gpuErr);
    return build('CPU');
  }
}
