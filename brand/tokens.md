# Obelum Properties — brand tokens

Source: the *Raw Umber & Timberwolf* brand sheet (Option 16).
Declared as custom properties at the top of `assets/css/styles.css`.

## Palette

| Token | Hex | RGB | Pantone | Role |
|-------|-----|-----|---------|------|
| `--anthracite` | `#2D302F` | 45 48 47 | 19-4206 TCX Black Robe | Primary ground — precision, the fine print, read |
| `--raw-umber` | `#7A5938` | 122 89 56 | 18-1024 TCX Nuthatch | Second ground — the land itself, the real asset |
| `--timberwolf` | `#D7D0C7` | 215 208 199 | 13-4403 TCX Silver Birch | Primary light — neutral grey, unbiased |
| `--chalk-white` | `#F7F5F1` | 247 245 241 | 11-4101 TCX Stalactite | Primary light — the clean page, nothing hidden |
| `--gold` | `#B39F74` | 179 159 116 | 16-1324 TCX Lark | Logo and highlights — the gilded tip of the obelisk |
| `--smoke` | `#8E8B85` | 142 139 133 | 17-0207 TCX Rock Ridge | Secondary — measured, analytical |
| `--deep-umber` | `#4A3522` | 74 53 34 | 19-1218 TCX Potting Soil | Secondary — depth and warmth |

Gold on anthracite is the brand's stated 5.2:1 pairing and is used for the
wordmark, eyebrows and primary CTAs on dark grounds.

## Type

| Token | Family | Used for |
|-------|--------|----------|
| `--serif` | Cormorant Garamond | Display headlines, listing titles, prices, pull quotes. Italics carry the emphasis half of every headline. |
| `--sans` | Jost | The wordmark (wide tracking) and all body copy. |
| `--mono` | IBM Plex Mono | Eyebrows, labels, specs, nav, buttons — uppercase with 0.16–0.3em tracking. |

Headline sizes are fluid `clamp()` values; the display scale tops out at 5.25rem.

## Spacing

- `--gutter` — page inset, `1.25rem → 4.5rem`
- `--maxw` — `84rem` content measure
- `--section` — vertical section rhythm, `4.5rem → 9rem`
- `--ease` / `--slow` — shared motion curve and reveal duration

## Values that need replacing with real data

These are placeholders written to demonstrate the layout:

- **Contact** — `+971 50 000 0000`, `nicolas@obelum.ae`, `obelum.ae` (taken from
  the brand sheet's business-card mock-up; confirm they are live)
- **Licence line** — `RERA ORN 00000 · DED 000000` in the footer
- **Statistics** — AED 2.4B advised, 640+ properties, 38 communities, 11 years
- **Listings** — all six cards and the Emirates Hills signature listing
- **Tours, insights and testimonials** — titles, durations, excerpts and names
- **Social links** — all four currently point at `#`

The only item carried over verbatim from the brand sheet is the JVC listing
example: *"Two-bed with a working study" — AED 95,000 / yr*.
