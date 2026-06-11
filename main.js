import translations from './src/translations.js';

// Accessibility: honor the user's reduced-motion preference across all animations
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Analytics helper (safe no-op until a real GA4 ID is set in index.html) ---
const trackEvent = (action, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
};

// Update Copyright Year
document.getElementById('year').textContent = new Date().getFullYear();

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const iconSun = document.querySelector('.icon-sun');
const iconMoon = document.querySelector('.icon-moon');

// Initialize Theme
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light');
  if (iconSun) iconSun.classList.add('hidden');
  if (iconMoon) iconMoon.classList.remove('hidden');
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
      iconSun.classList.remove('hidden');
      iconMoon.classList.add('hidden');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      iconSun.classList.add('hidden');
      iconMoon.classList.remove('hidden');
    }
  });
}
// --- Dynamic Geo-Pricing Logic ---
const fetchGeoPricing = async () => {
  const priceWeb = document.getElementById('price-web');
  const priceAi = document.getElementById('price-ai');
  const priceBrand = document.getElementById('price-brand');
  const priceDj = document.getElementById('price-dj');

  if (!priceWeb) return;

  const pricing = {
    CO: {
      web: "Desde $1,500,000 COP",
      ai: "Desde $1,200,000 COP",
      brand: "Desde $800,000 COP/mes",
      dj: "Desde $500,000 COP"
    },
    Global: {
      web: "Desde $2,500 USD",
      ai: "Desde $3,000 USD",
      brand: "Desde $1,500 USD/mes",
      dj: "Desde $900 USD"
    }
  };

  const updatePrices = (isColombia) => {
    const prices = isColombia ? pricing.CO : pricing.Global;
    priceWeb.textContent = prices.web;
    priceAi.textContent = prices.ai;
    priceBrand.textContent = prices.brand;
    priceDj.textContent = prices.dj;
  };

  const toggle = document.getElementById('geo-pricing-toggle');
  
  if (toggle) {
    toggle.addEventListener('change', (e) => {
      updatePrices(e.target.checked);
      trackEvent('toggle_pricing', { region: e.target.checked ? 'CO' : 'Global' });
    });
  }

  try {
    // Netlify Edge Function (first-party) — visitor IP never leaves Netlify.
    const res = await fetch('/api/geo');
    const data = await res.json();
    const isColombia = data.country === 'CO';
    if (toggle) toggle.checked = isColombia;
    updatePrices(isColombia);
  } catch (err) {
    console.warn("Geo-Pricing fetch failed, defaulting to Global.", err);
    if (toggle) toggle.checked = false;
    updatePrices(false);
  }
};
fetchGeoPricing();

// --- Service Request Modal Logic ---
const srvModal = document.getElementById('service-modal');
const srvCloseBtn = document.getElementById('service-modal-close');
const srvForm = document.getElementById('service-modal-form');
const srvTypeSelect = document.getElementById('srv-type');
const srvCountrySelect = document.getElementById('srv-country');
const srvToggle = document.getElementById('geo-pricing-toggle');

const openServiceModal = (serviceId) => {
  if (!srvModal) return;
  if (serviceId && srvTypeSelect) {
    srvTypeSelect.value = serviceId;
  }
  if (srvCountrySelect && srvToggle) {
    srvCountrySelect.value = srvToggle.checked ? 'CO' : 'Global';
  }
  srvModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  trackEvent('open_service_modal', { service: serviceId || 'unknown' });
};

const closeServiceModal = () => {
  if (!srvModal) return;
  srvModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
};

if (srvCloseBtn) srvCloseBtn.addEventListener('click', closeServiceModal);
if (srvModal) {
  srvModal.addEventListener('click', (e) => {
    if (e.target === srvModal) closeServiceModal();
  });
}

document.querySelectorAll('.service-modal-trigger').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openServiceModal(btn.dataset.service);
  });
});

// Floating "Cotizar" button -> open the proposal modal (defaults to web service)
const quoteTrigger = document.getElementById('quote-trigger');
if (quoteTrigger) {
  quoteTrigger.addEventListener('click', () => {
    trackEvent('quote_cta_click', { source: 'floating' });
    openServiceModal('web');
  });
}

