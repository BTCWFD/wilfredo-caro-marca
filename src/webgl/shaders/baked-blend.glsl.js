// src/webgl/shaders/baked-blend.glsl.js
// Resn "Corn Revolutionized" Technique #3:
// 4-Angle Pre-Baked Lighting & Depth-of-Field (Bokeh) Shader Interpolation.

import * as THREE from 'three';

const BAKED_VERT = /* glsl */ `
  uniform sampler2D uTex0;
  uniform vec2 uPointer;
  uniform float uHover;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 sampleCol = texture2D(uTex0, uv);
    float lum = dot(sampleCol.rgb, vec3(0.299, 0.587, 0.114));

    vec3 pos = position;
    float edgeFade = smoothstep(0.0, 0.18, uv.x) * smoothstep(1.0, 0.82, uv.x) *
                     smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.82, uv.y);
    pos.z += (lum - 0.35) * (0.14 + uHover * 0.10) * edgeFade;
    pos.z += (uv.x - 0.5) * uPointer.x * 0.12 + (uv.y - 0.5) * uPointer.y * 0.12;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const BAKED_FRAG = /* glsl */ `
  uniform sampler2D uTex0;
  uniform sampler2D uTex1;
  uniform sampler2D uTex2;
  uniform sampler2D uTex3;
  uniform float uLightAngle;
  uniform float uFocusDepth;
  uniform float uTime;
  uniform vec2 uPointer;

  varying vec2 vUv;

  void main() {
    vec4 t0 = texture2D(uTex0, vUv);
    vec4 t1 = texture2D(uTex1, vUv);
    vec4 t2 = texture2D(uTex2, vUv);
    vec4 t3 = texture2D(uTex3, vUv);

    vec3 sharpLit = mix(t0.rgb, t1.rgb, clamp(uLightAngle, 0.0, 1.0));

    vec2 pointerUv = uPointer * 0.25 + 0.5;
    float radialDist = distance(vUv, pointerUv);
    float localDefocus = clamp(uFocusDepth + smoothstep(0.28, 0.78, radialDist) * 0.42, 0.0, 1.0);

    vec3 color = mix(sharpLit, t2.rgb, smoothstep(0.0, 0.58, localDefocus));
    color = mix(color, t3.rgb, smoothstep(0.55, 1.0, localDefocus));

    vec2 dEdge = abs(vUv - 0.5) * 2.0;
    float boxDist = max(dEdge.x, dEdge.y);
    float fw = max(fwidth(boxDist), 0.004);
    float borderLine = (1.0 - smoothstep(0.95 - fw, 0.95 + fw, boxDist)) * smoothstep(0.935 - fw, 0.935 + fw, boxDist);

    float scan = sin(vUv.y * 260.0 - uTime * 2.4) * 0.018;
    color += vec3(0.0, 0.96, 1.0) * (borderLine * 0.45 + max(0.0, scan));

    float vig = 1.0 - smoothstep(0.68, 1.02, length((vUv - 0.5) * vec2(1.05, 1.02)) * 1.42);
    gl_FragColor = vec4(color, vig);
  }
