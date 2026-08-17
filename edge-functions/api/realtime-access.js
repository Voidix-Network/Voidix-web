export function onRequestGet({ request }) {
  const allowed = request.eo?.geo?.countryCodeAlpha2 === 'CN';

  return new Response(JSON.stringify({ allowed, reason: allowed ? 'available' : 'outside-mainland' }), {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'cache-control': 'private, no-store',
    },
  });
}
