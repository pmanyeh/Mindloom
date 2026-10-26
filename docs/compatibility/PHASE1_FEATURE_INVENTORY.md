# Phase 1 feature inventory

Phase 1 result: **BLOCKED ON REAL-CORPUS ACQUISITION**.

Derived by `pnpm --silent mmap-real:status --format markdown` from the synthetic/real manifests and the accepted P0B code audit. Metadata declarations alone do not prove real provenance. No genuine real sample has been supplied in this batch.

| Feature | Synthetic Evidence | Real Evidence | Current Parser | Current Writer | Unknown Preservation | Status | Notes |
|---|---|---|---|---|---|---|---|
| Root / text | 01-root-only: generated | NO_REAL_SAMPLE | parsed | emitted; IDs regenerated | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Topic hierarchy | 02-three-level-tree: generated | NO_REAL_SAMPLE | parsed | emitted | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Notes | 03-notes: generated | NO_REAL_SAMPLE | XHTML flattened to text | preview text only | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Hyperlinks | 04-links: generated | NO_REAL_SAMPLE | primary safe URL | primary safe URL | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Icons / markers | 05-icons: generated | NO_REAL_SAMPLE | curated mapping | curated mapping only | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Tags | 06-tags: generated | NO_REAL_SAMPLE | names only | names only | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Tasks | 07-task: generated | NO_REAL_SAMPLE | selected fields; dates truncated | selected fields; progress rounded | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Images | 08-image: generated | NO_REAL_SAMPLE | selected raster images | PNG/JPEG subset; metadata rewritten | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Relationships | 09-relationship: generated | NO_REAL_SAMPLE | endpoints/selected style | endpoints/label; style lost | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Boundaries | 10-boundary: generated | NO_REAL_SAMPLE | subtree/selected style | exact subtree only; style lost | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Callouts | 11-callout: generated | NO_REAL_SAMPLE | lifted to parent annotations | omitted | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Floating topics | 12-floating: generated | NO_REAL_SAMPLE | detached trees; position lost | detached trees; position lost | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Summary | 13-summary: pending-format-evidence | NO_REAL_SAMPLE | not parsed | omitted | NO | PENDING_FORMAT_EVIDENCE | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Attachments | static audit / existing unit tests only | NO_REAL_SAMPLE | recognized file payloads | omitted | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Styles / layout | static audit / existing unit tests only | NO_REAL_SAMPLE | selected explicit styles | mostly omitted/defaulted | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |
| Unknown extensions | static audit / existing unit tests only | NO_REAL_SAMPLE | not retained | not preserved | NO | SYNTHETIC_OR_STATIC_ONLY | P0B/accepted tests describe current code; no Oracle or real-file fidelity claim. |

`SYNTHETIC_OR_STATIC_ONLY` is not real-file verification. `PENDING_FORMAT_EVIDENCE` is not DISCOVERED/PARSED. No new structures are marked known merely because they are observed. Unknown preservation is absent; Phase 2 is not authorized.
