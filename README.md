# Oman Analog Atlas

NASA Space Apps Challenge 2026 · *Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars*
Team: Luqman Alsaqri (lead, drone LiDAR) · Adil Alkalbani (GIS, AHP) · Mazin Albahri (code, web, VR, security)

**Live site: https://ubar.space** · **30-second demo video:** https://drflz110-sys.github.io/oman-analog-atlas/media/ubar-demo-30s.mp4 (also at https://ubar.space/media/ubar-demo-30s.mp4; narrated by Mazin) · **Slides:** https://ubar.space/present/

Oman's terrain scored against Moon and Mars targets with an **Analog Similarity Index (ASI = Σ wᵢ·sᵢ)**,
presented as a space-navigation interface: **Orbit → Director → Oman destination map → Analog Passport → Twin Lens**.

## Run it locally

No build step and no Node.js needed. From this folder:

```
cd web
python -m http.server 8000
```

Then open <http://localhost:8000>. On Windows you can double-click `serve.bat` instead.
The app needs an internet connection for the fonts and the Sentinel-2 basemap tiles; everything else is local.

## Structure

```
web/
  index.html            page shell + HUD
  css/theme.css         colour + type tokens (criterion colours are colour-blind checked)
  css/hud.css           HUD chrome: top/bottom bars, glass panels, destination cards, reticle
  css/views.css         per-view styles
  js/main.js            data load, hash router, mission switch
  js/core/              data loader (contract files), store, graphics quality (fx.js), UI helpers, noise
  js/space/scene.js     three.js scene: Earth day/night shader, Moon/Mars relief + target markers,
                        nebula sky, orbit arcs, gold transfer route, camera shots incl. the dive to Oman, bloom
  js/space/stack3d.js   three.js ASI Stack on the Method page (six layers press into the ASI)
  js/views/             orbit, director, atlas (Oman map + live tuning), passport, twin, method, sources, vr
  js/core/live.js       live ASI on the 1 km grids (team GIS hand-off); js/core/grid.js loads the grids once
  js/vr/                VR landing + camp: terrain (tile loader, slope/roughness queries, baked detail),
                        skins (Oman/Moon/Mars sky + light), lander (descent, plume, dust, touchdown check),
                        camp (modules + rule checks), controls (Quest controllers, screen fallback)
  data/vr/rules.json    landing + camp thresholds and the module catalogue (engine-neutral)
  data/vr/<ID>/         VR terrain tile per site (height.png + terrain.json); data/vr/mock/ is the placeholder
  data/mock/            MOCK contract files (placeholders)
  data/                 put the REAL files here; they override the mock ones automatically
  assets/textures/      globe textures: Earth day (SVS Blue Marble), night lights (NASA Black Marble 2016),
                        clouds (three.js examples), ocean mask (derived from the day map);
                        Moon colour + LOLA relief (SVS CGI Moon Kit); Mars colour (Trek Viking MDIM2.1) + relief (Trek MOLA)
  vendor/               three.js r160 (+ post-processing add-ons for bloom), MapLibre GL 4.7.1 (stored locally)
pipeline/
  make_mock_data.py     writes the mock files; documents the exact data contract
  make_vr_worlds.py     builds the three real VR terrains (Oman: Copernicus DEM + Sentinel-2; Moon: LOLA 5 m Site01; Mars: HiRISE DTM)
  make_vr_terrain.py    makes a VR terrain tile from the LiDAR DTM (.tif) or point cloud (.las/.laz), or the placeholder (--mock)
```

## Routes

| Hash | View |
|---|---|
| `#orbit` | Opening shot, Earth with Oman turned to camera |
| `#director` | Earth, Moon, Mars on orbit arcs; hover cards; target dossiers |
| `#director-moon`, `#director-mars` | Director opened straight on the Moon or Mars target dossier (handy when presenting) |
| `#oman` | Destination map: live ASI on the 1 km grid, criterion layers, Tune (weights, keep-away, filters), validation meter, official ranks and live picks, click-to-explain |
| `#site-<ID>` | Oman map with that site's Analog Passport open |
| `#twin-<ID>` | Twin Lens: real Oman vs Moon/Mars terrain clips at one scale, terrain-twin statistics |
| `#vr`, `#vr-<ID>` | VR: pick a pad, watch the lander touch down, check it, build the camp (Quest: **Enter VR**) |
| `#method` | ASI Stack on the real 1 km grids, similarity rules, AHP matrix, validation |
| `#sources` | Every dataset cited |

Keys: `M` cycles the mission, `Enter` travels, `Esc` goes back, `G` switches graphics between High and Light.

**Graphics.** High = bloom glow and full resolution; Light = no post-processing, 1× pixels. The app guesses from the device,
drops to Light once by itself if frames are slow, and remembers the viewer's own choice. For a demo machine you can force it
with `?fx=high` or `?fx=low` in the URL, e.g. `http://localhost:8000/?fx=high#orbit`.

## VR (landing + camp)

Open `#vr` (or **Land here in VR** on a site passport). On a **Meta Quest**, open https://ubar.space/#vr in the Quest Browser and press **Enter VR**:
a console floats in front of you; point and pull the trigger to press its buttons, squeeze the grip to bring it back in front of you, right stick = snap turn.
On a screen: drag to look, click/tap to act, WASD to walk.

