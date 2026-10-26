# Mindloom — Phase 1 consolidated report

日期：2026-10-26（Asia/Taipei）。

**Phase 1 result: BLOCKED ON REAL-CORPUS ACQUISITION — NOT COMPLETE。**

Batch 1 與 Batch 2 已通過技術審閱並整合進 main；Batch 3 的 intake 基礎設施已提供，但使用者確認暫無 genuine `.mmap` 來源。沒有真實 evidence 就不能完成 Phase 1 gate，也不能將 synthetic tests 宣稱為 MindManager compatibility。

## Accepted baselines

| Work | Accepted commit / state |
|---|---|
| Upstream software baseline | `65964ac06937514cf9805a2b1198cc20f1e83425` |
| Phase 0 / repository initialization | `e2e3931664c45b476db75f7df9121035c8dc6654` |
| Batch 1 inspector / XML inventory / normalizer | `b9c1c99b26e5c7fe51b44afd50d2c775002a8e88` |
| Batch 1 documentation alignment | `802d2b4190f267bd1dc07956c635a202962ea2fb` |
| Batch 2 synthetic corpus / current main | `661c271e40ab4dc7d22391abea7d9db7f48b89cb` |
| Batch 3 work branch | `feature/p1-batch3-real-corpus`; exact handoff commit supplied with delivery |

Both integrations were normal fast-forwards to origin/main; accepted history is intact. Main CI after Batch 2 integration passed. Upstream remains fetch-only with push disabled.

## Batch 1 — inspection foundation

Editor-independent ZIP32 inventory, namespace-aware ordered XML counts/paths and deterministic normalization exist. Package/XML validity and vocabulary recognition are distinct. Unknown does not mean invalid. ZIP metadata reports declared CRCs without claiming verification; bounds/size/depth limits remain in force.

The internal evidence covers namespaces, aliases/rebinding, package entries, preview/bin/xsd classification, unknown structures, malformed files and deterministic JSON. Batch 1 full local gate: 2,526 passed / 3 skipped. [Batch 1 report](phase1-batch1-report.md) and [inspector documentation](docs/format/MMAP_INSPECTOR.md).

## Batch 2 — synthetic corpus

Fourteen manifest slots exist. Thirteen packages are reproducibly built from readable, provenance-labelled synthetic XML and one project-created tiny PNG. `13-summary` stays `pending-format-evidence` because accepted source does not establish an MMAP summary encoding. Golden evidence is structural counts/paths/references, not Oracle evidence.

Generation is byte-identical across repeated runs, UTC / Asia-Taipei and LF/CRLF sources. Resource references, relationship endpoints and negative compatibility claims are tested. Batch 2 full local gate: 2,550 passed / 3 skipped; GitHub CI passed. [Batch 2 report](phase1-batch2-report.md) and [synthetic corpus guide](docs/format/MMAP_SYNTHETIC_CORPUS.md).

## Batch 3 — real acquisition and intake

There are **zero genuine real samples**, no public package, no private sample admitted to the registry and no observed producer version/platform/generation. All eight real target classes remain pending. The user explicitly selected the no-source outcome. No questionable download or blind rewriting was used to manufacture evidence.

Delivered: machine-readable manifest/schema, explicit provenance/publication guards, ignored private local intake, sanitized structural candidates, optional bounded current-import counts, deterministic missing-evidence comparison and [feature inventory](docs/compatibility/PHASE1_FEATURE_INVENTORY.md). Intakes are operator-declared; structural success alone cannot prove the source was MindManager-generated. Publication still requires permission/privacy review. Raw hashes and raw-normalized fingerprints from private samples stay local.

The 14 synthetic-vs-real rows all say `NO_REAL_SAMPLE`; real package paths, namespaces and extra metadata are null. Summary has **not** advanced to DISCOVERED. The real-input no-op/loss baseline is **NOT OBSERVED**, and code-level/manufactured runner tests are not a substitute. [Batch 3 report](phase1-batch3-report.md) and [real intake guide](docs/format/MMAP_REAL_CORPUS.md).

## Known and unrecognized structures

The current vocabulary reflects accepted adapter evidence for topic/text, selected notes/links/icons/tags/tasks/images, relationships, subtree boundaries, callouts and floating topics. It is a limited code vocabulary, not a MindManager schema. Synthetic notes deliberately expose an unrecognized XHTML `b` wrapper; future unfamiliar namespaces/names are not automatically marked known.

`Document.xml`, Preview, bin/xsd and resource-like paths have documented **inspection classification rules** and synthetic tests. They are not observations that real files always use these layouts. There are no actual real unknown-entry/element/attribute lists or namespace/version observations in this phase result. The private workflow will retain such detail locally; publication candidates deliberately redact private names/URIs.

## Loss, security and privacy constraints

Existing importer/writer/model behavior is unchanged. Phase 0 loss witnesses still demonstrate unknown XML/ZIP/resource loss, attachment/style loss, regenerated IDs and normalization of notes/tasks. There is **no unknown preservation**, source snapshot, raw-XML sidecar, stable identity mapping, dirty tracking or patch writer.

Original inputs are read-only evidence and never overwritten. No attachment is extracted/executed. ZIP32/size/depth constraints remain; intake adds DTD/entity token rejection and total-resource bounds before the optional importer. A limit conflict is evidence, not permission to weaken limits or repair a source. Current software/book licensing and distribution restrictions recorded in Phase 0 remain applicable.

## Validation and Phase 1 gate

Batch 3 tooling validation passed: focused **142 passed / 2 skipped** across five files, including **21 new manufactured workflow/security tests**. Full `pnpm gate` passed: **223 files, 2,571 passed / 3 existing skipped**; coverage statements/lines **90.59%**, branches **87.23%**, functions **78.79%**. First load is **182.8 kB gzip ≤184 kB**. Existing large-chunk warnings remain; no gate/coverage threshold or existing witness was weakened. [Exact validation metadata](docs/audit/phase1-batch3/validation.json) and [full gate output](docs/audit/phase1-batch3/gate.txt) preserve the results.

These are infrastructure checks, with **zero real inspections**. Tooling success cannot change the result below:

| Phase 1 gate | Result |
|---|---|
| Inspector works without editor | PASS (Batch 1) |
| Synthetic fixtures reproducible | PASS (Batch 2) |
| Known/unknown vocabulary and feature inventory | Available, synthetic/static scope |
| Provenance/public-private workflow | Available (Batch 3 tooling) |
| Genuine real package/XML inventory and versions | **BLOCKED** |
| Real-vs-synthetic observed comparison | **BLOCKED** |
| Real-input no-op/loss baseline captured | **BLOCKED** |
| Summary format discovered | **BLOCKED ON EVIDENCE** |

## Recommendation for Phase 2

**Do not begin Phase 2.** First acquire at least one legitimately usable real package (prefer controlled synthetic content saved in licensed MindManager), inspect it privately, establish publication permissions/privacy boundaries, capture its current-import loss baseline and compare it with synthetic assumptions. Extend legacy/deep/wide/large/images/attachments coverage as legitimate sources become available. A controlled Summary/no-summary pair is high value when a real producer becomes available.

No general Oracle harness, REA or compatibility repair was started. This report consolidates Phase 1's completed infrastructure and incomplete evidence; it is not a claim of Phase 1 completion. Explicit user authorization is required before Phase 2 — Compatibility Envelope.
