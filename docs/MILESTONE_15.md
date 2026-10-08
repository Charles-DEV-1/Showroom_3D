# Milestone 15: GitHub, Vercel and final rehearsal

**Status: frozen release prepared for GitHub; Vercel deployment pending.**
Features are frozen under [Milestone 14](MILESTONE_14.md). The user already has
a GitHub repository and will create the Vercel project after the upload.

**Confirmed repository:** [Charles-DEV-1/Showroom_3D](https://github.com/Charles-DEV-1/Showroom_3D).
The initial inspection found an empty public repository with default branch
`main`. The frozen app, README, demo assets and setup guides are the initial
release scope. Secrets and ignored production-recording sources stay local.

## 1. GitHub handoff

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
