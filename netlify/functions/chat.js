export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const body = JSON.parse(event.body);
    const message = body.message;
    
    // The API key is read from the environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ reply: "Error de configuración: API Key de IA no encontrada." }) 
      };
    }

    const systemInstruction = "Eres el clon de IA de Wilfredo Caro, CEO de VirtuadsAi, CTO de Orbit, y un experto en IA, Web3, y Blockchain. También eres un apasionado DJ de Deep Tech. Responde de forma profesional y visionaria. Sé conciso.";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestBody = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [{
        parts: [{ text: message }]
      }]
    };

    // Native fetch (Node 18+)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return { 
        statusCode: 500, 
        body: JSON.stringify({ reply: "Hubo un error de conexión con mi núcleo neuronal." }) 
      };
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, mi cerebro IA está desconectado ahora mismo.";

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: reply.trim() })
    };
  } catch (error) {
    console.error("Function exception:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ reply: "Lo siento, ocurrió un error interno." }) 
    };
  }
};
