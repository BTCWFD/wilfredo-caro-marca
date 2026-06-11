// --- 3D Background (Three.js Network) ---
const initBg = () => {
  const canvas = document.querySelector('#bg-canvas');
  if (!canvas) return;
  // Respect reduced-motion: skip the animated background entirely.
  if (window.prefersReducedMotion) {
    canvas.style.display = 'none';
    return;
  }
  // Guard against Three.js failing to load from the CDN.
  if (typeof THREE === 'undefined') {
    canvas.style.display = 'none';
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Adjust particle density based on screen size/hardware
  const isMobile = window.innerWidth <= 768 || window.isTouchDevice;
  const particlesCount = isMobile ? 50 : 120;
  const positions = new Float32Array(particlesCount * 3);
  const velocities = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 15;
    velocities[i] = (Math.random() - 0.5) * 0.01;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x1e8449, // var(--accent-primary)
    transparent: true,
    opacity: 0.8
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Connection Lines — one reusable geometry with a preallocated buffer.
  // Avoids creating a new BufferGeometry + LineSegments on every frame (no GC churn).
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1e8449, transparent: true, opacity: 0.2 });
  const maxSegments = (particlesCount * (particlesCount - 1)) / 2;
  const linePositions = new Float32Array(maxSegments * 6); // 2 endpoints × 3 coords
  const lineGeometry = new THREE.BufferGeometry();
  const linePositionAttr = new THREE.BufferAttribute(linePositions, 3);
  linePositionAttr.setUsage(THREE.DynamicDrawUsage);
  lineGeometry.setAttribute('position', linePositionAttr);
  const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineMesh);

  camera.position.z = 5;

  let animationFrameId;
  let isVisible = true;
  
  // Interaction state
  let targetRotationX = 0;
  let targetRotationY = 0;
  let mouseX = 0;
  let mouseY = 0;

  // Listeners for interaction
  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    targetRotationY = mouseX * 0.2;
    targetRotationX = -mouseY * 0.2;
  });

  document.addEventListener('scroll', () => {
    targetRotationX += window.scrollY * 0.0001;
  });

  const animate = () => {
    if (!isVisible) return;
    animationFrameId = requestAnimationFrame(animate);

    // Smooth rotation interpolation
    scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.05;
    scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.05;

    const positionsArray = geometry.attributes.position.array;
    
    for (let i = 0; i < particlesCount; i++) {
      positionsArray[i * 3] += velocities[i * 3];
      positionsArray[i * 3 + 1] += velocities[i * 3 + 1];
      positionsArray[i * 3 + 2] += velocities[i * 3 + 2];

      // Boundary check
      if (Math.abs(positionsArray[i * 3]) > 7) velocities[i * 3] *= -1;
      if (Math.abs(positionsArray[i * 3 + 1]) > 7) velocities[i * 3 + 1] *= -1;
      if (Math.abs(positionsArray[i * 3 + 2]) > 7) velocities[i * 3 + 2] *= -1;
    }
    
    geometry.attributes.position.needsUpdate = true;

    // Rebuild connection lines into the preallocated buffer (no per-frame allocation).
    // Compare squared distance to avoid Math.sqrt on every pair.
    const thresholdSq = isMobile ? 1.8 * 1.8 : 2.5 * 2.5;
    let ptr = 0;
    for (let i = 0; i < particlesCount; i++) {
      const ix = positionsArray[i * 3];
      const iy = positionsArray[i * 3 + 1];
      const iz = positionsArray[i * 3 + 2];
      for (let j = i + 1; j < particlesCount; j++) {
        const dx = ix - positionsArray[j * 3];
        const dy = iy - positionsArray[j * 3 + 1];
        const dz = iz - positionsArray[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < thresholdSq) {
          linePositions[ptr++] = ix;
          linePositions[ptr++] = iy;
          linePositions[ptr++] = iz;
          linePositions[ptr++] = positionsArray[j * 3];
          linePositions[ptr++] = positionsArray[j * 3 + 1];
          linePositions[ptr++] = positionsArray[j * 3 + 2];
        }
      }
    }
    lineGeometry.setDrawRange(0, ptr / 3);
    linePositionAttr.needsUpdate = true;

    renderer.render(scene, camera);
  };

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Battery Optimization: Pause animation when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isVisible = false;
      cancelAnimationFrame(animationFrameId);
    } else {
      isVisible = true;
      animate();
    }
  });

  animate();
};

initBg();
