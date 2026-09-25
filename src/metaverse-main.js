import { MetaverseScene, METAVERSE_NODES } from './modules/metaverse-scene.js';
import { soundManager } from './modules/metaverse-audio.js';

// Global state
let sceneInstance = null;
let isAudioActive = false;

// DOM Elements
const canvas = document.getElementById('canvas');
const entryScreen = document.getElementById('entry');
const sceneScreen = document.getElementById('scene');
const detailPanel = document.getElementById('detail-panel');
const omnisearchModal = document.getElementById('omnisearch-modal');
const omnisearchInput = document.getElementById('omnisearch-input');
const omnisearchResults = document.getElementById('omnisearch-results');
const audioToggleBtn = document.getElementById('audio-toggle-btn');
const tourToggleBtn = document.getElementById('tour-toggle-btn');
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
const radarCanvas = document.getElementById('radar-canvas');

// 1. Custom Magnetic Cursor
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  }
});

function animateCursor() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  if (cursorRing) {
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  }
  requestAnimationFrame(animateCursor);
}
requestAnimationFrame(animateCursor);

// 2. Entry Screen -> Launch 3D Scene
window.enterScene = function () {
  if (entryScreen) {
    entryScreen.classList.add('entry-fade-out');
    setTimeout(() => {
      entryScreen.style.display = 'none';
    }, 800);
  }
  if (sceneScreen) {
    sceneScreen.classList.add('visible');
  }

  // Initialize Three.js Scene
  if (!sceneInstance) {
    sceneInstance = new MetaverseScene(canvas, onNodeSelect, onNodeHover);
    sceneInstance.setRadarCallback(drawRadar);
    buildFeedDots();
  }
};

// 3. Node Selection Callback (Opens Bento Drawer)
function onNodeSelect(node) {
  if (!node) {
    closePanel();
    updateFeedDots(null);
    return;
  }

  updateFeedDots(node.id);

  // Populate Bento Drawer
  const badge = document.getElementById('panel-type-badge');
  const title = document.getElementById('panel-title');
  const role = document.getElementById('panel-role');
  const tagline = document.getElementById('panel-tagline');
  const desc = document.getElementById('panel-desc');
  const tagsContainer = document.getElementById('panel-tags');
  const metricsContainer = document.getElementById('panel-metrics');
  const linkBtn = document.getElementById('panel-link');

  if (badge) {
    badge.textContent = `◈ ${node.type}`;
    badge.style.color = node.typeColor;
    badge.style.borderColor = `${node.typeColor}44`;
    badge.style.backgroundColor = `${node.typeColor}15`;
  }

  if (title) title.textContent = node.title;
  if (role) role.textContent = `${node.role} · ${node.date}`;
  if (tagline) tagline.textContent = node.tagline;
  if (desc) desc.textContent = node.description;

  // Tags
  if (tagsContainer) {
    tagsContainer.innerHTML = '';
    node.tags.forEach((tag) => {
      const chip = document.createElement('span');
      chip.className = 'bento-tag';
      chip.textContent = tag;
      tagsContainer.appendChild(chip);
    });
  }

  // Metrics Grid
  if (metricsContainer) {
    metricsContainer.innerHTML = '';
    if (node.metrics) {
      Object.entries(node.metrics).forEach(([label, value]) => {
        const item = document.createElement('div');
        item.className = 'metric-box';
        item.innerHTML = `
          <div class="metric-label">${label}</div>
          <div class="metric-val" style="color: ${node.typeColor}">${value}</div>
        `;
        metricsContainer.appendChild(item);
      });
    }
  }

  // Action Button
  if (linkBtn) {
    linkBtn.href = node.link;
    linkBtn.innerHTML = node.isFlagship
      ? `<span>Deploy VirtuadsAi Engine ↗</span>`
      : `<span>Explore Architecture ↗</span>`;
    linkBtn.style.background = `linear-gradient(135deg, ${node.typeColor} 0%, #00f5ff 100%)`;
  }

  if (detailPanel) {
    detailPanel.classList.add('open');
  }

  // Haptic feedback if supported
  if (navigator.vibrate) {
    try { navigator.vibrate(15); } catch (_) {}
  }
}

const holoTooltip = document.getElementById('holo-tooltip');

function onNodeHover(hoveredId, coords, node) {
  if (cursorRing) {
    if (hoveredId !== null) {
      cursorRing.classList.add('cursor-locked');
    } else {
      cursorRing.classList.remove('cursor-locked');
    }
  }

  if (holoTooltip) {
    if (hoveredId !== null && coords && coords.visible && node) {
      holoTooltip.style.left = `${coords.x}px`;
      holoTooltip.style.top = `${coords.y}px`;
      
      const badge = holoTooltip.querySelector('.tooltip-badge');
      const title = holoTooltip.querySelector('.tooltip-title');
      const role = holoTooltip.querySelector('.tooltip-role');

      if (badge) {
        badge.textContent = `◈ ${node.type}`;
        badge.style.color = node.typeColor;
      }
      if (title) title.textContent = node.title;
      if (role) role.textContent = `${node.role} · ${node.date}`;

      holoTooltip.classList.add('visible');
    } else {
      holoTooltip.classList.remove('visible');
    }
  }
}

// 4. Panel Close
window.closePanel = function () {
  if (detailPanel) {
    detailPanel.classList.remove('open');
  }
  if (sceneInstance && !sceneInstance.isGuidedTour) {
    sceneInstance.deselectNode();
  }
  updateFeedDots(null);
};

