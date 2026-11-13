# Book of projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an immersive, scroll-driven three.js "Book of projects" to the gallery section of `NYA_Healthcare.html` as Option 2 beside the current gallery, with plain HTML chapters as its base layer and fallback.

**Architecture:** One DOM, two layers. The base layer is six semantic chapter articles in normal flow; it is what shows on phones, with reduced motion, in print, without WebGL and when anything fails. When a gate passes, a script pins a stage, lazy-loads three.js, and renders a book whose state is a pure function of scroll position. Real DOM text is laid over the WebGL page when it settles.

**Tech Stack:** Vanilla HTML/CSS/JS in one file, three.js 0.187.0 (vendored, lazy-loaded ES module), Playwright 1.61 for tests, image models on the Azure Foundry resource for photo layers.

**Spec:** `docs/superpowers/specs/2026-11-12-book-of-projects-design.md`. Read it first; this plan does not repeat its reasoning. Sections 11a and 11b hold the decisions this plan relies on.

## Global Constraints

- Scope is `<section class="projects" id="projects">` only. Do not change other sections, their CSS or their scripts, except the single `pins` line in `tests/scrollcheck.mjs`.
- Keep `id="projects"`. Do not delete `.projects-head` or `.value-note` (shared with Technical Excellence).
- Current gallery (Option 1) stays the default and stays untouched, including `#project-modal` and its script.
- All new CSS in `<style id="book-style">` at the end of `<head>`; all new JS in `<script id="book-behavior">` at the end of `<body>`, wrapped in an IIFE that returns if `#projects-opt-2` is missing. Section wrapped in `<!-- ======== PART: Projects ======== -->` … `<!-- ======== END PART: Projects ======== -->`.
- Tokens only: `--text-*`, `--space-*`, `--pad`, `--section`, `--display`, `--body`, `--ink`, `--ink2`, `--light`, `--gold`, `--green-on-light`. No new hard-coded font sizes or breakpoints beyond the gate query below.
- Gate for the book layer, exact: `(min-width:1024px) and (min-height:600px) and (orientation:landscape)` and not `(prefers-reduced-motion: reduce)` and a WebGL context can be created and the text fit test passes.
- No CSS scroll-snap. No non-passive `wheel`/`touchstart`/`touchmove` listeners on `window`, `document`, `body` or `html`. No `preventDefault` on wheel, touch, Space, PageUp/Down, arrows, Home, End.
- The script never changes `scrollY` except (a) on a Previous / Next / contents button press, (b) once, in the frame-rate fallback.
- No `content-visibility`, `overflow`, `filter` or `opacity<1` on the pinned stage.
- three.js loads only by dynamic `import()` when the section is within two viewport heights. Nothing from three.js on first load.
- Copy: today's card and modal copy, unchanged. US English. No invented numbers, names or dates. The only new visible strings are the ones given verbatim in this plan.
- Media: no image files committed. Derived layers go to `wp-upload/` (untracked) for MB to upload; the page links them by absolute `https://www.nyase.com/wp-content/uploads/...` URL.
- Image models may only cut, fill hidden background (sky, ground, planting), estimate depth, upscale, or make book materials. Never generate or alter a building. Every layer is compared with its source before use.
- The Foundry key is read from `ANTHROPIC_FOUNDRY_API_KEY` at run time. Never print it or write it to a file.
- No `console.log` in committed code. JS is syntax-checked with `node --check` after every script change (command in Task 1).
- Commits: only when AB asks. When asked: `git pull --rebase origin main`, then commit with subject prefix `Projects:`, then `git push origin main`. `.gitignore` is a whitelist; a new tracked file needs a `!name` line. `docs/` is not whitelisted and stays local unless AB says otherwise.

## Review Focus

1. **Reader resizes or rotates while inside the book** (laptop window dragged narrow, tablet turned upright). Expected: the book hands over to the base layer at the same chapter, with no blank stage and no jump to another section. Test in Task 7.
2. **Reader arrives mid-book** (anchor from the phone menu, back button restoring scroll, fast scroll through). Expected: the correct chapter is shown at once, with no queued animations. Test in Task 3.
3. **three.js fails to load or WebGL context is lost** (offline file, blocked request, GPU reset; this page has a known Chrome GPU freeze). Expected: base layer shows all six chapters; no console error left unhandled. Test in Task 7.
4. **Keyboard user tabs to a link in a chapter that is not on screen.** Expected: the book moves to that chapter and the focused link is visible below the fixed nav. Test in Task 6.
5. **Text longer than the page** (200% zoom, text-spacing overrides, a small 1024×600 laptop). Expected: long description dropped first, then base layer; never clipped text. Test in Task 5.

