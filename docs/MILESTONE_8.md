# Milestone 8: demo preparation and code freeze

## Scope

The local core MVP is ready for rehearsal. This checkpoint adds preparation
material and a read-only verification command, not more product features.
GLB upload remains optional and unimplemented. GitHub and Vercel remain deferred
until the local phone journey passes, as requested.

Keep **Marble Dining Table** as the main product. Two existing saved products
provide supporting examples. The initial preparation reused existing saves.
The follow-up full recording creates one real table with its photo/texture
uploads so the builder -> save -> buyer journey is genuine. That recorded table
is now the main demo; the earlier table remains available at its existing URL.

| Use | Saved product | Starting configuration |
| --- | --- | --- |
| Main demo | 4488d2dd-288d-4248-a411-115158420880 | Walnut + Charcoal: 150000 NGN; select marble for 175000 |
| Supporting table | 3f3172c7-7e8c-474c-9fa2-a194dea5a666 | Walnut + Charcoal: 150000 NGN |
| Supporting bed | d68bf1dd-08f6-4503-9107-ddb5142d9b5e | Ivory + Walnut: 220000 NGN |

The bed has no reference photo. Keep the main table as the polished demo.
Prices, dimensions and photos are demo data, not real inventory verification.

## Files prepared

| File | Purpose |
| --- | --- |
| scripts/demo-products.json | IDs of existing saved products and main finish selection |
| scripts/verify-demo.ts | Read-only API, images, URL, price and WhatsApp message checks |
| pitch/DEMO_SCRIPT.md | Exact 12-step phone story, known device behavior and backup instructions |
| pitch/PITCH.md | Spoken pitch, slide outline, Q&A and rehearsal ownership |
| artifacts/demo/showroom-full-demo.mp4 | Longer Full HD narrated builder-to-buyer walkthrough |
| artifacts/demo/showroom-full-demo.srt | Optional English narration captions |
| artifacts/demo/showroom-browser-rehearsal.webm | Offline recording of the real browser flow at phone width |
| artifacts/demo/01-walnut.jpg through 05-restored-configuration.jpg | Still images from that recording |
| artifacts/demo/order-message.txt | Actual generated message for the recorded configuration |
| artifacts/demo/README.txt | Recording scope and real-phone hand-off |
| artifacts/demo/production/timeline.json | Narration timings, chapter labels and recorded product details |
| artifacts/demo/production/order-message-preview.html | Clearly labeled preview of the exact generated message |

artifacts/ is ignored by Git and is not part of the deployed app. Keep a separate
copy of the recording on the presentation laptop. Existing asset credits remain
in public/demo/PHOTO_CREDIT.md and TEXTURE_CREDIT.md.

## Run the local rehearsal

If the existing server is stopped, start it:

```powershell
Set-Location 'C:\Users\ozebo\Desktop\Backup_Showroom 3D'
npm.cmd run dev
```

In a second terminal, verify saved products without creating more:

```powershell
npm.cmd run verify:demo
```

The command must report the main and two supporting products, followed by passed
checks for public images, finish URLs, prices and order messages. It reads the
existing .env.local configuration and requires internet for Supabase. It sends
no WhatsApp messages and performs no database or Storage writes.

Open this starting link on the laptop:

http://localhost:5173/product/4488d2dd-288d-4248-a411-115158420880?finish=walnut&secondary=charcoal

For your real phone, use Vite's Network address instead of localhost, with the
same product path and query. Both devices must be on the same reachable network.
Allow Node on the private network if Windows prompts. Keep the laptop awake.

You can also run the check against that Network address:

```powershell
# Replace this example address with the Network URL printed by your Vite server.
npm.cmd run verify:demo -- --base-url http://192.168.1.20:5173
```

Do not copy a localhost configuration link onto the phone. Opening the product
through the Network address makes the app generate matching Network URLs for
WhatsApp. These local URLs are reachable only on that network; they are not
public product links until deployment.

## Acceptance checklist

- [x] Read-only verify:demo passes against the existing local API and hosted Supabase.
- [ ] Main product opens on the real phone with no sideways scrolling.
- [ ] Rotation and pinch zoom work; finish changes keep the viewing angle.
- [ ] Walnut starts at 150000; Carrara Marble changes model and total to 175000.
- [ ] Dimensions display 180cm x 90cm x 75cm.
- [ ] WhatsApp opens on the phone with product, both finishes, price, dimensions
      and a Network configuration URL. Sending is optional.
- [ ] Open or copy/paste that configuration URL; marble and price are preserved.
- [ ] Full phone recording includes all 12 steps from pitch/DEMO_SCRIPT.md.
- [ ] The backup recording plays offline and a second copy is available.
- [ ] Pitch rehearsed with the correct scope: stylized preview, model upload
      planned, photo-to-3D roadmap, no payments/accounts/order confirmation.
- [ ] Freeze product features. Only fix problems that prevent the agreed demo.

The narrated movie uses captured real app screens and rotation sequences with
presentation framing, narration and readable pauses. Its order-message screen
shows the actual generated text, clearly labeled as a preview. It does not show
WhatsApp opening. Full phone recording and the app hand-off remain manual checks.

## Verification completed

- Three existing products and their public images were fetched successfully.
- Main table selection, 175000 NGN total and order message match its saved URL.
- Browser recording shows touch rotation, selected marble and restored selection
  at a 390px viewport, with no normal application errors.
- The longer follow-up MP4 plays at 1920 x 1080 / 25 fps, with a separate AAC
  narration track. Duration: 4 minutes 25 seconds; file size: about 6.2 MB.
  It uses 68 captured app frames/rotation frames and 28 narrated scenes.
  Video playback and audio decoding were checked; the new main product also
  passes verify:demo. Chapter labels and optional SRT captions aid rehearsal.
- The 390 x 914 WebM clip decodes and seeks successfully in Chrome from local
  bytes. Playback requires no connection to the app or Supabase.
- All 22 tests, lint and the TypeScript/production build pass. The build retains
  the existing size notice for the Three.js viewer bundle.
- No app server was started/stopped and no messages were sent. The follow-up
  longer movie creates one real product and its photo/texture uploads. GitHub
  and Vercel delivery were not performed.

Once this gate passes, Milestone 9 is pitch rehearsal only. Do not add major
features. Public deployment remains a separate step when the team is ready.
