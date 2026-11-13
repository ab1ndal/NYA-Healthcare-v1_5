# Book of projects: design

Date: 2026-11-12. Status: AB said "use best guess for the plan" on 2026-11-12; the open questions in section 12 are settled by the best guesses listed there, and the plan is written from this document. Nothing is built yet.

Scope: the gallery section of `NYA_Healthcare.html` (`<section class="projects" id="projects">`) only. The book is proposed as an alternate to the current gallery, shown beside it behind an option switch until AB picks one.

Legend used below: **[AB]** = AB said this. **[call]** = a choice made while writing this document; correct it if wrong. **[NYA]** = needs a source or sign-off from the firm before it can appear on the page.

## 1. Intent

- [AB] Replace the gallery with a "Book of projects". Projects come out of the book; each is shown in a book format; scrolling turns the page to the next project.
- [AB] Theme: chapters in the history of NYA's projects. 37 years, many projects, six presented.
- [AB] Reader: Stanford Health Care, who are building their next hospital. "These are serious folks."
- [AB] It must have wow and amazement, must not be subtle, and must be very immersive.
- [AB] Build approach B: a three.js book with real page text. No pre-rendered video.

Why it should exist: the current grid shows six dimmed tiles and hides role, scale, structural focus and the project story inside a modal, in `data-*` attributes that cannot be searched, printed or read without JavaScript. The book puts one project in front of the reader at a time with its story visible.

## 2. Goals, non-goals, anti-goals

Goals
- One immersive scene: the reader goes into the book, and each chapter fills the screen.
- The wow comes from graphics: the book itself, the bending pages, and each project's real photograph standing up from the page in depth.
- Six chapters that read as one history, 1989 to today.
- A presenter can reach any chapter in one action (contents, Previous/Next).
- All six projects readable with no WebGL, no JavaScript, reduced motion, on a phone, and in print.

Non-goals
- No changes to any other section, to page-wide SEO tags, or to the GPU audit items elsewhere on the page.
- No new projects, no filter UI (`data-category` is unused today).
- No sound, no drag-to-turn, no autoplay.

Anti-goals (would make it a failure even if it works)
- A children's storybook or leather-and-gold look.
- A visual that shows something untrue or unverifiable about a building, especially Stanford's.
- Text baked into images so it is blurry, unselectable or invisible to assistive technology.
- A scroll trap: no way past the book, or scroll that moves by itself.
- A slow first load for the rest of the page.

## 3. Constraints

From `CLAUDE.md` and the code audit:
- Single HTML file, inline style and script, no build step. Feature blocks named after the section (`book-style`, `book-behavior`), inside PART markers, IIFE that exits if its element is missing.
- three.js is a new external library. AB's choice of approach B is taken as approval to use it; **hosting still needs AB's yes** (section 12).
- Measured: three 0.187.0, MIT. `three.core.js` + `three.module.js` = 2.1 MB raw, 420 KB gzipped, unminified. The npm package ships no minified build. Minified size not yet measured.
- Animate only transform and opacity in CSS; pause WebGL when off screen or the tab is hidden; `prefers-reduced-motion` fallback required.
- No CSS scroll-snap (it broke scrollbar clicks and trackpads on this page before; `tests/scrollcheck.mjs` rejects it). No non-passive wheel/touch listeners on window or document.
- `#nya-s33` directly below has an idle glide and a global wheel listener. The book must never move the scroll by itself, except in response to a button press.
- Keep `id="projects"`: `range-nav-behavior` looks it up and labels it "Hospital Gallery" on phones. The pinned stage must sit below `var(--range-nav-h)` where that bar shows.
- `.projects-head` and `.value-note` are shared with Technical Excellence and must not be deleted.
- `.opt-switch` no longer exists in the file; it must be re-created (last version is in `git show d539a56^:NYA_Healthcare.html`).
- The page has a known Chrome GPU freeze (`CHROME_FREEZE_GPU_AUDIT.md`). A WebGL scene adds GPU load.
- Never invent numbers or names. Media is hosted on nyase.com, never committed.

## 4. Approaches considered

| | A. CSS 3D only | B. three.js book + DOM text | C. Pre-rendered video scrubbed by scroll |
|---|---|---|---|
| Page turn | Rigid leaf with a shading overlay | Paper bends under real light | Film quality, fixed |
| Weight | None | 420 KB gz unminified, lazy-loaded | Six or more large videos |
| Risk | Low; reads as a slideshow at full screen | New library, GPU load, text handling | Stutters on phones; every edit needs a re-render |

