const data = {
    es: {
        headline: "CEO en VirtuadsAi | CTO en Orbit | Ex-Brave Software | Arquitecto Deep Tech, Web3 & IA | Resolviendo la fricción financiera en publicidad virtual",
        about: `El futuro digital no se predice: se diseña mediante arquitectura robusta y visión de negocio.

Soy Wilfredo Caro, estratega tecnológico y desarrollador enfocado en la intersección de Deep Tech, Web3 e Inteligencia Artificial. Con un perfil híbrido que une la dirección ejecutiva y el desarrollo de código nativo, me especializo en construir soluciones que resuelven fricciones reales de mercado.

Mi enfoque actual se divide en dos grandes hitos de liderazgo:

🚀 Como CEO en VirtuadsAi, lidero la visión estratégica para transformar el marketing digital en la Web3, desarrollando integraciones de Blockchain e IA para eliminar la fricción financiera que impide a las marcas globales pautar en mundos virtuales.

☁️ Como CTO en Orbit, dirijo la arquitectura técnica de una interfaz móvil y segura para entornos de desarrollo en la nube (CDEs), redefiniendo la eficiencia de los flujos de trabajo de desarrollo móvil.

Hitos de Autoridad:
• Brave Software (Regional Leader & Latam Staff): Impulsé la adopción de Web3 y la privacidad digital en América Latina. Participación estratégica en eventos masivos de la industria como Labitconf (Argentina) y Talent Land (México).
• ExEquine (Blockchain Architect): Creación e implementación de un registro descentralizado en blockchain para dotar de identidad digital única y trazabilidad a equinos.
• Anti-Observer (Founder-CTO): Diseño de extensiones de monitoreo descentralizado y control de misión para agentes de IA autónomos.

Tecnologías & Skills Clave:
• Arquitectura Blockchain: Solidity, Smart Contracts, Web3 Integrations.
• Lenguajes & Infraestructura: Python, JavaScript, C++, Rust, Node.js, Docker, Azure Cloud.
• Negocios & Liderazgo: Estratega B2B, Relaciones Regionales Latam, Gestión de Proyectos de TI.

¿Quieres automatizar flujos con IA, implementar infraestructura Web3 o conversar sobre el futuro de los entornos de nube? Conectemos.

📧 Correo: wilfredwfd86@gmail.com`,
        exp: [
            {
                company: "VirtuadsAi",
                title: "Fundador y CEO",
                desc: "Liderando la visión estratégica para transformar negocios digitales en Web3 mediante IA y Blockchain. Foco en eliminar la fricción financiera en publicidad virtual."
            },
            {
                company: "Orbit",
                title: "CTO (Director de Tecnología)",
                desc: "Dirigiendo el desarrollo de una interfaz segura y enfocada en móviles para entornos de desarrollo en la nube, redefiniendo flujos de trabajo móviles."
            },
            {
                company: "Brave Software",
                title: "Líder Regional y Staff Latam",
                desc: "Fomenté la adopción de Web3 y privacidad en Latam. Staff en eventos como Labitconf (Argentina) y Talent Land (México)."
            }
        ]
    },
    en: {
        headline: "CEO at VirtuadsAi | CTO at Orbit | Ex-Brave Software | Deep Tech, Web3 & AI Architect | Solving financial friction in virtual advertising",
        about: `The digital future is not predicted: it is designed through robust architecture and business vision.

I am Wilfredo Caro, a technological strategist and developer focused on the intersection of Deep Tech, Web3, and Artificial Intelligence. With a hybrid profile that bridges executive leadership and native code development, I specialize in building solutions that solve real market friction.

My current focus is divided into two major leadership milestones:

🚀 As CEO at VirtuadsAi, I lead the strategic vision to transform digital marketing in Web3, developing Blockchain and AI integrations to eliminate the financial friction that prevents global brands from advertising in virtual worlds.

☁️ As CTO at Orbit, I direct the technical architecture of a secure, mobile-first interface for cloud development environments (CDEs), redefining the efficiency of mobile development workflows.

Authority Milestones:
• Brave Software (Regional Leader & Latam Staff): Promoted Web3 adoption and digital privacy across Latin America. Strategic event staff for major industry events like Labitconf (Argentina) and Talent Land (Mexico).
• ExEquine (Blockchain Architect): Developed a decentralized registry using blockchain to provide unique digital identity and traceability for horses.
• Anti-Observer (Founder-CTO): Designed decentralized monitoring and mission control extensions for autonomous AI agents.

Key Technologies & Skills:
• Blockchain Architecture: Solidity, Smart Contracts, Web3 Integrations.
• Languages & Infrastructure: Python, JavaScript, C++, Rust, Node.js, Docker, Azure Cloud.
• Business & Leadership: B2B Strategist, Latam Regional Relations, IT Project Management.

Do you want to automate workflows with AI, implement Web3 infrastructure, or talk about the future of cloud environments? Let's connect.

📧 Email: wilfredwfd86@gmail.com`,
        exp: [
            {
                company: "VirtuadsAi",
                title: "Founder & CEO",
                desc: "Leading the strategic vision to transform digital business in Web3 through AI and Blockchain. Focus on eliminating financial friction in virtual advertising."
            },
            {
                company: "Orbit",
                title: "CTO (Chief Technology Officer)",
                desc: "Directing the development of a secure, mobile-first interface for cloud development environments, redefining mobile dev workflows."
            },
            {
                company: "Brave Software",
                title: "Regional Leader & Latam Staff",
                desc: "Promoted Web3 adoption and privacy across Latin America. Event staff for major regional events like Labitconf (Argentina) and Talent Land (Mexico)."
            }
        ]
    }
};