// --- Web3: Connect Wallet (injected EIP-1193 provider, no external deps/RPC) ---
const walletBtn = document.getElementById('wallet-connect');
const walletLabel = document.getElementById('wallet-label');
if (walletBtn && walletLabel) {
  const shortAddr = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`;
  const setConnected = (addr) => {
    walletLabel.textContent = shortAddr(addr);
    walletBtn.classList.add('connected');
    walletBtn.title = addr;
  };
  const setDisconnected = () => {
    walletLabel.textContent = 'Connect Wallet';
    walletBtn.classList.remove('connected');
    walletBtn.title = 'Connect Wallet';
  };

  if (window.ethereum) {
    // Restore session silently if already authorized
    window.ethereum.request({ method: 'eth_accounts' })
      .then((accs) => { if (accs && accs[0]) setConnected(accs[0]); })
      .catch(() => {});
    if (typeof window.ethereum.on === 'function') {
      window.ethereum.on('accountsChanged', (accs) => {
        if (accs && accs[0]) setConnected(accs[0]);
        else setDisconnected();
      });
    }
  }

  walletBtn.addEventListener('click', async () => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download/', '_blank', 'noopener');
      return;
    }
    try {
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accs && accs[0]) {
        setConnected(accs[0]);
        trackEvent('wallet_connect');
      }
    } catch (err) {
      console.warn('Wallet connection rejected or failed.', err);
    }
  });
}

if (srvForm) {
  srvForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('srv-form-submit');
    const submitText = document.getElementById('srv-submit-text');
    const errorDiv = document.getElementById('srv-form-error');
    
    submitBtn.disabled = true;
    submitText.textContent = 'Enviando...';
    errorDiv.classList.add('hidden');

    const formData = new FormData(srvForm);
    
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });
      
      if (res.ok) {
        trackEvent('generate_lead', {
          form: 'service-requests',
          service: formData.get('service') || 'unknown',
          country: formData.get('country') || 'unknown'
        });
        srvForm.innerHTML = `<div style="text-align: center; padding: 2rem;">
          <h3 style="color: var(--accent-primary);">¡Solicitud Enviada!</h3>
          <p>Me pondré en contacto contigo pronto.</p>
        </div>`;
        setTimeout(() => closeServiceModal(), 3000);
      } else {
        throw new Error('Error en el envío');
      }
    } catch (err) {
      errorDiv.textContent = 'Hubo un error al enviar el formulario. Intenta de nuevo.';
      errorDiv.classList.remove('hidden');
      submitBtn.disabled = false;
      submitText.textContent = 'Submit Request';
    }
  });
}

// --- Dynamic Contact Info Block ---
const renderContactInfo = () => {
  const contactContainer = document.getElementById('contact-info-block');
  if (!contactContainer) return;

  contactContainer.innerHTML = '';

  // Contact details are delivered by the server only after a valid lead, and
  // cached for this browser session. Nothing is hardcoded in the client bundle.
  let contact = null;
  try { contact = JSON.parse(sessionStorage.getItem('cv_contact') || 'null'); } catch (e) { contact = null; }

  if (contact && contact.email) {
    const mailLink = document.createElement('a');
    mailLink.href = `mailto:${contact.email}`;
    mailLink.className = 'btn btn-primary';
    mailLink.style.textTransform = 'lowercase';
    mailLink.style.letterSpacing = '0.5px';
    mailLink.textContent = contact.email;

    contactContainer.appendChild(mailLink);

    if (contact.phone) {
      const telLink = document.createElement('a');
      telLink.href = `tel:${String(contact.phone).replace(/[^\d+]/g, '')}`;
      telLink.className = 'btn btn-outline';
      telLink.style.borderRadius = '30px';
      telLink.textContent = contact.phone;
      contactContainer.appendChild(telLink);
    }
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
      // Only render HTML when the element explicitly opts in via data-i18n-html.
      // Everything else uses textContent (safer against accidental markup injection).
      if (el.hasAttribute('data-i18n-html')) {
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

// --- Smooth Scrolling ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(targetId);
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
    // Fade out shortly after the page is actually ready (no arbitrary 2.8s wait).
    // Skip the delay entirely for users who prefer reduced motion.
    const minDelay = prefersReducedMotion ? 0 : 700;
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, prefersReducedMotion ? 0 : 400);
    }, minDelay);
  }

  // --- Scroll Reveal Observer ---
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        // observer.unobserve(entry.target); // Optional: Stop observing once revealed
      }
    });
  }, {
    root: null,
    threshold: 0.15, // Trigger when 15% of the element is visible
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));
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

  // Cursor hover effects on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, .btn, .ai-suggest-btn');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorOutline.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursorOutline.classList.remove('cursor-hover');
    });
  });
} else {
  if (cursorDot) cursorDot.style.display = 'none';
  if (cursorOutline) cursorOutline.style.display = 'none';
}

// --- 3D Background (Three.js Network) ---
const initBg = () => {
  const canvas = document.querySelector('#bg-canvas');
  if (!canvas) return;
  // Respect reduced-motion: skip the animated background entirely.
  if (prefersReducedMotion) {
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

  const animate = () => {
    if (!isVisible) return;
    animationFrameId = requestAnimationFrame(animate);

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

// --- Medium Blog Dynamic Fetch ---
const fetchMediumBlog = async () => {
  const blogGrid = document.getElementById('blog-grid');
  if (!blogGrid) return;

  const mediumUsername = '@wilfredocaro';
  const rssUrl = `https://medium.com/feed/${mediumUsername}`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.status === 'ok' && data.items.length > 0) {
      blogGrid.innerHTML = ''; // Clear loading text
      
      // Get latest 3 posts
      const posts = data.items.slice(0, 3);
      
      posts.forEach(post => {
        // Extract first image from description if thumbnail is empty
        let imgUrl = post.thumbnail;
        if (!imgUrl) {
          const imgMatch = post.description.match(/<img[^>]+src="([^">]+)"/);
          imgUrl = imgMatch ? imgMatch[1] : '/og-image.png'; // Fallback
        }

        const pubDate = new Date(post.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
        const cardHTML = `
          <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="project-card glass-panel" style="text-decoration: none; color: inherit; display: flex; flex-direction: column;">
            <div class="project-preview" style="background-image: url('${imgUrl}'); background-size: cover; background-position: center; min-height: 200px;">
              <div class="preview-overlay">READ ARTICLE</div>
            </div>
            <div class="project-info" style="padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column;">
              <div style="font-size: 0.8rem; color: var(--accent-primary); margin-bottom: 0.5rem;">${pubDate}</div>
              <h3 style="margin-top: 0; font-size: 1.2rem; line-height: 1.4;">${post.title}</h3>
              <div class="project-tags" style="margin-top: auto; padding-top: 1rem;">
                ${post.categories.slice(0, 3).map(cat => `<span>#${cat}</span>`).join('')}
              </div>
            </div>
          </a>
        `;
        blogGrid.insertAdjacentHTML('beforeend', cardHTML);
      });
    } else {
      blogGrid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">No articles published yet. Check back later!</p>';
    }
  } catch (err) {
    console.error('Failed to fetch Medium RSS:', err);
    blogGrid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">Failed to load articles.</p>';
  }
};
fetchMediumBlog();

// --- AI Assistant Logic ---
const aiTrigger = document.getElementById('ai-trigger');
const aiAssistant = document.getElementById('ai-assistant');
const aiClose = document.getElementById('ai-close');
const aiInput = document.getElementById('ai-input');
const aiSend = document.getElementById('ai-send');
const aiChat = document.getElementById('ai-chat');

const knowledgeBase = {
  en: {
    "who": "I am the AI clone of Wilfredo Caro, CEO at VirtuadsAi, CTO at Orbit, and tech innovator specializing in AI and Blockchain.",
    "virtuadsai": "VirtuadsAi is a company focused on re-engineering digital advertising using AI, Web3, and Blockchain for transparency and efficiency.",
    "orbit": "Orbit is a secure, mobile-first interface for cloud development environments where Wilfredo serves as CTO.",
    "exequine": "ExEquine is a decentralized registry project on the Blockchain where Wilfredo worked as a Fullstack & Blockchain Architect.",
    "experience": "Wilfredo is currently CEO of VirtuadsAi and CTO of Orbit. His 2026 journey includes architecture for ExEquine and high-level strategy for AI agents with Anti-Observer.",
    "skills": "Wilfredo's core expertise includes Artificial Intelligence, Web3 & Blockchain Architecture, Cloud Dev Environments, and Business Strategy.",
    "music": "Wilfredo is also a DJ! He loves Deep Tech and Techno. You can listen to his mixes in the player on the right.",
    "contact": "Please unlock contact details in the footer.",
    "default": "That's an interesting question! I focus on Deep Tech, AI, and Web3 (including Orbit and VirtuadsAi). Could you specify what you'd like to know about Wilfredo's path?"
  },
  es: {
    "quien": "Soy el clon de IA de Wilfredo Caro, CEO de VirtuadsAi, CTO de Orbit, y un innovador tecnológico especializado en IA y Blockchain.",
    "quién": "Soy el clon de IA de Wilfredo Caro, CEO de VirtuadsAi, CTO de Orbit, y un innovador tecnológico especializado en IA y Blockchain.",
    "who": "Soy el clon de IA de Wilfredo Caro, CEO de VirtuadsAi, CTO de Orbit, y un innovador tecnológico especializado en IA y Blockchain.",
    "virtuadsai": "VirtuadsAi es una empresa enfocada en rediseñar la publicidad digital usando IA, Web3 y Blockchain para aportar transparencia y eficiencia.",
    "orbit": "Orbit es una interfaz segura y enfocada en móviles para entornos de desarrollo en la nube donde Wilfredo es CTO.",
    "exequine": "ExEquine es un proyecto de registro descentralizado en la Blockchain donde Wilfredo trabajó como Arquitecto Fullstack y Blockchain.",
    "experiencia": "Wilfredo actualmente es CEO de VirtuadsAi y CTO de Orbit. Su trayectoria en 2026 incluye arquitectura para ExEquine y estrategia de alto nivel para agentes de IA con Anti-Observer.",
    "habilidades": "Las habilidades principales de Wilfredo incluyen Inteligencia Artificial, Arquitectura Web3 y Blockchain, Entornos de Desarrollo en la Nube y Estrategia de Negocios.",
    "dj": "¡Wilfredo también es DJ! Le apasiona el Deep Tech y el Techno. Puedes escuchar sus mezclas en el reproductor a la derecha.",
    "music": "¡Wilfredo también es DJ! Le apasiona el Deep Tech y el Techno. Puedes escuchar sus mezclas en el reproductor a la derecha.",
    "contacto": "Por favor, desbloquea los detalles de contacto en el pie de página.",
    "default": "¡Esa es una pregunta interesante! Me enfoco en Deep Tech, IA y Web3 (incluyendo Orbit y VirtuadsAi). ¿Podrías especificar qué te gustaría saber sobre la trayectoria de Wilfredo?"
  },
  ja: {
    "who": "私はVirtuadsAiのCEO、OrbitのCTOであり、AIとブロックチェーンを専門とするウィルフレド・カロのAIクローンです。",
    "virtuadsai": "VirtuadsAiは、AI・Web3・ブロックチェーンを活用してデジタル広告を再設計し、透明性と効率を高める企業です。",
    "orbit": "Orbitは、ウィルフレドがCTOを務める、クラウド開発環境向けのセキュアなモバイルファースト・インターフェースです。",
    "exequine": "ExEquineは、ウィルフレドがフルスタック兼ブロックチェーン・アーキテクトとして携わった、ブロックチェーン上の分散型レジストリ・プロジェクトです。",
    "experience": "ウィルフレドは現在VirtuadsAiのCEO兼OrbitのCTOです。2026年の活動にはExEquineのアーキテクチャやAnti-ObserverでのAIエージェント戦略が含まれます。",
    "skills": "ウィルフレドの主な専門分野は、人工知能、Web3・ブロックチェーン設計、クラウド開発環境、ビジネス戦略です。",
    "music": "ウィルフレドはDJでもあります！ディープテックとテクノを得意としています。右側のプレーヤーでミックスを聴けます。",
    "dj": "ウィルフレドはDJでもあります！ディープテックとテクノを得意としています。右側のプレーヤーでミックスを聴けます。",
    "contact": "フッターで連絡先情報のロックを解除してください。",
    "default": "面白いご質問ですね！私はディープテック、AI、Web3（OrbitやVirtuadsAiを含む）に注力しています。ウィルフレドの経歴について何を知りたいか教えていただけますか？"
  }
};

let isVoiceEnabled = false;
const voiceToggleBtn = document.getElementById('ai-voice-toggle');

if (voiceToggleBtn) {
  voiceToggleBtn.addEventListener('click', () => {
    isVoiceEnabled = !isVoiceEnabled;
    if (isVoiceEnabled) {
      voiceToggleBtn.classList.add('active');
    } else {
      voiceToggleBtn.classList.remove('active');
      window.speechSynthesis.cancel();
    }
  });
}

const addMessage = (text, sender) => {
  const msg = document.createElement('div');
  msg.className = `ai-msg ${sender}`;
  msg.textContent = text;
  aiChat.appendChild(msg);
  aiChat.scrollTop = aiChat.scrollHeight;

  // Web Speech API
  if (sender === 'bot' && isVoiceEnabled && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: detect language based on current UI language
    const currentLang = document.querySelector('.lang-btn.active')?.dataset.lang || 'en';
    if (currentLang === 'es') utterance.lang = 'es-ES';
    else if (currentLang === 'ja') utterance.lang = 'ja-JP';
    else utterance.lang = 'en-US';
    
    window.speechSynthesis.speak(utterance);
  }
};

const handleAiChat = () => {
  const query = aiInput.value.toLowerCase().trim();
  if (!query) return;

  const originalQuery = aiInput.value.trim();
  addMessage(originalQuery, 'user');
  aiInput.value = '';
  trackEvent('ai_chat_message');

  const typingIndicator = document.getElementById('ai-typing');
  if (typingIndicator) {
    typingIndicator.classList.remove('hidden');
    aiChat.scrollTop = aiChat.scrollHeight;
  }

  fetch('/.netlify/functions/chat', {
    method: 'POST',
    body: JSON.stringify({ message: originalQuery }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  })
  .then(data => {
    if (typingIndicator) typingIndicator.classList.add('hidden');
    
    let responseText = data.reply;
    if (!responseText) throw new Error('No reply from server');
    
    addMessage(responseText, 'bot');
  })
  .catch(err => {
    console.warn("AI Serverless function failed, falling back to local logic.", err);
    setTimeout(() => {
      if (typingIndicator) typingIndicator.classList.add('hidden');
      
      const activeLangBtn = document.querySelector('.lang-btn.active');
      const lang = activeLangBtn ? activeLangBtn.dataset.lang : 'en';
      const kb = knowledgeBase[lang] || knowledgeBase['en'];
      
      let response = kb.default;
      let maxScore = 0;
      const queryWords = query.match(/\b(\w+)\b/g) || [];
      
      for (const key in kb) {
        if (key === 'default') continue;
        
        let score = 0;
        // High score for exact substring match
        if (query.includes(key)) score += 5;
        
        // Partial word matches
        queryWords.forEach(word => {
          if (word.length > 3 && (key.includes(word) || word.includes(key))) {
            score += 2;
          }
        });

        if (score > maxScore && score > 0) {
          maxScore = score;
          response = kb[key];
        }
      }
      
      addMessage(response, 'bot');
    }, 1000);
  });
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

// --- Custom DJ Player Logic (HTML5 Audio) ---
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('player-play-btn');
const prevBtn = document.getElementById('player-prev-btn');
const nextBtn = document.getElementById('player-next-btn');
const visualizer = document.querySelector('.player-visualizer');
const artwork = document.querySelector('.track-artwork');
const timeCurrent = document.getElementById('player-time-current');
const timeDuration = document.getElementById('player-time-duration');
const timeline = document.getElementById('player-timeline');

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

if (audioPlayer) {
  // Sync UI with audio events
  audioPlayer.addEventListener('play', () => {
    if (playBtn) playBtn.textContent = '⏸';
    if (visualizer) visualizer.classList.add('playing');
    if (artwork) artwork.classList.add('playing');
  });

  audioPlayer.addEventListener('pause', () => {
    if (playBtn) playBtn.textContent = '▶';
    if (visualizer) visualizer.classList.remove('playing');
    if (artwork) artwork.classList.remove('playing');
  });

  audioPlayer.addEventListener('timeupdate', () => {
    if (timeCurrent) timeCurrent.textContent = formatTime(audioPlayer.currentTime);
    if (audioPlayer.duration && timeline) {
      const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      timeline.value = progressPercent;
    }
  });

  audioPlayer.addEventListener('loadedmetadata', () => {
    if (timeDuration) timeDuration.textContent = formatTime(audioPlayer.duration);
  });

  // Controls Event Listeners
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (audioPlayer.paused) {
        audioPlayer.play().catch(err => console.log("Playback interrupted: ", err));
      } else {
        audioPlayer.pause();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      audioPlayer.currentTime = Math.min(audioPlayer.duration || 0, audioPlayer.currentTime + 10);
    });
  }

  // Timeline Scrubbing via input range
  if (timeline) {
    timeline.addEventListener('input', (e) => {
      if (audioPlayer.duration) {
        const scrubTime = (e.target.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = scrubTime;
      }
    });
  }
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

// Open the lead-capture modal
const openCvModal = () => {
  if (cvModal) {
    cvModal.classList.remove('hidden');
    if (cvFormError) cvFormError.classList.add('hidden');
    if (cvModalForm) cvModalForm.reset();
  }
};

// Download the CV through the token-gated serverless endpoint.
// If the session token is missing or expired, fall back to the lead form.
const triggerCvDownload = async () => {
  const token = sessionStorage.getItem('cv_token');
  if (!token) {
    openCvModal();
    return;
  }
  try {
    const res = await fetch(`/.netlify/functions/cv?token=${encodeURIComponent(token)}`);
    if (!res.ok) {
      // Token expired or invalid -> require a fresh lead.
      sessionStorage.removeItem('cv_token');
      openCvModal();
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Wilfredo-CV-2026.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn('CV download failed:', err);
    openCvModal();
  }
};

if (cvDownloadBtn) {
  cvDownloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (sessionStorage.getItem('cv_token')) {
      triggerCvDownload();
    } else {
      openCvModal();
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

    // 1) Record the lead in Netlify Forms (for notifications) — best effort.
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
    // 2) Validate the lead server-side and obtain the contact + a CV token.
    .then(() => fetch('/.netlify/functions/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameVal, email: emailVal, company: companyVal, purpose: purposeVal })
    }))
    .then(async (response) => {
      // Restore submit button state
      cvFormSubmit.disabled = false;
      cvFormSubmit.classList.remove('btn-disabled');
      const originalText = (translations[currentLang] && translations[currentLang]['cv_submit_btn']) || 'Submit & Download';
      cvSubmitText.textContent = originalText;

      if (!response.ok) throw new Error('Unlock request failed');
      const data = await response.json();
      if (!data || !data.token) throw new Error('No token returned');

      trackEvent('generate_lead', { form: 'cv-downloads', purpose: purposeVal });

      // Cache token + contact for THIS session only (no PII in localStorage).
      sessionStorage.setItem('cv_token', data.token);
      sessionStorage.setItem('cv_contact', JSON.stringify({ email: data.email, phone: data.phone }));
      localStorage.setItem('cv_unlocked', 'true'); // UX hint only; real gate is the token

      // Re-render contact details in the footer
      renderContactInfo();

      // Show Success Toast
      const modalWrap = document.getElementById('cv-modal-content-wrap');
      const successToast = document.getElementById('cv-success-toast');
      if (modalWrap && successToast) {
        modalWrap.classList.add('hidden');
        successToast.classList.remove('hidden');

        setTimeout(() => {
          // Trigger token-gated file download & close modal
          triggerCvDownload();
          closeCvModal();
          // Reset for future
          setTimeout(() => {
            modalWrap.classList.remove('hidden');
            successToast.classList.add('hidden');
          }, 500);
        }, 1500);
      } else {
        // Fallback if elements are missing
        triggerCvDownload();
        closeCvModal();
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

// --- Mobile: light haptic feedback (Android only; iOS Safari has no Vibration API) ---
const haptic = (ms = 10) => {
  if (!prefersReducedMotion && typeof navigator.vibrate === 'function') navigator.vibrate(ms);
};
[
  document.getElementById('player-play-btn'),
  document.getElementById('ai-send'),
  document.getElementById('mobile-menu-toggle'),
  document.getElementById('quote-trigger'),
  document.getElementById('ai-trigger'),
].forEach((el) => el && el.addEventListener('click', () => haptic()));

// --- Mobile: keep the AI chat input above the virtual keyboard (visualViewport) ---
const aiAssistantEl = document.getElementById('ai-assistant');
if (aiAssistantEl && window.visualViewport) {
  let vvRaf = 0;
  const syncKeyboardOffset = () => {
    cancelAnimationFrame(vvRaf);
    vvRaf = requestAnimationFrame(() => {
      const vv = window.visualViewport;
      // How much of the layout viewport the keyboard is covering at the bottom.
      const overlap = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
      aiAssistantEl.style.setProperty('--kb-offset', `${overlap}px`);
    });
  };
  window.visualViewport.addEventListener('resize', syncKeyboardOffset);
  window.visualViewport.addEventListener('scroll', syncKeyboardOffset);
}

// --- PWA: register the service worker only for built output (PROD) ---
// Skips the Vite dev server (HMR stays clean) but runs in `vite preview` and
// production, so installability can be tested locally via `npm run preview`.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

// --- Payment Gateways Logic ---
document.querySelectorAll('.pay-wompi-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const amount = btn.dataset.amount;
    const ref = btn.dataset.ref + '-' + Math.floor(Math.random() * 1000000);
    
    // Check if WidgetCheckout is available (loaded from Wompi script)
    if (typeof WidgetCheckout !== 'undefined') {
      const checkout = new WidgetCheckout({
        currency: 'COP',
        amountInCents: parseInt(amount, 10),
        reference: ref,
        // Sandbox Public Key. Replace with Production Key for real payments.
        publicKey: 'pub_test_Q5yDA9xoKdePzhSGeZaVvwAXmRkdDPGq',
      });
      checkout.open(function (result) {
        const transaction = result.transaction;
        console.log('Transaction result: ', transaction);
        if (transaction.status === 'APPROVED') {
          alert('¡Pago aprobado con éxito!');
        } else {
          alert('El pago no pudo ser procesado o fue cancelado.');
        }
      });
      trackEvent('open_wompi_checkout', { ref: ref });
    } else {
      console.error('Wompi Widget not loaded.');
      alert('Error cargando la pasarela de pagos. Por favor intenta más tarde.');
    }
  });
});

document.querySelectorAll('.pay-bold-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const link = btn.dataset.link;
    trackEvent('open_bold_checkout', { link: link });
    window.open(link, '_blank', 'noopener');
  });
});

document.querySelectorAll('.pay-wenia-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    trackEvent('open_crypto_checkout');
    if (window.ethereum) {
       // Simple fallback to connect wallet if desired, but here we just alert
       alert('La integración Web3 para pagos en Wenia / USDC está en configuración. Contáctame por Calendly.');
    } else {
       alert('Por favor instala MetaMask o una billetera Web3 para pagos Cripto (Wenia).');
    }
  });
});
