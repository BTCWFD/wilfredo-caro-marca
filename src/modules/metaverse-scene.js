import * as THREE from 'three';
import { soundManager } from './metaverse-audio.js';

export const METAVERSE_NODES = [
  {
    id: 0,
    title: "VirtuadsAi",
    role: "CEO & Founder",
    type: "FLAGSHIP PROTOCOL",
    typeColor: "#00f5ff",
    date: "2024 – Present",
    tagline: "Autonomous Advertising Protocol & Web3 Attention Rails",
    description: "AI-native advertising protocol built on high-throughput blockchain rails. Redefining how sovereign brands connect with decentralized communities through verifiable attention metrics, real-time attribution, and autonomous agent bidding.",
    tags: ["Autonomous Ads", "Verifiable Attention", "DeFi Rails", "Multi-Agent System"],
    metrics: { "Latency": "< 14ms On-chain", "Architecture": "Agentic Bidding", "Security": "Quantum-Ready" },
    link: "https://virtuadsai-ui.vercel.app/",
    color: 0x00f5ff,
    geomType: "flagship",
    position: { x: 0, y: 3.5, z: 0 },
    radius: 4.5,
    isFlagship: true
  },
  {
    id: 1,
    title: "Forward Deployed Engineer",
    role: "Lead Enterprise FDE",
    type: "CORE DISCIPLINE",
    typeColor: "#cfff04",
    date: "2025 – Present",
    tagline: "Production-Grade AI Swarms & Enterprise Deployment",
    description: "Embedded directly with enterprise organizations to architect and deploy mission-critical agentic AI solutions. Bridging frontier LLM cognition, deterministic tool governance, and fault-tolerant production infrastructure.",
    tags: ["Agentic AI", "Enterprise Pipelines", "Governance", "Deep Tech"],
    metrics: { "Deployment": "Enterprise Grade", "Reliability": "99.99% SLA", "Latency": "Zero-Drift" },
    link: "https://www.linkedin.com/in/wilfredocaro",
    color: 0xcfff04,
    geomType: "octa",
    position: { x: -36, y: 3.2, z: -18 },
    radius: 2.8
  },
  {
    id: 2,
    title: "Orbit",
    role: "Chief Technology Officer",
    type: "EXECUTIVE ROLE",
    typeColor: "#9b8fff",
    date: "2024 – Present",
    tagline: "Mobile-First Cloud IDE Control Plane",
    description: "Mobile-first cloud IDE control plane and distributed runtime orchestrator. Enabling developers to spin up, configure, and operate ephemeral enterprise development environments directly from smartphones or thin clients.",
    tags: ["Cloud IDE", "Mobile-First", "Containerization", "Distributed Mesh"],
    metrics: { "Cold Start": "< 12s Instant", "Isolation": "Sandboxed Containers", "Control": "Mobile Native" },
    link: "https://github.com/BTCWFD/ORBIT-APP",
    color: 0x9b8fff,
    geomType: "torus",
    position: { x: 36, y: 3.4, z: -18 },
    radius: 2.8
  },
  {
    id: 3,
    title: "Antigravity Monitor",
    role: "Creator & Lead Architect",
    type: "SYSTEM OBSERVABILITY",
    typeColor: "#00f5ff",
    date: "2025",
    tagline: "Datadog for Autonomous Multi-Agent Swarms",
    description: "Real-time observability and telemetry platform for multi-agent LLM swarms. Tracking inter-agent token distribution, recursive reasoning trees, latency bottlenecks, and protocol drift across distributed agent pipelines.",
    tags: ["Swarm Telemetry", "Agent Observability", "Token Flow", "Distributed Tracing"],
    metrics: { "Telemetry": "Real-Time Tracing", "Engine": "High Throughput", "Profiling": "Recursive Trees" },
    link: "https://github.com/BTCWFD/antigravity-monitor",
    color: 0x00f5ff,
    geomType: "crystal",
    position: { x: -30, y: 3.2, z: 24 },
    radius: 2.6
  },
  {
    id: 4,
    title: "ExEquine",
    role: "Fullstack & Blockchain Architect",
    type: "RWA PROTOCOL",
    typeColor: "#ff2d55",
    date: "2023 – 2024",
    tagline: "Tokenized High-Value Equestrian Assets & Yield",
    description: "Tokenized real-world equine asset marketplace. Smart contract infrastructure engineered for fractional liquidity of champion horses, integrated with decentralized yield distribution and regulatory-compliant protocols.",
    tags: ["RWA Tokenization", "Smart Contracts", "DeFi Yield", "Solidity Architecture"],
    metrics: { "Asset Class": "Fractional RWA", "Security": "Audited EVM", "Distribution": "Automated Yield" },
    link: "https://nex-equine-ui.vercel.app/",
    color: 0xff2d55,
    geomType: "dodeca",
    position: { x: 30, y: 3.2, z: 24 },
    radius: 2.6
  },
  {
    id: 5,
    title: "Brave Software",
    role: "Regional Leader & Latam Staff",
    type: "ECOSYSTEM ADOPTION",
    typeColor: "#ff6b35",
    date: "2022 – 2023",
    tagline: "Web3 Privacy-First Browser Continental Expansion",
    description: "Spearheaded Web3 and privacy-first browser adoption across Latin America. Coordinated high-impact regional campaigns, creator tokenization onboarding, and ecosystem evangelism for the Basic Attention Token (BAT).",
    tags: ["Web3 Adoption", "Privacy Tech", "Creator Economy", "Ecosystem Growth"],
    metrics: { "Territory": "Latin America", "Adoption": "Multi-Country", "Ecosystem": "BAT Network" },
    link: "https://brave.com",
    color: 0xff6b35,
    geomType: "cylinder",
    position: { x: 0, y: 3.5, z: 42 },
    radius: 2.8
  },
  {
    id: 6,
    title: "CornerMarket",
    role: "Business Dev Associate",
    type: "COMMERCIAL STRATEGY",
    typeColor: "#ffaa00",
    date: "2021 – 2022",
    tagline: "B2B Crypto Point-of-Sale & Retail Expansion",
    description: "Strategic retail crypto-settlement expansion across Latin American commercial corridors. Structured commercial alliances and developed merchant acquisition frameworks for decentralized point-of-sale adoption.",
    tags: ["B2B Expansion", "Crypto POS", "Merchant Growth", "Retail Logistics"],
    metrics: { "Segment": "Retail POS", "Execution": "Direct Sales", "Footprint": "Colombia Commercial" },
    link: "https://www.linkedin.com/in/wilfredocaro",
    color: 0xffaa00,
    geomType: "prism",
    position: { x: -48, y: 3.0, z: 8 },
    radius: 2.4
  },
  {
    id: 7,
    title: "Ovación",
    role: "Founder",
    type: "SPORTS WEB3",
    typeColor: "#00f5ff",
    date: "2023",
    tagline: "Fan Engagement Protocol & Digital Collectibles",
    description: "Next-gen sports engagement protocol connecting clubs, athletes, and fan bases through dynamic digital memorabilia, verifiable membership tiers, and VIP token-gated stadium experiences.",
    tags: ["Sports Tech", "NFT Collectibles", "Fan Loyalty", "Token Gated"],
    metrics: { "Vertical": "Sports Tech", "Integration": "Smart Badges", "Community": "On-Chain Loyalty" },
    link: "https://www.linkedin.com/in/wilfredocaro",
    color: 0x00f5ff,
    geomType: "icosa",
    position: { x: 48, y: 3.0, z: 8 },
    radius: 2.4
  },
  {
    id: 8,
    title: "AI Swarms & PQC",
    role: "Principal Systems Architect",
    type: "FRONTIER DEFENSE",
    typeColor: "#cfff04",
    date: "2024 – Present",
    tagline: "Post-Quantum Cryptography for Autonomous Swarms",
    description: "Architecting post-quantum cryptographic security boundaries around autonomous agent swarms. Implementing NIST-standardized quantum-resistant algorithms (ML-KEM, ML-DSA) directly into inter-agent communication fabrics.",
    tags: ["Post-Quantum", "ML-KEM", "ML-DSA", "Swarm Consensus"],
    metrics: { "Encryption": "NIST ML-KEM", "Signature": "NIST ML-DSA", "Consensus": "Fault-Tolerant" },
    link: "https://www.linkedin.com/in/wilfredocaro",
    color: 0xcfff04,
    geomType: "cube",
    position: { x: 0, y: 3.8, z: -45 },
    radius: 2.8
  }
];

