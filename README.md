# SHM Digital Marketing — Website

Static site: `index.html`, `style.css`, `script.js`. No build step needed.

## Add your own images/videos

The HTML already points at these filenames — no code editing needed, just add
the files with these exact names next to `index.html` (same folder, e.g. the
root of your GitHub repo):

1. **Logo** — add `logo.png` next to `index.html`. It's referenced in both
   the header and footer already. If the file is missing, the "SHM" text
   mark shows instead, so the site never breaks — it just falls back until
   you add the real file.

2. **Founder photo** — add `founder.jpg` next to `index.html`. Same
   fallback behavior: shows a placeholder card until the file exists.

   Using `.jpg`/`.png` but named differently? Rename your files to
   `logo.png` and `founder.jpg` (or edit the two `src="..."` values in
   `index.html` to match your filenames).

## Highlights section

The "What powers your growth" section (5 animated orbit badges) is built
entirely in CSS/SVG — no images or video files needed, nothing to upload.
Edit the text directly in `index.html` under `<!-- ================= HIGHLIGHTS ================= -->`
if you want to change the titles or captions.

## Deploy to Vercel

1. Push this folder to a GitHub repo (or drag-and-drop it into Vercel's
   dashboard).
2. In Vercel: **New Project → Import** the repo.
3. Framework preset: **Other** (it's a static site, no build command needed).
4. Deploy — done.

Or with the Vercel CLI, from inside this folder:
```bash
npm i -g vercel
vercel
```

## Notes

- Business contact links (email / Telegram / phone) are already wired up as
  clickable `mailto:`, `https://t.me/...`, and `tel:` links.
- Colors, type, and the rotating "halo" motif are defined as CSS variables at
  the top of `style.css` if you want to adjust the palette later.
