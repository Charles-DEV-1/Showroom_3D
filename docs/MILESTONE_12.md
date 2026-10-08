# Milestone 12: protected artisan workspace and My products

Implemented locally. The ownership migration was run by the user and verified
against the hosted Supabase project. A real two-account browser/API check passed;
complete the short manual checklist below with your own account before Milestone 13.

## What changed

- **Sign out returns to the landing page.** The builder/dashboard unmount and
  their private state clears. Opening them again while signed out goes to login.
- `/builder` and `/my-products` wait for session restoration, then require login.
  Refresh works while signed in; signing into another account starts a fresh
  workspace. The landing page's Create action reaches login when necessary.
- The create-product, signed-upload and My products APIs verify the bearer token
  with this project's Supabase Auth server. Changing frontend state or skipping
  the login page cannot authorize those requests.
- Each new product gets the verified artisan's `owner_id` on the server.
  Incoming identity/owner fields are rejected. Each new uploaded image lives in
  `images/USER_UUID/OBJECT_UUID.ext`; new saves accept only that user's image and
  texture paths, with the existing file metadata/size/type checks.
- **My products** queries real saved products for the verified account only:
  latest 100, newest first. It has loading, retry and empty states, base prices,
  dimensions, reference photos, Open product and Copy link.
- Buyer pages and configuration links remain public, including old demos.

This adds no password recovery, profile, product editing/deletion, payment or new
library. Product/profile editing remains outside this milestone.

## Database addition

The existing product JSON contract stays the same. Ownership is an internal
database field; the public product response does not expose it.

| Addition | Definition |
| --- | --- |
| `products.owner_id` | Nullable UUID referencing `auth.users(id)`, ON DELETE RESTRICT |
| `products_owner_created_idx` | Index on `(owner_id, created_at DESC)` |

The forward migration is
`supabase/migrations/20261008000200_product_ownership.sql`. It has already been
applied to the configured project. Do not re-run the original create-table
migration, drop the products table or assign every old row to the first account.

Old products retain `owner_id = null` and their existing public URLs. They do
**not** appear in My products. Create a new product while signed in to test your
dashboard. If an old open draft has a reference photo or texture from before
ownership, upload those images again before saving the new product. Old published
images continue working; they are not deleted or renamed.

