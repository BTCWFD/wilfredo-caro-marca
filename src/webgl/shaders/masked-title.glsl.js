// src/webgl/shaders/masked-title.glsl.js
// Resn "Corn Revolutionized" Techniques #1 & #2:
// Derivative Anti-Aliased Vector Strokes (dFdx/fwidth) + Glyph GL_POINTS + Instanced Plexus in 3 Draw Calls.

import * as THREE from 'three';

function buildDistanceFieldAtlas() {
  const width = 1024;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const offSharp = document.createElement('canvas');
  offSharp.width = width;
  offSharp.height = height;
  const sctx = offSharp.getContext('2d', { willReadFrequently: true });

  sctx.fillStyle = '#000';
  sctx.fillRect(0, 0, width, height);
  sctx.fillStyle = '#fff';
  sctx.textAlign = 'center';
  sctx.textBaseline = 'middle';
  sctx.font = '900 94px "Cabinet Grotesk", "Outfit", system-ui, sans-serif';
  sctx.fillText('SWARM · ARCHITECT', width / 2, height * 0.44);

  sctx.font = '600 28px "Martian Mono", "JetBrains Mono", monospace';
  sctx.fillText('ML-KEM // ANTIGRAVITY // ORBIT // WEB3', width / 2, height * 0.80);

  sctx.strokeStyle = '#fff';
  sctx.lineWidth = 4;
  sctx.strokeRect(26, 24, 36, 36);
  sctx.strokeRect(width - 62, height - 60, 36, 36);

  const offBlur = document.createElement('canvas');
  offBlur.width = width;
  offBlur.height = height;
  const bctx = offBlur.getContext('2d', { willReadFrequently: true });
  bctx.filter = 'blur(7px)';
  bctx.drawImage(offSharp, 0, 0);

  const sharpData = sctx.getImageData(0, 0, width, height).data;
  const blurData = bctx.getImageData(0, 0, width, height).data;
  const outImg = ctx.createImageData(width, height);
  const out = outImg.data;

  const sampledPoints = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const sVal = sharpData[idx];
      const bVal = blurData[idx];

      out[idx] = bVal;
      out[idx + 1] = sVal;
      out[idx + 2] = Math.floor(((x / width) * 0.75 + (y / height) * 0.25) * 255);
      out[idx + 3] = 255;

      if (x % 10 === 0 && y % 8 === 0 && bVal > 55 && bVal < 215) {
        sampledPoints.push(new THREE.Vector3((x / width - 0.5) * 10.5, (0.5 - y / height) * 2.625, (Math.random() - 0.5) * 0.16));
      }
    }
  }

  ctx.putImageData(outImg, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return { texture, sampledPoints };
}

const TITLE_PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const TITLE_PLANE_FRAG = /* glsl */ `
  uniform sampler2D uFieldTex;
  uniform float uTime;
  uniform float uReveal;
  uniform float uLightMode;
  uniform vec2 uResolution;

  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uFieldTex, vUv);
    float sd = tex.r;
    float grad = tex.b;

    float fw = max(fwidth(sd), 0.008);
    float ringDist = abs(sd - 0.48);
    float stroke = 1.0 - smoothstep(0.055 - fw, 0.055 + fw, ringDist);
    float innerFill = smoothstep(0.50 - fw, 0.50 + fw, tex.g) * 0.08;

    float wave = fract(grad * 2.2 - uTime * 0.24);
    float stepMask = smoothstep(0.0, 0.14, wave) * (1.0 - smoothstep(uReveal * 0.78, uReveal * 0.78 + 0.12, wave));

    float screenDiag = fract((gl_FragCoord.x + gl_FragCoord.y * 0.65) / max(uResolution.x, 1.0) * 3.0 - uTime * 0.12);
    float screenMask = mix(0.45, 1.0, smoothstep(0.15, 0.65, screenDiag));

    vec3 cyan = uLightMode > 0.5 ? vec3(0.0, 0.42, 0.44) : vec3(0.0, 0.96, 1.0);
    vec3 lav  = uLightMode > 0.5 ? vec3(0.32, 0.25, 0.85) : vec3(0.61, 0.56, 1.0);
    vec3 color = mix(cyan, lav, vUv.x);

    float alpha = (stroke * mix(0.28, 1.0, stepMask) * screenMask + innerFill) * uReveal;
    alpha *= uLightMode > 0.5 ? 0.55 : 0.72;

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const GLYPH_POINTS_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uReveal;
  attribute float aPhase;
  varying float vPulse;

  void main() {
    vec3 pos = position;
    float wave = sin(uTime * 1.8 + aPhase * 6.2831);
    pos.z += wave * 0.09;
    vPulse = 0.5 + 0.5 * wave;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = clamp((3.2 + vPulse * 2.2) * uPixelRatio * (6.0 / max(1.5, -mvPos.z)), 1.5, 14.0) * uReveal;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const GLYPH_POINTS_FRAG = /* glsl */ `
  uniform float uLightMode;
  uniform float uReveal;
  varying float vPulse;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float fw = fwidth(d);
    float mask = 1.0 - smoothstep(0.38 - fw, 0.38 + fw, d);
    if (mask < 0.01) discard;

    vec3 col = uLightMode > 0.5 ? vec3(0.02, 0.48, 0.46) : mix(vec3(0.0, 0.96, 1.0), vec3(0.81, 1.0, 0.02), vPulse * 0.45);
    gl_FragColor = vec4(col, mask * uReveal * (uLightMode > 0.5 ? 0.55 : 0.85));
  }
