/**
 * Generador procedural de Gaussian Splats en memoria.
 *
 * Produce un Renault 4 aproximado (carrocería hatchback, pasos de rueda, parrilla,
 * faros redondos, ventanas y tiras negras inferiores) y un garaje con suelo de hormigón,
 * sombra de contacto, paredes de ladrillo, techo con luminarias y un haz volumétrico.
 *
 * La salida es el formato .splat estándar (32 bytes por splat):
 *   pos float32[3] | scale float32[3] (lineal) | rgba uint8[4] | quat uint8[4] (w, x, y, z; (v-128)/128)
 * Así se carga con SceneFormat.Splat sin pasos extra.
 *
 * Coordenadas locales en metros: +X = frontal del coche, +Y = arriba, suelo en y = 0.
 */

type Vec3 = [number, number, number];
type Rgb = [number, number, number];
type Quat = [number, number, number, number]; // w, x, y, z

const ROW_BYTES = 32;

export interface ProceduralSplatOptions {
  seed?: number;
  /** Splats por m² de superficie del coche. */
  carDensity?: number;
  /** Splats por m² de suelo y paredes. */
  environmentDensity?: number;
}

export interface ProceduralSplatScenes {
  /** Buffer .splat del coche. */
  car: ArrayBuffer;
  /** Buffer .splat del garaje. */
  environment: ArrayBuffer;
  carSplatCount: number;
  environmentSplatCount: number;
}

