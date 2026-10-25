# Mindloom synthetic MMAP corpus — Phase 1 Batch 2

This corpus is inspection infrastructure. Its fixtures are authored synthetic XML and tiny project-generated resources, packaged with a deterministic test builder. They are not MindManager-generated, Oracle-verified, schema-validated or round-trip-safe. They establish what the current inspector observes, not what MindManager accepts.

## Generation

```powershell
pnpm --silent mmap-corpus:generate
pnpm mmap-inspect .tmp/mmap-corpus/synthetic/08-image.mmap
pnpm --silent mmap-normalize .tmp/mmap-corpus/synthetic/08-image.mmap
pnpm exec vitest run test/mmap-corpus.test.ts test/mmap-inspector.test.ts test/phase0-mmap-audit.test.ts test/mmap.test.ts
pnpm gate
```

Use `.\tools\phase0\pnpm-local.cmd` instead of `pnpm` in the existing Windows audit workspace. A direct invocation is `node --experimental-strip-types tools/mmap-corpus-cli.ts` (Node 22.12+).

The output location is fixed at ignored `.tmp/mmap-corpus/synthetic/`. Each generated case has `.mmap`, `.inspect.json` and `.normalized.json` outputs; `index.json` lists all 14 slots with package SHA-256 values or a pending status. No ZIP binaries are hand-maintained or committed. The generator rejects symlinked output directories/files, and never extracts package paths to the filesystem. Existing files in its own output directory are regenerated; stale artifacts for a pending slot cause an error requiring inspection rather than automatic deletion.

Source: `test/fixtures/mmap-corpus/synthetic/manifest.json` and `documents/*.xml`. Manifest validation enforces 14 ordered unique IDs, explicit synthetic provenance, expected evidence, relative source locators and a disjoint pending/generated shape. Source evidence locators after `#` name code functions or descriptive test/audit findings; they are not claims of XSD authority.

## Determinism

The test builder reads the reviewed XML, normalizes source line endings to LF, uses fixed IDs/content/resource paths, sorts package entries and compresses with the existing fflate version. ZIP DOS timestamps are a fixed **local wall clock** (`1980-01-01 00:00:00`), because fflate encodes local date fields: passing the same UTC instant would encode different hours in different timezones. No current-time metadata or random IDs are emitted.

The sole binary recipe (`rgba-1x1-v1`) constructs a 1×1 opaque blue RGBA PNG from its signature, IHDR/IDAT/IEND chunks and CRCs. Its filter byte and RGBA scanline are `[0, 41, 128, 255, 255]`. It uses JavaScript zlib compression from fflate, without external assets or platform-specific encoder metadata. PNG CRCs and decompressed pixels are independently verified using Node's zlib in tests.

Reproducibility tests compare complete package bytes and normalized JSON across two generations and across UTC / Asia-Taipei subprocesses. Source LF/CRLF differences are also tested. Golden evidence consists of curated element/attribute counts, namespace lists and selected structural paths in the manifest, not blindly accepted full ZIP snapshots.

## Fixture matrix

All rows have `provenance: synthetic`. “Known” means the current inspector's evidence-based vocabulary; it does not certify MindManager validity. The minimal base is Map → OneTopic → Topic → Text, with one `root` OId and no styles, preview, archive schemas or unrelated metadata.

