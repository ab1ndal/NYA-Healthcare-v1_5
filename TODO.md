# NYA Healthcare v1.5 — TODO

Live: https://ab1ndal.github.io/NYA-Healthcare-v1_5/NYA_Healthcare.html
Repo: https://github.com/ab1ndal/NYA-Healthcare-v1_5

This repo + GitHub Pages = in-progress dev copy. Production is published periodically to GoDaddy; media (videos, images) hosted on nyase.com WordPress.

Owners: `AB` Abhinav Bindal (this machine) · `MB` Michael Beshay (WordPress)

Status: `Not started` · `In progress` · `Blocked` · `Done`

## Video performance

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| V1 | Decide hosting for optimized videos | AB | Done | WordPress (nyase.com) — real site experience |
| V2 | Re-encode `New-Stanford-Hospital_V1.mp4` → 1080p, CRF ~26, `+faststart` | AB | Done | 43 MB → 19 MB; 1920x1080, 24 fps, 5.3 Mbps, faststart |
| V3 | Re-encode `UCSF-VE-No-Labels_07-20-2026.mp4` → 30 fps, CRF ~26, `+faststart` | AB | Done | 70 MB → 25 MB; 1280x794, 30 fps, 3.9 Mbps, faststart |
| V4 | Upload re-encoded videos to nyase.com WordPress, share new URLs | AB | Done | Uploaded 2026-11-06 as `2026/11/*-opt.mp4` |
| V5 | Update video `src` URLs in `NYA_Healthcare.html` | AB | Done | |
| V6 | Change hero video `#ucsf-bg-video` `preload="auto"` → `preload="metadata"` | AB | Done | |
| V7 | Verify fast playback on live site | AB | Not started | |

Encode command:
```
ffmpeg -i in.mp4 -vf "scale=-2:1080,fps=30" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart out.mp4
```

## GitHub Pages

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| P1 | Make site root URL work (`index.html` redirect or rename page) | AB | Not started | Root URL currently 404s |

## Images

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| I1 | Upload `uci-douglas-white.webp` (UCI photo, sky replaced with white) to nyase.com WordPress, relink `#uci-delivery-proof` to the WordPress URL, then delete the file and its `!uci-douglas-white.webp` line in `.gitignore` | AB | Done | Uploaded 2026-11-06 as `2026/11/ucidouglaswhite.webp`; `srcset` added with the 2880w upscale `ucidouglaswhite-1.webp` (+ WordPress `-1-scaled` 2560w) |
| I2 | Upload `nya-closing-hospital-whole.webp` and `nya-closing-tree-whole.webp` (closing section: whole building on the canopy, right-hand tree) to nyase.com WordPress, relink `.nya-s33-hospital` and `.nya-s33-tree` to the WordPress URLs, then delete both files and their `!` lines in `.gitignore`. The old `nyaclosinghospital.webp` / `nyaclosingtree.webp` crops no longer fit the layout | MB | Not started | Base and line art are unchanged and already linked to WordPress |

## Done

| # | Task | Owner | Status |
|---|------|-------|--------|
| D1 | Create repo, track only `NYA_Healthcare.html` | AB | Done |
| D2 | Rename repo to `NYA-Healthcare-v1_5` | AB | Done |
| D3 | Make repo public, enable GitHub Pages | AB | Done |
| D4 | Verify external links (all https; nyase.com images allow hotlinking) | AB | Done |
| D5 | Diagnose slow video playback | AB | Done |
