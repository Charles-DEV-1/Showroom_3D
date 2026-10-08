# ShowRoom 3D pitch

## Opening: about 90 seconds, excluding the demo

Buying custom furniture from a photo leaves room for misunderstanding. A customer
may struggle to imagine the shape, compare finishes or understand the final price.
The artisan then has to explain those details repeatedly in a chat.

ShowRoom 3D gives the artisan a simple furniture builder. They choose a template,
enter dimensions, add finishes and set their prices. They do not need to model
the furniture in 3D. Our browser builds a stylized preview from simple shapes.

The artisan shares one product link. The buyer can rotate the furniture, see its
dimensions, switch finishes and see the price update immediately. When they tap
Order via WhatsApp, the message includes the product, chosen finishes, dimensions,
price and a configuration link. Opening that link restores the customer's choice.

Our working MVP focuses on spatial understanding, finish confidence and price
clarity. It helps both sides discuss the same configuration before agreeing on
an order. The demo uses one dining table to show that entire journey.

We are keeping the product practical. Complex curved designs need additional
templates or prepared 3D models. Model upload is planned bonus support, and
photo-to-3D is on our roadmap. Today's demo works with the template builder.

## Six-slide outline

| Slide | Content |
| --- | --- |
| 1: Problem | Furniture photos leave shape, finish and price open to interpretation. |
| 2: Artisan workflow | Template -> dimensions -> finishes/prices -> publish a link. |
| 3: Buyer workflow | Rotate -> compare finishes -> see dimensions/price -> WhatsApp. |
| 4: Live demonstration | The exact 12-step phone story in DEMO_SCRIPT.md. |
| 5: What works | Artisan signup/login, private profile and My products; seven shape presets; numeric parts; photo/texture uploads; public product URLs; restored finish selections and order message. |
| 6: Next steps | Validate with real artisans; prepared-model support; photo-to-3D roadmap. |

Do not invent user numbers, sales, time savings or pilot results. Use the recorded
app screens when preparing slides. Keep the demo central, with little code on screen.

## Questions and honest answers

**What if the artisan has no 3D file?**

They start from a template, adjust dimensions, add finishes and publish a link.
No 3D modeling skill is required. Uploading an existing model is planned bonus
support; photo-to-3D is on our roadmap.

**Can it create any curved furniture?**

The current builder supports boxes, cylinders and spheres. It cannot accurately
represent every sculpted design. Later templates can cover more designs, and
prepared models can support complex furniture.

**Is the preview photorealistic?**

No. It is a stylized approximation to explain shape, proportions and finishes.
The buyer also sees dimensions and a reference photo. The demo photo and marble
texture are licensed examples, not verified artisan inventory or materials.

**Is this a room-scale augmented reality app?**

No. It is a web viewer with numeric dimensions. Camera zoom does not prove how
the furniture fits in a real room. We do not provide AR placement or measurements.

**Does tapping WhatsApp place an order?**

It opens a prepared order enquiry. The customer and artisan confirm the order
in WhatsApp. There is no payment or automated order confirmation in this MVP.

**Are sign-in and an artisan product dashboard available?**

Yes. Artisans sign up and sign in with Supabase. My products shows their own
saved products, and a private profile stores their business name and WhatsApp
default for future drafts. Buyers open public product links without signing in.
Saved products are immutable in this MVP; revisions are new saves. There is
no public profile directory or password-recovery workflow.

**How does it work technically?**

React/Vite provides the builder and buyer pages. Parts and finishes are saved
as JSON in Supabase. React Three Fiber/Three.js render the shapes in the browser.
The URL stores the selected finish IDs; the same selection drives materials,
pricing and the WhatsApp message. Server handlers validate saving and signed
uploads. Deployment to Vercel is prepared but has not been done in this checkout.

## Team rehearsal roles

- Person 1: check model, textures and phone rotation; keep the backup clip ready.
- Person 2: operate the phone and rehearse the exact product journey.
- Person 3: run verify:demo, keep the laptop/server/internet ready and check URLs.
- Person 4: deliver the pitch, keep slides brief and time the rehearsal.

Hour 40: stop adding features. Hours 40-44: demo preparation and recording.
Hours 44-48: rehearse the pitch and phone journey; make only fixes that block it.
