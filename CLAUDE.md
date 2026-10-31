# play.sankhacooray.com

Cloudflare Worker hub; see README.md. Edit `template.html` / `projects.json` / `build.py`, run `python3 build.py`, then
`CLOUDFLARE_ACCOUNT_ID=9a1da48a0f61e7cebcba39517856d87e npx wrangler deploy`. New card screenshots: also write
`public/thumbs/<name>.webp` (800×420) and `<name>-480.webp` with `cwebp`; `build.py` uses them when present, else the JPG.

## Lighthouse
<!-- lighthouse-optimized: 2026-10-31 -->
- Baseline mobile: performance 66 · accessibility 100 · best-practices 100 · SEO 100.
- Fixed: Google Fonts CSS non-blocking (`media=print` swap + noscript), which was delaying the LCP lede text; card thumbnails as WebP 480/800 srcset with per-row `sizes`; live `/api/og` images lazy-loaded; brand link's accessible name now matches its visible text; `public/_headers` gives images/icons a 30-day TTL.
- Left: `/api/og` images are other sites' 1200×630 PNG share images (resizing needs Cloudflare Image Resizing) and keep their 1 h TTL so they stay live; small forced reflow in the particle canvas setup; shared scripts/gtag/CF beacon handled centrally.
