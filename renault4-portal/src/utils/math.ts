/** Vector de 3 componentes (x, y, z). */
export type Vec3 = [number, number, number];

/** Cuaternión en orden [x, y, z, w], igual que THREE.Quaternion.fromArray. */
export type Quat = [number, number, number, number];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Cuaternión para girar `yaw` alrededor de Y y después `pitch` alrededor de X. */
export function quatYawPitch(yaw: number, pitch: number): Quat {
  const sy = Math.sin(yaw / 2);
  const cy = Math.cos(yaw / 2);
  const sx = Math.sin(pitch / 2);
  const cx = Math.cos(pitch / 2);
  return [cy * sx, sy * cx, -sy * sx, cy * cx];
}
