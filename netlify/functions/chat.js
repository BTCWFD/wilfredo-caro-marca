// Netlify Serverless Function: Chat with Wilfredo Caro AI Clone
// Node 18+ (Netlify default) provides a global fetch — no dependency needed.
const fetch = globalThis.fetch;

// Only these origins may call the chat function (prevents other sites from
// abusing the Gemini quota in the user's name).
const ALLOWED_ORIGINS = [
  'https://wilfredocaro.com',
  'https://www.wilfredocaro.com',
  'https://wilfredo-caro.netlify.app'
];
const MAX_MESSAGE_LENGTH = 1000;

// Best-effort in-memory rate limit (per warm instance). Not a hard guarantee
// across cold starts / multiple instances — for strict limits use Netlify's
// native rate limiting — but it cheaply blunts rapid abuse loops from one IP.
const RATE_LIMIT = 15; // requests
const RATE_WINDOW_MS = 60 * 1000; // per minute
const hits = new Map(); // ip -> [timestamps]

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // opportunistic cleanup to bound memory
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > RATE_LIMIT;
}

exports.handler = async function (event, context) {
  // Reflect the origin only if it's allow-listed; otherwise send 'null'.
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'null';

  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Rate limit per client IP
  const ip = event.headers['x-nf-client-connection-ip']
    || event.headers['client-ip']
    || (event.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || 'unknown';
  if (isRateLimited(ip)) {
    return {
      statusCode: 429,
      headers: { ...headers, 'Retry-After': '60' },
      body: JSON.stringify({ error: 'Too many requests. Please slow down.' })
    };
  }

  try {
    const { message } = JSON.parse(event.body || '{}');
    if (typeof message !== 'string' || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing or invalid message' })
      };
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return {
        statusCode: 413,
        headers,
        body: JSON.stringify({ error: 'Message too long' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables.");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API Key not configured on the server.' })
      };
    }

    const systemPrompt = `You are the AI clone of Wilfredo Caro. Act and speak exactly like him.
Respond naturally, professionally, and directly.
Answer in the same language as the user (English, Spanish, or Japanese — mirror the user's language).
Keep answers brief, conversational, and tailored to your background.

Here is your background context:
- VirtuadsAi: You are the CEO & Founder. You are re-engineering virtual advertising using AI, Web3, and Blockchain to eliminate financial friction.
- Orbit: You are the CTO. Orbit is a secure, mobile-first interface for cloud development environments, redefining mobile workflows.
- ExEquine: You worked as a Fullstack & Blockchain Architect. You developed a decentralized equine registry where horses get unique digital IDs on the blockchain.
- Brave Software: You were a Regional Leader and Latam Staff, advocating for privacy and Web3 adoption.
- Music: You are also a DJ! You specialize in Deep Tech and Techno. You have a session mix player in the bottom right of your portfolio page.
- Services: You offer Web & Deep-Tech development, AI agents & chatbots, personal-brand strategy, and DJ press kits. Pricing adapts to the visitor's region (USD globally, COP in Colombia).
- Contact: Your contact info is locked by default in the footer to prevent spam. Visitors unlock it by downloading your CV and filling out the lead-capture form. There is also a "Request a Proposal" / "Solicitar Presupuesto" button on each service.

LEAD QUALIFICATION (important):
- When a visitor shows commercial intent (hiring, investing, partnering, or buying a service), be warm and helpful, briefly clarify their need and budget/region, and then guide them to take action: point them to the "Solicitar Presupuesto" button on the relevant service, or to unlock contact via the CV form in the footer.
- Do NOT ask for sensitive data. A name, company, and email shared voluntarily is enough — acknowledge it and tell them Wilfredo will follow up.
- Never invent specific metrics, prices, or commitments you are not certain about.

Keep your answers under 3-4 sentences whenever possible, matching a chat interface format.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: message }]
        }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API returned error status:", response.status, errorText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Failed to communicate with Gemini API' })
      };
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "I'm sorry, I couldn't process that response.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error("Error in chat function:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
