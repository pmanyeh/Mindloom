# Mindloom ? Phase 1 Batch 3 report

Date: 2026-10-27 (Asia/Taipei). Scope: resumed P1D discovery for **MM-01-minimal** only; no Phase 2.

**Result: one genuine real inspection recorded; first-real-inspection gate met, pending review.** The acquisition block for the first sample is removed. This does not establish full corpus coverage, Oracle verification or a real writer no-op baseline. Summary remains **pending-format-evidence**.

## Baseline and scope

Work continues on feature/p1-batch3-real-corpus from intake-infrastructure commit 10b66f6, based on accepted Batch 2 661c271. Main remains at Batch 2. Discovery was initially handed off without a commit or push. The user subsequently authorized committing these changes and pushing this feature branch to origin only; the delivery commit SHA is supplied separately. No merge into main is authorized. The user's 2026-10-27 instruction supersedes the previous no-source outcome. Prior Batch 1/2 and Phase 0 reports retain their historical results.

The existing provenance validator, intake, inspector, normalizer and knowledge vocabulary were reused unchanged. Only reviewed-evidence status reporting, public registry/evidence, policy regression tests and documentation were updated. Importer/writer/model, synthetic fixture definitions, existing loss witnesses, dependencies, lockfile and gates are unchanged. Remote defaults are origin and upstream push DISABLED; discovery itself made no push; the authorized delivery is limited to the current origin feature branch.

## Custody, provenance and privacy

- User-facing sample: **MM-01-minimal**; existing schema's opaque registry ID: **REAL-001**. Class: **private-local-only**. Content origin is not assumed synthetic; generation remains null.
- The workspace original was read only. A byte-identical copy is in ignored .tmp/mmap-corpus/real-private/originals/. Source/copy bytes and mtime were verified unchanged after reinspection. Source location, full inspection/normalization, raw hash, permission and custody records remain private.
- Initial copy selection accidentally chose a different nearby map. Its private outputs were isolated and excluded. The matching three-topic/eight-entry workspace candidate was then rerun through intake and both CLI modes. Only that corrected inspection counts.
- The raw contains identity and local document-path metadata. Neither raw package nor private fingerprint is published. Preview and XSD payloads are not copied into the public corpus. No embedded attachment is opened or executed.
- Public output contains reviewed structural names/counts only, eight fixed standard package paths and producer metadata. General values, source text, identities, machine/local/UNC paths, CRCs/sizes and all fingerprints are omitted. Non-allowlisted custom names/URIs remain redacted. The original itself is not sanitized.
- Registry privacy flags refer to the reduced evidence. The evidence separately states rawSensitiveMetadataFound=true. Raw publication permissionVerified/publicCommitAllowed remain false; this is not a claim that the original is safe.

[Registry](test/fixtures/mmap-corpus/real-public/manifest.json), [structural evidence](test/fixtures/mmap-corpus/real-public/evidence/REAL-001.json), [publication review](test/fixtures/mmap-corpus/real-public/reviews/REAL-001.md).

## Producer evidence and Oracle boundary

Document.xml contains an xml-client processing instruction: name=MindManager, version=20.1.231, platform=Windows. These exact fields were read locally and agree with the supplied external review. They are **observed document metadata**, not a version inferred from namespaces, proof against forged metadata, installation/license evidence, an independently observed application run, Oracle verification or compatibility certification. No MindManager run, COM, Oracle harness or REA was performed.

## Package, namespaces and inventories

Exactly eight entries:

| Entry | Observation |
|---|---|
| Document.xml | Root document; supported ZIP32 and XML inspection passed |
| Preview.png | Preview entry; payload not published or visually inspected |
| bin/ | Empty directory, no binary resources |
| xsd/ | Schema directory |
| xsd/MindManagerApplication.xsd | Schema resource, not XSD-validated |
| xsd/MindManagerCore.xsd | Schema resource, not XSD-validated |
| xsd/MindManagerDelta.xsd | Schema resource, not XSD-validated |
| xsd/MindManagerPrimitive.xsd | Schema resource, not XSD-validated |

Application/Core/Primitive 2003 and W3C XML Schema-instance namespaces are observed. Two additional custom/compatibility declarations remain redacted in public evidence. No inference about other version generations is made. Compression methods 0 and 8 are observed; declared CRCs are not an integrity certification and remain private.

| Inventory | Groups | Occurrences | Known occurrences | Unrecognized occurrences |
|---|---:|---:|---:|---:|
| Elements | 111 | 338 | 23 | 315 |
| Attributes | 326 | 1,201 | 35 | 1,166 |
| Structural paths | 192 | 338 | ? | ? |

Full reduced path/namespace/count evidence and reviewed value-free vendor element/attribute inventories are in REAL-001.json. Recognition remains context-sensitive: DefaultColor/DefaultText/Font may be known under one parent and unrecognized under another. Known structures include Map/OneTopic/Topic/SubTopics, Text, topic views, offsets and selected style/default scaffolding. Unrecognized structures include DocumentGroup/DocumentPath/Creator/LastModificator, default groups, catalogs, conditional formatting, map views, Core Custom and extension attributes. These names describe format fields, never their private values. Unknown means outside current adapter vocabulary, not invalid.