RLS remains enabled and direct `anon`/`authenticated` table access stays revoked.
The API's service-role client bypasses RLS, so the private list always applies
`owner_id = verified user.id`. Identity verification never changes that service
client's database credentials. Signed upload tokens authorize only the generated
path, with upsert disabled; direct browser bucket writes remain denied.
[Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security),
[server identity verification](https://supabase.com/docs/reference/javascript/auth-getuser).

## Endpoint behavior

| Endpoint | Access / result |
| --- | --- |
| `POST /api/products` | Verified artisan; server assigns owner; returns the same public Product JSON |
| `POST /api/uploads` | Verified artisan; returns a signed token for their own generated folder/path |
| `GET /api/me/products` | Verified artisan; `{ products: ProductSummary[] }`, own latest 100 only |
| `GET /api/products/:id` | Public; existing buyer response |

Missing/invalid sessions return 401. Auth-service outages return a retryable 503,
with no provider internals or credentials exposed. A private list ignores a
browser-supplied user ID rather than treating it as authority. Browser SDK session
refresh remains automatic; there is no custom token system.

If a save/upload gets a 401 while your draft is open, its error offers **Sign in
again in a new tab**. Use the same account, then retry from the original tab.
The form does not reload itself after an API failure. Explicit logout and account
changes clear the workspace; saved products remain in the database.

## Files and ownership

| Files | Responsibility |
| --- | --- |
| `server/auth.ts` | Verify bearer session with Supabase Auth |
| `server/validation.ts` | Reject forged identity and foreign/legacy image paths for new saves |
| `server/products.ts` | Store verified owner; filter dashboard queries |
| `api/me/products.ts` | Private products-list endpoint |
| `api/products/index.ts`, `api/uploads.ts` | Require authentication before doing work |
| `src/auth/RequireArtisan.tsx`, `src/App.tsx` | Protected routes, identity-keyed workspace, logout navigation |
| `src/auth/navigation.ts`, `src/components/auth/AuthForm.tsx` | Safe builder/dashboard return destinations and explicit re-sign-in |
| `src/lib/api.ts` | Bearer headers on private requests; status-aware errors |
| `src/pages/MyProductsPage.tsx` and its CSS | Real account dashboard and copy fallback |
| `src/pages/BuilderPage.tsx` | Prevent duplicate actions; display sign-in retry after 401 |
| `src/types/product.ts` | Add ProductSummary without changing ProductInput |
| `dev/localApi.ts`, `vercel.json` | Local private handler and future dashboard route rewrite |
| `tests/ownership.test.ts` | Auth verification, owner scoping, credential separation, image/identity rejection |
| `scripts/check-supabase.ts`, `scripts/verify-backend.ts`, `scripts/verify-demo.ts` | Check owner column; require an explicit session for write verification; validate public demos without treating server metadata as create input |

Person 3 owns migration and server/API checks. Person 2 owns routes, dashboard and
builder integration. Person 1 checks the public viewer; Person 4 reviews copy and
the account/create/share demo. Coordinate App.tsx changes with Person 2.

## Run locally

The existing Vite server serves both frontend and the same API handlers used on
Vercel. Supabase remains hosted. If Vite is already running, refresh; otherwise:

```powershell
Set-Location 'C:\Users\ozebo\Desktop\Backup_Showroom 3D'
npm.cmd run dev
```

Open **http://localhost:5173/**. Sign in, then use Artisan studio or My products.
No new dependencies, environment variables or deployment are required.

In another terminal:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run check:supabase
npm.cmd run verify:demo
```

The final two commands check the real configured Supabase project and existing
public demo products. `verify:demo` is read-only.

The optional `verify:backend` script writes one product/upload. It now requires
`SHOWROOM_TEST_ACCESS_TOKEN` from a real signed-in test session in ignored local
configuration, alongside its existing phone/image arguments. It never falls back
to unsigned creation. Do not paste sessions into chat, shell arguments or source.
The normal browser checklist below does not require handling tokens manually.

## Manual acceptance checklist

1. Sign in with your own account, open Artisan studio, upload a new reference
   photo, and save a product. Open **My products**: the new product must appear.
2. Refresh My products. Test Open product and Copy link, including manual copy
   fallback if your phone's HTTP browser does not permit clipboard access.
3. Click **Sign out** from the builder or dashboard. You must land on `/`.
   Use Back, refresh, or enter `/builder` and `/my-products` directly: they must
   require login and display no prior account's private list.
4. Sign into a second test account in another browser/profile. Its list is
   independent. Create a new product there, then sign back into the first account
   and check that only that account's products are listed.
5. Open a copied buyer URL signed out. Finish switching, dimensions, price,
   configuration refresh and the WhatsApp message must still work.
6. Repeat logout/dashboard/buyer checks on your real phone using the Vite Network
   URL. The phone-sized browser check is useful but does not replace this check.

## Verification completed

Build/type checking, lint and all **30 tests** passed. The hosted owner column
and protected local HTTP endpoints were verified. A Chrome check using two
temporary Supabase accounts exercised real sign-in, upload, builder save, private
lists, refresh, account switching, desktop/390 px layouts, logout-to-home, and
public buyer price/configuration restoration. Both unsigned and invalid-token
requests returned 401; forged owners and cross-account images/textures were
rejected; direct anon/authenticated table access and browser storage writes were
denied. The existing public demo still loaded and the service key was absent
from browser bundles.

The temporary accounts were created solely for ownership verification, confirmed
by the admin test setup and removed afterward. This test sent no confirmation
email and makes no new claim about inbox delivery. Its products and uploads were
removed; the original product count was restored. No user's existing product
was reassigned. No GitHub push or Vercel deployment was performed.

After your checks pass, proceed to **Milestone 13: minimal artisan profile and
builder contact defaults**. Keep authentication limited to the agreed MVP scope.
The current recorded walkthrough predates account protection. Milestone 14 will
update the full demo recording; the recorded furniture/buyer sequence still works.