AB picked **B**: closest to the vision, and video production would take longer than intended. A is not thrown away: its plain DOM layout is the base layer and fallback for B.

## 5. The experience

Sequence on a wide landscape screen. All motion is a function of scroll position, so scrolling back reverses it.

1. **Arrival.** The section is dark. The closed book fills most of the stage, lit from one side. Cover: section heading, firm name, "1989".
2. **Opening.** The cover swings open and the leaves riffle past, year tabs running on the fore-edge from 1989. This is the "many projects, six shown" gesture and uses no project names other than the six.
3. **Chapter.** The camera pushes in until the spread fills the viewport. One page is the plate (photograph). The hero visual rises off the page in depth. The facing page carries the text.
4. **Turn.** The full-screen page bends over with light moving across it; the next chapter is underneath.
5. **Exit.** After the last chapter the camera pulls back, the book closes on its white back cover, and that white becomes the background of `#nya-s33`.

Controls, always visible on the stage: a contents rail (six entries, the current one marked) and Previous / Next buttons. They scroll the document to that chapter's position, so scroll stays the single source of truth.

### Chapter order [call]

Chronological, because the theme is history. This puts Stanford fifth and UCSF last, so the book builds toward the reader's own building and ends on work in progress. The alternative is Stanford first (the design reviewer's suggestion for this reader). AB to confirm.

| # | Chapter | Anchor date | Source of date |
|---|---|---|---|
| Prologue | The firm | 1989, established by Nabih Youssef | nyase.com About; ASCE |
| 1 | UCSD Hillcrest Medical Center | 2000, main tower column fiber wrap approved | UC Regents item, May 2004 |
| 2 | Cedars-Sinai Medical Center | 2002, SB 1953 evaluation of the main hospital | NYA project page [NYA] |
| 3 | UC Irvine Douglas Hospital | 2004 contract, opened March 2009 | BD+C 2010; UCI news |
| 4 | Century City Hospital | 2010 evaluation, 2014 complete, reopened 2016 | NYA page [NYA]; PR Newswire; UCLA Health |
| 5 | The New Stanford Hospital | 2013 groundbreaking, opened Nov 17, 2019 | Stanford Medicine |
| 6 | UCSF Health Helen Diller Hospital | 2024 groundbreaking, first patient planned 2030 | UCSF |

### Hero visual per chapter

[AB] Use the photographs NYA already has. AI image models may be used to prepare the extra image layers needed to make the pop-up look real.

Each chapter's hero visual is that project's own photograph, cut into depth layers that stand up from the page as it opens, the way a pop-up book works: ground and foreground at the front, the building behind it, sky at the back, each on its own plane with real shadow between them. The camera push-in moves through those layers.

What image models may do [call]:
- Cut the building, foreground and sky out of an existing photograph (masks).
- Fill the area hidden behind a cut-out layer so no hole shows when layers separate. Sky, ground and planting only.
- Estimate depth from a photograph to place the layers.
- Upscale or clean an existing photograph.
- Make book materials that depict nothing real: paper grain, cover cloth, page edges.

What they may not do:
- Generate a new view of any hospital, or add, remove or alter any part of a building.
- Draw structure (isolators, dampers, frames, walls) that is not in a photograph or an NYA drawing.
- Produce anything presented as a photograph of the project that is not one.

Reason: the reader knows these buildings, and the page rule is never to invent. Every layer is checked against its source photograph before use.

Photographs available per project: the card image, the modal image (`data-img`), and the images on each nyase.com project page (three to six per project; contents not yet viewed). Phase 0 includes choosing one per chapter that separates cleanly into layers.

