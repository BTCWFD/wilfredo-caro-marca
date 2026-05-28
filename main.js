import translations from './src/translations.js';

// Update Copyright Year
document.getElementById('year').textContent = new Date().getFullYear();

// --- Dynamic Contact Info Block ---
const renderContactInfo = () => {
  const contactContainer = document.getElementById('contact-info-block');
  if (!contactContainer) return;

  contactContainer.innerHTML = '';
  const isUnlocked = localStorage.getItem('cv_unlocked') === 'true';

  if (isUnlocked) {
    const mailLink = document.createElement('a');
    mailLink.href = 'mailto:wilfredwfd86@gmail.com';
    mailLink.className = 'btn btn-primary';
    mailLink.style.textTransform = 'lowercase';
    mailLink.style.letterSpacing = '0.5px';
    mailLink.textContent = 'wilfredwfd86@gmail.com';
    
    const telLink = document.createElement('a');
    telLink.href = 'tel:+573219723513';
    telLink.className = 'btn btn-outline';
    telLink.style.borderRadius = '30px';
    telLink.textContent = '+57 321 972 35 13';

    contactContainer.appendChild(mailLink);
    contactContainer.appendChild(telLink);
  } else {
    const unlockBtn = document.createElement('button');
    unlockBtn.id = 'contact-unlock-btn';
    unlockBtn.className = 'btn btn-primary';
    unlockBtn.style.borderRadius = '30px';
    
    const currentLang = localStorage.getItem('preferredLang') || 'en';
    const btnText = (translations[currentLang] && translations[currentLang]['contact_unlock_btn']) || '🔓 Unlock Contact Details';
    unlockBtn.textContent = btnText;

    unlockBtn.addEventListener('click', () => {
      const cvModal = document.getElementById('cv-modal');
      const cvFormError = document.getElementById('cv-form-error');
      const cvModalForm = document.getElementById('cv-modal-form');
      if (cvModal) {
        cvModal.classList.remove('hidden');
        if (cvFormError) cvFormError.classList.add('hidden');
        if (cvModalForm) cvModalForm.reset();
      }
    });

    contactContainer.appendChild(unlockBtn);
  }
};

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

  // Render contact info block
  renderContactInfo();
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

// --- Mobile Menu Toggle ---
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle && navLinks) {
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('open');
    navLinks.classList.toggle('active');
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('open');
      navLinks.classList.remove('active');
    });
  });
}

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

