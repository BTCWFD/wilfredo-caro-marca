// src/webgl/entities/agent-tree-rig.js
// Resn "Corn Revolutionized" Technique #5:
// Skeletal Bone-Scaled Quads + Invisible 3D Hitboxes & Rotational Spring-Damper Physics.

import * as THREE from 'three';

function createSkinnedAgentBranch({ angle, elevation, length = 3.2, colorHex = 0x00f5ff }) {
  const segCount = 18;
  const width = 0.16;

  const rootBone = new THREE.Bone();
  const midBone = new THREE.Bone();
  const tipBone = new THREE.Bone();

  rootBone.position.set(0, 0, 0);
  midBone.position.set(0, length * 0.45, 0);
  tipBone.position.set(0, length * 0.42, 0);

  rootBone.add(midBone);
  midBone.add(tipBone);

  const bones = [rootBone, midBone, tipBone];
  const restRotations = [
    new THREE.Euler(elevation, angle, 0.18),
    new THREE.Euler(0.28, 0.12, -0.22),
    new THREE.Euler(0.32, -0.15, 0.25)
  ];

  bones.forEach((b, idx) => {
    b.rotation.copy(restRotations[idx]);
    b.userData.restRot = restRotations[idx].clone();
    b.userData.rotVel = new THREE.Vector2(0, 0);
    b.userData.rotOffset = new THREE.Vector2(0, 0);
  });

  const geo = new THREE.PlaneGeometry(width, length, 1, segCount);
  geo.translate(0, length * 0.5, 0);

  const posAttr = geo.attributes.position;
  const vertexCount = posAttr.count;
  const skinIndices = [];
  const skinWeights = [];

  for (let i = 0; i < vertexCount; i++) {
    const vy = posAttr.getY(i);
    const t = THREE.MathUtils.clamp(vy / length, 0, 1);
    const taper = Math.sin(t * Math.PI) * 1.15 + (1.0 - t) * 0.35;
    posAttr.setX(i, posAttr.getX(i) * taper);
    posAttr.setZ(i, Math.sin(t * Math.PI * 2.0) * 0.06);

    let w0 = 0, w1 = 0, w2 = 0;
    if (t < 0.45) {
      const f = t / 0.45;
      w0 = 1.0 - f;
      w1 = f;
    } else {
      const f = (t - 0.45) / 0.55;
      w1 = 1.0 - f;
      w2 = f;
    }
    skinIndices.push(0, 1, 2, 0);
    skinWeights.push(w0, w1, w2, 0);
  }

  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  geo.computeVertexNormals();

  const mat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.52,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const skinnedMesh = new THREE.SkinnedMesh(geo, mat);
  const skeleton = new THREE.Skeleton(bones);
  skinnedMesh.add(rootBone);
  skinnedMesh.bind(skeleton);
  skinnedMesh.frustumCulled = false;

  const nodeMat = new THREE.MeshBasicMaterial({
    color: 0x00f5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  const tipNode = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), nodeMat);
  tipNode.position.set(0, length * 0.14, 0);
  tipBone.add(tipNode);

  const hitbox = new THREE.Mesh(
    new THREE.SphereGeometry(0.68, 8, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitbox.position.set(0, length * 0.1, 0);
  tipBone.add(hitbox);

  return { skinnedMesh, bones, mat, nodeMat, tipNode, hitbox, baseColor: new THREE.Color(colorHex), excitation: 0 };
}

export function createAntigravitySwarmRig({ onBranchPluck } = {}) {
  const group = new THREE.Group();

  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x00f5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.65
  });
  const coordinatorCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.46, 1), coreMat);
  group.add(coordinatorCore);

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x9b8fff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.45
  });
  const orbitRing = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.79, 48), ringMat);
  orbitRing.rotation.x = Math.PI * 0.38;
  group.add(orbitRing);

  const branchConfigs = [
    { angle: 0.0, elevation: 0.72, length: 3.1, colorHex: 0x00f5ff },
    { angle: 1.05, elevation: 0.88, length: 3.4, colorHex: 0x2563eb },
    { angle: 2.09, elevation: 0.68, length: 2.9, colorHex: 0x9b8fff },
    { angle: 3.14, elevation: 0.85, length: 3.3, colorHex: 0x00f5ff },
    { angle: 4.19, elevation: 0.75, length: 3.0, colorHex: 0x2563eb },
    { angle: 5.24, elevation: 0.92, length: 3.5, colorHex: 0xcfff04 }
  ];

  const branches = [];
  const hitboxes = [];

  branchConfigs.forEach((cfg, idx) => {
    const branch = createSkinnedAgentBranch(cfg);
    branch.hitbox.userData.branchIndex = idx;
    branches.push(branch);
    hitboxes.push(branch.hitbox);
    group.add(branch.skinnedMesh);
  });

  const raycaster = new THREE.Raycaster();
  let lastHoveredIdx = -1;
  let lastPluckTime = 0;

  return {
    group,
    setLightMode(isLight) {
      const blend = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      coreMat.color.setHex(isLight ? 0x003a3a : 0x00f5ff);
      branches.forEach((b) => {
        b.mat.blending = blend;
        b.mat.opacity = isLight ? 0.38 : 0.52;
      });
    },
    checkPointerHit(ndcPointer, pointerVel, camera, nowSec) {
      if (!group.visible) return;

      raycaster.setFromCamera(ndcPointer, camera);
      const hits = raycaster.intersectObjects(hitboxes, false);

      if (hits.length > 0) {
        const idx = hits[0].object.userData.branchIndex;
        const b = branches[idx];
        if (b) {
          const impulseX = THREE.MathUtils.clamp(pointerVel.y * 14.0 + (Math.random() - 0.5) * 1.6, -4.5, 4.5);
          const impulseZ = THREE.MathUtils.clamp(-pointerVel.x * 14.0 + (Math.random() - 0.5) * 1.6, -4.5, 4.5);

          b.bones[1].userData.rotVel.x += impulseX * 0.55;
          b.bones[1].userData.rotVel.y += impulseZ * 0.55;
          b.bones[2].userData.rotVel.x += impulseX * 0.95;
          b.bones[2].userData.rotVel.y += impulseZ * 0.95;
          b.excitation = 1.0;

          if (idx !== lastHoveredIdx && nowSec - lastPluckTime > 0.12) {
            lastHoveredIdx = idx;
            lastPluckTime = nowSec;
            if (typeof onBranchPluck === 'function') onBranchPluck(idx);
          }
        }
      } else {
        lastHoveredIdx = -1;
      }
    },
    update(dt, elapsedTime, growthProgress) {
      const safeDt = Math.min(dt, 0.05);
      const g = THREE.MathUtils.clamp(growthProgress, 0, 1);

      group.visible = g > 0.01;
      if (!group.visible) return;

      const hubScale = THREE.MathUtils.smoothstep(g, 0.0, 0.35);
      coordinatorCore.scale.setScalar(Math.max(0.001, hubScale));
      coordinatorCore.rotation.y = elapsedTime * 0.45;
      coordinatorCore.rotation.x = elapsedTime * 0.25;

      orbitRing.scale.setScalar(Math.max(0.001, hubScale * (1.0 + Math.sin(elapsedTime * 2.0) * 0.05)));
      orbitRing.rotation.z = -elapsedTime * 0.6;

      const stiffness = 22.0;
      const damping = 4.6;

      branches.forEach((b, idx) => {
        const stagger = idx * 0.06;
        const localG = THREE.MathUtils.clamp((g - stagger) / (1.0 - stagger), 0, 1);

        b.bones[0].scale.setScalar(Math.max(0.001, THREE.MathUtils.smoothstep(localG, 0.0, 0.45)));
        b.bones[1].scale.setScalar(Math.max(0.001, THREE.MathUtils.smoothstep(localG, 0.22, 0.72)));
        b.bones[2].scale.setScalar(Math.max(0.001, THREE.MathUtils.smoothstep(localG, 0.48, 1.0)));

        b.bones.forEach((bone, bIdx) => {
          const vel = bone.userData.rotVel;
          const off = bone.userData.rotOffset;
          const rest = bone.userData.restRot;

          vel.x += (-stiffness * off.x - damping * vel.x) * safeDt;
          vel.y += (-stiffness * off.y - damping * vel.y) * safeDt;
          off.x += vel.x * safeDt;
          off.y += vel.y * safeDt;

          const sway = Math.sin(elapsedTime * 1.4 + idx * 1.1 + bIdx * 0.7) * 0.055;
          bone.rotation.x = rest.x + off.x + sway;
          bone.rotation.z = rest.z + off.y + sway * 0.6;
        });

        b.excitation = Math.max(0, b.excitation - safeDt * 1.8);
        b.mat.color.copy(b.baseColor).lerp(new THREE.Color(0xcfff04), b.excitation * 0.85);
        b.nodeMat.color.setHex(b.excitation > 0.2 ? 0xcfff04 : 0x00f5ff);
        b.tipNode.rotation.y += safeDt * (1.5 + b.excitation * 8.0);
      });
    }
  };
}
