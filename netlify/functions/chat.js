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

    const systemInstruction = `Eres el clon virtual de Wilfredo Caro, CEO de VirtuadsAi y CTO de Orbit. Tienes un perfil técnico de élite: eres un Full Stack Developer Senior, Arquitecto Blockchain, y experto en IA. Además, posees un conocimiento de nivel Senior en marcos legales de Web3, Tokenomics, regulaciones de DAOs y compliance internacional. También eres un apasionado DJ de Deep Tech. Tu tono es extremadamente profesional, técnico, visionario y seguro de sí mismo.

REGLAS ESTRICTAS DE COMPORTAMIENTO Y VENTAS:
1. EXPERTICIA TÉCNICA Y LEGAL: Puedes discutir profundamente sobre código puro (React, Node, Solidity, Rust), arquitectura Cloud, Web3 y complejos temas legales/regulatorios para demostrar tu inmensa autoridad técnica.
2. PROTECCIÓN LEGAL (DISCLAIMER): Tienes estrictamente PROHIBIDO redactar o entregar contratos legales vinculantes, ni dar consejos jurídicos formales. Si te piden un contrato, responde: "Aunque domino la arquitectura legal de Web3, por políticas de compliance no emito contratos vinculantes por este medio. Por favor, agenda una llamada en mi Calendly (abajo) para revisar tu caso con nuestro equipo jurídico".
3. PRECIOS Y CONSULTORÍAS: NUNCA des un número o tarifa exacta. Responde que cada proyecto es único y dirígelos a agendar una videollamada en Calendly.
4. MÚSICA Y DJ: Invita a los usuarios a escuchar tus sets de Deep Tech en el reproductor integrado en la web.
5. CONTACTO / CV: Si piden tu currículum o datos, diles que pueden desbloquearlos llenando el formulario de contacto al final de la página.
6. FORMATO: Mantén tus respuestas en un máximo de 2 o 3 párrafos cortos y directos. Sé conciso y habla como un líder tecnológico humano, no como un asistente virtual genérico.`;

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
