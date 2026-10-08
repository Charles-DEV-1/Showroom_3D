# Milestone 4: the artisan builder and buyer page

This checkpoint was confirmed working by the user. Chair, shelf and bed presets
have now been added in Milestone 6; see MILESTONE_6.md for the current walkthrough.

## What is now visible

- / and /builder open the artisan studio.
- /product/UUID opens a saved product fetched from Supabase.
- The same Viewer component renders both draft and saved products.
- The builder has table template, dimension inputs, parts editor, finish editor,
  price, WhatsApp number, reference photo upload, save and share link.
- The buyer rotates the model, chooses finishes, sees dimensions and live price,
  and opens a pre-filled WhatsApp order with the exact configuration URL.

The shared product schema is unchanged. No dependencies were added. This
checkpoint introduced the table preset; Milestone 6 now adds the other presets.
Color finishes work; texture rendering and GLB remain later checkpoints.

## Complete implementation files

| File | Purpose |
| --- | --- |
| src/App.tsx | Routes builder/product pages and displays navigation |
| src/App.css | Complete desktop and responsive page styles |
| src/pages/BuilderPage.tsx | Draft state, live preview, photo upload, save and share |
| src/pages/ProductPage.tsx | Fetch/loading/error states, URL selection, pricing and WhatsApp |
| src/components/builder/NumberField.tsx | Numeric inputs allowing editing and blank intermediate values |
| src/components/builder/PartEditor.tsx | Add/remove shapes; edit shape, size, center and slot |
| src/components/builder/FinishEditor.tsx | Add/remove finishes; edit name, slot, color and price modifier |
| src/components/FinishSelector.tsx | Reusable per-slot finish buttons |
| src/data/templates.ts | Table factory from numeric dimensions, plus initial color finishes |
| src/lib/id.ts | Draft IDs supporting localhost and phone HTTP origins |
| src/components/viewer/Viewer.tsx | Refits camera after parts change; reuses slot material logic |

These are complete files already created or replaced in the workspace. Existing
API, configuration, pricing, upload and WhatsApp helpers are reused.

## Run

```powershell
Set-Location 'C:\Users\ozebo\Desktop\Backup_Showroom 3D'
npm.cmd run dev
```

If your server is already running, refresh the page. Open
http://localhost:5173/builder. No GitHub or Vercel setup is needed. Supabase remains
hosted, so keep Internet access for database and upload requests.
The existing user-run dev server was used for the browser test and remains yours
to stop with Ctrl+C. No additional app server was left running by Codex.

## Artisan walkthrough

1. Start with Dining table. Enter a product name and an actual artisan WhatsApp
   number including country code. The builder starts with the number empty.
2. Set base price in whole NGN.
3. Change width, height and depth in centimeters. The table rebuilds immediately.
   Dimension changes replace manual part edits, as stated above those inputs.
   Do global sizing first and manual part edits afterward.
4. Expand a part to edit geometry size, center position and material slot.
   Add part starts a box; choose Cylinder or Sphere from its shape control.
   X and Z are horizontal; Y points upward. Cylinder size uses radius, not diameter.
   At least one part remains. Custom parts should fit the declared overall size.
5. Expand a finish to edit its name, slot, color and modifier. Use Add finish for
   another option. The preset includes Walnut, Carrara Marble (+25000) and Charcoal.
6. Select finishes under the preview to see every part in that slot update.
7. Upload an image, such as public/demo/dining-table.jpg, using the file picker.
   JPEG/PNG/WebP only, maximum 2 MiB. Wait for its thumbnail before saving.
8. Save product. After the API confirms the save, the product link appears.
9. Open product or Copy link. On a phone HTTP origin where clipboard is unavailable,
   the field is selected so you can copy manually.

Saving creates a fixed snapshot. Editing product data clears the share result;
save again to create a new snapshot. Previously shared products remain valid.
Choosing another preview finish after saving updates its configuration link.
Unsaved drafts are kept in React state and reset when the builder page reloads.

## Buyer walkthrough

Open the browser-tested product:

http://localhost:5173/product/3f3172c7-7e8c-474c-9fa2-a194dea5a666

This table was resized to 200 x 90 x 75 cm during the UI test. Base price is
150000 NGN, with Walnut/Charcoal defaults. The photo is the stock reference
recorded in public/demo/PHOTO_CREDIT.md.

1. Rotate the furniture.
2. Choose Carrara Marble: tabletop changes and price becomes 175000 NGN.
3. Confirm ?finish=marble appears in the browser address.
4. Optionally choose Warm Walnut for the secondary finish: all legs change and
   the total becomes 185000 NGN. Its ID is preserved as &secondary=ID.
5. Reload: selected finishes and price must stay the same.
6. Confirm the dimensions.
7. Tap Order via WhatsApp. The message contains product name, both finish names,
   selected price, dimensions and an absolute configuration URL.
8. Open that configuration URL: the same finish choices must appear.

The buyer route handles loading and failed/missing product states with retry.
Unknown finish IDs or IDs belonging to another slot fall back to the first option.
Price modifiers are charged once per used slot, not once per furniture part.

## Real phone test

Open Vite's Wi-Fi Network URL on the phone while both devices use the same Wi-Fi.
Use /builder or /product/3f3172c7-7e8c-474c-9fa2-a194dea5a666 after that host.
Links use the current browser origin, so phone-generated configuration links use
the Wi-Fi address instead of localhost. Local links require access to that
computer/network; they become publicly shareable after a later deployment.

Perform the exact demo: rotate -> select Marble -> show change -> show price ->
show dimensions -> WhatsApp -> show message/link -> reopen link -> same finish.
The automated browser test inspected the WhatsApp link; it did not open WhatsApp
or send a message. Real-phone handoff is your manual check.

## Verification

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Browser verification already passed for:

- Actual photo upload through the UI to Supabase Storage.
- Width changed to 200 cm; resulting parts and dimensions saved correctly.
- Added a sphere, edited radius and removed it before saving.
- Added and edited a secondary finish and price modifier.
- Save through UI -> GET returns exactly those parts/finishes/photo/dimensions.
- Buyer material changed visibly (canvas image compared before/after).
- Primary and secondary modifiers produce 175000 / 185000 NGN totals.
- Both selected finishes survived reload and appeared in the WhatsApp message.
- Desktop and 390px phone layouts have no horizontal overflow.
- Builder preview and buyer viewer appear above forms/details on a phone.
- No browser errors during the tested journey.

## Your checkpoint

- [ ] Create and save a product using the builder yourself.
- [ ] Open its link and switch finishes.
- [ ] Reload and confirm selection and price.
- [ ] Complete the WhatsApp handoff on your real phone.

Pause here until those checks pass. Then add more template presets and complete
mobile reliability checks. Keep GLB and extra polish after the core demo works.
