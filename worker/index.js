/*
 * Cloudflare Worker for the site.
 *
 * Normal files (the built website in dist/) are served automatically by Cloudflare's
 * static assets. Any request that doesn't match one of those files comes here.
 * We serve the event radar images from the R2 bucket bound as env.RADAR:
 *   /radar/events/<event-id>/<file>.webp  ->  R2 object "events/<event-id>/<file>.webp"
 * Everything else falls back to the static assets (which return 404 if missing).
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isRead = request.method === "GET" || request.method === "HEAD";

    if (isRead && url.pathname.startsWith("/radar/events/")) {
      const key = decodeURIComponent(url.pathname.slice("/radar/".length));
      // Only plain "events/<id>/<file>.webp" keys: nothing else in the bucket is reachable.
      if (!/^events\/[a-z0-9-]+\/[A-Za-z0-9._-]+\.webp$/.test(key)) {
        return new Response("Not found", { status: 404 });
      }
      const object = await env.RADAR.get(key);
      if (!object) return new Response("Not found", { status: 404 });

      const headers = new Headers();
      object.writeHttpMetadata(headers); // content type saved at upload
      headers.set("etag", object.httpEtag);
      headers.set("cache-control", "public, max-age=86400"); // browsers can keep them a day
      if (!headers.has("content-type")) headers.set("content-type", "image/webp");
      return new Response(request.method === "HEAD" ? null : object.body, { headers });
    }

    return env.ASSETS.fetch(request);
  },
};
