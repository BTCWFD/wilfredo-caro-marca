// src/webgl/audio-reactive.js
// Tactile Spatial & Procedural Web Audio Engine inspired by Resn's interactive soundscapes.

const PENTATONIC_HZ = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25];

export function createReactiveAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let droneFilter = null;
  let enabled = false;

  const ensureContext = () => {
    if (ctx) return ctx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    ctx = new AudioCtx();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.0001;
    masterGain.connect(ctx.destination);

    droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 180;
    droneFilter.Q.value = 2.2;
    droneFilter.connect(masterGain);

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.16;
    droneGain.connect(droneFilter);

    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.value = 65.41;

    const oscB = ctx.createOscillator();
    oscB.type = 'triangle';
    oscB.frequency.value = 98.0;

    oscA.connect(droneGain);
    oscB.connect(droneGain);
    oscA.start();
    oscB.start();

    return ctx;
  };

  return {
    toggle() {
      const audioCtx = ensureContext();
      if (!audioCtx) return false;
      if (audioCtx.state === 'suspended') audioCtx.resume();
      enabled = !enabled;
      const now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(enabled ? 0.35 : 0.0001, now, 0.25);
      if (enabled) this.playTransitionPulse(0);
      return enabled;
    },
    updateScroll(scrollNorm, scrollVel) {
      if (!enabled || !ctx || !droneFilter) return;
      const velBoost = Math.min(600, Math.abs(scrollVel) * 900);
      const actCutoff = 140 + Math.sin(scrollNorm * Math.PI) * 220 + (scrollNorm > 0.8 ? 180 : 0);
      droneFilter.frequency.setTargetAtTime(actCutoff + velBoost, ctx.currentTime, 0.08);
    },
    playBranchPluck(branchIndex = 0) {
      if (!enabled || !ctx) return;
      const now = ctx.currentTime;
      const freq = PENTATONIC_HZ[branchIndex % PENTATONIC_HZ.length];
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.498, now + 0.16);
      env.gain.setValueAtTime(0.001, now);
      env.gain.linearRampToValueAtTime(0.14, now + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0008, now + 0.32);
      osc.connect(env);
      env.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.34);
    },
    playTransitionPulse(actIdx = 0) {
      if (!enabled || !ctx) return;
      const now = ctx.currentTime;
      const base = 196.0 + actIdx * 32.5;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.exponentialRampToValueAtTime(base * 0.75, now + 0.24);
      env.gain.setValueAtTime(0.001, now);
      env.gain.linearRampToValueAtTime(0.09, now + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0008, now + 0.28);
      osc.connect(env);
      env.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  };
}
