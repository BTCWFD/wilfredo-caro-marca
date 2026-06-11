// Netlify Serverless Function: validate a lead and unlock gated resources.
// Returns the contact details (which live ONLY server-side, never in the client
// bundle) plus a short-lived signed token used to download the CV.
const crypto = require('crypto');

// Configure these in the Netlify dashboard (Site settings -> Environment variables):
//   UNLOCK_SECRET  -> a long random string used to sign tokens (REQUIRED for real security)
//   CONTACT_EMAIL  -> the email revealed after a valid lead
//   CONTACT_PHONE  -> the phone revealed after a valid lead
const SECRET = process.env.UNLOCK_SECRET;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET;
if (!SECRET || !TURNSTILE_SECRET) {
  console.error('Missing required environment variables: UNLOCK_SECRET or TURNSTILE_SECRET');
  // Continuing with caution, but operations will fail without these
}

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'wilfredwfd86@gmail.com';
const CONTACT_PHONE = process.env.CONTACT_PHONE || '+57 321 972 35 13';
const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

const ALLOWED_ORIGINS = [
  'https://wilfredocaro.com',
  'https://www.wilfredocaro.com',
  'https://wilfredo-caro.netlify.app'
];

function sign(payloadB64) {
  return crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
}
function makeToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.handler = async function (event) {
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'null';
  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const email = typeof data.email === 'string' ? data.email.trim() : '';
    const company = typeof data.company === 'string' ? data.company.trim() : '';
    const purpose = typeof data.purpose === 'string' ? data.purpose.trim() : '';

    const turnstileToken = typeof data.turnstileToken === 'string' ? data.turnstileToken.trim() : '';

    if (!name || !email || !company || !purpose || !turnstileToken) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
    }
    if (name.length > 120 || email.length > 160 || company.length > 160 || !EMAIL_RE.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid input' }) };
    }

    // Turnstile Validation
    if (!TURNSTILE_SECRET) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error' }) };
    }
    
    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET);
    formData.append('response', turnstileToken);

    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Turnstile verification failed' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token: makeToken(),
        email: CONTACT_EMAIL,
        phone: CONTACT_PHONE
      })
    };
  } catch (err) {
    console.error('unlock function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
