# ShowRoom 3D team guide

Current checkpoint: the user has confirmed that the core MVP works locally.
Seven templates, texture finishes, save/share, buyer configuration and pricing
are implemented. The pitch and 4-minute-25-second narrated demo are prepared.
The movie previews the actual generated order message; it does not contain
footage of the WhatsApp app. See [Milestone 8](MILESTONE_8.md).

On October 8, 2026, the user requested an extension plan: landing page with the
demo video, simple artisan accounts, My products, and a minimal profile.
Milestone 10 is implemented locally: the home page, embedded demo and navigation
have passed desktop and phone-sized Chrome checks and were accepted by the user.
The [Milestone 10 checklist](MILESTONE_10.md) remains available for regression.
Milestone 11 implements simple Supabase sign-up, sign-in, sign-out and session
restoration; the user has tested sign-in/sign-out. See [Milestone 11](MILESTONE_11.md).
The user reduced this milestone to basic authentication: password recovery and
Forgot password are outside the MVP. Milestone 12 is implemented: protected
workspace/write APIs, owner-scoped uploads and My products, with logout returning
home. Its migration is applied and two-account live checks passed. Complete your
own [Milestone 12 checklist](MILESTONE_12.md) for regression. The user requested
Milestone 13 alongside responsive polishing: private profiles and contact defaults
are implemented, with the migration applied and 320–1440 px/two-account checks
passed. Complete [Milestone 13's checklist](MILESTONE_13.md) on your own phone.
On October 8 the user requested the feature freeze and delegated remaining
manual regression/video recording. [Milestone 14](MILESTONE_14.md) records the
freeze and passing build/lint/33 tests; actual phone/recording acceptance remains
with the assignee. Give them [the 60-second scene and narration guide](../pitch/ONE_MINUTE_VIDEO_GUIDE.md).
[Milestone 15](MILESTONE_15.md): the frozen release is uploaded to `main` in
[Charles-DEV-1/Showroom_3D](https://github.com/Charles-DEV-1/Showroom_3D), with
description and topics configured. The user created the Vercel site at
[showroom-3d-brown.vercel.app](https://showroom-3d-brown.vercel.app). A deployed
TypeScript import failure was reproduced and fixed locally; build/lint/34 tests
passed. See Milestone 15 for the repair and remaining public-site acceptance.

## The product journey

This describes the working core. An artisan signs in before
creating/uploading, and each new product belongs to that verified account.
The buyer journey and public product URLs remain the same. Milestone 13 adds
profile defaults for NEW drafts, rather than changing existing published products.

An artisan picks a template, edits numeric dimensions and parts, adds finishes,
sets a price and WhatsApp number, and uploads a reference photo. The builder
keeps one ProductInput object in React state. The Viewer renders that same
object immediately. Saving sends JSON to our API, which validates it and stores
one row in Supabase. The API returns its UUID and the builder shows a product URL.

A buyer opens that URL. The page fetches the saved product, reads finish IDs from
the query string, and passes product + selection to the same Viewer. Changing
a finish updates React state, the visible materials, the price, and the URL.
WhatsApp receives a pre-filled message containing that exact configuration URL.
Saved products are immutable in this MVP; revisions are new saves with new IDs.
There is no order database: the order conversation happens in WhatsApp.

```text
ARTISAN -> React Builder -> Shared Product JSON -> Vercel API
                                                     |
                                              Supabase Database
                                                     |
                                            Shareable Product URL
                                                     |
BUYER -> React Viewer -> Finish Selection -> Live Price -> WhatsApp

Photo upload: browser -> POST /api/uploads -> signed token
             browser -> Supabase Storage using that token -> public photo URL
```

Use React + Vite + TypeScript, Three.js, React Three Fiber, drei, Supabase and
Vercel. Plain CSS is sufficient. Vercel Functions are the API: no custom server.

## Shared contract (freeze before parallel work)

The complete contract is in src/types/product.ts. Preserve the supplied fields.
The only added product data is numeric dimensionsCm; each part gains a stable
id, and finishes can have optional textureUrl. Supabase adds product id and
created_at; the API maps created_at to createdAt.

- All JSON measurements are centimeters. Convert to meters only in Viewer.
- dimensionsCm is [width, height, depth]. The human label displays width x depth
  x height, matching the requested table example. Generate it; do not edit it.
- Box size is [width, height, depth]. Cylinder size is [radius, height]. Sphere
  size is [radius]. Cylinder radius 4 means an 8 cm diameter.
- Position is the CENTER [x, y, z]. +y is upward. A 75 cm leg resting on the
  floor has center y = 37.5. A 4 cm tabletop with top at 75 has center y = 73.
- Shapes are axis-aligned. Rotation editing is outside this MVP.
- Only primary and secondary slots. One selected finish per slot.
- Price and modifiers are whole Nigerian naira; nonnegative integers.
- photoUrl can be null while drafting; modelUrl stays null until the bonus.
- textureUrl is a simple image mapped to primitives. Colors work first.

Changing global template dimensions rebuilds the template parts using its
factory. Manual part edits then change the JSON directly. Warn before changing
dimensions/template if doing so will reset manual edits. Dimension labels describe
the artisan's intended overall dimensions; custom parts must fit those dimensions.

## Viewer behavior (Milestone 2)

For every part, create an R3F mesh. A mesh combines geometry, material and position.

| Shape | R3F geometry | Geometry arguments, after dividing cm by 100 |
| --- | --- | --- |
| box | boxGeometry / THREE.BoxGeometry | [width, height, depth] |
| cylinder | cylinderGeometry / THREE.CylinderGeometry | [radius, radius, height, 24] |
| sphere | sphereGeometry / THREE.SphereGeometry | [radius, 24, 16] |

Divide each position coordinate by 100 too. The 180 cm table becomes 1.8 meters
wide. Do not divide twice or normalize each part independently. Keep +y upward.
Use meshStandardMaterial, soft ambient/directional lighting, Bounds to fit the
camera, and OrbitControls for drag/touch rotation. Keep shadows modest for phones.

ViewerProps = { product, selection }. Viewer never owns form or pricing state.
For each part, find the finish whose ID matches selection[part.slot] AND whose
slot matches part.slot. Apply its color or uploaded texture. Neutral gray is the
fallback for a slot with no finishes. React updates every matching mesh when
selection changes. Load textures with proper sRGB color space in a child component;
never call texture hooks conditionally in a shared component. Include loading
and WebGL error states when implementing the Viewer. FinishMaterial now uses
useTexture in its own child component, Suspense for a temporary color material,
and a local error boundary for failed-image color fallback. Uploaded color maps
use sRGB color space and a white material to avoid tinting. A single image is
mapped with built-in shape UVs; no repeat, UV or advanced material editor.
The browser downsizes large finish images to at most 1024 pixels per side.

When optional modelUrl exists, load a cloned GLB scene instead of parts JSON.
Do not build a GLB editor. Keep the parts as a fallback if loading fails. Arbitrary
GLBs do not encode our material slots: bonus demo models must name meshes primary
or secondary for finish switching; unknown meshes retain original materials.
Fit imported models to the declared dimensions in the Viewer.

## Selection, URLs, pricing and WhatsApp (Milestones 4-6)

Keep selection as { primary: 'f2', secondary: 'f5' } in React state.
Initialize one finish per used slot: valid URL selection, otherwise first finish
for that slot. Reject IDs belonging to another slot; ignore unknown query IDs.

Use /product/UUID?finish=f2 for primary and append &secondary=f5 when needed.
An absent finish parameter chooses the first primary finish. Use URL and
URLSearchParams to update the address with history.replaceState. Support popstate
if navigation history changes. Canonical order links explicitly include every
selected slot ID, including defaults. No additional configuration table is needed.

Final price = product.price + sum of one selected modifier per slot.
Never add a finish modifier once per part. For 150000 base + 25000 primary +
10000 secondary, the total is 185000. With only primary it is 175000.
Format displayed prices with Intl.NumberFormat for en-NG / NGN.

Person 3 writes pure shared helpers in src/lib/configuration.ts and
src/lib/whatsapp.ts, imported by the buyer page. No WhatsApp API endpoint is
needed; the helper returns the URL and the user taps a normal link.

Require country-code input, e.g. +234 801 234 5678. Remove spaces, +, parentheses
and hyphens; reject other characters, a leading zero, and lengths outside 8-15
digits. Do not guess a country code for a local phone number.

Message lines: product name; every selected finish name and slot; final NGN price;
dimensions; absolute configuration URL using window.location.origin.
Build https://wa.me/DIGITS?text= followed by encodeURIComponent(message).
Encoding protects spaces, newlines, &, # and ? inside the message from being
interpreted as URL separators. Encode the whole message once, not the entire
WhatsApp URL. The customer still taps Send in WhatsApp; opening is not sending.

## API and database (Milestone 3)

- POST /api/products accepts ProductInput and returns 201 with Product.
- GET /api/products/:id returns Product, or 404 for an unknown UUID.
- Supporting POST /api/uploads accepts file name, size and content type and
  returns a signed upload token, unique object path and public URL.
- Validate uploads again through bucket limits, not only client-reported size.
- Map camelCase JSON to snake_case SQL columns in one backend helper.

Use one products table; exact proposed SQL is docs/database-design.sql.
JSONB lets us save and fetch the whole small configuration without joining parts
and materials tables. We do not need to query individual legs during this demo.
Validate JSON elements server-side: finite numeric values, valid shape/tuple length,
positive bounded sizes and dimensions (up to 1000 cm), bounded positions, unique
part/finish IDs, permitted slots, #RRGGBB colors, nonnegative integer prices,
name lengths, array limits (100 parts / 24 finishes), and valid phone numbers.
Allow file URLs only from the configured Supabase buckets. Recompute dimensions
on the server. TypeScript alone does not validate incoming JSON.

Enable RLS, revoke anonymous/authenticated product access and grant service_role
select/insert. No browser write policies. API uses a server-only Supabase secret
key. No public update/delete endpoint. Public Storage bucket product-images holds
JPEG/PNG/WebP photos and later textures, maximum 2097152 bytes (2 MiB). No
anonymous storage write policies; upload using server-issued signed tokens.

Creation and upload-token endpoints now require a verified artisan session and
enforce product/image ownership. My products is account-scoped; buyer GETs remain public.
This is a public demo product, so names, photos and WhatsApp numbers are public.

## File ownership and parallel work

| Person | Owns | Connects through |
| --- | --- | --- |
| 1: Viewer | src/components/viewer/* | ViewerProps from shared types |
| 2: Builder + integration | src/pages/*, src/components/builder/*, App.tsx | Viewer, templates, API helpers, selection helpers |
| 3: Backend | api/*, server/*, src/lib/*, Supabase SQL | ProductInput/Product and HTTP contract |
| 4: Design/content | src/data/templates.ts, public/demo/*, pitch/*, CSS tokens | Template factories returning ProductInput |

Person 2 owns src/App.css and page CSS. Person 4 proposes styles/tokens rather
than both editing the same file. Only Person 2 edits App.tsx and package.json;
agree dependency changes in the team chat. Make four short-lived Git branches
(viewer, builder, backend, content), integrate frequently, and commit the lockfile.
Do not put credentials in team chat or source control. Team members can write
their components in parallel after setup, but merge only code whose checks pass.

Planned folders (not all implemented yet):

```text
api/products/index.ts       # POST /api/products
api/products/[id].ts        # GET /api/products/:id
api/uploads.ts             # signed upload token
server/supabase.ts         # private client; never imported by src/
server/validation.ts
src/types/product.ts       # shared frontend/backend contract
src/components/viewer/Viewer.tsx
src/components/builder/PartEditor.tsx
src/components/builder/FinishEditor.tsx
src/pages/BuilderPage.tsx
src/pages/ProductPage.tsx
src/data/templates.ts
src/lib/api.ts
src/lib/configuration.ts
src/lib/whatsapp.ts
src/App.tsx
src/App.css
src/index.css
src/main.tsx
supabase/migrations/       # actual forward SQL added in Milestone 3
public/demo/
pitch/
docs/
```

## Milestones and gates

Milestones 1-9 are the original 48-hour plan. The user has chosen to plan a small
extension after testing the core. Follow the extension gates below before the
renewed feature freeze and final rehearsal. The hour ranges are original targets,
not a claim about how much hackathon time currently remains.

1. Hours 0-3: freeze schema; Git/Vite/React setup; create Supabase project;
   deploy setup page to Vercel. Gate: local build + public phone URL work.
2. Hours 3-12: Viewer with fixture JSON, lighting, camera, materials, OrbitControls.
   Gate: correctly sized table rotates on a real phone.
3. Hours 3-12 (parallel with 2): database, POST/GET, image upload, configuration
   and WhatsApp helpers. Gate: valid round trip; invalid JSON/file rejected.
4. Hours 12-20: table template, dimension inputs, parts and finish editors,
   live preview, buyer finishes and live price. Gate: every matching part updates.
5. Hours 20-24: complete builder -> save -> database -> share -> buyer -> finish
   -> price -> WhatsApp. Gate: one complete product works; polish can wait.
6. Hours 24-32: chair/shelf/bed/sofa/coffee table/desk presets, configuration URL round trip, mobile
   loading/error checks. Gate: reload/shared link preserves both selected slots.
7. Hours 32-40: polish camera/lighting/materials and simple texture finishes.
   GLB only if all core checks pass: .glb extension + magic header, <=2097152
   bytes client and bucket enforced, separate product-models public bucket,
   signed upload, modelUrl render branch. No live photo-to-3D.
8. Hour 40: CODE FREEZE. Hours 40-44: seed 2-3 real demo products using the
   builder, test ONE excellent product, record backup demo.
9. Hours 44-48: pitch rehearsal only. No major features.

## Extension scope and implementation rules

The extension serves one purpose: an artisan can return to their own saved
products, while a visitor can understand and try the product from the home page.
Use the existing React/Vite/TypeScript/Supabase stack and installed SDK. Continue
using the existing API and signed uploads. No new authentication provider, custom
mail server, router library or client-side database write architecture is needed.

Include only a landing page, email/password signup/sign-in/sign-out, My products,
and a profile with business/display name and WhatsApp. The user explicitly removed
password recovery and Forgot password from the MVP on October 8, 2026.
Keep products immutable: dashboard actions are Create, Open and Copy link.
Editing/deleting published products, avatars, public storefronts, analytics,
payments, orders tables, social login, roles, MFA and account deletion are outside
this extension. GLB upload and photo-to-3D remain deferred.

Every implementation milestone must supply its purpose, exact files, commands,
complete code where practical, setup instructions and acceptance checklist.
Planned filenames below do not imply those files already exist. Do not begin the
next milestone until the current gate passes. Keep schema additions separate
from applied migrations; explain them before implementing or applying SQL.

Before implementation, record the actual time remaining and protect at least
two hours for regression and presentation rehearsal. These are planning estimates,
not promises or additional hours added to the hackathon:

| Milestone | Work | Target effort | Depends on |
| --- | --- | --- | --- |
| 10 | Landing page and video | 1-2 hours | Working core and existing movie |
| 11 | Simple artisan sign-up and sign-in | 1-2 hours, plus email setup | 10 and working email delivery |
| 12 | Protected writes, ownership and My products | 2-3 hours | 11 |
| 13 | Minimal profile and builder defaults | 1-2 hours | 12 |
| 14 | Full regression, updated demo and renewed freeze | 1-2 hours | 13 |
| 15 | GitHub/Vercel delivery and final rehearsal | 1-2 hours, plus external setup | 14 and deployment instruction |

Milestone 10 is a complete improvement on its own. If the remaining budget cannot
cover the account milestones AND regression, finish the landing page and preserve
the tested core. Do not ship a login screen with unprotected write endpoints or
claim that account ownership is complete before Milestone 12 passes. Preserve a
local baseline commit before starting feature changes; do not push remotely yet.

### Planned routes and API boundaries

| Page | Access after the extension | Purpose |
| --- | --- | --- |
| / | Public | Landing page, video, Try demo, Create furniture |
| /product/:id | Public | Existing buyer viewer and WhatsApp configuration |
| /login, /signup | Public | Basic account entry |
| /auth/callback | Public entry | Finish signup confirmation/session initialization |
| /builder | Signed-in artisan | Existing furniture builder |
| /my-products | Signed-in artisan | Their 100 most recent saved products |
| /profile | Signed-in artisan | Their business/display name and WhatsApp |

Wait for initial session restoration before showing a protected page or redirect.
Buyer links must work with no session, after logout, and in a private browser.
Use the existing pathname routing in App.tsx; keep return destinations restricted
to /builder, /my-products and /profile. Never accept an arbitrary external next URL.

| Endpoint | Access after Milestone 12/13 | Contract |
| --- | --- | --- |
| POST /api/products | Verified artisan | Existing ProductInput; server assigns owner |
| GET /api/products/:id | Public | Existing public Product JSON; no account fields |
| POST /api/uploads | Verified artisan | Same signed-token response; user-scoped object path |
| GET /api/me/products | Verified artisan | { products: ProductSummary[] }; latest 100, newest first |
| GET /api/profile | Verified artisan, Milestone 13 | { profile: Profile or null } |
| PUT /api/profile | Verified artisan, Milestone 13 | { displayName, whatsapp }; validated own-profile upsert |

ProductSummary = { id, name, photoUrl, price, dimensions, createdAt }.
Dashboard price is labeled BASE price; selected finish totals belong on the buyer
page. Profile = { displayName, whatsapp, updatedAt }; its account ID is internal.
Use real queries with loading, empty, error and retry states. No fake products or
fabricated profile values. A missing profile is null until the artisan saves it.

### Milestone 10: landing page and embedded demo

**Status:** implemented locally; browser checks passed, user acceptance pending.
See [Milestone 10 instructions and checklist](MILESTONE_10.md).

**Outcome:** opening / explains the product; visitors can watch the video or try
the real saved table. /builder and every existing product URL still work.

**Owners:** Person 4 writes content and proposes layout; Person 2 implements the
page, navigation and CSS. Person 1 checks mobile media/viewer performance.
Person 3 verifies demo availability and asset delivery. Person 2 alone edits
App.tsx, package.json and vercel.json when required.

**Files:** create src/pages/LandingPage.tsx and its CSS; update App.tsx and header
navigation. Use React.lazy/Suspense for BuilderPage and ProductPage so opening
the landing page does not eagerly download the Three.js viewer bundle. Use one
small shared loading state, with no additional library.

**Steps:**

1. Run the baseline commands below and keep the current demo link/video safe.
2. Change / from the builder to the landing page. Keep /builder unchanged.
   The brand link goes to /; the artisan action still goes to /builder at this stage.
3. Add a concise value statement, three workflow steps, and two clear actions:
   Try the demo and Create furniture. Explain stylized previews honestly.
   The opening visual now uses a silent 12-second recorded table rotation and
   finish switch, with Pause/Play and a reduced-motion poster fallback. Its public
   files are showroom-table-loop.mp4 and showroom-table-poster.jpg; no live 3D
   renderer is loaded on the landing page.
4. Read the main ID from scripts/demo-products.json as a shared build-time demo
   reference. Try demo opens its saved buyer URL with Walnut + Charcoal so users
   can see the marble price change. Keep a normal helpful error if that real
   product is unavailable; do not replace it with a fake product.
5. Copy only the final MP4 and poster into public/demo/ when implementing this
   milestone. artifacts/ is ignored and will not automatically be deployed.
   Public assets: showroom-full-demo.mp4, showroom-full-demo-poster.jpg and
   showroom-full-demo.vtt. Convert the existing SRT to WebVTT for browser captions.
6. Embed native HTML video with controls, playsInline, preload="metadata", poster,
   and an English captions track. Play on user action; no autoplay, forced sound,
   external player or background video. Keep the original recording offline.
7. Add small-screen layout and keyboard-visible button focus. The existing movie
   is about 6.2 MB; avoid downloading it in full before someone chooses playback.
   The movie's message preview must not be described as footage of WhatsApp.

**Gate:** / opens on laptop and phone without horizontal scroll; poster, sound,
controls and captions work; both buttons reach the correct real pages. Refreshing
/builder and a product configuration still works. Build output contains the MP4,
poster and VTT; an idle home page does not load the viewer bundle or full movie.
No database or authentication change is required for this milestone.

### Milestone 11: simple artisan authentication

**Status:** basic sign-up, sign-in, sign-out and persistent sessions are implemented
locally, and the user tested sign-in/sign-out. Real inbox checks remain the team's
responsibility; the following milestone fixes logout navigation and protects writes.
Follow [Milestone 11 setup and checklist](MILESTONE_11.md). This is deliberately
limited to the user's revised MVP scope; there is no password recovery feature.

**Outcome:** an artisan can create a Supabase email/password account, confirm the
email if the project requires it, sign in, refresh without losing the session,
and sign out. Ownership and protected writes are completed in Milestone 12.

**Owners:** Person 3 checks Supabase email settings and redirect allowlist; Person 2
owns forms, AuthProvider and routing; Person 4 reviews labels; Person 1 verifies
that the existing buyer viewer remains independent of login.

**Files:** src/lib/supabase.ts, src/auth/AuthProvider.tsx, src/auth/useAuth.ts,
src/auth/navigation.ts, src/components/auth/AuthForm.tsx and its CSS,
src/pages/LoginPage.tsx, SignupPage.tsx and AuthCallbackPage.tsx. Update App.tsx,
main.tsx, src/lib/api.ts and vercel.json. No new library or database migration.

**Supabase preflight:**

1. Email/password sign-up and confirmation were checked as enabled on October 8,
   2026 through the project's public Auth settings. Keep confirmation enabled.
   Set the password minimum to 8 characters to match the sign-up form.
2. In Authentication > URL Configuration, set Site URL to http://localhost:5173.
   Add http://localhost:5173/auth/callback to Redirect URLs. For a real phone,
   add its actual Vite Network-origin /auth/callback URL and use that origin when
   registering. Do not use localhost on the phone to reach the laptop.
3. For this local MVP test, use an email address belonging to an existing Supabase
   project-team member. The built-in sender currently permits only those recipients
   and two messages/hour. Custom SMTP is required before inviting other addresses;
   follow the SMTP setup table in MILESTONE_11.md. No application mail server or
   email SDK is needed. Keep mail credentials out of browser configuration.
4. Check confirmation templates use {{ .ConfirmationURL }} so Supabase validates
   the link and redirects back to the allowed callback. Test an actual inbox,
   spam folder, expired links and the final browser destination.

**Implementation:**

1. Use one shared browser client with the public project URL/publishable key.
   The installed SDK manages session persistence, refresh and confirmation-link
   credentials. The service secret stays server-side.
2. AuthProvider subscribes to onAuthStateChange, restores the initial session and
   unsubscribes on cleanup. Callbacks stay synchronous to avoid SDK lock issues.
   Wait for restoration before routing authenticated users away from login.
3. signUp submits email/password and an origin-specific emailRedirectTo. A user
   object without a session means check email; it is not completed login.
4. /auth/callback waits for SDK initialization, cleans credentials from the address,
   then opens /builder only for a successful confirmation. Missing/expired links
   show a readable failure. No custom token verification flow is added.
5. signInWithPassword opens /builder on success; return navigation accepts only
   that known local destination. Forms block duplicate submits and show readable
   validation, wrong-password, unconfirmed-email and rate-limit errors.
6. The header offers Sign in or Sign out. Sign-out clears the current browser
   session. The signed-upload helper reuses the same browser client.
7. Buyers remain public. Workspace guards and server token verification belong
   to Milestone 12 together, so this milestone does not claim product ownership.

**Gate:** a real test account can sign up, receive confirmation and sign in; refresh
restores the session; logout clears it; wrong credentials are readable. Check
phone layout and an old public configuration URL while signed out. Do not proceed
to ownership until these manual checks pass.

Sources checked October 8, 2026: [password authentication](https://supabase.com/docs/guides/auth/passwords),
[SMTP limits and setup](https://supabase.com/docs/guides/auth/auth-smtp),
[redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls).

### Milestone 12: ownership, protected writes and My products

**Status:** implemented locally; migration applied and hosted two-account
browser/API verification passed. User acceptance pending. See [Milestone 12](MILESTONE_12.md).

**Outcome:** only signed-in artisans can create/upload; each sees their own real
saved products. Buyers continue opening all published product URLs without login.

**Owners:** Person 3 owns migration, token verification, storage ownership and
private endpoint; Person 2 owns dashboard, browser requests and workspace guards.
Person 1 checks viewer/configuration regressions; Person 4 checks dashboard copy.

**Explain this schema addition before creating a forward migration:**

| Change | Definition and reason |
| --- | --- |
| products.owner_id | Nullable UUID foreign key to auth.users(id), ON DELETE RESTRICT; links new products to their artisan while preserving legacy rows |
| Ownership index | Composite index on owner_id and created_at DESC for the dashboard |

ProductInput, parts, finishes, prices and dimensions retain their existing shape.
Owner ID is server-assigned/internal and is not added to the public buyer response.
All new API saves require an owner; null is retained only for legacy demos.
Do not edit 20261008000100_create_products.sql or rebuild/drop the products table.

**Files:** supabase/migrations/20261008000200_product_ownership.sql,
server/auth.ts, api/me/products.ts and src/pages/MyProductsPage.tsx. Update
server/products.ts, server/validation.ts, api/products/index.ts, api/uploads.ts,
src/lib/api.ts, dev/localApi.ts, App.tsx, vercel.json and relevant tests/scripts.
Keep API logic in the same handlers used by local Vite and Vercel.

**Steps:**

1. Apply the additive migration to the configured project and inspect the new
   column/index. Existing rows, parts, assets, UUIDs and buyer URLs must survive.
2. Implement a single server helper requiring Authorization: Bearer ACCESS_TOKEN.
   Validate against the project's Supabase Auth server using getUser(token).
   Missing/invalid tokens return 401; auth-service outages return a safe retryable
   error, not a forced logout. Do not trust a browser user ID, JWT decoding alone,
   or getSession as server verification. [getUser reference](https://supabase.com/docs/reference/javascript/auth-getuser).
3. Keep database access behind the existing server-only service client. Keep RLS
   enabled and direct anon/authenticated table access revoked. Service keys bypass
   RLS, so EVERY private query must enforce the verified user ID explicitly. This
   is the chosen architecture; do not switch to browser table writes alongside it.
   Keep the service database client separate from user-session state: do not call
   setSession on it or replace its database Authorization header with the incoming
   user token. Verify identity, then pass the verified ID to ownership filters.
   [Service-key/RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).
4. Require that helper before POST /api/products and POST /api/uploads do work.
   Assign owner_id from the verified user; reject reserved ownership/identity
   fields in incoming product JSON rather than accepting a client-supplied owner.
5. New signed-upload paths are images/USER_UUID/OBJECT_UUID.ext. The server chooses
   both IDs, keeps upsert disabled, and retains the bucket's 2 MiB/MIME constraints.
   Validate new product image/texture URLs against that verified user's folder
   and real object metadata before saving. Auth alone is not image ownership.
6. Update imagePath to recognize both legacy images/OBJECT_UUID.ext and new
   user-folder URLs. Existing public GETs/demo validation must accept legacy paths.
   New saves accept only the verified user's paths. Do not rename/delete legacy
   assets or break old buyer links. Keep public reads and no browser bucket-write
   policies; signed tokens are the upload authorization.
7. GET /api/me/products filters owner_id = verified user.id, orders newest first,
   limits to 100 and returns the defined summaries. No userId query parameter,
   all-products fallback or demo rows substituted into the private list.
8. Build MyProductsPage with loading, error/retry and an honest empty state.
   Label the list as the latest 100 products, with base price and dimensions.
   Create opens /builder; Open and Copy link use the existing public product URLs.
   No edit/delete actions or default ownership claims for old rows.
9. Protect /builder and /my-products after auth restoration. Creation CTA now sends
   signed-out artisans through login. Add bearer tokens to private browser requests;
   public product fetching never requires them. Disable duplicate submissions.
   Successful sign-out navigates to / and unmounts private content immediately;
   direct navigation, Back and refresh cannot reopen a signed-out workspace.
10. Use automatic refresh for expired sessions. If a save still returns 401, keep
    the draft visible and offer sign-in recovery; do not discard the form through
    an automatic page reload. Clear private product/profile state on explicit
    logout or account change so another account cannot see a stale list.
11. Register the new handler in dev/localApi.ts and every introduced page in
    vercel.json. Do not rewrite /api/* or static video/caption assets to index.html.
12. Update scripts/verify-backend.ts: writes now need an explicitly supplied test
    session; it must not silently fall back to anonymous saves or an auth bypass.
    Keep verify:demo read-only/public. Tests that create records say so clearly;
    keep test tokens in ignored local configuration, never source files/output.

**Legacy demo ownership:** old rows remain owner_id = null and keep public URLs.
They will not appear in My products. To demonstrate a dashboard, sign in and create
a NEW product. Never assign all old rows to the first signup or match by WhatsApp.
Any later ownership backfill must be a separate trusted admin operation on an
explicit reviewed ID list, never a public claim endpoint.

**Gate:** use two accounts A/B and a signed-out browser. A's new product appears
after refresh/relogin only in A's dashboard; B's own dashboard is independent.
Unauthenticated writes, forged owner fields, invalid/foreign-project tokens and
referencing another user's upload folder are rejected. Direct browser table/bucket
writes remain denied. Public GET of A's buyer link is intentionally allowed for B
and signed-out visitors. Existing demo URLs, images, finish query and WhatsApp still
work. Add meaningful token/ownership tests and complete real-account checks;
passing mocks alone does not prove hosted ownership protection.

### Milestone 13: minimal artisan profile and useful defaults

**Status:** implemented locally, migration applied, live account/privacy/default
checks and responsive viewport checks passed. User phone acceptance pending.
See [Milestone 13](MILESTONE_13.md).

**Outcome:** an artisan saves a business/display name and WhatsApp number once.
New builder drafts can use that contact number; published products keep their
existing snapshot and configuration links.

**Owners:** Person 3 owns profile migration/API/validation. Person 2 owns profile
form and builder integration. Person 4 writes labels/help text. Person 1 verifies
materials, price and buyer behavior are unchanged.

**Explain this separate schema addition before implementing:**

| profiles column | Definition |
| --- | --- |
| id | UUID primary key referencing auth.users(id), ON DELETE CASCADE |
| display_name | Required trimmed text, 1-80 characters |
| whatsapp | Required sanitized international number, 8-15 digits, no leading zero |
| updated_at | timestamptz, default now(); server sets it on each successful save |

Enable RLS, revoke anon/authenticated access, and grant the server role only the
needed profile operations. Keep the API-only ownership checks from Milestone 12.
No auth-user trigger is needed: first successful profile save inserts the row.
An account with no profile can still create a product by entering its number.

**Files:** supabase/migrations/20261008000300_artisan_profiles.sql, server/profiles.ts,
api/profile.ts, src/types/profile.ts, src/pages/ProfilePage.tsx; update browser
helpers, BuilderPage, private navigation, localApi, route rewrites and tests.

**Steps:**

1. Create/apply the small table migration; never store passwords or duplicate
   auth email in this table. No public profile/storefront endpoint.
2. GET /api/profile returns the verified user's row or { profile: null }.
   PUT accepts only displayName and whatsapp, validates them, and upserts with
   id = verified user.id. Reject attempts to choose another profile/account ID.
3. Provide two editable fields, Save, and clear loading/saving/success/error states.
   Allow reading the signed-in email from Auth if useful, but keep it read-only
   and private. No avatar uploads, biography or additional onboarding screens.
4. On a fresh builder draft, prefill a blank WhatsApp field from the saved profile.
   Do not overwrite manual input if the profile request arrives late. Do not
   require profile completion before using the builder; missing/failed profile
   loading leaves the normal manual-entry path available.
5. A profile update affects future drafts only. Keep the existing per-product name,
   WhatsApp, images and prices. Show that behavior in profile help text so an
   artisan does not assume changing their contact rewrites every published order
   link. Product-wide contact editing is outside this extension.
6. Clear profile caches on logout/account switch. Reuse sanitizeWhatsApp; avoid
   another phone-validation rule. Update the local and Vercel routes together.

**Gate:** A's saved profile survives refresh; B cannot read/update it through
private endpoints or guessed request IDs. B's empty profile is genuinely empty.
New drafts prefill the right account's number without replacing typed values.
Old product contact/configuration remains unchanged. A failed profile request
does not prevent a valid manual product save. This is a private account-settings
page, not a public artisan directory.

### Milestone 14: regression, updated demo and renewed freeze

**Current status:** feature freeze requested; recording and remaining manual
acceptance delegated. See [the freeze record](MILESTONE_14.md) and
[recorder's guide](../pitch/ONE_MINUTE_VIDEO_GUIDE.md). Manual acceptance is not
marked complete merely because feature work has stopped.

**Outcome:** the extension is integrated without losing the original buyer demo.
Fix blocking failures; finish feature work before presentation rehearsal.

**Owners:** all four. Person 3 runs security/data checks, Person 2 runs the full
user journey, Person 1 checks phones/viewer, Person 4 updates pitch and recording.

**Steps and gate:**

1. Run the common commands below and meaningful auth/ownership/profile tests.
   Use two real accounts plus private browsing for hosted acceptance.
2. Verify signup -> email -> sign-in -> profile -> create -> upload -> save ->
   My products -> logout -> sign-in -> saved product. Confirm correct ownership.
3. Verify buyer link while signed out -> rotate -> marble -> price -> dimensions
   -> WhatsApp -> reopen configuration. Repeat old ownerless and new owned links.
   No login prompt should interrupt this journey.
4. Test direct URL refresh on every route; initial auth loading; confirmation links;
   slow/offline API responses; session expiry during editing; account switching;
   file-size/type limits and a failed texture's color fallback. Public assets
   remain public by design; account emails/passwords/tokens/profile rows do not.
5. Check the home page, forms, dashboard, profile and buyer page on the real phone.
   Check touch/keyboard controls, price readability, video captions/sound and
   private-session data clearing. Build output must contain no server secret.
6. Update README, milestones, demo IDs and pitch to the ACTUAL implemented scope.
   The existing 4:25 movie predates account screens; label its scope accurately
   until a replacement is recorded. Record the updated account journey and the
   actual phone WhatsApp hand-off; retain the older usable backup.
7. Keep the exact buyer story central. Account/profile setup can be a short
   introduction; do not spend most of the pitch signing up or waiting for email.
   Prepare confirmed demo accounts before the presentation.
8. Renew the feature freeze. Gate passes only when both accounts and the public
   buyer flow work with hosted data, and the backup recording plays offline.

### Milestone 15: public delivery and final rehearsal

**Current status:** GitHub release uploaded; Vercel runtime repair/acceptance in progress. Follow
[the delivery checklist](MILESTONE_15.md). The confirmed GitHub repository is
[Charles-DEV-1/Showroom_3D](https://github.com/Charles-DEV-1/Showroom_3D);
the user has created the Vercel project. Verify the repaired API deployment
before signing off the public demo.

**Outcome:** the tested app is accessible through public HTTPS URLs and the same
journey works outside the laptop's Wi-Fi network. This follows local acceptance;
the plan itself does not publish, push or change external settings.

**Owners:** Person 3 configures backend/env/auth; Person 2 owns route/build
configuration; Person 1 tests hosted viewer/mobile assets; Person 4 rehearses.

**Steps and gate:**

1. At implementation time, identify the team's GitHub repository and Vercel
   account/project. Check the actual remote destination before pushing; do not
   reuse another checkout's remote or publish secrets/ignored recording sources.
2. Push only the reviewed implementation and required public video assets. Keep
   .env.local, session tokens, SMTP credentials and artifacts/ out of Git.
3. Deploy a Vercel preview first with the existing four Supabase env variables.
   The public key is browser-safe; SUPABASE_SECRET_KEY remains server-only.
   Apply forward SQL to the intended project before deploying dependent APIs.
4. Configure Auth Site URL and exact callback redirect allowlists for the
   tested HTTPS origin. Set the final Site URL when the production domain is
   chosen. Keep local redirects only where still needed for development.
5. Use production URLs in emails, demo links and WhatsApp messages. The current
   origin determines configuration links; localhost/LAN recording links are not
   public links. Test email confirmation from the actual deployed origin.
6. Refresh /, /builder, /my-products, /profile, /login, /signup,
   /auth/callback and /product/:id directly. Verify new functions
   return JSON, while video/poster/VTT return their assets, not the SPA HTML.
7. Repeat A/B ownership checks, signed-out buyer flow, phone WhatsApp hand-off and
   captioned video playback on the preview. Then publish production when instructed
   and repeat a focused check against the final domain; preview success alone
   does not prove production env, routing or Auth redirects.
8. Rehearse with the public link, confirmed account and an offline backup on two
   devices. Gates: public app works away from local Wi-Fi, correct configuration
   is restored, credentials stay private, and pitch matches what is available.

### Common local commands for every extension gate

Run from C:\Users\ozebo\Desktop\Backup_Showroom 3D. Keep your existing dev server
if it is running; do not start another copy on port 5173.

```powershell
# Only when the server is stopped:
npm.cmd run dev

# In a second terminal, after a milestone's code is ready:
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run verify:demo
```

Add real auth/account acceptance checks when Milestones 11-13 exist. Existing
22-test coverage was for the earlier core; it does not already prove the new
features. npm run preview serves frontend output only; use npm run dev for the
local API. Restart Vite after changing local API handlers/configuration as needed.
Exact new files and migration commands will be supplied during each implementation
milestone. No new dependency install or SQL execution is part of this guide edit.

## Exact demo and pitch

On a phone: open polished product -> rotate -> select Carrara Marble -> show
material change -> show price update -> show dimensions -> tap WhatsApp ->
show pre-filled message -> show configuration URL -> open link -> same finish.

If asked about missing 3D files:
"They don't need one. They start from a template, adjust dimensions, add finishes,
and publish in minutes. If they already have a 3D model, they can upload it.
Photo-to-3D scanning is on our roadmap."

Until optional upload is actually working, say it is planned bonus support,
rather than claiming it is available. Always describe shape-built furniture as
stylized approximations. The value is spatial understanding, scale, finish
confidence, clear prices and fewer ordering misunderstandings. No scanning or
photorealism claims. If pre-generated GLBs are ready, use them only after core
MVP works; do not spend integration time creating an AI pipeline.