**Three real places** (World buttons), each a real elevation model with a 320 m landing area of fine detail:

| World | Place | Data |
|---|---|---|
| Oman | Wadi Tayin, Samail ophiolite (Oman Drilling Project hole CM1, crust-mantle transition) | Copernicus DEM GLO-30 + Sentinel-2 cloudless 2020; roughness below 30 m is synthetic until the LiDAR |
| Moon | Shackleton - de Gerlache connecting ridge | LOLA 5 m/pixel DEM, PGDA Site01; colour synthetic; sun 5° up |
| Mars | Jezero crater floor near the Perseverance landing site | HiRISE DTM DTEEC_045994_1985_046060_1985 (1 m) + RED orthoimage |

Rebuild them with `pip install rasterio` and `python pipeline/make_vr_worlds.py` (put the LOLA Site01 GeoTIFF in `raw/` first).

1. **Choose a pad**: the three best 6 m pads (lowest slope + roughness) are suggested; point anywhere to test another.
2. **Watch the landing**: powered descent under the world's gravity; high-mounted thrusters take over in the last metres. At touchdown the
   terrain under the four footpads gives lander tilt, ground slope and roughness → SAFE / MARGINAL / HAZARD; the solar wings unfold.
3. **Build the base**: habitat, solar array, comms mast, drill rig (ice drill on the Moon), rover and path markers. Every module is checked
   against rules measured on the terrain: slope, unevenness, distance from the landing pad (larger on the airless Moon), sunlight
   (a line-of-sight test toward the Sun), line of sight to Earth (Moon), permanent shadow for the ice drill (Moon), and distance to the
   habitat. A refused placement shows **why** (value, limit and the reason) and recommends the nearest spot that passes.
   **Build the recommended base** plans the best site for each module and builds it step by step (grading robot, inflating habitat,
   rising masts, unfolding panels, the rover driving out, astronauts at work) with narration, then shows a base report that links each
   placement to the project's criteria.

Switching worlds flies the spectator through space to the next landing site (screen); in the headset the view fades instead.
In the headset the console sits at waist height below your line of sight: squeeze the grip to show or hide it.
Thresholds live in `web/data/vr/rules.json` and are **team design
rules**, not NASA requirements. The tile and rules are plain PNG + JSON so a later Unity version can read them unchanged.

**Plugging in the LiDAR** (when Luqman's survey is processed):

```
pip install rasterio "laspy[lazrs]"
python pipeline/make_vr_terrain.py --dtm dtm_10cm.tif --name S19      # or: --laz cloud.laz --name S19
```

`--name` is the site ID, so `#vr-S19` picks it up; other sites keep the placeholder. The script writes heights relative to the
tile centre only (no CRS, coordinates or EXIF). Check the output before committing.

## Data contract (team GIS hand-off, in `web/data/`)

The real files are in place, so the "Mock data" flag is off. `web/data/mock/` (old six-criterion mock) is only a fallback.

| File | Contents |
|---|---|
| `sites.geojson` | 55 sites × 4 profiles = 220 points (`"mock": false`). Properties: `id, name, aoi, profile, asi, rank, benchmark (calibrate\|test\|null), tier, group[] (benchmark, drone_range, national_top), lat, lon, km_from_hackathon, emit_covered, s_<crit>, raw_<crit>, matches[], gaps[], best_use, validation_percentile` |
| `weights.json` | `weights[profile][crit]` = AHP tier-2 weights (sum 1), plus `weights_tier1`, `groups`, `cr`, `method` |
| `targets.csv` | `criterion, profile, body, site, value, tolerance, unit, source, rule` — `rule` is gaussian (slope, TRI, relief), one-sided (the others) or the EMIT class score |
| `target_sites.json` | Moon / Mars terrain targets with their best Oman terrain twins (slope, TRI, relief, similarity) |
| `grid/grid.json` + `pack_00…12.png` | 1 km Web-Mercator grids, 3 layers per RGB PNG: similarity `v/254`, distance `v/10` km, `255` = no data |
| `twin/index.json` + `*.png` | 24 × 13.5 km height clips (Oman 90 m, LOLA 80 m, MOLA 463 m), RGB-packed 16-bit (`R·256 + G`) for the browser |

Profiles: `moon_base, mars_landing, mars_science, mars_sedimentary`. Criteria (fixed order):
`slope, tri, relief, dT_diurnal, dT_annual, wind, ndvi, channels, minerals, access`. Radar was not computed and is not used.
The `s_*` values in `sites.geojson` are official (90 m analysis); the app never recomputes them. `data.sim()` only draws the rule curve.

**Live criteria** (`js/core/live.js`, from the GIS hand-off): the Oman map recomputes the ASI on the 1 km grid in the browser
when you change weights, keep-away distances (towns, villages, hamlets, major roads, farms, oil & gas), the protected-areas and
EMIT-only filters, or the top-% shown. The validation meter and "Your picks" update with it; click any place for its breakdown.
The 1 km grid is for interaction; ranked sites and percentiles come from the 90 m analysis.

## Rules

Only open data and our civilian survey site go into this repository. No keys or tokens in the repo. Strip EXIF/GPS from photos before adding them.
