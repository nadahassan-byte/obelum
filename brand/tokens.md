# Obelum Properties — design tokens

Source: **Obelum Brand Guidelines v1.0, October 2026** (the supplied PDF).
Declared as custom properties at the top of `assets/css/styles.css`.

## Palette — section 09

| Token | Hex | Role |
|-------|-----|------|
| `--anthracite` | `#2D302F` | Leasing · brand lead |
| `--deep-umber` | `#4A3522` | Sales · phase 2 |
| `--raw-umber` | `#7A5938` | Accent |
| `--gold` | `#B39F74` | The logo · highlights only |
| `--smoke` | `#8E8B85` | Captions |
| `--timberwolf` | `#D7D0C7` | Secondary light |
| `--chalk` | `#F7F5F1` | Main light |

Dark grounds use the anthracite radial gradient: `#4A4E4C → #2D302F → #1B1D1C`.

## Type — section 10

- **Gilda Display**, regular 400 only, for headings and titles. Sentence case.
- **Montserrat** 300 body · 400 subheadings and labels · 500 prices and facts.
- **No italics and no script, anywhere.** Emphasis is colour (`.hl`), never
  italic or bold.

## Brand devices — section 11

- **`.obelus`** — a hairline with a dot above and below its start. It replaces
  every generic divider: under headings, between promise and proof.
- **The divided frame** — promise above the line, proof below. Every listing
  uses it: label, headline, obelus, facts, note, trade-off.
- **The margin note** — `.let__tradeoff`, the ÷-marked line that names the
  trade-off.
- **`.checked`** — the Obelum Checked mark. Only on listings that pass all five
  checks: permitted, authorised, seen, shot honestly, costed.

## The Ten Rules, as built

| # | Rule | Where it lives |
|---|------|----------------|
| 01 | Promise, then proof | `.let` divided frame |
| 02 | Leasing is anthracite | `.is-dark` sections, "To let" labels |
| 03 | Gold is the logo's, never a background | `.hl`, obelus dots, nav underline only |
| 04 | One Gilda statement per surface | one `.display`/`.h2` per section |
| 05 | Facts in Montserrat Medium below the line | `.let__facts` |
| 06 | Every cost shown | move-in total on every listing |
| 07 | The mark is earned | `.checked` |
| 08 | Real photos only | hero photography supplied; tiles still placeholder |
| 09 | Bilingual, equal | عربي in the nav; Arabic pages still to come |
| 10 | Name the trade-off | `.let__tradeoff` on every listing |

## Still to supply

- **Listing and feed photography.** `tile-0*.svg` (3:4) and `ig-0*.svg` (1:1)
  are generated placeholders. Rule 08 requires real photographs.
- **Arabic pages.** The nav carries عربي; the mirrored right-aligned layout and
  transcreated copy are not built.
- **A live Instagram source.** See "Instagram feed" in the README.
- **Licence numbers.** Trakheesi permit numbers on listings read `[000000]`.