`;

const PLEXUS_LINES_VERT = /* glsl */ `
  uniform float uTime;
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute float aPhase;

  varying vec2 vUv;
  varying float vPhase;

  void main() {
    vUv = uv;
    vPhase = aPhase;

    float w1 = sin(uTime * 1.8 + aPhase * 6.2831) * 0.09;
    float w2 = sin(uTime * 1.8 + fract(aPhase * 3.71) * 6.2831) * 0.09;

    vec3 pStart = aStart + vec3(0.0, 0.0, w1);
    vec3 pEnd   = aEnd   + vec3(0.0, 0.0, w2);

    vec3 dir = pEnd - pStart;
    float len = length(dir);
    vec3 forward = len > 0.0001 ? dir / len : vec3(1.0, 0.0, 0.0);
    vec3 perp = normalize(vec3(-forward.y, forward.x, 0.0));
    float thickness = 0.014;

    vec3 worldLocal = pStart + forward * (position.x * len) + perp * (position.y * thickness);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldLocal, 1.0);
  }
`;

const PLEXUS_LINES_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uReveal;
  uniform float uLightMode;
  uniform vec2 uResolution;

  varying vec2 vUv;
  varying float vPhase;

  void main() {
    float edgeDist = abs(vUv.y - 0.5) * 2.0;
    float fw = fwidth(edgeDist);
    float lineAlpha = 1.0 - smoothstep(0.65 - fw, 1.0, edgeDist);

    vec2 screenNorm = gl_FragCoord.xy / max(uResolution, vec2(1.0));
    float sweep = fract(screenNorm.x * 1.8 - uTime * 0.28 + vPhase * 0.35);
    float pulseMask = smoothstep(0.0, 0.25, sweep) * (1.0 - smoothstep(0.55, 0.85, sweep));

    vec3 col = uLightMode > 0.5 ? vec3(0.0, 0.35, 0.45) : vec3(0.0, 0.96, 1.0);
    float alpha = lineAlpha * pulseMask * uReveal * (uLightMode > 0.5 ? 0.35 : 0.48);
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(col, alpha);
  }
`;