`;

function bakeFourPortraitStates(img) {
  const size = 512;
  const makeCanvas = () => {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    return c;
  };

  const drawCoverImage = (ctx) => {
    if (!img) {
      const g = ctx.createRadialGradient(size * 0.5, size * 0.4, 20, size * 0.5, size * 0.5, size * 0.5);
      g.addColorStop(0, '#162844');
      g.addColorStop(1, '#060810');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      return;
    }
    const iw = img.naturalWidth || img.width || size;
    const ih = img.naturalHeight || img.height || size;
    const scale = Math.max(size / iw, size / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, (size - dw) * 0.5, (size - dh) * 0.2, dw, dh);
  };

  const c0 = makeCanvas();
  const ctx0 = c0.getContext('2d');
  ctx0.filter = 'contrast(1.08) saturate(1.06)';
  drawCoverImage(ctx0);
  ctx0.filter = 'none';
  ctx0.globalCompositeOperation = 'screen';
  const g0 = ctx0.createLinearGradient(0, 0, size * 0.75, size * 0.75);
  g0.addColorStop(0, 'rgba(0, 245, 255, 0.34)');
  g0.addColorStop(0.55, 'rgba(37, 99, 235, 0.08)');
  g0.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx0.fillStyle = g0;
  ctx0.fillRect(0, 0, size, size);

  const c1 = makeCanvas();
  const ctx1 = c1.getContext('2d');
  ctx1.filter = 'contrast(1.12) brightness(0.98)';
  drawCoverImage(ctx1);
  ctx1.filter = 'none';
  ctx1.globalCompositeOperation = 'screen';
  const g1 = ctx1.createLinearGradient(size, size * 0.15, size * 0.2, size * 0.85);
  g1.addColorStop(0, 'rgba(155, 143, 255, 0.42)');
  g1.addColorStop(0.5, 'rgba(37, 99, 235, 0.18)');
  g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx1.fillStyle = g1;
  ctx1.fillRect(0, 0, size, size);

  const c2 = makeCanvas();
  const ctx2 = c2.getContext('2d');
  ctx2.filter = 'blur(7px) saturate(1.22) brightness(1.05)';
  drawCoverImage(ctx2);
  ctx2.filter = 'none';
  ctx2.globalCompositeOperation = 'lighter';
  [
    [0.18, 0.22, 34, 'rgba(0, 245, 255, 0.16)'],
    [0.82, 0.28, 42, 'rgba(155, 143, 255, 0.16)'],
    [0.76, 0.78, 30, 'rgba(207, 255, 4, 0.11)'],
    [0.22, 0.75, 38, 'rgba(37, 99, 235, 0.18)']
  ].forEach(([bx, by, r, col]) => {
    ctx2.beginPath();
    ctx2.arc(bx * size, by * size, r, 0, Math.PI * 2);
    ctx2.fillStyle = col;
    ctx2.fill();
  });

  const c3 = makeCanvas();
  const ctx3 = c3.getContext('2d');
  ctx3.filter = 'blur(19px) saturate(1.35) brightness(0.82)';
  drawCoverImage(ctx3);
  ctx3.filter = 'none';
  ctx3.globalCompositeOperation = 'screen';
  const g3 = ctx3.createRadialGradient(size * 0.5, size * 0.5, 40, size * 0.5, size * 0.5, size * 0.55);
  g3.addColorStop(0, 'rgba(0, 245, 255, 0.14)');
  g3.addColorStop(1, 'rgba(37, 99, 235, 0.25)');
  ctx3.fillStyle = g3;
  ctx3.fillRect(0, 0, size, size);

  return [c0, c1, c2, c3].map((c) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  });
}

export function initBakedPortraitMonolith() {
  const container = document.querySelector('.about-visual');
  if (!container || window.prefersReducedMotion) return null;

  const origImg = container.querySelector('img');
  const canvas = document.createElement('canvas');
  canvas.className = 'baked-portrait-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    canvas.remove();
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
  camera.position.z = 3.15;

  const initialTextures = bakeFourPortraitStates(null);
  const uniforms = {
    uTex0: { value: initialTextures[0] },
    uTex1: { value: initialTextures[1] },
    uTex2: { value: initialTextures[2] },
    uTex3: { value: initialTextures[3] },
    uLightAngle: { value: 0.35 },
    uFocusDepth: { value: 0.45 },
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uHover: { value: 0 }
  };

  const geo = new THREE.PlaneGeometry(1.92, 1.92, 42, 42);
  const mat = new THREE.ShaderMaterial({
    vertexShader: BAKED_VERT,
    fragmentShader: BAKED_FRAG,
    uniforms,
    transparent: true,
    extensions: { derivatives: true }
  });

  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const loadAndBake = (imageEl) => {
    const baked = bakeFourPortraitStates(imageEl);
    uniforms.uTex0.value.dispose();
    uniforms.uTex1.value.dispose();
    uniforms.uTex2.value.dispose();
    uniforms.uTex3.value.dispose();
    uniforms.uTex0.value = baked[0];
    uniforms.uTex1.value = baked[1];
    uniforms.uTex2.value = baked[2];
    uniforms.uTex3.value = baked[3];
    updateSize();
    renderer.render(scene, camera);
    container.classList.add('webgl-portrait-ready');
  };

  const loaderImg = new Image();
  loaderImg.crossOrigin = 'anonymous';
  loaderImg.onload = () => loadAndBake(loaderImg);
  loaderImg.src = origImg ? origImg.src : '/wilfredo-portrait.jpg';

  const updateSize = () => {
    const rect = container.getBoundingClientRect();
    const w = Math.max(240, rect.width || 420);
    const h = Math.max(240, rect.height || 420);
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  updateSize();
  window.addEventListener('resize', updateSize);

  let targetPtrX = 0;
  let targetPtrY = 0;
  let targetHover = 0;

  container.addEventListener('pointermove', (e) => {
    const r = container.getBoundingClientRect();
    targetPtrX = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
    targetPtrY = -(((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1);
    targetHover = 1.0;
  });

  container.addEventListener('pointerleave', () => {
    targetPtrX = 0;
    targetPtrY = 0;
    targetHover = 0;
  });

  return {
    update(elapsedTime) {
      const rect = container.getBoundingClientRect();
      if (rect.bottom < -150 || rect.top > window.innerHeight + 150) return;

      uniforms.uTime.value = elapsedTime;
      uniforms.uPointer.value.x += (targetPtrX - uniforms.uPointer.value.x) * 0.08;
      uniforms.uPointer.value.y += (targetPtrY - uniforms.uPointer.value.y) * 0.08;
      uniforms.uHover.value += (targetHover - uniforms.uHover.value) * 0.08;

      const centerOffset = ((rect.top + rect.height * 0.5) / Math.max(1, window.innerHeight)) - 0.5;
      const distFromCenter = Math.min(1, Math.abs(centerOffset) * 2.1);

      const targetFocus = Math.max(0.0, distFromCenter * 0.85 - uniforms.uHover.value * 0.35);
      uniforms.uFocusDepth.value += (targetFocus - uniforms.uFocusDepth.value) * 0.08;

      const targetAngle = 0.5 + centerOffset * 0.85 + uniforms.uPointer.value.x * 0.38;
      uniforms.uLightAngle.value += (targetAngle - uniforms.uLightAngle.value) * 0.08;

      mesh.rotation.y = uniforms.uPointer.value.x * 0.16;
      mesh.rotation.x = -uniforms.uPointer.value.y * 0.14;

      renderer.render(scene, camera);
    }
  };
}
