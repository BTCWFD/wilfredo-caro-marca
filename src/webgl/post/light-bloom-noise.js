// src/webgl/post/light-bloom-noise.js
// Single-pass lightweight framebuffer: Light Bloom + Noise Displacement + Chromatic Aberration.

import * as THREE from 'three';

const POST_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const POST_FRAG = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uScrollVel;
  uniform float uLightMode;

  varying vec2 vUv;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    float waveNoise = sin(vUv.y * 22.0 + uTime * 1.4) * cos(vUv.x * 18.0 - uTime * 1.1);
    float velMag = clamp(abs(uScrollVel), 0.0, 1.0);
    vec2 displacedUv = vUv + vec2(waveNoise * (0.0005 + velMag * 0.0022), 0.0);

    vec2 centerVec = displacedUv - 0.5;
    float caOffset = (0.0008 + velMag * 0.0045) * length(centerVec);

    vec4 cr = texture2D(tDiffuse, displacedUv + centerVec * caOffset);
    vec4 cg = texture2D(tDiffuse, displacedUv);
    vec4 cb = texture2D(tDiffuse, displacedUv - centerVec * caOffset);
    vec3 baseCol = vec3(cr.r, cg.g, cb.b);
    float baseAlpha = max(max(cr.a, cg.a), cb.a);

    vec2 texel = 2.4 / max(uResolution, vec2(1.0));
    vec3 b1 = texture2D(tDiffuse, displacedUv + vec2( texel.x,  texel.y)).rgb;
    vec3 b2 = texture2D(tDiffuse, displacedUv + vec2(-texel.x,  texel.y)).rgb;
    vec3 b3 = texture2D(tDiffuse, displacedUv + vec2( texel.x, -texel.y)).rgb;
    vec3 b4 = texture2D(tDiffuse, displacedUv + vec2(-texel.x, -texel.y)).rgb;
    vec3 blurAvg = (baseCol + b1 + b2 + b3 + b4) * 0.2;

    float lum = dot(blurAvg, vec3(0.299, 0.587, 0.114));
    vec3 bloom = blurAvg * smoothstep(0.18, 0.85, lum) * (uLightMode > 0.5 ? 0.12 : 0.42);
    float grain = (hash12(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * (uLightMode > 0.5 ? 0.012 : 0.022);

    gl_FragColor = vec4(baseCol + bloom + grain, clamp(baseAlpha + length(bloom) * 0.35, 0.0, 1.0));
  }
`;

export function createLightBloomNoisePass(renderer) {
  const pr = renderer.getPixelRatio();
  const width = Math.max(1, Math.floor(window.innerWidth * pr));
  const height = Math.max(1, Math.floor(window.innerHeight * pr));

  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    depthBuffer: true,
    stencilBuffer: false
  });

  const postScene = new THREE.Scene();
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    tDiffuse: { value: renderTarget.texture },
    uResolution: { value: new THREE.Vector2(width, height) },
    uTime: { value: 0 },
    uScrollVel: { value: 0 },
    uLightMode: { value: 0 }
  };

  postScene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: POST_VERT,
      fragmentShader: POST_FRAG,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false
    })
  ));

  return {
    render(scene, camera, elapsedTime, scrollVel) {
      uniforms.uTime.value = elapsedTime;
      uniforms.uScrollVel.value = scrollVel;

      renderer.setRenderTarget(renderTarget);
      renderer.clear();
      renderer.render(scene, camera);

      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    },
    resize(w, h, pixelRatio) {
      const rw = Math.max(1, Math.floor(w * pixelRatio));
      const rh = Math.max(1, Math.floor(h * pixelRatio));
      renderTarget.setSize(rw, rh);
      uniforms.uResolution.value.set(rw, rh);
    },
    setLightMode(isLight) {
      uniforms.uLightMode.value = isLight ? 1.0 : 0.0;
    }
  };
}
