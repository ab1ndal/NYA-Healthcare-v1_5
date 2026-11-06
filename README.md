# NYA Healthcare

`NYA_Healthcare.html` is the deployed page. Work-in-progress edits go in separate local files (e.g. `nya-healthcare-v1-*.html`) until ready.

## Local preview with auto-reload

Browsers don't reload `file://` pages on save. Serve the folder with a live-reload server instead — this also matches production behavior more closely (video loading, scripts).

### Option 1: VS Code Live Server (easiest)

1. Install the **Live Server** extension (Ritwick Dey).
2. Right-click `NYA_Healthcare.html` → **Open with Live Server**.
3. Page opens at `http://127.0.0.1:5500/NYA_Healthcare.html` and reloads on every save.

### Option 2: live-server (terminal, requires Node.js)

From the repo folder:

```
npx live-server --open=NYA_Healthcare.html
```

Watches all files in the folder (HTML, CSS, JS, videos). Stop with `Ctrl+C`.

### Option 3: browser-sync (adds phone testing)

```
npx browser-sync start --server --files "*.html" --startPath NYA_Healthcare.html
```

Prints a **External** LAN URL — open it on a phone on the same Wi-Fi to test the mobile layout. All connected devices reload together on save.

## Media rules (read before adding or changing images/videos)

All images and videos are hosted on nyase.com WordPress and linked by URL. On 2026-11-06 every media file was optimized and re-linked. This cut the page's media from ~160 MB to ~51 MB and the HTML from 4 MB to 0.26 MB. Please keep it that way:

- **Never embed images as `data:...;base64`** in the HTML. Embedded images made the file 15x larger and slowed loading on every visit. Browsers also couldn't cache or lazy-load them, and editing and searching the file took much longer.
- **Don't switch links back to the old PNG/JPG or full-size MP4 URLs.** The old files are still in WordPress but are 5–10x larger. The current links point to the optimized `2026/11/*.webp` and `*-opt.mp4` / `*-720.mp4` / `*-960.mp4` files.
- **Images:** WebP, quality ~80, max 2400px wide (no wider than they display at 2x). Exception: full-bleed photos may go to 2880px for 1440px laptops at 2x (e.g. the UCI photo `ucidouglaswhite-1.webp`).
- **Videos:** H.264 MP4, no audio, `+faststart`, scaled to display size (command in `TODO.md`). Every `<video>` keeps a `poster` image so phones don't show a blank box.
- **Uploading:** add as new files in WordPress, never replace existing ones (other pages may use them). WordPress renames images on upload, removing hyphens and trailing numbers (e.g. `nya-closing-base.webp` → `nyaclosingbase.webp`). Copy the final URL from the Media Library, not the local filename.
