// --- AI Assistant Logic ---
const aiTrigger = document.getElementById('ai-trigger');
const aiAssistant = document.getElementById('ai-assistant');
const aiClose = document.getElementById('ai-close');
const aiInput = document.getElementById('ai-input');
const aiSend = document.getElementById('ai-send');
const aiChat = document.getElementById('ai-chat');

const knowledgeBase = {
  en: {
    "who": "I am the AI clone of Wilfredo Caro, AI Multi-Agent Systems Architect, CEO at VirtuadsAi, and CTO at Orbit.",
    "virtuadsai": "VirtuadsAi is a company focused on virtual advertising using AI and Web3 for seamless digital business.",
    "orbit": "Orbit is a secure, mobile-first interface for cloud development environments where Wilfredo is CTO.",
    "antigravity": "Antigravity Monitor is Wilfredo's flagship product, providing real-time mission control and observability for AI agent swarms.",
    "security": "Wilfredo integrates Post-Quantum Cybersecurity (PQC), using ML-KEM and ML-DSA algorithms to secure agent channels and Web3 transactions.",
    "skills": "Wilfredo's core expertise includes AI Swarm Governance, Web3, Post-Quantum Cybersecurity (PQC), and Cloud/Mobile Dev.",
    "music": "Wilfredo is also a DJ! He loves Deep Tech and Techno. You can listen to his mixes in the player.",
    "contact": "Please unlock contact details in the footer.",
    "default": "That's an interesting question! I focus on AI Agent Orchestration, Web3, PQC, and Deep Tech. What would you like to know about Wilfredo's projects?"
  },
  es: {
    "quien": "Soy el clon de IA de Wilfredo Caro, Arquitecto de Sistemas Multi-Agente de IA, CEO de VirtuadsAi y CTO de Orbit.",
    "quién": "Soy el clon de IA de Wilfredo Caro, Arquitecto de Sistemas Multi-Agente de IA, CEO de VirtuadsAi y CTO de Orbit.",
    "who": "Soy el clon de IA de Wilfredo Caro, Arquitecto de Sistemas Multi-Agente de IA, CEO de VirtuadsAi y CTO de Orbit.",
    "virtuadsai": "VirtuadsAi es una empresa que elimina la fricción financiera en publicidad virtual mediante IA y Web3.",
    "orbit": "Orbit es una interfaz segura e interactiva móvil para entornos de desarrollo en la nube (Cloud IDE).",
    "antigravity": "Antigravity Monitor es el buque insignia de Wilfredo, que ofrece observabilidad en tiempo real para enjambres de agentes de IA.",
    "security": "Wilfredo integra Ciberseguridad Poscuántica (PQC), utilizando algoritmos ML-KEM y ML-DSA para blindar comunicaciones Web3 e IA.",
    "habilidades": "Las habilidades principales de Wilfredo incluyen gobernanza de agentes de IA, Web3, ciberseguridad poscuántica (PQC) y desarrollo móvil/nube.",
    "dj": "¡Wilfredo también es DJ! Le apasiona el Deep Tech. Puedes escuchar sus mezclas en el reproductor integrado.",
    "music": "¡Wilfredo también es DJ! Le apasiona el Deep Tech. Puedes escuchar sus mezclas en el reproductor integrado.",
    "contacto": "Por favor, desbloquea los detalles de contacto en el pie de página.",
    "default": "¡Esa es una pregunta interesante! Me enfoco en Orquestación de Agentes de IA, Web3, Ciberseguridad Poscuántica y Deep Tech. ¿Qué te gustaría saber sobre sus proyectos?"
  },
  ja: {
    "who": "私はVirtuadsAiのCEO、OrbitのCTOであり、AIエージェント群のオーケストレーションを専門とするウィルフレド・カロのAIクローンです。",
    "virtuadsai": "VirtuadsAiは、AI・Web3を活用して仮想空間におけるデジタル広告の金融摩擦を解消する enterprise です。",
    "orbit": "Orbitは、クラウド開発环境向けのセキュアなモバイルファースト・インターフェースです。",
    "antigravity": "Antigravity Monitorは、AIエージェント群のリアルタイム管制と可観測性を提供するウィルフレドの代表的な製品です。",
    "security": "ウィルフレドは耐量子暗号（PQC - ML-KEM/ML-DSA）を統合し、AI通信とWeb3取引を保護します。",
    "skills": "主なスキルは、AIエージェントガバナンス、Web3、耐量子暗号セキュリティ（PQC）、クラウド／モバイル開発です。",
    "music": "ウィルフレドはディープテックDJでもあり、右側のプレーヤーでミックスを聴けます。",
    "contact": "フッターで連絡先情報を解除してください。",
    "default": "面白いご質問ですね！私はAIオーケストレーション、Web3、耐量子暗号、ディープテックに注力しています。プロジェクトについて何を知りたいですか？"
  },
  zh: {
    "who": "我是Wilfredo Caro的AI分身，他是AI智能体集群架构师、VirtuadsAi创始人兼CEO以及Orbit的CTO。",
    "virtuadsai": "VirtuadsAi是一家利用AI和Web3消除虚拟广告领域金融摩擦的创新企业。",
    "orbit": "Orbit是一个安全、移动优先的云端开发环境控制界面。",
    "antigravity": "Antigravity Monitor是Wilfredo的旗舰产品，提供AI智能体集群的实时任务控制与可观测性。",
    "security": "Wilfredo致力于整合后量子密码学（PQC - ML-KEM/ML-DSA），以保护智能体通信及Web3交易的安全。",
    "skills": "Wilfredo的核心专长包括AI智能体治理、Web3、后量子安全（PQC）和云/移动端开发。",
    "music": "Wilfredo也是一名DJ！他热爱Deep Tech音乐，您可以在播放器中收听他的混音。",
    "contact": "请在页脚解锁联系方式。",
    "default": "这是一个有趣的问题！我专注于AI智能体编排、Web3、后量子安全和深科技。您想了解Wilfredo的哪些项目？"
  },
  ko: {
    "who": "저는 Wilfredo Caro의 AI 클론입니다. 그는 AI 멀티 에이전트 시스템 아키텍트이자 VirtuadsAi의 CEO, Orbit의 CTO입니다.",
    "virtuadsai": "VirtuadsAi는 AI와 Web3를 활용해 가상 광고 시장의 금융 마찰을 해소하는 혁신 기업입니다.",
    "orbit": "Orbit은 클라우드 개발 환경을 위한 안전하고 모바일 우선인 미션 컨트롤 인터페이스입니다.",
    "antigravity": "Antigravity Monitor는 AI 에이전트 스웜의 실시간 제어와 가시성을 제공하는 Wilfredo의 플래그십 제품입니다.",
    "security": "Wilfredo는 포스트 양자 암호화(PQC - ML-KEM/ML-DSA)를 통합하여 에이전트 채널과 Web3 거래를 보호합니다.",
    "skills": "핵심 기술은 AI 에이전트 거버넌스, Web3, 포스트 양자 보안(PQC) 및 클라우드/모바일 개발입니다.",
    "music": "Wilfredo는 DJ이기도 합니다! Deep Tech를 사랑하며 플레이어에서 그의 믹스를 들을 수 있습니다.",
    "contact": "푸터에서 연락처 정보를 잠금 해제해 주세요.",
    "default": "흥미로운 질문이네요! 저는 AI 에이전트 오케스트레이션, Web3, 포스트 양자 보안 및 딥테크를 전문으로 합니다. 어떤 프로젝트에 대해 알고 싶으신가요?"
  },
  ru: {
    "who": "Я ИИ-клон Вильфредо Каро, архитектора систем мульти-агентов ИИ, генерального директора VirtuadsAi и CTO Orbit.",
    "virtuadsai": "VirtuadsAi — компания, устраняющая финансовые трения в виртуальной рекламе с помощью ИИ и Web3.",
    "orbit": "Orbit — защищенный мобильный интерфейс для облачных сред разработки (Cloud IDE).",
    "antigravity": "Antigravity Monitor — флагманский продукт Вильфредо, обеспечивающий мониторинг роев агентов ИИ в реальном времени.",
    "security": "Вильфредо интегрирует постквантовую кибербезопасность (PQC), используя алгоритмы ML-KEM и ML-DSA для защиты каналов агентов и транзакций Web3.",
    "skills": "Ключевые навыки Вильфредо включают управление агентами ИИ, Web3, постквантовую безопасность (PQC) и разработку мобильных/облачных систем.",
    "music": "Вильфредо также диджей! Он любит Deep Tech. Вы можете послушать его миксы в плеере.",
    "contact": "Пожалуйста, разблокируйте контактные данные в футере.",
    "default": "Это интересный вопрос! Я специализируюсь на оркестрации агентов ИИ, Web3, постквантовой безопасности и Deep Tech. Что бы вы хотели узнать о проектах Вильфредо?"
  },
  ar: {
    "who": "أنا النسخة الرقمية لويلفريدو كارو، مهندس أنظمة عملاء الذكاء الاصطناعي المتعددة والرئيس التنفيذي لـ VirtuadsAi والمسؤول التقني لـ Orbit.",
    "virtuadsai": "VirtuadsAi هي شركة تقضي على الاحتكاك المالي في الإعلانات الافتراضية باستخدام الذكاء الاصطناعي والويب 3.",
    "orbit": "Orbit هي واجهة آمنة للجوال أولاً لبيئات التطوير السحابية (Cloud IDE).",
    "antigravity": "Antigravity Monitor هو المنتج الرائد لويلفريدو، حيث يوفر تحكماً فورياً ومراقبة لمجموعات عملاء الذكاء الاصطناعي.",
    "security": "يؤمن ويلفريدو الأنظمة عبر تشفير ما بعد الكم (PQC) باستخدام خوارزميات ML-KEM و ML-DSA لحماية قنوات الاتصال والويب 3.",
    "skills": "تشمل خبرات ويلفريدو الأساسية حوكمة عملاء الذكاء الاصطناعي، والويب 3، وأمن ما بعد الكم (PQC)، وتطوير الموبايل والسحابة.",
    "music": "ويلفريدو دي جي أيضاً! يحب موسيقى ديب تيك ويمكنك سماع مقاطعه الموسيقية في المشغل.",
    "contact": "يرجى إلغاء قفل تفاصيل الاتصال في أسفل الصفحة.",
    "default": "هذا سؤال مثير للاهتمام! أركز على أوركسترا عملاء الذكاء الاصطناعي، والويب 3، وأمن ما بعد الكم (PQC)، والتقنيات العميقة. ماذا تريد أن تعرف عن مشاريع ويلفريدو؟"
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
  window.trackEvent('ai_chat_message');

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
