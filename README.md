# Obelum Properties — Homepage

A single-page luxury-brokerage homepage for **Obelum Properties**, built to the
*Raw Umber & Timberwolf* brand sheet (Option 16).

No build step, no dependencies. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Files

```
index.html            the homepage
assets/css/styles.css design tokens + all section styles
assets/js/main.js     sticky header, mobile nav, search tabs, counters,
                      tour selector, testimonial rotator, scroll reveal
assets/img/*.svg      placeholder imagery (see "Swapping in real assets")
brand/tokens.md       the palette, type scale and usage rules
```

## Page structure

| # | Section | Pattern |
|---|---------|---------|
| 1 | Utility + nav | Transparent over the hero, condenses to a dark fixed bar on scroll |
| 2 | Hero | Full-bleed media, headline, inline property search with Buy/Rent/Off-plan/Commercial tabs |
| 3 | Stats | Four-up counters on anthracite, animated on first view |
| 4 | Featured listings | Six-card grid, hover zoom, status badges and tour/yield flags |
| 5 | Signature listing | Full-bleed split — image against a raw-umber spec panel |
| 6 | Property tours | Dark video-led section: large stage plus a selectable tour list |
| 7 | Communities | Four portrait tiles, gradient shifts to umber on hover |
| 8 | Services | Four-column bordered grid |
| 9 | The story | Brand narrative beside the annotated colour meanings |
| 10 | Founder | Portrait, pull quote and direct contact lines |
| 11 | Testimonials | Auto-rotating quotes, pauses on hover and when the tab is hidden |
| 12 | Insights | Three-card journal grid |
| 13 | Valuation CTA | Umber-washed band with the lead-capture form |
| 14 | Footer | Four columns, socials, legal and RERA line |

## Swapping in real assets

Everything in `assets/img/` is a generated placeholder — abstract architectural
forms in the brand palette, so nothing reads as broken before photography lands.
Each is referenced once from `index.html`; replace the file (keeping the name) or
point the `src` at a real image of the same aspect ratio:

| File | Ratio | Used for |
|------|-------|----------|
| `hero-*.webp` | 16:9 | Hero slides, crossfading in order. Add another by dropping an `<img class="hero__slide">` into `.hero__media` — the script counts whatever is there. |
| `tile-0*.svg` | 3:4 | Listing tiles (portrait, text overlaid on the lower third) |
| `signature.svg` | 4:3 | Signature listing |
| `tour-0*.svg` | 16:9 | Tour stage and list thumbnails |
| `area-0*.svg` | 3:4 | Community tiles |
| `journal-0*.svg` | 3:2 | Insight cards |
| `founder.svg` | 4:5 | Founder portrait |
| `valuation.svg` | 16:9 | CTA backdrop |

`obelum-logo.png` is the real supplied logo lockup (1748x498, transparent PNG)
and is **not** a placeholder. It is sized by height in CSS so the 3.51:1
artwork never distorts. `favicon.png` and `apple-touch-icon.png` are the "O"
mark cropped from it onto anthracite. If a vector version of the logo exists,
dropping in an SVG would sharpen it on high-density screens.

The hero is already marked `fetchpriority="high"`; everything below the fold is
`loading="lazy"`.

Note on caching: `vercel.json` gives `/assets/*` a 1-hour revalidating cache
rather than the usual year-long `immutable` one. Filenames here are not
content-hashed and photographs are replaced in place, so a long cache keeps new
imagery from appearing.

`/assets/img/*` was on `max-age=3600` and that bit: swapping `hero.webp` left
browsers showing the previous photograph for up to an hour, with no request to
the server to notice. It now matches CSS and JS at `max-age=0,
must-revalidate` — every image is revalidated, which costs a 304 when nothing
changed and shows a new photograph immediately when it has. If you move to
content-hashed filenames, raise it then. (`vercel.json` permits no comments,
hence this note.)

## Instagram feed

The section above the footer is **layout and carousel only — it does not pull
live posts.** It holds four real Obelum posts (`assets/img/ig-01…04.webp`,
1080×1350) committed to the repo. Swapping them by hand works, but goes stale;
connecting a real source needs one of:

