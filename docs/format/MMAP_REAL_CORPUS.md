# Real MMAP corpus intake — Phase 1 Batch 3

**BLOCKED ON REAL-CORPUS ACQUISITION.** The user confirms that no genuine `.mmap` source is currently available. The registry contains zero samples. No map, version, summary encoding, real comparison or real-input no-op baseline has been observed. Tests of this workflow use manufactured probes and must not be counted as real evidence.

## Acquisition and provenance

All real files are private until reviewed. A file being present on disk or downloadable is not publication permission. Do not use the current lossy writer to sanitize a real package. Prefer intentionally synthetic content saved by a legally licensed MindManager installation; check its hidden/machine/application metadata before publication. No installation, commercial binary or general Oracle harness is supplied by this workflow.

| Class | Required provenance / use |
|---|---|
| `mindmanager-generated-synthetic-content` | Genuine MindManager save with deliberately synthetic content; record producer/version where actually known. Installation presence alone does not establish licensing. |
| `sanitized-real-world` | Clear rights to inspect/use the real source plus a separately documented sanitization procedure and review of what changed. Never run it through our writer as a sanitization shortcut. |
| `public-authorized-sample` | Public source with explicit test-input permission/license evidence. Downloadability is insufficient. |
| `private-local-only` | Legitimate local inspection only; no committed raw package, original filename, local path, raw package hash or raw-normalization hash. |

No automatic acquisition or promotion is implemented. A future custodian must record source/permission evidence, inspect all metadata/resources, and review any publication candidate. Tests of policy flags cannot prove permission. Do not open/execute embedded attachments; inventory them in memory.

## Registry and schema

`test/fixtures/mmap-corpus/real-public/manifest.json` is the committed public registry; `manifest.schema.json` describes its data shape. `tools/mmap-real/manifest.ts` adds runtime cross-field/cross-record and sensitive-marker checks. Missing fields, arbitrary extra fields (including an accidental `inputPath`), traversal/absolute paths, email markers, unsafe publication flags and private hashes are rejected.

Every record requires an opaque `REAL-nnn` ID, provenance class, nullable producer/version/platform/generation, source description, permission evidence, acquisition method, public/raw/sanitized/content flags, inspection status, nullable approved fingerprints, feature intent, limitations and publication-review evidence. A namespace does not establish a producer version. Unknown fields remain null, not guessed. Raw files can be referenced only as `packages/REAL-nnn.mmap`, evidence as `evidence/REAL-nnn.json`, and review records as `reviews/REAL-nnn.md`.

Raw publication requires explicit permission/privacy review, no sensitive metadata found, a review record and a package fingerprint. Private-local-only records cannot publish raw or correlating normalized hashes. Even sanitized structural candidates require privacy review before a committed evidence reference. These checks are necessary policy guards, not proof that a reviewer has examined every sensitive field.

The eight target classes are modern-minimal, modern-feature-mixed, deep-map, wide-map, large-map, multiple-images, attachment and legacy. Status distinguishes acquired, local-only, pending and unavailable; current targets are all pending. No real files belong under the synthetic corpus directory. Do not treat previous `.tmp/` synthetic outputs as acquired real packages.

## Local-only workflow

```powershell
pnpm --silent mmap-real:status
pnpm --silent mmap-real:status --format markdown
```

`status` exits 0 when the registry/report was read successfully, even when its explicit Phase 1 result is BLOCKED. It does not certify completion. The status includes 14 synthetic-vs-real rows, all currently `NO_REAL_SAMPLE`, with observed real paths/namespaces/extra structure set to null. Declared future metadata without analyst comparison yields `UNKNOWN`, never an automatic match. The supported comparison vocabulary includes `SYNTHETIC_MATCH`, `SYNTHETIC_PARTIAL_MATCH`, `REAL_HAS_EXTRA_STRUCTURE`, `SYNTHETIC_ASSUMPTION_WRONG`, `NO_REAL_SAMPLE` and `UNKNOWN`; this unavailable-data workflow does not invent observations for the first four categories or implement a generic `mmap-diff`.

After a legitimate source becomes available, copy `tools/mmap-real/local-intake.example.json` into ignored `.tmp/mmap-corpus/real-private/`. Fill `inputPath` **only in that private copy**, record local inspection permission/evidence and the opaque ID, and explicitly choose whether to capture the current importer baseline. The example is deliberately invalid until filled: it grants no permission and contains no input path. Producer/version/platform are operator-declared nullable fields, not inferred from XML names.

