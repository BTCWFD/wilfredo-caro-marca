import * as THREE from 'three';
import {
  LogLevel,
  RenderMode,
  SceneFormat,
  SceneRevealMode,
  Viewer,
  type SceneFormatValue,
  type SplatSceneOptions,
} from '@mkkellogg/gaussian-splats-3d';
import { CONFIG } from '../config';
import type { OffAxisCamera } from '../core/OffAxisCamera';
import { quatYawPitch, type Quat, type Vec3 } from '../utils/math';
import { generateProceduralRenault4 } from './ProceduralRenault4Splat';

export type SceneMode = 'real' | 'procedural';

export interface SceneLoadResult {
  mode: SceneMode;
  /** Ruta del escaneo real, o null en modo procedural. */
  sourcePath: string | null;
  splatCount: number | null;
}

const IDENTITY: Quat = [0, 0, 0, 1];

/**
 * Configura el renderer WebGL2, la escena y el Viewer de @mkkellogg/gaussian-splats-3d.
 * El Viewer usa nuestra cámara off-axis y nuestro renderer. Como `selfDrivenMode` está
 * desactivado, el bucle de frames lo controla la aplicación.
 */
export class GaussianSceneManager {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly viewer: Viewer;

  constructor(
    container: HTMLElement,
    private readonly camera: OffAxisCamera,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.renderer.maxPixelRatio));
    this.renderer.setClearColor(0x050505, 1);
    this.renderer.setSize(container.clientWidth, container.clientHeight, false);

    const canvas = this.renderer.domElement;
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;';
    container.appendChild(canvas);

    // Los splats usan color horneado (no reciben luz). La iluminación sirve para las
    // mallas auxiliares de la escena y para cualquier suelo o pieza que añadas en mallas.
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xfff1dc, 1.1);
    key.position.set(-1.2, 2, 1.5);
    this.scene.add(key);

    // Sin SharedArrayBuffer el sorting debe ir en un solo hilo.
    const isolated = window.crossOriginIsolated === true;

    this.viewer = new Viewer({
      renderer: this.renderer,
      camera: this.camera,
      threeScene: this.scene,
      rootElement: container,
      cameraUp: [0, 1, 0],
      selfDrivenMode: false,
      useBuiltInControls: false,
      sharedMemoryForWorkers: isolated,
      gpuAcceleratedSort: false,
      dynamicScene: false,
      renderMode: RenderMode.Always,
      sceneRevealMode: SceneRevealMode.Instant,
      antialiased: true,
      logLevel: LogLevel.Warning,
    });
  }

  /**
   * Carga el escaneo real si existe en /assets/. Si no, genera el Renault 4 procedural.
   * Cada candidato se comprueba con HEAD antes de descargar.
   */
  async load(onStatus: (message: string) => void): Promise<SceneLoadResult> {
    const rs = CONFIG.scene;
    const scale = rs.scale;
    const realPose = {
      position: [...rs.position] as Vec3,
      rotation: quatYawPitch(CONFIG.scene.realScan.yawRad, CONFIG.scene.realScan.pitchRad),
      scale: [scale, scale, scale] as Vec3,
    };

    for (const candidate of CONFIG.scene.realScanCandidates) {
      onStatus(`Buscando escaneo 3DGS: ${candidate.path}`);
      if (!(await assetExists(candidate.path))) continue;
      try {
        await this.viewer.addSplatScenes(
          [
            {
              path: candidate.path,
              format: formatFor(candidate.format),
              position: realPose.position,
              rotation: realPose.rotation,
              scale: realPose.scale,
              splatAlphaRemovalThreshold: CONFIG.scene.realScan.alphaThreshold,
              showLoadingUI: false,
            },
          ],
          false,
          (percent) => onStatus(`Cargando escaneo real… ${Math.round(percent)}%`),
        );
        return { mode: 'real', sourcePath: candidate.path, splatCount: null };
      } catch (err) {
        console.warn(`No se pudo cargar ${candidate.path}; se usa el modo procedural.`, err);
      }
    }

    onStatus('Generando Renault 4 procedural…');
    // Deja pintar el mensaje antes del trabajo síncrono de generación.
    await new Promise((r) => setTimeout(r, 0));
    const pack = generateProceduralRenault4({
      seed: CONFIG.procedural.seed,
      carDensity: CONFIG.procedural.carDensity,
      environmentDensity: CONFIG.procedural.environmentDensity,
    });

    const carUrl = URL.createObjectURL(new Blob([pack.car], { type: 'application/octet-stream' }));
    const envUrl = URL.createObjectURL(new Blob([pack.environment], { type: 'application/octet-stream' }));
    const yaw = quatYawPitch(CONFIG.scene.proceduralYawRad, 0);
    const pos: Vec3 = [...rs.position] as Vec3;
    const s: Vec3 = [scale, scale, scale];

    const scenes: SplatSceneOptions[] = [
      { path: envUrl, format: SceneFormat.Splat, position: pos, rotation: IDENTITY, scale: s, splatAlphaRemovalThreshold: 1, showLoadingUI: false },
      { path: carUrl, format: SceneFormat.Splat, position: pos, rotation: yaw, scale: s, splatAlphaRemovalThreshold: 1, showLoadingUI: false },
    ];
    try {
      await this.viewer.addSplatScenes(scenes, false);
    } finally {
      URL.revokeObjectURL(carUrl);
      URL.revokeObjectURL(envUrl);
    }

    return {
      mode: 'procedural',
      sourcePath: null,
      splatCount: pack.carSplatCount + pack.environmentSplatCount,
    };
  }

  /** Un fotograma: ordena los splats para la posición actual del ojo y dibuja. */
  renderFrame(): void {
    this.viewer.update();
    this.viewer.render();
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
  }

  async dispose(): Promise<void> {
    await this.viewer.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

function formatFor(name: 'ksplat' | 'splat' | 'ply'): SceneFormatValue {
  if (name === 'ksplat') return SceneFormat.KSplat;
  if (name === 'ply') return SceneFormat.Ply;
  return SceneFormat.Splat;
}

/**
 * Comprueba que el recurso existe de verdad. Los servidores SPA devuelven index.html
 * con 200 para rutas desconocidas, así que también se rechaza cualquier respuesta HTML.
 */
async function assetExists(path: string): Promise<boolean> {
  try {
    const res = await fetch(path, { method: 'HEAD', cache: 'no-store' });
    if (!res.ok) return false;
    const type = res.headers.get('content-type') ?? '';
    return !type.includes('text/html');
  } catch {
    return false;
  }
}