let currentLang = 'es';

window.switchLang = (lang) => {
    currentLang = lang;
    document.getElementById('btn-es').className = lang === 'es' ? 'tab-btn active' : 'tab-btn';
    document.getElementById('btn-en').className = lang === 'en' ? 'tab-btn active' : 'tab-btn';
    render();
};

window.copyText = (text, btnId) => {
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById(btnId);
        const originalText = btn.textContent;
        btn.textContent = "¡Copiado! ✓";
        btn.style.background = "var(--accent)";
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = "var(--surface)";
        }, 1500);
    });
};

function render() {
    const lData = data[currentLang];
    let html = '';

    // Headline
    html += `
        <div class="card">
            <div class="card-header">
                <span class="card-title">1. Titular / Headline</span>
                <button class="copy-btn" id="copy-hl" onclick="copyText(\`${lData.headline.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, 'copy-hl')">Copiar Titular</button>
            </div>
            <div class="text-box">${lData.headline}</div>
        </div>
    `;

    // About
    html += `
        <div class="card">
            <div class="card-header">
                <span class="card-title">2. Acerca de / About</span>
                <button class="copy-btn" id="copy-ab" onclick="copyText(\`${lData.about.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, 'copy-ab')">Copiar Extracto</button>
            </div>
            <div class="text-box">${lData.about}</div>
        </div>
    `;

    // Experiences
    html += '<div style="margin-top: 30px; font-weight: bold; margin-bottom: 12px; color: var(--text-muted)">3. Experiencias / Positions</div>';
    lData.exp.forEach((item, index) => {
        html += `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">${item.company}</span>
                    <span style="font-size: 12px; color: var(--text-muted)">Posición ${index + 1}</span>
                </div>
                <div style="margin-bottom: 12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: var(--text-muted)">Cargo / Title</span>
                        <button class="copy-btn" style="padding: 2px 8px; font-size: 11px;" id="copy-title-${index}" onclick="copyText(\`${item.title.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, 'copy-title-${index}')">Copiar</button>
                    </div>
                    <div class="text-box" style="font-size: 13px; padding: 8px;">${item.title}</div>
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: var(--text-muted)">Descripción / Description</span>
                        <button class="copy-btn" style="padding: 2px 8px; font-size: 11px;" id="copy-desc-${index}" onclick="copyText(\`${item.desc.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, 'copy-desc-${index}')">Copiar</button>
                    </div>
                    <div class="text-box" style="font-size: 13px; padding: 8px;">${item.desc}</div>
                </div>
            </div>
        `;
    });

    // Skills
    const skills = ["Artificial Intelligence", "Web3 & Blockchain Architecture", "Python", "Solidity", "C++", "Rust", "JavaScript", "Node.js", "Docker", "Azure Cloud", "Business Strategy", "Event Management"];
    const skillsList = skills.join(', ');
    html += `
        <div class="card">
            <div class="card-header">
                <span class="card-title">4. Aptitudes / Skills</span>
                <button class="copy-btn" id="copy-sk" onclick="copyText(\`${skillsList}\`, 'copy-sk')">Copiar Lista de Aptitudes</button>
            </div>
            <div class="text-box" style="font-size: 13px; padding: 8px;">${skills.map(s => `<span style="display: inline-block; background: var(--surface); padding: 4px 8px; border-radius: 12px; margin: 4px; font-size: 12px;">${s}</span>`).join('')}</div>
        </div>
    `;

    document.getElementById('content').innerHTML = html;
}

// Initial render
render();
