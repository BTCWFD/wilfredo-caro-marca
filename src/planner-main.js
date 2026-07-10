// Security: Escape user inputs to prevent DOM-XSS
const escapeHTML = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Tab switching logic
const tabs = document.querySelectorAll('.nav-tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    
    // Redraw graph if switching to simulator
    if (tab.dataset.tab === 'simulator') {
      setTimeout(() => drawSwarmGraph(parseInt(simAgentsSlider.value)), 50);
    }
  });
});

// CRM Local logic
const crmTbody = document.getElementById('crm-tbody');
const btnSeed = document.getElementById('btn-seed-data');
const btnClearCrm = document.getElementById('btn-clear-crm');

const loadCrmData = () => {
  crmTbody.innerHTML = '';
  
  const leads = JSON.parse(localStorage.getItem('local_leads') || '[]');
  const cvs = JSON.parse(localStorage.getItem('local_cv_requests') || '[]');
  
  // Combine and sort by date descending
  const allEntries = [
    ...leads.map(l => ({ ...l, entryType: 'proposal' })),
    ...cvs.map(c => ({ ...c, entryType: 'cv' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (allEntries.length === 0) {
    crmTbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          No hay registros locales en localStorage. Usa "Sembrar Datos Demo" para probar.
        </td>
      </tr>
    `;
    return;
  }
  
  allEntries.forEach(entry => {
    const tr = document.createElement('tr');
    const dateStr = new Date(entry.date).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
    
    let typeBadge = '';
    let descField = '';
    
    if (entry.entryType === 'proposal') {
      const badgeClass = `badge-${escapeHTML(entry.service)}`;
      const serviceNames = { web: 'Web Dev', ai: 'IA Bots', brand: 'Branding', dj: 'DJ Presskit' };
      typeBadge = `<span class="badge ${badgeClass}">${escapeHTML(serviceNames[entry.service] || entry.service)}</span>`;
      descField = `<strong>Detalles:</strong> ${escapeHTML(entry.details)} <br><small style="color: var(--text-muted);">País: ${escapeHTML(entry.country)}</small>`;
    } else {
      typeBadge = `<span class="badge badge-cv">Descarga CV</span>`;
      const purposeNames = { hire: 'Contratar', collab: 'Colaboración', invest: 'Inversión', other: 'Otro' };
      descField = `<strong>Empresa:</strong> ${escapeHTML(entry.company)} <br><small style="color: var(--text-muted);">Propósito: ${escapeHTML(purposeNames[entry.purpose] || entry.purpose)}</small>`;
    }
    
    tr.innerHTML = `
      <td>${dateStr}</td>
      <td><strong>${escapeHTML(entry.name)}</strong></td>
      <td><a href="mailto:${escapeHTML(entry.email)}" style="color: var(--accent-cyan); text-decoration: none;">${escapeHTML(entry.email)}</a></td>
      <td>${typeBadge}</td>
      <td>${descField}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteEntry('${escapeHTML(entry.entryType)}', ${entry.id})" style="padding: 2px 6px; font-size: 0.75rem;">Eliminar</button>
      </td>
    `;
    crmTbody.appendChild(tr);
  });
};

window.deleteEntry = (type, id) => {
  if (type === 'proposal') {
    const leads = JSON.parse(localStorage.getItem('local_leads') || '[]');
    const updated = leads.filter(l => l.id !== id);
    localStorage.setItem('local_leads', JSON.stringify(updated));
  } else {
    const cvs = JSON.parse(localStorage.getItem('local_cv_requests') || '[]');
    const updated = cvs.filter(c => c.id !== id);
    localStorage.setItem('local_cv_requests', JSON.stringify(updated));
  }
  loadCrmData();
};

btnSeed.addEventListener('click', () => {
  const mockLeads = [
    { id: 1719914400000, name: 'Carolina Gómez', email: 'carolina.gomez@techstart.co', service: 'ai', country: 'CO', details: 'Bot de WhatsApp inteligente para atención al cliente y agendamiento de citas médicas.', date: '2026-07-02T10:30:00.000Z' },
    { id: 1719915400000, name: 'Michael Chen', email: 'mchen@venturecapital.sg', service: 'web', country: 'Global', details: 'Smart-contracts auditables para plataforma DeFi de fan value. Preparación PQC.', date: '2026-07-02T15:45:00.000Z' },
    { id: 1719916400000, name: 'Andrés Mendoza', email: 'a.mendoza@clubsonico.com', service: 'dj', country: 'CO', details: 'Pressekit electrónico e integración de reproductor para el festival de música electrónica local.', date: '2026-07-03T01:10:00.000Z' }
  ];
  const mockCvs = [
    { id: 1719917400000, name: 'Sarah Connor', email: 'sconnor@cyberdyne.io', company: 'Cyberdyne Systems', purpose: 'hire', date: '2026-07-03T03:22:00.000Z' },
    { id: 1719918400000, name: 'Kenji Tanaka', email: 'k.tanaka@tokyoai.co.jp', company: 'Tokyo AI Corp', purpose: 'invest', date: '2026-07-03T04:50:00.000Z' }
  ];
  
  localStorage.setItem('local_leads', JSON.stringify(mockLeads));
  localStorage.setItem('local_cv_requests', JSON.stringify(mockCvs));
  loadCrmData();
});

btnClearCrm.addEventListener('click', () => {
  if (confirm('¿Seguro de borrar todas las solicitudes del CRM local?')) {
    localStorage.removeItem('local_leads');
    localStorage.removeItem('local_cv_requests');
    loadCrmData();
  }
});

// Tab 2: Planner & Previews
const postTitle = document.getElementById('post-title');
const postBody = document.getElementById('post-body');
const btnSavePost = document.getElementById('btn-save-post');
const btnLoadIdeas = document.getElementById('btn-load-ideas');
const linkedinPreview = document.getElementById('linkedin-preview-body');
const draftsList = document.getElementById('drafts-list');

const updateLinkedInPreview = () => {
  const rawText = postBody.value.trim() || 'El contenido que escribas en el panel de la izquierda se previsualizará aquí de manera interactiva en tiempo real...';
  let escaped = escapeHTML(rawText);
  
  // Formatting hashtags in LinkedIn Blue
  escaped = escaped.replace(/#(\w+)/g, '<span style="color: #70b5f9; cursor: pointer;">#$1</span>');
  
  // Formatting links in LinkedIn Blue
  escaped = escaped.replace(/((https?:\/\/|www\.)[^\s]+)/g, '<span style="color: #70b5f9; cursor: pointer; text-decoration: underline;">$1</span>');
  
  linkedinPreview.innerHTML = escaped;
};

postBody.addEventListener('input', updateLinkedInPreview);

const loadDrafts = () => {
  draftsList.innerHTML = '';
  const drafts = JSON.parse(localStorage.getItem('local_posts') || '[]');
  
  if (drafts.length === 0) {
    draftsList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.8rem;">No hay borradores guardados aún.</p>';
    return;
  }
  
  drafts.forEach((draft, idx) => {
    const item = document.createElement('div');
    item.style.cssText = 'background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;';
    item.innerHTML = `
      <div style="cursor: pointer; flex: 1;" onclick="loadDraft(${idx})">
        <span style="font-size: 0.85rem; font-weight: 600; color: var(--accent-cyan);">${escapeHTML(draft.title)}</span>
        <br><small style="color: var(--text-muted); font-size: 0.7rem;">${new Date(draft.date).toLocaleDateString()}</small>
      </div>
      <button class="btn btn-danger" onclick="deleteDraft(${idx})" style="padding: 2px 6px; font-size: 0.7rem; border-color: transparent;">🗑️</button>
    `;
    draftsList.appendChild(item);
  });
};

window.loadDraft = (idx) => {
  const drafts = JSON.parse(localStorage.getItem('local_posts') || '[]');
  const draft = drafts[idx];
  if (draft) {
    postTitle.value = draft.title;
    postBody.value = draft.body;
    updateLinkedInPreview();
  }
};

window.deleteDraft = (idx) => {
  const drafts = JSON.parse(localStorage.getItem('local_posts') || '[]');
  drafts.splice(idx, 1);
  localStorage.setItem('local_posts', JSON.stringify(drafts));
  loadDrafts();
};

btnSavePost.addEventListener('click', () => {
  const title = postTitle.value.trim();
  const body = postBody.value.trim();
  if (!title || !body) {
    alert('Por favor rellena el título y el cuerpo del post.');
    return;
  }
  
  const drafts = JSON.parse(localStorage.getItem('local_posts') || '[]');
  drafts.push({ title, body, date: new Date().toISOString() });
  localStorage.setItem('local_posts', JSON.stringify(drafts));
  
  postTitle.value = '';
  postBody.value = '';
  updateLinkedInPreview();
  loadDrafts();
});

btnLoadIdeas.addEventListener('click', () => {
  postTitle.value = '💡 El costo oculto del Silent Agent Failure';
  postBody.value = `¿Está tu enjambre de agentes de IA gastando miles de dólares sin que te enteres? 💸
 
La mayoría de las empresas que implementan agentes autónomos sufren de "Silent Agent Failure":
1. El agente entra en bucle infinito de cobro de APIs.
2. Continúa operando con respuestas nulas o repetitivas.
3. El sistema convencional no detecta que el enjambre se descarrió.
 
Para resolver esto, he estado desarrollando el Antigravity Monitor:
"El Datadog para enjambres de agentes". Reconstruye en tiempo real el árbol de llamadas, filtra credenciales sensibles y detecta anomalías al instante. 
 
Y si algo sale mal, Orbit te permite intervenir desde tu smartphone con firmas digitales protegidas por criptografía poscuántica (ML-DSA).
 
¿Estás controlando la seguridad de tus agentes? Conectemos en Calendly: https://calendly.com/wilfredo-caro/swarm-safety #AIAgents #Web3 #Security`;
  updateLinkedInPreview();
});

// Tab 3: Prompts IA Generator
const styleSel = document.getElementById('prompt-style');
const cameraSel = document.getElementById('prompt-camera');
const attireSel = document.getElementById('prompt-attire');
const lightSel = document.getElementById('prompt-lighting');
const formatSel = document.getElementById('prompt-format');
const btnGeneratePrompt = document.getElementById('btn-generate-prompt');
const promptOutput = document.getElementById('prompt-output-box');
const btnCopy = document.getElementById('btn-copy-prompt');

btnGeneratePrompt.addEventListener('click', () => {
  const style = styleSel.value;
  const camera = cameraSel.value;
  const attire = attireSel.value;
  const light = lightSel.value;
  const format = formatSel.value;
  
  let baseText = "High-end corporate portrait of Wilfredo Caro, AI Systems Architect.";
  
  if (style === 'cyberpunk') {
    baseText += " Cyberpunk elegance style, sophisticated and minimalist. Cybernetic metropolis background at night, rainy window reflections.";
  } else if (style === 'studio') {
    baseText += " Professional studio portrait. Minimalist aesthetic, clean soft light gray background. Sharp focus, subtle shadows, cinematic contrast. Moody but professional.";
  } else {
    baseText += " Inside his futuristic command center workspace. Sleek dark gray interior with glowing holographic screens showing data visualization of AI agent swarms and quantum cryptographic lattices. Large floor-to-ceiling window overlooking a futuristic clean-tech metropolis. Modern, ultra-premium desk design.";
  }
  
  if (attire === 'suit') {
    baseText += " Dressed in a tailored matte black high-tech suit with subtle LED piping.";
  } else if (attire === 'turtleneck') {
    baseText += " Wearing a sophisticated charcoal gray merino wool turtleneck.";
  } else {
    baseText += " Wearing a premium matte black cyber-tech bomber jacket.";
  }

  if (camera === '85mm') {
    baseText += " Shot on 85mm lens, f/1.8, cinematic lighting, photorealistic, high fashion magazine cover style.";
  } else if (camera === '35mm') {
    baseText += " Shot on 35mm Hasselblad camera, medium format detail, superb clarity, analytical focus.";
  } else {
    baseText += " Shot on 50mm Leica Noctilux, natural light integration, hyper-detailed skin texture, realistic reflection.";
  }

  let lightText = '';
  if (light === 'electric') {
    lightText = " Electric cian and cobalt blue accents, dynamic glowing highlights.";
  } else if (light === 'dark') {
    lightText = " Dark dramatic chiaroscuro lighting, corporate warm tones and professional studio shadows.";
  } else {
    lightText = " Indigo neon and subtle aqua backlight, tech-themed software dashboard ambiance.";
  }
  
  const promptResult = `${baseText}${lightText} --ar ${format} --style raw --v 6.0`;
  promptOutput.textContent = promptResult;
});

btnCopy.addEventListener('click', () => {
  const text = promptOutput.textContent;
  if (text.includes('presiona')) return;
  navigator.clipboard.writeText(text).then(() => {
    alert('Prompt copiado al portapapeles.');
  });
});

// Tab 4: Swarm Simulator
const simBudgetSlider = document.getElementById('sim-budget');
const simAgentsSlider = document.getElementById('sim-agents');
const valBudget = document.getElementById('val-budget');
const valAgents = document.getElementById('val-agents');
const btnStartSim = document.getElementById('btn-start-simulation');
const terminalLog = document.getElementById('terminal-log');

const resLeads = document.getElementById('result-leads');
const resRoi = document.getElementById('result-roi');

simBudgetSlider.addEventListener('input', () => {
  valBudget.textContent = `$${simBudgetSlider.value} USD`;
});

simAgentsSlider.addEventListener('input', () => {
  valAgents.textContent = `${simAgentsSlider.value} Agentes`;
  drawSwarmGraph(parseInt(simAgentsSlider.value));
});

// SVG Node Swarm Visualizer Graph with PQC animated pathways
const drawSwarmGraph = (numAgents) => {
  const svg = document.getElementById('swarm-svg');
  if (!svg) return;
  svg.innerHTML = '';
  
  // Glow filters definition
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="glow-cobalt" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  `;
  svg.appendChild(defs);
  
  const width = svg.clientWidth || 400;
  const height = svg.clientHeight || 250;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const supervisor = { x: centerX, y: centerY, label: 'Supervisor (Orbit)', type: 'supervisor' };
  const nodes = [supervisor];
  const count = numAgents - 1;
  const radius = Math.min(width, height) * 0.35;
  
  const agentRoles = [
    'Seguridad Crypt',
    'Copywriter IA',
    'Ad Optimizer',
    'Lead Qualifier',
    'Market Intelligence',
    'Multilingual SEO',
    'Scheduler Agent',
    'Gobernanza/PII',
    'ROI Tracker'
  ];
  
  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const role = agentRoles[i % agentRoles.length];
    nodes.push({
      id: i + 1,
      x,
      y,
      label: role,
      type: 'agent'
    });
  }
  
  // Render connection paths and pulse dots
  for (let i = 1; i < nodes.length; i++) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    path.setAttribute('x1', supervisor.x);
    path.setAttribute('y1', supervisor.y);
    path.setAttribute('x2', nodes[i].x);
    path.setAttribute('y2', nodes[i].y);
    path.setAttribute('stroke', '#1e293b');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('id', `link-agent-${nodes[i].id}`);
    svg.appendChild(path);
    
    // Create a pulse dot for the connection representing ML-KEM/ML-DSA transitions
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', supervisor.x);
    dot.setAttribute('cy', supervisor.y);
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', 'transparent'); // hidden by default
    dot.setAttribute('id', `pulse-dot-agent-${nodes[i].id}`);
    
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
    animate.setAttribute('dur', '0.8s');
    animate.setAttribute('repeatCount', 'indefinite');
    animate.setAttribute('path', `M ${supervisor.x} ${supervisor.y} L ${nodes[i].x} ${nodes[i].y}`);
    animate.setAttribute('fill', 'freeze');
    animate.setAttribute('begin', 'indefinite');
    animate.setAttribute('id', `animate-dot-agent-${nodes[i].id}`);
    
    dot.appendChild(animate);
    svg.appendChild(dot);
  }
  
  // Render nodes
  nodes.forEach(node => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `node-group ${node.type}`);
    g.setAttribute('id', node.type === 'supervisor' ? 'node-supervisor' : `node-agent-${node.id}`);
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', node.type === 'supervisor' ? '12' : '8');
    circle.setAttribute('fill', node.type === 'supervisor' ? '#2563eb' : '#0e1013');
    circle.setAttribute('stroke', node.type === 'supervisor' ? '#00f5ff' : '#64748b');
    circle.setAttribute('stroke-width', '2');
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y + (node.type === 'supervisor' ? 24 : 18));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#cbd5e1');
    text.setAttribute('font-size', node.type === 'supervisor' ? '10px' : '8px');
    text.setAttribute('font-family', "'Fira Code', monospace");
    text.textContent = node.type === 'supervisor' ? 'Supervisor' : node.label;
    
    g.appendChild(circle);
    g.appendChild(text);
    svg.appendChild(g);
  });
};

window.addEventListener('resize', () => drawSwarmGraph(parseInt(simAgentsSlider.value)));

let simInterval = null;

btnStartSim.addEventListener('click', () => {
  if (simInterval) clearInterval(simInterval);
  
  // Reset UI elements
  terminalLog.innerHTML = '';
  resLeads.textContent = '-';
  resRoi.textContent = '-';
  
  // Reset Node Graph styling
  document.querySelectorAll('.node-group').forEach(el => {
    el.classList.remove('node-active', 'node-supervisor-active', 'node-warn', 'node-success', 'node-kem-active', 'node-dsa-active');
  });
  document.querySelectorAll('line').forEach(el => {
    el.classList.remove('line-active', 'line-kem-active', 'line-dsa-active');
  });
  
  // Stop all active dot animations first
  document.querySelectorAll('circle[id^="pulse-dot-"]').forEach(dot => {
    dot.setAttribute('fill', 'transparent');
    const anim = dot.querySelector('animateMotion');
    if (anim) {
      try { anim.endElement(); } catch(e) {}
    }
  });
  
  const budget = parseFloat(simBudgetSlider.value);
  const agents = parseInt(simAgentsSlider.value);
  
  // FIX: Correct CSS selector for niche input radio
  const nicheInput = document.querySelector('input[name="niche"]:checked');
  const niche = nicheInput ? nicheInput.value : 'b2b';
  
  let step = 0;
  const logs = [
    { text: `[SISTEMA] Inicializando enjambre de ${agents} agentes en VirtuadsAi Core...`, activeNode: 'supervisor', type: 'info', state: 'normal' },
    { text: `[ML-KEM-768] Generando clave efímera Kyber-768 en Supervisor. Solicitando encapsulamiento...`, activeNode: 'agent-1', type: 'info', state: 'kem' },
    { text: `[ML-KEM-768] Desencapsulamiento de secreto compartido establecido de forma segura con Nodo 1.`, activeNode: 'agent-1', type: 'success', state: 'kem' },
    { text: `[CONEXIÓN] Orbit conectado. Canal seguro poscuántico establecido exitosamente.`, activeNode: 'supervisor', type: 'info', state: 'normal' },
    { text: `[ML-DSA-65] Creando firma digital Dilithium-65 en Supervisor para autorizar tareas de pauta...`, activeNode: 'supervisor', type: 'info', state: 'dsa' },
    { text: `[ML-DSA-65] Firma de contingencia validada en Agente_Copywriter (Nodo 2) -> Estado: VÁLIDO.`, activeNode: 'agent-2', type: 'success', state: 'dsa' },
    { text: `[AGENTE_ADS] Optimizando palabras clave de campaña para el nicho seleccionado...`, activeNode: 'agent-3', type: 'info', state: 'normal' },
    { text: `[SEGURIDAD] PII Redaction activo: Filtro interceptor bloqueó 2 claves de API expuestas en logs.`, activeNode: 'agent-1', type: 'success', state: 'normal' },
    { text: `[MONITOR] Advertencia: Alta latencia en Agente 3. Antigravity Monitor aplicando contingencia.`, activeNode: 'agent-3', type: 'warn', state: 'normal' },
    { text: `[COMPLETO] Simulación finalizada. Registros firmados digitalmente (ML-DSA-65) and securizados (ML-KEM-768).`, activeNode: 'all', type: 'success', state: 'normal' }
  ];

  const addTerminalLine = (text, type = 'info') => {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    terminalLog.appendChild(line);
    terminalLog.scrollTop = terminalLog.scrollHeight;
  };

  btnStartSim.disabled = true;
  btnStartSim.textContent = 'Simulando...';

  simInterval = setInterval(() => {
    if (step < logs.length) {
      const currentLog = logs[step];
      addTerminalLine(currentLog.text, currentLog.type);
      
      // Animate the visual SVG graph
      document.querySelectorAll('.node-group').forEach(el => {
        el.classList.remove('node-active', 'node-supervisor-active', 'node-warn', 'node-kem-active', 'node-dsa-active');
      });
      document.querySelectorAll('line').forEach(el => {
        el.classList.remove('line-active', 'line-kem-active', 'line-dsa-active');
      });
      
      // Stop all active dot animations first
      document.querySelectorAll('circle[id^="pulse-dot-"]').forEach(dot => {
        dot.setAttribute('fill', 'transparent');
        const anim = dot.querySelector('animateMotion');
        if (anim) {
          try { anim.endElement(); } catch(e) {}
        }
      });
      
      if (currentLog.activeNode === 'supervisor') {
        const superEl = document.getElementById('node-supervisor');
        if (superEl) {
          superEl.classList.add('node-supervisor-active');
          if (currentLog.state === 'dsa') {
            superEl.classList.add('node-dsa-active');
          }
        }
      } else if (currentLog.activeNode === 'all') {
        document.querySelectorAll('.node-group').forEach(el => {
          el.classList.add('node-success');
        });
      } else {
        const nodeEl = document.getElementById(`node-${currentLog.activeNode}`);
        const linkEl = document.getElementById(`link-${currentLog.activeNode}`);
        const superEl = document.getElementById('node-supervisor');
        
        if (superEl) superEl.classList.add('node-supervisor-active');
        
        if (nodeEl) {
          if (currentLog.type === 'warn') {
            nodeEl.classList.add('node-warn');
          } else if (currentLog.state === 'kem') {
            nodeEl.classList.add('node-kem-active');
          } else if (currentLog.state === 'dsa') {
            nodeEl.classList.add('node-dsa-active');
          } else {
            nodeEl.classList.add('node-active');
          }
        }
        
        if (linkEl) {
          if (currentLog.state === 'kem') {
            linkEl.classList.add('line-kem-active');
          } else if (currentLog.state === 'dsa') {
            linkEl.classList.add('line-dsa-active');
          } else {
            linkEl.classList.add('line-active');
          }
        }
        
        // Activate the SVG pulse dot
        if (currentLog.activeNode !== 'supervisor' && currentLog.activeNode !== 'all') {
          const dot = document.getElementById(`pulse-dot-${currentLog.activeNode}`);
          if (dot) {
            if (currentLog.state === 'kem') {
              dot.setAttribute('fill', '#00f5ff'); // cyan for ML-KEM
            } else if (currentLog.state === 'dsa') {
              dot.setAttribute('fill', '#ff007f'); // magenta for ML-DSA
            } else {
              dot.setAttribute('fill', 'rgba(255, 255, 255, 0.5)'); // fallback
            }
            const anim = document.getElementById(`animate-dot-${currentLog.activeNode}`);
            if (anim) {
              try { anim.beginElement(); } catch(e) {}
            }
          }
        }
      }
      
      step++;
    } else {
      clearInterval(simInterval);
      btnStartSim.disabled = false;
      btnStartSim.textContent = '⚡ Iniciar Ejecución del Enjambre';
      
      // Calculate Estimated Leads & ROI
      const factor = niche === 'b2b' ? 1.4 : 2.1;
      const leadsCalculated = Math.round((budget / 100) * agents * factor);
      const roiCalculated = Math.round(140 + (agents * 12) + (budget / 60));
      
      resLeads.textContent = leadsCalculated.toLocaleString();
      resRoi.textContent = `${roiCalculated}%`;
      
      addTerminalLine(`[ÉXITO] ROI Estimado final: ${roiCalculated}%. Leads esperados: ${leadsCalculated}/mes.`, 'success');
      
      document.querySelectorAll('.node-group').forEach(el => {
        el.classList.remove('node-active', 'node-supervisor-active', 'node-warn', 'node-kem-active', 'node-dsa-active');
        el.classList.add('node-success');
      });
    }
  }, 950);
});

// Initial load configurations
loadCrmData();
loadDrafts();
drawSwarmGraph(5);