Task/marker/boundary/callout default catalogs do not establish live instances of those features. No Summary-named element or observed Summary representation occurs. No vocabulary was broadened to reduce unknown counts.

## Current-import behavior and loss baseline

The existing bounded opt-in importer ran successfully: **3 topics**, **0 warnings**, and **0** notes, links, markers, tags, tasks, images, attachments, callouts, explicit node styles, relationships, boundaries and floating topics. Summary count remains null by policy, not zero.

The real XML contains extensive defaults/metadata/custom structure absent from the selected canonical projection. Combined with the unchanged P0B code audit and loss witnesses, this records the current unknown/package preservation gap. A zero-warning import is not a fidelity guarantee. Source package and unknown XML are not retained by the current importer. No writer was invoked; writer-output package/ID differences and full no-op round-trip on this real source remain **NOT OBSERVED ON REAL INPUT**. No preservation fix was attempted.

## Comparison with Batch 2

Closest by topic count and hierarchy vocabulary: **02-three-level-tree**. Both have three Topic occurrences in Application/2003. The real map is a two-level fork (root + two children); the synthetic map is a three-level chain. Classification: **SYNTHETIC_PARTIAL_MATCH**. This is not evidence for a genuine three-level map.

Secondary minimal baseline: **01-root-only** shares Map/OneTopic/Topic but lacks the two children. Classification: **REAL_HAS_EXTRA_STRUCTURE**. Both synthetic packages omit real preview/schema resources, style/default catalogs, views, document metadata and extensions. A one-Document.xml synthetic package is an isolated probe, not an authentic native template. Neither fixture was changed. The other 12 slots lack relevant real feature samples; Summary remains pending-format-evidence.

Status reporting now consumes explicitly reviewed evidence, rather than promoting operator declarations into matches. It reports one reviewed inspection and the two analyst comparisons. Metadata-only records still yield UNKNOWN; empty registries remain BLOCKED. Public tests inspect sanitized artifacts without requiring the private package.

## Validation

Dependencies installed with corepack pnpm install --frozen-lockfile (pnpm 11.0.9; Node 24.19.0; Windows x64). The older ignored local helper toolchain is absent in this checkout; Corepack supplied the package.json-pinned pnpm without changing machine PATH.

Pre-change focused baseline: **142 passed / 2 existing skipped**, five files. Initial full gate: **exit 1**, 2,570 passed / 1 failed / 3 existing skipped. The unchanged app-integration test could not find Brainstorm in its panel-toggle case. Failure evidence is retained, with no weakening of test or gate.

Post-change focused checks: **144 passed / 2 existing skipped**, five files; intake suite 23 tests. Two new checks cover reviewed-evidence counting/comparisons and privacy/count consistency. Existing zero-acquisition policy checks now use an explicit empty registry, preserving that regression independently of the live registry's one record.

Final full gate: **PASS, exit 0; 223 files, 2,573 passed / 3 existing skipped**. Typecheck, Biome, Knip, feature catalogue, coverage, Vite/PWA build and size gate all passed. Coverage: statements/lines **90.62%**, branches **87.25%**, functions **78.79%**. First load **182.8 KiB gzip ?184 KiB**. Isolated unchanged UI suite: **14/14 passed**. Existing warnings are retained.

Evidence: [validation.json](docs/audit/phase1-batch3/validation.json), [focused](docs/audit/phase1-batch3/focused.txt), [JUnit](docs/audit/phase1-batch3/focused.junit.xml), [full gate](docs/audit/phase1-batch3/gate.txt), [initial gate failure](docs/audit/phase1-batch3/baseline-gate.txt), [isolated UI rerun](docs/audit/phase1-batch3/ui-rerun.txt), [status/comparison](docs/audit/phase1-batch3/status.json.txt). Logs remove local workspace/profile/hostname and ANSI codes, normalize line endings/trailing whitespace, and escape XML placeholders; counts, warnings and failures remain. No private-source-dependent test is claimed as CI-reproducible.

## Acceptance and stop

| Gate | Result |
|---|---|
| At least one genuine .mmap inspected | **MET: 1**, subject to review of provenance/privacy evidence |
| Provenance/private-public separation | Recorded; raw and hashes remain private |
| Real inventory and synthetic comparison | Captured as reviewed structural evidence |
| Current-import behavior/loss projection | Captured; no silent preservation claim |
| Real writer no-op baseline | Not observed |
| Remaining seven target classes | Pending |
| Summary representation | **pending-format-evidence** |
| Oracle execution/round-trip safety | Not verified |
| Importer/writer/model/knowledge changes | None |
| Phase 2 | **Not started** |

Stop for user review. Broader acquisition, Summary discovery, writer/no-op and Oracle work remain evidence gaps, not authorization to proceed. Do not begin Phase 2.
