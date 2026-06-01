import json
import os

def load_translations():
    with open('translations.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_markdown(trans):
    en = trans['en']
    es = trans['es']
    
    md_content = f"""# LinkedIn Profile Updates - Wilfredo Caro

This guide contains the updated texts for your LinkedIn profile in both English and Spanish, sourced from your portfolio website.

---

## 1. Headline / Titular
Use this to describe your current roles and expertise.

**English:**
```text
CEO at VirtuadsAi | CTO at Orbit | Deep Tech & AI Innovator | Web3 & Blockchain Strategist
```

**Spanish:**
```text
CEO en VirtuadsAi | CTO en Orbit | Innovador en IA, Web3 y Blockchain | Estratega Deep Tech
```

---

## 2. About / Extracto
A summary of your background, current leadership, and tech expertise.

**English:**
```text
At VirtuadsAi, I lead the strategic vision as CEO, focusing on innovative blockchain-based solutions to transform digital businesses in Web3. Currently, I also serve as CTO at Orbit, directing the development of a secure, mobile-first interface for cloud development environments. 

My role involves collaborating with multidisciplinary teams to develop technological strategies that prioritize privacy, decentralization, AI usage, and efficiency. My experience as a Brand Representative at Brave Software has allowed me to interact with communities in Latin America, promoting the adoption of disruptive technologies. 

I complement my career with studies in data analysis and web development to create robust platforms.
```

**Spanish:**
```text
En VirtuadsAi, lidero la visión estratégica como CEO, enfocándome en soluciones innovadoras basadas en blockchain para transformar negocios digitales de la Web3. Actualmente, también me desempeño como CTO en Orbit, dirigiendo el desarrollo de una interfaz segura y enfocada en móviles para entornos de desarrollo en la nube.

Mi rol incluye colaborar con equipos multidisciplinarios para desarrollar estrategias tecnológicas que priorizan privacidad, descentralización, uso de IA y su eficiencia. Mi experiencia como Representante de Marca en Brave Software me ha permitido interactuar con comunidades en América Latina, promoviendo la adopción de tecnologías disruptivas. 

Complemento mi trayectoria con estudios en análisis de datos y desarrollo web para crear plataformas robustas.
```

---

## 3. Experience / Experiencia

### Position 1: VirtuadsAi (CEO & Founder)

- **Title / Cargo (EN):** Founder & CEO
- **Title / Cargo (ES):** Fundador y CEO
- **Company / Empresa:** VirtuadsAi
- **Description / Descripción (EN):**
```text
Leading the strategic vision to transform digital business in Web3 through AI and Blockchain. Focus on eliminating financial friction in virtual advertising.
```
- **Description / Descripción (ES):**
```text
Liderando la visión estratégica para transformar negocios digitales en Web3 mediante IA y Blockchain. Foco en eliminar la fricción financiera en publicidad virtual.
```

### Position 2: Orbit (CTO)

- **Title / Cargo (EN):** CTO (Chief Technology Officer)
- **Title / Cargo (ES):** CTO (Director de Tecnología)
- **Company / Empresa:** Orbit
- **Description / Descripción (EN):**
```text
Directing the development of a secure, mobile-first interface for cloud development environments, redefining mobile dev workflows.
```
- **Description / Descripción (ES):**
```text
Dirigiendo el desarrollo de una interfaz segura y enfocada en móviles para entornos de desarrollo en la nube, redefiniendo flujos de trabajo móviles.
```

### Position 3: ExEquine (Fullstack & Blockchain Architect)

- **Title / Cargo (EN):** Fullstack & Blockchain Architect
- **Title / Cargo (ES):** Arquitecto Fullstack y Blockchain
- **Company / Empresa:** ExEquine
- **Description / Descripción (EN):**
```text
Developed a decentralized registry using blockchain to provide unique digital identities for horses.
```
- **Description / Descripción (ES):**
```text
Desarrollo de un registro descentralizado usando blockchain para proveer identidad digital única a caballos.
```

### Position 4: CornerMarket (Business Development Associate)

- **Title / Cargo (EN):** Business Development Associate (BDA)
- **Title / Cargo (ES):** Representante de Desarrollo de Negocios
- **Company / Empresa:** CornerMarket
- **Description / Descripción (EN):**
```text
Drove business growth and strategic alliances to expand the platform in the Colombian market.
```
- **Description / Descripción (ES):**
```text
Impulsé el crecimiento empresarial y alianzas estratégicas para expandir la plataforma en el mercado colombiano.
```

### Position 5: Brave Software (Regional Leader & Latam Staff)

- **Title / Cargo (EN):** Regional Leader & Latam Staff
- **Title / Cargo (ES):** Líder Regional y Staff Latam
- **Company / Empresa:** Brave Software
- **Description / Descripción (EN):**
```text
Promoted Web3 adoption and privacy across Latin America. Event staff for major regional events like Labitconf (Argentina) and Talent Land (Mexico).
```
- **Description / Descripción (ES):**
```text
Fomenté la adopción de Web3 y privacidad en Latam. Staff en eventos como Labitconf (Argentina) y Talent Land (México).
```

---

## 4. Skills / Aptitudes
Add these updated core skills:
- Artificial Intelligence (Inteligencia Artificial)
- Web3 & Blockchain Architecture
- Python / Solidity / C++ / Rust / JavaScript / Node.js
- Cloud Development Environments
- Business Strategy & Development
- Event Management
- Docker & Azure Cloud
"""
    with open('linkedin_updates.md', 'w', encoding='utf-8') as f:
        f.write(md_content)
    print("Generated linkedin_updates.md")

def generate_interactive_script():
    script_content = """# -*- coding: utf-8 -*-
import os
import sys
import json
import time

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Playwright is not installed. Installing playwright...")
    os.system("pip install playwright")
    os.system("playwright install chromium")
    from playwright.sync_api import sync_playwright

def load_data():
    with open('translations.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def run():
    print("=" * 60)
    print("     LINKEDIN PROFILE UPDATE HELPER BY ANTIGRAVITY")
    print("=" * 60)
    print("This tool will launch Chrome and inject a helper sidebar")
    print("on LinkedIn containing all your updated texts so you can")
    print("easily copy and paste them into the LinkedIn profile fields.")
    print("This method is 100% safe and complies with LinkedIn's policies.")
    print("=" * 60)
    
    data = load_data()
    
    with sync_playwright() as p:
        # Launch Chromium with custom settings
        print("Launching browser. Please log in to LinkedIn if you are not already logged in...")
        
        # Use a local session path to persist LinkedIn login
        user_data_dir = os.path.abspath("./linkedin_session")
        context = p.chromium.launch_persistent_context(
            user_data_dir,
            headless=False,
            viewport=None,
            args=["--start-maximized"]
        )
        
        page = context.new_page() if len(context.pages) == 0 else context.pages[0]
        
        # Navigate to LinkedIn profile page
        page.goto("https://www.linkedin.com/in/wilfredo-caro/")
        
        print("\\n[Action Required]:")
        print("1. Log in to LinkedIn in the browser if prompted.")
        print("2. Navigate to your Profile edit page.")
        print("3. Once the page is loaded, the script will automatically inject the helper sidebar.")
        
        # Wait until user is logged in and on profile page (look for profile identifiers)
        # We inject the sidebar when the page has finished loading or user presses Enter
        print("\\nPress Enter in this console once you are logged in and looking at your profile...")
        input()
        
        # Construct the sidebar HTML and JS script
        sidebar_html = f'''
        <div id="antigravity-sidebar" style="
            position: fixed;
            top: 0;
            right: 0;
            width: 420px;
            height: 100vh;
            background: #121214;
            color: #e4e4e7;
            border-left: 2px solid #27272a;
            z-index: 999999;
            box-shadow: -5px 0 25px rgba(0,0,0,0.5);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-size: 14px;
        ">
            <div style="
                background: linear-gradient(135deg, #1e8449 0%, #115e33 100%);
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid #27272a;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">🤖</span>
                    <div>
                        <h3 style="margin: 0; font-size: 15px; font-weight: bold; color: white;">LinkedIn Helper</h3>
                        <span style="font-size: 11px; color: #a7f3d0;">Wilfredo Caro Profile Updates</span>
                    </div>
                </div>
                <button onclick="document.getElementById('antigravity-sidebar').remove()" style="
                    background: transparent;
                    border: none;
                    color: #a1a1aa;
                    font-size: 20px;
                    cursor: pointer;
                ">&times;</button>
            </div>
            
            <div style="
                display: flex;
                border-bottom: 1px solid #27272a;
                background: #18181b;
            ">
                <button onclick="switchTab('es')" id="tab-es" style="
                    flex: 1;
                    padding: 10px;
                    background: #27272a;
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-weight: bold;
                ">Español (ES)</button>
                <button onclick="switchTab('en')" id="tab-en" style="
                    flex: 1;
                    padding: 10px;
                    background: transparent;
                    color: #a1a1aa;
                    border: none;
                    cursor: pointer;
                ">English (EN)</button>
            </div>

            <div id="sidebar-content" style="
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 20px;
            ">
                <!-- Content will be populated by JS -->
            </div>
            
            <div style="
                padding: 12px;
                background: #18181b;
                border-top: 1px solid #27272a;
                font-size: 11px;
                text-align: center;
                color: #71717a;
            ">
                Empowered by Antigravity AI
            </div>
        </div>
        '''
        
        # We define a function inside browser context to populate the text
        data_json = json.dumps(data)
        
        js_injection = f'''
        (() => {{
            if (document.getElementById('antigravity-sidebar')) {{
                document.getElementById('antigravity-sidebar').remove();
            }}
            
            // Adjust LinkedIn main page styling to shift left and make room
            document.body.style.marginRight = "420px";
            
            // Insert Sidebar
            const div = document.createElement('div');
            div.innerHTML = `{sidebar_html}`;
            document.body.appendChild(div.firstElementChild);
            
            // Set translations data
            window.profileData = {data_json};
            window.activeLang = 'es';
            
            window.copyToClipboard = (text, btnId) => {{
                navigator.clipboard.writeText(text).then(() => {{
                    const btn = document.getElementById(btnId);
                    const origText = btn.textContent;
                    btn.textContent = "Copied! ✓";
                    btn.style.background = "#059669";
                    setTimeout(() => {{
                        btn.textContent = origText;
                        btn.style.background = "#27272a";
                    }}, 1500);
                }});
            }};
            
            window.switchTab = (lang) => {{
                window.activeLang = lang;
                document.getElementById('tab-es').style.background = lang === 'es' ? '#27272a' : 'transparent';
                document.getElementById('tab-es').style.color = lang === 'es' ? 'white' : '#a1a1aa';
                document.getElementById('tab-es').style.fontWeight = lang === 'es' ? 'bold' : 'normal';
                
                document.getElementById('tab-en').style.background = lang === 'en' ? '#27272a' : 'transparent';
                document.getElementById('tab-en').style.color = lang === 'en' ? 'white' : '#a1a1aa';
                document.getElementById('tab-en').style.fontWeight = lang === 'en' ? 'bold' : 'normal';
                
                renderContent();
            }};
            
            window.renderContent = () => {{
                const contentDiv = document.getElementById('sidebar-content');
                const lang = window.activeLang;
                
                const isEs = lang === 'es';
                
                const headline = isEs 
                    ? "CEO en VirtuadsAi | CTO en Orbit | Innovador en IA, Web3 y Blockchain | Estratega Deep Tech"
                    : "CEO at VirtuadsAi | CTO at Orbit | Deep Tech & AI Innovator | Web3 & Blockchain Strategist";
                    
                const aboutText = isEs
                    ? "En VirtuadsAi, lidero la visión estratégica como CEO, enfocándome en soluciones innovadoras basadas en blockchain para transformar negocios digitales de la Web3. Actualmente, también me desempeño como CTO en Orbit, dirigiendo el desarrollo de una interfaz segura y enfocada en móviles para entornos de desarrollo en la nube.\\n\\nMi rol incluye colaborar con equipos multidisciplinarios para desarrollar estrategias tecnológicas que priorizan privacidad, descentralización, uso de IA y su eficiencia. Mi experiencia como Representante de Marca en Brave Software me ha permitido interactuar con comunidades en América Latina, promoviendo la adopción de tecnologías disruptivas.\\n\\nComplemento mi trayectoria con estudios en análisis de datos y desarrollo web para crear plataformas robustas."
                    : "At VirtuadsAi, I lead the strategic vision as CEO, focusing on innovative blockchain-based solutions to transform digital businesses in Web3. Currently, I also serve as CTO at Orbit, directing the development of a secure, mobile-first interface for cloud development environments.\\n\\nMy role involves collaborating with multidisciplinary teams to develop technological strategies that prioritize privacy, decentralization, AI usage, and efficiency. My experience as a Brand Representative at Brave Software has allowed me to interact with communities in Latin America, promoting the adoption of disruptive technologies.\\n\\nI complement my career with studies in data analysis and web development to create robust platforms.";
                
                const expList = [
                    {{
                        company: "VirtuadsAi",
                        title: isEs ? "Fundador y CEO" : "Founder & CEO",
                        desc: isEs ? "Liderando la visión estratégica para transformar negocios digitales en Web3 mediante IA y Blockchain. Foco en eliminar la fricción financiera en publicidad virtual." : "Leading the strategic vision to transform digital business in Web3 through AI and Blockchain. Focus on eliminating financial friction in virtual advertising."
                    }},
                    {{
                        company: "Orbit",
                        title: isEs ? "CTO (Director de Tecnología)" : "CTO (Chief Technology Officer)",
                        desc: isEs ? "Dirigiendo el desarrollo de una interfaz segura y enfocada en móviles para entornos de desarrollo en la nube, redefiniendo flujos de trabajo móviles." : "Directing the development of a secure, mobile-first interface for cloud development environments, redefining mobile dev workflows."
                    }},
                    {{
                        company: "ExEquine",
                        title: isEs ? "Arquitecto Fullstack y Blockchain" : "Fullstack & Blockchain Architect",
                        desc: isEs ? "Desarrollo de un registro descentralizado usando blockchain para proveer identidad digital única a caballos." : "Developed a decentralized registry using blockchain to provide unique digital identities for horses."
                    }},
                    {{
                        company: "CornerMarket",
                        title: isEs ? "Representante de Desarrollo de Negocios (BDA)" : "Business Development Associate (BDA)",
                        desc: isEs ? "Impulsé el crecimiento empresarial y alianzas estratégicas para expandir la plataforma en el mercado colombiano." : "Drove business growth and strategic alliances to expand the platform in the Colombian market."
                    }},
                    {{
                        company: "Brave Software",
                        title: isEs ? "Líder Regional y Staff Latam" : "Regional Leader & Latam Staff",
                        desc: isEs ? "Fomenté la adopción de Web3 y privacidad en Latam. Staff en eventos como Labitconf (Argentina) y Talent Land (México)." : "Promoted Web3 adoption and privacy across Latin America. Event staff for major regional events like Labitconf (Argentina) and Talent Land (Mexico)."
                    }}
                ];
                
                let html = '';
                
                // Headline Section
                html += `
                    <div style="background: #18181b; padding: 12px; border-radius: 8px; border: 1px solid #27272a;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: #1e8449;">1. Headline / Titular</strong>
                            <button id="copy-headline" onclick="copyToClipboard(\\`\${{headline.replace(/"/g, '&quot;')}}\\`, 'copy-headline')" style="
                                background: #27272a; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;
                            ">Copy Headline</button>
                        </div>
                        <div style="background: #09090b; padding: 8px; border-radius: 4px; border: 1px solid #1c1c1f; color: #d4d4d8; font-size: 13px;">
                            \${{headline}}
                        </div>
                    </div>
                `;
                
                // About Section
                html += `
                    <div style="background: #18181b; padding: 12px; border-radius: 8px; border: 1px solid #27272a;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: #1e8449;">2. About / Extracto</strong>
                            <button id="copy-about" onclick="copyToClipboard(\\`\${{aboutText.replace(/\\\\n/g, '\\\\n').replace(/"/g, '&quot;')}}\\`, 'copy-about')" style="
                                background: #27272a; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;
                            ">Copy About</button>
                        </div>
                        <div style="background: #09090b; padding: 8px; border-radius: 4px; border: 1px solid #1c1c1f; color: #d4d4d8; font-size: 12px; max-height: 120px; overflow-y: auto; white-space: pre-wrap;">
                            \${{aboutText}}
                        </div>
                    </div>
                `;
                
                // Experience Section
                html += '<div><h4 style="margin: 0 0 10px 0; color: #a1a1aa; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">3. Experience / Experiencia</h4>';
                expList.forEach((exp, idx) => {{
                    html += `
                        <div style="background: #18181b; padding: 12px; border-radius: 8px; border: 1px solid #27272a; margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <strong style="color: #ffffff; font-size: 13px;">\${{exp.company}}</strong>
                                <span style="font-size: 11px; color: #a1a1aa;">Position \${{idx + 1}}</span>
                            </div>
                            
                            <!-- Title -->
                            <div style="margin-bottom: 8px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #71717a; margin-bottom: 2px;">
                                    <span>Title / Cargo</span>
                                    <button id="copy-title-\${{idx}}" onclick="copyToClipboard(\\`\${{exp.title.replace(/"/g, '&quot;')}}\\`, 'copy-title-\${{idx}}')" style="
                                        background: #27272a; color: white; border: none; padding: 2px 6px; border-radius: 4px; font-size: 10px; cursor: pointer;
                                    ">Copy Title</button>
                                </div>
                                <div style="background: #09090b; padding: 4px 6px; border-radius: 4px; border: 1px solid #1c1c1f; color: #d4d4d8; font-size: 12px;">\${{exp.title}}</div>
                            </div>
                            
                            <!-- Description -->
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #71717a; margin-bottom: 2px;">
                                    <span>Description</span>
                                    <button id="copy-desc-\${{idx}}" onclick="copyToClipboard(\\`\${{exp.desc.replace(/"/g, '&quot;')}}\\`, 'copy-desc-\${{idx}}')" style="
                                        background: #27272a; color: white; border: none; padding: 2px 6px; border-radius: 4px; font-size: 10px; cursor: pointer;
                                    ">Copy Desc</button>
                                </div>
                                <div style="background: #09090b; padding: 6px; border-radius: 4px; border: 1px solid #1c1c1f; color: #d4d4d8; font-size: 12px; white-space: pre-wrap;">\${{exp.desc}}</div>
                            </div>
                        </div>
                    `;
                }});
                html += '</div>';
                
                // Skills Section
                const skills = ["Artificial Intelligence", "Web3 & Blockchain Architecture", "Python", "Solidity", "C++", "Rust", "JavaScript", "Node.js", "Docker", "Azure Cloud", "Business Strategy", "Event Management"];
                const skillsList = skills.join(', ');
                html += `
                    <div style="background: #18181b; padding: 12px; border-radius: 8px; border: 1px solid #27272a;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: #1e8449;">4. Recommended Skills</strong>
                            <button id="copy-skills" onclick="copyToClipboard(\\`\${{skillsList.replace(/"/g, '&quot;')}}\\`, 'copy-skills')" style="
                                background: #27272a; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;
                            ">Copy Skills List</button>
                        </div>
                        <div style="background: #09090b; padding: 8px; border-radius: 4px; border: 1px solid #1c1c1f; color: #d4d4d8; font-size: 12px;">
                            \${{skills.map(s => `<span style="display: inline-block; background: #27272a; padding: 2px 6px; border-radius: 12px; margin: 2px; font-size: 11px;">\${{s}}</span>`).join('')}}
                        </div>
                    </div>
                `;
                
                contentDiv.innerHTML = html;
            }};
            
            // Run rendering initially
            window.renderContent();
            console.log("LinkedIn Helper sidebar injected successfully!");
        }})();
        '''
        
        # Inject script
        page.evaluate(js_injection)
        
        print("\\n" + "=" * 60)
        print("SUCCESS: The LinkedIn Helper sidebar has been injected!")
        print("Check the Chromium window that was opened by this script.")
        print("You will see a dark panel on the right with all your texts.")
        print("Use the 'Copy' buttons to copy the text and paste it into LinkedIn.")
        print("=" * 60)
        print("\\nKeeping the browser open. Press Ctrl+C in this terminal when you are finished.")
        
        # Keep page open
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\\nExiting and closing browser...")

if __name__ == '__main__':
    run()
"""
    with open('update_linkedin.py', 'w', encoding='utf-8') as f:
        f.write(script_content)
    print("Generated update_linkedin.py")

if __name__ == '__main__':
    translations = load_translations()
    generate_markdown(translations)
    generate_interactive_script()
