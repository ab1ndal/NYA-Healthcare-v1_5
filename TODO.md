# NYA Healthcare v1.5 — TODO

Live: https://ab1ndal.github.io/NYA-Healthcare-v1_5/NYA_Healthcare.html
Repo: https://github.com/ab1ndal/NYA-Healthcare-v1_5

Owners: `AB` Abhinav Bindal (this machine) · `MB` Michael Beshay (WordPress)

Status: `Not started` · `In progress` · `Blocked` · `Done`

## Video performance

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| V1 | Decide hosting for optimized videos (nyase.com WordPress vs. this repo) | AB | Not started | Blocks V4 |
| V2 | Re-encode `New-Stanford-Hospital_V1.mp4` → 1080p, CRF ~26, `+faststart` | AB | Not started | Now 43 MB, 2560x1440, 12.3 Mbps, no faststart |
| V3 | Re-encode `UCSF-VE-No-Labels_07-20-2026.mp4` → 30 fps, CRF ~26, `+faststart` | AB | Not started | Now 70 MB, 60 fps, 11 Mbps, no faststart |
| V4 | Upload/host re-encoded videos | MB / AB | Blocked | Depends on V1 (WordPress → MB; repo → AB) |
| V5 | Update video `src` URLs in `NYA_Healthcare.html` | AB | Blocked | Depends on V4 |
| V6 | Change hero video `#ucsf-bg-video` `preload="auto"` → `preload="metadata"` | AB | Not started | |
| V7 | Verify fast playback on live site | AB | Blocked | Depends on V5 |

Encode command:
```
ffmpeg -i in.mp4 -vf "scale=-2:1080,fps=30" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart out.mp4
```

## GitHub Pages

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| P1 | Make site root URL work (`index.html` redirect or rename page) | AB | Not started | Root URL currently 404s |

## Done

| # | Task | Owner | Status |
|---|------|-------|--------|
| D1 | Create repo, track only `NYA_Healthcare.html` | AB | Done |
| D2 | Rename repo to `NYA-Healthcare-v1_5` | AB | Done |
| D3 | Make repo public, enable GitHub Pages | AB | Done |
| D4 | Verify external links (all https; nyase.com images allow hotlinking) | AB | Done |
| D5 | Diagnose slow video playback | AB | Done |