export function generateProceduralRenault4(options: ProceduralSplatOptions = {}): ProceduralSplatScenes {
  const rng = createRng(options.seed ?? 1975);
  const carDensity = options.carDensity ?? 6500;
  const environmentDensity = options.environmentDensity ?? 260;

  const carWriter = new SplatWriter();
  buildCar(rng, carDensity, carWriter);

  const envWriter = new SplatWriter();
  buildEnvironment(rng, environmentDensity, envWriter);

  return {
    car: carWriter.toBuffer(),
    environment: envWriter.toBuffer(),
    carSplatCount: carWriter.count,
    environmentSplatCount: envWriter.count,
  };
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/** Generador pseudoaleatorio determinista (mulberry32). */
function createRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ruido determinista por posición (para texturas sin estado). */
function hash2(x: number, z: number): number {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function clampByte(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function jitter(c: Rgb, amount: number, rng: () => number): Rgb {
  const k = 1 + (rng() * 2 - 1) * amount;
  return [clampByte(c[0] * k), clampByte(c[1] * k), clampByte(c[2] * k)];
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  const k = Math.max(0, Math.min(1, t));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

function sdBox(p: Vec3, c: Vec3, h: Vec3): number {
  const qx = Math.abs(p[0] - c[0]) - h[0];
  const qy = Math.abs(p[1] - c[1]) - h[1];
  const qz = Math.abs(p[2] - c[2]) - h[2];
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  const oz = Math.max(qz, 0);
  return Math.hypot(ox, oy, oz) + Math.min(Math.max(qx, qy, qz), 0);
}

/** Toro con eje Z. */
function sdTorusZ(p: Vec3, c: Vec3, R: number, r: number): number {
  const q = Math.hypot(p[0] - c[0], p[1] - c[1]) - R;
  return Math.hypot(q, p[2] - c[2]) - r;
}

/** Cilindro con eje Z, radio R, semilongitud L. */
function sdCylinderZ(p: Vec3, c: Vec3, R: number, L: number): number {
  const d = Math.hypot(p[0] - c[0], p[1] - c[1]) - R;
  const dz = Math.abs(p[2] - c[2]) - L;
  const ox = Math.max(d, 0);
  const oz = Math.max(dz, 0);
  return Math.hypot(ox, oz) + Math.min(Math.max(d, dz), 0);
}

/** Cuaternión [w, x, y, z] que lleva el eje Z local a la normal n. */
function quatFromZTo(n: Vec3): Quat {
  const w = 1 + n[2];
  if (w < 1e-5) return [0, 1, 0, 0]; // 180° alrededor de X
  const x = -n[1];
  const y = n[0];
  const l = Math.hypot(w, x, y);
  return [w / l, x / l, y / l, 0];
}

// ---------------------------------------------------------------------------
// Escritor de splats (.splat, 32 bytes por fila)
// ---------------------------------------------------------------------------

class SplatWriter {
  private capacity = 1 << 15;
  private view = new DataView(new ArrayBuffer(this.capacity * ROW_BYTES));
  count = 0;

  push(p: Vec3, scale: Vec3, rgba: [number, number, number, number], q: Quat): void {
    if (this.count === this.capacity) this.grow();
    const o = this.count * ROW_BYTES;
    const v = this.view;
    v.setFloat32(o, p[0], true);
    v.setFloat32(o + 4, p[1], true);
    v.setFloat32(o + 8, p[2], true);
    v.setFloat32(o + 12, scale[0], true);
    v.setFloat32(o + 16, scale[1], true);
    v.setFloat32(o + 20, scale[2], true);
    v.setUint8(o + 24, clampByte(rgba[0]));
    v.setUint8(o + 25, clampByte(rgba[1]));
    v.setUint8(o + 26, clampByte(rgba[2]));
    v.setUint8(o + 27, clampByte(rgba[3]));
    v.setUint8(o + 28, encodeQuatByte(q[0]));
    v.setUint8(o + 29, encodeQuatByte(q[1]));
    v.setUint8(o + 30, encodeQuatByte(q[2]));
    v.setUint8(o + 31, encodeQuatByte(q[3]));
    this.count++;
  }

  toBuffer(): ArrayBuffer {
    return this.view.buffer.slice(0, this.count * ROW_BYTES);
  }

  private grow(): void {
    const next = new ArrayBuffer(this.capacity * 2 * ROW_BYTES);
    new Uint8Array(next).set(new Uint8Array(this.view.buffer));
    this.capacity *= 2;
    this.view = new DataView(next);
  }
}

function encodeQuatByte(v: number): number {
  return clampByte(v * 128 + 128);
}

/** Disco orientado a la normal: el splat queda pegado a la superficie. */
function emitSurface(
  w: SplatWriter,
  p: Vec3,
  n: Vec3,
  radius: number,
  rgb: Rgb,
  alpha = 255,
): void {
  w.push(p, [radius, radius, radius * 0.3], [rgb[0], rgb[1], rgb[2], alpha], quatFromZTo(n));
}

/** Splat isotrópico (volumen). */
function emitBlob(w: SplatWriter, p: Vec3, radius: number, rgb: Rgb, alpha: number): void {
  w.push(p, [radius, radius, radius], [rgb[0], rgb[1], rgb[2], alpha], [1, 0, 0, 0]);
}

// ---------------------------------------------------------------------------
// Sólidos del coche: muestreo analítico de superficie + SDF para oclusión
// ---------------------------------------------------------------------------

type ColorFn = (p: Vec3, n: Vec3) => Rgb;

interface Solid {
  area: number;
  /** Distancia con signo al sólido (negativa dentro). */
  sdf(p: Vec3): number;
  /** Punto y normal de superficie uniformes en área. */
  sample(): { p: Vec3; n: Vec3 };
  color: ColorFn;
}

function boxSolid(
  rng: () => number,
  c: Vec3,
  h: Vec3,
  color: ColorFn,
  sdf: (p: Vec3) => number = (p) => sdBox(p, c, h),
): Solid {
  const faces: Array<{ axis: number; sign: number; area: number }> = [];
  for (let axis = 0; axis < 3; axis++) {
    const b = (axis + 1) % 3;
    const k = (axis + 2) % 3;
    const area = 4 * h[b] * h[k];
    faces.push({ axis, sign: -1, area }, { axis, sign: 1, area });
  }
  const total = faces.reduce((s, f) => s + f.area, 0);

  return {
    area: total,
    sdf,
    color,
    sample() {
      let pick = rng() * total;
      let face = faces[0];
      for (const f of faces) {
        pick -= f.area;
        if (pick <= 0) {
          face = f;
          break;
        }
      }
      const a = face.axis;
      const b = (a + 1) % 3;
      const k = (a + 2) % 3;
      const p: Vec3 = [0, 0, 0];
      const n: Vec3 = [0, 0, 0];
      p[a] = c[a] + face.sign * h[a];
      p[b] = c[b] + (rng() * 2 - 1) * h[b];
      p[k] = c[k] + (rng() * 2 - 1) * h[k];
      n[a] = face.sign;
      return { p, n };
    },
  };
}

function torusSolid(rng: () => number, c: Vec3, R: number, r: number, color: ColorFn): Solid {
  return {
    area: 4 * Math.PI * Math.PI * R * r,
    color,
    sdf: (p) => sdTorusZ(p, c, R, r),
    sample() {
      const theta = 2 * Math.PI * rng();
      const phi = 2 * Math.PI * rng();
      const cp = Math.cos(phi);
      const sp = Math.sin(phi);
      const ct = Math.cos(theta);
      const st = Math.sin(theta);
      return {
        p: [c[0] + (R + r * cp) * ct, c[1] + (R + r * cp) * st, c[2] + r * sp],
        n: [cp * ct, cp * st, sp],
      };
    },
  };
}

function cylinderZSolid(rng: () => number, c: Vec3, R: number, L: number, color: ColorFn): Solid {
  const sideArea = 2 * Math.PI * R * 2 * L;
  const capArea = 2 * Math.PI * R * R;
  return {
    area: sideArea + capArea,
    color,
    sdf: (p) => sdCylinderZ(p, c, R, L),
    sample() {
      const theta = 2 * Math.PI * rng();
      const ct = Math.cos(theta);
      const st = Math.sin(theta);
      if (rng() * (sideArea + capArea) < sideArea) {
        const z = c[2] + (rng() * 2 - 1) * L;
        return { p: [c[0] + R * ct, c[1] + R * st, z], n: [ct, st, 0] };
      }
      const s = rng() < 0.5 ? -1 : 1;
      const rr = R * Math.sqrt(rng());
      return { p: [c[0] + rr * ct, c[1] + rr * st, c[2] + s * L], n: [0, 0, s] };
    },
  };
}

function sphereSolid(rng: () => number, c: Vec3, r: number, color: ColorFn): Solid {
  return {
    area: 4 * Math.PI * r * r,
    color,
    sdf: (p) => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) - r,
    sample() {
      const z = 2 * rng() - 1;
      const phi = 2 * Math.PI * rng();
      const s = Math.sqrt(1 - z * z);
      const n: Vec3 = [s * Math.cos(phi), s * Math.sin(phi), z];
      return { p: [c[0] + r * n[0], c[1] + r * n[1], c[2] + r * n[2]], n };
    },
  };
}

// ---------------------------------------------------------------------------
// Renault 4 (medidas aproximadas: 3.6 m largo, 1.5 m ancho, 1.45 m alto)
// ---------------------------------------------------------------------------

const PAINT: Rgb = [226, 104, 44]; // naranja clásico
const TRIM: Rgb = [46, 44, 44]; // cubre-bajos negro
const TIRE: Rgb = [20, 20, 22];
const RIM: Rgb = [186, 190, 196];
const CHROME: Rgb = [170, 176, 184];
const DARK_PLASTIC: Rgb = [28, 28, 30];
const HEADLIGHT: Rgb = [255, 244, 214];
const TAILLIGHT: Rgb = [190, 22, 30];
const GLASS_LOW: Rgb = [16, 26, 36];
const GLASS_HIGH: Rgb = [84, 110, 134];

/** Ruedas: centro de la rueda a y = 0.345 m, radio exterior 0.345 m (apoyada en el suelo). */
const WHEEL_Y = 0.345;
const WHEEL_X = 1.18;
const WHEEL_Z = 0.66;
const WHEEL_TORUS_R = 0.265;
const WHEEL_TUBE_R = 0.08;
const WELL_R = 0.4;

function buildCar(rng: () => number, density: number, writer: SplatWriter): void {
  const spacing = 1 / Math.sqrt(density);
  const eps = 0.35 * spacing;
  const radius = 0.75 * spacing;

  // Pasos de rueda: cilindros con eje Z que recortan la carrocería.
  const wellFront: Vec3 = [WHEEL_X, WHEEL_Y, 0];
  const wellRear: Vec3 = [-WHEEL_X, WHEEL_Y, 0];
  const wellSdf = (p: Vec3): number =>
    Math.min(sdCylinderZ(p, wellFront, WELL_R, 2), sdCylinderZ(p, wellRear, WELL_R, 2));

  const bodyC: Vec3 = [0, 0.58, 0];
  const bodyH: Vec3 = [1.78, 0.27, 0.73];
  const body = boxSolid(
    rng,
    bodyC,
    bodyH,
    (p) => (p[1] < 0.5 ? jitter(TRIM, 0.05, rng) : jitter(PAINT, 0.04, rng)),
    (p) => Math.max(sdBox(p, bodyC, bodyH), -wellSdf(p)),
  );

  // Habitáculo: ventanas laterales, parabrisas y luneta.
  const cabinC: Vec3 = [-0.12, 1.12, 0];
  const cabinH: Vec3 = [1.3, 0.32, 0.66];
  const glassAt = (p: Vec3): Rgb => {
    const t = (p[1] - 0.92) / 0.44;
    return jitter(mix(GLASS_LOW, GLASS_HIGH, t), 0.06, rng);
  };
  const cabin = boxSolid(rng, cabinC, cabinH, (p, n) => {
    const band = p[1] > 0.93 && p[1] < 1.36;
    if (Math.abs(n[2]) > 0.5) {
      return band && p[0] > -1.3 && p[0] < 1.0 ? glassAt(p) : jitter(PAINT, 0.04, rng);
    }
    if (n[0] > 0.5) {
      return band && Math.abs(p[2]) < 0.56 ? glassAt(p) : jitter(PAINT, 0.04, rng);
    }
    if (n[0] < -0.5) {
      const rear = p[1] > 0.95 && p[1] < 1.3 && Math.abs(p[2]) < 0.5;
      return rear ? glassAt(p) : jitter(PAINT, 0.04, rng);
    }
    return jitter(PAINT, 0.04, rng);
  });

  const solids: Solid[] = [body, cabin];

  // Paragolpes, parrilla, pilotos, espejos.
  solids.push(
    boxSolid(rng, [1.8, 0.4, 0], [0.05, 0.07, 0.72], () => jitter(DARK_PLASTIC, 0.1, rng)),
    boxSolid(rng, [-1.8, 0.4, 0], [0.05, 0.07, 0.72], () => jitter(DARK_PLASTIC, 0.1, rng)),
    boxSolid(rng, [1.795, 0.62, 0], [0.02, 0.12, 0.44], () => jitter(CHROME, 0.08, rng)),
  );
  for (const z of [-0.5, 0.5]) {
    solids.push(sphereSolid(rng, [1.74, 0.74, z], 0.09, () => jitter(HEADLIGHT, 0.02, rng)));
  }
  for (const z of [-0.56, 0.56]) {
    solids.push(
      boxSolid(rng, [-1.79, 0.78, z], [0.03, 0.05, 0.13], () => jitter(TAILLIGHT, 0.05, rng)),
    );
  }
  for (const z of [-0.82, 0.82]) {
    solids.push(boxSolid(rng, [0.45, 1.05, z], [0.08, 0.05, 0.04], () => jitter(PAINT, 0.04, rng)));
  }

  // Ruedas: neumático (toro) + llanta (disco plateado).
  for (const x of [WHEEL_X, -WHEEL_X]) {
    for (const z of [-WHEEL_Z, WHEEL_Z]) {
      const c: Vec3 = [x, WHEEL_Y, z];
      solids.push(
        torusSolid(rng, c, WHEEL_TORUS_R, WHEEL_TUBE_R, () => jitter(TIRE, 0.2, rng)),
        cylinderZSolid(rng, c, 0.17, 0.035, (p) => (Math.hypot(p[0] - x, p[1] - WHEEL_Y) < 0.06 ? jitter(DARK_PLASTIC, 0.1, rng) : jitter(RIM, 0.06, rng))),
      );
    }
  }

  for (const s of solids) {
    const n = Math.max(24, Math.round(s.area * density));
    for (let i = 0; i < n; i++) {
      const { p, n: normal } = s.sample();
      // El punto debe estar en la superficie de su sólido y fuera de los demás.
      if (Math.abs(s.sdf(p)) > eps) continue;
      let hidden = false;
      for (const o of solids) {
        if (o !== s && o.sdf(p) < -eps) {
          hidden = true;
          break;
        }
      }
      if (hidden) continue;
      emitSurface(writer, p, normal, radius, s.color(p, normal));
    }
  }
}

// ---------------------------------------------------------------------------
// Garaje: suelo, paredes de ladrillo, techo, luminarias y haz volumétrico
// ---------------------------------------------------------------------------

function floorColor(x: number, z: number, rng: () => number): Rgb {
  let c: Rgb = jitter([96, 96, 100], 0.08, rng);

  // Sombra de contacto bajo el coche (elipse).
  const ex = x / 1.9;
  const ez = z / 0.85;
  const d2 = ex * ex + ez * ez;
  if (d2 < 1) c = mix(c, [10, 10, 12], 0.9 * Math.sqrt(1 - d2));

  // Manchas de aceite deterministas.
  if (hash2(x * 7.3, z * 5.1) > 0.985) c = mix(c, [32, 30, 28], 0.6);

  // Línea amarilla de zona de trabajo.
  if (Math.abs(z - 0.9) < 0.035 && Math.abs(x) < 3.2) c = [228, 184, 40];
  return c;
}

function brickColor(x: number, y: number, rng: () => number): Rgb {
  const row = Math.floor(y / 0.075);
  const shift = (row % 2) * 0.11;
  const u = x + shift;
  const col = Math.floor(u / 0.22);
  const fx = (u - col * 0.22) / 0.22;
  const fy = (y - row * 0.075) / 0.075;
  const mortar = fx < 0.07 || fx > 0.93 || fy < 0.12 || fy > 0.88;
  if (mortar) return jitter([92, 90, 86], 0.06, rng);
  const tone = 0.8 + 0.3 * hash2(col * 1.7, row * 3.1);
  return jitter([96 * tone, 40 * tone, 32 * tone], 0.05, rng);
}

function buildEnvironment(rng: () => number, density: number, writer: SplatWriter): void {
  const spacing = 1 / Math.sqrt(density);
  const radius = 0.75 * spacing;

  const planeCount = (area: number): number => Math.round(area * density);

  // Suelo
  for (let i = planeCount(8 * 8.4); i > 0; i--) {
    const x = -4 + 8 * rng();
    const z = -2.4 + 8.4 * rng();
    emitSurface(writer, [x, 0, z], [0, 1, 0], radius, floorColor(x, z, rng));
  }

  // Pared trasera (z = -2.4) y laterales (x = ±4)
  for (let i = planeCount(8 * 4); i > 0; i--) {
    const x = -4 + 8 * rng();
    const y = 4 * rng();
    emitSurface(writer, [x, y, -2.4], [0, 0, 1], radius, brickColor(x, y, rng));
  }
  for (const side of [-1, 1]) {
    for (let i = planeCount(4 * 4); i > 0; i--) {
      const z = -2.4 + 4 * rng();
      const y = 4 * rng();
      emitSurface(writer, [side * 4, y, z], [-side, 0, 0], radius, brickColor(z, y, rng));
    }
  }

  // Techo oscuro
  for (let i = planeCount(8 * 4); i > 0; i--) {
    const x = -4 + 8 * rng();
    const z = -2.4 + 4 * rng();
    emitSurface(writer, [x, 4, z], [0, -1, 0], radius, jitter([38, 40, 44], 0.1, rng));
  }

  // Luminarias del techo (paneles emisivos)
  const lightRadius = 0.75 / Math.sqrt(1400);
  for (const cx of [-2.2, 0, 2.2]) {
    for (let i = 0; i < Math.round(1.4 * 0.35 * 1400); i++) {
      const x = cx + (rng() - 0.5) * 1.4;
      const z = -0.4 + (rng() - 0.5) * 0.35;
      emitSurface(writer, [x, 3.97, z], [0, -1, 0], lightRadius, [255, 248, 226]);
    }
  }

  // Haz volumétrico: splats translúcidos entre la luminaria y el suelo.
  const apex: Vec3 = [0, 3.9, -0.4];
  const base: Vec3 = [0, 0, -0.4];
  for (let i = 0; i < 7000; i++) {
    const t = rng();
    const reach = 0.1 + 1.3 * t;
    const ang = 2 * Math.PI * rng();
    const rad = reach * Math.sqrt(rng());
    const p: Vec3 = [
      apex[0] + (base[0] - apex[0]) * t + rad * Math.cos(ang),
      apex[1] + (base[1] - apex[1]) * t,
      apex[2] + (base[2] - apex[2]) * t + rad * Math.sin(ang),
    ];
    emitBlob(writer, p, 0.12 + 0.25 * rng(), [255, 236, 190], 3 + Math.floor(rng() * 5));
  }
}
