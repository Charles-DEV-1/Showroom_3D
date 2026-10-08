# ShowRoom 3D: one-minute recording guide

Give this file to the person recording and editing the video. Make a **60-second
video** showing one dining table from artisan creation to the buyer's WhatsApp
enquiry. Record real app screens, then trim the clips and add the narration below.
The timestamps describe the finished edit; recording the actions will take longer.

## Prepare before recording

1. Use a real phone with WhatsApp installed. Enable Do Not Disturb. Record in
   portrait, preferably 1080 x 1920, with readable text. Keep this orientation
   throughout. Record the voice separately in a quiet room.
2. Use a confirmed artisan account. Sign up and confirm the email beforehand;
   keep email delivery and password typing out of the video. Hide private email
   addresses, passwords, notifications and unrelated chats.
3. For a local recording, keep the laptop and phone on the same Wi-Fi and use
   the **Network URL** printed by `npm.cmd run dev`. Do not type `localhost` on
   the phone. Supabase still needs internet. Use the deployed HTTPS URL instead
   when Milestone 15 is ready.
4. Save the artisan's business name and WhatsApp number on **Profile**. The
   supplied demo number is **2349064020804**. It is a real number: open the order
   draft for the recording; sending the message is unnecessary.
5. Prepare a new **Dining table** draft named **Marble Dining Table**. Keep its
   default width **180**, height **75**, depth **90** centimeters, base price
   **150000**, Walnut modifier **0**, Carrara Marble modifier **25000**, and
   Charcoal legs modifier **0**. Builder input order is width / height / depth;
   the buyer displays **180 cm x 90 cm x 75 cm**.
6. Upload `public/demo/dining-table.jpg` as the reference photo. Upload
   `public/demo/marble-texture.jpg` to the Carrara Marble finish for a textured
   tabletop. Wait for both uploads to finish. These are demo reference assets;
   the app does not turn the photo into a model.
7. Capture the builder changes, then save this new product with your own account.
   Keep its new URL for every buyer scene. Leave Walnut selected initially.
   Capture My products after saving. **The old landing-page demo is unassigned
   and will not appear in your account's My products.**
8. Open this same new product URL in a signed-out/private browser for the buyer
   footage. Check Walnut costs **NGN 150,000**, Marble costs **NGN 175,000**,
   textures load, and WhatsApp opens correctly. Rehearse once before recording.

## Scenes and exact words

Read only the quoted words. On-screen labels are optional captions, not extra
spoken lines. Use short cuts between sections; leave model movement and finish
changes at normal speed so viewers can see them happen.

| Time | What to show and do | What to say | Short on-screen label |
| --- | --- | --- | --- |
| 0–4 sec | Show the landing page and its rotating furniture preview. | "Meet ShowRoom 3D: clearer furniture choices, from creation to ordering." | ShowRoom 3D |
| 4–9 sec | Show a brief login-screen clip, then cut to the signed-in Profile page with business name and WhatsApp filled. Hide credentials. | "Artisans sign in and save their business name and WhatsApp number." | Artisan account |
| 9–19 sec | Show Dining table selected in the builder. Briefly change width from 180 to 170 and back to 180 so the preview visibly changes. Cut to parts, finish controls, photo and base price. | "Choose a template, adjust dimensions and simple parts, add finishes and a reference photo, then set the price. No modeling skills needed." | Template → customize |
| 19–24 sec | Show a real Save completing and the share URL appearing. Cut to the same product in My products; tap Copy link. | "Save the product, find it in My products, and share its link." | Save → share |
| 24–31 sec | Open the new product's public URL on the phone, starting with Walnut. Show the product name/reference photo, then drag the furniture to rotate it. | "Customers open that link without signing in and rotate the furniture to explore its shape." | Buyer: no login needed |
| 31–40 sec | Keep Charcoal legs selected. Tap Carrara Marble. Show the tabletop changing, then frame the price changing from NGN 150,000 to NGN 175,000. | "Choose Carrara Marble: the finish changes immediately, and the price updates from one hundred and fifty to one hundred and seventy-five thousand naira." | Finish + live price |
| 40–44 sec | Clearly show the dimension label. | "Dimensions stay visible, so both sides understand the size." | 180 × 90 × 75 cm |
| 44–53 sec | Tap Order via WhatsApp. Record the actual WhatsApp draft. Frame the product, finishes, dimensions, quoted price and configuration URL. Do not show unrelated chats. | "Tap Order via WhatsApp. The prepared message includes the furniture, selected finishes, dimensions, price, and a link to this exact configuration." | Order enquiry via WhatsApp |
| 53–60 sec | Copy the configuration URL from the WhatsApp draft and open it in the browser. Show Carrara Marble still selected and NGN 175,000. Finish with a small ShowRoom 3D title over that screen. | "Open that link, and the same finish and price return. ShowRoom 3D: fewer misunderstandings, more confident furniture choices." | Same configuration restored |

If an unsent WhatsApp link cannot be tapped, copy it and paste it into the
browser. Trim the app-switching pause; show the real restored result. The URL
should contain `finish=marble&secondary=charcoal` for this prepared table.

## Editing and delivery

- Target **60 seconds**, with clear narration and readable subtitles. Trim
  loading waits and typing, rather than speeding through the finish change.
  If this narrator needs more time, shorten a spoken sentence; do not exceed
  one minute. For a 45-second cut, omit the Profile scene and shorten the builder
  and My products clips while retaining the complete buyer journey.
- Use simple cuts. Keep background music quiet or omit it. Subtitles must not
  cover the price, dimensions, selected finish or WhatsApp URL.
- Show real app footage. Do not imply photo-to-3D, photorealism, payments,
  automatic order confirmation, or GLB upload are working features.
- Export **MP4 (H.264 video, AAC audio)** as `showroom-one-minute-demo.mp4`.
  Deliver the matching subtitles as `showroom-one-minute-demo.srt`, plus one
  clean poster image and the editor project/raw clips if available.
- Put deliverables in `artifacts/demo/one-minute/` and copy the MP4 to the
  presentation phone and laptop. Play the final file offline on both devices.
  Keep the existing longer walkthrough as a backup. Do not overwrite the
  landing-page video unless its poster, captions and duration label are updated
  together; that replacement is a separate handoff.

## Recorder's final check

- [ ] The film lasts 45–60 seconds; narration and subtitles match.
- [ ] One newly saved product is used throughout creation, My products and buyer scenes.
- [ ] Rotation, the finish change, NGN 150,000 → NGN 175,000 and dimensions are readable.
- [ ] Actual phone WhatsApp footage shows the prepared message and configuration URL.
- [ ] Opening that URL restores Carrara Marble and NGN 175,000 without a login prompt.
- [ ] No private credentials or unrelated conversations are visible.
- [ ] The final MP4 plays offline with audible narration on the laptop and phone.
