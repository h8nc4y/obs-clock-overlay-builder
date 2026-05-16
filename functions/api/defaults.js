export async function onRequest(context) {
  const cf = context.request.cf || {};
  return Response.json({
    timezone: typeof cf.timezone === "string" ? cf.timezone : null,
    country: typeof cf.country === "string" ? cf.country : null,
    source: cf.timezone || cf.country ? "cloudflare" : "fallback"
  });
}