---

## File Structure

| File | Responsibility |
|---|---|
| `NYA_Healthcare.html` | Markup for both options, `book-style`, `book-behavior`, option switch |
| `three-0.187.0.min.js` (new, repo root) | Vendored three.js ES module, one file |
| `tests/bookcheck.mjs` (new) | Playwright checks for the book and its fallbacks |
| `tests/scrollcheck.mjs` | Add `projects` to `pins` |
| `tools/make-layers.mjs` (new, untracked) | One-off script that prepares photo layers through the Foundry image models |
| `spike/` (new, untracked) | Phase 0 throwaway files |
| `package.json` | `test:book` script |
| `.gitignore` | `!three-0.187.0.min.js` |
| `TODO.md`, `README.md` | Rows and notes listed in Task 9 |

DOM contract used by every task (names are fixed here):

```html
<section class="projects" id="projects">
  <div class="wrap"><div class="projects-head">…existing eyebrow and h2…<p class="value-note" data-opt-note="1">…existing note…</p>
    <p class="value-note" data-opt-note="2" hidden>Six chapters from NYA’s hospital work. Scroll to turn the page, or choose a chapter.</p></div></div>
  <div id="projects-opt-1">…existing #project-grid, unchanged…</div>
  <div id="projects-opt-2" hidden>
    <div class="book-runway"><div class="book-stage" data-phase="cover" data-chapter="0">
      <canvas class="book-canvas" aria-hidden="true"></canvas>
      <ol class="book-chapters">
        <li><article class="book-ch" id="book-ch-1" data-year="2000" aria-labelledby="book-ch-1-t">
          <figure class="book-plate"><img …><!-- data-layers="url,url,url" added in Task 8 --></figure>
          <div class="book-text"><p class="book-num">Chapter 1 of 6</p><p class="book-tag">…</p><h3 id="book-ch-1-t">…</h3>
            <p class="book-outcome">…</p><dl class="book-specs">…</dl><p class="book-desc">…</p>
            <a class="book-link" href="…">… project page</a></div>
        </article></li>
        <!-- ×6 -->
      </ol>
      <div class="book-controls" hidden>
        <button type="button" class="book-prev">Previous chapter</button>
        <ol class="book-contents"><li><button type="button" data-book-go="1">…short name…</button></li><!-- ×6 --></ol>
        <button type="button" class="book-next">Next chapter</button>
        <p class="book-live" aria-live="polite"></p>
      </div>
    </div></div>
  </div>
</section>
<div class="opt-switch" id="projects-switch" role="group" aria-label="Project section design">
  <button type="button" data-projects-opt="1" aria-pressed="true">Option 1</button>
  <button type="button" data-projects-opt="2" aria-pressed="false">Option 2</button>
</div>
```

