import './style.css';
import { CONFIG, metersToUnits } from './config';
import { OffAxisCamera } from './core/OffAxisCamera';
import { FrustumDebugHelper } from './scene/FrustumDebugHelper';
import { GaussianSceneManager } from './scene/GaussianSceneManager';
import { EyeTrackingRig } from './vision/EyeTrackingRig';
import { MobileOrientationTracker } from './vision/MobileOrientationTracker';
import { TRACKING_LABELS, type TrackingKind } from './vision/EyeSource';
import { OverlayHUD } from './ui/OverlayHUD';
import type { Vec3 } from './utils/math';
import { describeError } from './utils/errors';

/** Orquesta el portal: escena, cámara off-axis, tracking y HUD. */
class PortalApp {
  private readonly hud: OverlayHUD;
  private readonly rig = new EyeTrackingRig();
  private readonly stage: HTMLElement;

  private camera: OffAxisCamera | null = null;
  private scene: GaussianSceneManager | null = null;
  private debug: FrustumDebugHelper | null = null;

  private running = false;
  private hudDebugOn = false;
  private booting = false;
  private frames = 0;
  private fps = 0;
  private lastFpsMs = 0;
  private lastHudMs = 0;

  constructor(stage: HTMLElement, hudRoot: HTMLElement) {
    this.stage = stage;
    this.hud = new OverlayHUD(hudRoot, {
      onEnter: () => void this.enter(),
      onSource: (kind) => void this.selectSource(kind),
      onCalibrate: () => this.calibrate(),
      onDebugToggle: (on) => this.setDebug(on),
      onPipToggle: (on) => this.rig.setPreviewCanvas(on ? this.hud.pipCanvas : null),
    });
    this.hud.showStart();

    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKey);
  }

  /** Se ejecuta dentro del clic del usuario: necesario para cámara y permisos de sensores. */
  private async enter(): Promise<void> {
    if (this.booting || this.running) return;
    this.booting = true;
    this.hud.setEnterBusy(true);

    try {
      this.camera = new OffAxisCamera({
        screenWidth: CONFIG.screen.widthUnits,
        aspect: window.innerWidth / Math.max(window.innerHeight, 1),
        near: CONFIG.screen.near,
        far: CONFIG.screen.far,
      });
      this.scene = new GaussianSceneManager(this.stage, this.camera);
      this.debug = new FrustumDebugHelper(this.camera, CONFIG.scene.position, CONFIG.scene.scale);
      this.debug.setVisible(this.hudDebugOn);
    } catch (err) {
      this.booting = false;
      this.hud.setEnterBusy(false);
      this.hud.toast(`WebGL2 no disponible: ${messageOf(err)}`, 'error', 10000);
      return;
    }

    this.hud.hideStart();
    this.running = true;
    requestAnimationFrame(this.frame);

    // La fuente se inicia antes de cargar la escena, mientras el gesto del usuario sigue activo.
    const kind = pickDefaultSource();
    const sourceReady = this.selectSource(kind);

    this.hud.setStatus('Cargando escena 3DGS…', 'info');
    try {
      const result = await this.scene.load((msg) => this.hud.setStatus(msg, 'info'));
      this.hud.setSceneResult(result);
      this.hud.setStatus('');
    } catch (err) {
      this.hud.setStatus('');
      this.hud.toast(`Error al cargar la escena: ${messageOf(err)}`, 'error', 9000);
    }

    await sourceReady;
    this.booting = false;
    this.hud.setEnterBusy(false);
  }

  /** Activa una fuente. Si falla, cae a ratón/táctil y lo explica. */
  private async selectSource(kind: TrackingKind): Promise<void> {
    this.hud.setSource(kind, 'iniciando…');
    try {
      await this.rig.use(kind);
      this.hud.setSource(kind, 'activa');
      this.hud.setStatus('');
    } catch (err) {
      const reason = messageOf(err);
      if (kind !== 'mouse') {
        this.hud.toast(`${TRACKING_LABELS[kind]} no disponible (${reason}). Usando ratón / táctil.`, 'warn', 6000);
        await this.rig.use('mouse');
        this.hud.setSource('mouse', 'activa');
      } else {
        this.hud.toast(`Tracking no disponible: ${reason}`, 'error');
      }
    }
  }

  private setDebug(on: boolean): void {
    this.hudDebugOn = on;
    this.debug?.setVisible(on);
    this.hud.setDebugVisible(on);
  }

  private calibrate(): void {
    this.rig.calibrate();
    this.hud.toast('Vista recalibrada: esta postura es el centro del portal', 'ok', 2600);
  }

  private readonly frame = (now: number): void => {
    if (!this.running || !this.camera || !this.scene || !this.debug) return;
    requestAnimationFrame(this.frame);

    const eyeM: Vec3 = this.rig.sample(now / 1000);
    this.camera.setEye(metersToUnits(eyeM[0]), metersToUnits(eyeM[1]), metersToUnits(eyeM[2]));
    this.camera.updateOffAxisProjection();
    this.debug.update();
    this.scene.renderFrame();
    this.debug.renderOverview(this.scene.renderer);

    this.frames++;
    if (now - this.lastFpsMs > 500) {
      this.fps = (this.frames * 1000) / (now - this.lastFpsMs);
      this.frames = 0;
      this.lastFpsMs = now;
    }
    if (now - this.lastHudMs > 120) {
      this.hud.updateEye(eyeM, this.rig.activeKind, this.fps);
      this.lastHudMs = now;
    }
  };

  private readonly onResize = (): void => {
    if (!this.camera || !this.scene) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.setAspect(w / Math.max(h, 1));
    this.scene.resize(w, h);
  };

  private readonly onKey = (e: KeyboardEvent): void => {
    if (!this.running) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'c' || e.key === 'C') this.calibrate();
    if (e.key === 'd' || e.key === 'D') {
      this.setDebug(!this.hudDebugOn);
    }
    if (e.key === '1') void this.selectSource('webcam');
    if (e.key === '2') void this.selectSource('mouse');
    if (e.key === '3') void this.selectSource('gyro');
  };
}

function pickDefaultSource(): TrackingKind {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse && MobileOrientationTracker.isSupported()) return 'gyro';
  if (typeof navigator.mediaDevices?.getUserMedia === 'function') return 'webcam';
  return 'mouse';
}

function messageOf(err: unknown): string {
  return describeError(err);
}

const stage = document.getElementById('stage');
const hudRoot = document.getElementById('hud-root');
if (!stage || !hudRoot) throw new Error('Falta #stage o #hud-root en index.html');
new PortalApp(stage, hudRoot);
