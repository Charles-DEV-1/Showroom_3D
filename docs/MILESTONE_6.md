# Milestone 6: more templates and mobile reliability

Follow-up: sofa, coffee table and office desk were added after this checkpoint.
All seven factories pass the same geometry checks. The current walkthrough is
[Milestone 7](MILESTONE_7.md), which adds simple texture finishes.

## What we added

The Furniture template selector now offers Dining table, Chair, Shelf and Bed.
Each factory produces the same parts JSON used by the existing Viewer and API.
No schema fields, migrations, libraries, accounts or product dashboard were added.
Template choice is local builder state; a saved product needs only its resulting
parts, dimensions and finishes, so the buyer does not depend on the preset factory.

| Preset | Default width x depth x height (cm) | Primary slot | Secondary slot |
| --- | --- | --- | --- |
| Dining table | 180 x 90 x 75 | Tabletop | Legs |
| Chair | 55 x 55 x 90 | Seat and back panel | Legs and back frame |
| Shelf | 100 x 35 x 180 | Sides and five horizontal boards | Back panel |
| Bed | 160 x 210 x 100 | Mattress and pillows | Platform, headboard and legs |

Bed height includes its headboard. These are stylized geometric approximations.
Dimensions describe overall bounds, not measured stock-photo furniture.
Preset prices are editable sample starting amounts; enter the artisan's real
base price and finish modifiers before using a product for real orders.

## Behavior when editing

- Changing the template starts a fresh draft, with a new name, parts, dimensions,
  finishes and price. It clears the reference photo, finish selection and saved
  share result. Your WhatsApp number carries over. The form states this above the
  selector, so save the current draft first if you want to keep it.
- Changing dimensions rebuilds the CURRENT preset, rather than always generating
  table parts. Manual part edits are replaced, as explained beside those inputs.
- Make global sizing changes first, then customize individual parts.
- The new presets start with no reference image; upload a matching photo yourself.
- Earlier saved product links still use their saved JSON and remain valid.
- The camera leaves more space around furniture to keep chair legs visible on a
  phone. Part edits still refit the camera; finish changes preserve the view.

## Complete files

| File | Change |
| --- | --- |
| src/data/templates.ts | Four parameterized geometry factories, metadata and material defaults |
| src/pages/BuilderPage.tsx | Actual selector, reset behavior and dimension dispatch by preset |
| src/components/viewer/Viewer.tsx | Slightly wider camera fit margin for phone framing |
| tests/templates.test.ts | Bounds, positivity, validation and independent-draft checks |

The complete replacements are already written. Parts, finishes, buyer selection,
price, upload and save helpers continue using the established shared types.

## Run and test

```powershell
Set-Location 'C:\Users\ozebo\Desktop\Backup_Showroom 3D'
npm.cmd run dev
```

If your dev server is already running, refresh http://localhost:5173/builder.
The existing user-owned server was used for browser checks; no additional app
server was started or stopped. GitHub/Vercel setup is still unnecessary.

1. Enter your WhatsApp number once.
2. Select Chair; seat/back and four legs should replace the table. Confirm your
   phone number remains while the name, finishes, dimensions and price change.
3. Resize its width: it should remain a chair. Add/edit parts if desired.
4. Select Shelf and resize height: the sides, back and five boards should resize.
5. Select Bed and change width/depth: platform, mattress, pillows and headboard
   should resize together. Height refers to the headboard's overall top.
6. Set actual prices and upload an appropriate photo, then save.
7. Open its product link, choose both material slots, and reload.
8. Confirm model, selections, price and WhatsApp message all match that URL.

## Existing bed demo

http://localhost:5173/product/d68bf1dd-08f6-4503-9107-ddb5142d9b5e

The browser test resized this bed to 170 x 210 x 100 cm and saved it using the
artisan phone supplied earlier. It has no reference photo. Its starting price
is 220000 NGN. Sage linen adds 15000; Natural oak adds 10000; together = 245000.

Exact tested configuration:

http://localhost:5173/product/d68bf1dd-08f6-4503-9107-ddb5142d9b5e?finish=sage&secondary=oak

The WhatsApp link includes that configuration and both finish names. The automated
check inspected the message; it did not open WhatsApp or send anything.

## Verification already completed

- All four factories pass server validation at default, minimum and maximum sizes
  and very uneven width/height/depth combinations.
- Every generated part has positive dimensions and lies inside the declared
  overall bounds, with furniture grounded at y=0.
- Draft mutations do not modify other drafts or shared preset definitions.
- Phone-sized builder switches all presets, preserves the contact and resizes
  each model correctly without horizontal overflow.
- A real bed saved through the UI and was fetched from Supabase with matching JSON.
- Primary/secondary IDs survive reload and produce the correct combined price.
- IDs passed to the wrong material slot fall back to that slot's default finish.
- Simulated phone touch rotation and pinch zoom visibly change the camera view.
- A temporary API error displays loading/error states, and Try again recovers the
  product with its selected finishes and price. No application errors occurred.

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

18 tests pass. Supabase remains hosted; connectivity is needed for save/fetch.

## Your phone checkpoint

- [ ] Select and resize chair, shelf and bed yourself.
- [ ] Save one product and confirm both slot selections survive reload.
- [ ] On the same Wi-Fi, use Vite's Network URL to rotate and pinch-zoom.
- [ ] Open WhatsApp and reopen the configuration link from the message.

Stop here until these pass. The next checkpoint is visual polish and simple
texture finishes. Optional GLB support follows only if the core demo remains
reliable and time permits. Sign-in and My Products remain outside this MVP.
