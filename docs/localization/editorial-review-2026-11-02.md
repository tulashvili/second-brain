# Editorial withdrawal release — 2026-11-02

The published-content audit identified 18 suspicious notes; the user approved setting all 18 to `draft: true` and redeploying. The exact notes and both public URLs are recorded in `editorial-withdrawals.json`. The source bodies remain in Ignis; only their draft status was changed where necessary. Five were already drafts when the current API snapshot was read. A newer edit to Linux Services was preserved.

The release retains the 67 pairs enumerated in `published-baseline.json` and `localization/route-pairs.json`: 45 articles and 22 navigation notes per locale. Their Ignis source hashes are recorded in `ignis-source-manifest.json`; no retained source changed since the audit. Public copies replace links to withdrawn notes with their labels. Previously reviewed short definitions and navigation catalogs remain eligible; brevity alone is not a draft indicator.

The audit considered unfinished sections and sentences, placeholders and personal reminders, conversational leftovers, inconsistent examples, incomplete instructions and rough sketches. Images were considered content, rather than treating image-only sections as empty. The approved withdrawals include the borderline cases the user chose to remove.

The now-empty `tutorials` tag also disappears in both locales because its only article was withdrawn. The frozen original route inventory is retained; explicit withdrawal exceptions are tested separately. Tests require absent withdrawn pages, social preview images, search entries, sitemap and RSS entries, while retaining the other historical routes. Live verification must also confirm these withdrawals before reporting the deployment complete.

Reviewed-set binding (SHA-256):

- `docs/localization/ignis-source-manifest.json`: `ebe118f7c6da8940f2030852a2e93cbca806fd6129905bd34a250bddbf9df9aa`
- `localization/route-pairs.json`: `e2ecf6de4df82bdb79658a55a554f8198174ef51e648dd51737f31aa47c610be`
- `docs/localization/editorial-reviewed-files.json`: `b5485c631b96f8c5738a82492105235be8e6f13cdf76d3a1751963dd3ad2be96`

The reviewed-files inventory binds both complete locale bodies, public transformations and all shared attachments. A change to any of these files invalidates this editorial sign-off and requires renewed review, even when the Ignis manifest and route pairs are unchanged.

Final rendered-link review corrected two pre-existing English targets: the homepage Programming topic now points to `programming-fundamentals`, and Computer Networks points to `router`. Remaining non-clickable wikilink labels refer to absent or unpublished notes (for example S3, MFA and other OSI layers); they are not public navigation links and do not justify publishing those drafts.
