# Milestone 2: reusable 3D Viewer

## What we are building

Render the existing ProductInput parts JSON in a browser. This milestone uses a
local table template fixture: it does not save or fetch products yet. The artisan
builder and buyer page will later reuse the SAME Viewer component.

No schema changes or new dependencies were needed. JSON measurements remain in
centimeters. The Viewer converts size and position to meters by dividing by 100.

## Exact files

- `src/components/viewer/Viewer.tsx`: complete reusable Viewer, geometries,
  selected slot colors, lights, shadows, camera, OrbitControls, camera Bounds,
  and WebGL/renderer error fallback.
- `src/components/viewer/Viewer.css`: viewport height, touch handling and hint.
- `src/data/tablePreview.ts`: ProductInput fixture plus initial FinishSelection.
- `src/App.tsx`: complete replacement integrating the fixture with the Viewer.
- `src/App.css`: complete replacement styling desktop and phone layouts.

These files are already created or replaced. Read the complete files rather
than copying small snippets into unknown locations.

## Run

```powershell
Set-Location 'C:\Users\ozebo\Desktop\Backup_Showroom 3D'
npm.cmd run dev
```

Open http://localhost:5173. If a dev server is already running, refresh it; do not
start a second copy on the same port. On a phone, use the Wi-Fi Network URL shown
by Vite from a device on the same network, rather than the VPN address.

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

## How the JSON becomes furniture

PartMesh creates one mesh for each part: mesh = geometry + material + position.

- Box [180, 4, 90] -> boxGeometry [1.8, 0.04, 0.9].
- Cylinder [4, 71] -> cylinderGeometry [0.04, 0.04, 0.71, 24].
  First two arguments are top/bottom radii; 24 is radial segments.
- Sphere [5] -> sphereGeometry [0.05, 24, 16].
- Position [80, 35.5, -35] -> mesh position [0.8, 0.355, -0.35].
- The finish selected for part.slot supplies meshStandardMaterial's color.

The table is 180 cm wide, 90 cm deep and 75 cm tall. Its top is 4 cm thick,
centered at y=73. Its legs are 71 cm tall, centered at y=35.5. Their top meets
the underside of the tabletop at y=71; their bottom rests at y=0.

The floor is excluded from Bounds so it does not distort furniture camera fit.
Bounds fits furniture and handles viewport resizing. OrbitControls handles
rotation and zoom, with panning disabled and the camera kept above the floor.
Demand rendering avoids continuous drawing while idle; pixel ratio is capped
at 1.5 for phone performance. Lighting needs no downloaded environment assets.

## Test/checklist

- [ ] One tabletop and four legs are visible, touching the floor.
- [ ] Dimensions read 180cm x 90cm x 75cm.
- [ ] Mouse drag changes the viewing angle; wheel zoom changes distance.
- [ ] On a real phone, one-finger drag rotates and two-finger pinch zooms.
- [ ] On a phone, viewer is above product information with no overflow.
- [ ] Resizing the window keeps the entire table visible.
- [ ] No browser-console errors occur during initial render or rotation.
- [ ] Typecheck, lint and build pass.

For geometry checks, temporarily append a sphere part with size [5] and position
[0, 82, 0] to tablePreview.parts; it should sit above the top. Restore the fixture
afterward. For material checks, change walnut color to #F0F0F0: only the tabletop
should change. Change charcoal color to #7B4A2E: all four legs should change.
Restore both colors afterward.

ViewerProps accepts selection, but buyer finish-selector UI and live pricing
belong to Milestone 4. Textures and GLB loading remain later work. The fixture's
WhatsApp number is intentionally empty; it is not a saved product.

## Next checkpoint

After visual checks pass, Milestone 3 adds the Supabase table/bucket and Vercel
API: valid product -> POST -> database -> GET. We will verify credentials with
actual requests and reject invalid data. Environment values alone do not prove
that saving works.

## Official references

- [React Three Fiber Canvas](https://r3f.docs.pmnd.rs/api/canvas)
- [drei Bounds](https://drei.docs.pmnd.rs/staging/bounds)
- [drei controls](https://drei.docs.pmnd.rs/controls/introduction)
