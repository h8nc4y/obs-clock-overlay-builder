export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/defaults") {
      const cf = request.cf || {};
      const timezone = typeof cf.timezone === "string" ? cf.timezone : null;
      const country = typeof cf.country === "string" ? cf.country : null;

      return Response.json({
        timezone,
        country,
        source: timezone || country ? "cloudflare" : "fallback"
      });
    }

    return env.ASSETS.fetch(request);
  }
};
