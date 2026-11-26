# Design loop ledger: BLKOUT Voices guest interview page

Artefact: `public/interview/index.html` (private link; first guest Dr Doyinsola Kuku, Portaul). Built Wed 25 to Thu 26 Nov 2026. Mode: single pass.
Renders: this folder (`01` to `07` phone, `08` to `10` desktop), script `scripts/interview-screens.cjs` against `scripts/interview-stub.mjs`.

## The bar
- Brief: an outside professional guest, new to BLKOUT, answers eight fixed questions one at a time; knows from the first screen how long, that she can skip, stop and return, and what happens before publication; told it is part of the sponsorship and BLKOUT edits; Ivor's follow-up is optional and never writes for her; reads back, adds a bio, sends.
- System: `~/blkout/platform/DESIGN.md`: obsidian ground, cream text, Work Sans 900 caps, Fraunces italic, IBM Plex Mono labels, Voices accent green on the wordmark full stop, eyebrows, rules and links.
- Craft: would a designer ship it as the organisation's first impression to a sponsor's founder, on phone and desktop.

## Round 1
| Critic | Verdict | Headline |
|---|---|---|
| Brief (haiku) | FAIL, 2 | "talk instead of type" only in a placeholder that disappears; bio placeholder clipped |
| System (haiku) | FAIL, 3 + 2 questions | grey and warning colours off the palette; eyebrows, progress, rule, links and focus ring in gold where the Voices green belongs; no heading on the question screen |
| Craft | FAIL, 5 must + 8 should | clipped placeholder; secondary links laid out two ways and inset; the sent screen listed six "Not answered" cards; no desktop render of the question screen |

Fixes (all landed, checked in re-renders): talk line on the welcome screen and a standing hint under each answer box; bio placeholder "Name and role"; links in one row, flush with the column; unanswered questions are compact rows on the review screen and a single count on the sent screen; "Go to send" at the top of the review; completed progress segments in cream, current in green; the original question shown above "You said" on the follow-up; larger heading and more top space on desktop; desktop renders added; palette greys and warning colour from DESIGN.md; green for eyebrows, progress, the Ivor rule, links and focus; screen-reader headings on question screens; duplicate "Interview" label removed.
Stated disagreements: the primary button stays gold, as on the rest of voices.blkoutuk.com (DESIGN.md would give it the section green); cards, inputs and pill buttons keep their rounded corners.
Found in self-check after the round: the "Go to send" link was an in-page anchor, which would have overwritten the private key in the address; replaced with a scroll button.
Not re-judged by fresh critics after the fixes (single-pass mode).
