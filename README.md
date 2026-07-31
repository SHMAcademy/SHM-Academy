# SHM Digital Marketing — Website

Static site: `index.html`, `style.css`, `script.js`. No build step needed.

## Add your own images/videos

1. **Logo** — put your logo file next to `index.html` (e.g. `logo.png`), then in
   `index.html` find the comment `=== LOGO SLOT ===` (inside `.brand-mark`) and
   replace `<span>SHM</span>` with:
   ```html
   <img src="logo.png" alt="SHM Digital Marketing logo">
   ```

2. **Founder photo** — put your photo next to `index.html` (e.g. `founder.jpg`),
   then find the comment `=== FOUNDER PHOTO SLOT ===` and replace the
   placeholder `<div class="placeholder-mark">...</div>` with:
   ```html
   <img src="founder.jpg" alt="Founder of SHM Digital Marketing">
   ```

3. **Reels / motion clips** — create a `reels/` folder next to `index.html`
   and add `reel-1.mp4`, `reel-2.mp4`, `reel-3.mp4` (short, muted, looping
   clips work best — 9:16 vertical). The `<video>` tags in the "Work" section
   already point to those paths, so they'll appear automatically once the
   files exist. Add a `poster="..."` image on each `<video>` tag if you want
   a still frame to show before playback.

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