export class MetaverseScene {
  constructor(canvasElement, onNodeSelect, onNodeHover) {
    this.canvas = canvasElement;
    this.onNodeSelect = onNodeSelect;
    this.onNodeHover = onNodeHover;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Interaction & State
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredNodeId = null;
    this.selectedNodeId = null;

    // Camera Navigation State
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    this.desiredCameraPos = new THREE.Vector3(0, 24, 55);
    this.desiredLookTarget = new THREE.Vector3(0, 3, 0);
    this.currentLookTarget = new THREE.Vector3(0, 3, 0);

    // Orbit / Drag controls
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.spherical = { radius: 60, theta: 0, phi: Math.PI / 3.4 };
    this.targetSpherical = { radius: 60, theta: 0, phi: Math.PI / 3.4 };
    this.autoRotate = true;
    this.autoRotateSpeed = 0.0018;

    // Guided Tour Mode
    this.isGuidedTour = false;
    this.tourStep = 0;
    this.tourTimer = null;
    this.tourNodes = [0, 1, 2, 8, 3, 4, 5]; // Key showcase sequence

    // 3D Objects Cache
    this.monolithMeshes = [];
    this.energyLines = null;
    this.flagshipRings = [];
    this.quantumDust = null;
    this.radarCallback = null;

    // Keyboard navigation flags
    this.keys = { w: false, a: false, s: false, d: false };

    this.init();
  }

