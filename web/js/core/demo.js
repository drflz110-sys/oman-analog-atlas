// DEMO MODE (?demo): the whole walkthrough plays by itself in about two minutes, with a caption for each step.
// Space pauses / resumes, → skips to the next step, Esc stops. Every step waits for the page it needs, so it
// runs the same way every time.

const wait = ms => new Promise(r => setTimeout(r, ms));
async function until(test, ms = 15000) { const t0 = performance.now(); while (performance.now() - t0 < ms) { try { if (test()) return true; } catch { /* not yet */ } await wait(150); } return false; }
const $ = s => document.querySelector(s);
const click = async (sel, ms) => { if (await until(() => $(sel) && !$(sel).disabled, ms)) $(sel).click(); };

export function startDemo({ go, store }) {
  const STEPS = [
    { t: 9, title: "Where Earth rehearses", say: "Before astronauts go to the Moon or Mars, they rehearse on Earth. UBAR uses NASA satellite data to find the places in Oman that are most like where they are going, and shows why.",
      run: async () => { store.setMission("mars_science"); go("#orbit"); } },
    { t: 8, title: "1 · Choose a mission", say: "First, where are the astronauts going? Our mission today: Mars science, at Jezero's ancient river delta.",
      run: async () => go("#director") },
    { t: 11, title: "Fly to the destination", say: "The camera flies to Mars and closes in on Jezero crater, where NASA's Perseverance rover landed. The panel explains why crews go there, in plain words.",
      run: async () => go("#director-mars") },
    { t: 7, title: "The real target values", say: "These are the real conditions measured on Mars: the targets every place in Oman is compared with.",
      run: async () => click('#dossier [data-dtab="data"]') },
    { t: 11, title: "2 · Find the matches in Oman", say: "Back to Earth. Every square kilometre of Oman is scored on ten criteria against Jezero. The numbered diamonds are the ten best sites.",
      run: async () => go("#oman") },
    { t: 9, title: "Each criterion is a map", say: "This layer is minerals measured from space by NASA's EMIT: bright areas hold the same water-formed rocks that Perseverance found at Jezero.",
      run: async () => { await until(() => $("#liveStatus")?.textContent.includes("Map updated"), 20000); await click('#strata [data-l="minerals"]'); } },
    { t: 10, title: "3 · A site's passport", say: "Every site has a passport in plain words. Near Ibra scores 90 out of 100 for Mars science: the same minerals and ancient riverbeds, but it can't copy Mars's gravity, air or cold.",
      run: async () => { await click('#strata [data-l="asi"]'); go("#site-S05"); } },
    { t: 12, title: "The site in 3D", say: "Real terrain and satellite imagery. The blue box is the area our team surveyed with a drone; the gold square is the one-kilometre area the score describes.",
      run: async () => click("#site3dBtn", 8000) },
    { t: 11, title: "4 · Meet the analog", say: "Destinations puts the real Mars terrain beside its Oman analog at the same 24-kilometre size and height scale. Jezero's floor, where Perseverance landed, is 90% alike to Mizayra at the edge of the Wahiba Sands.",
      run: async () => { if (document.querySelector(".atlas.in3d")) { $("#site3dBtn")?.click(); await wait(600); }
        go("#destination-mars_jezero_delta"); await click('#dSeg [data-k="both"]', 12000); await wait(300); $(".dstage")?.scrollIntoView({ behavior: "smooth", block: "center" }); } },
    { t: 10, title: "Honest about the Moon", say: "Shackleton crater at the lunar south pole has walls 4 kilometres deep. Oman can't copy that: the best match is only 32% alike, and the site says so.",
      run: async () => { go("#destination-moon_shackleton"); await until(() => $('.dcardb[aria-pressed="true"]')?.dataset.id === "moon_shackleton", 12000); await click('#dSeg [data-k="both"]', 12000); await wait(300); $(".dstage")?.scrollIntoView({ behavior: "smooth", block: "center" }); } },
    { t: 11, title: "5 · Live the mission in VR", say: "In a Meta Quest you live the whole mission: the briefing at this holo-table, your suit, the journey, orbit, landing, and the base built step by step, with a narrator.",
      run: async () => go("#vr") },
    { t: 7, title: "UBAR", say: "Open NASA data turning Oman into a rehearsal ground for the Moon and Mars.",
      run: async () => go("#orbit") },
  ];

  document.body.classList.add("demo-on");
  const ui = document.createElement("div"); ui.className = "demo-bar"; ui.setAttribute("role", "status"); ui.setAttribute("aria-live", "polite");
  ui.innerHTML = `<div class="demo-top"><span class="demo-k" id="demoK"></span><span class="demo-ctl"><button type="button" data-d="pause" title="Pause / resume (Space)">❚❚</button><button type="button" data-d="next" title="Next step (→)">▸▸</button><button type="button" data-d="stop" title="Stop the demo (Esc)">✕</button></span></div>
    <b id="demoT"></b><p id="demoS"></p><div class="demo-prog"><i id="demoP"></i></div>`;
  document.body.appendChild(ui);
  let i = -1, left = 0, paused = false, stopped = false, timer = 0;
  const total = STEPS.reduce((a, s) => a + s.t, 0), spent = k => STEPS.slice(0, k).reduce((a, s) => a + s.t, 0);
  async function show(k) {
    if (stopped) return;
    if (k >= STEPS.length) { stop(); return; }
    i = k; const s = STEPS[k]; left = s.t;
    ui.querySelector("#demoK").textContent = `Demo · ${k + 1} / ${STEPS.length}`;
    ui.querySelector("#demoT").textContent = s.title; ui.querySelector("#demoS").textContent = s.say;
    try { await s.run(); } catch { /* keep going */ }
  }
  function tick() {
    if (stopped) return;
    if (!paused) { left -= .25; if (left <= 0) { show(i + 1); } }
    const done = spent(i) + (STEPS[i]?.t || 0) - Math.max(0, left);
    ui.querySelector("#demoP").style.width = Math.min(100, done / total * 100) + "%";
  }
  function stop() { stopped = true; clearInterval(timer); document.body.classList.remove("demo-on"); ui.remove(); removeEventListener("keydown", key, true);
    try { history.replaceState(null, "", location.pathname + location.hash); } catch { /* fine */ } }
  function togglePause() { paused = !paused; ui.querySelector('[data-d="pause"]').textContent = paused ? "▶" : "❚❚"; ui.classList.toggle("paused", paused); }
  function key(e) {
    if (e.key === " ") { e.preventDefault(); e.stopPropagation(); togglePause(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); show(i + 1); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); stop(); }
  }
  ui.addEventListener("click", e => { const b = e.target.closest("[data-d]"); if (!b) return; if (b.dataset.d === "pause") togglePause(); else if (b.dataset.d === "next") show(i + 1); else stop(); });
  addEventListener("keydown", key, true);
  timer = setInterval(tick, 250);
  show(0);
  return { stop };
}
