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