  init() {
    // 1. Scene & Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x04050d);
    this.scene.fog = new THREE.FogExp2(0x04050d, 0.012);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(48, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 26, 58);

    // 3. Renderer with High-End Performance
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. Lighting Rig
    this.setupLighting();

    // 5. Environmental Architecture
    this.setupFloor();
    this.setupQuantumDust();
    this.setupMonoliths();
    this.setupEnergyStreams();

    // 6. Event Listeners
    this.bindEvents();

    // 7. Start Render Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x0a1024, 1.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xdff0ff, 1.2);
    dirLight.position.set(30, 60, 40);
    this.scene.add(dirLight);

    // VirtuadsAi Core Beacon Point Light
    this.coreLight = new THREE.PointLight(0x00f5ff, 4.5, 65, 1.6);
    this.coreLight.position.set(0, 5, 0);
    this.scene.add(this.coreLight);

    // Subtle Rim Light from the depths
    const rimLight = new THREE.DirectionalLight(0x9b8fff, 0.8);
    rimLight.position.set(-40, 20, -50);
    this.scene.add(rimLight);
  }

  setupFloor() {
    // 1. Dark Obsidian Main Floor Disc
    const floorGeo = new THREE.CylinderGeometry(85, 85, 0.4, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050711,
      roughness: 0.22,
      metalness: 0.85,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.2;
    this.scene.add(floorMesh);

    // 2. Concentric Cybernetic Rings (Glowing)
    const ringRadii = [14, 28, 44, 62, 78];
    const ringColors = [0x00f5ff, 0xcfff04, 0x9b8fff, 0x00f5ff, 0xff2d55];

    ringRadii.forEach((radius, idx) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.12, radius + 0.12, 96);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[idx % ringColors.length],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: idx === 0 ? 0.65 : 0.25,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.03;
      this.scene.add(ring);
    });