Optional later step, not part of this build: a structural visual for a chapter (for example Stanford's isolators moving under the towers), only if NYA supplies the drawing or model it is built from.

Derived layers are media: exported as optimized WebP, uploaded to WordPress as new files by MB, linked by absolute URL, never committed.

Tool note: [AB] OpenAI models are provisioned on the same Foundry resource and key as this session. Checked 2026-11-12 (deployment list only, no image generated): the resource has two image deployments, `gpt-image-2.5-sunburst` and `gpt-image-2.5-flare`. Whether they support masked edits of an existing photograph, and which is better for cut-outs and fill, is not known and is the first test in Phase 0. The key is read from the environment and never written to a file.

### Text on each spread

- Year and chapter number.
- Full project name.
- Outcome sentence (today's card copy, with corrections from section 9).
- Location, role, scale, structural focus as a hairline-ruled strip.
- Long description (today's modal text).
- Link: "[Project name] project page" to nyase.com.

Set in the two loaded families using `--text-*` tokens. Light paper pages on the dark stage: `--ink` / `--ink2` for text, `--green-on-light` for accents on paper, `--gold` only on the dark stage. Calculated, not browser-checked: `--green-on-light` on `--light` is about 4.0:1, which fails for small text; use white pages or `--ink` for small labels.

## 6. How it is built

Two layers over one DOM.

**Base layer (always present, the fallback).** Inside `#projects`: the heading, then an `<ol>` of six `<li><article>` chapters in DOM order, each with `<figure><img>`, `<h3>`, text, a `<dl>` for the four specs, and the link. Styled as full-width chapter sheets in normal flow: photo and text side by side on wide screens, stacked on narrow ones. This is what shows with no JavaScript, reduced motion, phones in portrait, short landscape, 320 px width, print, a failed fit test, or no WebGL.

**Book layer (enhancement).** When the gate passes, `book-behavior` adds `.book-on`, sets the runway height, pins a `100svh` stage, creates one `<canvas>` and loads three.js.
- Gate [call]: `(min-width:1024px) and (min-height:600px) and (orientation:landscape)`, no reduced motion, WebGL context created, every text page fits the stage.
- Loading: three.js is fetched by dynamic `import()` from an IntersectionObserver about two screens before the section. Until it is ready, the base layer shows.
- Scene: book mesh, page meshes that bend (subdivided plane deformed in the vertex shader or by bones; builder's choice after checking current three.js docs), one key light, a ground shadow, photographs as textures, each chapter's photograph as a stack of layered planes.
- Render loop runs only while the section intersects the viewport and the tab is visible. One render per scroll-driven frame; no idle loop when nothing changes.
- Textures: pick the `srcset` size that matches the page face; dispose textures for chapters more than one away.
- On `webglcontextlost`, drop `.book-on` and show the base layer.

**Text in the book.** Real DOM text is the canonical text. Proposed handling [call], to be proven in the spike: while a page is turning, its face shows a canvas-drawn copy of the text as a texture; when the page settles, the DOM text block is positioned over the page's projected rectangle and the texture copy fades out. All six chapters stay in the accessibility tree at all times (hidden by opacity/transform only, not `inert` or `aria-hidden`).

**Scroll mapping.** House pattern from `amc-funnel-behavior`: progress = `-rect.top / (offsetHeight - innerHeight)`, passive listener attached by IntersectionObserver, one `requestAnimationFrame`, resize debounced and ignoring URL-bar height changes, re-measure on `fonts.ready` and `load`. Progress drives everything directly (scrubbed). If scrolling stops mid-turn for about 150 ms, the page eases to the nearest side visually without moving the scroll.

**Runway [call].** Opening 80svh, six chapters at 70svh each (push-in, hero visual, turn), exit 40svh: about 540svh of travel. The scroll reviewer's ceiling for a plain flipbook was 450svh; the immersive version needs more. Tune in the spike.

**Keyboard and focus.** No key or wheel hijacking. Previous/Next are 44 px buttons; disabled at the ends; a polite live region announces "Chapter 2 of 6: name" on button use only. `focusin` on a link in a chapter that is not current scrolls the book to that chapter first.

**Option switch.** Re-create `.opt-switch` (fixed, shown only while the section is on screen, `aria-pressed` buttons). Option 1 = current gallery, Option 2 = book. No localStorage or URL parameter, as before.

## 7. Responsive

| Screen | Behavior |
|---|---|
| Laptop, desktop, tablet landscape (gate passes) | Full book |
| 1920 px and wider | Book capped in size; type does not scale past tokens |
| Phone portrait, upright tablet | Base layer: stacked chapter sheets, photograph shown flat |
| Short landscape phone (`max-height:500px`) | Base layer, two columns |
| 200% zoom, 320 px reflow, text-spacing overrides | Base layer when the fit test fails; no fixed heights on text |
| Print | Base layer, one chapter per block, `break-inside:avoid` |

AB asked for immersion; phones in portrait get none under this table. Whether to build a full-screen single-page version for phones is an open question (section 12).

## 8. Performance and safety

- First load unaffected: no three.js, no book images until the section is near.
- Target 60 fps on the gate's devices. If a frame-time check during the opening shows sustained slow frames, fall back to the base layer rather than stutter.
- Device pixel ratio capped (for example at 2) for the canvas.
- Add `projects` to the `pins` list in `tests/scrollcheck.mjs`; the existing modal test stays while Option 1 exists.

## 9. Content corrections found by research

These are on the page today and would be carried into the book. Each needs AB's decision; none is changed by this design.

- **Stanford**: "Four seven-story patient towers rising from a three-story podium" reads as ten stories; the building is seven stories (Stanford Medicine). "Spectacular" praises the owner's atrium to the owner. "column free" should be "column-free". Stanford now refers to the building as "500 Pasteur Drive".
- **UCSF**: "Nearly 1 million SF" versus UCSF's 880,000 sq ft. Name varies; UCSF uses "UCSF Health Helen Diller Hospital".
- **UC Irvine**: location says "Irvine, CA"; the hospital is in Orange, CA (HCAI, Hensel Phelps). "California's first design-build hospital" needs a qualifier: third parties say "first large design-build hospital in the state" and OSHPD's "first design-build project".
- **Cedars-Sinai**: "proved a costly structural retrofit unnecessary" is at risk. SPC-2 allows use to 2030; in October 2022 Cedars said the main hospital must be retrofitted to operate past 2030. Safer: the analysis avoided an earlier retrofit and kept the hospital in service through 2030.
- **Hillcrest**: NYA's own page says one-tenth the cost of "the shear wall strengthening schemes originally considered"; the card says "conventional strengthening". NYA cites an NPC-3 upgrade; HCAI lists NPC 2.
- **Century City**: NYA's page gives SPC-2 for the main hospital and NPC-2 for the central plant; the card reads as both for both.
- **Firm**: the page says "35+ years of hospital experience"; 37 years is the firm's age. The book should say 37 years of the firm, not of hospital work, unless NYA confirms a 1989 hospital project.
- **Prologue material** (Structure magazine): Nabih Youssef was a graduate student during the 1971 Sylmar earthquake and the Olive View Hospital failure. He died on July 12, 2024. How the founder appears in the book is for NYA to decide.

No outside source names NYA on Hillcrest or Century City; those chapters rest on NYA's own record.

## 10. What is touched

- New: PART markers around the section, `book-style`, `book-behavior`, the option switch, a vendored three.js file and its `.gitignore` whitelist line, a `TODO.md` row.
- Changed: `tests/scrollcheck.mjs` pins list.
- Unchanged while both options exist: current gallery markup, CSS, modal and its script.
- If AB later picks the book: delete the gallery-only CSS, `nya-project-card-copy-balance`, the modal markup, CSS and script (it has no null guards, so markup and script go together), the `html:has(#project-modal.open) .range-nav` rule, and update the "Hospital Gallery" label, README and `TYPOGRAPHY_AUDIT.md` rows. That cleanup is a separate change.

## 11. Phases

0. **Spike (throwaway, standalone file).** Opening plus one bending page turn with one text page and one photograph cut into pop-up layers (Stanford). Proves: the look, frame rate on AB's laptop and one phone in landscape, the text handover, behavior beside the Chrome GPU freeze, minified three.js size. AB judges it by eye. Nothing from the spike is kept without a new decision.
1. **Base layer.** Semantic chapters, corrected copy, static layout, print, reduced motion. Useful by itself.
2. **Book shell.** Gate, lazy load, pinned stage, canvas, scroll mapping, cover, opening, page turns with photographs, exit, controls, option switch.
3. **Pop-up layers.** Prepare layers for the other five photographs, check each against its source, upload via MB, wire in.
4. **Hardening.** Fallback triggers, context loss, keyboard, screen reader pass, scrollcheck, Lighthouse, device checks.

## 11a. Calls made after the builder check

A reviewer read this document as a builder would. These are the points settled without AB; each is a [call] and can be overruled.

- **Two options in one section.** Option 1 (current gallery) and Option 2 (book, including its base layer) are sibling wrappers inside `#projects`. The inactive one has the `hidden` attribute, so there is no duplicate text for screen readers or find-in-page. Default is Option 1 until AB chooses. The switch shows on every screen size; on phones Option 2 is the static chapter sheets.
- **Copy in Phase 1.** Not blocked on sign-off. Phase 1 uses today's copy unchanged. Each correction in section 9 is applied only when AB signs it off. Dates marked [NYA] show as given on NYA's own project pages.
- **Prologue.** Not a counted chapter. It is the inside of the cover: firm name and "Established 1989" (nyase.com). The contents, runway and announcements count six chapters. Founder text is left out until AB decides (question 7). Year tabs on the fore-edge start at 1989, which is the firm's founding year and makes no claim about hospital work.
- **Fit test and long text.** If the full text page does not fit the stage, the book layer drops the long description for all chapters and keeps the outcome sentence, specs and link; the project link leads to the full story. The book falls back to the base layer only if that shorter page still does not fit. The base layer always shows the long description.
- **Minifying three.js.** One-off command run by hand (for example `npx esbuild` bundling the two files into one minified ES module), output committed as a single pinned file with the version in its name. No build step is added to the repo. Where the file is served from is still question 1; if it is served from another origin it needs CORS headers.
- **Phase 2 without pop-up layers.** Yes. Phase 2 ships behind the switch with each photograph flat on its plate. Phase 3 replaces them with layered pop-ups one chapter at a time.
- **Mid-turn settle.** When scrolling resumes, the page blends back to the scroll-driven angle over a few frames.
- **Button scrolling.** Previous, Next and contents use smooth scrolling, and instant scrolling under reduced motion. To be checked against the `#nya-s33` wheel listener in Phase 4.
- **Frame-rate fallback.** Decided once, during the opening. If it triggers, the section is un-pinned and the scroll position is corrected in the same frame so the reader stays at the start of the chapters. This is the one allowed scroll correction besides button presses.
- **Exit.** `#nya-s33` is white with a top border (code audit). The match is checked by eye in Phase 2.
- **PART markers** wrap the `#projects` section only. The modal stays where it is while Option 1 exists.

## 11b. Best guesses used for the plan

AB asked for best guesses rather than answering section 12. Each can be changed later; the cost of changing is noted.

1. **three.js file:** one pinned, minified file beside `NYA_Healthcare.html` in the repo, whitelisted in `.gitignore`. Production upload becomes two files. Cheap to move later (one URL).
2. **Order:** by date (Hillcrest, Cedars-Sinai, UC Irvine, Century City, Stanford, UCSF). Cheap to change (data order).
3. **Photographs:** chosen in Phase 0 by which separates into layers best, shown to AB before the other five are processed.
4. **Corrections:** today's copy ships unchanged behind the switch. The corrections in section 9 are listed in `TODO.md` for AB to sign off. The book is not proposed as the default until they are settled.
5. **Phones in portrait:** static chapter sheets. A second immersive build is not planned.
6. **Founder:** not named in the book. Inside cover says "Established 1989".
7. **Heading:** unchanged, "Your hospital deserves proven hands". The note under it is rewritten because it describes the modal.

## 12. Open questions for AB

1. Hosting for three.js: one pinned file beside the HTML (production upload becomes two files), or on nyase.com / hospitals.nyase.com? A public CDN is not proposed.
2. Chapter order: chronological (proposed) or Stanford first?
3. Which photograph per chapter becomes the pop-up (the card image, the modal image, or one from the nyase.com project page)? Proposed: choose in Phase 0 by which separates into layers best, then AB approves.
4. Phones in portrait: static chapter sheets (proposed), or a second, single-page immersive build?
5. Photographs: the card image and the modal image are different files for five of six projects. Which goes on the plate?
6. Content corrections in section 9: who signs off, especially the Stanford and Cedars-Sinai wording?
7. The founder in the prologue: include, and in what words?
8. Heading: keep "Your hospital deserves proven hands", or change it for the history theme?

## 13. Left to the builder

- Page-bend technique, lighting and material values, easing curves.
- Exact runway numbers after the spike.
- Mesh detail and texture sizes within the frame budget.
- Class names and internal structure of `book-behavior`.

## 14. Not verified

- Nothing here has been run in a browser or on iOS Safari.
- Contrast figures are calculated, not measured.
- Research facts come from the sources named in the research reports; several were read from search snippets only (Stanford's 300 Pasteur program, some dates). Facts marked [NYA] have no outside source.
