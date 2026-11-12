import * as THREE from 'three';
import type { OffAxisCamera } from '../core/OffAxisCamera';
import type { Vec3 } from '../utils/math';

/**
 * Depuración del frustum asimétrico.
 *
 * Desde la propia cámara, las aristas del frustum caen sobre los bordes del viewport,
 * así que se dibuja en un inset con una vista general externa: el cristal (z = 0), el ojo,
 * las líneas ojo→esquinas, el volumen del coche y el muro del garaje.
 */
export class FrustumDebugHelper {
  private readonly overviewScene = new THREE.Scene();
  private readonly overviewCamera = new THREE.PerspectiveCamera(38, 16 / 9, 0.05, 50);
  private readonly frustumPositions = new Float32Array(16 * 3);
  private readonly frustumGeometry = new THREE.BufferGeometry();
  private readonly eyeMarker: THREE.Mesh;
  private visible = false;

  constructor(
    private readonly camera: OffAxisCamera,
    scenePosition: Vec3,
    sceneScale: number,
  ) {
    this.overviewScene.background = new THREE.Color(0x0a0a0c);

    // Frustum: ojo → cada esquina, y contorno del cristal.
    this.frustumGeometry.setAttribute('position', new THREE.BufferAttribute(this.frustumPositions, 3));
    const frustum = new THREE.LineSegments(
      this.frustumGeometry,
      new THREE.LineBasicMaterial({ color: 0xff7a1a }),
    );
    frustum.frustumCulled = false;
    this.overviewScene.add(frustum);

    // Marcador del ojo
    this.eyeMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    this.overviewScene.add(this.eyeMarker);

    // Referencias estáticas: volumen del coche, muro del garaje y suelo.
    const [px, py, pz] = scenePosition;
    const carBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(3.6 * sceneScale, 1.44 * sceneScale, 1.5 * sceneScale)),
      new THREE.LineBasicMaterial({ color: 0x6aa9ff }),
    );
    carBox.position.set(px, py + (1.44 * sceneScale) / 2, pz);
    const wall = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(8 * sceneScale, 4 * sceneScale)),
      new THREE.LineBasicMaterial({ color: 0x555555 }),
    );
    wall.position.set(px, py + (4 * sceneScale) / 2, pz - 2.4 * sceneScale);
    const floor = new THREE.GridHelper(3, 12, 0x3a3a3a, 0x222222);
    floor.position.set(px, py, pz);
    this.overviewScene.add(carBox, wall, floor);

    this.overviewCamera.position.set(0, 0.55, 3.4);
    this.overviewCamera.lookAt(0, 0.05, -0.5);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  update(): void {
    if (!this.visible) return;
    const e = this.camera.eye;
    const corners = [this.camera.pa, this.camera.pb, this.camera.pd, this.camera.pc];
    const pts: THREE.Vector3[] = [];
    for (const c of corners) pts.push(e.clone(), c.clone());
    for (let i = 0; i < 4; i++) pts.push(corners[i].clone(), corners[(i + 1) % 4].clone());
    pts.forEach((p, i) => {
      this.frustumPositions[i * 3] = p.x;
      this.frustumPositions[i * 3 + 1] = p.y;
      this.frustumPositions[i * 3 + 2] = p.z;
    });
    this.frustumGeometry.attributes.position.needsUpdate = true;
    this.eyeMarker.position.copy(e);
  }

  /**
   * Dibuja el inset en la esquina superior derecha. Llamar después de scene.renderFrame():
   * usa scissor y viewport, así que no altera la imagen de los splats.
   */
  renderOverview(renderer: THREE.WebGLRenderer): void {
    if (!this.visible) return;
    const size = new THREE.Vector2();
    renderer.getSize(size);

    const w = Math.round(Math.min(380, size.x * 0.4));
    const h = Math.round((w * 9) / 16);
    const margin = 16;
    const x = Math.max(0, size.x - w - margin);
    const y = Math.max(0, size.y - h - margin);

    const prevAutoClear = renderer.autoClear;
    renderer.autoClear = true;
    renderer.setScissorTest(true);
    renderer.setViewport(x, y, w, h);
    renderer.setScissor(x, y, w, h);
    renderer.render(this.overviewScene, this.overviewCamera);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, size.x, size.y);
    renderer.autoClear = prevAutoClear;
  }

  dispose(): void {
    this.frustumGeometry.dispose();
    this.overviewScene.traverse((o) => {
      if (o instanceof THREE.LineSegments || o instanceof THREE.Mesh) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
  }
}
