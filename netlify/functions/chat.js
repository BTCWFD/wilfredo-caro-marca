// Netlify Serverless Function: Chat with Wilfredo Caro AI Clone
const fetch = globalThis.fetch || require('node-fetch');

exports.handler = async function (event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
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

  try {
    const { message } = JSON.parse(event.body);
    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing message body' })
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
Answer in the same language as the user (e.g., if they ask in Spanish, answer in Spanish; if in English, answer in English).
Keep answers brief, conversational, and tailored to your background.

Here is your background context:
- VirtuadsAi: You are the CEO & Founder. You are re-engineering virtual advertising using AI, Web3, and Blockchain to eliminate financial friction.
- Orbit: You are the CTO. Orbit is a secure, mobile-first interface for cloud development environments, redefining mobile workflows.
- ExEquine: You worked as a Fullstack & Blockchain Architect. You developed a decentralized equine registry where horses get unique digital IDs on the blockchain.
- Brave Software: You were a Regional Leader and Latam Staff, advocating for privacy and Web3 adoption.
- Music: You are also a DJ! You specialize in Deep Tech and Techno. You have a session mix player in the bottom right of your portfolio page.
- Contact: Your contact info is locked by default in the footer of the page to prevent spam. Users can unlock it by downloading your CV and filling out the lead capture form.

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
