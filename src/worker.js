// play.sankhacooray.com Worker.
// Static files in ./public are served first; anything without a matching file lands here.
//
// GET /api/og?url=<project page>
//   Reads the page's current og:image and streams that image back, so cards always show the
//   project's latest share graphic. Only the hub's own project sites are allowed (no open proxy).
//   Responds 404 when the page has no og:image or it isn't a real image; the card then keeps
//   its fallback art.

const ALLOWED_HOSTS = new Set([
  "geodex.sankhacooray.com",
  "dartsar.app",
  "play.stakcos.com",
  "stakcos.com",
]);
const TTL = 3600; // seconds browsers and the edge keep a result

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/og") return og(request, url, ctx);
    return env.ASSETS.fetch(request);
  },
};

async function og(request, url, ctx) {
  let target;
  try {
    target = new URL(url.searchParams.get("url") || "");
  } catch {
    return miss(400);
  }
  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) return miss(403);

  const cache = caches.default;
  const key = new Request(`https://play.sankhacooray.com/api/og?url=${encodeURIComponent(target.href)}`);
  const hit = await cache.match(key);
  if (hit) return hit;

  try {
    const page = await fetch(target.href, {
      headers: { "user-agent": "play.sankhacooray.com og-preview", accept: "text/html" },
      cf: { cacheTtl: TTL, cacheEverything: true },
      redirect: "follow",
    });
    if (!page.ok) return miss(404);
    const html = (await page.text()).slice(0, 200_000);
    const src = findOgImage(html);
    if (!src) return miss(404);
    const imgUrl = new URL(src, page.url || target.href);
    if (imgUrl.protocol !== "https:") return miss(404);

    const img = await fetch(imgUrl.href, { cf: { cacheTtl: TTL * 24, cacheEverything: true }, redirect: "follow" });
    const type = img.headers.get("content-type") || "";
    if (!img.ok || !type.startsWith("image/")) return miss(404);

    const res = new Response(img.body, {
      headers: {
        "content-type": type,
        "cache-control": `public, max-age=${TTL}, s-maxage=${TTL}`,
        "x-og-source": imgUrl.href,
      },
    });
    ctx.waitUntil(cache.put(key, res.clone()));
    return res;
  } catch {
    return miss(502);
  }
}

function findOgImage(html) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (/(?:property|name)\s*=\s*["']og:image(?::url)?["']/i.test(tag)) {
      const m = tag.match(/content\s*=\s*["']([^"']+)["']/i);
      if (m) return m[1].replace(/&amp;/g, "&");
    }
  }
  return null;
}

function miss(status) {
  return new Response(null, { status, headers: { "cache-control": "public, max-age=300" } });
}
