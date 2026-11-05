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
