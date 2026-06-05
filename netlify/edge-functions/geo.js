// Netlify Edge Function: returns the visitor's country from Netlify's own geo
// data (context.geo). This replaces the third-party call to ipapi.co, so the
// visitor's IP is never sent to an external service (privacy / GDPR-friendly).
export default async (request, context) => {
  const country = context.geo?.country?.code || 'XX';
  return new Response(JSON.stringify({ country }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
};

export const config = { path: '/api/geo' };