1. **Instagram Graph API.** Requires a Business or Creator account linked to a
   Facebook Page, a Meta app, and a long-lived access token. Tokens expire
   every 60 days, so this needs a scheduled refresh — a Vercel cron function
   fetching `/me/media` and caching the result is the usual shape.
2. **A hosted embed service** (Behold, EmbedSocial, LightWidget and similar).
   They handle the token lifecycle; you drop in a script tag. Quicker to set
   up, costs a subscription, and adds a third-party script to the page.

Either way the markup to fill is `.feed__track` — one `<a class="feed__item">`
per post, each wrapping an image. The carousel, arrows and scroll-snap work off
whatever children are there, so nothing else needs changing.

`.feed__item` is `aspect-ratio: 4 / 5`, matching the portrait posts Instagram
serves. Because the tile and the artwork agree, `object-fit: cover` crops
nothing — which matters here, as every post carries copy hard against its top
and bottom edges. Feeding it square or landscape images will crop them; change
the ratio to suit whatever the live source returns.

## The hero

Left-aligned composition: eyebrow, then the statement carrying the frame, with
the supporting line, a scroll cue and the featured-residence card along the
foot above the nav row.

`.hero__foot` is **in normal flow by default and only absolute from 64rem**.
Taking it out of flow at every width let it ride up over the statement on a
phone, where the hero is tall and narrow and the two met in the middle. The
scroll cue is a desktop affordance and is hidden below 64rem — that rule has to
sit *after* the base `.hero__scroll` rule, since they have equal specificity.

The statement stays **Gilda, sentence case**. Section 10 allows one Gilda
statement per surface and does not set it uppercase, so the reference's
condensed uppercase treatment is reached through scale and alignment instead.

`.hero__scrim::after` is **weighted to the left**, following the text. The old
centred radial was built for centred text and left the headline at 2.6:1 once
it moved to the edge. Below 64rem the text runs nearly edge to edge, so the
weighting flattens out. **If the hero photograph changes, re-measure** — the
scrim is tuned against the image, not in the abstract.

## Listing photography

Eight listings, four photographs (`assets/img/listing-*.webp`, 1086x1448, the
3:4 the tiles use). They are assigned by property type, not by address:

| Photograph | Shows | Used for |
|---|---|---|
| `listing-villa-beach` | beach villa, pool, skyline across the water | Palm Jumeirah, JVC |
| `listing-villa-golf` | villa terrace over a golf course at sunset | Emirates Hills, Dubai Hills Estate |
| `listing-apartment-marina` | living room over the marina and its yachts | Dubai Marina, Business Bay |
| `listing-apartment-creek` | living room at dusk, Downtown skyline across the water | Dubai Creek Harbour, Downtown Dubai |

Villas show the building and its grounds, apartments the room and the view from
it. The first four listings are each genuinely the property in their photograph;
**the other four borrow the one matching their type and still need their own
shot.** Replace them before this goes near real inventory — a Palm villa
standing in for a JVC listing is fine as a layout placeholder and misleading as
a property page.

The tile scrim (`.tile::after`) is anchored in **px, not %**. The caption block
is about the same height whatever the tile is, so a percentage gradient
over-covers a tall tile and leaves the place name exposed on a short one. Over
these bright daylight photographs that put the name at 1.9:1 on a 320px screen.
If you change the caption's size, re-check the stops.

## The world panel

Has its own photograph (`world.webp`) rather than borrowing the hero's. The
lockup there is `obelum-wordmark-white.png` — OBELUM without the PROPERTIES
line, in chalk white — because the lead line above already says what this is.
The header and footer still carry the full gold lockup.

Both wordmarks are cropped from `obelum-logo.png` and keep its exact shapes:
`obelum-wordmark.png` is the gold one, `-white` the same alpha filled with
OBELUM 04.

**The white mark is what lets the photograph show.** Gold needed a near-opaque
scrim to clear its threshold — 2.6:1 over the yacht's sunlit water otherwise —
and that buried the image. Chalk white does not, so the scrim runs at roughly
half the weight and the yacht reads.

