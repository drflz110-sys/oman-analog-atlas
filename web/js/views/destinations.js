// DESTINATIONS: the real Moon and Mars places crews are heading to, in 3D from NASA elevation data, each with its Oman twin.
// Ported from the team's reference page (OmanAnalogAtlas_handoff/destinations). Routes: #destinations, #destination-<id>.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { esc, setKeys } from "../core/ui.js";

let DEST = null;
const loadDest = () => DEST ? Promise.resolve(DEST) : fetch("data/destinations.json").then(r => { if (!r.ok) throw new Error("destinations.json " + r.status); return r.json(); }).then(d => (DEST = d));

/* ---------------------------------------------------------------- stories */
const STORY = {
  mars_jezero_floor: { short: "Where Perseverance touched down", profile: "mars_landing", kind: "plain",
    text: "Jezero is a 45 km crater that held a lake about 3.5 billion years ago. NASA's Perseverance rover landed on its flat floor on 18 February 2021 and has been collecting rock samples ever since. The floor is gentle, dusty volcanic and lake-bottom rock: ideal for landing and driving.",
    why: ["One of the safest flat spots near the oldest lake on Mars", "Rover traverses start here before climbing the delta", "Weather station data (MEDA) tells us what crews would face"] },
  mars_jezero_delta: { short: "The fossil river delta", profile: "mars_science", kind: "delta",
    text: "A river once poured into Jezero's lake and dropped layers of mud and sand, building a fan-shaped delta with cliff-like fronts. Layered, water-laid rock is the best place on Mars to look for signs of ancient life, so this is the prize Perseverance climbed.",
    why: ["Layered rock records the lake's history page by page", "Clays and carbonates here formed in water", "Top target for samples that may come back to Earth"] },
  mars_ne_syrtis: { short: "Ancient crust with serpentine", profile: "mars_science", kind: "serp",
    text: "Northeast Syrtis, next door to Jezero, was a finalist landing site for Perseverance. Orbiters see olivine, carbonate and serpentine here: the same family of rocks that makes Oman's Samail ophiolite world-famous. Where serpentine forms, water reacts with rock and can feed microbes.",
    why: ["Rocks very close to Oman's ophiolite", "Water–rock reactions that can produce hydrogen for life", "Perseverance has driven into this kind of terrain"] },
  mars_nili_fossae: { short: "Giant troughs and carbonate plains", profile: "mars_science", kind: "serp",
    text: "Nili Fossae is a set of huge troughs west of Isidis. Its plains carry one of the clearest carbonate and olivine signals on Mars: rocks that may have trapped ancient water and carbon dioxide.",
    why: ["Strong carbonate & olivine signals from orbit", "Broad gentle plains between the troughs", "Long considered for human-mission exploration zones"] },
  mars_isidis: { short: "Smooth basin plains", profile: "mars_landing", kind: "plain",
    text: "Isidis Planitia is the floor of a huge ancient impact basin. It is one of the smoothest, lowest plains on Mars: thick air above it helps parachutes, and the flat ground is kind to landers.",
    why: ["Very flat, low-hazard ground", "Low elevation = more air to slow a lander", "Good model for a landing and habitat zone"] },
  moon_shackleton: { short: "Rim of the south-pole crater", profile: "moon_base", kind: "crater",
    text: "Shackleton is a 21 km wide, 4.2 km deep crater sitting right on the Moon's south pole. Peaks on its rim are lit by the Sun 80–90% of the time, while its floor never sees sunlight and stays colder than −170 °C: a trap where ice may hide.",
    why: ["Near-constant sunlight on the rim → solar power", "Permanently dark floor may hold water ice", "The connecting ridge to de Gerlache is a top Artemis zone"] },
  moon_malapert: { short: "A 5 km-high polar mountain", profile: "moon_base", kind: "massif",
    text: "Malapert Massif is a tall mountain near the south pole and one of NASA's nine candidate Artemis III landing regions. Its slopes catch sunlight for long periods and give a clear line of sight toward Earth.",
    why: ["Artemis III candidate region", "Long sunlight + view of Earth for radio contact", "Steep slopes test how crews walk and drive"] },
  moon_mouton: { short: "A flat-topped mountain", profile: "moon_base", kind: "massif",
    text: "Mons Mouton (once called Leibnitz Beta) is a broad mountain with a remarkably flat top. Both Mons Mouton and the Mons Mouton Plateau are on NASA's Artemis III list.",
    why: ["Flat summit plateau for landing", "High ground stays sunlit", "Artemis III candidate region"] },
  moon_haworth: { short: "Gentle rim beside a dark crater", profile: "moon_base", kind: "rim",
    text: "Haworth is a large crater whose interior is permanently shadowed. The surrounding rim plains are gentle by polar standards: a candidate Artemis III region where astronauts could land in light and walk toward the dark.",
    why: ["Artemis III candidate region", "Short walk from sunlit ground to permanent shadow", "Gentlest ground of our Moon targets"] },
  moon_nobile: { short: "Crater rim near the pole", profile: "moon_base", kind: "rim",
    text: "Nobile is an old, degraded crater near the south pole. Its rim areas (Nobile Rim 1 and 2) are on NASA's Artemis III list, with mixed sunlight and shadowed pockets nearby.",
    why: ["Two Artemis III candidate regions on its rim", "Shadowed pockets close to lit ground", "Rolling rim terrain"] },
  moon_degerlache: { short: "Rim linked to Shackleton", profile: "moon_base", kind: "rim",
    text: "De Gerlache is a crater joined to Shackleton by the famous 'connecting ridge'. Its rim (de Gerlache Rim 2) is an Artemis III candidate region.",
    why: ["Artemis III candidate region", "Close to the connecting ridge's long sunlight", "Dark crater interior nearby"] },
};
const BODY = {
  Mars: { label: "Mars", badge: "b-mars", facts: [["Gravity", "0.38 × Earth"], ["Air", "≈0.6% of Earth's, mostly CO₂"], ["Average air temp (Jezero)", "−55 °C"], ["Day–night swing (Jezero)", "50–60 °C"]],
    rehearse: { plain: ["Pick and check a landing zone with drones", "Drive a rover 10+ km without getting stuck", "Set up a habitat and power on level ground", "Spacesuit walks on dusty, gentle ground"],
      delta: ["Read rock layers like a field geologist", "Collect and seal rock cores", "Climb and map cliff-like layered fronts", "Choose which samples are worth bringing home"],
      serp: ["Sample serpentine and carbonate: the rocks Perseverance hunts", "Test instruments that look for life-friendly chemistry", "Map where water reacted with rock", "Practise drilling hard, altered rock"] },
    cant: ["Gravity is 2.6× stronger on Earth: loads, falls and walking differ", "Earth's thick air and magnetic field block radiation", "Mars air is too thin to breathe or to cool equipment", "Mars is far colder: −55 °C average"] },
  Moon: { label: "Moon", badge: "b-moon", facts: [["Gravity", "0.17 × Earth"], ["Air", "none (vacuum)"], ["Sunlit polar rims", "≈ −50 °C"], ["Permanent shadow", "colder than −170 °C"]],
    rehearse: { crater: ["Walk and drive along steep crater rims", "Navigate with the Sun always on the horizon", "Plan power around light and long shadows", "Approach a dark crater safely"],
      massif: ["Traverse long, steep mountain slopes", "Keep radio line-of-sight while moving", "Practise landing-zone selection on high ground", "Haul equipment uphill"],
      rim: ["EVAs between sunlit and shadowed ground", "Rover traverses on rolling rim terrain", "Set up solar power and a small base", "Collect samples near crater edges"] },
    cant: ["No air on the Moon: every step is in a spacesuit in vacuum", "Gravity is 6× weaker; dust behaves differently", "At the pole the Sun never rises more than a few degrees; Oman's Sun is high", "Shadowed craters below −170 °C cannot be copied"] },
};
const SUN = { Moon: lat => Math.max(1.5, 90 - Math.abs(lat) + 1.5), Mars: () => 32, Earth: () => 48 };
const PAL = {
  Moon: { low: [0.27, 0.28, 0.30], high: [0.66, 0.67, 0.68], sky: 0x000000, fog: null },
  Mars: { low: [0.45, 0.22, 0.12], high: [0.80, 0.52, 0.32], sky: 0xc79a73, fog: 0xc8a07a },
  Earth: { low: [0.55, 0.42, 0.28], high: [0.86, 0.74, 0.55], sky: 0x9fc0dc, fog: 0xbfd2e3 },
};
export const slopeWords = d => d < 2 ? "flat as a car park" : d < 5 ? "a gentle ramp" : d < 10 ? "a steep driveway" : d < 20 ? "a steep hiking trail" : "a scramble: hands needed in places";
export const reliefWords = r => r < 20 ? "a flat plain" : r < 60 ? "low, rolling ground" : r < 150 ? "hilly country" : r < 400 ? "mountain slopes" : "a huge crater wall / massif";
const verdict = sim => sim >= 0.8 ? ["v-good", "Strong terrain analog"] : sim >= 0.5 ? ["v-mid", "Partial analog"] : ["v-bad", "Weak analog: Oman has nothing this extreme"];
const pill = ok => ok === 2 ? `<span class="pill p-good">✓ same feel</span>` : ok === 1 ? `<span class="pill p-mid">~ close</span>` : `<span class="pill p-bad">✗ different</span>`;
const cls = (a, b, f) => f(a) === f(b) ? 2 : Math.abs(Math.log((a + 0.5) / (b + 0.5))) < 0.6 ? 1 : 0;
const shortName = t => t.name.split(" – ")[0].replace(/ \(.*\)/, "");

