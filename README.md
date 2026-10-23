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
| `hero.svg` | 16:9 | Hero backdrop — swap for a `<video>` showreel if preferred |
| `listing-0*.svg` | 4:3 | Listing cards |
| `signature.svg` | 4:3 | Signature listing |
| `tour-0*.svg` | 16:9 | Tour stage and list thumbnails |
| `area-0*.svg` | 3:4 | Community tiles |
| `journal-0*.svg` | 3:2 | Insight cards |
| `founder.svg` | 4:5 | Founder portrait |
| `valuation.svg` | 16:9 | CTA backdrop |

The hero is already marked `fetchpriority="high"`; everything below the fold is
`loading="lazy"`.

Note on caching: `vercel.json` gives `/assets/*` a 1-hour revalidating cache
rather than the usual year-long `immutable` one. Filenames here are not
content-hashed and the placeholders are meant to be overwritten in place, so an
immutable cache would keep real photography from appearing. If you move to
hashed filenames, raise it then. (`vercel.json` permits no comments, hence this
note.)

## Accessibility & behaviour notes

- Every section is readable and usable with JavaScript disabled; the scripts are
  progressive enhancement only.
- `prefers-reduced-motion` disables the hero drift, reveals, counters and the
  testimonial auto-rotation.
- Skip link, visible `:focus-visible` rings, labelled form fields, `aria-current`
  on the tour and testimonial controls, Escape closes the mobile menu.
- Gold on anthracite is the brand's 5.2:1 pairing; body copy sits well above 4.5:1.

## Placeholder content

The copy, listings, statistics and testimonials are written placeholders. See
`brand/tokens.md` for the list of values that need replacing with real data.
