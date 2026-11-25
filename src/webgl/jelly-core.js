// src/webgl/jelly-core.js
// "Jelly"-Inspired Web3D Orchestrator for Wilfredo Caro ("Swarm Revolutionized").

import * as THREE from 'three';
import { createDofParticleSystem } from './shaders/dof-particles.glsl.js';
import { createMaskedTitlePlexus } from './shaders/masked-title.glsl.js';
import { initBakedPortraitMonolith } from './shaders/baked-blend.glsl.js';
import { createAntigravitySwarmRig } from './entities/agent-tree-rig.js';
import { createLightBloomNoisePass } from './post/light-bloom-noise.js';
import { createReactiveAudioEngine } from './audio-reactive.js';

export function initJellyExperience() {
  const canvas = document.querySelector('#bg-canvas');
  if (!canvas) return;

  if (window.prefersReducedMotion) {
    canvas.style.display = 'none';
    return;
  }

  const isMobile = window.innerWidth <= 768 || window.isTouchDevice;
  const audioEngine = createReactiveAudioEngine();

  const audioBtn = document.getElementById('hud-audio-toggle');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const on = audioEngine.toggle();
      audioBtn.classList.toggle('active', on);
      audioBtn.setAttribute('aria-pressed', String(on));
      const iconEl = audioBtn.querySelector('.hud-audio-icon');
      if (iconEl) iconEl.textContent = on ? '🔊' : '🔇';
    });
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0, 8.2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: isMobile,
    powerPreference: 'high-performance'
  });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(pixelRatio);

  const dofParticles = createDofParticleSystem({ isMobile });
  scene.add(dofParticles.points);

  const maskedTitle = createMaskedTitlePlexus();
  maskedTitle.group.position.set(0, 0.35, -1.8);
  scene.add(maskedTitle.group);

  const swarmRig = createAntigravitySwarmRig({
    onBranchPluck: (branchIdx) => {
      audioEngine.playBranchPluck(branchIdx);
      const pillText = document.getElementById('swarm-telemetry-text');
      if (pillText) {
        pillText.textContent = `ORBIT MISSION CONTROL · SUBAGENT NODE #0${branchIdx + 1} STABILIZED [ML-DSA VERIFIED]`;
      }
      window.dispatchEvent(new CustomEvent('swarmNodeStabilized', { detail: { branchIdx } }));
    }
  });
  swarmRig.group.position.set(0, -0.4, 1.4);
  scene.add(swarmRig.group);

  const portraitMonolith = initBakedPortraitMonolith();
  const postPass = !isMobile ? createLightBloomNoisePass(renderer) : null;

  const syncTheme = () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    dofParticles.setLightMode(isLight);
    maskedTitle.setLightMode(isLight);
    swarmRig.setLightMode(isLight);
    if (postPass) postPass.setLightMode(isLight);
  };
  syncTheme();

  new MutationObserver(syncTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  const hudRail = document.getElementById('swarm-act-rail');
  const hudProgressFill = document.getElementById('swarm-rail-fill');
  const hudActButtons = hudRail ? Array.from(hudRail.querySelectorAll('.swarm-act-node')) : [];

  hudActButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetSel = btn.getAttribute('data-target');
      const targetEl = targetSel ? document.querySelector(targetSel) : null;
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  let infiniteLoopEnabled = true;
  let lastWrapTimestamp = 0;
  const loopToggleBtn = document.getElementById('infinite-loop-toggle');
  if (loopToggleBtn) {
    loopToggleBtn.addEventListener('click', () => {
      infiniteLoopEnabled = !infiniteLoopEnabled;
      loopToggleBtn.classList.toggle('active', infiniteLoopEnabled);
      loopToggleBtn.setAttribute('aria-pressed', String(infiniteLoopEnabled));
    });
  }

  const pointerNDC = new THREE.Vector2(0, 0);
  const smoothPointer = new THREE.Vector2(0, 0);
  const pointerVel = new THREE.Vector2(0, 0);
  let prevPtrX = 0;
  let prevPtrY = 0;

  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    const ny = -(e.clientY / Math.max(1, window.innerHeight)) * 2 + 1;
    pointerVel.set(nx - prevPtrX, ny - prevPtrY);
    prevPtrX = nx;
    prevPtrY = ny;
    pointerNDC.set(nx, ny);
  }, { passive: true });

  let rawScrollNorm = 0;
  let smoothScrollNorm = 0;
  let scrollVelocity = 0;
  let prevSmoothScroll = 0;
  let currentActIndex = 0;

  const actSectionSelectors = ['#home', '#ai-orchestration', '#projects', '#services', '#contact'];
  const detectActiveActFromDOM = () => {
    const probeY = window.innerHeight * 0.42;
    let activeIdx = 0;
    for (let i = 0; i < actSectionSelectors.length; i++) {
      const el = document.querySelector(actSectionSelectors[i]);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= probeY) {
          activeIdx = i;
        }
      }
    }
    return activeIdx;
  };

  const computeOrchVisibility = () => {
    const orchEl = document.getElementById('ai-orchestration');
    if (!orchEl) return 0;
    const rect = orchEl.getBoundingClientRect();
    const vh = Math.max(1, window.innerHeight);
    const enter = THREE.MathUtils.smoothstep(vh - rect.top, 0, vh * 0.45);
    const exit = THREE.MathUtils.smoothstep(rect.bottom, -vh * 0.15, vh * 0.35);
    return enter * exit;
  };

  const computeMaxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

  const handleScroll = () => {
    const maxScroll = computeMaxScroll();
    const sy = window.scrollY;
    rawScrollNorm = THREE.MathUtils.clamp(sy / maxScroll, 0, 1);

    const now = performance.now();
    if (infiniteLoopEnabled && maxScroll > 900 && sy >= maxScroll - 4 && now - lastWrapTimestamp > 900) {
      const modalOpen = document.querySelector('.modal-overlay:not(.hidden)') ||
                        document.querySelector('.ai-assistant:not(.minimized)');
      if (!modalOpen) {
        lastWrapTimestamp = now;
        smoothScrollNorm = 0.002;
        prevSmoothScroll = 0.002;
        rawScrollNorm = 0.002;
        window.scrollTo({ top: 2, behavior: 'instant' });
        audioEngine.playTransitionPulse(0);
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const pr = Math.min(window.devicePixelRatio || 1, 2);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(pr);

    dofParticles.uniforms.uPixelRatio.value = pr;
    maskedTitle.resize(w, h, pr);
    if (postPass) postPass.resize(w, h, pr);
  });

  let isTabVisible = true;
  let rafId = 0;
  let prevTime = performance.now() * 0.001;
  const focalTarget = new THREE.Vector3(0, 0, 0);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isTabVisible = false;
      cancelAnimationFrame(rafId);
    } else {
      isTabVisible = true;
      prevTime = performance.now() * 0.001;
      tick();
    }
  });

  const tick = () => {
    if (!isTabVisible) return;
    rafId = requestAnimationFrame(tick);

    const nowSec = performance.now() * 0.001;
    const dt = Math.min(0.05, Math.max(0.001, nowSec - prevTime));
    prevTime = nowSec;

    let deltaScroll = rawScrollNorm - smoothScrollNorm;
    if (Math.abs(deltaScroll) > 0.65) {
      smoothScrollNorm = rawScrollNorm;
    } else {
      smoothScrollNorm += deltaScroll * 0.085;
    }

    scrollVelocity = THREE.MathUtils.clamp((smoothScrollNorm - prevSmoothScroll) / dt, -2.5, 2.5);
    prevSmoothScroll = smoothScrollNorm;

    smoothPointer.x += (pointerNDC.x - smoothPointer.x) * 0.08;
    smoothPointer.y += (pointerNDC.y - smoothPointer.y) * 0.08;
    pointerVel.multiplyScalar(0.85);

    const newAct = detectActiveActFromDOM();
    if (newAct !== currentActIndex) {
      currentActIndex = newAct;
      audioEngine.playTransitionPulse(newAct);
      hudActButtons.forEach((btn, idx) => btn.classList.toggle('active', idx === currentActIndex));
    }
    if (hudProgressFill) {
      hudProgressFill.style.transform = `scaleY(${smoothScrollNorm.toFixed(4)})`;
    }

    document.documentElement.style.setProperty(
      '--jelly-skew',
      `${THREE.MathUtils.clamp(scrollVelocity * 1.15, -1.8, 1.8).toFixed(3)}deg`
    );

    const cycleAngle = smoothScrollNorm * Math.PI * 2.0;
    camera.position.x = Math.sin(cycleAngle) * 1.15 + smoothPointer.x * 0.55;
    camera.position.y = Math.cos(cycleAngle) * 0.45 - 0.45 + smoothPointer.y * 0.35;
    camera.position.z = 7.8 + Math.cos(cycleAngle * 2.0) * 0.65;
    camera.lookAt(smoothPointer.x * 0.3, smoothPointer.y * 0.2, 0);

    focalTarget.set(
      smoothPointer.x * 2.4,
      Math.sin(cycleAngle * 2.0) * 1.6 + smoothPointer.y * 1.8,
      Math.cos(cycleAngle) * 1.8
    );

    dofParticles.uniforms.uTime.value = nowSec;
    dofParticles.uniforms.uScroll.value = smoothScrollNorm;
    dofParticles.uniforms.uScrollVel.value = scrollVelocity;
    dofParticles.uniforms.uPointer.value.copy(smoothPointer);
    dofParticles.uniforms.uFocalPoint.value.copy(focalTarget);
    dofParticles.points.rotation.y = nowSec * 0.08 + smoothScrollNorm * Math.PI * 0.5;

    const heroVis = 1.0 - THREE.MathUtils.smoothstep(smoothScrollNorm, 0.06, 0.21);
    const loopVis = THREE.MathUtils.smoothstep(smoothScrollNorm, 0.89, 0.99);
    const titleReveal = Math.max(heroVis, loopVis);

    maskedTitle.group.visible = titleReveal > 0.01;
    if (maskedTitle.group.visible) {
      maskedTitle.uniforms.uTime.value = nowSec;
      maskedTitle.uniforms.uReveal.value = titleReveal;
      maskedTitle.group.rotation.y = smoothPointer.x * 0.12;
      maskedTitle.group.rotation.x = -smoothPointer.y * 0.08;
      maskedTitle.group.position.y = 0.45 + (1.0 - titleReveal) * 1.2;
    }

    const rigGrowth = computeOrchVisibility();

    swarmRig.update(dt, nowSec, rigGrowth);
    swarmRig.group.rotation.y = nowSec * 0.14 + smoothPointer.x * 0.25;
    if (!isMobile && rigGrowth > 0.2) {
      swarmRig.checkPointerHit(pointerNDC, pointerVel, camera, nowSec);
    }

    if (portraitMonolith) portraitMonolith.update(nowSec);
    audioEngine.updateScroll(smoothScrollNorm, scrollVelocity);

    if (postPass) {
      postPass.render(scene, camera, nowSec, scrollVelocity);
    } else {
      renderer.render(scene, camera);
    }
  };

  tick();
}

initJellyExperience();
