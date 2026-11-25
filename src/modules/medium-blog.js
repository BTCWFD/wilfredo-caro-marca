// --- Medium Blog Dynamic Fetch + Live PQC & Swarm Architecture Telemetry Fallback ---
const getTranslation = (key, fallback) => {
  const lang = document.documentElement.lang || 'en';
  if (window.translations && window.translations[lang] && window.translations[lang][key]) {
    return window.translations[lang][key];
  }
  return fallback;
};

const escapeHTML = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const TELEMETRY_DOSSIERS = {
  es: [
    {
      code: 'PQC // ML-KEM-768',
      status: 'QUANTUM-SAFE ACTIVE',
      title: 'Transporte Criptográfico Post-Cuántico entre Enjambres de Agentes',
      desc: 'Encapsulación de claves basada en retículos (NIST FIPS 203) para blindar canales agente↔agente frente a ataques de recolección cuántica.',
      tags: ['#PQC', '#ML-KEM', '#ZeroTrust'],
      href: '/planner.html',
      cta: 'ABRIR SIMULADOR PQC →'
    },
    {
      code: 'SWARM // ANTIGRAVITY',
      status: '60 FPS TELEMETRY',
      title: 'Gobernanza Jerárquica, Detección de Bucles y Redacción PII en Vivo',
      desc: 'Reconstrucción topológica en tiempo real de subagentes autónomos con freno automático ante ciclos infinitos y auditoría determinista.',
      tags: ['#AgentOps', '#Observability', '#Governance'],
      href: 'https://github.com/BTCWFD/antigravity-monitor',
      cta: 'INSPECCIONAR ARQUITECTURA →'
    },
    {
      code: 'MOBILE // ORBIT ML-DSA',
      status: 'HUMAN-IN-THE-LOOP',
      title: 'Firma Digital Post-Cuántica (Dilithium-65) desde Mando Móvil',
      desc: 'Intervención remota de baja latencia teléfono↔Cloud IDE cuando un agente requiere autorización crítica en producción.',
      tags: ['#OrbitIDE', '#ML-DSA', '#MissionControl'],
      href: 'https://github.com/BTCWFD/ORBIT-APP',
      cta: 'EXPLORAR ORBIT →'
    }
  ],
  en: [
    {
      code: 'PQC // ML-KEM-768',
      status: 'QUANTUM-SAFE ACTIVE',
      title: 'Post-Quantum Key Encapsulation Across Multi-Agent Swarms',
      desc: 'Lattice-based key establishment (NIST FIPS 203) securing inter-agent telemetry pipes against harvest-now, decrypt-later threats.',
      tags: ['#PQC', '#ML-KEM', '#ZeroTrust'],
      href: '/planner.html',
      cta: 'OPEN PQC SIMULATOR →'
    },
    {
      code: 'SWARM // ANTIGRAVITY',
      status: '60 FPS TELEMETRY',
      title: 'Hierarchical Swarm Governance, Loop Guard & Live PII Redaction',
      desc: 'Real-time topological reconstruction of autonomous subagent trees with deterministic anti-pattern circuit breakers.',
      tags: ['#AgentOps', '#Observability', '#Governance'],
      href: 'https://github.com/BTCWFD/antigravity-monitor',
      cta: 'INSPECT ARCHITECTURE →'
    },
    {
      code: 'MOBILE // ORBIT ML-DSA',
      status: 'HUMAN-IN-THE-LOOP',
      title: 'Mobile Mission Control & Post-Quantum Command Signing (ML-DSA)',
      desc: 'Low-latency phone-to-cloud IDE bridge enabling cryptographic human approval whenever production agents hit critical gates.',
      tags: ['#OrbitIDE', '#ML-DSA', '#MissionControl'],
      href: 'https://github.com/BTCWFD/ORBIT-APP',
      cta: 'EXPLORE ORBIT →'
    }
  ]
};

let usingFallbackDossiers = false;

const renderTelemetryDossiers = () => {
  const blogGrid = document.getElementById('blog-grid');
  if (!blogGrid) return;
  usingFallbackDossiers = true;

  const lang = (document.documentElement.lang || 'en').startsWith('es') ? 'es' : 'en';
  const items = TELEMETRY_DOSSIERS[lang];

  blogGrid.innerHTML = items
    .map(
      (item) => `
      <a href="${item.href}" ${item.href.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="project-card glass-panel telemetry-dossier-card" style="text-decoration: none; color: inherit; display: flex; flex-direction: column;">
        <div class="telemetry-dossier-head">
          <span class="telemetry-code">${item.code}</span>
          <span class="telemetry-live-pill"><span class="telemetry-dot"></span>${item.status}</span>
        </div>
        <div class="project-info" style="padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column;">
          <h3 style="margin-top: 0; font-size: 1.2rem; line-height: 1.35;">${item.title}</h3>
          <p style="margin-bottom: 1.2rem;">${item.desc}</p>
          <div class="project-tags" style="margin-top: auto; padding-bottom: 0.9rem;">
            ${item.tags.map((t) => `<span>${t}</span>`).join('')}
          </div>
          <span class="orch-cta" style="margin-top: 0.25rem;">${item.cta}</span>
        </div>
      </a>
    `
    )
    .join('');
};

const fetchMediumBlog = async () => {
  const blogGrid = document.getElementById('blog-grid');
  if (!blogGrid) return;

  const mediumUsername = '@wilfredocaro';
  const rssUrl = `https://medium.com/feed/${mediumUsername}`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
      usingFallbackDossiers = false;
      blogGrid.innerHTML = '';
      const posts = data.items.slice(0, 3);

      posts.forEach((post) => {
        let imgUrl = post.thumbnail;
        if (!imgUrl) {
          const imgMatch = post.description.match(/<img[^>]+src="([^">]+)"/);
          imgUrl = imgMatch ? imgMatch[1] : '/og-image.png';
        }

        const pubDate = new Date(post.pubDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const safeLink = escapeHTML(post.link);
        const safeImgUrl = escapeHTML(imgUrl).replace(/'/g, "\\'");
        const safeTitle = escapeHTML(post.title);
        const safeCategories = post.categories
          .slice(0, 3)
          .map((cat) => `<span>#${escapeHTML(cat)}</span>`)
          .join('');

        const cardHTML = `
          <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="project-card glass-panel" style="text-decoration: none; color: inherit; display: flex; flex-direction: column;">
            <div class="project-preview" style="background-image: url('${safeImgUrl}'); background-size: cover; background-position: center; min-height: 200px;">
              <div class="preview-overlay">${getTranslation('blog_read_article', 'READ ARTICLE')}</div>
            </div>
            <div class="project-info" style="padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column;">
              <div style="font-size: 0.8rem; color: var(--accent-primary); margin-bottom: 0.5rem;">${pubDate}</div>
              <h3 style="margin-top: 0; font-size: 1.2rem; line-height: 1.4;">${safeTitle}</h3>
              <div class="project-tags" style="margin-top: auto; padding-top: 1rem;">
                ${safeCategories}
              </div>
            </div>
          </a>
        `;
        blogGrid.insertAdjacentHTML('beforeend', cardHTML);
      });
    } else {
      renderTelemetryDossiers();
    }
  } catch {
    renderTelemetryDossiers();
  }
};

document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (usingFallbackDossiers) {
      setTimeout(renderTelemetryDossiers, 30);
    }
  });
});

fetchMediumBlog();