Five strengths were swept against all four elements at 1440/1024/768/390/320.
The one in place is the lightest that passes, at 5.4:1 worst case. **The
supporting line binds, not the mark**: lighten further and `.world__sub` fails
at 390 and 320 while the wordmark still has room. If you want it lighter
again, the lever is that line — larger type drops its threshold from 4.5 to 3.

## Light and dark sections

The page alternates grounds so neither carries the whole homepage: dark hero,
light listings, dark world panel, light testimonials, dark valuation, dark
footer — roughly half and half.

`.is-light` is the counterpart to `.is-dark` and puts a section on chalk white
(OBELUM 04). Several components were written when every section was dark and
had their light-on-dark colours hardwired, so `.is-light` restates them. **Gold
is deliberately absent from light sections** — it measures 2.5:1 on chalk white.
Raw umber carries the accents there; gold keeps to the dark grounds.

## The brief form

The valuation form's single "I want to" select became four radio cards. Picking
one rewrites the whole panel: eyebrow, headline, body copy, submit label and the
small print beneath it.

Each intent's copy lives in the markup as a `[data-for]` block inside
`[data-intent-copy]`; `main.js` only toggles `hidden`, so the copy stays
editable in HTML and nothing is injected as a string. The submit label and note
come from `data-submit` and `data-note` on each radio.

They are radios rather than buttons so the group keeps arrow-key navigation and
announces itself correctly. The painted box is the `<span>`; the input is still
in the accessibility tree at 1px and opacity 0 — **not** `display: none`, which
would drop it out of the tab order. Selection is shown by border, tint *and* a
check mark, never colour alone; the selected title stays chalk white because
gold on the tinted card measured 3.9:1.

Like the signup, **no endpoint is connected.** It previously had `action="#"`,
which reloaded the page and discarded whatever had been typed. `main.js` now
intercepts and points people at `hello@obelum.ae`. Give the form an `action`
and the handler stands down on its own.

## Newsletter signup

The band between the feed and the footer has **no mailing list behind it.** The
`<form>` has no `action`, and `main.js` intercepts the submit to point people
at `hello@obelum.ae` instead of silently dropping the address. When a provider
is chosen, give the form its `action` (the handler stands down on its own once
`action` is set) and delete the `[data-signup]` block in `main.js`.

The heading links to `instagram.com/obelum.properties`; correct that handle if
it differs.

## Installable app (PWA)

The site installs to a phone home screen and runs standalone.

- `manifest.webmanifest` — standalone display, portrait, brand theme colours,
  and shortcuts straight to the listings and the valuation form
- `assets/img/icon-*.png` — 192 and 512 icons, plus maskable variants carrying
  the extra safe-zone padding Android crops to. All generated from the logo mark.
- `sw.js` — offline shell. The document is network-first, so a new deploy shows
  up immediately; same-origin assets are stale-while-revalidate. Bump `CACHE`
  in that file to invalidate everything.
- Safe-area insets are honoured throughout (`viewport-fit=cover`), so nothing
  hides behind a notch or home indicator.

Webfonts load from Google's CDN and are deliberately not cached by the worker,
so an offline visit renders in fallback faces. Self-host the fonts if offline
fidelity matters.

## Accessibility & behaviour notes

- Every section is readable and usable with JavaScript disabled; the scripts are
  progressive enhancement only.
- `prefers-reduced-motion` disables the hero drift, reveals, counters and the
  testimonial auto-rotation.
- Skip link, visible `:focus-visible` rings, labelled form fields, `aria-current`
  on the tour and testimonial controls, Escape closes the mobile menu.
- Every interactive element clears 44px of height on coarse pointers; verified
  by measuring the rendered boxes, not by eye.
- Hero text contrast is measured against the actual photograph behind it:
  wordmark 3.55:1, headline 4.09:1, subhead 6.36:1, hero nav 16.3:1.
- Gold on anthracite is the brand's 5.2:1 pairing; body copy sits well above 4.5:1.

## Placeholder content

The copy, listings, statistics and testimonials are written placeholders. See
`brand/tokens.md` for the list of values that need replacing with real data.
