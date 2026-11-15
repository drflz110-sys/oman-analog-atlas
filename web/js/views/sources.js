// SOURCES: every dataset used, as NASA requires. The first 11 rows are the challenge's listed resources.
import { h, esc, setKeys } from "../core/ui.js";

const ROWS = [
  ["NASA Earthdata Search", "NASA", "https://search.earthdata.nasa.gov/", "EMIT L2B MIN minerals (68 granules over Oman, 3 over Utah); MODIS MOD11A2 LST and MOD13Q1 NDVI (2025)", "Minerals · Day–night ΔT · Annual ΔT · Dryness", true],
  ["NASA Worldview", "NASA", "https://worldview.earthdata.nasa.gov/", "Visual checks of MODIS layers over the AOIs", "Quality check", true],
  ["NASA Planetary Data System", "NASA", "https://pds.nasa.gov/", "MGS MOLA MEGDR 128 ppd: Mars terrain targets (slope, roughness, relief) and terrain comparison clips", "Mars targets · Compare terrain", true],
  ["NASA Lunar Reconnaissance Orbiter", "NASA", "https://pds-geosciences.wustl.edu/missions/lro/", "LOLA LDEM 80 m south pole: Moon terrain targets and terrain comparison clips", "Moon targets · Compare terrain", true],
  ["NASA LRO Diviner Lunar Data", "NASA", "https://pds-geosciences.wustl.edu/missions/lro/diviner.htm", "Reviewed: the lunar temperature swing exceeds any Earth site, so the ΔT criteria reward the largest Earth swings", "Reviewed", true],
  ["RADARSAT Constellation Mission", "CSA", "https://donnees-data.asc-csa.gc.ca/en/dataset/rcm", "Reviewed; radar roughness was not computed, so it is not a criterion", "Reviewed", true],
  ["RADARSAT-1", "CSA", "https://donnees-data.asc-csa.gc.ca/en/dataset/radarsat1", "Reviewed; radar roughness was not computed, so it is not a criterion", "Reviewed", true],
  ["SAR Python Tutorial", "CSA", "https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial", "Reviewed; not used (no radar criterion)", "Reviewed", true],
  ["Copernicus Data Space Ecosystem", "ESA", "https://dataspace.copernicus.eu/", "Copernicus DEM GLO-90 (slope, roughness, relief at 90 m); Sentinel-2 basemap", "Slope · Roughness · Relief", true],
  ["ESA Open Science Catalog", "ESA", "https://opensciencedata.esa.int/", "Searched for desert and mineral products", "Reviewed", true],
  ["JAXA G-Portal", "JAXA", "https://gportal.jaxa.jp/gpr/", "Reviewed for ALOS DEM cross-check", "Reviewed", true],
  ["NASA Moon Trek / Mars Trek", "NASA", "https://trek.nasa.gov/", "Mars Viking MDIM 2.1 colour mosaic (8K globe and the 182 px/degree Jezero close-up), MGS MOLA elevation (globe relief), LRO WAC global mosaic (Moon south-pole close-up)", "Visuals · targets", false],
  ["NASA GIBS (Global Imagery Browse Services)", "NASA", "https://earthdata.nasa.gov/gibs", "Blue Marble Next Generation shaded relief (500 m) and OSM land/water map for the sharp Arabia patch on the globe", "Visuals", false],
  ["NASA Scientific Visualization Studio", "NASA", "https://svs.gsfc.nasa.gov/", "Blue Marble Earth image (8K); CGI Moon Kit LRO colour map (8K) and LOLA elevation (globe textures)", "Visuals", false],
  ["NASA Black Marble 2016", "NASA", "https://earthobservatory.nasa.gov/features/NightLights", "City lights on the globe's night side (3 km product)", "Visuals", false],
  ["AppEEARS (LP DAAC)", "NASA", "https://appeears.earthdatacloud.nasa.gov/", "MODIS NDVI and LST subsets for Oman", "Dryness · Thermal", false],
  ["Sentinel-2 cloudless by EOX", "EOX / ESA data", "https://s2maps.eu/", "Basemap of Oman", "Basemap", false],
  ["Esri World Imagery", "Esri, Maxar, Earthstar Geographics", "https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9", "Imagery in the 3D site view (\"View site in 3D\" on each passport)", "3D site view", false],
  ["AWS Terrain Tiles (Mapzen)", "Amazon Web Services · Mapzen", "https://registry.opendata.aws/terrain-tiles/", "Elevation under the 3D site view", "3D site view", false],
  ["OpenStreetMap (Overpass, 2026)", "OSM contributors", "https://www.openstreetmap.org/copyright", "Roads for the access criterion; towns, villages, farms and oil & gas sites for the keep-away filters", "Access · filters", false],
  ["NASA POWER", "NASA LaRC", "https://power.larc.nasa.gov/", "WS10M mean 10 m wind climatology", "Wind", false],
  ["SAGA GIS channel network", "SAGA (open source)", "https://saga-gis.sourceforge.io/", "Paleo-channel network from the DEM (order ≥ 3, incised ≥ 25 m)", "Ancient channels", false],
  ["AMADEE-18 analog mission (Groemer et al. 2020, Astrobiology)", "Austrian Space Forum", "https://doi.org/10.1089/ast.2019.2142", "Kepler base station as an independent Mars landing / sedimentary test site", "Validation", false],
  ["Mars Desert Research Station (MDRS), Utah", "The Mars Society · scored by the team", "https://mdrs.marssociety.org/", "Outside benchmark scored with the identical Oman method and no tuning (Copernicus DEM, MODIS, NASA POWER, EMIT over Utah)", "Validation", false],
  ["Perseverance MEDA weather station (Rodriguez-Manfredi et al. 2023, Nature Geoscience)", "NASA / JPL · CAB", "https://doi.org/10.1038/s41561-023-01084-1", "Jezero air about −55 °C average with a 50–60 °C day–night swing; landing site 18.44° N 77.45° E (18 Feb 2021)", "Mars facts", false],
  ["Artemis III candidate landing regions (NASA, October 2024)", "NASA", "https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/", "Peak near Cabeus B, Haworth, Malapert Massif, Mons Mouton Plateau, Mons Mouton, Nobile Rim 1 and 2, de Gerlache Rim 2, Slater Plain (positions shown are approximate feature centres)", "Moon facts", false],
  ["LRO LOLA LDEM 80 m south pole · Shackleton facts", "NASA GSFC", "https://pgda.gsfc.nasa.gov/", "Shackleton: 21 km wide, 4.2 km deep, near-constant sunlight on rim peaks; shadowed floors below about 100 K", "Moon facts · Destinations", false],
  ["Copernicus DEM GLO-30", "ESA / Copernicus", "https://registry.opendata.aws/copernicus-dem/", "30 m elevation for the VR Oman terrain (Wadi Tayin, Samail ophiolite)", "VR terrain", false],
  ["LOLA 5 m/pixel south-pole DEMs (PGDA)", "NASA GSFC", "https://pgda.gsfc.nasa.gov/products/78", "Site01: Shackleton - de Gerlache connecting ridge, the VR Moon terrain", "VR terrain", false],
  ["HiRISE DTM DTEEC_045994_1985_046060_1985", "NASA/JPL/UArizona · USGS", "https://stac.astrogeology.usgs.gov/browser-dev/", "1 m terrain + orthoimage of Jezero crater floor, the VR Mars terrain", "VR terrain", false],
  ["Oman Drilling Project (ICDP)", "ICDP / IODP", "https://publications.iodp.org/other/Oman/OmanDP.html", "Benchmark outcrops (BT1B, BA1, IGSN surface sample) for validation; hole CM1 centres the VR Oman terrain", "Validation · VR terrain", false],
  ["Team drone LiDAR survey", "UBAR team", "#vr", "Bare-earth terrain of the civilian survey site; replaces the satellite terrain in VR once processed", "VR terrain", false],
  ["Piper text-to-speech · voice en_GB-cori-high", "Open source (MIT) · public-domain voice (LibriVox)", "https://github.com/rhasspy/piper", "The VR narrator: every line pre-recorded with a neural voice", "VR narration", false],
  ["Piper voice en_US-ryan-high (RyanSpeech dataset)", "CC BY-NC-SA 4.0", "https://huggingface.co/rhasspy/piper-voices", "Male AI-generated voiceover of the 30-second demo video", "Demo video", false],
    ["three.js", "Open source (MIT licence)", "https://threejs.org/", "3D engine and bloom effect; globe cloud texture from its example files", "Visuals", false],
  ["Rajendran & Nasir (2015), Tectonophysics 657", "Sultan Qaboos University", "https://doi.org/10.1016/j.tecto.2015.06.023", "Background geology and alteration mapping of the Samail ophiolite", "Context", false],
];

export default {
  mount({ view, scene }) {
    scene.setActive(true); scene.setMode("director");
    const root = h("div", { class: "page live" });
    root.innerHTML = `<div class="page-inner">
      <div class="page-head"><p class="eyebrow">Sources</p><h1>Data and references</h1>
        <p>Rows marked "Challenge" are the resources listed on the NASA Space Apps challenge page. The others are cited separately.</p></div>
      <div class="panel ticks"><div class="src-wrap"><table class="src-table">
        <thead><tr><th>Resource</th><th>Agency</th><th>What we use</th><th>Feeds</th><th>List</th></tr></thead>
        <tbody>${ROWS.map(([n, a, u, what, feeds, ch]) => `<tr><td class="nm"><a href="${esc(u)}"${u.startsWith("#") ? "" : ' target="_blank" rel="noopener"'}>${esc(n)}</a></td><td data-l="Agency">${esc(a)}</td><td data-l="What we use">${esc(what)}</td><td class="use" data-l="Feeds">${esc(feeds)}</td><td class="use" data-l="List">${ch ? "Challenge" : "Additional"}</td></tr>`).join("")}</tbody>
      </table></div></div>
    </div>`;
    view.appendChild(root);
    setKeys([["M", "Mission"]]);
    return {};
  },
};
