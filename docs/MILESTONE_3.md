# Milestone 3: test the backend locally

## What is ready

The reusable 3D Viewer works. Product create/fetch and signed photo-upload API
functions are implemented. npm run dev now serves both frontend and API through
Vite's existing development server, with no Vercel login required. The dev-only
adapter in dev/localApi.ts calls the exact same handlers used by Vercel later.
No extra server framework or dependency was added. The shared schema is unchanged.

Supabase Database and Storage remain hosted, using your .env.local values.
Internet access is needed for those requests. GitHub, deployment and Vercel
account setup are deferred until the full MVP works locally.

Milestone 3 is complete. The save form, finish selector, live price and WhatsApp
button have now been integrated in Milestone 4. See MILESTONE_4.md for the current
UI walkthrough; the instructions below remain useful for backend-only checks.

## Start locally

```powershell
Set-Location 'C:\Users\ozebo\Desktop\Backup_Showroom 3D'
npm.cmd run dev
```

Open http://localhost:5173 for the table preview. On a phone connected to the same
Wi-Fi, use Vite's Wi-Fi Network URL. Use the dev URL rather than opening dist/index.html
as a file; dist is generated output. Stop the server with Ctrl+C in its terminal.

npm run dev:full is an alias for the same local setup. npm run preview serves
only the compiled frontend and should not be used for API testing.

## See a saved product

Open this URL directly in your browser:

http://localhost:5173/api/products/9cf17f2c-8f7d-445c-8248-35e332fa9ddb

Expected: JSON with Minimalist dining table, price 150000, dimensions
180cm x 90cm x 75cm, five parts, photoUrl and finishes including Carrara Marble.
JSON output is expected because this is an API endpoint, not the buyer page.

The record was saved through the local HTTP API and fetched successfully using
the artisan's supplied WhatsApp number and public/demo/dining-table.jpg.
The photo source and license are recorded in public/demo/PHOTO_CREDIT.md.
It is a stock reference, not a photo of artisan inventory or a photo-to-3D result.

## Test save, fetch, image upload, pricing and URL helpers

Keep npm run dev running. In a second terminal:

```powershell
npm.cmd run check:supabase
npm.cmd run verify:backend -- --base-url http://localhost:5173 --phone YOUR_COUNTRY_CODE_NUMBER --image public/demo/dining-table.jpg
```

Replace YOUR_COUNTRY_CODE_NUMBER with the actual artisan WhatsApp number.
The script uploads the image using a signed token, checks its public URL, sends
POST /api/products, fetches the saved product with GET /api/products/:id, verifies
matching data, checks the Carrara Marble configuration and 175000 NGN price, and
checks that the publishable key cannot read products directly.

It prints a saved product ID. Every successful run creates one additional demo
product and photo; avoid repeatedly creating copies. It builds a WhatsApp message
but does not open WhatsApp or send anything. Without --base-url, it calls the same
handlers directly against Supabase; include --base-url to verify HTTP routing.

## Local automated checks

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

The isolated tests use fixtures and do not write to Supabase. The other checks
validate TypeScript, lint and production compilation. The production browser
bundle was checked to confirm that the server secret is absent.

## Files

| File | Purpose |
| --- | --- |
| dev/localApi.ts | Development-only adapter inside Vite |
| vite.config.ts | Loads server env locally; protects browser key slot |
| api/products/index.ts | Product POST |
| api/products/[id].ts | Product GET |
| api/uploads.ts | Signed image-upload token |
| server/supabase.ts | Private Supabase client |
| server/validation.ts | Field, shape, finish, phone and upload validation |
| server/products.ts | Save/fetch and uploaded-image metadata checks |
| server/http.ts | Safe responses and request validation |
| src/lib/api.ts | Browser save/fetch/photo-upload helpers |
| src/lib/configuration.ts | Finish selection, price and configuration URLs |
| src/lib/whatsapp.ts | Phone sanitization and encoded message |
| src/lib/uploadRules.ts | Shared image type/size rules |
| tests/backend.test.ts | Isolated backend checks |
| scripts/check-supabase.ts | Read-only live connection check |
| scripts/verify-backend.ts | Real upload/save/fetch check |

## Database status

The configured project's initial migration has been applied. Do not rerun it.
For a NEW project only, run the complete file
supabase/migrations/20261008000100_create_products.sql in Supabase SQL Editor.
It creates the products table, RLS/grants and public image bucket. There are no
anonymous table or storage-write policies. Browser uploads use signed tokens.

## Passing checkpoint

- [x] Real local HTTP photo upload -> save -> database -> fetch passes.
- [x] Malformed UUID returns 400; unknown API path returns JSON/404.
- [x] Wrong method returns 405; oversized JSON returns 413.
- [x] Supabase table and image bucket checks pass.
- [x] Pricing, configuration URL and WhatsApp message helper checks pass.
- [x] Typecheck, lint, tests and build pass.
- [ ] Open the saved-product API URL in your own browser.

The verification server started by Codex was stopped after checks. You can start
your own with npm run dev. After the API check works for you, Milestone 4 adds
visible artisan and buyer pages, and the whole journey will be tested locally.

## Deployment later

Vercel will run api/ as Functions. The dev-only adapter is excluded from browser
builds. npm run dev:vercel is available for an eventual Vercel-runtime check.
No publishing is needed for the current checkpoint.