export function createMaskedTitlePlexus() {
  const group = new THREE.Group();
  const { texture, sampledPoints } = buildDistanceFieldAtlas();

  const sharedUniforms = {
    uTime: { value: 0 },
    uReveal: { value: 1.0 },
    uLightMode: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) }
  };

  const planeGeo = new THREE.PlaneGeometry(10.5, 2.625, 1, 1);
  const planeMat = new THREE.ShaderMaterial({
    vertexShader: TITLE_PLANE_VERT,
    fragmentShader: TITLE_PLANE_FRAG,
    uniforms: {
      uFieldTex: { value: texture },
      uTime: sharedUniforms.uTime,
      uReveal: sharedUniforms.uReveal,
      uLightMode: sharedUniforms.uLightMode,
      uResolution: sharedUniforms.uResolution
    },
    transparent: true,
    depthWrite: false,
    extensions: { derivatives: true }
  });
  group.add(new THREE.Mesh(planeGeo, planeMat));

  const maxPts = Math.min(sampledPoints.length, 420);
  const ptPos = new Float32Array(maxPts * 3);
  const ptPhase = new Float32Array(maxPts);
  const step = Math.max(1, Math.floor(sampledPoints.length / Math.max(1, maxPts)));

  const chosenPoints = [];
  for (let i = 0; i < maxPts; i++) {
    const p = sampledPoints[Math.min(i * step, sampledPoints.length - 1)] || new THREE.Vector3();
    chosenPoints.push(p);
    ptPos[i * 3] = p.x;
    ptPos[i * 3 + 1] = p.y;
    ptPos[i * 3 + 2] = p.z + 0.02;
    ptPhase[i] = Math.random();
  }

  const ptsGeo = new THREE.BufferGeometry();
  ptsGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3));
  ptsGeo.setAttribute('aPhase', new THREE.BufferAttribute(ptPhase, 1));

  const ptsMat = new THREE.ShaderMaterial({
    vertexShader: GLYPH_POINTS_VERT,
    fragmentShader: GLYPH_POINTS_FRAG,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uPixelRatio: sharedUniforms.uPixelRatio,
      uReveal: sharedUniforms.uReveal,
      uLightMode: sharedUniforms.uLightMode
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    extensions: { derivatives: true }
  });
  group.add(new THREE.Points(ptsGeo, ptsMat));

  const pairs = [];
  for (let i = 0; i < chosenPoints.length; i++) {
    let connected = 0;
    for (let j = i + 1; j < chosenPoints.length && connected < 2; j++) {
      const distSq = chosenPoints[i].distanceToSquared(chosenPoints[j]);
      if (distSq > 0.05 && distSq < 0.72) {
        pairs.push([chosenPoints[i], chosenPoints[j], ptPhase[i]]);
        connected++;
      }
    }
    if (pairs.length >= 380) break;
  }

  const baseQuad = new THREE.PlaneGeometry(1, 1, 1, 1);
  baseQuad.translate(0.5, 0, 0);

  const instGeo = new THREE.InstancedBufferGeometry();
  instGeo.index = baseQuad.index;
  instGeo.attributes.position = baseQuad.attributes.position;
  instGeo.attributes.uv = baseQuad.attributes.uv;

  const instCount = Math.max(1, pairs.length);
  const startArr = new Float32Array(instCount * 3);
  const endArr = new Float32Array(instCount * 3);
  const phaseArr = new Float32Array(instCount);

  for (let i = 0; i < pairs.length; i++) {
    const [a, b, ph] = pairs[i];
    startArr[i * 3] = a.x;
    startArr[i * 3 + 1] = a.y;
    startArr[i * 3 + 2] = a.z + 0.015;
    endArr[i * 3] = b.x;
    endArr[i * 3 + 1] = b.y;
    endArr[i * 3 + 2] = b.z + 0.015;
    phaseArr[i] = ph;
  }

  instGeo.setAttribute('aStart', new THREE.InstancedBufferAttribute(startArr, 3));
  instGeo.setAttribute('aEnd', new THREE.InstancedBufferAttribute(endArr, 3));
  instGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phaseArr, 1));
  instGeo.instanceCount = instCount;
  instGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 15);

  const linesMat = new THREE.ShaderMaterial({
    vertexShader: PLEXUS_LINES_VERT,
    fragmentShader: PLEXUS_LINES_FRAG,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uReveal: sharedUniforms.uReveal,
      uLightMode: sharedUniforms.uLightMode,
      uResolution: sharedUniforms.uResolution
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    extensions: { derivatives: true }
  });

  const plexusLines = new THREE.Mesh(instGeo, linesMat);
  plexusLines.frustumCulled = false;
  group.add(plexusLines);

  return {
    group,
    uniforms: sharedUniforms,
    setLightMode(isLight) {
      sharedUniforms.uLightMode.value = isLight ? 1.0 : 0.0;
      const blend = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      ptsMat.blending = blend;
      linesMat.blending = blend;
    },
    resize(w, h, pr) {
      sharedUniforms.uResolution.value.set(w, h);
      sharedUniforms.uPixelRatio.value = pr;
    }
  };
}