```powershell
pnpm mmap-real:intake .tmp/mmap-corpus/real-private/intake.json
```

On this machine use `.\tools\phase0\pnpm-local.cmd` in place of `pnpm`. Node 22.12+ with the existing TypeScript-stripping flag is used; no new dependencies are installed. All output is under `.tmp/mmap-corpus/real-private/REAL-nnn/`:

| File | Privacy / purpose |
|---|---|
| `inspection.private.json` | Full package/XML inventory, including possibly sensitive names/namespaces; keep local |
| `normalized.private.json` | Full deterministic inspection; keep local |
| `package-sha256.private.txt` | Correlating raw package hash; keep local |
| `permission.private.json` | Original private configuration and permission text; keep local |
| `sanitized-structure.candidate.json` | Reduced structural report; still a local review candidate, never auto-committed |

The input is opened for reading only. No `.mmap` copy or rewritten map is emitted; no attachment is extracted. Inputs within their own derived-output directory are rejected, and output cannot overwrite a symlink/non-file/hard-linked file. Reusing an ID for different package bytes is rejected. The original hash is checked again after output, and tests verify bytes/mtime remain unchanged. The private permission record retains the source path; publication candidates omit it.

## Sanitized candidate boundary

Candidates omit original filenames, entry paths, CRCs, sizes, source text, attribute values, IDs, permission text, namespace prefixes and raw/normalized package fingerprints. Unknown names/URIs and path segments collapse to `[unrecognized]`; only current-vocabulary names in a small explicit public namespace allowlist survive. That allowlist is a privacy policy, not a vocabulary expansion. Counts/classes and coarse document placement remain. Aggregation operates on count groups rather than expanding every occurrence into memory.

A SHA-256 over the reduced shape is labelled `sanitizedStructuralFingerprint`; it is not the raw-normalization fingerprint. Even structural topology/counts can correlate information, so the candidate carries `publicCommitAllowed: false` and `candidate-requires-human-review`. Do not blindly copy it to Git. Local full reports retain details needed for future private discovery; the sanitizer does not modify the package or canonical model.

## Security and current-import loss baseline

The intake reuses the unchanged ZIP32 bounds/64 MiB package/16 MiB Document/10,000-entry/100-level inspector limits. It preflights Document.xml and conservatively rejects DTD/ENTITY declaration tokens, including tokens inside comments, before XML inventory. No external entity is fetched. Encrypted/unsupported/malformed archives and observed limit conflicts are rejected or recorded as failed inspection, not silently repaired. Archive paths are never used as filesystem output paths.

`captureCurrentImport: true` optionally loads the existing Mindloom importer in a plain Node process, only after successful bounded inspection and after checking the total uncompressed size ≤64 MiB, each entry ≤16 MiB and compression methods 0/8. The native TS runner uses a narrowly scoped local extension-resolution hook for existing extensionless `src/` imports; no importer or model file is changed. It never invokes MindManager, COM, the writer or save/repair logic.

The optional baseline contains success/failure, selected canonical feature counts and warning count. Summary count stays null because the parser cannot establish it. It stores no canonical text/IDs in the candidate and does not call successful serialization a round-trip. With no genuine input, the actual Phase 1 no-op baseline remains **NOT OBSERVED ON REAL INPUT**.

## Publication review and evidence gaps

Before publishing a genuine package, review names/emails/URLs, project/client names, local paths, user/machine/author/document metadata, notes, hidden/custom XML, images/embedded files, external links, attachment filenames and application/version metadata. Record the permission/privacy review in the registry's approved relative review record. Verify public package and normalized fingerprints only when publication of those fingerprints is itself approved. Private originals and correlating hashes stay outside Git.

No samples or versions were acquired here. Package layouts, namespace generations, extra entries/attributes, relationships/boundary/callout wrappers, real notes representation, resource URI forms and Summary are all unobserved. No synthetic fixture or `knowledge.ts` rule is changed to hide this gap. Summary remains `pending-format-evidence`, not DISCOVERED, PARSED, editable or writable.

See [the Batch 3 report](../../phase1-batch3-report.md), [Phase 1 consolidation](../../phase1-report.md) and [feature inventory](../compatibility/PHASE1_FEATURE_INVENTORY.md). Real evidence is required before Phase 1 can pass. Phase 2 remains unauthorized.
