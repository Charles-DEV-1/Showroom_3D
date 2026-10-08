# Milestone 7: finish textures and viewer polish

Next checkpoint: [Milestone 8](MILESTONE_8.md), demo preparation and code freeze.

## What is ready

The builder now offers seven presets. The three additions are:

| Template | Width x depth x height (cm) | Primary slot | Secondary slot |
| --- | --- | --- | --- |
| Sofa | 210 x 90 x 85 | Two seat cushions, back and arms | Base and legs |
| Coffee table | 100 x 60 x 45 | Top and lower shelf | Legs |
| Office desk | 140 x 65 x 75 | Desktop and drawer fronts | Sides, pedestal, modesty panel and handles |

They use editable sample prices. Set actual artisan prices before real ordering.
The desk's drawers are static shapes. All models are stylized approximations.
Changing dimensions rebuilds the selected template; make overall sizing changes
before manually editing individual parts. Save before switching templates.

Each finish can now have a color or an uploaded texture image. Texture uploads
use JPEG/PNG/WebP, up to 2097152 bytes (2 MiB). Large images are reduced in the
browser to at most 1024 pixels on the longest side before upload; the server and
bucket still enforce the file limit. Uploading disables the form and save button
until it completes. Removing a texture restores that finish's color.

Textures are color images mapped using each shape's built-in UV coordinates.
Boxes show the image across each face; cylinders and spheres use their built-in
surface mapping. Image proportions may stretch on long parts. There is no texture
scale, UV editor or advanced PBR system in this MVP.

## Shared behavior

No schema change: Finish.textureUrl already existed. The same signed image-upload
endpoint stores textures in product-images. POST /api/products checks each texture
URL and verifies that the uploaded object exists with allowed size/type before
saving finishes JSONB. No SQL migration, credentials change or dependency install.

Viewer resolves one finish per used slot. Every part in that slot receives the
same selected image. Drei caches the loaded texture by URL. Color images are
marked sRGB; the textured material is white so the fallback color does not tint
them. Suspense shows the finish color while loading, and a local error boundary
keeps that color visible on image failure. The viewer shows a loading/failure
notice. Reload the page to retry a failed image.

The finish ID stays in ?finish=ID (primary) and &secondary=ID. A texture does not
add a second charge: final price remains base + one selected modifier per slot.
Saved products hold their own texture URLs and do not depend on the template.

Viewer polish adds a gentle fill light and reduces the main light intensity.
Finish switches preserve the current camera view; resizing still refits it.

## Files

| Complete file | Purpose |
| --- | --- |
| src/data/templates.ts | Seven dimension-driven presets |
| src/components/builder/FinishEditor.tsx | Upload, preview and remove finish images |
| src/pages/BuilderPage.tsx | Upload state and functional draft updates |
| src/lib/finishTexture.ts | Decode, validate and downsize finish images |
| src/lib/api.ts | Reuse signed uploads for prepared textures |
| src/components/viewer/FinishMaterial.tsx | Solid/textured materials with loading and error fallback |
| src/components/viewer/Viewer.tsx | Shared slot materials, status and balanced lighting |
| src/components/FinishSelector.tsx | Texture thumbnail swatches |
| src/App.css and src/components/viewer/Viewer.css | Texture preview/status styling |
| public/demo/marble-texture.jpg | Optional material image for manual testing |
| public/demo/TEXTURE_CREDIT.md | Asset source and CC0 license |
| tests/templates.test.ts and tests/backend.test.ts | Geometry and texture/price/URL validation |

Complete files are already written in this checkout. The demo color map comes
from [ambientCG Marble 012](https://ambientcg.com/a/Marble012), provided under
[CC0](https://docs.ambientcg.com/license/). It is a generic marble illustration;
it does not verify any supplier's actual Carrara material.

## Run locally

If your existing Vite server is running, simply refresh the page. Otherwise:

```powershell
Set-Location 'C:\Users\ozebo\Desktop\Backup_Showroom 3D'
npm.cmd run dev
```

Open http://localhost:5173/builder. Use Vite's Network URL on a phone on the same
Wi-Fi. Use src/ for edits; dist/ is generated build output.
The existing user-owned server was used; no new app server was left running.

## Acceptance checklist

1. Refresh the builder. Pick Sofa, Coffee table and Office desk in turn.
   Rotate each preview and resize its width; it must remain the chosen furniture.
2. Pick Dining table and enter your WhatsApp number with country code.
3. Expand Carrara Marble under Finishes. Upload public/demo/marble-texture.jpg
   with its Texture image input. Wait until the upload finishes.
4. Select Carrara Marble below the live preview. Every primary part should show
   marble; the secondary legs keep their selected finish. Price is 175000 NGN
   with the default table price and charcoal legs.
5. Select Walnut and then marble again. The camera view should remain unchanged.
6. Optional: remove the marble texture in the editor and confirm its solid color
   returns. Upload again before saving if you want a textured saved product.
7. Upload the reference photo if desired, then Save product and Open product.
8. Select marble, copy the address and reload. The texture, selected finish,
   dimensions and price must remain the same.
9. Tap Order via WhatsApp on your real phone. Check the pre-filled message and
   open its configuration link. Sending the message is optional.
10. Repeat at phone width: rotation/pinch, readable inputs, no horizontal scroll,
    all controls and price reachable below the viewer.

## Saved texture demo

http://localhost:5173/product/d7dce671-daa0-41e2-93bd-301407ea4d5f?finish=marble&secondary=charcoal

This product was saved through the builder with the authorized artisan number,
the demo reference photo and uploaded marble texture. Its dimensions are
180cm x 90cm x 75cm, base 150000 + marble 25000 = 175000 NGN.
The automated checks inspect the WhatsApp link; no message was sent.
On a phone, replace localhost with the Vite Network address.

## Checks performed

- All seven preset factories pass validation and bounds/grounding checks across
  default, smallest, largest and very uneven dimensions; drafts remain independent.
- Sofa, coffee table and desk render/resize at a 390px browser viewport without
  horizontal overflow; screenshots were visually inspected.
- A real Supabase texture/photo upload, UI save and API fetch preserve the images.
- Buyer finish changes, live price, reload and WhatsApp configuration match.
- Browser image preparation reduced a 2048px image to 1024px WebP. Small images
  stay unchanged; oversized and corrupt image files are rejected.
- A simulated texture 404 leaves the 3D furniture in its fallback color and shows
  a notice; successful reload recovers the textured material.
- Normal browser flow has no application console errors. The simulated image
  outage reports only the expected texture-load exception, caught by the material
  boundary. Hidden HTML fallback inside canvas is excluded from visible-error checks.

Run static checks in a second terminal:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Real device appearance and opening the WhatsApp app still need your manual check.
GLB upload is deferred bonus work. After this checklist passes, prioritize the
one-product demo, backup recording and code freeze before considering that bonus.
