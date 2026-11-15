# Field survey: site S05 near Ibra (15 Nov 2026)

On the second day of NASA Space Apps 2026 we flew a mapping drone over **S05**, one of the top-ranked
sites for the Mars-science profile (rank 4 of 55, score 90/100), to check the satellite prediction on the ground.
S05 is a civilian survey site. Its location is already shown on [ubar.space](https://ubar.space) ("View site in 3D" on the S05 passport).

## The flight

| | |
|---|---|
| Date and time | 15 Nov 2026, 09:26–09:53 Oman time (05:26–05:53 UTC) |
| Drone | DJI Matrice 4 series, M4T camera (wide lens) |
| Plan | Area route of 860.8 × 544.6 m (0.47 km²), ortho + "smart oblique" collection, gimbal up to 45° |
| Ground resolution (planned) | 4.27 cm/pixel ortho, 6.04 cm/pixel oblique |
| Photos | **1,634 photos of the area** taken by the drone (the photo log records 1,642 camera triggers; the plan estimated 1,423) |
| Positions | All 1,642 photos lie within 15–661 m of the S05 centre (22.5983° N, 58.3542° E), ellipsoid height 552–555 m |

## Files

| File | Size | In this repo? | What it is |
|---|---|---|---|
| `DJI_20261115092659_0002_D.MRK` | 214 KB | Yes ([here](DJI_20261115092659_0002_D.MRK)) | Photo log: time, position and accuracy of every camera trigger. Shows the real flight pattern over S05. |
| `DJI_20261115092659_0002_D.NAV` | 51 KB | No | RINEX 3.05 satellite navigation data (orbits) recorded during the flight. |
| `DJI_20261115092659_0002_D.RTK` | 8.6 MB | No | The drone's raw positioning log. |
| `DJI_20261115092659_0002_D.OBS` | 93 MB | No | RINEX 3.05 raw satellite observations, 05:26–05:53 GPS time. |

The `.NAV`, `.RTK` and `.OBS` files are raw satellite measurements that are only useful once processed. The `.OBS` file
is close to GitHub's file-size limit, so the team keeps these files and will share them on request.

## Accuracy and next steps

Every photo in the `.MRK` log has quality flag `16`: a standard satellite fix, no live RTK fix, so positions are good to roughly a metre.
To reach centimetre accuracy, the photo positions are corrected afterwards (PPK) with the raw `.OBS`/`.RTK` logs and a base-station record.
The photos are then processed in DJI Terra into an orthophoto and a bare-earth terrain model. These replace the satellite terrain
for S05 in the 3D site view and in VR, using the data contract in the main README (`pipeline/make_vr_terrain.py`).

Until then, the website shows the surveyed area as the blue "Drone survey · 15 Nov" box in the S05 3D view.
