# Arjun — Personal Website

A static, single-page personal site (hero + about + projects + blogs + spotify).
No build step, no backend — it's plain HTML/CSS/JS and runs anywhere.

## Files
- `index.html` — the entire site
- `assets/intro.js` — the Buddha line-art intro animation

External dependencies load over the network (nothing to install):
- Google Fonts (IBM Plex Mono)
- Spotify embed/IFrame API (for the soundbar previews)

---

## Deploy

### Option 1 — GitHub Pages (recommended)
1. Create a repo and commit `index.html` + the `assets/` folder.
2. Repo → **Settings → Pages** → Source: **Deploy from branch**, branch `main`, folder `/ (root)`.
3. Your site goes live at `https://<username>.github.io/<repo>/`.
4. Custom domain: add a file named `CNAME` containing your domain (e.g. `arjun.dev`),
   then point your domain's DNS at GitHub Pages. HTTPS is automatic.

### Option 2 — Netlify / Vercel (drag-and-drop)
1. Drag this folder onto https://app.netlify.com/drop (or run `vercel deploy`).
2. You get a live URL instantly. Add a custom domain in the dashboard.

---

## Spotify — what works and what doesn't

**Works on a static host (no backend):**
- The themed soundbar plays 30-second **previews** via Spotify's embed API.
- The 3 playlist cards + personal notes (they're hardcoded in `index.html`).
- Tip: the embed behaves best on a real `https://` domain. Autoplay only starts
  after a user interaction (navigating to the Spotify view counts).

**Does NOT work static-only — needs a small backend:**
- Genuinely **live** data ("pull my actual top playlists / recently played").
- This requires the Spotify Web API (OAuth + a client secret). The secret CANNOT
  live in browser HTML, so you need a serverless function.

### To make Spotify truly live (later, in Claude Code)
1. Register an app at https://developer.spotify.com → get Client ID + Secret.
2. Add a serverless function (Netlify Functions or Vercel Functions, ~30 lines):
   - Stores your refresh token server-side and does the OAuth token exchange.
   - Calls `/me/top/artists`, `/me/playlists`, or `/me/player/recently-played`.
   - Returns clean JSON to the page.
3. Replace the hardcoded playlist array in `index.html` with a `fetch()` to that function.
4. Keep the soundbar on the embed API (no auth needed).

---

## Editing content
For now, projects and blog posts are hardcoded in `index.html`:
- Projects: the `PROJECTS` array in the `<script>` block.
- Blogs: the blog `<article>` markup / posts list.

When this gets tedious, move them to a `content.json` (fetch + render) or migrate
to Jekyll/Astro for a real Markdown blog workflow.

---

## Designing more
Keep using the design environment for visual/animation work (new sections,
redesigns, intro variants, color/type explorations), then bring the updated
HTML back into this repo. Push the repo to GitHub so design passes can be made
against your real, current code.
