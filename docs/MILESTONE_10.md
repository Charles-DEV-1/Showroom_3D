# Milestone 10: landing page and embedded demo

Status: implemented locally and checked in Chrome, including a 390 px phone-sized
viewport. Complete the manual checklist below before starting Milestone 11.
No database migration, account requirement, deployment or new dependency is part
of this milestone.

## What was built

The home route `/` now explains ShowRoom 3D and offers two actions:

- **Try the demo:** opens the actual saved dining table with Walnut and Charcoal
  selected. Changing to Carrara Marble changes the price from NGN 150,000 to
  NGN 175,000, with the selection preserved in the URL.
- **Create furniture:** opens the existing `/builder` with its seven templates.

The opening visual is a silent 12-second recorded loop of the actual saved table:
one full rotation, Walnut to Carrara Marble at 4 seconds, and back to Walnut at
8 seconds. It is approximately 406 KB, with a 22 KB poster. It starts muted and
plays inline; Pause/Play lets visitors control the motion. Reduced-motion users
see the poster until they explicitly press Play. If playback fails, the poster
remains visible. The landing page still loads no Three.js viewer.

The page also includes three workflow steps and the existing 4:25 Full HD narrated
walkthrough. This separate video has a poster and
English captions. It starts only after pressing Play; native controls allow
pause, seeking, volume, captions and fullscreen where supported by the browser.
There is no narrated-walkthrough movie request before pressing Play. The small
silent hero loop loads on opening the page unless reduced motion is enabled.

The recording shows the real application and a labeled preview of its generated
WhatsApp message. It does not show the WhatsApp app itself. The furniture models
remain stylized approximations; the buyer's reference photo still has its
separate attribution.

The brand link returns to `/`. Builder and buyer pages load on demand using
React.lazy/Suspense, so the home page does not request the Three.js viewer.
A failed page download offers a reload button. Existing product URLs and
`/builder` continue working, including direct navigation and refresh.

## Files and ownership

| File | Responsibility |
| --- | --- |
| `src/pages/LandingPage.tsx` | Home page content, real demo link, video playback |
| `src/pages/LandingPage.css` | Responsive page styles, scoped to the landing page |
| `src/App.tsx` | Home route, brand navigation, lazy 3D pages and loading/error states |
| `tsconfig.app.json` | Allows importing the existing shared demo JSON |
| `scripts/demo-products.json` | Existing source of truth for the saved demo product ID |
| `scripts/prepare-demo-media.mjs` | Copies final media and converts SRT captions to WebVTT |
| `public/demo/showroom-full-demo.mp4` | Browser-ready narrated video, approximately 6.2 MB |
| `public/demo/showroom-full-demo-poster.jpg` | Poster before playback |
| `public/demo/showroom-full-demo.vtt` | 28 English caption cues |
| `public/demo/showroom-table-loop.mp4` | Silent 12-second rotation and finish preview |
| `public/demo/showroom-table-poster.jpg` | Actual table frame, used while loading or with motion disabled |

Person 2 owns landing code and App.tsx. Person 4 reviews copy and presentation;
Person 1 checks phone playback and viewer performance; Person 3 verifies the real
demo remains available. Coordinate changes to the shared demo JSON with Person 4.

The original recordings and a copy of the previous App.tsx, README and team guide
remain in ignored `artifacts/`. Only final public media is included in app builds.
The media preparation script was already run; playback does not need the original
recording files at runtime.

## Run locally

If the Vite server is already running, open the home URL below. Otherwise run:

```powershell
Set-Location 'C:\Users\ozebo\Desktop\Backup_Showroom 3D'
npm.cmd run dev
```

Open **http://localhost:5173/**. Use the Vite Network URL on a real phone on the
same trusted Wi-Fi. Supabase still needs Internet connectivity for product fetch,
save and uploads. Open the app through Vite rather than opening dist/index.html.

If you replace the recorded demo later, regenerate its public assets:

```powershell
node scripts/prepare-demo-media.mjs
```

This expects the existing MP4, poster and SRT under `artifacts/demo/`. It copies
the final files into `public/demo/`; it does not re-record or re-encode the movie.

Run the project checks in another terminal:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Vite copies the public video, poster and captions into `dist/demo/`. Its preview
server serves only the frontend; keep using `npm.cmd run dev` to test API flows.

## Acceptance checklist

1. Open `/` on a laptop and a real phone. Check readable text, visible buttons,
   rotating table and no horizontal scrolling. Check Pause/Play. With reduced
   motion enabled in the device's accessibility settings, check that the table
   stays still until Play is pressed.
2. Press **Play the walkthrough**. Listen to the narration, pause/resume, seek
   forward, and enable English captions using the player's controls. Check phone
   playback and fullscreen if the phone offers it. Headless checks cannot confirm
   audible sound or a real device's native fullscreen controls.
3. Press **Try the demo**. Rotate the furniture and check the starting price is
   NGN 150,000. Choose Carrara Marble; check NGN 175,000 and the marble appearance.
4. Refresh and copy/open the configuration URL. The selected finish must remain.
   Tap **Order via WhatsApp** on the phone; inspect the pre-filled message and
   configuration URL. Sending the message is unnecessary for this check.
5. Return through the ShowRoom 3D brand link. Press **Create furniture**. Check
   that all seven templates, inputs and live preview work, including refresh.
   Your previously tested save/upload flow remains available at `/builder`.
6. In the browser Network panel, reload `/` before pressing Play. No
   narrated-walkthrough movie or viewer page/chunk should load. The small
   `showroom-table-loop.mp4` is expected to load for the opening visual. After
   pressing Play the walkthrough, its separate movie loads normally.

Automated browser checks passed for playback, native controls, parsed captions,
desktop/phone-sized layout, both actions, buyer finish pricing, configuration
reload, WhatsApp URL generation, and builder navigation/refresh. They used the
real saved product without creating a product or sending a message.

The production build also passed a separate phone-sized playback/caption check.
Network inspection confirmed that an idle production home page requests neither
the narrated movie nor the viewer bundle. Its three built walkthrough files
match their public sources. TypeScript/build, lint and all 22 existing tests passed; a bundle scan
confirmed that the configured server secret is absent from client JavaScript.

The silent hero clip was recorded from the same saved table's actual viewer,
without changing products or adding a live 3D renderer to the home page. Source
frames and capture metadata remain in ignored `artifacts/hero-loop/`; the final
MP4 and poster are public assets. Replace those two public files together if you
change the opening furniture preview. Keep it silent and small, ideally with a
square frame so the responsive layout keeps the furniture visible.
The hero's autoplay, pause/resume, reduced-motion behavior, explicit playback,
and playback-failure poster passed browser checks; both hero assets were also
verified identical in the production build.

When this checklist passes, proceed to **Milestone 11: simple artisan
authentication**, including its Supabase email-delivery and callback preflight.
Do not start ownership/profile changes until their separate milestone gates.