    // 3. Grid Lines
    const grid = new THREE.PolarGridHelper(85, 16, 8, 64, 0x00f5ff, 0x0a2238);
    grid.position.y = 0.02;
    grid.material.opacity = 0.35;
    grid.material.transparent = true;
    this.scene.add(grid);
  }

  setupQuantumDust() {
    const particleCount = 1400;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x00f5ff);
    const c2 = new THREE.Color(0xcfff04);
    const c3 = new THREE.Color(0x9b8fff);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 38;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;

      const rnd = Math.random();
      const chosenColor = rnd < 0.5 ? c1 : rnd < 0.8 ? c2 : c3;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.quantumDust = new THREE.Points(geometry, material);
    this.scene.add(this.quantumDust);
  }

  setupMonoliths() {
    METAVERSE_NODES.forEach((node) => {
      const group = new THREE.Group();
      group.position.set(node.position.x, 0, node.position.z);
      group.userData = { nodeData: node, baseY: node.position.y };

      // Base Pedestal
      const pedGeo = new THREE.CylinderGeometry(node.radius * 0.9, node.radius * 1.05, 0.6, 32);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0x0d111d,
        roughness: 0.3,
        metalness: 0.9
      });
      const pedestal = new THREE.Mesh(pedGeo, pedMat);
      pedestal.position.y = 0.3;
      group.add(pedestal);

      // Emissive Neon Base Ring
      const ringGeo = new THREE.TorusGeometry(node.radius * 0.95, 0.08, 16, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.85
      });
      const neonRing = new THREE.Mesh(ringGeo, ringMat);
      neonRing.rotation.x = Math.PI / 2;
      neonRing.position.y = 0.62;
      group.add(neonRing);

      // Central Floating 3D Sculpture / Monolith
      let sculptureGeo;
      if (node.isFlagship) {
        // VirtuadsAi: Majestic Faceted Monolith Core
        sculptureGeo = new THREE.OctahedronGeometry(node.radius * 0.82, 0);
      } else if (node.geomType === "octa") {
        sculptureGeo = new THREE.OctahedronGeometry(node.radius * 0.68, 1);
      } else if (node.geomType === "torus") {
        sculptureGeo = new THREE.TorusGeometry(node.radius * 0.55, 0.28, 20, 48);
      } else if (node.geomType === "dodeca") {
        sculptureGeo = new THREE.DodecahedronGeometry(node.radius * 0.65, 0);
      } else if (node.geomType === "crystal") {
        sculptureGeo = new THREE.ConeGeometry(node.radius * 0.58, node.radius * 1.3, 6);
      } else if (node.geomType === "icosa") {
        sculptureGeo = new THREE.IcosahedronGeometry(node.radius * 0.65, 0);
      } else if (node.geomType === "cylinder") {
        sculptureGeo = new THREE.CylinderGeometry(node.radius * 0.5, node.radius * 0.5, node.radius * 1.1, 8);
      } else if (node.geomType === "cube") {
        sculptureGeo = new THREE.BoxGeometry(node.radius * 0.9, node.radius * 0.9, node.radius * 0.9);
      } else {
        sculptureGeo = new THREE.ConeGeometry(node.radius * 0.6, node.radius * 1.2, 5);
      }

      const sculptureMat = new THREE.MeshPhysicalMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: node.isFlagship ? 0.55 : 0.32,
        roughness: 0.15,
        metalness: 0.75,
        transmission: node.isFlagship ? 0.35 : 0.2,
        transparent: true,
        opacity: 0.92
      });

      const sculpture = new THREE.Mesh(sculptureGeo, sculptureMat);
      sculpture.position.y = node.position.y;
      group.add(sculpture);

      // Wireframe overlay for cybernetic look
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.25
      });
      const wireMesh = new THREE.Mesh(sculptureGeo, wireMat);
      wireMesh.scale.set(1.02, 1.02, 1.02);
      sculpture.add(wireMesh);

      // Flagship Specific: Dynamic Gyroscopic Rings & Internal Light
      if (node.isFlagship) {
        const ring1Geo = new THREE.TorusGeometry(node.radius * 1.2, 0.05, 16, 64);
        const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.75 });
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
        ring1.position.y = node.position.y;
        group.add(ring1);
        this.flagshipRings.push({ mesh: ring1, rx: 0.012, ry: 0.008 });

        const ring2Geo = new THREE.TorusGeometry(node.radius * 1.45, 0.04, 16, 64);
        const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xcfff04, transparent: true, opacity: 0.6 });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2.position.y = node.position.y;
        ring2.rotation.x = Math.PI / 4;
        group.add(ring2);
        this.flagshipRings.push({ mesh: ring2, rx: -0.009, ry: 0.014 });

        // Vertical Holo-Beacon
        const beaconGeo = new THREE.CylinderGeometry(0.08, 0.8, 38, 16, 1, true);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: 0x00f5ff,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.y = 19;
        group.add(beacon);
      }

      this.scene.add(group);
      this.monolithMeshes.push({
        id: node.id,
        group: group,
        sculpture: sculpture,
        material: sculptureMat,
        nodeData: node,
        baseY: node.position.y
      });
    });
  }

  setupEnergyStreams() {
    // Energy laser curves linking VirtuadsAi to each satellite node
    const flagshipNode = METAVERSE_NODES.find(n => n.isFlagship);
    const satellites = METAVERSE_NODES.filter(n => !n.isFlagship);

    const linesGroup = new THREE.Group();

    satellites.forEach(sat => {
      const p1 = new THREE.Vector3(flagshipNode.position.x, 1.2, flagshipNode.position.z);
      const p2 = new THREE.Vector3(sat.position.x * 0.5, 3.5, sat.position.z * 0.5); // arch midpoint
      const p3 = new THREE.Vector3(sat.position.x, 1.0, sat.position.z);

      const curve = new THREE.QuadraticBezierCurve3(p1, p2, p3);
      const points = curve.getPoints(28);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: sat.color,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending
      });

      const line = new THREE.Line(geometry, material);
      linesGroup.add(line);
    });

    this.scene.add(linesGroup);
    this.energyLines = linesGroup;
  }

  bindEvents() {
    window.addEventListener('resize', this.onResize.bind(this));

    // Mouse movement for orbital control & raycasting
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));

    // Keyboard WASD Controls
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.w = true;
      if (k === 's' || k === 'arrowdown') this.keys.s = true;
      if (k === 'a' || k === 'arrowleft') this.keys.a = true;
      if (k === 'd' || k === 'arrowright') this.keys.d = true;
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        this.autoRotate = false;
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.w = false;
      if (k === 's' || k === 'arrowdown') this.keys.s = false;
      if (k === 'a' || k === 'arrowleft') this.keys.a = false;
      if (k === 'd' || k === 'arrowright') this.keys.d = false;
    });

    // Click on canvas for node selection
    this.canvas.addEventListener('click', this.onClick.bind(this));
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / this.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / this.height) * 2 + 1;

    if (this.isDragging) {
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.targetSpherical.theta -= deltaX * 0.005;
      this.targetSpherical.phi -= deltaY * 0.004;
      // Clamp phi to avoid pole flip
      this.targetSpherical.phi = Math.max(0.2, Math.min(Math.PI / 2.05, this.targetSpherical.phi));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      this.autoRotate = false;
    }
  }

  onMouseDown(e) {
    this.isDragging = true;
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
    this.mouseDownPos = { x: e.clientX, y: e.clientY };
  }

  onMouseUp() {
    this.isDragging = false;
  }

  onWheel(e) {
    e.preventDefault();
    this.targetSpherical.radius += e.deltaY * 0.045;
    this.targetSpherical.radius = Math.max(14, Math.min(110, this.targetSpherical.radius));
    this.autoRotate = false;
  }

  onTouchStart(e) {
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this.mouseDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this.autoRotate = false;
    }
  }

  onTouchMove(e) {
    if (this.isDragging && e.touches.length === 1) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.targetSpherical.theta -= deltaX * 0.006;
      this.targetSpherical.phi -= deltaY * 0.005;
      this.targetSpherical.phi = Math.max(0.2, Math.min(Math.PI / 2.05, this.targetSpherical.phi));

      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  onTouchEnd() {
    this.isDragging = false;
  }

  onClick(e) {
    // Distinguish click from drag
    if (this.mouseDownPos) {
      const dist = Math.hypot(e.clientX - this.mouseDownPos.x, e.clientY - this.mouseDownPos.y);
      if (dist > 6) return; // was drag, ignore
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const interactiveObjects = this.monolithMeshes.map(m => m.sculpture);
    const intersects = this.raycaster.intersectObjects(interactiveObjects, true);

    if (intersects.length > 0) {
      let hitMesh = intersects[0].object;
      while (hitMesh.parent && !hitMesh.userData.nodeData && hitMesh.parent.userData.nodeData) {
        hitMesh = hitMesh.parent;
      }
      const nodeData = hitMesh.userData.nodeData || hitMesh.parent.userData.nodeData;
      if (nodeData) {
        this.selectNode(nodeData.id);
      }
    } else {
      if (this.selectedNodeId !== null && !this.isGuidedTour) {
        this.deselectNode();
      }
    }
  }

  selectNode(id) {
    const node = METAVERSE_NODES.find(n => n.id === id);
    if (!node) return;

    this.selectedNodeId = id;
    this.autoRotate = false;
    soundManager.playSelectChime(node.isFlagship ? 659.25 : 523.25);

    // Smooth Dolly-Zoom to Target
    this.desiredLookTarget.set(node.position.x, node.position.y + 0.5, node.position.z);

    // Place camera at an elevated dynamic angle relative to the node
    const offsetDistance = node.isFlagship ? 18 : 13;
    this.desiredCameraPos.set(
      node.position.x + (node.position.x === 0 ? 0 : Math.sign(node.position.x) * 6),
      node.position.y + 6.5,
      node.position.z + offsetDistance
    );

    if (this.onNodeSelect) {
      this.onNodeSelect(node);
    }
  }

  deselectNode() {
    this.selectedNodeId = null;
    this.desiredLookTarget.set(0, 3, 0);
    this.desiredCameraPos.set(0, 24, 55);
    this.targetSpherical = { radius: 60, theta: 0, phi: Math.PI / 3.4 };

    if (this.onNodeSelect) {
      this.onNodeSelect(null);
    }
  }

  // Toggle Executive Guided Tour
  toggleGuidedTour() {
    this.isGuidedTour = !this.isGuidedTour;
    if (this.isGuidedTour) {
      this.tourStep = 0;
      this.runTourStep();
    } else {
      if (this.tourTimer) clearTimeout(this.tourTimer);
      this.deselectNode();
    }
    return this.isGuidedTour;
  }

  runTourStep() {
    if (!this.isGuidedTour) return;
    const nodeId = this.tourNodes[this.tourStep];
    this.selectNode(nodeId);

    this.tourTimer = setTimeout(() => {
      if (!this.isGuidedTour) return;
      this.tourStep = (this.tourStep + 1) % this.tourNodes.length;
      this.runTourStep();
    }, 7500); // 7.5 seconds per showroom station
  }

  resetCamera() {
    if (this.isGuidedTour) this.toggleGuidedTour();
    this.deselectNode();
    this.autoRotate = true;
  }

  getNodeScreenCoords(id) {
    const node = METAVERSE_NODES.find(n => n.id === id);
    if (!node || !this.camera) return null;
    const v = new THREE.Vector3(node.position.x, node.position.y + node.radius * 0.95, node.position.z);
    v.project(this.camera);
    if (v.z > 1) return null; // Behind camera
    const x = (v.x * 0.5 + 0.5) * this.width;
    const y = (-(v.y * 0.5) + 0.5) * this.height;
    return { x, y, visible: true };
  }

  setRadarCallback(cb) {
    this.radarCallback = cb;
  }

  animate(time) {
    requestAnimationFrame(this.animate);
    const t = time * 0.001;

    // 1. Keyboard Pan Movement (WASD)
    if (this.keys.w) this.desiredLookTarget.z -= 0.5;
    if (this.keys.s) this.desiredLookTarget.z += 0.5;
    if (this.keys.a) this.desiredLookTarget.x -= 0.5;
    if (this.keys.d) this.desiredLookTarget.x += 0.5;

    // 2. Auto-rotate camera when idle
    if (this.autoRotate && !this.selectedNodeId && !this.isGuidedTour) {
      this.targetSpherical.theta += this.autoRotateSpeed;
    }

    // 3. Interpolate Spherical Orbit Coordinates
    this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * 0.06;
    this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * 0.06;
    this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * 0.06;

    // Camera target interpolation
    this.currentLookTarget.lerp(this.desiredLookTarget, 0.05);

    if (this.selectedNodeId === null) {
      // Free Orbit Mode
      const x = this.currentLookTarget.x + this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
      const y = this.currentLookTarget.y + this.spherical.radius * Math.cos(this.spherical.phi);
      const z = this.currentLookTarget.z + this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);
      this.camera.position.set(x, y, z);
    } else {
      // Focus Mode (Dolly-Zoom interpolation to target node)
      this.camera.position.lerp(this.desiredCameraPos, 0.045);
    }

    this.camera.lookAt(this.currentLookTarget);

    // 4. Raycasting Hover
    if (!this.isDragging) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const interactiveObjects = this.monolithMeshes.map(m => m.sculpture);
      const intersects = this.raycaster.intersectObjects(interactiveObjects, true);

      let currentHover = null;
      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit.parent && !hit.userData.nodeData && hit.parent.userData.nodeData) {
          hit = hit.parent;
        }
        const node = hit.userData.nodeData || hit.parent.userData.nodeData;
        if (node) currentHover = node.id;
      }

      if (currentHover !== this.hoveredNodeId) {
        this.hoveredNodeId = currentHover;
        if (this.hoveredNodeId !== null) {
          soundManager.playHoverBlip(750);
          this.canvas.style.cursor = 'pointer';
        } else {
          this.canvas.style.cursor = 'default';
        }
      }

      if (this.onNodeHover) {
        const coords = this.hoveredNodeId !== null ? this.getNodeScreenCoords(this.hoveredNodeId) : null;
        const node = this.hoveredNodeId !== null ? METAVERSE_NODES.find(n => n.id === this.hoveredNodeId) : null;
        this.onNodeHover(this.hoveredNodeId, coords, node);
      }
    }

    // 5. Animate Monoliths (Hover Floating & Continuous Rotation)
    this.monolithMeshes.forEach((item, idx) => {
      const isHovered = this.hoveredNodeId === item.id;
      const isSelected = this.selectedNodeId === item.id;

      // Rotation
      const rotSpeed = item.nodeData.isFlagship ? 0.008 : 0.006;
      item.sculpture.rotation.y += rotSpeed;
      if (item.nodeData.isFlagship) {
        item.sculpture.rotation.x = Math.sin(t * 0.8) * 0.15;
      }

      // Vertical Floating Bobbing
      const bob = Math.sin(t * 1.6 + idx * 0.8) * 0.25;
      const hoverOffset = (isHovered || isSelected) ? 1.2 : 0;
      const targetY = item.baseY + bob + hoverOffset;
      item.sculpture.position.y += (targetY - item.sculpture.position.y) * 0.08;

      // Emissive Intensity Pulse
      const baseEmissive = item.nodeData.isFlagship ? 0.55 : 0.3;
      const hoverEmissive = (isHovered || isSelected) ? 1.4 : baseEmissive;
      item.material.emissiveIntensity += (hoverEmissive - item.material.emissiveIntensity) * 0.1;
    });

    // 6. Animate VirtuadsAi Gyroscopic Rings
    this.flagshipRings.forEach(ring => {
      ring.mesh.rotation.x += ring.rx;
      ring.mesh.rotation.y += ring.ry;
    });

    // 7. Core Beacon Pulse
    if (this.coreLight) {
      this.coreLight.intensity = 3.8 + Math.sin(t * 3.5) * 1.2;
    }

    // 8. Quantum Dust Gentle Drift
    if (this.quantumDust) {
      this.quantumDust.rotation.y = t * 0.015;
    }

    // 9. Update Radar Compass if callback provided
    if (this.radarCallback) {
      this.radarCallback({
        camX: this.camera.position.x,
        camZ: this.camera.position.z,
        rotY: Math.atan2(this.camera.position.x - this.currentLookTarget.x, this.camera.position.z - this.currentLookTarget.z),
        selectedId: this.selectedNodeId
      });
    }

    // Render WebGL Frame
    this.renderer.render(this.scene, this.camera);
  }
}
