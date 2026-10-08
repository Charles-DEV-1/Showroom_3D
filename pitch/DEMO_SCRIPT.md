# ShowRoom 3D: one-product demo

For the delegated 45–60 second recording, use
[the one-minute video guide](ONE_MINUTE_VIDEO_GUIDE.md). It includes the new
artisan account/profile/My products introduction and exact narration per scene.
The longer live buyer presentation below remains available for rehearsal.

Use the saved **Marble Dining Table**. Start with Walnut so the audience sees
the material and price change. Keep the other saved products out of the main story.

## Before presenting

- Laptop and phone on the same Wi-Fi; laptop awake and plugged in.
- Run npm.cmd run dev on the laptop. Use the Network address printed by Vite.
- On the phone, open that address with the product path below. Do not use localhost
  on the phone: it means the phone itself, rather than your laptop.
- Open the product once to load its texture. Confirm WhatsApp is ready on the phone.
- Disable distracting notifications. Have the phone's screen recorder ready.
- Keep the browser rehearsal clip copied onto the presentation laptop and phone.
- This local demo still needs internet for Supabase. The recorded clip plays offline.

Starting path (append to your Vite Network address):

```text
/product/4488d2dd-288d-4248-a411-115158420880?finish=walnut&secondary=charcoal
```

## Exact phone story: approximately 60-90 seconds

| Step | Action | What to say |
| --- | --- | --- |
| 1 | Open ShowRoom 3D on the real phone. | "Here is a dining table an artisan can share with a customer." |
| 2 | Show the product and reference photo. | "The customer can compare the preview with a furniture photo." |
| 3 | Drag the model to rotate it. | "They can understand its shape and proportions from different angles." |
| 4 | Select Carrara Marble in Primary finish. | "Let's choose a different finish." |
| 5 | Show the tabletop changing. | "The same furniture now shows the selected marble texture." |
| 6 | Show the price changing from 150000 to 175000 NGN. | "The extra finish cost is included immediately." |
| 7 | Show 180cm x 90cm x 75cm. | "The dimensions are visible before ordering." |
| 8 | Tap Order via WhatsApp. | "Now the customer can start an order using WhatsApp." |
| 9 | Show WhatsApp's pre-filled message. | "The artisan receives the product, finishes, dimensions and quoted price." |
| 10 | Point out the Configuration link. | "The message also includes this exact selection." |
| 11 | Open the link in the phone browser. | "When the artisan opens it..." |
| 12 | Show marble selected and price 175000. | "...the finish and price are preserved." |

Some phones do not make links in an unsent draft tappable. Copy the configuration
URL from the draft and paste it into the browser. The same saved configuration
is restored. Sending to the supplied demo number is optional; do not send to a
different person for the presentation.

If someone asks how the artisan published it, briefly open /builder afterwards:
choose a template, edit dimensions, assign finishes and price, save, copy the URL.
Keep this outside the main buyer story unless time permits.

## Reference facts

- Product ID: 4488d2dd-288d-4248-a411-115158420880 (saved during the full walkthrough).
- Base: 150000 NGN. Marble: +25000. Charcoal legs: +0. Final: 175000.
- Display order: width x depth x height = 180 x 90 x 75 cm.
- Query: ?finish=marble&secondary=charcoal.
- The photo is licensed stock reference imagery. The primitive model was not
  generated or measured from it. The marble image is a generic demo material.
- WhatsApp starts a conversation. It does not confirm an order, collect payment,
  store an order record, or guarantee the artisan accepts the quote.

## Backup recording

Use **artifacts/demo/showroom-full-demo.mp4** for the longer backup: approximately
4 minutes 25 seconds, Full HD, with automated narration and chapter labels.
It shows the artisan builder, dimensions, parts, finish setup, real texture/photo
uploads, real save/share, desktop and phone-sized buyer views, rotation, primary
and secondary finish prices, the generated message preview, and reopening its
configuration link. The movie's phone view is browser emulation, not real-device
footage. Its WhatsApp message is explicitly labeled as a preview, not the app.

Optional English captions: artifacts/demo/showroom-full-demo.srt.
The original short showroom-browser-rehearsal.webm is retained as a fallback.
The new recorded product includes Warm Walnut as a secondary finish: marble plus
Warm Walnut legs = 185000 NGN; returning to Charcoal gives 175000 NGN again.

For the full backup, use your phone's built-in screen recorder to capture the
12 steps above, including WhatsApp. Save it as showroom-full-phone-demo.mp4
alongside the narrated walkthrough, then play it once to check it is readable.
Keep a second copy on the presentation laptop. Record before the final rehearsal.

If connectivity fails during the live demo, say "Here is our recorded walkthrough"
and play the recording. Do not describe recorded footage as a live connection.
