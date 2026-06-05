// Generic module -> lesson-player converter.
// Usage: node .cm.js <configFile.json>
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let h = fs.readFileSync('platform.html', 'utf8');

const P = cfg.prefix;
function must(str) {
  if (h.indexOf(str) === -1) { console.error('ANCHOR NOT FOUND:\n' + str.slice(0, 120)); process.exit(1); }
  if (h.split(str).length > 2) { console.error('ANCHOR NOT UNIQUE:\n' + str.slice(0, 120)); process.exit(1); }
}

// 1) Hero -> chrome + article 0 open + video + lead
const heroRep =
`            <div id="${P}-player" class="lesson-player" data-current="0">
                <div class="lp-topbar">
                    <button type="button" class="lp-menu-btn" onclick="lpToggleMenu('${P}')" aria-label="Open lessons menu"><span class="lp-menu-btn-icon">&#9776;</span> Lessons</button>
                    <div class="lp-progress" role="progressbar" aria-label="${cfg.moduleName} progress"><div class="lp-progress-fill" id="${P}-progress-fill"></div></div>
                    <span class="lp-progress-label" id="${P}-progress-label">0/${cfg.denom}</span>
                </div>
                <div class="lp-body">
                    <div class="lp-menu-overlay" id="${P}-menu-overlay" onclick="lpCloseMenu('${P}')"></div>
                    <nav class="lp-menu" id="${P}-menu" aria-label="Lesson menu">
                        <div class="lp-menu-head"><span>Lessons</span><button type="button" class="lp-menu-close" onclick="lpCloseMenu('${P}')" aria-label="Close lessons menu">&times;</button></div>
                        <ol class="lp-menu-list" id="${P}-menu-list"></ol>
                    </nav>
                    <div class="lp-content" id="${P}-content">

                <article class="lp-lesson" data-lesson="0" id="${P}-lesson-0" hidden>
                    <h2 class="lp-lesson-title">${cfg.title0}</h2>
                    <div class="lp-video"><div class="lp-video-frame"><div class="lp-video-ph"><span class="lp-video-ph-icon">&#9654;</span><span class="lp-video-ph-text">Module Overview &mdash; Here&rsquo;s what we&rsquo;ll cover &mdash; coming soon</span></div></div></div>
                    <p class="text-lg text-slate-600 mb-6">${cfg.lead0}</p>`;
must(cfg.hero);
h = h.replace(cfg.hero, heroRep);

// 2) Boundaries: close prev article, open next
cfg.boundaries.forEach(function (b, i) {
  const num = i + 1;
  const keyAttr = b.key ? ` data-key="${b.key}"` : '';
  const rep =
`                </article>

                <article class="lp-lesson" data-lesson="${num}"${keyAttr} id="${P}-lesson-${num}" hidden>
${b.comment}`;
  must(b.comment);
  h = h.replace(b.comment, rep);
});

// 3) Tail: replace from tailStart..sectionClose with end article + chrome close
const endNum = cfg.boundaries.length + 1;
const certBlock = cfg.cert ?
`                    <div class="lp-cert-cta">
                        <p class="lp-cert-cta-note">${cfg.cert.note}</p>
                        <button type="button" class="lp-cert-link" onclick="${cfg.cert.fn}">Take the full certification exam &rarr;</button>
                    </div>
` : '';
const cortexBlock = cfg.cortex ?
`                    <div class="bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl p-6 text-white mb-8">
                        <h4 class="font-bold text-lg mb-2">${cfg.cortex.h}</h4>
                        <p class="text-sm text-slate-300 mb-3">${cfg.cortex.p}</p>
                        <a href="https://jobdox.ai" target="_blank" rel="noopener" class="inline-block bg-violet-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-violet-400 transition shadow-md text-sm">Learn More at JobDox.ai &rarr;</a>
                    </div>
` : '';
const tailRep =
`                </article>

                <article class="lp-lesson lp-end" data-lesson="${endNum}" id="${P}-lesson-${endNum}" hidden>
                    <div class="lp-complete">
                        <div class="lp-complete-icon">&#9989;</div>
                        <h2>${cfg.moduleName} module complete</h2>
                        <p>Nice work &mdash; you&rsquo;ve finished every lesson in ${cfg.moduleName}.</p>
                    </div>
${cortexBlock}${certBlock}                </article>

                    </div>
                </div>

                <div class="lp-nav">
                    <button type="button" class="lp-back" id="${P}-back" onclick="lpPrev('${P}')">Back</button>
                    <button type="button" class="lp-next" id="${P}-next" onclick="lpNext('${P}')">Next</button>
                </div>

            </div>
`;
if (cfg.tailStart) {
  const tailStart = h.indexOf(cfg.tailStart);
  if (tailStart === -1) { console.error('TAIL start not found'); process.exit(1); }
  const tailEnd = h.indexOf(cfg.tailClose, tailStart);
  if (tailEnd === -1) { console.error('TAIL close not found'); process.exit(1); }
  h = h.slice(0, tailStart) + tailRep + h.slice(tailEnd);
} else {
  // Insert completion + chrome close right before THIS section's </section>
  const ss = h.indexOf('<section id="sec-' + cfg.section + '"');
  const se = h.indexOf('        </section>', ss);
  if (se === -1) { console.error('section close not found'); process.exit(1); }
  h = h.slice(0, se) + tailRep + h.slice(se);
}

// 4) Strip decorative emoji within this section only (preserves ✓ • arrows)
const secStart = h.indexOf('<section id="sec-' + cfg.section + '"');
const secEnd = h.indexOf('</section>', secStart) + '</section>'.length;
let sec = h.slice(secStart, secEnd);
const EMO = '\\u{1F300}-\\u{1FAFF}\\u{1F004}\\u{2139}\\u{2196}-\\u{2199}\\u{2122}\\u{2705}\\u{2708}-\\u{270C}\\u{26A0}-\\u{26FF}\\u{2B00}-\\u{2BFF}\\u{2600}-\\u{26FF}';
sec = sec.replace(new RegExp('[' + EMO + ']\\uFE0F?\\s?', 'gu'), '');
h = h.slice(0, secStart) + sec + h.slice(secEnd);

fs.writeFileSync('platform.html', h);
console.log(cfg.prefix + ' converted (' + endNum + ' content+intro articles, end=' + endNum + ')');
