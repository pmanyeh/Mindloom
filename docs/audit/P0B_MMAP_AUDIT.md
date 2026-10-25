# P0B — Existing MMAP implementation

Baseline: `65964ac06937514cf9805a2b1198cc20f1e83425`. Date: 2026-10-25.

**Finding: useful field mapping, unsuitable for high-fidelity round-trip without a preservation layer.**

## Read/write architecture

`parseMmap` (`src/import/mmap.ts:578`) synchronously unzips the archive, finds a case-insensitive `Document.xml` basename, parses it with `fast-xml-parser`, removes namespace prefixes, and builds selected `MindMapDoc` fields. `files` exists only in a temporary parse context. Returned data contains `doc` and `warnings`, without original XML, entry manifest, namespaces, schema metadata or opaque bytes.

`toMmap` (`src/io/mmap.ts`, exported function) creates fresh XML with fixed MindManager 2003 namespaces, client version `24.1.150`, default styles and constant Dirty/Gen metadata. It builds a fresh ZIP containing `Document.xml` and recognized embedded images. Fixed timestamps and deterministic hashes make repeated writes of the *same canonical model* byte-stable. This does not make repeated import/export cycles stable.

No full XML validator, schema/version dispatcher, package budget/CRC inventory, dirty-domain patching or source-reference integrity validation is used in this path. The topic-count honesty check uses an `ap:`-specific regular expression; the actual field parser removes prefixes and is not namespace-identity aware.

## Feature inventory

“Mapped/tested” below means internal synthetic tests only. No feature is labelled `ROUNDTRIP_SAFE` or `ORACLE_VERIFIED` by this audit.

| Feature | Import | Export | Loss / limit |
|---|---|---|---|
| Topic tree/plain text | Mapped/tested | Mapped/tested | Other content has no sidecar; text normalization strips invalid controls and normalizes CR |
| Original topic OId | Read as node ID | Rehashed to deterministic GUID-like base64 | Original identity lost; re-imported ID is hashed again on next export |
| Map/relationship/boundary IDs | New/generated identity | New/default scaffolding | Original identity/metadata not retained |
| Notes | XHTML flattened, fallback PreviewPlainText/legacy text | PreviewPlainText attribute only | Markup, attachments/embedded references, structure not preserved; full text availability in MindManager unverified |
| Rich topic text | FontRange → limited HTML | PlainText only | Formatting lost |
| Hyperlink | Primary safe URL | Primary safe URL | Additional links/unmapped attributes not preserved; dangerous URLs intentionally filtered |
| Icons | Curated mappings, unknown name fallback | Curated reverse mapping | Unmapped/custom markers omitted |
| Tags | Names, deduplicated | TextLabels | Full catalogs/groups/metadata not preserved |
| Task | Priority 1–9, percentage, start/due date, comma-separated resources | Those fields only | Time/timezone discarded, percentage rounded to integer, duration/cost/dependencies/roll-up/Gantt omitted |
| Topic style/shape | Selected explicit fill/font/shape/line fields | No per-topic style writeback | Theme inheritance unresolved; explicit styles lost |
| Relationships | Endpoints/label and selected line/arrow style | Endpoints/label only | Style, geometry/type/metadata lost; dangling endpoints filtered at export |
| Boundaries | Whole subtree membership, selected style | Exact-subtree membership only | Styling/labels lost, arbitrary cross-branch boundaries dropped |
| Floating topics | Separate trees | Separate trees | Position/layout/source metadata not retained |
| Callouts | Lifted to canonical annotations | No path | Lost |
| Collapse | Not read | Emitted | State disappears on re-import |
| PNG/JPEG | Resolve URI/bin bytes → data URL | New deterministic bin entries | Original filename/URI/metadata lost; dimensions rounded/capped |
| Vector images | Raster fallback if available | PNG/JPEG only | Vector source discarded; warning for unavailable display fallback |
| Attachments | Recognized file bytes/name to data URL | No path | Imported files and source bytes dropped; folders/missing entries skipped |
| Map background | Selected theme fill color | Fixed default root style | Imported background not written back |
| Summaries/theme/SmartRules/OLE/spreadsheets | Not fully represented | No faithful path | Omitted |
| Unknown ZIP/XML/attributes | No retained store | No passthrough | Silent loss possible even with empty warning list |
| Preview, xsd, custom entries | Not retained | Not emitted | Dropped |

## Executable evidence

[test/phase0-mmap-audit.test.ts](../../test/phase0-mmap-audit.test.ts) adds ten synthetic loss witnesses, without modifying parser, writer or UI:

1. Unedited load/save drops custom binary, preview and schema entries.
2. Unknown XML subtree/attribute disappear without an import warning.
3. Same model writes identically, but topic IDs change on every import/export cycle.
4. Attachment imports successfully and disappears with its binary on export.
5. Explicit topic fill imports and disappears after save.
6. Full XHTML note text is flattened and written only as preview text.
7. Unrelated namespace with matching local names is accepted without warning.
8. Collapsed state is written but never read back.
9. Relationship endpoints and boundary membership survive with new topic IDs while their explicit colors disappear.
10. Task time and unmapped scheduling fields disappear; 12.5% becomes 13%.

Result: **10/10 passed**, meaning the loss was reproduced. [JUnit evidence](evidence/mmap-audit.junit.xml). These tests are explicitly named as upstream loss witnesses and must evolve when preservation is implemented; they are not the future fidelity acceptance suite.

Existing upstream `test/mmap.test.ts` has 57 cases, of which 55 ran and two real-file checks skipped. Existing round-trip checks focus on mapped fields and do not certify package/unknown preservation or MindManager acceptance. The writer itself explicitly warns that its parser strips prefixes and can accept scaffolding that a real MindManager may reject.

## Proposed follow-on, not implemented

Keep the canonical model and add a source-package/unknown-XML compatibility envelope; retain original identities; track edited domains; patch source XML where possible; keep warnings tied to actual save risks. First gather a provenance-recorded corpus and inspector evidence in Phase 1. Do not infer XML schema from the writer's own output. No real-file, schema-validity or Oracle claim is made here.
