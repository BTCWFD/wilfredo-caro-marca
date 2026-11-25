// src/webgl/shaders/dof-particles.glsl.js
// Resn "Corn Revolutionized" Technique #4:
// Single-Pass Signed Distance Field (SDF) Bokeh Depth-of-Field Particles.

import * as THREE from 'three';

export const DOF_PARTICLES_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixelRatio;
  uniform vec3 uFocalPoint;
  uniform float uScrollVel;
  uniform vec2 uPointer;

  attribute vec3 aSeed;
  attribute vec3 aRandom;

  varying float vFocalDist;
  varying float vColorMix;
  varying float vAlphaBoost;
  varying float vStrand;

  #define PI 3.14159265359
  #define TAU 6.28318530718

  vec3 posHelix(float idx, float rnd, float strand, float t) {
    float side = strand < 0.5 ? -1.0 : 1.0;
    float turns = idx * TAU * 4.5 + t * 0.45;
    float radius = 2.35 + sin(idx * PI * 6.0 + t * 0.6) * 0.28 + rnd * 0.32;
    if (fract(rnd * 13.37) > 0.80) {
      float lerpCross = (fract(rnd * 97.13) - 0.5) * 2.0;
      return vec3(cos(turns) * radius * lerpCross, (idx - 0.5) * 18.0, sin(turns) * radius * lerpCross);
    }
    return vec3(
      cos(turns + (side > 0.0 ? PI : 0.0)) * radius,
      (idx - 0.5) * 18.0 + aRandom.y * 0.22,
      sin(turns + (side > 0.0 ? PI : 0.0)) * radius
    );
  }

  vec3 posSwarmCanopy(float idx, float rnd, float strand, float t) {
    float cluster = floor(strand * 6.0);
    float branchAngle = (cluster / 6.0) * TAU + t * 0.18;
    float reach = pow(idx, 0.72) * 4.8;
    float yCurve = -4.2 + idx * 9.5 + sin(reach * 1.4 - t * 0.9) * 0.55;
    vec3 center = vec3(cos(branchAngle + idx * 1.1) * reach, yCurve, sin(branchAngle + idx * 1.1) * reach);
    return center + aRandom * (0.35 + idx * 0.45);
  }

  vec3 posOrbitalTorus(float idx, float rnd, float strand, float t) {
    float u = idx * TAU * 3.0 + t * 0.22;
    float v = rnd * TAU + t * 0.5;
    float majorR = 4.1 + sin(u * 3.0) * 0.35;
    float minorR = 1.15 + aRandom.x * 0.38;
    float x = (majorR + minorR * cos(v)) * cos(u);
    float z = (majorR + minorR * cos(v)) * sin(u);
    float y = minorR * sin(v) * 1.4 + sin(u * 2.0 + t * 0.4) * 0.8;
    float tilt = 0.42;
    return vec3(x, y * cos(tilt) - z * sin(tilt), y * sin(tilt) + z * cos(tilt));
  }

  vec3 posCyberSpine(float idx, float rnd, float strand, float t) {
    float ringIdx = floor(idx * 18.0);
    float ringY = (ringIdx / 18.0 - 0.5) * 16.0;
    float theta = fract(idx * 18.0) * TAU + ringIdx * 0.45 + t * (mod(ringIdx, 2.0) == 0.0 ? 0.35 : -0.35);
    float r = (mod(ringIdx, 3.0) == 0.0 ? 3.8 : 2.1) + rnd * 0.45;
    return vec3(cos(theta) * r, ringY + aRandom.y * 0.18, sin(theta) * r);
  }

  vec3 posSonicWave(float idx, float rnd, float strand, float t) {
    float x = (idx - 0.5) * 15.0;
    float z = (rnd - 0.5) * 9.0;
    float distCenter = length(vec2(x * 0.45, z * 0.65));
    float beat = sin(distCenter * 2.8 - t * 3.4) * exp(-distCenter * 0.18) * 2.4;
    float subHarmonic = cos(x * 1.5 + t * 2.1) * sin(z * 1.5 - t * 1.7) * 0.65;
    return vec3(x, beat + subHarmonic - 1.2, z);
  }

  void main() {
    float idx = aSeed.x;
    float rnd = aSeed.y;
    float strand = aSeed.z;
    float t = uTime;

    float s = fract(uScroll) * 5.0;
    int stage = int(floor(s));
    float f = smoothstep(0.0, 1.0, fract(s));

    vec3 p0 = posHelix(idx, rnd, strand, t);
    vec3 p1 = posSwarmCanopy(idx, rnd, strand, t);
    vec3 p2 = posOrbitalTorus(idx, rnd, strand, t);
    vec3 p3 = posCyberSpine(idx, rnd, strand, t);
    vec3 p4 = posSonicWave(idx, rnd, strand, t);

    vec3 pos = p0;
    if (stage == 0) pos = mix(p0, p1, f);
    else if (stage == 1) pos = mix(p1, p2, f);
    else if (stage == 2) pos = mix(p2, p3, f);
    else if (stage == 3) pos = mix(p3, p4, f);
    else pos = mix(p4, p0, f);

    pos.x += uPointer.x * (0.45 + rnd * 0.35);
    pos.y += uPointer.y * 0.35 + uScrollVel * aRandom.z * 1.4;

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vec4 mvPosition = viewMatrix * worldPosition;

    vFocalDist = distance(worldPosition.xyz, uFocalPoint);

    float defocus = smoothstep(1.4, 8.8, vFocalDist);
    float baseSize = mix(2.4, 5.2, rnd);
    float bokehScale = 1.0 + defocus * 4.2;

    float perspectiveSize = (baseSize * bokehScale * uPixelRatio * 9.5) / max(1.2, -mvPosition.z);
    gl_PointSize = clamp(perspectiveSize, 1.5, 58.0);

    vColorMix = fract(idx * 2.5 + strand * 0.5 + uScroll * 0.8);
    vAlphaBoost = 1.0 - defocus * 0.72;
    vStrand = strand;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const DOF_PARTICLES_FRAGMENT = /* glsl */ `
  uniform float uLightMode;

  varying float vFocalDist;
  varying float vColorMix;
  varying float vAlphaBoost;
  varying float vStrand;

  float sdHexagon(vec2 p, float r) {
    const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
    p = abs(p);
    p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
    p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
    return length(p) * sign(p.y);
  }

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;

    float ang = vStrand * 1.047 + 0.25;
    float ca = cos(ang);
    float sa = sin(ang);
    vec2 ruv = vec2(ca * uv.x - sa * uv.y, sa * uv.x + ca * uv.y);

    float defocus = smoothstep(1.4, 8.5, vFocalDist);

    float dCircle = length(uv) - 0.42;
    float dHex = sdHexagon(ruv, 0.72);
    float dist = mix(dCircle, dHex, defocus);

    float fw = fwidth(dist);
    float softness = mix(max(fw, 0.06), 0.36, defocus);
    float shapeMask = 1.0 - smoothstep(-softness, softness, dist);

    if (shapeMask < 0.01) discard;

    float bokehRim = smoothstep(-0.28, -0.04, dist) * (1.0 - smoothstep(-0.04, 0.08, dist)) * defocus * 0.55;

    vec3 colCyan = uLightMode > 0.5 ? vec3(0.02, 0.55, 0.52) : vec3(0.0, 0.96, 1.0);
    vec3 colBlue = uLightMode > 0.5 ? vec3(0.0, 0.23, 0.28) : vec3(0.145, 0.388, 0.922);
    vec3 colLav  = uLightMode > 0.5 ? vec3(0.35, 0.31, 0.91) : vec3(0.608, 0.561, 1.0);
    vec3 colLime = uLightMode > 0.5 ? vec3(0.04, 0.54, 0.49) : vec3(0.812, 1.0, 0.016);

    vec3 color = mix(colCyan, colBlue, smoothstep(0.0, 0.48, vColorMix));
    color = mix(color, colLav, smoothstep(0.48, 0.85, vColorMix));
    color = mix(color, colLime, smoothstep(0.88, 1.0, vColorMix));

    float hotCore = (1.0 - defocus) * exp(-length(uv) * 3.8) * (uLightMode > 0.5 ? 0.15 : 0.65);
    color += vec3(hotCore) + color * bokehRim;

    float alpha = (shapeMask * mix(0.92, 0.22, defocus) + bokehRim) * vAlphaBoost;
    alpha *= uLightMode > 0.5 ? 0.58 : 0.88;

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

export function createDofParticleSystem({ isMobile = false } = {}) {
  const count = isMobile ? 2000 : 5200;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);
  const randoms = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    seeds[i3] = i / count;
    seeds[i3 + 1] = Math.random();
    seeds[i3 + 2] = Math.random();

    randoms[i3] = (Math.random() - 0.5) * 2.0;
    randoms[i3 + 1] = (Math.random() - 0.5) * 2.0;
    randoms[i3 + 2] = (Math.random() - 0.5) * 2.0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 40);

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    uFocalPoint: { value: new THREE.Vector3(0, 0, 0) },
    uScrollVel: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uLightMode: { value: 0 }
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: DOF_PARTICLES_VERTEX,
    fragmentShader: DOF_PARTICLES_FRAGMENT,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    extensions: { derivatives: true }
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  return {
    points,
    uniforms,
    setLightMode(isLight) {
      uniforms.uLightMode.value = isLight ? 1.0 : 0.0;
      material.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      material.needsUpdate = true;
    }
  };
}
