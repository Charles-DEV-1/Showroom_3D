# Milestone 15: GitHub, Vercel and final rehearsal

**Status: deployed API import repair verified; final manual acceptance remains pending.**
Features are frozen under [Milestone 14](MILESTONE_14.md). The user created the
Vercel deployment after the GitHub upload. Public origin:
[showroom-3d-brown.vercel.app](https://showroom-3d-brown.vercel.app).

**Confirmed repository:** [Charles-DEV-1/Showroom_3D](https://github.com/Charles-DEV-1/Showroom_3D).
The initial inspection found an empty public repository with default branch
`main`. The frozen app, README, demo assets and setup guides are the initial
release scope. Secrets and ignored production-recording sources stay local.

## GitHub delivery record: October 8, 2026

- Uploaded the initial release to `main` as
  [`5e7f94a`](https://github.com/Charles-DEV-1/Showroom_3D/commit/5e7f94a15f931c44f2382af2edc4197e60b1e5cb).
  Verified the local release commit matches `refs/heads/main` on the exact remote.
- The release contains 103 reviewed files, including the app, migrations, public
  demo media, README, pitch and one-minute recording guide.
- Added and read back the repository description and stack/product topics.
- Staged-content checks found no server key or other detected credential
  patterns; `.env.local`, raw artifacts, dependencies and build output are excluded.
- The app source stays frozen. This delivery record is a documentation update
  following the initial release; the final branch head may therefore be newer.
- No Vercel project was created or deployed by this upload. The user creates it
  next, following the settings and environment-variable table below.

## 1. GitHub handoff

The initial upload is complete; these steps remain the reference for later fixes.

1. Confirm the exact repository URL and inspect its existing contents/branch
   before preparing the upload. Never overwrite existing remote history.
2. Review the implementation and required `public/` assets. Include the
   `package-lock.json`, API handlers, migrations and `vercel.json`.
3. Keep `.env.local`, keys, session tokens, `node_modules/`, `dist/`, `.vercel/`
   and `artifacts/` out of Git. The existing `.gitignore` excludes these.
   Include `.env.example`, which lists variable names without credentials.
4. Upload only the reviewed scope. Record the repository, branch and commit.
   A successful GitHub upload is not a deployment.

Exact Git commands will be chosen after checking the destination; none are
included here with a guessed remote or branch.

## 2. Vercel project setup

After the GitHub upload, import that repository into the user's Vercel account.
The current project configuration is:

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Root directory | Repository root, if this app is uploaded at its root |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 24.x, matching `package.json` |

Preserve `vercel.json`: its rewrites allow direct refreshes on frontend routes,
and the `api/` handlers provide the backend. Do not add a catch-all that turns
API or video requests into the frontend HTML.

Set these four environment variables for the intended deployment environment:

| Variable | Value to copy privately | Where used |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Existing Supabase project URL | Browser |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Existing publishable/anon key | Browser |
| `SUPABASE_URL` | Same Supabase project URL | API only |
| `SUPABASE_SECRET_KEY` | Existing secret/service-role key | API only |

Never prefix the server secret with `VITE_`. The existing project has the
products, ownership and profiles migrations applied; use that same Supabase
project. Do not reapply/edit migrations blindly. Deploy a preview for validation
before treating the public site as ready for the final demo.

## 3. Auth redirects and public links

Once the HTTPS origin is known, configure Supabase Auth's Site URL for the chosen
public site and allow its exact `/auth/callback` redirect. Add the specific
preview callback when testing a preview; retain localhost/LAN callbacks only
if they are still needed. Email confirmation follows the project's settings.
Use a confirmed account for rehearsals; new signup email delivery still needs
the setup described in Milestone 11. Password recovery remains outside scope.

Use the deployed origin for buyer and WhatsApp configuration links. Localhost
and laptop LAN addresses are not public links. Saved product IDs can stay the
same because the database remains the same; change the origin, not the IDs.

## 4. Hosted acceptance

### October 8: TypeScript imports in deployed API functions

The homepage and favicon returned HTTP 200, but product/profile API requests
failed with HTTP 500. The supplied Vercel log identified `ERR_MODULE_NOT_FOUND`:
compiled `api/products/[id].js` still imported `server/http.ts` rather than its
emitted JavaScript file. This was a compilation issue, not a request to change
Supabase keys, schema or data.

The fix adds `compilerOptions.rewriteRelativeImportExtensions: true` to the
**root** `tsconfig.json`, which Vercel reads independently of Vite's project
references. TypeScript then emits relative `.js` imports for the `.ts` sources.
The existing source imports and local Node-based scripts continue to work.
See [TypeScript's option documentation](https://www.typescriptlang.org/tsconfig/rewriteRelativeImportExtensions.html).

`tests/deployment.test.ts` compiles all five API entry points and their imported
dependencies using the root configuration, imports the emitted JavaScript in
Node, and checks safe JSON responses. It reproduced the exact missing `.ts`
module failure before the fix, and passes with the fix. Build, lint and all
**34 tests** passed. No dependencies or database migrations were added.

Push this repair, wait for the corresponding Vercel deployment, and verify the
actual public API before marking the runtime issue resolved. The read-only demo
check can target production:

```powershell
npm.cmd run verify:demo -- --base-url https://showroom-3d-brown.vercel.app
```

Use `/api/profile` while signed out as a boot check: it should return JSON with
HTTP 401 rather than crash with 500. This does not certify signed-in profile
save/read or the rest of the private artisan journey.

**Verified after deployment of repair commit
[`30c78a9`](https://github.com/Charles-DEV-1/Showroom_3D/commit/30c78a9e39ed86060e4fbc7f33aa385717de185f):**
Vercel reported a successful deployment. The main public product API returned
HTTP 200 JSON, and the signed-out profile endpoint returned the expected HTTP
401 JSON. The read-only production demo check passed for all three saved
products, reference images, textures, finish/configuration URLs, prices and
generated order messages.

An isolated signed-out Chrome check at a 390 px phone viewport also verified
actual model rotation, Walnut at NGN 150,000, Carrara Marble at NGN 175,000,
dimensions, the correct deployed configuration URL in the WhatsApp message,
and restoration of the selected finish/price after reopening that URL. The
logo loaded, the page had no horizontal overflow, and no application errors
were recorded. This was browser emulation; actual phone WhatsApp opening,
signed-in hosted artisan acceptance and the delegated recording remain manual.

- [ ] Refresh `/`, `/login`, `/signup`, `/auth/callback`, `/builder`,
  `/my-products`, `/profile` and a real `/product/:id` URL directly.
- [ ] API requests return JSON; media requests return video/image/caption
  assets. Authentication failures return safe errors, not frontend HTML.
- [ ] Login, profile/defaults, upload/save, My products and logout work;
  two accounts remain isolated. Signed-out private routes require login.
- [ ] Public buyer links work without login, including old and new products.
- [ ] On a real phone using mobile data, finish switching, price, dimensions,
  actual WhatsApp handoff and restored configuration work.
- [ ] Confirmation redirects use the tested origin. Video, captions and
  rotating hero preview load correctly. No server secret appears in the bundle.
- [ ] Record final deployment URL and checked commit. After any change of
  production domain/environment, repeat the relevant checks on that origin.
- [ ] The recorder's one-minute video and offline backup are ready; rehearse
  with a confirmed account and the public product link on two devices.

Preview success does not establish production success. Mark delivery complete
only after the selected public HTTPS site passes these checks and the recording
assignee reports the remaining phone/backup acceptance. Avoid adding features.