// --- Skills Tab Switching ---
const tabButtons = document.querySelectorAll('.skills-tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

if (tabButtons.length && tabContents.length) {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Update active button
      tabButtons.forEach(b => b.classList.toggle('active', b === btn));

      // Update active content
      tabContents.forEach(content => {
        if (content.id === `skills-${targetTab}`) {
          content.classList.add('active');
          // Force reveal items inside the active tab
          content.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('active');
          });
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
}

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
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (cursorDot && cursorOutline && !isTouchDevice && window.matchMedia("(min-width: 769px)").matches) {
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
} else {
  if (cursorDot) cursorDot.style.display = 'none';
  if (cursorOutline) cursorOutline.style.display = 'none';
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

  // Adjust particle density based on screen size/hardware
  const isMobile = window.innerWidth <= 768 || isTouchDevice;
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
    const threshold = isMobile ? 1.8 : 2.5;
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
  "contact": "Please unlock contact details in the footer.",
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

  const typingIndicator = document.getElementById('ai-typing');
  if (typingIndicator) {
    typingIndicator.classList.remove('hidden');
    aiChat.scrollTop = aiChat.scrollHeight;
  }

  // Simulate typing
  setTimeout(() => {
    if (typingIndicator) {
      typingIndicator.classList.add('hidden');
    }

    const currentLang = localStorage.getItem('preferredLang') || 'en';
    let response = knowledgeBase.default;
    if (query.includes('who') || query.includes('name') || query.includes('quien') || query.includes('quién') || query.includes('ウィルフレド')) response = knowledgeBase.who;
    else if (query.includes('virtuadsai') || query.includes('company') || query.includes('empresa') || query.includes('virtuads')) response = knowledgeBase.virtuadsai;
    else if (query.includes('orbit')) response = knowledgeBase.orbit;
    else if (query.includes('exequine')) response = knowledgeBase.exequine;
    else if (query.includes('experience') || query.includes('work') || query.includes('journey') || query.includes('experiencia') || query.includes('trayectoria') || query.includes('trabajo')) response = knowledgeBase.experience;
    else if (query.includes('skills') || query.includes('expertise') || query.includes('tech') || query.includes('habilidades') || query.includes('tecnología') || query.includes('tecnologia')) response = knowledgeBase.skills;
    else if (query.includes('music') || query.includes('dj') || query.includes('mix') || query.includes('música') || query.includes('musica') || query.includes('set')) response = knowledgeBase.music;
    else if (query.includes('contact') || query.includes('email') || query.includes('social') || query.includes('contacto') || query.includes('correo')) {
      const isUnlocked = localStorage.getItem('cv_unlocked') === 'true';
      if (isUnlocked) {
        if (currentLang === 'es') {
          response = "Puedes contactar a Wilfredo por correo electrónico a wilfredwfd86@gmail.com o por teléfono al +57 321 972 35 13. También tienes los enlaces de contacto directos en el pie de página.";
        } else if (currentLang === 'ja') {
          response = "ウィルフレドのメールアドレスは wilfredwfd86@gmail.com、電話番号は +57 321 972 35 13 です。フッターの連絡先リンクも直接ご利用いただけます。";
        } else {
          response = "You can reach Wilfredo via email at wilfredwfd86@gmail.com or phone at +57 321 972 35 13. You can also use the direct links in the footer.";
        }
      } else {
        if (currentLang === 'es') {
          response = "Los datos de contacto de Wilfredo están protegidos para evitar el spam. Puedes desbloquearlos haciendo clic en el botón '🔓 Desbloquear Datos de Contacto' en el pie de página o completando el formulario al descargar su CV.";
        } else if (currentLang === 'ja') {
          response = "スパム防止のため、ウィルフレドの連絡先情報は保護されています。フッターの「🔓 連絡先情報を開示する」ボタンをクリックするか、履歴書ダウンロード時のフォームに入力することで開示できます。";
        } else {
          response = "Wilfredo's contact details are locked to prevent spam. You can unlock them by clicking the '🔓 Unlock Contact Details' button in the footer or by registering when downloading his CV.";
        }
      }
    }

    addMessage(response, 'bot');
  }, 1000);
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

  // Suggestion buttons click handlers
  const suggestButtons = document.querySelectorAll('.ai-suggest-btn');
  suggestButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      aiInput.value = btn.textContent;
      handleAiChat();
    });
  });
}

