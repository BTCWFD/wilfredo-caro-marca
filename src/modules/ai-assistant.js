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
    "website": "Wilfredo builds custom websites and apps — landing pages, portfolios, dashboards, Web3 integrations. Click the floating \"Quote\" button to share your project details.",
    "chatbot": "Need an AI chatbot or a multi-agent system for your business? That's exactly what Wilfredo builds. Click the \"Quote\" button to tell us more.",
    "brand": "Wilfredo can boost your personal brand with SEO, content strategy, and premium design. Click the \"Quote\" button to get started.",
    "press kit": "Need a DJ press kit? Wilfredo designs digital press kits for artists. Click the \"Quote\" button to request one.",
    "price": "Every project is unique, so I can't quote an exact number here. Click the floating \"Quote\" button to share your details, or book a call on Calendly for a direct conversation.",
    "cost": "Every project is unique, so I can't quote an exact number here. Click the floating \"Quote\" button to share your details, or book a call on Calendly for a direct conversation.",
    "how much": "Every project is unique, so I can't quote an exact number here. Click the floating \"Quote\" button to share your details, or book a call on Calendly for a direct conversation.",
    "experience": "Wilfredo is currently Founder & CEO at VirtuadsAi and CTO at Orbit. He previously worked as Fullstack & Blockchain Architect at ExEquine, Business Development Associate at CornerMarket, and Regional Leader & LATAM Staff at Brave Software.",
    "hire": "Best way to start is clicking the floating \"Quote\" button with your project details, or booking a call on Calendly — Wilfredo will follow up personally.",
    "linkedin": "You can find Wilfredo on LinkedIn (linkedin.com/in/wilfredo-caro), X (@wilfredo_caro), GitHub (github.com/BTCWFD), and Instagram/TikTok (@wilfredwfdcarog).",
    "github": "Wilfredo's public repos are on GitHub at github.com/BTCWFD, including Antigravity Monitor and ORBIT-APP.",
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
    "press kit": "¿Necesitas un press kit de DJ? Wilfredo diseña press kits digitales para artistas. Haz clic en el botón \"Cotizar\" para solicitarlo.",
    "dj": "¡Wilfredo también es DJ! Le apasiona el Deep Tech. Puedes escuchar sus mezclas en el reproductor integrado.",
    "music": "¡Wilfredo también es DJ! Le apasiona el Deep Tech. Puedes escuchar sus mezclas en el reproductor integrado.",
    "contacto": "Por favor, desbloquea los detalles de contacto en el pie de página.",
    "pagina web": "Wilfredo crea páginas web y apps a medida: landing pages, portafolios, dashboards e integraciones Web3. Haz clic en el botón flotante \"Cotizar\" para contarnos los detalles de tu proyecto.",
    "página web": "Wilfredo crea páginas web y apps a medida: landing pages, portafolios, dashboards e integraciones Web3. Haz clic en el botón flotante \"Cotizar\" para contarnos los detalles de tu proyecto.",
    "sitio web": "Wilfredo crea sitios web y apps a medida: landing pages, portafolios, dashboards e integraciones Web3. Haz clic en el botón flotante \"Cotizar\" para contarnos los detalles de tu proyecto.",
    "chatbot": "¿Necesitas un chatbot o un sistema de agentes de IA para tu negocio? Es justo lo que hace Wilfredo. Haz clic en el botón \"Cotizar\" para contarnos más.",
    "marca personal": "Wilfredo puede potenciar tu marca personal con SEO, estrategia de contenido y diseño premium. Haz clic en el botón \"Cotizar\" para empezar.",
    "precio": "Cada proyecto es único, así que no puedo darte una cifra exacta aquí. Haz clic en el botón flotante \"Cotizar\" para contarnos los detalles, o agenda una llamada en Calendly para hablar directamente.",
    "costo": "Cada proyecto es único, así que no puedo darte una cifra exacta aquí. Haz clic en el botón flotante \"Cotizar\" para contarnos los detalles, o agenda una llamada en Calendly para hablar directamente.",
    "tarifa": "Cada proyecto es único, así que no puedo darte una cifra exacta aquí. Haz clic en el botón flotante \"Cotizar\" para contarnos los detalles, o agenda una llamada en Calendly para hablar directamente.",
    "cuesta": "Cada proyecto es único, así que no puedo darte una cifra exacta aquí. Haz clic en el botón flotante \"Cotizar\" para contarnos los detalles, o agenda una llamada en Calendly para hablar directamente.",
    "experiencia": "Wilfredo es actualmente Founder & CEO en VirtuadsAi y CTO en Orbit. Antes trabajó como Fullstack & Blockchain Architect en ExEquine, Business Development Associate en CornerMarket, y Regional Leader & LATAM Staff en Brave Software.",
    "trayectoria": "Wilfredo es actualmente Founder & CEO en VirtuadsAi y CTO en Orbit. Antes trabajó como Fullstack & Blockchain Architect en ExEquine, Business Development Associate en CornerMarket, y Regional Leader & LATAM Staff en Brave Software.",
    "contratar": "La mejor forma de empezar es hacer clic en el botón flotante \"Cotizar\" con los detalles de tu proyecto, o agendar una llamada en Calendly — Wilfredo te responderá personalmente.",
    "linkedin": "Puedes encontrar a Wilfredo en LinkedIn (linkedin.com/in/wilfredo-caro), X (@wilfredo_caro), GitHub (github.com/BTCWFD) e Instagram/TikTok (@wilfredwfdcarog).",
    "redes": "Puedes encontrar a Wilfredo en LinkedIn (linkedin.com/in/wilfredo-caro), X (@wilfredo_caro), GitHub (github.com/BTCWFD) e Instagram/TikTok (@wilfredwfdcarog).",
    "github": "Los repos públicos de Wilfredo están en GitHub: github.com/BTCWFD, incluyendo Antigravity Monitor y ORBIT-APP.",
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
    "ウェブサイト": "ウィルフレドはランディングページ、ポートフォリオ、ダッシュボード、Web3連携などオーダーメイドのウェブサイトやアプリを制作します。フローティングの「見積もり」ボタンからプロジェクトの詳細をお知らせください。",
    "チャットボット": "ビジネス向けのAIチャットボットやマルチエージェントシステムが必要ですか？それこそウィルフレドの専門です。「見積もり」ボタンをクリックして詳細をお知らせください。",
    "ブランド": "ウィルフレドはSEO、コンテンツ戦略、プレミアムデザインでパーソナルブランドを強化できます。「見積もり」ボタンから始めましょう。",
    "プレスキット": "DJ用プレスキットが必要ですか？ウィルフレドはアーティスト向けのデジタルプレスキットを制作します。「見積もり」ボタンからご依頼ください。",
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
    "网站": "Wilfredo可以为您定制网站和应用程序——落地页、作品集、仪表盘、Web3集成等。点击悬浮的\"报价\"按钮，告诉我们您的项目详情。",
    "聊天机器人": "需要为您的企业打造AI聊天机器人或多智能体系统吗？这正是Wilfredo擅长的领域。点击\"报价\"按钮告诉我们更多信息。",
    "个人品牌": "Wilfredo可以通过SEO、内容策略和高端设计提升您的个人品牌。点击\"报价\"按钮开始吧。",
    "新闻资料包": "需要DJ新闻资料包吗？Wilfredo为艺术家设计数字新闻资料包。点击\"报价\"按钮提交申请。",
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
    "웹사이트": "Wilfredo는 랜딩 페이지, 포트폴리오, 대시보드, Web3 연동 등 맞춤형 웹사이트와 앱을 제작합니다. 플로팅 \"견적\" 버튼을 클릭해 프로젝트 세부 사항을 알려주세요.",
    "챗봇": "비즈니스를 위한 AI 챗봇이나 멀티 에이전트 시스템이 필요하신가요? 바로 Wilfredo의 전문 분야입니다. \"견적\" 버튼을 클릭해 더 알려주세요.",
    "퍼스널 브랜드": "Wilfredo는 SEO, 콘텐츠 전략, 프리미엄 디자인으로 퍼스널 브랜드를 강화할 수 있습니다. \"견적\" 버튼을 클릭해 시작하세요.",
    "프레스킷": "DJ 프레스킷이 필요하신가요? Wilfredo는 아티스트를 위한 디지털 프레스킷을 디자인합니다. \"견적\" 버튼을 클릭해 요청하세요.",
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
    "веб-сайт": "Вильфредо создаёт сайты и приложения на заказ: лендинги, портфолио, дашборды, интеграции с Web3. Нажмите плавающую кнопку «Заказать», чтобы рассказать о вашем проекте.",
    "чат-бот": "Нужен ИИ чат-бот или мультиагентная система для бизнеса? Это именно то, чем занимается Вильфредо. Нажмите кнопку «Заказать», чтобы рассказать подробнее.",
    "личный бренд": "Вильфредо поможет усилить ваш личный бренд с помощью SEO, контент-стратегии и премиального дизайна. Нажмите «Заказать», чтобы начать.",
    "пресс-кит": "Нужен пресс-кит для диджея? Вильфредо создаёт цифровые пресс-киты для артистов. Нажмите «Заказать», чтобы оформить заявку.",
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
    "موقع ويب": "يصمم ويلفريدو مواقع ويب وتطبيقات مخصصة: صفحات هبوط، معارض أعمال، لوحات تحكم، وتكاملات Web3. اضغط على زر \"طلب عرض سعر\" العائم لمشاركة تفاصيل مشروعك.",
    "شات بوت": "هل تحتاج إلى شات بوت بالذكاء الاصطناعي أو نظام وكلاء متعدد لعملك؟ هذا بالضبط ما يقدمه ويلفريدو. اضغط على زر \"طلب عرض سعر\" لمشاركة التفاصيل.",
    "علامة شخصية": "يمكن لويلفريدو تعزيز علامتك الشخصية عبر تحسين محركات البحث واستراتيجية المحتوى والتصميم الاحترافي. اضغط على زر \"طلب عرض سعر\" للبدء.",
    "بروشور": "هل تحتاج إلى بروشور صحفي لدي جي؟ يصمم ويلفريدو بروشورات صحفية رقمية للفنانين. اضغط على زر \"طلب عرض سعر\" لطلب واحد.",
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
