# play

**[play.sankhacooray.com](https://play.sankhacooray.com)** — the games & playful interaction hub in the
sankhacooray.com network: Stakco rotating ring puzzles (web, Android, Galaxy Watch, floor tiles, walking),
iTiles floor-tile games, Kiwrious Play, DartsAR augmented-reality darts and the Geodex city treasure hunt.
For game designers, HCI and toy/puzzle people. Creative-coding toys (Gyro Shapes, Magic Bells) live in sense / music.

Served by a Cloudflare Worker (`play-sankhacooray`): static assets from `public/`, plus `src/worker.js`, whose
`/api/og?url=` route fetches a project site's current `og:image` (allowlisted hosts only, cached 1 h). Cards with an
`og` page in `projects.json` show their screenshot (or a shared fallback), then fade to that live image.
The VS Code workspace for the hub and its projects is `../play-sankhacooray-com.code-workspace`.

## Files

| Path | Purpose |
|------|---------|
| `projects.json` | Content: research areas, projects, roles, years, live links, parts |
| `template.html` | Page template (CSS + JS inline), hero illustration and particle glyphs |
| `footer.html` | One-line footer, placed in the last section |
| `build.py` | Renders `public/index.html`, one screen per area, as static HTML for crawlers |
| `public/thumbs/` | Screenshots (800×420) of the projects |
| `og/thumbs.html` | Drawn thumbnails for Stakco Watch and Stakco iTiles (no public screen to capture) |
| `public/og.png` | 1200×630 share image, rendered from `og/og.html` |
| `public/icon*.png`, `icon.svg`, `apple-touch-icon.png`, `manifest.webmanifest` | Icons + PWA manifest |
| `src/worker.js` | Serves assets; `/api/og` live share-image proxy |
| `wrangler.toml` | Worker config + custom domain (creates the DNS record) |

Roles on each card: **Mine** (I built and run it), **Co-owned** (shared ownership: Stakco, Kiwrious),
**Contributed** (belongs to another team or org — here iTiles at the Augmented Human Lab).
Only live sites are linked; several source repositories are private.

**Legacy Pages files.** `index.html`, `CNAME`, `og-image.png`, the root icons, `manifest.webmanifest` and `thumbs/`
at the repo root are the old single-file play hub, still served by GitHub Pages. They stay until the domain is
switched to the Worker (the existing `play` CNAME record must be removed before `wrangler deploy` can attach the
custom domain). Then delete them and turn off Pages.

## Edit, preview, deploy

```
python3 build.py
python3 -m http.server 4798 --bind 127.0.0.1 -d public
CLOUDFLARE_ACCOUNT_ID=9a1da48a0f61e7cebcba39517856d87e npx wrangler deploy
```

The local preview has no `/api/og`, so Geodex keeps its screenshot until deployed.

Share image: edit `og/og.html`, render it, and bump `?v=N` on `og:image`/`twitter:image` in `template.html`:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=6000 \
  --allow-file-access-from-files --screenshot=public/og.png "file://$PWD/og/og.html"
```

Drawn thumbnails: render `og/thumbs.html#watch` and `#itiles` the same way at 800×420 (2× then downscale) into
`public/thumbs/stakco-watch.jpg` and `stakco-itiles.jpg`.

After deploying, curl the page, `og.png`, the icons and `/api/og` to confirm 200s and the right content types.
