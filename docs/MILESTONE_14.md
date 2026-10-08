# Milestone 14: recording handoff and feature freeze

**Feature freeze: October 8, 2026, requested by the user.**
The implemented MVP and account/profile extension are frozen. No new features,
dependencies, templates, recovery flows or database changes are planned for
delivery. Deployment configuration and fixes for demonstrated blocking failures
remain allowed; rerun relevant checks after any such fix.

## Recording and acceptance handoff

The user assigned recording and the remaining manual acceptance to another
person. Give them [the one-minute recording guide](../pitch/ONE_MINUTE_VIDEO_GUIDE.md).
It contains preparation, a timed 60-second storyboard, exact narration, editing
instructions and a delivery checklist. The guide is ready; **the new video has
not been recorded by this handoff**. Keep the older 4:25 backup, which predates
the account/profile extension and shows a WhatsApp message preview.

The assignee should also complete these checks outside the short video:

1. With two accounts: profile save/refresh, create/upload/save, My products,
   logout to home, direct protected URL, and login again. Confirm neither account
   sees the other's private profile or product list.
2. While signed out: open both an older demo URL and the new owned product URL,
   rotate, select Marble, check price/dimensions, open actual WhatsApp and restore
   the configuration link.
3. On a real phone: navigation, keyboard/form layout, touch controls, viewer,
   readable prices and video sound/captions. Confirm the final recording plays
   offline. Use the Milestone 12 and 13 checklists for details.

Manual phone and recording results remain pending the assignee's report. A
feature freeze does not certify those checks or a hosted Vercel deployment.

## Freeze verification

Rechecked on October 8, 2026:

- `npm.cmd run build`: passed, including TypeScript compilation.
- `npm.cmd run lint`: passed.
- `npm.cmd test`: all **33 tests passed**.

The existing deferred 3D bundle still produces Vite's large-chunk warning; the
build completes successfully. Earlier Milestone 13 evidence covers live
two-account API/browser privacy and defaults, with desktop phone-size layouts.
Those checks do not substitute for the assignee's actual phone acceptance.

No application source changed for this handoff. Documentation now reflects
working login, My products and private profiles. No GitHub push or Vercel
deployment occurred as part of the freeze.

## Next

[Milestone 15](MILESTONE_15.md) is the active delivery preparation stage.
The user has a GitHub repository and plans to create the Vercel project after
the GitHub upload. The user subsequently confirmed
[Charles-DEV-1/Showroom_3D](https://github.com/Charles-DEV-1/Showroom_3D)
as the delivery repository. The repository was inspected as empty before
preparing its initial release. See Milestone 15 for delivery setup.
