// Netlify Serverless Function: stream the CV PDF only when given a valid,
// non-expired token issued by the `unlock` function. The PDF lives in /private
// (outside the published site), so it cannot be fetched by direct URL.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SECRET = process.env.UNLOCK_SECRET;
if (!SECRET) {
  throw new Error('FATAL: UNLOCK_SECRET environment variable is missing.');
}
const PDF_NAME = 'Wilfredo-CV-2026.pdf';

function sign(payloadB64) {
  return crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
}
function verifyToken(token) {
  if (!token || typeof token !== 'string' || token.indexOf('.') === -1) return false;
  const [payload, sig] = token.split('.');
  const expected = sign(payload);
  
  // Hash to prevent length-based timing attacks and buffer mismatches
  const hashA = crypto.createHash('sha256').update(sig).digest();
  const hashB = crypto.createHash('sha256').update(expected).digest();
  
  if (!crypto.timingSafeEqual(hashA, hashB)) return false;
  
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && Date.now() < exp;
  } catch (e) {
    return false;
  }
}

function findPdf() {
  const candidates = [
    path.join(process.cwd(), 'private', PDF_NAME),
    path.resolve(__dirname, '../../private', PDF_NAME),
    path.join(process.env.LAMBDA_TASK_ROOT || '', 'private', PDF_NAME),
  ];
  return candidates.find((p) => { try { return fs.existsSync(p); } catch (e) { return false; } });
}

exports.handler = async function (event) {
  const headers = { 'Cache-Control': 'no-store' };

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  const token = (event.queryStringParameters && event.queryStringParameters.token) || '';
  if (!verifyToken(token)) {
    return { statusCode: 403, headers, body: 'Forbidden: invalid or expired token.' };
  }

  const pdfPath = findPdf();
  if (!pdfPath) {
    console.error('CV PDF not found in any candidate path.');
    return { statusCode: 404, headers, body: 'Not Found' };
  }

  const file = fs.readFileSync(pdfPath);
  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${PDF_NAME}"`,
    },
    body: file.toString('base64'),
    isBase64Encoded: true,
  };
};