/** destination ids whose Oman twin (or close alternative) is this site, for the passport chip */
export async function twinOf(siteId) {
  const D = await loadDest().catch(() => null); if (!D) return [];
  return D.targets.filter(t => t.twin.id === siteId || t.alts.some(a => a.id === siteId)).map(t => ({ id: t.id, name: shortName(t), body: t.body, main: t.twin.id === siteId }));
}

/* ---------------------------------------------------------------- heightmaps */
function decodeHM(hm) {
  const bin = atob(hm.b64), u = new Uint16Array(hm.w * hm.h);
  for (let i = 0; i < u.length; i++) u[i] = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8);
  const z = new Float32Array(u.length); for (let i = 0; i < u.length; i++) z[i] = hm.min + u[i];
  return { w: hm.w, h: hm.h, z, km: hm.km };
}
const cacheHM = new Map();
const HMof = (key, hm) => { if (!cacheHM.has(key)) cacheHM.set(key, decodeHM(hm)); return cacheHM.get(key); };

function hillshadeCanvas(H, body, cv) {
  const ctx = cv.getContext("2d"); cv.width = H.w; cv.height = H.h; const img = ctx.createImageData(H.w, H.h);
  const p = PAL[body], el = SUN[body](-89) * Math.PI / 180, az = 315 * Math.PI / 180, cs = 24000 / H.w;
  let lo = Infinity, hi = -Infinity; for (const v of H.z) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  for (let y = 0; y < H.h; y++) for (let x = 0; x < H.w; x++) {
    const i = y * H.w + x, zx = (H.z[y * H.w + Math.min(H.w - 1, x + 1)] - H.z[y * H.w + Math.max(0, x - 1)]) / (2 * cs),
      zy = (H.z[Math.min(H.h - 1, y + 1) * H.w + x] - H.z[Math.max(0, y - 1) * H.w + x]) / (2 * cs);
    const slope = Math.atan(Math.hypot(zx, zy) * 1.5), asp = Math.atan2(zy, -zx);
    let s = Math.cos(Math.PI / 2 - Math.max(el, .35)) * Math.cos(slope) + Math.sin(Math.PI / 2 - Math.max(el, .35)) * Math.sin(slope) * Math.cos(az - asp);
    s = Math.max(0.08, s); const t = (H.z[i] - lo) / Math.max(1, hi - lo);
    const c = p.low.map((v, k) => (v + (p.high[k] - v) * t) * 255 * (0.35 + 0.9 * s));
    img.data.set([c[0], c[1], c[2], 255], i * 4);
  }
  ctx.putImageData(img, 0, 0);
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export default {
  async mount({ view, scene, go }, route) {
    scene.setActive(false);
    const root = document.createElement("div"); root.className = "page live dst";
    root.innerHTML = `<div class="page-inner"><p class="note">Loading the destinations…</p></div>`;
    view.appendChild(root);
    let D;
    try { D = await loadDest(); } catch (e) { root.innerHTML = `<div class="page-inner"><h1>Destinations unavailable</h1><p class="note">${esc(e.message)}</p></div>`; return {}; }
    const TWINS = D.twins;
    root.innerHTML = `<div class="page-inner">
      <div class="page-head"><p class="eyebrow">Destinations</p>
        <h1>Where are the astronauts going, and where in Oman can they rehearse it?</h1>
        <p>Before anyone walks on the Moon or Mars, crews practise on Earth in places that look and behave like their destination. Pick a real landing site below. You will see it in 3D from real NASA elevation data, stand on it, and then meet its closest analog in Oman, with a plain explanation of what the two have in common and what Earth can never copy.</p>
        <div class="steps"><span><b>1</b> Pick a destination</span><span><b>2</b> See it &amp; stand on it</span><span><b>3</b> Meet its Oman analog</span><span><b>4</b> Why it is (or isn't) a good rehearsal</span></div></div>
      <div class="picker" id="dPicker" aria-label="Destinations"></div>
      <div class="dstage">
        <div><div class="viewer" id="dViewer">
            <div class="vbar"><div class="dseg" id="dSeg"></div><span class="sp"></span><div class="dseg" id="dMode"></div></div>
            <div class="hint" id="dHint">Drag to turn · scroll to zoom</div>
            <div class="cap"><span class="tag" id="capL"></span><span class="tag" id="capR"></span></div>
          </div><div class="legend" id="vleg"></div></div>
        <div class="info" id="dInfo"></div>
      </div>
      <section class="twin" id="dTwin"></section>
      <footer class="dfoot">
        <p><b>What is real and what is illustration.</b> Terrain shapes are real: Moon from NASA's Lunar Reconnaissance Orbiter laser altimeter (LOLA, 80 m), Mars from Mars Global Surveyor (MOLA, 463 m: smooth, it shows landforms but not boulders), Oman from the Copernicus 90 m elevation model. Every 3D tile is exactly 24 × 13.5 km, so sizes compare directly. The "Stand there" horizon is computed from the same elevation data; sky colour, rocks and lighting are illustrated. Moon target positions are approximate feature centres; Mars positions are published landing / candidate sites.</p>
        <p>Analogs are chosen by terrain (slope, bumpiness, hilliness compared at the same scale). Oman scores come from the team's full 10-criterion analysis (90 m). NASA Space Apps 2026 · Oman Analog Atlas team.</p>
      </footer></div>`;
    const $ = s => root.querySelector(s);

    /* picker */
    const pick = $("#dPicker");
    for (const body of ["Mars", "Moon"]) {
      pick.insertAdjacentHTML("beforeend", `<div class="pgroup eyebrow">${body === "Mars" ? "Mars destinations" : "Moon destinations · lunar south pole"}</div>`);
      for (const t of D.targets.filter(t => t.body === body)) {
        const b = document.createElement("button"); b.type = "button"; b.className = "dcardb"; b.dataset.id = t.id; b.setAttribute("aria-pressed", "false");
        b.innerHTML = `<canvas aria-hidden="true"></canvas><div><b>${esc(shortName(t))}</b><small>${esc(STORY[t.id].short)}</small></div>`;
        pick.appendChild(b); hillshadeCanvas(HMof(t.id, t.hm), body, b.querySelector("canvas"));
        b.addEventListener("click", () => go("#destination-" + t.id));
      }
    }

    /* 3D viewer */
    const viewer = $("#dViewer");
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    viewer.prepend(renderer.domElement);
    const scn = new THREE.Scene(), camera = new THREE.PerspectiveCamera(45, 1.6, 0.05, 400);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.47;
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.25); scn.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 20, bottom: -20, near: 0.1, far: 200 }); sun.shadow.bias = -0.0008; scn.add(sun, sun.target);
    const stars = (() => { const g = new THREE.BufferGeometry(), n = 1500, p = new Float32Array(n * 3), r0 = rng(3);
      for (let i = 0; i < n; i++) { const u = r0() * 2 - 1, th = r0() * 6.283, r = 180; p.set([r * Math.sqrt(1 - u * u) * Math.cos(th), Math.abs(u) * r, r * Math.sqrt(1 - u * u) * Math.sin(th)], i * 3); }
      g.setAttribute("position", new THREE.BufferAttribute(p, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, sizeAttenuation: false })); })();
    scn.add(stars);
    let meshes = [];
    function terrainMesh(H, body, exag, offsetX = 0) {
      const g = new THREE.PlaneGeometry(24, 13.5, H.w - 1, H.h - 1); g.rotateX(-Math.PI / 2);
      let lo = Infinity, hi = -Infinity; for (const v of H.z) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      const pos = g.attributes.position, col = new Float32Array(pos.count * 3), p = PAL[body];
      for (let i = 0; i < pos.count; i++) {
        const t = (H.z[i] - lo) / Math.max(1, hi - lo), hs = Math.sin(i * 12.9898 + 78.233) * 43758.5453, n = (hs - Math.floor(hs) - 0.5) * 0.05;
        pos.setY(i, (H.z[i] - lo) / 1000 * exag); pos.setX(i, pos.getX(i) + offsetX);
        col.set(p.low.map((v, k) => v + (p.high[k] - v) * t + n), i * 3);
      }
      g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97, metalness: 0 }));
      m.castShadow = m.receiveShadow = true; return m;
    }
    function setEnv(body) {
      const p = PAL[body]; scn.background = new THREE.Color(p.sky); stars.visible = body === "Moon";
      scn.fog = p.fog ? new THREE.Fog(p.fog, 40, 160) : null;
      hemi.intensity = body === "Moon" ? 0.14 : 0.55; hemi.color.set(body === "Mars" ? 0xffd9b0 : 0xffffff);
    }
    function placeSun(body, lat) {
      const el = SUN[body](lat) * Math.PI / 180, az = (body === "Moon" ? 25 : 40) * Math.PI / 180, r = 60;
      sun.position.set(Math.sin(az) * Math.cos(el) * r, Math.sin(el) * r, Math.cos(az) * Math.cos(el) * r);
      sun.intensity = body === "Moon" ? 3.2 : 2.0; sun.color.set(body === "Mars" ? 0xfff0dd : 0xffffff);
    }
    const view3 = { target: null, show: "dest", exag: 2, mode: "3d" };
    const T = () => D.targets.find(x => x.id === view3.target);
    function build() {
      meshes.forEach(m => { scn.remove(m); m.geometry.dispose(); m.material.dispose(); }); meshes = [];
      const t = T(), tw = TWINS[t.twin.id];
      const HT = HMof(t.id, t.hm), HO = tw.hm ? HMof("o_" + tw.id, tw.hm) : null;
      const body = view3.show === "twin" ? "Earth" : t.body;
      setEnv(view3.show === "both" ? t.body : body); placeSun(view3.show === "twin" ? "Earth" : t.body, t.lat);
      if (view3.show === "dest") meshes.push(terrainMesh(HT, t.body, view3.exag));
      else if (view3.show === "twin" && HO) meshes.push(terrainMesh(HO, "Earth", view3.exag));
      else if (HO) meshes.push(terrainMesh(HT, t.body, view3.exag, -12.8), terrainMesh(HO, "Earth", view3.exag, 12.8));
      meshes.forEach(m => scn.add(m));
      const both = view3.show === "both"; let top = 0;
      meshes.forEach(m => { m.geometry.computeBoundingBox(); top = Math.max(top, m.geometry.boundingBox.max.y); });
      camera.position.set(0, top + (both ? 20 : 11), both ? 30 : 20); controls.target.set(0, top * 0.35, 0); controls.update();
      $("#capL").textContent = both ? `◀ ${t.body}: ${shortName(t)}` : view3.show === "twin" ? `Oman analog: ${tw.name}` : `${t.body}: ${t.name}`;
      $("#capR").textContent = both ? `Oman: ${tw.name} ▶` : `Tile 24 × 13.5 km · heights ×${view3.exag}`;
    }

    /* "stand there" view */
    const ground = document.createElement("canvas"); ground.style.display = "none"; ground.className = "dground"; viewer.appendChild(ground);
    let gAz = 200, drag = null;
    ground.addEventListener("pointerdown", e => { drag = [e.clientX, gAz]; ground.setPointerCapture(e.pointerId); });
    ground.addEventListener("pointermove", e => { if (drag) { gAz = (drag[1] - (e.clientX - drag[0]) * 0.25 + 3600) % 360; drawGround(); } });
    ground.addEventListener("pointerup", () => { drag = null; });
    function horizon(H) {   // max elevation angle (deg) per azimuth from the tile centre, split into near / mid / far bands
      let cx = H.w / 2, cy = H.h / 2; const cs = 24 / H.w;
      if (H._high) { let best = -Infinity; for (let y = 10; y < H.h - 10; y++) for (let x = 30; x < H.w - 30; x++) { const v = H.z[y * H.w + x] - 0.02 * ((x - H.w / 2) ** 2 + (y - H.h / 2) ** 2); if (v > best) { best = v; cx = x; cy = y; } } }
      const z0 = H.z[Math.round(cy) * H.w + Math.round(cx)] + 2;
      const out = [0, 1, 2].map(() => new Float32Array(360).fill(-3));
      for (let a = 0; a < 360; a++) {
        const ar = a * Math.PI / 180, dx = Math.sin(ar), dy = -Math.cos(ar);
        for (let d = 0.35; ; d += 0.06) {
          const x = cx + dx * d / cs, y = cy + dy * d / cs; if (x < 0 || y < 0 || x > H.w - 2 || y > H.h - 2) break;
          const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, I = y0 * H.w + x0;
          const z = H.z[I] * (1 - fx) * (1 - fy) + H.z[I + 1] * fx * (1 - fy) + H.z[I + H.w] * (1 - fx) * fy + H.z[I + H.w + 1] * fx * fy, ang = Math.atan2(z - z0, d * 1000) * 180 / Math.PI;
          const b = d < 2 ? 0 : d < 5 ? 1 : 2; if (ang > out[b][a]) out[b][a] = ang;
        }
      }
      for (let b = 1; b < 3; b++) for (let a = 0; a < 360; a++) out[b][a] = Math.max(out[b][a], out[b - 1][a] - 0.0001);
      return out;
    }
    function drawGround() {
      const t = T(), tw = TWINS[t.twin.id], isTwin = view3.show === "twin", body = isTwin ? "Earth" : t.body;
      const H = isTwin ? HMof("o_" + tw.id, tw.hm) : HMof(t.id, t.hm);
      if (!isTwin && t.body === "Moon") H._high = true;
      const hz = H._hz || (H._hz = horizon(H));
      const W = ground.width, Ht = ground.height, ctx = ground.getContext("2d"), fov = 80, ppd = W / fov, hy = Ht * 0.56;
      const sunEl = SUN[body](t.lat), sunAz = body === "Moon" ? 205 : 220;
      const sky = ctx.createLinearGradient(0, 0, 0, hy);
      if (body === "Moon") { sky.addColorStop(0, "#000"); sky.addColorStop(1, "#05060a"); }
      else if (body === "Mars") { sky.addColorStop(0, "#9c7b62"); sky.addColorStop(0.7, "#d1a57c"); sky.addColorStop(1, "#e6c39b"); }
      else { sky.addColorStop(0, "#5f95c8"); sky.addColorStop(1, "#d6e4ee"); }
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, Ht);
      const rr = rng(7);
      if (body === "Moon") { ctx.fillStyle = "#fff"; for (let i = 0; i < 260; i++) { ctx.globalAlpha = rr() * 0.8; ctx.fillRect(rr() * W, rr() * hy * 0.95, 1.4, 1.4); } ctx.globalAlpha = 1; }
      const xOf = az => { const d = ((az - gAz + 540) % 360) - 180; return W / 2 + d * ppd; };
      const sx = xOf(sunAz), sy = hy - sunEl * ppd;
      if (sx > -200 && sx < W + 200) {
        const r = body === "Mars" ? 0.35 * ppd : 0.53 * ppd, glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 14);
        glow.addColorStop(0, body === "Mars" ? "rgba(220,230,255,.55)" : "rgba(255,255,240,.6)"); glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = glow; ctx.fillRect(0, 0, W, Ht); ctx.fillStyle = "#fffbea"; ctx.beginPath(); ctx.arc(sx, sy, Math.max(4, r), 0, 7); ctx.fill();
      }
      if (body === "Moon") { const ex = xOf(20), ey = hy - 3 * ppd; if (ex > -50 && ex < W + 50) { const g = ctx.createRadialGradient(ex - 4, ey - 4, 1, ex, ey, 1.9 * ppd);
        g.addColorStop(0, "#cfe6ff"); g.addColorStop(0.6, "#3b7bd1"); g.addColorStop(1, "#0b2a5e"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, 1.9 * ppd, 0, 7); ctx.fill(); } }
      const cols = body === "Moon" ? ["#3a3c40", "#55585d", "#77797d"] : body === "Mars" ? ["#a7684a", "#b97a52", "#c98e62"] : ["#b9a284", "#c6aa82", "#d3b48a"];
      for (let b = 2; b >= 0; b--) {
        ctx.beginPath(); ctx.moveTo(0, Ht);
        for (let x = 0; x <= W; x += 2) { const az = (gAz + (x - W / 2) / ppd + 720) % 360, a0 = Math.floor(az), f = az - a0;
          const v = hz[b][a0 % 360] * (1 - f) + hz[b][(a0 + 1) % 360] * f; ctx.lineTo(x, hy - Math.max(-2.5, v) * ppd); }
        ctx.lineTo(W, Ht); ctx.closePath();
        ctx.fillStyle = cols[2 - b]; ctx.globalAlpha = body === "Moon" ? (b === 2 ? 1 : 0.85) : 1; ctx.fill(); ctx.globalAlpha = 1;
        if (body !== "Moon" && b > 0) { ctx.fillStyle = body === "Mars" ? "rgba(214,170,130,.25)" : "rgba(200,220,235,.25)"; ctx.fill(); }
      }
      const fg = ctx.createLinearGradient(0, hy, 0, Ht);
      const fgc = body === "Moon" ? ["rgba(110,112,116,.0)", "#6e7074"] : body === "Mars" ? ["rgba(180,110,70,0)", "#a8613d"] : ["rgba(200,170,120,0)", "#c09a68"];
      fg.addColorStop(0, fgc[0]); fg.addColorStop(0.35, fgc[1]); fg.addColorStop(1, fgc[1]);
      ctx.fillStyle = fg; ctx.fillRect(0, hy + 0.5 * ppd, W, Ht);
      const r2 = rng(Math.floor(gAz / 3) + 11), shadowDir = ((sunAz - gAz + 540) % 360 - 180) > 0 ? -1 : 1, shLen = Math.min(9, 1 / Math.tan(Math.max(1.5, sunEl) * Math.PI / 180) * 0.35);
      for (let i = 0; i < (body === "Earth" ? 130 : 180); i++) {
        const depth = r2(), y = hy + 0.8 * ppd + depth * depth * (Ht - hy), sz = (1 + depth * depth * 26) * (0.4 + r2()) * (W / 1400), x = r2() * W;
        if (body === "Moon" && r2() < 0.08) { ctx.strokeStyle = "rgba(30,30,32,.55)"; ctx.lineWidth = 1 + sz * 0.08; ctx.beginPath(); ctx.ellipse(x, y, sz * 2.2, sz * 0.55, 0, 0, 7); ctx.stroke(); continue; }
        ctx.fillStyle = body === "Moon" ? "rgba(0,0,0,.75)" : "rgba(40,20,10,.35)";
        ctx.beginPath(); ctx.ellipse(x + shadowDir * sz * shLen * 0.6, y + sz * 0.25, sz * (1 + shLen * 0.6), sz * 0.3, 0, 0, 7); ctx.fill();
        const rc = body === "Moon" ? [140, 142, 146] : body === "Mars" ? [120, 62, 38] : [110, 88, 66], k = 0.7 + r2() * 0.5;
        ctx.fillStyle = `rgb(${rc.map(v => Math.min(255, v * k)).join(",")})`; ctx.beginPath(); ctx.ellipse(x, y, sz, sz * 0.62, 0, Math.PI, 0); ctx.lineTo(x + sz, y); ctx.ellipse(x, y, sz, sz * 0.22, 0, 0, Math.PI); ctx.fill();
      }
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = `${12 * (W / 900)}px "IBM Plex Sans",system-ui,sans-serif`; ctx.textAlign = "center";
      for (const [a, n] of [[0, "N"], [90, "E"], [180, "S"], [270, "W"]]) { const x = xOf(a); if (x > 0 && x < W) ctx.fillText(n, x, Ht * 0.06); }
      $("#capL").textContent = `Standing ${!isTwin && t.body === "Moon" ? "on the sunlit high ground of" : "in the middle of"} ${isTwin ? tw.name : shortName(t)} · drag to look around`;
      $("#capR").textContent = `Sun ${sunEl.toFixed(1)}° above the horizon · horizon from real elevation data, scene illustrated`;
    }

    function resize() {
      const r = viewer.getBoundingClientRect(); if (!r.width) return;
      renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
      ground.width = r.width * Math.min(2, devicePixelRatio); ground.height = r.height * Math.min(2, devicePixelRatio); if (view3.mode === "ground") drawGround();
    }
    addEventListener("resize", resize);
    let raf = 0, alive = true;
    (function loop() { if (!alive) return; raf = requestAnimationFrame(loop); if (view3.mode === "3d" && !document.hidden) { controls.update(); renderer.render(scn, camera); } })();

    /* controls */
    function segButtons(el, items, cur, on) {
      el.innerHTML = items.map(([k, l]) => `<button type="button" data-k="${k}" aria-pressed="${k === cur}">${l}</button>`).join("");
      el.onclick = e => { const b = e.target.closest("button"); if (b) on(b.dataset.k); };
    }
    function paintControls() {
      segButtons($("#dSeg"), [["dest", "Destination"], ["twin", "Oman analog"], ["both", "Side by side"]], view3.show, k => { view3.show = k; if (k === "both" && view3.mode === "ground") view3.mode = "3d"; paintControls(); render(); });
      segButtons($("#dMode"), [["3d", "3D from above"], ["ground", "Stand there"], ["x1", "Real heights"], ["x2", "Heights ×2"]], view3.mode,
        k => { if (k === "x1") view3.exag = 1; else if (k === "x2") view3.exag = 2; else { view3.mode = k; if (k === "ground" && view3.show === "both") view3.show = "dest"; } paintControls(); render(); });
      [...$("#dMode").children].forEach(b => { if (b.dataset.k === "x1") b.setAttribute("aria-pressed", view3.exag === 1); if (b.dataset.k === "x2") b.setAttribute("aria-pressed", view3.exag === 2); });
    }
    function render() {
      const g = view3.mode === "ground"; renderer.domElement.style.display = g ? "none" : "block"; ground.style.display = g ? "block" : "none";
      $("#dHint").textContent = g ? "Drag left / right to look around" : "Drag to turn · scroll to zoom";
      if (g) drawGround(); else build();
      const t = T();
      $("#vleg").innerHTML = view3.show === "both" ? `<span><i style="background:${t.body === "Mars" ? "var(--mars)" : "var(--moon)"}"></i>${t.body} (left)</span><span><i style="background:var(--ochre)"></i>Oman (right)</span><span>Same 24 × 13.5 km size and same height scale: compare directly.</span>` : "";
    }

    /* info + twin sections */
    function info(t) {
      const S = STORY[t.id], B = BODY[t.body];
      const facts = [...B.facts, ["Ground", `${slopeWords(t.slope_deg)} (${t.slope_deg.toFixed(1)}°)`], ["Landscape", `${reliefWords(t.relief_m)} (${Math.round(t.relief_m)} m height change per km)`]];
      $("#dInfo").innerHTML = `<span class="badge ${B.badge}">${t.body}</span><span class="badge b-coord">${Math.abs(t.lat).toFixed(2)}° ${t.lat < 0 ? "S" : "N"}, ${t.lon.toFixed(2)}° E${t.body === "Moon" ? " · approx." : ""}</span>
        <h2>${esc(t.name)}</h2><p>${esc(S.text)}</p>
        <div class="facts">${facts.map(([k, v]) => `<div class="fact"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>
        <div class="why"><h3>Why missions care about this place</h3><ul>${S.why.map(w => `<li>${esc(w)}</li>`).join("")}</ul></div>`;
    }
    const profileOf = H => { const r = Math.floor(H.h / 2), a = []; for (let x = 0; x < H.w; x++) a.push(H.z[r * H.w + x]); return a; };
    function drawProfiles(cv, A, B, colA, colB) {
      const w = cv.clientWidth * 2, h = cv.clientHeight * 2; cv.width = w; cv.height = h; const c = cv.getContext("2d");
      const a0 = A.map(v => v - Math.min(...A)), b0 = B.map(v => v - Math.min(...B)), top = Math.max(50, ...a0, ...b0);
      const pl = (arr, col) => { c.beginPath(); c.moveTo(0, h); arr.forEach((v, i) => c.lineTo(i / (arr.length - 1) * w, h - 6 - v / top * (h - 24))); c.lineTo(w, h); c.closePath(); c.fillStyle = col + "55"; c.fill(); c.strokeStyle = col; c.lineWidth = 3; c.stroke(); };
      pl(a0, colA); pl(b0, colB);
      c.fillStyle = "#9BA3AD"; c.font = "20px 'IBM Plex Sans',system-ui,sans-serif"; c.fillText(`${Math.round(top)} m`, 6, 22); c.fillText("24 km →", w - 92, h - 10);
    }
    function drawRamps(cv, a, b, colA, colB) {
      const w = cv.clientWidth * 2, h = cv.clientHeight * 2; cv.width = w; cv.height = h; const c = cv.getContext("2d");
      [[a, colA, 0], [b, colB, w / 2]].forEach(([d, col, x0]) => {
        const L = w / 2 - 40, rise = Math.min(h - 40, Math.tan(d * Math.PI / 180) * L);
        c.beginPath(); c.moveTo(x0 + 20, h - 14); c.lineTo(x0 + 20 + L, h - 14); c.lineTo(x0 + 20 + L, h - 14 - rise); c.closePath();
        c.fillStyle = col + "66"; c.fill(); c.strokeStyle = col; c.lineWidth = 3; c.stroke();
        c.fillStyle = "#E9E6DF"; c.font = "600 22px 'Space Grotesk',system-ui,sans-serif"; c.fillText(`${d.toFixed(1)}°`, x0 + 24, h - 24 - Math.min(rise, h - 70));
      });
    }
    function twinSection(t) {
      const tw = TWINS[t.twin.id], S = STORY[t.id], B = BODY[t.body], sc = tw.scores[S.profile];
      const [vc, vt] = verdict(t.twin.sim), bodyCol = t.body === "Mars" ? "#e07a4f" : "#a9b8cc";
      const sl = cls(t.slope_deg, t.twin.slope, slopeWords), rl = cls(t.relief_m, t.twin.relief, reliefWords);
      const dry = sc.s.ndvi, mine = sc.s.minerals, dT = sc.raw.dT_diurnal;
      const cards = [
        `<div class="rc"><h3>How steep is the ground? ${pill(sl)}</h3><canvas id="cvRamp"></canvas>
          <p><b>${esc(t.body)}:</b> ${slopeWords(t.slope_deg)}. <b>Oman:</b> ${slopeWords(t.twin.slope)}. Crews feel slope in every step and every wheel turn.</p></div>`,
        `<div class="rc"><h3>The shape of the land ${pill(rl)}</h3><canvas id="cvProf"></canvas>
          <p>A real slice straight across both 24 km tiles, drawn at the same height scale. ${esc(t.body)}: ${reliefWords(t.relief_m)}; Oman: ${reliefWords(t.twin.relief)}.</p></div>`,
        `<div class="rc"><h3>Bare, dry ground ${pill(dry >= 0.8 ? 2 : dry >= 0.5 ? 1 : 0)}</h3>
          <p>${dry >= 0.8 ? "Almost no plants: satellites see bare rock and sand, like any Moon or Mars surface." : dry >= 0.5 ? "Mostly bare, with some seasonal plants." : "Too green: plants would spoil the illusion and the data."}</p></div>`,
        t.body === "Mars" ? `<div class="rc"><h3>The same kind of rock? ${pill(mine >= 0.6 ? 2 : mine >= 0.2 ? 1 : 0)}</h3>
          <p>${!tw.emit ? "No EMIT mineral image covers this spot yet, so we can't say." : mine >= 0.6 ? "NASA's EMIT mineral scanner on the space station sees water-formed minerals here (serpentine / clay / carbonate): the same chemistry rovers search on Mars." : mine >= 0.2 ? "EMIT sees some water-formed minerals: partly the right chemistry." : "EMIT sees none of the target minerals: good for terrain and driving practice, not for rock chemistry."}</p></div>`
          : `<div class="rc"><h3>Light and shadow ${pill(0)}</h3><p>At the lunar pole the Sun creeps along the horizon (here ${SUN.Moon(t.lat).toFixed(1)}° up), so shadows are kilometres long. Oman's Sun climbs high: night drills and low-sun times of day are the closest Earth gets.</p></div>`,
        `<div class="rc"><h3>Temperature ${pill(0)}</h3><p>${t.body === "Mars" ? `This Oman site swings about ${dT ? dT.toFixed(0) : "10–15"} °C between day and night; Jezero swings 50–60 °C around an average of −55 °C. Oman trains the heat and dust, not the cold.` : `Sunlit polar rims sit near −50 °C and shadows drop below −170 °C, with no air to carry heat. Oman can't copy this: suits and kit must be tested in chambers.`}</p></div>`,
        `<div class="rc"><h3>Getting there ${pill(sc.s.access >= 0.8 ? 2 : 1)}</h3><p>${tw.km_bidiyah ? `${Math.round(tw.km_bidiyah)} km from Al Bidiyah (our hackathon base)` : ""}${sc.raw.access != null ? ` · ${sc.raw.access.toFixed(1)} km from the nearest road` : ""}. A rehearsal site must be reachable with vehicles, water and support.</p></div>`,
      ];
      const others = t.alts.filter(a => TWINS[a.id] && TWINS[a.id].hm).map(a => `<button type="button" data-alt="${a.id}">${esc(TWINS[a.id].name)}</button>`).join(" · ");
      $("#dTwin").innerHTML = `<div class="twinhead"><div><div class="eyebrow">Its analog in Oman</div><h2>${esc(tw.name)}</h2>
          <div class="alts">${esc(tw.place)} · ${tw.lat.toFixed(3)}° N, ${tw.lon.toFixed(3)}° E · overall analog score for this mission: <b>${Math.round(sc.asi * 100)}/100</b> (rank ${sc.rank} of 55) · <a href="#site-${tw.id}">open its passport</a>${others ? ` · other close matches: ${others}` : ""}</div></div>
          <div class="verdict ${vc}">${vt} · terrain ${Math.round(t.twin.sim * 100)}% alike</div></div>
        <div class="cards">${cards.join("")}</div>
        <div class="two"><div class="box"><h3>✅ What a crew could rehearse here</h3><ul>${B.rehearse[S.kind].map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
          <div class="box"><h3>⛔ What Earth can't give them</h3><ul>${B.cant.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div>`;
      const HT = HMof(t.id, t.hm), HO = tw.hm ? HMof("o_" + tw.id, tw.hm) : null;
      drawRamps($("#cvRamp"), t.slope_deg, t.twin.slope, bodyCol, "#d9a35f");
      if (HO) drawProfiles($("#cvProf"), profileOf(HT), profileOf(HO), bodyCol, "#d9a35f");
      $("#dTwin").querySelectorAll("[data-alt]").forEach(b => b.addEventListener("click", () => {
        const i = t.alts.findIndex(x => x.id === b.dataset.alt), a = t.alts[i];
        t.alts[i] = { ...t.twin }; t.twin = { ...a }; select(t.id, true);
      }));
    }
    function select(id, keep) {
      view3.target = id; if (!keep) { view3.show = "dest"; view3.mode = "3d"; view3.exag = T().body === "Moon" ? 1 : 2; }
      pick.querySelectorAll(".dcardb").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.id === id)));
      const t = T(); info(t); twinSection(t); paintControls(); resize(); render();
    }
    const valid = id => D.targets.some(t => t.id === id);
    select(valid(route.id) ? route.id : "mars_jezero_floor");
    setKeys([["Drag", "Turn"], ["Scroll", "Zoom"]]);

    return {
      update(r) { if (r.id && valid(r.id) && r.id !== view3.target) { select(r.id); root.querySelector(".dstage").scrollIntoView({ behavior: "smooth", block: "start" }); } },
      cleanup() {
        alive = false; cancelAnimationFrame(raf); removeEventListener("resize", resize);
        meshes.forEach(m => { m.geometry.dispose(); m.material.dispose(); }); stars.geometry.dispose(); stars.material.dispose();
        controls.dispose(); renderer.dispose(); renderer.forceContextLoss?.();
      },
    };
  },
};
