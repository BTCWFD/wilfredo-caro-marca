import translations from './src/translations.js';

// Update Copyright Year
document.getElementById('year').textContent = new Date().getFullYear();

// --- Multilingual (i18n) Logic ---
const langButtons = document.querySelectorAll('.lang-btn');
const translatableElements = document.querySelectorAll('[data-i18n]');

const updateLanguage = (lang) => {
  translatableElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      // Use innerHTML for titles/texts that contain <span> or <br>
      if (key.includes('title') || key.includes('footer')) {
        el.innerHTML = translations[lang][key];
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });

  // Update button active state
  langButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  // Persist choice
  localStorage.setItem('preferredLang', lang);
  document.documentElement.lang = lang;
};

langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedLang = btn.getAttribute('data-lang');
    updateLanguage(selectedLang);
  });
});

// Initialize Language
const savedLang = localStorage.getItem('preferredLang') || 'en';
updateLanguage(savedLang);

// --- Navbar Scroll Effect ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// --- Scroll Reveal Animations ---
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); // Stop observing once revealed
    }
  });
};

const revealOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
  revealObserver.observe(el);
});

// --- Smooth Scrolling for Anchor Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// --- Preloader Logic ---
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if(preloader) {
    // Wait for animations to finish before fading out
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 800);
    }, 2800);
  }
});

// --- Custom Cursor Tracker ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline && window.matchMedia("(min-width: 769px)").matches) {
  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    
    cursorOutline.animate({
      left: `${posX}px`,
      top: `${posY}px`
    }, { duration: 250, fill: "forwards" });
  });
}

// --- 3D Background (Three.js Network) ---
const initBg = () => {
  const canvas = document.querySelector('#bg-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles
  const particlesCount = 120;
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

  // Connection Lines
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1e8449, transparent: true, opacity: 0.2 });
  let lineMesh;

  camera.position.z = 5;

  const animate = () => {
    requestAnimationFrame(animate);

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

    // Drawing lines (simplified for performance)
    if (lineMesh) scene.remove(lineMesh);
    const lineIndices = [];
    const threshold = 2.5;
    for (let i = 0; i < particlesCount; i++) {
      for (let j = i + 1; j < particlesCount; j++) {
        const dx = positionsArray[i * 3] - positionsArray[j * 3];
        const dy = positionsArray[i * 3 + 1] - positionsArray[j * 3 + 1];
        const dz = positionsArray[i * 3 + 2] - positionsArray[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < threshold) {
          lineIndices.push(i, j);
        }
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setIndex(lineIndices);
    lineGeometry.setAttribute('position', geometry.attributes.position);
    lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    renderer.render(scene, camera);
  };

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
};

initBg();

// --- AI Assistant Logic ---
const aiTrigger = document.getElementById('ai-trigger');
const aiAssistant = document.getElementById('ai-assistant');
const aiClose = document.getElementById('ai-close');
const aiInput = document.getElementById('ai-input');
const aiSend = document.getElementById('ai-send');
const aiChat = document.getElementById('ai-chat');

const knowledgeBase = {
  "who": "I am the AI clone of Wilfredo Caro, CEO at VirtuadsAi, CTO at Orbit, and tech innovator specializing in AI and Blockchain.",
  "virtuadsai": "VirtuadsAi is a company focused on re-engineering digital advertising using AI, Web3, and Blockchain for transparency and efficiency.",
  "orbit": "Orbit is a secure, mobile-first interface for cloud development environments where Wilfredo serves as CTO.",
  "exequine": "ExEquine is a decentralized registry project on the Blockchain where Wilfredo worked as a Fullstack & Blockchain Architect.",
  "experience": "Wilfredo is currently CEO of VirtuadsAi and CTO of Orbit. His 2026 journey includes architecture for ExEquine and high-level strategy for AI agents with Anti-Observer.",
  "skills": "Wilfredo's core expertise includes Artificial Intelligence, Web3 & Blockchain Architecture, Cloud Dev Environments, and Business Strategy.",
  "music": "Wilfredo is also a DJ! He loves Deep Tech and Techno. You can listen to his mixes in the player on the right.",
  "contact": "You can reach Wilfredo via email at wilfredwfd86@gmail.com or through his social media links in the footer.",
  "default": "That's an interesting question! I focus on Deep Tech, AI, and Web3 (including Orbit and VirtuadsAi). Could you specify what you'd like to know about Wilfredo's path?"
};

const addMessage = (text, sender) => {
  const msg = document.createElement('div');
  msg.className = `ai-msg ${sender}`;
  msg.textContent = text;
  aiChat.appendChild(msg);
  aiChat.scrollTop = aiChat.scrollHeight;
};

const handleAiChat = () => {
  const query = aiInput.value.toLowerCase().trim();
  if (!query) return;

  addMessage(aiInput.value, 'user');
  aiInput.value = '';

  // Simulate typing
  setTimeout(() => {
    let response = knowledgeBase.default;
    if (query.includes('who') || query.includes('name')) response = knowledgeBase.who;
    else if (query.includes('virtuadsai') || query.includes('company')) response = knowledgeBase.virtuadsai;
    else if (query.includes('orbit')) response = knowledgeBase.orbit;
    else if (query.includes('exequine')) response = knowledgeBase.exequine;
    else if (query.includes('experience') || query.includes('work') || query.includes('journey')) response = knowledgeBase.experience;
    else if (query.includes('skills') || query.includes('expertise') || query.includes('tech')) response = knowledgeBase.skills;
    else if (query.includes('music') || query.includes('dj') || query.includes('mix')) response = knowledgeBase.music;
    else if (query.includes('contact') || query.includes('email') || query.includes('social')) response = knowledgeBase.contact;

    addMessage(response, 'bot');
  }, 600);
};

if (aiTrigger && aiAssistant && aiClose) {
  aiTrigger.addEventListener('click', () => {
    aiAssistant.classList.remove('minimized');
  });
  aiClose.addEventListener('click', () => aiAssistant.classList.add('minimized'));
  aiSend.addEventListener('click', handleAiChat);
  aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAiChat();
  });
}

// --- Floating UI Controls ---
const djPlayer = document.getElementById('dj-player');
const playerTrigger = document.getElementById('dj-player-trigger');
const playerToggleBtn = document.getElementById('player-toggle');

if(playerTrigger && djPlayer && playerToggleBtn) {
  playerTrigger.addEventListener('click', () => {
    djPlayer.classList.remove('minimized');
  });

  playerToggleBtn.addEventListener('click', () => {
    djPlayer.classList.add('minimized');
  });
}

