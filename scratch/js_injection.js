
(() => {
    if (document.getElementById('antigravity-sidebar')) {
        document.getElementById('antigravity-sidebar').remove();
    }
    
    // Adjust LinkedIn main page styling to shift left and make room
    document.body.style.marginRight = "420px";
    
    // Insert Sidebar
    const div = document.createElement('div');
    div.innerHTML = `
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
`;
    document.body.appendChild(div.firstElementChild);
    
    // Set translations data
    window.profileData = {"en": {"nav_about": "About", "nav_experience": "Experience", "nav_skills": "Skills", "nav_contact": "Contact", "hero_subtitle": "Innovator & Strategist", "hero_title": "Empowering the future with <br><span class='text-gradient'>Deep Tech & AI</span>", "hero_desc": "I'm Wilfredo Caro, CEO at VirtuadsAi. I focus on the intersection of deep-tech and marketing, driving innovation in digital advertising through Web3 and Blockchain.", "hero_cta_connect": "Let's Connect", "hero_cta_journey": "My Journey", "hero_cta_cv": "\ud83d\udcc4 Download CV", "about_title": "About <span class='text-gradient'>Me</span>", "about_p1": "At VirtuadsAi, I lead the strategic vision as CEO, focusing on innovative blockchain-based solutions to transform digital businesses in Web3.", "about_p2": "My role involves collaborating with multidisciplinary teams to develop technological strategies that prioritize privacy, decentralization, AI usage, and efficiency.", "about_p3": "My experience as a Brand Representative at Brave Software has allowed me to interact with communities in Latin America, promoting the adoption of disruptive technologies. I complement my career with studies in data analysis and web development to create robust platforms.", "exp_title": "Professional <span class='text-gradient'>Journey</span>", "exp_date_present": "Present", "exp_role_ceo": "Founder & CEO", "exp_desc_ceo": "Leading the strategic vision to transform digital business in Web3 through AI and Blockchain. Focus on eliminating financial friction in virtual advertising.", "exp_desc_orbit": "Directing the development of a secure, mobile-first interface for cloud development environments.", "exp_desc_exequine": "Developed a decentralized registry using blockchain to provide unique digital identities for horses.", "exp_desc_corner": "Drove business growth and strategic alliances to expand the platform in the Colombian market.", "exp_desc_brave": "Promoted Web3 adoption and privacy across Latin America. Event staff for Labitconf and Talent Land.", "skills_title": "Core <span class='text-gradient'>Expertise</span>", "skills_tab_leadership": "Leadership & Strategy", "skills_tab_languages": "Programming Languages", "skills_tab_tools": "Cloud & Dev Operations", "skill_ai": "Artificial Intelligence", "skill_web3": "Web3 & Blockchain", "skill_strategy": "Business Strategy", "skill_webdev": "Web Development", "skill_events": "Event Management", "skill_dj": "DJing", "skill_python": "Python", "skill_solidity": "Solidity", "skill_cpp": "C++", "skill_docker": "Docker", "skill_azure": "Azure Cloud", "skill_javascript": "JavaScript", "skill_android": "Android Studio", "skill_rust": "Rust", "skill_nodejs": "Node.js", "contact_title": "Let's build the <span class='text-gradient'>future</span>", "contact_desc": "Whether you're interested in AI, Web3, or just want to connect over a good DJ set, I'd love to hear from you.", "footer_copy": "&copy; Wilfredo Caro. Empowered by VirtuadsAi.", "dj_player_title": "W.Caro - Deep Tech Mix", "ai_trigger_title": "Chat with my AI", "ai_suggest_who": "Who is Wilfredo?", "ai_suggest_virtuadsai": "About VirtuadsAi", "ai_suggest_orbit": "What is Orbit?", "ai_suggest_music": "Is he a DJ?", "nav_projects": "Projects", "projects_title": "Main <span class='text-gradient'>Innovations</span>", "collab_title": "Collaborations & <span class='text-gradient'>Leadership</span>", "project_overlay_dev": "IN DEVELOPMENT", "project_virtuadsai_name": "VirtuadsAi", "project_virtuadsai_desc": "CEO & Founder. We eliminate the financial friction that currently prevents global brands from advertising in virtual worlds.", "project_orbit_name": "Orbit", "project_orbit_desc": "CTO. Orbit is a secure, mobile-first interface for cloud development environments, redefining mobile dev workflows.", "project_exequine_name": "ExEquine", "project_exequine_desc": "Fullstack & Blockchain Architect. A decentralized registry where each horse has a unique digital identity on the Blockchain.", "project_antiobserv_name": "Anti-Observer", "project_antiobserv_desc": "Founder-CTO. Antigravity Observer Extension - Premium Mission Control for AI Agents and decentralized monitoring.", "collab_brave_name": "Brave Software", "collab_brave_desc": "Regional Leader & Latam Staff. Promoted Web3 adoption through major events like Labitconf (Argentina) and Talent Land (Mexico).", "project_creditops_name": "Credit Ops Engine", "project_creditops_desc": "Automated credit operations engine designed for modern fintech ecosystems and financial efficiency.", "project_beatlink_name": "BeatLink Colombia", "project_beatlink_desc": "Collaboration in professional event management and ticketing platform for the Colombian market.", "cv_modal_title": "Request CV Access", "cv_modal_desc": "Please enter your information to download the CV.", "cv_label_name": "Full Name", "cv_label_email": "Email Address", "cv_label_company": "Company / Organization", "cv_label_purpose": "Purpose", "cv_purpose_hire": "Hiring / Recruiting", "cv_purpose_collab": "Collaboration / Partnership", "cv_purpose_invest": "Investment", "cv_purpose_other": "Other", "cv_submit_btn": "Submit & Download", "cv_error_empty": "Please fill in all fields.", "cv_error_email": "Please enter a valid email.", "contact_unlock_btn": "\ud83d\udd13 Unlock Contact Details"}, "es": {"nav_about": "Sobre m\u00ed", "nav_experience": "Experiencia", "nav_skills": "Habilidades", "nav_contact": "Contacto", "hero_subtitle": "Innovador & Estratega", "hero_title": "Empoderando el futuro con <br><span class='text-gradient'>Deep Tech e IA</span>", "hero_desc": "Soy Wilfredo Caro, CEO de VirtuadsAi. Me enfoco en la intersecci\u00f3n entre deep-tech y marketing, impulsando la innovaci\u00f3n en publicidad digital a trav\u00e9s de Web3 y Blockchain.", "hero_cta_connect": "Conectemos", "hero_cta_journey": "Mi Trayectoria", "hero_cta_cv": "\ud83d\udcc4 Descargar CV", "about_title": "Sobre <span class='text-gradient'>M\u00ed</span>", "about_p1": "En VirtuadsAi, lidero la visi\u00f3n estrat\u00e9gica como CEO, enfoc\u00e1ndome en soluciones innovadoras basadas en blockchain para transformar negocios digitales de la Web3.", "about_p2": "Mi rol incluye colaborar con equipos multidisciplinarios para desarrollar estrategias tecnol\u00f3gicas que priorizan privacidad, descentralizaci\u00f3n, uso de IA y su eficiencia.", "about_p3": "Mi experiencia como Representante de Marca en Brave Software me ha permitido interactuar con comunidades en Am\u00e9rica Latina, promoviendo la adopci\u00f3n de tecnolog\u00edas disruptivas. Complemento mi trayectoria con estudios en an\u00e1lisis de datos y desarrollo web para crear plataformas robustas.", "exp_title": "Trayectoria <span class='text-gradient'>Profesional</span>", "exp_date_present": "Presente", "exp_role_ceo": "Fundador y CEO", "exp_desc_ceo": "Liderando la visi\u00f3n estrat\u00e9gica para transformar negocios digitales en Web3 mediante IA y Blockchain. Foco en eliminar la fricci\u00f3n financiera en publicidad virtual.", "exp_desc_orbit": "Dirigiendo el desarrollo de una interfaz segura y enfocada en m\u00f3viles para entornos de desarrollo en la nube.", "exp_desc_exequine": "Desarrollo de un registro descentralizado usando blockchain para proveer identidad digital \u00fanica a caballos.", "exp_desc_corner": "Impuls\u00e9 el crecimiento empresarial y alianzas estrat\u00e9gicas para expandir la plataforma en el mercado colombiano.", "exp_desc_brave": "Foment\u00e9 la adopci\u00f3n de Web3 y privacidad en Latam. Staff en eventos como Labitconf y Talent Land.", "skills_title": "Experiencia <span class='text-gradient'>Principal</span>", "skills_tab_leadership": "Liderazgo y Estrategia", "skills_tab_languages": "Lenguajes de Programaci\u00f3n", "skills_tab_tools": "Nube y Operaciones", "skill_ai": "Inteligencia Artificial", "skill_web3": "Web3 & Blockchain", "skill_strategy": "Estrategia de Negocios", "skill_webdev": "Desarrollo Web", "skill_events": "Gesti\u00f3n de Eventos", "skill_dj": "DJing", "skill_python": "Python", "skill_solidity": "Solidity", "skill_cpp": "C++", "skill_docker": "Docker", "skill_azure": "Azure Cloud", "skill_javascript": "JavaScript", "skill_android": "Android Studio", "skill_rust": "Rust", "skill_nodejs": "Node.js", "contact_title": "Construyamos el <span class='text-gradient'>futuro</span>", "contact_desc": "Ya sea que est\u00e9s interesado en IA, Web3 o simplemente quieras conectar con un buen set de DJ, me encantar\u00eda saber de ti.", "footer_copy": "&copy; Wilfredo Caro. Empowered by VirtuadsAi.", "dj_player_title": "W.Caro - Mix de Deep Tech", "ai_trigger_title": "Chatea con mi IA", "ai_suggest_who": "\u00bfQui\u00e9n es Wilfredo?", "ai_suggest_virtuadsai": "Sobre VirtuadsAi", "ai_suggest_orbit": "\u00bfQu\u00e9 es Orbit?", "ai_suggest_music": "\u00bfEs DJ?", "nav_projects": "Proyectos", "projects_title": "Principales <span class='text-gradient'>Innovaciones</span>", "collab_title": "Colaboraciones y <span class='text-gradient'>Liderazgo</span>", "project_overlay_dev": "EN DESARROLLO", "project_virtuadsai_name": "VirtuadsAi", "project_virtuadsai_desc": "CEO y Fundador. Eliminamos la fricci\u00f3n financiera que impide a las marcas globales anunciarse en mundos virtuales.", "project_orbit_name": "Orbit", "project_orbit_desc": "CTO. Interfaz segura y m\u00f3vil para entornos de desarrollo en la nube, redefiniendo flujos de trabajo m\u00f3viles.", "project_exequine_name": "ExEquine", "project_exequine_desc": "Arquitecto Fullstack y Blockchain. Registro descentralizado donde cada caballo tiene una identidad digital \u00fanica en la Blockchain.", "project_antiobserv_name": "Anti-Observer", "project_antiobserv_desc": "Fundador-CTO. Extensi\u00f3n Antigravity Observer - Control de misi\u00f3n premium para agentes de IA y monitoreo descentralizado.", "collab_brave_name": "Brave Software", "collab_brave_desc": "L\u00edder Regional y Staff Latam. Foment\u00e9 la adopci\u00f3n de Web3 mediante eventos clave como Labitconf (Argentina) y Talent Land (M\u00e9xico).", "project_creditops_name": "Credit Ops Engine", "project_creditops_desc": "Motor de operaciones de cr\u00e9dito automatizado dise\u00f1ado para ecosistemas fintech modernos y eficiencia financiera.", "project_beatlink_name": "BeatLink Colombia", "project_beatlink_desc": "Colaboraci\u00f3n en plataforma profesional de gesti\u00f3n de eventos y venta de boletos para el mercado colombiano.", "cv_modal_title": "Acceso al CV", "cv_modal_desc": "Por favor, ingresa tus datos para descargar el CV.", "cv_label_name": "Nombre Completo", "cv_label_email": "Correo Electr\u00f3nico", "cv_label_company": "Empresa / Organizaci\u00f3n", "cv_label_purpose": "Prop\u00f3sito", "cv_purpose_hire": "Contrataci\u00f3n / Reclutamiento", "cv_purpose_collab": "Colaboraci\u00f3n / Alianza", "cv_purpose_invest": "Inversi\u00f3n", "cv_purpose_other": "Otro", "cv_submit_btn": "Enviar y Descargar", "cv_error_empty": "Por favor, completa todos los campos requeridos.", "cv_error_email": "Por favor, introduce un correo electr\u00f3nico v\u00e1lido.", "contact_unlock_btn": "\ud83d\udd13 Desbloquear Datos de Contacto"}, "ja": {"nav_about": "\u79c1\u306b\u3064\u3044\u3066", "nav_experience": "\u7d4c\u6b74", "nav_skills": "\u30b9\u30ad\u30eb", "nav_contact": "\u9023\u7d61\u5148", "hero_subtitle": "\u30a4\u30ce\u30d9\u30fc\u30bf\u30fc & \u6226\u7565\u5bb6", "hero_title": "<span class='text-gradient'>\u30c7\u30a3\u30fc\u30d7\u30c6\u30c3\u30af \uff06 AI</span>\u3067<br>\u672a\u6765\u3092\u5207\u308a\u62d3\u304f", "hero_desc": "\u79c1\u306fVirtuadsAi\u306eCEO\u3001\u30a6\u30a3\u30eb\u30d5\u30ec\u30c9\u30fb\u30ab\u30ed\u3067\u3059\u3002\u30c7\u30a3\u30fc\u30d7\u30c6\u30c3\u30af\u3068\u30de\u30fc\u30b1\u30c6\u30a3\u30f3\u30b0\u306e\u878d\u5408\u306b\u7126\u70b9\u3092\u5f53\u3066\u3001Web3\u3068\u30d6\u30ed\u30c3\u30af\u30c1\u30a7\u30fc\u30f3\u3092\u901a\u3058\u3066\u30c7\u30b8\u30bf\u30eb\u5e83\u544a\u306e\u30a4\u30ce\u30d9\u30fc\u30b7\u30e7\u30f3\u3092\u63a8\u9032\u3057\u3066\u3044\u307e\u3059\u3002", "hero_cta_connect": "\u304a\u554f\u3044\u5408\u308f\u305b", "hero_cta_journey": "\u79c1\u306e\u6b69\u307f", "hero_cta_cv": "\ud83d\udcc4 \u5c65\u6b74\u66f8\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9", "about_title": "<span class='text-gradient'>\u79c1</span>\u306b\u3064\u3044\u3066", "about_p1": "VirtuadsAi\u306eCEO\u3068\u3057\u3066\u3001AI\u3068\u30d6\u30ed\u30c3\u30af\u30c1\u30a7\u30fc\u30f3\u3092\u6d3b\u7528\u3057\u305f\u9769\u65b0\u7684\u306a\u30bd\u30ea\u30e5\u30fc\u30b7\u30e7\u30f3\u3067Web3\u6642\u4ee3\u306e\u30c7\u30b8\u30bf\u30eb\u30d3\u30b8\u30cd\u30b9\u5909\u9769\u3092\u727d\u5f15\u3057\u3066\u3044\u307e\u3059\u3002", "about_p2": "\u79c1\u306e\u5f79\u5272\u306f\u3001\u591a\u89d2\u7684\u306a\u30c1\u30fc\u30e0\u3068\u9023\u643a\u3057\u3001\u30d7\u30e9\u30a4\u30d0\u30b7\u30fc\u3001\u5206\u6563\u5316\u3001AI\u6d3b\u7528\u3001\u305d\u3057\u3066\u52b9\u7387\u6027\u3092\u91cd\u8996\u3057\u305f\u6280\u8853\u6226\u7565\u3092\u69cb\u7bc9\u3059\u308b\u3053\u3068\u3067\u3059\u3002", "about_p3": "Brave Software\u306e\u30d6\u30e9\u30f3\u30c9\u4ee3\u8868\u3068\u3057\u3066\u306e\u7d4c\u9a13\u3092\u6d3b\u304b\u3057\u3001\u30e9\u30c6\u30f3\u30a2\u30e1\u30ea\u30ab\u306e\u30b3\u30df\u30e5\u30cb\u30c6\u30a3\u3067\u7834\u58ca\u7684\u6280\u8853\u306e\u666e\u53ca\u3092\u63a8\u9032\u3057\u3066\u304d\u307e\u3057\u305f\u3002\u30c7\u30fc\u30bf\u5206\u6790\u3068\u30a6\u30a7\u30d6\u958b\u767a\u306e\u77e5\u898b\u3092\u7d44\u307f\u5408\u308f\u305b\u3001\u5805\u7262\u306a\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3092\u5275\u9020\u3057\u307e\u3059\u3002", "exp_title": "\u30d7\u30ed\u30d5\u30a7\u30c3\u30b7\u30e7\u30ca\u30eb\u306a<span class='text-gradient'>\u8ecc\u8de1</span>", "exp_date_present": "\u73fe\u5728", "exp_role_ceo": "\u5275\u696d\u8005 \u517c CEO", "exp_desc_ceo": "AI\u3068\u30d6\u30ed\u30c3\u30af\u30c1\u30a7\u30fc\u30f3\u306b\u3088\u308bWeb3\u30d3\u30b8\u30cd\u30b9\u5909\u9769\u306e\u6226\u7565\u7684\u30d3\u30b8\u30e7\u30f3\u3092\u4e3b\u5c0e\u3002\u30d0\u30fc\u30c1\u30e3\u30eb\u5e83\u544a\u306b\u304a\u3051\u308b\u91d1\u878d\u6469\u64e6\u306e\u89e3\u6d88\u306b\u6ce8\u529b\u3002", "exp_desc_orbit": "\u30af\u30e9\u30a6\u30c9\u958b\u767a\u74b0\u5883\u5411\u3051\u30bb\u30ad\u30e5\u30a2\u306a\u30e2\u30d0\u30a4\u30eb\u30d5\u30a1\u30fc\u30b9\u30c8\u30fb\u30a4\u30f3\u30bf\u30fc\u30d5\u30a7\u30fc\u30b9\u306e\u958b\u767a\u3092\u6307\u63ee\u3002", "exp_desc_exequine": "\u5404\u99ac\u306b\u30d6\u30ed\u30c3\u30af\u30c1\u30a7\u30fc\u30f3\u4e0a\u306e\u56fa\u6709\u30c7\u30b8\u30bf\u30eb\u30a2\u30a4\u30c7\u30f3\u30c6\u30a3\u30c6\u30a3\u3092\u4ed8\u4e0e\u3059\u308b\u5206\u6563\u578b\u30ec\u30b8\u30b9\u30c8\u30ea\u306e\u958b\u767a\u3002", "exp_desc_corner": "\u30b3\u30ed\u30f3\u30d3\u30a2\u5e02\u5834\u306b\u304a\u3051\u308b\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u62e1\u5927\u306e\u305f\u3081\u306e\u4e8b\u696d\u6210\u9577\u3068\u6226\u7565\u7684\u63d0\u643a\u3092\u63a8\u9032\u3002", "exp_desc_brave": "\u4e2d\u5357\u7c73\u5168\u4f53\u306eWeb3\u5c0e\u5165\u3068\u30d7\u30e9\u30a4\u30d0\u30b7\u30fc\u4fdd\u8b77\u3092\u4fc3\u9032\u3002Labitconf\u3084Talent Land\u306e\u904b\u55b6\u30b9\u30bf\u30c3\u30d5\u3002", "skills_title": "\u30b3\u30a2<span class='text-gradient'>\u5c02\u9580\u77e5\u8b58</span>", "skills_tab_leadership": "\u30ea\u30fc\u30c0\u30fc\u30b7\u30c3\u30d7\uff06\u6226\u7565", "skills_tab_languages": "\u30d7\u30ed\u30b0\u30e9\u30df\u30f3\u30b0\u8a00\u8a9e", "skills_tab_tools": "\u30af\u30e9\u30a6\u30c9\uff06\u30a4\u30f3\u30d5\u30e9", "skill_ai": "\u4eba\u5de5\u77e5\u80fd", "skill_web3": "Web3 & \u30d6\u30ed\u30c3\u30af\u30c1\u30a7\u30fc\u30f3", "skill_strategy": "\u30d3\u30b8\u30cd\u30b9\u6226\u7565", "skill_webdev": "\u30a6\u30a7\u30d6\u958b\u767a", "skill_events": "\u30a4\u30d9\u30f3\u30c8\u904b\u55b6", "skill_dj": "DJ", "skill_python": "Python", "skill_solidity": "Solidity", "skill_cpp": "C++", "skill_docker": "Docker", "skill_azure": "Azure\u30af\u30e9\u30a6\u30c9", "skill_javascript": "JavaScript", "skill_android": "Android Studio", "skill_rust": "Rust", "skill_nodejs": "Node.js", "contact_title": "\u4e00\u7dd2\u306b<span class='text-gradient'>\u672a\u6765</span>\u3092\u7bc9\u304d\u307e\u3057\u3087\u3046", "contact_desc": "AI\u3084Web3\u306b\u8208\u5473\u304c\u3042\u308b\u65b9\u3001\u3042\u308b\u3044\u306f\u7d20\u6575\u306aDJ\u30bb\u30c3\u30c8\u3067\u7e4b\u304c\u308a\u305f\u3044\u65b9\u3001\u305c\u3072\u304a\u6c17\u8efd\u306b\u3054\u9023\u7d61\u304f\u3060\u3055\u3044\u3002", "footer_copy": "&copy; \u30a6\u30a3\u30eb\u30d5\u30ec\u30c9\u30fb\u30ab\u30ed. Empowered by VirtuadsAi.", "dj_player_title": "W.\u30ab\u30ed - \u30c7\u30a3\u30fc\u30d7\u30c6\u30c3\u30af\u30fb\u30df\u30c3\u30af\u30b9", "ai_trigger_title": "\u79c1\u306eAI\u3068\u30c1\u30e3\u30c3\u30c8\u3059\u308b", "ai_suggest_who": "\u30a6\u30a3\u30eb\u30d5\u30ec\u30c9\u3068\u306f\uff1f", "ai_suggest_virtuadsai": "VirtuadsAi\u306b\u3064\u3044\u3066", "ai_suggest_orbit": "Orbit\u3068\u306f\uff1f", "ai_suggest_music": "DJ\u6d3b\u52d5\u306b\u3064\u3044\u3066", "nav_projects": "\u30d7\u30ed\u30b8\u30a7\u30af\u30c8", "projects_title": "\u4e3b\u8981\u306a<span class='text-gradient'>\u9769\u65b0</span>", "collab_title": "\u30b3\u30e9\u30dc\u30ec\u30fc\u30b7\u30e7\u30f3\u3068<span class='text-gradient'>\u30ea\u30fc\u30c0\u30fc\u30b7\u30c3\u30d7</span>", "project_overlay_dev": "\u958b\u767a\u4e2d", "project_virtuadsai_name": "VirtuadsAi", "project_virtuadsai_desc": "CEO \u517c \u5275\u696d\u8005\u3002\u30d0\u30fc\u30c1\u30e3\u30eb\u7a7a\u9593\u306b\u304a\u3051\u308b\u30b0\u30ed\u30fc\u30d0\u30eb\u30d6\u30e9\u30f3\u30c9\u306e\u5e83\u544a\u5c55\u958b\u3092\u59a8\u3052\u308b\u91d1\u878d\u6469\u64e6\u3092\u89e3\u6d88\u3057\u307e\u3059\u3002", "project_orbit_name": "Orbit", "project_orbit_desc": "CTO\u3002\u30e2\u30d0\u30a4\u30eb\u958b\u767a\u30ef\u30fc\u30af\u30d5\u30ed\u30fc\u3092\u518d\u5b9a\u7fa9\u3059\u308b\u3001\u30af\u30e9\u30a6\u30c9\u958b\u767a\u74b0\u5883\u5411\u3051\u30e2\u30d0\u30a4\u30eb\u30d5\u30a1\u30fc\u30b9\u30c8\u30fb\u30a4\u30f3\u30bf\u30fc\u30d5\u30a7\u30fc\u30b9\u3002", "project_exequine_name": "ExEquine", "project_exequine_desc": "\u30d5\u30eb\u30b9\u30bf\u30c3\u30af \u517c \u30d6\u30ed\u30c3\u30af\u30c1\u30a7\u30fc\u30f3\u30fb\u30a2\u30fc\u30ad\u30c6\u30af\u30c8\u3002\u30d6\u30ed\u30c3\u30af\u30c1\u30a7\u30fc\u30f3\u4e0a\u3067\u5404\u99ac\u306b\u56fa\u6709\u306e\u30c7\u30b8\u30bf\u30eb ID \u3092\u4ed8\u4e0e\u3059\u308b\u5206\u6563\u578b\u30ec\u30b8\u30b9\u30c8\u30ea\u3002", "project_antiobserv_name": "Anti-Observer", "project_antiobserv_desc": "\u5275\u696d\u8005 \u517c CTO\u3002AI \u30a8\u30fc\u30b8\u30a7\u30f3\u30c8\u5411\u3051\u30d7\u30ec\u30df\u30a2\u30e0\u30fb\u30df\u30c3\u30b7\u30e7\u30f3\u30b3\u30f3\u30c8\u30ed\u30fc\u30eb\u304a\u3088\u3073\u5206\u6563\u578b\u30e2\u30cb\u30bf\u30ea\u30f3\u30b0\u62e1\u5f35\u6a5f\u80fd\u3002", "collab_brave_name": "Brave Software", "collab_brave_desc": "\u30ea\u30fc\u30b8\u30e7\u30ca\u30eb\u30ea\u30fc\u30c0\u30fc \u517c \u4e2d\u5357\u7c73\u30b9\u30bf\u30c3\u30d5\u3002Labitconf\u3084Talent Land\u7b49\u306e\u4e3b\u8981\u30a4\u30d9\u30f3\u30c8\u3092\u901a\u3058Web3\u5c0e\u5165\u3092\u63a8\u9032\u3002", "project_creditops_name": "Credit Ops Engine", "project_creditops_desc": "\u73fe\u4ee3\u306e\u30d5\u30a3\u30f3\u30c6\u30c3\u30af\u30a8\u30b3\u30b7\u30b9\u30c6\u30e0\u3068\u91d1\u878d\u52b9\u7387\u306e\u305f\u3081\u306b\u8a2d\u8a08\u3055\u308c\u305f\u81ea\u52d5\u30af\u30ec\u30b8\u30c3\u30c8\u904b\u7528\u30a8\u30f3\u30b8\u30f3\u3002", "project_beatlink_name": "BeatLink Colombia", "project_beatlink_desc": "\u30b3\u30ed\u30f3\u30d3\u30a2\u5e02\u5834\u5411\u3051\u306e\u30d7\u30ed\u30d5\u30a7\u30c3\u30b7\u30e7\u30ca\u30eb\u306a\u30a4\u30d9\u30f3\u30c8\u7ba1\u7406\u304a\u3088\u3073\u30c1\u30b1\u30c3\u30c8\u8ca9\u58f2\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3067\u306e\u30b3\u30e9\u30dc\u30ec\u30fc\u30b7\u30e7\u30f3\u3002", "cv_modal_title": "\u5c65\u6b74\u66f8\u3078\u306e\u30a2\u30af\u30bb\u30b9\u8981\u6c42", "cv_modal_desc": "\u5c65\u6b74\u66f8\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3059\u308b\u306b\u306f\u3001\u60c5\u5831\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002", "cv_label_name": "\u6c0f\u540d", "cv_label_email": "\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9", "cv_label_company": "\u4f1a\u793e\u30fb\u7d44\u7e54\u540d", "cv_label_purpose": "\u76ee\u7684", "cv_purpose_hire": "\u63a1\u7528\u30fb\u30b9\u30ab\u30a6\u30c8", "cv_purpose_collab": "\u5354\u696d\u30fb\u30d1\u30fc\u30c8\u30ca\u30fc\u30b7\u30c3\u30d7", "cv_purpose_invest": "\u6295\u8cc7\u6848\u4ef6", "cv_purpose_other": "\u305d\u306e\u4ed6", "cv_submit_btn": "\u9001\u4fe1\u3057\u3066\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9", "cv_error_empty": "\u3059\u3079\u3066\u306e\u5fc5\u9808\u9805\u76ee\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002", "cv_error_email": "\u6709\u52b9\u306a\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002", "contact_unlock_btn": "\ud83d\udd13 \u9023\u7d61\u5148\u60c5\u5831\u3092\u958b\u793a\u3059\u308b"}};
    window.activeLang = 'es';
    
    window.copyToClipboard = (text, btnId) => {
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById(btnId);
            const origText = btn.textContent;
            btn.textContent = "Copied! ✓";
            btn.style.background = "#059669";
            setTimeout(() => {
                btn.textContent = origText;
                btn.style.background = "#27272a";
            }, 1500);
        });
    };
    
    window.switchTab = (lang) => {
        window.activeLang = lang;
        document.getElementById('tab-es').style.background = lang === 'es' ? '#27272a' : 'transparent';
        document.getElementById('tab-es').style.color = lang === 'es' ? 'white' : '#a1a1aa';
        document.getElementById('tab-es').style.fontWeight = lang === 'es' ? 'bold' : 'normal';
        
        document.getElementById('tab-en').style.background = lang === 'en' ? '#27272a' : 'transparent';
        document.getElementById('tab-en').style.color = lang === 'en' ? 'white' : '#a1a1aa';
        document.getElementById('tab-en').style.fontWeight = lang === 'en' ? 'bold' : 'normal';
        
        renderContent();
    };
    
    window.renderContent = () => {
        const contentDiv = document.getElementById('sidebar-content');
        const lang = window.activeLang;
        
        const isEs = lang === 'es';
        
        const headline = isEs 
            ? "CEO en VirtuadsAi | CTO en Orbit | Innovador en IA, Web3 y Blockchain | Estratega Deep Tech"
            : "CEO at VirtuadsAi | CTO at Orbit | Deep Tech & AI Innovator | Web3 & Blockchain Strategist";
            
        const aboutText = isEs
            ? "En VirtuadsAi, lidero la visión estratégica como CEO, enfocándome en soluciones innovadoras basadas en blockchain para transformar negocios digitales de la Web3. Actualmente, también me desempeño como CTO en Orbit, dirigiendo el desarrollo de una interfaz segura y enfocada en móviles para entornos de desarrollo en la nube.\n\nMi rol incluye colaborar con equipos multidisciplinarios para desarrollar estrategias tecnológicas que priorizan privacidad, descentralización, uso de IA y su eficiencia. Mi experiencia como Representante de Marca en Brave Software me ha permitido interactuar con comunidades en América Latina, promoviendo la adopción de tecnologías disruptivas.\n\nComplemento mi trayectoria con estudios en análisis de datos y desarrollo web para crear plataformas robustas."
            : "At VirtuadsAi, I lead the strategic vision as CEO, focusing on innovative blockchain-based solutions to transform digital businesses in Web3. Currently, I also serve as CTO at Orbit, directing the development of a secure, mobile-first interface for cloud development environments.\n\nMy role involves collaborating with multidisciplinary teams to develop technological strategies that prioritize privacy, decentralization, AI usage, and efficiency. My experience as a Brand Representative at Brave Software has allowed me to interact with communities in Latin America, promoting the adoption of disruptive technologies.\n\nI complement my career with studies in data analysis and web development to create robust platforms.";
        
        const expList = [
            {
                company: "VirtuadsAi",
                title: isEs ? "Fundador y CEO" : "Founder & CEO",
                desc: isEs ? "Liderando la visión estratégica para transformar negocios digitales en Web3 mediante IA y Blockchain. Foco en eliminar la fricción financiera en publicidad virtual." : "Leading the strategic vision to transform digital business in Web3 through AI and Blockchain. Focus on eliminating financial friction in virtual advertising."
            },
            {
                company: "Orbit",
                title: isEs ? "CTO (Director de Tecnología)" : "CTO (Chief Technology Officer)",
                desc: isEs ? "Dirigiendo el desarrollo de una interfaz segura y enfocada en móviles para entornos de desarrollo en la nube, redefiniendo flujos de trabajo móviles." : "Directing the development of a secure, mobile-first interface for cloud development environments, redefining mobile dev workflows."
            },
            {
                company: "ExEquine",
                title: isEs ? "Arquitecto Fullstack y Blockchain" : "Fullstack & Blockchain Architect",
                desc: isEs ? "Desarrollo de un registro descentralizado usando blockchain para proveer identidad digital única a caballos." : "Developed a decentralized registry using blockchain to provide unique digital identities for horses."
            },
            {
                company: "CornerMarket",
                title: isEs ? "Representante de Desarrollo de Negocios (BDA)" : "Business Development Associate (BDA)",
                desc: isEs ? "Impulsé el crecimiento empresarial y alianzas estratégicas para expandir la plataforma en el mercado colombiano." : "Drove business growth and strategic alliances to expand the platform in the Colombian market."
            },
            {
                company: "Brave Software",
                title: isEs ? "Líder Regional y Staff Latam" : "Regional Leader & Latam Staff",
                desc: isEs ? "Fomenté la adopción de Web3 y privacidad en Latam. Staff en eventos como Labitconf (Argentina) y Talent Land (México)." : "Promoted Web3 adoption and privacy across Latin America. Event staff for major regional events like Labitconf (Argentina) and Talent Land (Mexico)."
            }
        ];
        
        let html = '';
        
        // Headline Section
        html += `
            <div style="background: #18181b; padding: 12px; border-radius: 8px; border: 1px solid #27272a;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="color: #1e8449;">1. Headline / Titular</strong>
                    <button id="copy-headline" onclick="copyToClipboard(\`\${headline.replace(/"/g, '&quot;')}\`, 'copy-headline')" style="
                        background: #27272a; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;
                    ">Copy Headline</button>
                </div>
                <div style="background: #09090b; padding: 8px; border-radius: 4px; border: 1px solid #1c1c1f; color: #d4d4d8; font-size: 13px;">
                    \${headline}
                </div>
            </div>
        `;
        
        // About Section
        html += `
            <div style="background: #18181b; padding: 12px; border-radius: 8px; border: 1px solid #27272a;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="color: #1e8449;">2. About / Extracto</strong>
                    <button id="copy-about" onclick="copyToClipboard(\`\${aboutText.replace(/\n/g, '\\n').replace(/"/g, '&quot;')}\`, 'copy-about')" style="
                        background: #27272a; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;
                    ">Copy About</button>
                </div>
                <div style="background: #09090b; padding: 8px; border-radius: 4px; border: 1px solid #1c1c1f; color: #d4d4d8; font-size: 12px; max-height: 120px; overflow-y: auto; white-space: pre-wrap;">
                    \${aboutText}
                </div>
            </div>
        `;
        
        // Experience Section
        html += '<div><h4 style="margin: 0 0 10px 0; color: #a1a1aa; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">3. Experience / Experiencia</h4>';
        expList.forEach((exp, idx) => {
            html += `
                <div style="background: #18181b; padding: 12px; border-radius: 8px; border: 1px solid #27272a; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <strong style="color: #ffffff; font-size: 13px;">\${exp.company}</strong>
                        <span style="font-size: 11px; color: #a1a1aa;">Position \${idx + 1}</span>
                    </div>
                    
                    <!-- Title -->
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #71717a; margin-bottom: 2px;">
                            <span>Title / Cargo</span>
                            <button id="copy-title-\${idx}" onclick="copyToClipboard(\`\${exp.title.replace(/"/g, '&quot;')}\`, 'copy-title-\${idx}')" style="
                                background: #27272a; color: white; border: none; padding: 2px 6px; border-radius: 4px; font-size: 10px; cursor: pointer;
                            ">Copy Title</button>
                        </div>
                        <div style="background: #09090b; padding: 4px 6px; border-radius: 4px; border: 1px solid #1c1c1f; color: #d4d4d8; font-size: 12px;">\${exp.title}</div>
                    </div>
                    
                    <!-- Description -->
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #71717a; margin-bottom: 2px;">
                            <span>Description</span>
                            <button id="copy-desc-\${idx}" onclick="copyToClipboard(\`\${exp.desc.replace(/"/g, '&quot;')}\`, 'copy-desc-\${idx}')" style="
                                background: #27272a; color: white; border: none; padding: 2px 6px; border-radius: 4px; font-size: 10px; cursor: pointer;
                            ">Copy Desc</button>
                        </div>
                        <div style="background: #09090b; padding: 6px; border-radius: 4px; border: 1px solid #1c1c1f; color: #d4d4d8; font-size: 12px; white-space: pre-wrap;">\${exp.desc}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        // Skills Section
        const skills = ["Artificial Intelligence", "Web3 & Blockchain Architecture", "Python", "Solidity", "C++", "Rust", "JavaScript", "Node.js", "Docker", "Azure Cloud", "Business Strategy", "Event Management"];
        const skillsList = skills.join(', ');
        html += `
            <div style="background: #18181b; padding: 12px; border-radius: 8px; border: 1px solid #27272a;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="color: #1e8449;">4. Recommended Skills</strong>
                    <button id="copy-skills" onclick="copyToClipboard(\`\${skillsList.replace(/"/g, '&quot;')}\`, 'copy-skills')" style="
                        background: #27272a; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;
                    ">Copy Skills List</button>
                </div>
                <div style="background: #09090b; padding: 8px; border-radius: 4px; border: 1px solid #1c1c1f; color: #d4d4d8; font-size: 12px;">
                    \${skills.map(s => `<span style="display: inline-block; background: #27272a; padding: 2px 6px; border-radius: 12px; margin: 2px; font-size: 11px;">\${s}</span>`).join('')}
                </div>
            </div>
        `;
        
        contentDiv.innerHTML = html;
    };
    
    // Run rendering initially
    window.renderContent();
    console.log("LinkedIn Helper sidebar injected successfully!");
})();