// --- 3D Card Tilt Effect ---
const tiltContainer = document.querySelector('.about-visual');
if (tiltContainer && !isTouchDevice) {
  const img = tiltContainer.querySelector('img');
  tiltContainer.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = tiltContainer.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    const tiltX = (y - 0.5) * 15; // max 15 degrees tilt
    const tiltY = (0.5 - x) * 15;
    
    img.style.transform = `scale(1.05) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });
  
  tiltContainer.addEventListener('mouseleave', () => {
    img.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg)';
  });
}

// --- Custom DJ Player Logic (YouTube API) ---
let ytPlayer;

// Inject YouTube Iframe API Script
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const playBtn = document.getElementById('player-play-btn');
const prevBtn = document.getElementById('player-prev-btn');
const nextBtn = document.getElementById('player-next-btn');
const visualizer = document.querySelector('.player-visualizer');
const artwork = document.querySelector('.track-artwork');
let isPlaying = false;

window.onYouTubeIframeAPIReady = () => {
  ytPlayer = new YT.Player('youtube-player', {
    events: {
      'onStateChange': (event) => {
        // 1 = playing, 2 = paused
        if (event.data === 1) {
          isPlaying = true;
          if (playBtn) playBtn.textContent = '⏸';
          if (visualizer) visualizer.classList.add('playing');
          if (artwork) artwork.classList.add('playing');
        } else {
          isPlaying = false;
          if (playBtn) playBtn.textContent = '▶';
          if (visualizer) visualizer.classList.remove('playing');
          if (artwork) artwork.classList.remove('playing');
        }
      }
    }
  });
};

if (playBtn) {
  playBtn.addEventListener('click', () => {
    if (!ytPlayer) return;
    if (isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    if (ytPlayer && typeof ytPlayer.previousVideo === 'function') {
      ytPlayer.previousVideo();
    }
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (ytPlayer && typeof ytPlayer.nextVideo === 'function') {
      ytPlayer.nextVideo();
    }
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

// --- CV Download Guard and Modal Logic ---
const cvDownloadBtn = document.getElementById('cv-download-btn');
const cvModal = document.getElementById('cv-modal');
const cvModalClose = document.getElementById('cv-modal-close');
const cvModalForm = document.getElementById('cv-modal-form');
const cvFormError = document.getElementById('cv-form-error');
const cvFormSubmit = document.getElementById('cv-form-submit');
const cvSubmitText = document.getElementById('cv-submit-text');

// Helper to trigger direct download
const triggerCvDownload = () => {
  const link = document.createElement('a');
  link.href = '/Wilfredo-CV-2026.pdf';
  link.download = 'Wilfredo-CV-2026.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Check if already unlocked on load
if (cvDownloadBtn) {
  cvDownloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (localStorage.getItem('cv_unlocked') === 'true') {
      triggerCvDownload();
    } else {
      if (cvModal) {
        cvModal.classList.remove('hidden');
        cvFormError.classList.add('hidden');
        cvModalForm.reset();
      }
    }
  });
}

// Close Modal handlers
const closeCvModal = () => {
  if (cvModal) {
    cvModal.classList.add('hidden');
  }
};

if (cvModalClose) {
  cvModalClose.addEventListener('click', closeCvModal);
}

if (cvModal) {
  cvModal.addEventListener('click', (e) => {
    if (e.target === cvModal) {
      closeCvModal();
    }
  });
}

// Form Submission with Netlify AJAX Capture
if (cvModalForm) {
  cvModalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameVal = document.getElementById('cv-name').value.trim();
    const emailVal = document.getElementById('cv-email').value.trim();
    const companyVal = document.getElementById('cv-company').value.trim();
    const purposeVal = document.getElementById('cv-purpose').value;
    const currentLang = localStorage.getItem('preferredLang') || 'en';

    // Clear previous error
    cvFormError.classList.add('hidden');
    cvFormError.textContent = '';

    // Validations
    if (!nameVal || !emailVal || !companyVal || !purposeVal) {
      const errorMsg = (translations[currentLang] && translations[currentLang]['cv_error_empty']) || 'Please fill in all fields.';
      cvFormError.textContent = errorMsg;
      cvFormError.classList.remove('hidden');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      const errorMsg = (translations[currentLang] && translations[currentLang]['cv_error_email']) || 'Please enter a valid email.';
      cvFormError.textContent = errorMsg;
      cvFormError.classList.remove('hidden');
      return;
    }

    // Show loading state
    cvFormSubmit.disabled = true;
    cvFormSubmit.classList.add('btn-disabled');
    const loadingText = currentLang === 'es' ? 'Procesando...' : currentLang === 'ja' ? '送信中...' : 'Processing...';
    cvSubmitText.textContent = loadingText;

    // Send payload using AJAX to Netlify Forms
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'form-name': 'cv-downloads',
        'name': nameVal,
        'email': emailVal,
        'company': companyVal,
        'purpose': purposeVal
      }).toString()
    })
    .then((response) => {
      // Restore submit button state
      cvFormSubmit.disabled = false;
      cvFormSubmit.classList.remove('btn-disabled');
      const originalText = (translations[currentLang] && translations[currentLang]['cv_submit_btn']) || 'Submit & Download';
      cvSubmitText.textContent = originalText;

      if (response.ok) {
        // Cache download unlock status
        localStorage.setItem('cv_unlocked', 'true');
        localStorage.setItem('cv_lead_name', nameVal);
        localStorage.setItem('cv_lead_email', emailVal);
        
        // Re-render contact details in the footer
        renderContactInfo();

        // Trigger file download & close modal
        triggerCvDownload();
        closeCvModal();
      } else {
        throw new Error('Failed Netlify Form submission');
      }
    })
    .catch((error) => {
      console.error('Error submitting form:', error);
      cvFormSubmit.disabled = false;
      cvFormSubmit.classList.remove('btn-disabled');
      const originalText = (translations[currentLang] && translations[currentLang]['cv_submit_btn']) || 'Submit & Download';
      cvSubmitText.textContent = originalText;

      const networkErrorMsg = currentLang === 'es' 
        ? 'Error de red. Inténtalo de nuevo.' 
        : currentLang === 'ja' 
          ? 'ネットワークエラーが発生しました。再試行してください。' 
          : 'Network error. Please try again.';
      cvFormError.textContent = networkErrorMsg;
      cvFormError.classList.remove('hidden');
    });
  });
}