// 5. Feed Dots (Right Side Navigation Dots)
function buildFeedDots() {
  const container = document.getElementById('feed-dots');
  if (!container) return;
  container.innerHTML = '';

  METAVERSE_NODES.forEach((node) => {
    const dot = document.createElement('div');
    dot.className = 'feed-dot';
    dot.dataset.id = node.id;
    dot.dataset.label = node.title;
    dot.style.setProperty('--dot-color', node.typeColor);

    dot.addEventListener('click', () => {
      if (sceneInstance) {
        sceneInstance.selectNode(node.id);
      }
    });
    container.appendChild(dot);
  });
}

function updateFeedDots(activeId) {
  document.querySelectorAll('.feed-dot').forEach((dot) => {
    const id = parseInt(dot.dataset.id, 10);
    dot.classList.toggle('active', id === activeId);
  });
}

// 6. Guided Tour Toggle
window.toggleTour = function () {
  if (!sceneInstance) return;
  const isRunning = sceneInstance.toggleGuidedTour();
  if (tourToggleBtn) {
    tourToggleBtn.classList.toggle('active', isRunning);
    tourToggleBtn.innerHTML = isRunning
      ? `<span class="pulse-dot"></span> Exit Tour`
      : `▷ Guided Tour`;
  }
};

// 7. Reset Camera
window.resetCamera = function () {
  if (sceneInstance) {
    sceneInstance.resetCamera();
  }
  closePanel();
};

// 8. Audio Toggle
window.toggleAudio = function () {
  isAudioActive = soundManager.toggleSound();
  if (audioToggleBtn) {
    audioToggleBtn.classList.toggle('active', isAudioActive);
    audioToggleBtn.innerHTML = isAudioActive
      ? `<span class="sound-wave active"><span></span><span></span><span></span></span> Audio ON`
      : `<span class="sound-wave"><span></span><span></span><span></span></span> Sound Muted`;
  }
};

// 9. Omnisearch (Shortcut: `/` or Search button)
window.openOmnisearch = function () {
  if (!omnisearchModal) return;
  omnisearchModal.classList.add('open');
  if (omnisearchInput) {
    omnisearchInput.value = '';
    renderSearchResults('');
    setTimeout(() => omnisearchInput.focus(), 80);
  }
};

window.closeOmnisearch = function () {
  if (!omnisearchModal) return;
  omnisearchModal.classList.remove('open');
};

function renderSearchResults(query) {
  if (!omnisearchResults) return;
  const q = query.trim().toLowerCase();
  const filtered = METAVERSE_NODES.filter((n) => {
    return (
      n.title.toLowerCase().includes(q) ||
      n.role.toLowerCase().includes(q) ||
      n.type.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  omnisearchResults.innerHTML = '';
  if (filtered.length === 0) {
    omnisearchResults.innerHTML = `<div class="search-empty">No nodes found matching "${query}"</div>`;
    return;
  }

  filtered.forEach((node) => {
    const item = document.createElement('div');
    item.className = 'search-item';
    item.innerHTML = `
      <div class="search-item-left">
        <span class="search-type" style="color: ${node.typeColor}">◈ ${node.type}</span>
        <span class="search-title">${node.title}</span>
        <span class="search-role">${node.role}</span>
      </div>
      <div class="search-shortcut">JUMP ↵</div>
    `;
    item.addEventListener('click', () => {
      closeOmnisearch();
      if (sceneInstance) {
        sceneInstance.selectNode(node.id);
      }
    });
    omnisearchResults.appendChild(item);
  });
}

if (omnisearchInput) {
  omnisearchInput.addEventListener('input', (e) => {
    renderSearchResults(e.target.value);
  });
}

// Keyboard Global Shortcuts
window.addEventListener('keydown', (e) => {
  // Slash `/` opens Omnisearch
  if (e.key === '/' && !omnisearchModal.classList.contains('open')) {
    e.preventDefault();
    openOmnisearch();
  }
  // Escape closes modals
  if (e.key === 'Escape') {
    closeOmnisearch();
    closePanel();
  }
});

// Close Omnisearch when clicking backdrop
if (omnisearchModal) {
  omnisearchModal.addEventListener('click', (e) => {
    if (e.target === omnisearchModal) {
      closeOmnisearch();
    }
  });
}

// 10. Radar Mini-Map Drawing
function drawRadar(data) {
  if (!radarCanvas) return;
  const ctx = radarCanvas.getContext('2d');
  const w = radarCanvas.width;
  const h = radarCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const scale = 0.55;

  ctx.clearRect(0, 0, w, h);

  // Radar circular rings
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(cx, 4);
  ctx.lineTo(cx, h - 4);
  ctx.moveTo(4, cy);
  ctx.lineTo(w - 4, cy);
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.1)';
  ctx.stroke();

  // Nodes on radar
  METAVERSE_NODES.forEach((node) => {
    const nx = cx + node.position.x * scale;
    const ny = cy + node.position.z * scale;
    const isSel = node.id === data.selectedId;

    ctx.beginPath();
    ctx.arc(nx, ny, node.isFlagship ? 4.5 : isSel ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fillStyle = node.typeColor;
    ctx.shadowColor = node.typeColor;
    ctx.shadowBlur = isSel ? 8 : 4;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // User Camera indicator
  const userX = cx + data.camX * scale * 0.85;
  const userY = cy + data.camZ * scale * 0.85;

  ctx.save();
  ctx.translate(userX, userY);
  ctx.rotate(-data.rotY);

  // Cone of vision
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-7, -14);
  ctx.lineTo(7, -14);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 245, 255, 0.35)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.restore();
}
