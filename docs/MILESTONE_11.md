# Milestone 11: simple Supabase sign-up and sign-in

Scope revised at the user's request: email/password sign-up, sign-in, sign-out
and normal Supabase session persistence only. Forgot password, password recovery,
social login and custom token flows are outside this MVP.

Status: implemented locally; the user has tested sign-in/sign-out. Milestone 12
now adds workspace/write protection and logout-to-home; see [Milestone 12](MILESTONE_12.md).
The email/account checklist below remains a reference. No database migration or
new dependency was needed for Milestone 11 itself.

## How it works

The header's **Sign in** opens `/login`. **Create an account** opens `/signup`.
The forms use Supabase Auth directly through one shared browser client. Passwords
are never saved in our products table or passed through our product API.

Supabase currently requires email confirmation in this project. Sign-up without
a session displays a check-email message. The confirmation link returns through
`/auth/callback`; the SDK handles it, then the page clears credentials from the
address and opens `/builder`. Sign-in uses email/password and also opens the
builder. Refresh restores the browser session; the header's Sign out clears it
in that browser. Basic validation and readable errors cover mismatched passwords,
wrong login details, unconfirmed email, email delivery failures and rate limits.

The buyer remains public. Milestone 11 establishes accounts. Product ownership,
My products and protected create/upload endpoints are now implemented in the
following [Milestone 12](MILESTONE_12.md); creation currently requires sign-in.

## Supabase setup before your first account test

The public Auth settings were checked on October 8, 2026: email sign-up is enabled,
sign-up is allowed, and confirmation is required. Dashboard redirect settings and
inbox delivery still need your verification.

1. Open the same Supabase project configured in `.env.local`.
2. Under **Authentication > Sign In / Providers > Email**, keep Email enabled
   and Confirm email enabled. Set the minimum password length to **8**, matching
   the signup form. Supabase's dashboard labels may vary slightly.
3. Under **Authentication > URL Configuration**, set **Site URL** to:

   ```text
   http://localhost:5173
   ```

4. Add this exact entry to **Redirect URLs** and save:

   ```text
   http://localhost:5173/auth/callback
   ```

5. For a real phone, also add `/auth/callback` for the actual Network URL Vite
   prints. For example, if it prints `http://192.168.1.10:5173`, add
   `http://192.168.1.10:5173/auth/callback`. That is an example address; use YOUR
   laptop's printed address. Start signup from that same origin on the phone.
6. Under **Authentication > Emails > Templates**, leave Confirm signup using
   the standard link `{{ .ConfirmationURL }}`. Supabase validates that link
   and redirects to the allowlisted URL supplied by our signup form.
   Do not replace it with a plain link straight to the builder.

For the first local MVP check, **use an email address already belonging to your
Supabase project team**, such as the address you use for its dashboard. Create a
new ShowRoom password; dashboard organization membership and application Auth
accounts are separate. Check the organization's Team page to verify membership.
The built-in sender currently allows those recipients only and **two messages
per hour per project**. Avoid repeated signup attempts while waiting for mail.
[Supabase's SMTP limits](https://supabase.com/docs/guides/auth/auth-smtp).

## Email delivery for other artisans

Before inviting addresses outside that project team, configure custom SMTP in
Supabase's **Authentication > Emails > SMTP Settings**. Use your email provider's
SMTP credentials and verified sender; this does not add an email server or SDK
to the app.

| Dashboard field | Value to enter |
| --- | --- |
| Enable custom SMTP | Enabled |
| Sender email | Your provider-approved/verified sender address |
| Sender name | ShowRoom 3D |
| Host | SMTP host supplied by your email provider |
| Port | Provider's TLS/STARTTLS SMTP port |
| Username | Provider's SMTP username |
| Password | Provider's SMTP password/credential |

Save, check the provider's sending/domain-verification requirements and limits,
then try a signup with a real team-controlled inbox. These credentials belong in
Supabase's dashboard, never `VITE_` variables or source files. No additional
application environment variables are needed.
[Supabase's custom SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp).

## Files and responsibilities

| File | Purpose |
| --- | --- |
| `src/lib/supabase.ts` | Single public browser client, SDK-managed sessions |
| `src/auth/AuthProvider.tsx` | Initial session restoration and auth-state subscription |
| `src/auth/useAuth.ts` | Shared context and hook |
| `src/auth/navigation.ts` | Safe local destination, callback cleanup and readable errors |
| `src/components/auth/AuthForm.tsx` | Shared signup/login form |
| `src/components/auth/AuthForm.css` | Responsive form and account-header styles |
| `src/pages/LoginPage.tsx`, `SignupPage.tsx` | Basic account routes |
| `src/pages/AuthCallbackPage.tsx` | Finish signup confirmation; handle invalid links |
| `src/main.tsx`, `src/App.tsx` | Provider, lazy page routes, Sign in/Sign out header |
| `src/lib/api.ts` | Signed uploads now reuse the shared browser client |
| `vercel.json` | Future direct-route rewrites for login/signup/callback |
| `tests/auth.test.ts` | Credential cleanup, redirect safety and error handling checks |

Person 2 owns forms, header and routing. Person 3 owns Supabase dashboard setup
and the shared browser client. Person 1 verifies buyer/viewer behavior; Person 4
reviews the labels and demo flow. Coordinate edits to App.tsx with Person 2.

## Run and check

If Vite is already running, use its existing URL. Otherwise:

```powershell
Set-Location 'C:\Users\ozebo\Desktop\Backup_Showroom 3D'
npm.cmd run dev
```

Open **http://localhost:5173/signup** or use Sign in in the home header.
No extra package install or SQL step is required. In another terminal:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

## Acceptance checklist

1. Complete URL/email settings above. Register using a real eligible email and
   your own password with at least 8 characters. Do not share the password.
2. If confirmation is enabled, check inbox/spam and follow the received link.
   It must return to the callback, then the builder, with **Sign out** visible.
   Receiving a check-email message alone does not prove email delivery.
3. Refresh: the session must remain. Sign out and refresh: **Sign in** must return.
4. Sign in again using your new ShowRoom credentials. Try a wrong password once
   and check the readable error. Verify signup rejects mismatched passwords.
5. Open the existing buyer configuration while signed out. Rotate the model,
   change finishes, check price and confirm the WhatsApp URL preserves selection.
6. On your real phone, check signup/login layout and the confirmation callback
   using the actual allowed Vite Network origin. Do not use desktop localhost
   links on the phone to reach the laptop.

The automated browser auth check uses intercepted SDK responses in an isolated
Chrome profile to test the form/session/callback behavior without creating real
users or sending email. It also fetches the actual public demo for regression.
These checks do not prove real sign-up, inbox delivery or live password login;
the acceptance checklist above is the milestone gate.

The isolated browser check passed signup validation, confirmation-required state,
wrong-password feedback, successful sign-in, refresh persistence, logout, SDK
confirmation callback, expired-link cleanup and the 390 px phone layout. The real
saved table still loaded signed out at NGN 175,000 with its Marble configuration
preserved in the WhatsApp link. The landing page still deferred the 3D viewer.
TypeScript/production build, all 26 tests and lint passed; the browser bundle scan
found no configured server secret. No real account or email was created during
automated checks.

After these checks pass, move to **Milestone 12: product ownership, protected
writes and My products**. That milestone adds the server checks and owner column.