| ID | Isolated addition / structure | Unrecognized | Resource entries | Limitation |
|---|---|---|---|---|
| 01-root-only | Base only | none | none | Inspection baseline, not a native-file template |
| 02-three-level-tree | Root → level-1 → level-2, SubTopics | none | none | No layout semantics |
| 03-notes | NotesGroup/NotesXhtmlData + XHTML html/body/p | XHTML `b` | none | Importer flattens text; rich markup is not faithfully written |
| 04-links | One Hyperlink | none | none | Only `https://example.invalid/mindloom-fixture` |
| 05-icons | IconsGroup/Icons/Icon (`urn:mindjet:Flag`) | none | none | One evidenced stock marker, not an icon catalogue |
| 06-tags | TextLabels/TextLabel | none | none | One fixed `synthetic-tag` |
| 07-task | Priority, percentage, fixed dates, resource string | none | none | No calculations, roll-up or scheduling |
| 08-image | OneImage/Image/ImageData, Core Uri, ImageSize | none | `bin/synthetic-pixel.png` | Display size in mm is distinct from PNG raster size |
| 09-relationship | Root + child, two ObjectReference endpoints | none | none | Literal fixture IDs only; no source-identity preservation |
| 10-boundary | OneBoundary/Boundary on the root | none | none | No arbitrary span, geometry or styling inferred |
| 11-callout | Parent-level FloatingTopics/Topic/CalloutFloatingTopicShape | none | none | Importer lifts it onto the parent; current writer omits it |
| 12-floating | Map-level FloatingTopics/Topic | none | none | Placement offsets omitted: current adapters do not preserve them |
| 13-summary | **pending-format-evidence**, no XML/package | not asserted | none | Accepted adapters contain no sufficient MMAP summary encoding |
| 14-mixed | Combines notes/link/icon/tag/task/image/relationship/boundary/callout/floating and a root child | XHTML `b` | `bin/synthetic-pixel.png` | Coexistence only; inherits note/callout losses; no summary |

Each materialized row is the smallest practical addition to the common root. Relationship needs a second topic for meaningful endpoints. Callout/floating each need their own separate topic. Mixed intentionally combines structures already exercised separately, without adding new format assumptions.

## Expected evidence and references

Every generated manifest entry specifies package paths, namespace URIs, topic IDs, complete element/attribute counts, selected path counts, unknown lists and expected resource/relationship references. Tests compare these with `inspectMmap` and `normalizeMmap`, and run both actual Node CLI modes for every materialized package. Resource URIs must resolve to entries, relationship references must resolve to unique topic OIds, and no unused resource payload is allowed.

XHTML `b` is a deliberately visible unknown already encountered by the importer's generic notes-text traversal. The corpus does not change vocabulary to make the fixture appear completely recognized. The unknown wrapper does not invalidate inspection. The callout case carries a limitation and a bounded current-adapter loss assertion; no new round-trip engine or save behavior is introduced.

## Why summary is pending

The accepted importer explicitly lists summary brackets among dropped features; the writer explicitly lists summaries among omitted fields. Canonical/UI summary support is not evidence of an MMAP encoding. P0B likewise records the omission. Therefore `13-summary` has null definition/expected evidence, no resources, no fabricated element and no `.mmap` output. The builder rejects attempts to materialize it, and tests reject changing its status to generated without a source/evidence definition. This pending row is an honest corpus result, not a Batch 2 failure.

## Safety, provenance and scope

Only authored definitions are read from the checked-in corpus directory (including a real-path containment check). Resource paths are restricted to simple `bin/*.png` names and known tiny recipes. XML sources are limited to 32 KiB, resource lists to four entries; generated packages are under 4 KiB in tests. DTD/ENTITY declaration tokens are rejected before packaging or XML inspection; no external entities or network requests are needed. Normal inspector limits remain unchanged.

The manifest's compatibility/Oracle claims are explicitly false and validated. Synthetic is not MindManager-generated; known is not Oracle-verified; inspected is not round-trip-safe; writer-generated is not proof of compatibility; unknown is not invalid. No customer files, proprietary assets, schemas or external binaries were imported. No dependencies or lockfile changes are required.

This batch does not modify application import/export behavior, canonical models, the accepted Batch 1 tests or Phase 0 loss witnesses. It implements no preservation, identity mapping, dirty tracking, patch writer, mmap-diff, Oracle harness or REA research. Real corpus collection remains Batch 3 / P1D and requires separate authorization.

Results and preserved command evidence: [phase1-batch2-report.md](../../phase1-batch2-report.md).
