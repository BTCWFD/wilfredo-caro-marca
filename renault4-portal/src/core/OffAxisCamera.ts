import * as THREE from 'three';

export interface OffAxisCameraOptions {
  /** Ancho de la ventana física en unidades de escena. */
  screenWidth: number;
  /** Relación de aspecto del viewport (ancho / alto). */
  aspect: number;
  near: number;
  far: number;
}

/**
 * Cámara de proyección asimétrica (Kooima, "Generalized Perspective Projection").
 *
 * El plano z = 0 es el cristal físico. El ojo se expresa en coordenadas de escena
 * relativas al centro de ese plano. La cámara nunca gira: su marco es paralelo al
 * cristal, así la ventana se comporta como una ventana física real.
 */
export class OffAxisCamera extends THREE.PerspectiveCamera {
  readonly screenWidth: number;
  private screenHeight: number;

  /** Esquinas del cristal (z = 0). pa: inf-izq, pb: inf-der, pc: sup-izq, pd: sup-der. */
  readonly pa = new THREE.Vector3();
  readonly pb = new THREE.Vector3();
  readonly pc = new THREE.Vector3();
  readonly pd = new THREE.Vector3();

  /** Posición del ojo del espectador, en unidades de escena. */
  readonly eye = new THREE.Vector3(0, 0, 1);

  /** Base ortonormal del cristal: vr derecha, vu arriba, vn normal hacia el espectador. */
  private readonly vr = new THREE.Vector3(1, 0, 0);
  private readonly vu = new THREE.Vector3(0, 1, 0);
  private readonly vn = new THREE.Vector3(0, 0, 1);

  private readonly va = new THREE.Vector3();
  private readonly vb = new THREE.Vector3();
  private readonly vc = new THREE.Vector3();

  constructor(options: OffAxisCameraOptions) {
    super(50, options.aspect, options.near, options.far);
    this.screenWidth = options.screenWidth;
    this.screenHeight = options.screenWidth / options.aspect;
    this.rebuildScreen();
    this.updateOffAxisProjection();
  }

  /** Ajusta el alto del cristal al viewport. El ancho físico se mantiene. */
  setAspect(aspect: number): void {
    this.aspect = aspect;
    this.screenHeight = this.screenWidth / aspect;
    this.rebuildScreen();
  }

  /** Coloca el ojo (unidades de escena). Llama a updateOffAxisProjection después. */
  setEye(x: number, y: number, z: number): void {
    this.eye.set(x, y, Math.max(z, 1e-3));
  }

  /**
   * Recalcula projectionMatrix y projectionMatrixInverse a partir del ojo.
   * Fórmulas de Kooima: va/vb/vc son vectores ojo→esquina, d la distancia ojo→cristal.
   */
  updateOffAxisProjection(): void {
    const near = this.near;
    const far = this.far;

    this.va.subVectors(this.pa, this.eye);
    this.vb.subVectors(this.pb, this.eye);
    this.vc.subVectors(this.pc, this.eye);

    // Distancia perpendicular del ojo al cristal (positiva delante de la ventana).
    const d = Math.max(-this.va.dot(this.vn), 1e-4);

    const left = (this.vr.dot(this.va) * near) / d;
    const right = (this.vr.dot(this.vb) * near) / d;
    const bottom = (this.vu.dot(this.va) * near) / d;
    const top = (this.vu.dot(this.vc) * near) / d;

    this.projectionMatrix.makePerspective(left, right, top, bottom, near, far);
    this.projectionMatrixInverse.copy(this.projectionMatrix).invert();

    // Sin rotación: la cámara mira paralela a -vn, con el marco alineado al cristal.
    this.position.copy(this.eye);
    this.quaternion.identity();
    this.updateMatrixWorld(true);
  }

  /** Distancia perpendicular del ojo al cristal, en unidades de escena. */
  getDistanceToScreen(): number {
    return Math.max(-this.va.dot(this.vn), 0);
  }

  private rebuildScreen(): void {
    const hw = this.screenWidth / 2;
    const hh = this.screenHeight / 2;
    this.pa.set(-hw, -hh, 0);
    this.pb.set(hw, -hh, 0);
    this.pc.set(-hw, hh, 0);
    this.pd.set(hw, hh, 0);

    this.vr.subVectors(this.pb, this.pa).normalize();
    this.vu.subVectors(this.pc, this.pa).normalize();
    this.vn.crossVectors(this.vr, this.vu).normalize();
  }
}
