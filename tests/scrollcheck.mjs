// Fast scroll regression check for NYA_Healthcare.html: static guards plus one action per
// input method (keys, wheel, trackpad/touch gestures, scrollbar track) at the top, bottom and
// entry/middle/exit of every pinned section, run in parallel pages. See README for setup.
// Usage: npm run test:scroll [-- url]   (without a url it serves this repo itself)
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TYPES = { '.html': 'text/html', '.webp': 'image/webp', '.js': 'text/javascript', '.css': 'text/css' };
let server = null;
async function serveRepo() {
  server = createServer(async (req, res) => {
    const path = normalize(join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
    if (!path.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    try { res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }).end(await readFile(path)); }
    catch { res.writeHead(404).end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return `http://127.0.0.1:${server.address().port}/NYA_Healthcare.html`;
}
const URL_ = process.argv[2] || await serveRepo();
const VW = 1440, VH = 800;
const t0 = Date.now();
const results = [];
const rec = (ok, name, detail = '') => results.push({ ok, name, detail });

// Record listeners that can block scrolling and every preventDefault on a scroll-relevant event.
const INSTRUMENT = () => {
  window.__blockers = []; window.__pd = [];
  const SCROLLY = new Set(['wheel', 'mousewheel', 'touchstart', 'touchmove', 'keydown']);
  const add = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    const passive = typeof opts === 'object' && opts?.passive;
    if (SCROLLY.has(type) && !passive && type !== 'keydown' && (this === window || this === document || this === document.body || this === document.documentElement))
      __blockers.push(type);
    return add.call(this, type, fn, opts);
  };
  const pd = Event.prototype.preventDefault;
  const KEYS = new Set([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End']);
  Event.prototype.preventDefault = function () {
    if (this.type === 'wheel' || this.type === 'touchmove' || (this.type === 'keydown' && KEYS.has(this.key)))
      __pd.push(this.type + ':' + (this.key || '') + '@' + (this.target?.id || this.target?.tagName));
    return pd.call(this);
  };
};

const browser = await chromium.launch({ channel: 'chrome', headless: false, ignoreDefaultArgs: ['--hide-scrollbars'] });
async function open() {
  const p = await browser.newPage({ viewport: { width: VW, height: VH } });
  await p.addInitScript(INSTRUMENT);
  // Local static servers can drop connections under parallel load; retry the navigation, not the checks.
  for (let i = 0; ; i++) { try { await p.goto(URL_, { waitUntil: 'load' }); break; } catch (e) { if (i === 2) throw e; await p.waitForTimeout(500); } }
  await p.waitForTimeout(1500);
  return p;
}
const st = p => p.evaluate(() => ({ y: Math.round(scrollY), max: document.documentElement.scrollHeight - innerHeight }));
async function settle(p) { let last = -1, same = 0, s; for (let i = 0; i < 60 && same < 4; i++) { await p.waitForTimeout(40); s = await st(p); same = s.y === last ? same + 1 : 0; last = s.y; } return s; }
async function jump(p, y) { await p.evaluate(y => { scrollTo({ top: y, behavior: 'instant' }); document.activeElement?.blur(); }, y); return settle(p); }

// ---- Static guards ----
const p0 = await open();
const g = await p0.evaluate(() => {
  const cs = e => getComputedStyle(e), de = document.documentElement, b = document.body;
  const pins = ['difference-story', 'amc-funnel', 'ucsf-case-study', 'relationships-story', 'uci-delivery-proof', 'nya-s33']
    .map(id => document.getElementById(id) || document.querySelector('.' + id)).filter(Boolean)
    .map(s => ({ id: s.id || s.className.split(' ')[0], top: Math.round(s.getBoundingClientRect().top + scrollY), h: s.offsetHeight }));
  return { snapHtml: cs(de).scrollSnapType, snapBody: cs(b).scrollSnapType, ovHtml: cs(de).overflowY, ovBody: cs(b).overflowY,
    scroller: document.scrollingElement === de, sbw: innerWidth - de.clientWidth, sh: de.scrollHeight, pins, blockers: __blockers };
});
rec(g.snapHtml === 'none' && g.snapBody === 'none', 'No scroll-snap on root scroller', `html=${g.snapHtml} body=${g.snapBody}`);
rec(g.ovHtml !== 'hidden' && g.ovBody !== 'hidden' && g.scroller, 'Root is the scroller, not overflow:hidden', `html=${g.ovHtml} body=${g.ovBody}`);
rec(g.blockers.length === 0, 'No non-passive wheel/touch listeners on window/document', g.blockers.join(','));

// Checkpoints: entry, middle and exit of every pinned section, plus top and bottom.
const max = g.sh - VH, cps = new Set([0, max]);
for (const s of g.pins) for (const y of [s.top, s.top + s.h / 2, s.top + s.h - VH]) cps.add(Math.max(0, Math.min(max, Math.round(y))));
const checkpoints = [...cps].sort((a, b) => a - b);

// Height must not change as the reader scrolls through (layout feedback loops shift content).
for (const y of checkpoints) await jump(p0, y);
await jump(p0, 0);
const sh2 = await p0.evaluate(() => document.documentElement.scrollHeight);
rec(Math.abs(sh2 - g.sh) <= 2, 'Page height stable while scrolling', `${g.sh} -> ${sh2}`);
await p0.close();

// ---- One action per method at each checkpoint ----
const cdp = async p => (p.__cdp ||= await p.context().newCDPSession(p));
const sbx = VW - g.sbw / 2;
const methods = [
  // name, dir, action, [minDelta, maxDelta]
  ['ArrowDown', 1, p => p.keyboard.press('ArrowDown'), [20, 120]],
  ['ArrowUp', -1, p => p.keyboard.press('ArrowUp'), [20, 120]],
  ['Space', 1, p => p.keyboard.press('Space'), [VH * .5, VH * 1.05]],
  ['Shift+Space', -1, p => p.keyboard.press('Shift+Space'), [VH * .5, VH * 1.05]],
  ['PageDown', 1, p => p.keyboard.press('PageDown'), [VH * .5, VH * 1.05]],
  ['PageUp', -1, p => p.keyboard.press('PageUp'), [VH * .5, VH * 1.05]],
  ['Wheel notch down', 1, async p => { await p.mouse.move(VW / 2, VH / 2); await p.mouse.wheel(0, 100); }, [60, 160]],
  ['Wheel notch up', -1, async p => { await p.mouse.move(VW / 2, VH / 2); await p.mouse.wheel(0, -100); }, [60, 160]],
  // Compositor-level gesture (real gesture pipeline): slow trackpad-style and touch swipes.
  ['Slow trackpad swipe down', 1, async p => (await cdp(p)).send('Input.synthesizeScrollGesture', { x: VW / 2, y: VH / 2, yDistance: -150, speed: 300, gestureSourceType: 'mouse', preventFling: true }), [100, 220]],
  ['Slow trackpad swipe up', -1, async p => (await cdp(p)).send('Input.synthesizeScrollGesture', { x: VW / 2, y: VH / 2, yDistance: 150, speed: 300, gestureSourceType: 'mouse', preventFling: true }), [100, 220]],
  ['Touch swipe down', 1, async p => (await cdp(p)).send('Input.synthesizeScrollGesture', { x: VW / 2, y: VH / 2, yDistance: -200, speed: 600, gestureSourceType: 'touch', preventFling: true }), [120, 280]],
];
if (g.sbw > 0) methods.push(
  ['Scrollbar track click below thumb', 1, p => p.mouse.click(sbx, VH - 30), [VH * .5, VH * 1.05]],
  ['Scrollbar track click above thumb', -1, p => p.mouse.click(sbx, 30), [VH * .5, VH * 1.05]],
  ['Scrollbar track press-and-hold', 1, async p => { await p.mouse.move(sbx, VH - 30); await p.mouse.down(); await p.waitForTimeout(700); await p.mouse.up(); }, [VH * .9, 1e9]],  // >= a page; the thumb stops repeating once it reaches the pointer
);
else rec(null, 'Scrollbar tests skipped', 'overlay scrollbars; run `defaults write -g AppleShowScrollBars -string Always` first');

const fails = {}, flaky = {};
async function runMethod([name, dir, act, [lo, hi]]) {
  const p = await open(); let n = 0;
  for (const y of checkpoints) {
    if ((dir > 0 && y >= max - 5) || (dir < 0 && y <= 5)) continue;
    // Scrollbar clicks need the thumb away from the click point.
    if (name.startsWith('Scrollbar')) { const th = Math.max(VH * VH / g.sh, 18), ty = y / max * (VH - th); if (dir > 0 ? ty + th > VH - 40 : ty < 40) continue; }
    let bad = null;
    for (let attempt = 0; attempt < 2; attempt++) {   // one retry: synthetic input right after a jump is occasionally dropped
      const a = await jump(p, y); await p.waitForTimeout(100); await act(p); const b = await settle(p);
      const d = (b.y - a.y) * dir, room = dir > 0 ? max - a.y : a.y;
      if (d >= Math.min(lo, room - 2) && d <= hi) { if (attempt) (flaky[name] ||= []).push(`${a.y}`); bad = null; break; }
      bad = `${a.y}->${b.y}`;
    }
    if (bad) (fails[name] ||= []).push(bad);
    n++;
  }
  const pd = await p.evaluate(() => __pd);
  if (pd.length) (fails[name] ||= []).push('preventDefault: ' + [...new Set(pd)].join(','));
  rec(!fails[name], `${name} (${n} checkpoints)`, (fails[name] || []).slice(0, 5).join('  ') + (flaky[name] ? `  [passed on retry at ${flaky[name].join(',')}]` : ''));
  await p.close();
}
// Run methods in parallel batches; each has its own page and focus.
for (let i = 0; i < methods.length; i += 6) await Promise.all(methods.slice(i, i + 6).map(runMethod));

// Home / End once.
{ const p = await open(); await jump(p, Math.round(max / 2)); await p.keyboard.press('End'); let s = await settle(p); rec(s.y >= s.max - 2, 'End reaches bottom', `${s.y}/${s.max}`);
  await p.keyboard.press('Home'); s = await settle(p); rec(s.y <= 2, 'Home reaches top', `${s.y}`); await p.close(); }

// Project modal: page must not scroll behind it; closed modal must not be in Tab order.
{ const p = await open();
  const card = await p.evaluate(() => { const c = document.querySelector('.project'); c.classList.add('is-visible'); scrollTo({ top: c.getBoundingClientRect().top + scrollY - 200, behavior: 'instant' }); return !!c; });
  if (card) {
    await p.click('.project'); await p.waitForTimeout(400); const a = await settle(p);
    const foc = await p.evaluate(() => document.activeElement?.id || document.activeElement?.className);
    rec(/modal/.test(foc), 'Opening project modal focuses it', foc);
    await p.mouse.move(100, VH / 2); for (let i = 0; i < 6; i++) await p.mouse.wheel(0, 300);
    await p.keyboard.press('PageDown'); await p.keyboard.press('ArrowDown');   // not Space: it activates the focused close button
    const b = await settle(p); rec(Math.abs(b.y - a.y) <= 2, 'Page locked behind open modal', `${a.y} -> ${b.y}`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.keyboard.press('PageDown'); const c = await settle(p); rec(c.y - b.y > VH * .5, 'Page scrolls again after modal closes', `${b.y} -> ${c.y}`);
  }
  await p.evaluate(() => { scrollTo({ top: 1e6, behavior: 'instant' }); document.body.focus(); });
  const hits = [];
  for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); const h = await p.evaluate(() => { const e = document.activeElement; return e?.closest('.modal') ? (e.id || e.className) : null; }); if (h) hits.push(h); }
  rec(hits.length === 0, 'Closed modal controls not reachable by Tab', hits.join(','));
  await p.close(); }

await browser.close();
server?.close();
console.log(`# ${URL_}\n# viewport ${VW}x${VH}, scrollbar ${g.sbw}px, ${checkpoints.length} checkpoints: ${checkpoints.join(' ')}`);
for (const r of results) console.log(`${r.ok === null ? 'SKIP' : r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  — ' + r.detail : ''}`);
const nf = results.filter(r => r.ok === false).length;
console.log(`# ${nf ? nf + ' FAILED' : 'ALL PASS'} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
process.exit(nf ? 1 : 0);
