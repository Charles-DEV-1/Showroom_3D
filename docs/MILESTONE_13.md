# Milestone 13: minimal profile and responsive artisan pages

Implemented at the user's request alongside responsive improvements. The private
profiles migration was run by the user and verified against the hosted project.
Complete the manual checklist below before moving to regression/demo rehearsal.

## What works

**Profile** in the signed-in header opens `/profile`. Save your business/display
name and an international WhatsApp number. Your account email is read-only and
comes from Supabase Auth; it is not copied into the profiles table.

A new builder draft fetches your saved profile and fills its blank WhatsApp input.
It preserves anything already typed, including when the profile request arrives
late. A missing profile leaves the normal manual-entry flow available. A failed
profile request shows a short hint and does not block creating a product with a
manually entered number. Profile edits affect future drafts; existing published
products keep their own saved contact and configuration links.

The profile is private, using the same verified-account API boundary as My products.
Account switching/logout unmount the old account's pages and their state. No public
artisan directory, avatar, extra signup step or password-recovery feature is added.

## Responsive behavior

- Phone navigation uses two columns of visible links/buttons, with active-page
  highlighting and at least 44 px touch targets. It wraps without clipping.
- Profile fields stack on phones and sit side by side when space allows. The
  Save button fills the phone width. Inputs stay 16 px, including read-only email.
- My products uses a grid that adapts to the available width, with a single
  column on small phones and additional columns when space allows.
- Cards wrap long product names, dimensions and large prices. Open/Copy actions
  stay aligned and usable; image frames adapt to the card width.
- Page/card padding scales with viewport width. Small-screen Create actions fill
  their available width. Login/signup screens use the same spacing/touch rules.
- Headings and status/error messages wrap; builder preview prices can move to
  another line on narrow screens instead of forcing horizontal scrolling.

## Database and API

`supabase/migrations/20261008000300_artisan_profiles.sql` is already applied here.
It creates a separate table without changing products or their owners:

| Column | Definition |
| --- | --- |
| `id` | UUID primary key, references auth.users(id), ON DELETE CASCADE |
| `display_name` | Required trimmed text, 1–80 characters |
| `whatsapp` | Required international number, sanitized to 8–15 digits |
| `updated_at` | timestamptz, defaults to now(); server updates it on save |

RLS is enabled. Direct public/anon/authenticated table access is revoked; only
the server role receives select/insert/update. The API verifies the caller and
filters/upserts by that verified ID. Profile input accepts only displayName and
whatsapp; a supplied account ID, email or timestamp is rejected.

| Endpoint | Contract |
| --- | --- |
| `GET /api/profile` | Requires artisan session; `{ profile: ArtisanProfile or null }` |
| `PUT /api/profile` | Requires artisan session; accepts `{ displayName, whatsapp }`, returns saved profile |

No profile row is invented for a new account. The first successful save creates it.
Public buyer responses continue using their original Product JSON contract.

## Files and responsibilities

| Files | Responsibility |
| --- | --- |
| `server/profiles.ts`, `api/profile.ts` | Private profile validation and storage |
| `src/types/profile.ts` | Small shared profile/input types |
| `src/pages/ProfilePage.tsx`, `ProfilePage.css` | Responsive private form, load/save/error/retry states |
| `src/pages/BuilderPage.tsx` | Safe optional profile contact defaults |
| `src/pages/MyProductsPage.css` | Adaptive cards, grid, actions and text wrapping |
| `src/App.css`, `src/components/auth/AuthForm.css` | Responsive navigation, account forms and touch targets |
| `src/App.tsx`, `src/auth/navigation.ts` | Protected profile route, header link and safe login return |
| `src/lib/api.ts`, `dev/localApi.ts`, `vercel.json` | Shared private requests and local/future-hosted routing |
| `tests/profiles.test.ts` | Contact/identity validation and unauthenticated request rejection |
| `scripts/check-supabase.ts` | Includes the private profiles table in the setup check |

Person 3 owns migration/API; Person 2 owns the form, navigation and builder defaults.
Person 4 reviews copy and phone layout; Person 1 verifies the viewer still works.

## Run locally

If Vite is already running, refresh it. Otherwise:

```powershell
Set-Location 'C:\Users\ozebo\Desktop\Backup_Showroom 3D'
npm.cmd run dev
```

Sign in at **http://localhost:5173/login**, then open **Profile** or **My products**.
No new dependencies or environment variables are needed. A fresh Supabase project
must run the original setup migration, ownership migration and this profile
migration in order; the current project already has all three.

Checks:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run check:supabase
```

## Manual acceptance checklist

1. Save your name and WhatsApp number in Profile, refresh, and check they remain.
2. Open a new builder draft: its WhatsApp field must use your saved number. Enter
   another number manually and confirm your choice remains.
3. Change your profile number. Open an existing published product: its contact
   stays the same. Open a new builder draft: it gets the updated default.
4. Check Profile and My products on your real phone in portrait and landscape.
   Fields/actions must be readable, tappable and free of horizontal scrolling.
5. Check a long product name and several saved products on a tablet/laptop.
   Cards should form an appropriate grid; Open and Copy link must work.
6. Sign out: land on the home page. Direct `/profile` and `/my-products` links
   must require login. A second account must have independent profile/products.

## Verification

Browser checks passed at **320, 360, 390, 480, 600, 768, 1024 and 1440 px**, with
real temporary saved products, a 120-character unbroken name and NGN 1 billion
base price. There was no horizontal overflow, and tested controls met the 44 px
touch target. Two temporary Supabase accounts tested profile save/refresh,
account separation, rejected forged IDs, denied direct table reads, contact
prefill and a deliberately delayed profile request preserving manual input.
Changing a profile preserved a published product's WhatsApp number. Protected
routes, logout-to-home, uploads/saving and public buyer configuration also passed.

Build/type checking, lint and all 33 tests passed. The temporary accounts,
profiles, products and uploads were removed afterward; original profile/product
counts were restored. No email was sent and no deployment was performed.

Next: **Milestone 14**, full regression and an updated demo recording. Real-device
playback, keyboard behavior and WhatsApp hand-off still need the team's phone check.