State contract: `#projects-opt-2` gets class `book-on` only while the book layer is active. `.book-stage[data-phase]` is one of `cover | open | chapter | exit`; `.book-stage[data-chapter]` is `0`–`6`. Tests and CSS read these. Two more read-only attributes exist for tests: `.book-canvas[data-frames]` (render count, Task 4) and `.book-stage[data-page-left]` (settled text page's left edge in px, Task 5). Nothing else is exposed.

Chapter order, year, and source card (match by `data-name` of the existing `.project` article):

| # | `data-year` | Source card `data-name` | Short name (contents) |
|---|---|---|---|
| 1 | 2000 | UCSD Hillcrest Medical Center | UCSD Hillcrest |
| 2 | 2002 | Cedars-Sinai Medical Center | Cedars-Sinai |
| 3 | 2009 | UC Irvine Douglas Hospital | UC Irvine Douglas |
| 4 | 2014 | Century City Hospital Seismic Upgrade | Century City |
| 5 | 2019 | The New Stanford Hospital | Stanford |
| 6 | 2030 | UCSF Health Helen Diller Hospital at Parnassus | UCSF Helen Diller |

`data-year` drives the fore-edge tabs only and is not printed as a claim beside the text. (2009 = opened; 2014 = construction complete per NYA's page; 2019 = opened; 2030 = first patient planned per UCSF.)

Scroll timeline (travel measured in `svh` from the stage pinning), exact:

| Travel | Phase | What happens |
|---|---|---|
| 0–80 | `cover` then `open` | 0–30 closed book; 30–80 cover opens and leaves riffle |
| 80 + 70(n−1) … 80 + 70n, n = 1…6 | `chapter`, `data-chapter=n` | first 25%: push-in and pop-up rise; 25–60%: rest; 60–100%: page turn to n+1 (chapter 6: holds) |
| 500–540 | `exit` | pull back, close, white back cover |

Runway height = `100svh + 540svh`.

---

### Task 0: Spike (throwaway)

**Files:**
- Create: `spike/book-spike.html`, `spike/three.min.js`, `spike/layers/` (all untracked; do not add to `.gitignore` whitelist)

**Interfaces:**
- Produces: a written decision note at the top of `spike/book-spike.html` as an HTML comment, with five answers that later tasks consume: (1) page-bend technique chosen, (2) minified three.js size raw and gzipped, (3) text handover works yes/no and how, (4) which image deployment and call shape produces usable layers, (5) frame time on AB's laptop and one phone in landscape.

- [ ] **Step 1:** Produce the minified module. Run in a temp directory outside the repo: `npm pack three@0.187.0`, extract, then `npx esbuild package/build/three.module.js --bundle --minify --format=esm --outfile=three.min.js`. Record raw and gzip sizes. Copy to `spike/three.min.js`.
- [ ] **Step 2:** Before writing scene code, read current three.js docs for `PlaneGeometry`, `ShaderMaterial` / `onBeforeCompile`, `CanvasTexture`, `WebGLRenderer.setPixelRatio`, `webglcontextlost` handling (use the find-docs skill). Do not rely on memory for API details.
- [ ] **Step 3:** Build `spike/book-spike.html`: dark stage, closed book, cover opening with a riffle of blank leaves, camera push-in to one spread, one page turn that bends, all driven by a tall scroll runway using the progress formula from `amc-funnel-behavior`. One photograph (Stanford card image URL) on the left page; one text page with the Stanford card copy.
- [ ] **Step 4:** Text handover: draw the text page to a 2D canvas used as a texture while turning; on settle, position a real DOM block over the page's projected rectangle and fade the texture text out. Check alignment by eye at 1280×720 and 1920×1080.
- [ ] **Step 5:** Layer test. Call the Foundry image deployments (`gpt-image-2.5-sunburst`, `gpt-image-2.5-flare`) at `https://$ANTHROPIC_FOUNDRY_RESOURCE.openai.azure.com` with one Stanford photograph to get: a building cut-out with transparency, a foreground cut-out, and a background with the building area filled. Look up the current request shape for these deployments in Microsoft docs first (microsoft-docs skill); it is not known. State the number of calls before making them. Save results to `spike/layers/`. Compare each with the source at 100%: any changed building detail fails the layer.
- [ ] **Step 6:** Put the three layers on planes at different depths rising from the left page. Judge by eye.
- [ ] **Step 7:** Measure frame time during the opening and the turn with the Performance panel, on the laptop at 1x and with 4x CPU throttle, and on one phone in landscape.
- [ ] **Step 8:** Write the decision note. **Stop and show AB the spike.** Do not start Task 1 until AB says the look is right. If the text handover or the layers fail, report that and the alternative (text always as texture with visually hidden DOM text; flat photograph) rather than proceeding.

### Task 1: Option switch and wrappers

**Files:**
- Modify: `NYA_Healthcare.html` (section `#projects`; new `book-style`; new `book-behavior`)
- Create: `tests/bookcheck.mjs`
- Modify: `package.json` (add `"test:book": "node tests/bookcheck.mjs"`)

**Interfaces:**
- Produces: `#projects-opt-1`, `#projects-opt-2`, `#projects-switch`, `[data-opt-note]` as in the DOM contract. Function inside the IIFE: `setOption(n: 1|2): void` sets `hidden` on the wrappers and notes, updates `aria-pressed`, dispatches `resize`.

- [ ] **Step 1: Write the failing test.** `tests/bookcheck.mjs` reuses the server and `open()` pattern from `tests/scrollcheck.mjs` (viewport 1440×800, `channel:'chrome'`). First checks:

```js
// option-default
assert(await p.$eval('#projects-opt-1', e => !e.hidden));
assert(await p.$eval('#projects-opt-2', e => e.hidden));
// option-switch
await p.evaluate(() => document.getElementById('projects').scrollIntoView());
await p.click('[data-projects-opt="2"]');
assert(await p.$eval('#projects-opt-1', e => e.hidden));
assert(await p.$eval('#projects-opt-2', e => !e.hidden));
assert(await p.$eval('[data-projects-opt="2"]', e => e.getAttribute('aria-pressed') === 'true'));
// switch-only-near-section
await p.evaluate(() => scrollTo(0, 0));
assert(await p.$eval('#projects-switch', e => !e.classList.contains('is-on')));
// gallery-untouched
assert((await p.$$('#projects-opt-1 .project')).length === 6);
```

- [ ] **Step 2:** Run `npm run test:book`. Expected: FAIL, `#projects-opt-1` not found.
- [ ] **Step 3:** Add PART markers around the section. Wrap the existing `.project-grid` in `#projects-opt-1`. Add an empty `#projects-opt-2 hidden`, the second note, and `#projects-switch`. Re-create `.opt-switch` CSS in `book-style` from `git show d539a56^:NYA_Healthcare.html` (fixed bottom-right, `.is-on` to show, buttons ≥ 44px, `:focus-visible`), adjusted to tokens. Implement `setOption` and an IntersectionObserver on `#projects` with `rootMargin:'-30% 0px -30% 0px'` toggling `.is-on`.
- [ ] **Step 4:** Syntax check: `node -e "const s=require('fs').readFileSync('NYA_Healthcare.html','utf8');const m=s.match(/<script id=\"book-behavior\">([\s\S]*?)<\/script>/);require('fs').writeFileSync(process.env.TEMP+'/book.js',m[1])" && node --check "%TEMP%/book.js"` (in Git Bash use `$TEMP`). Expected: no output.
- [ ] **Step 5:** Run `npm run test:book` and `npm run test:scroll`. Expected: both PASS (the modal test in scrollcheck still finds `.project`).
- [ ] **Step 6:** Commit if AB has asked for commits.

### Task 2: Base layer chapters

**Files:**
- Modify: `NYA_Healthcare.html` (`#projects-opt-2`, `book-style`)
- Test: `tests/bookcheck.mjs`

**Interfaces:**
- Produces: six `article.book-ch#book-ch-N` with the classes in the DOM contract; `.book-controls` present but `hidden`.

- [ ] **Step 1: Write the failing tests** (Option 2 selected first in each):

```js
// base-six-chapters, in date order
assert.deepEqual(await p.$$eval('.book-ch h3', a => a.map(e => e.textContent.trim())), [
  'UCSD Hillcrest Medical Center','Cedars-Sinai Medical Center','UC Irvine Douglas Hospital',
  'Century City Hospital Seismic Upgrade','The New Stanford Hospital','UCSF Health Helen Diller Hospital at Parnassus']);
// base-copy-matches-gallery: for each chapter, .book-outcome === the source card's .project-outcome text,
// .book-desc === its data-desc, .book-link href === its data-link, dl values === data-location/role/scale/focus
// base-images: every .book-plate img has width, height, alt (non-empty), loading="lazy", decoding="async"
// base-no-hscroll at 360, 768, 1280, 1920 wide: document.documentElement.scrollWidth <= innerWidth
// base-reduced-motion: with emulateMedia({reducedMotion:'reduce'}) at 1440x800,
//   #projects-opt-2 has no class book-on and all six .book-ch have offsetHeight > 0
// base-print: with emulateMedia({media:'print'}), all six .book-ch have offsetHeight > 0
// base-reflow-320: at 320 wide, no element inside #projects-opt-2 has scrollWidth > clientWidth + 1
```

- [ ] **Step 2:** Run `npm run test:book`. Expected: new checks FAIL.
- [ ] **Step 3:** Write the six chapters. Copy text from each source card exactly: `h3` = `data-name`; `.book-tag` = `data-tag`; `.book-outcome` = the card's `.project-outcome`; `dl` terms "Location", "Role", "Scale", "Structural focus" with the four `data-*` values; `.book-desc` = `data-desc`; link text = `data-name` + " project page". Image: the card's `src`/`srcset`, `sizes="(max-width:760px) calc(100vw - 2.5rem), 50vw"`, `alt` = `data-name`, and `width`/`height` from the file's real dimensions (read them from the 1024w file with a one-off script; do not guess).
- [ ] **Step 4:** Base CSS in `book-style`, default (no `.book-on`): `.book-ch` is a two-column grid (plate, text) from the existing 760px breakpoint up, one column below; hairline between chapters; `.book-desc` `max-width:60ch`, line-height ≥ 1.5; `dl` as a hairline-ruled strip; `--ink` text on a `--light` sheet; `.book-tag` in `--ink` (not `--green-on-light`, which is about 4.0:1 on `--light`). `.book-canvas` `display:none`. `@media print`: `break-inside:avoid` on `.book-ch`, hide `.opt-switch`. `scroll-margin-top` on `.book-ch` equal to `var(--range-nav-h, 0px)`.
- [ ] **Step 5:** Run `npm run test:book`. Expected: PASS.
- [ ] **Step 6:** Check by eye with `npx live-server --open=NYA_Healthcare.html` at 390×844, 844×390, 1024×768, 1440×900, and at 200% zoom. Note anything not checked.
- [ ] **Step 7:** Commit if asked.

### Task 3: Gate, pinned stage, scroll state

**Files:**
- Modify: `NYA_Healthcare.html` (`book-behavior`, `book-style`)
- Create: `three-0.187.0.min.js` (from Task 0 Step 1), add `!three-0.187.0.min.js` to `.gitignore`
- Test: `tests/bookcheck.mjs`

**Interfaces:**
- Produces, inside the IIFE:
  - `gatePasses(): boolean` (media queries + WebGL probe + `fits()` from Task 5; until Task 5, `fits` returns `true`).
  - `stateAt(travelSvh: number): {phase:'cover'|'open'|'chapter'|'exit', chapter:0..6, local:number}` — pure, per the timeline table; `local` is 0–1 within the phase segment.
  - `travelFor(chapter: 1..6): number` — travel in svh at 40% of that chapter's segment (its rest point).
  - `enterBook(): void` / `leaveBook(): void` — add/remove `book-on`, set/clear runway height, show/hide `.book-controls`. `leaveBook` scrolls nothing.
  - `onFrame(cb: (state) => void): void` — subscribes renderers to state changes.
  - `loadThree(): Promise<Module>` — dynamic `import('./three-0.187.0.min.js')`, called once from an IntersectionObserver with `rootMargin:'200% 0px'`.
- Sets `data-phase` and `data-chapter` on `.book-stage` every frame the state changes.

- [ ] **Step 1: Write the failing tests:**

```js
// gate-on at 1440x800: after selecting Option 2, #projects-opt-2 has class book-on
// gate-off at 390x844 and at 1000x700 and at 844x390: no book-on
// state-sequence: scrolling through the runway in 20 equal steps yields data-chapter values that never decrease,
//   start at 0 and reach 6; data-phase goes cover -> open -> chapter -> exit
// state-jump (Review Focus 2): scrollTo(top + (80+70*3+28)*svh) in one call => data-chapter === '4', data-phase === 'chapter' within 2 frames
// state-reverse: scrolling back up by the same steps yields the same values in reverse
// no-three-on-load: at page top, no request for three-0.187.0.min.js has been made (page.on('request'))
// three-near: after scrolling to within 1.5 viewports of #projects with Option 2 on, the request is made
// scroll-guards: window.__blockers is empty and window.__pd is empty after a wheel pass through the book
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement, following `amc-funnel-behavior` for structure: static default, script adds `book-on`; runway height set in px from `innerHeight * 6.4`; `.book-stage` `position:sticky; top:var(--range-nav-h,0px); height:calc(100svh - var(--range-nav-h,0px))`; passive scroll listener attached by IntersectionObserver; one rAF; resize debounced, ignoring height-only changes under 120px; re-measure on `document.fonts.ready` and `load`. With `book-on`, `.book-ch` elements are absolutely stacked inside the stage and non-current ones get `opacity:0` and `pointer-events:none` (not `hidden`, not `inert`).
- [ ] **Step 4:** `node --check` (Task 1 Step 4 command). Run `npm run test:book` and `npm run test:scroll`. Expected: PASS.
- [ ] **Step 5:** Commit if asked.

### Task 4: The book scene

**Files:**
- Modify: `NYA_Healthcare.html` (`book-behavior`)

**Interfaces:**
- Consumes: `loadThree()`, `onFrame(cb)`, `stateAt` output, `.book-plate img.currentSrc` per chapter, `data-year`.
- Produces: `createScene(THREE, canvas): {render(state): void, resize(): void, pageRect(chapter): DOMRect, dispose(): void}`. `pageRect` returns the on-screen rectangle of the settled text page (used by Task 5). `render` draws only when called.

- [ ] **Step 1: Write the failing tests:**

```js
// canvas-draws: at chapter 3 rest point, canvas.width > 0 and a readPixels sample at the stage center is not the clear color
// one-render-per-change: with the page still for 500ms, the renderer's frame counter (renderer.info.render.frame read via a data-frames attribute on the canvas) does not increase
// paused-offscreen: at page top, data-frames does not increase over 500ms
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement `createScene` using the bend technique recorded in the Task 0 decision note. Fixed values: renderer `alpha:true`, `setPixelRatio(Math.min(devicePixelRatio, 2))`; stage background stays the section's `#0d1014`; pages `--light`; one key light from upper left; a flat ground shadow under the book; cover carries the h2 text and "Nabih Youssef Associates"; inside cover "Established 1989"; fore-edge year tabs from 1989 to 2026, the six `data-year` values marked; back cover plain white. Photographs load as textures only for the current chapter and its neighbors; others are disposed.
- [ ] **Step 4:** Map `state` to the scene per the timeline table: cover angle from `open.local`; camera distance from `chapter.local` 0–0.25; turn angle from `chapter.local` 0.6–1; exit reverses the push-in and closes the book.
- [ ] **Step 5:** Settle: if no scroll event for 150ms while a turn is between 0 and 1, ease the drawn turn to the nearest end over 300ms; on the next scroll event, ease back to the scroll-driven value over 6 frames. Never call `scrollTo`.
- [ ] **Step 6:** Stop rendering when the section is not intersecting or `document.hidden`.
- [ ] **Step 7:** `node --check`; run both test scripts. Expected: PASS.
- [ ] **Step 8:** Check by eye against the spike. Scroll the section with 4x CPU throttle; record the result.
- [ ] **Step 9:** Commit if asked.

### Task 5: Text on the page

**Files:**
- Modify: `NYA_Healthcare.html` (`book-behavior`, `book-style`)

**Interfaces:**
- Consumes: `createScene().pageRect(chapter)`.
- Produces: `fits(): boolean` (replaces the Task 3 stub) and class `book-short` on `#projects-opt-2` when the long description is dropped.

- [ ] **Step 1: Write the failing tests:**

```js
// text-is-dom: at chapter 5 rest point, document.elementFromPoint at the center of #book-ch-5 .book-outcome's rect is inside #book-ch-5
// text-on-page: #book-ch-5 .book-text rect lies within the canvas rect, and its left edge is within 8px of pageRect(5).left (exposed as data-page-left on the stage)
// all-in-a11y-tree: at chapter 5, no .book-ch has hidden, inert, aria-hidden or visibility:hidden
// fit-short (Review Focus 5): at 1024x600, either #projects-opt-2 has class book-short and every visible .book-text has scrollHeight <= clientHeight, or book-on is absent
// fit-zoom: at 1440x800 with document.documentElement.style.fontSize='200%', no .book-text has scrollHeight > clientHeight + 1 (book-short or fallback)
// fit-spacing: with WCAG 1.4.12 text-spacing overrides injected, same assertion
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the handover chosen in Task 0: turning page shows a canvas-drawn text texture; at rest the current `.book-text` is positioned to `pageRect` with a transform and shown, and the texture text fades. `fits()`: measure every `.book-text` at the settled page size; if any overflows, add `book-short` (hides `.book-desc`) and re-measure; if still overflowing, return `false`. Re-run on resize, `fonts.ready`, and from a `ResizeObserver` on `.book-chapters`.
- [ ] **Step 4:** Paper text colors: `--ink` / `--ink2`; links `--ink` with underline; `:focus-visible` ring ≥ 3:1 on `--light`.
- [ ] **Step 5:** `node --check`; run tests. Expected: PASS. Check alignment by eye at 1280×720, 1440×900, 1920×1080.
- [ ] **Step 6:** Commit if asked.

### Task 6: Controls and focus

**Files:**
- Modify: `NYA_Healthcare.html` (`book-behavior`, `book-style`)

**Interfaces:**
- Consumes: `travelFor(chapter)`, `stateAt`.
- Produces: `goToChapter(n: 1..6, announce: boolean): void` — scrolls the document to the runway top + `travelFor(n)`; `behavior:'smooth'`, or `'auto'` under reduced motion.

- [ ] **Step 1: Write the failing tests:**

```js
// next-button: at chapter 2, click .book-next => data-chapter becomes '3'; .book-live text === 'Chapter 3 of 6: UC Irvine Douglas Hospital'
// prev-disabled at chapter 1 and cover; next-disabled at chapter 6
// contents-current: the [data-book-go] button for the current chapter has aria-current="true", others do not
// live-silent-on-scroll: wheel from chapter 2 to 3 leaves .book-live unchanged
// focus-sync (Review Focus 4): at chapter 1, focus #book-ch-5 .book-link programmatically => within 1s data-chapter === '5'
//   and the link's rect is inside the viewport and below the range-nav's bottom
// targets: every button in .book-controls has width and height >= 44
// keys-not-hijacked: pressing Space, PageDown, ArrowDown inside the book leaves window.__pd empty
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Controls sit on the dark stage (`--gold` for the current marker, text meeting 4.5:1 on `#0d1014`). `focusin` on `.book-chapters` calls `goToChapter(n, false)` with `behavior:'auto'` when the target's chapter is not current. Live region text format exactly `Chapter N of 6: <h3 text>`.
- [ ] **Step 4:** `node --check`; run both test scripts (scrollcheck verifies the smooth scroll does not fight `#nya-s33`). Expected: PASS.
- [ ] **Step 5:** Keyboard pass by hand: Tab through the section in both options; record the result.
- [ ] **Step 6:** Commit if asked.

### Task 7: Fallbacks

**Files:**
- Modify: `NYA_Healthcare.html` (`book-behavior`)

**Interfaces:**
- Consumes: `enterBook`, `leaveBook`, `gatePasses`, `createScene().dispose`.
- Produces: `fallBack(reason: 'gate'|'load'|'context'|'slow'): void` — disposes the scene, calls `leaveBook()`, and for `'slow'` only, sets `scrollY` so `#book-ch-1` (or the current chapter) is at the top of the viewport in the same frame.

- [ ] **Step 1: Write the failing tests:**

```js
// resize-out (Review Focus 1): at 1440x800 on chapter 4, setViewportSize(700,800) => no book-on; #book-ch-4's rect intersects the viewport
// resize-in: back to 1440x800 => book-on returns; data-chapter === '4'
// load-fail (Review Focus 3): page.route('**/three-0.187.0.min.js', r => r.abort()) => Option 2 shows six chapters with offsetHeight > 0, no book-on, no pageerror events
// context-lost: canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext() => no book-on within 1s, six chapters visible
// no-webgl: with --disable-gpu launch flags making getContext return null (or by stubbing HTMLCanvasElement.prototype.getContext in an init script) => no book-on
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Gate re-evaluated on debounced resize, `orientationchange` and the reduced-motion media query's `change` event. When the gate flips while the section is in view, keep the same chapter in view: compute the chapter before the change and, after layout, align that chapter to the viewport top (this counts as part of the resize the reader caused, not a script-initiated scroll). Slow check: during the first run of the opening, if the median of 30 frame intervals exceeds 40ms, call `fallBack('slow')` once and do not re-enter the book in this page view.
- [ ] **Step 4:** `node --check`; run both test scripts. Expected: PASS.
- [ ] **Step 5:** Commit if asked.

### Task 8: Pop-up photo layers

**Files:**
- Create: `tools/make-layers.mjs` (untracked)
- Modify: `NYA_Healthcare.html` (`data-layers` on each `.book-plate`; `createScene`)
- Output: `wp-upload/book-layers/<chapter>-{back,building,front}.webp` (untracked) for MB

**Interfaces:**
- Consumes: the call shape and deployment recorded in the Task 0 decision note.
- Produces: `figure.book-plate[data-layers="backURL,buildingURL,frontURL"]` (back to front, absolute nyase.com URLs). `createScene` reads it: if present, builds three planes that rise from the page during `chapter.local` 0–0.25 and lie flat again during the turn; if absent, shows the flat photograph (Task 4 behavior).

- [ ] **Step 1:** Choose one source photograph per chapter (card image, `data-img`, or a project-page image), preferring a clear building edge against sky. Show AB the six choices before processing.
- [ ] **Step 2:** Write `tools/make-layers.mjs <source-url> <chapter>`: downloads the source into a new empty temp directory, calls the image deployment, writes three WebP layers at the source's pixel size. State the total number of image calls for all six before running.
- [ ] **Step 3: Write the failing test** (uses a local test fixture path served by the test server until MB's URLs exist):

```js
// layers-optional: with data-layers removed from chapter 5, the canvas still draws at chapter 5 (readPixels sample not clear color)
// layers-flat-in-base: with book-on absent, only the original <img> is visible in .book-plate (no extra images in the DOM)
```

- [ ] **Step 4:** Check every layer against its source at 100%: overlay the building layer on the source and difference them; any difference inside the building outline rejects the layer. Record the result per chapter.
- [ ] **Step 5:** Hand `wp-upload/book-layers/` to MB (add a `TODO.md` row, owner MB). WordPress renames uploads; when MB returns the final URLs, write them into `data-layers`. Until then chapters show flat photographs.
- [ ] **Step 6:** Implement the layered planes in `createScene`. `node --check`; run tests. Expected: PASS.
- [ ] **Step 7:** Check by eye, chapter by chapter. Commit if asked.

### Task 9: Hardening and records

**Files:**
- Modify: `tests/scrollcheck.mjs` (the `pins` line), `README.md`, `TODO.md`

- [ ] **Step 1:** Add `'projects'` to `pins` in `tests/scrollcheck.mjs`, and make the script select Option 2 before measuring that pin (click `[data-projects-opt="2"]`) and Option 1 before the "Project modal" block. Run `npm run test:scroll`. Expected: PASS at entry, middle and exit of the book.
- [ ] **Step 2:** Run `npm run test:book` three times. Expected: PASS each time.
- [ ] **Step 3:** Lighthouse (mobile) on the page before and after, Option 1 default. Expected: no drop in Performance, Accessibility, Best Practices, SEO. Record the eight numbers.
- [ ] **Step 4:** Manual checks, recording each as checked or not checked: Chrome, Edge, Firefox, Safari on laptop; iOS Safari portrait (base layer) and landscape; Android Chrome; reduced motion on; keyboard only; a screen reader reading all six chapters in Option 2; print preview; the Chrome GPU freeze steps from `CHROME_FREEZE_GPU_AUDIT.md`.
- [ ] **Step 5:** `README.md`: add `npm run test:book`, the three.js file and how it was produced (Task 0 Step 1 command), and that production upload is now two files while Option 2 exists.
- [ ] **Step 6:** `TODO.md` rows (owner AB unless stated): choose Option 1 or 2; sign off each copy correction from spec section 9 (one row each: UC Irvine city, Stanford scale line and "spectacular", UCSF square footage and name, Cedars-Sinai retrofit wording, Hillcrest cost wording and NPC rating, Century City ratings, "column-free"); upload book layers (MB); decide whether the founder appears; update the stale `.opt-switch` sentence in `CLAUDE.md`.
- [ ] **Step 7:** Commit if asked.

---

## Not in this plan

- Removing Option 1, the modal and their CSS/JS. That is a separate change after AB picks (spec section 10).
- Any copy correction. Each waits for sign-off.
- A structural animation for any chapter (needs NYA drawings).
- An immersive build for phones in portrait.
