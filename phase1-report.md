# Mindloom ? Phase 1 consolidated report

Date: 2026-10-27 (Asia/Taipei).

**First genuine real-inspection gate met: 1 private sample; review pending. Phase 1 is not declared fully complete.** The earlier zero-source acquisition block is removed for MM-01-minimal (REAL-001). Summary remains pending-format-evidence, broader corpus coverage is incomplete, and a real writer no-op baseline has not been observed. Phase 2 is not authorized.

## Accepted baselines

| Work | Commit / state |
|---|---|
| Upstream baseline | 65964ac06937514cf9805a2b1198cc20f1e83425 |
| Phase 0 initialization | e2e3931664c45b476db75f7df9121035c8dc6654 |
| Batch 1 inspection tools | b9c1c99b26e5c7fe51b44afd50d2c775002a8e88 |
| Batch 1 accepted head | 802d2b4190f267bd1dc07956c635a202962ea2fb |
| Batch 2 / current main | 661c271e40ab4dc7d22391abea7d9db7f48b89cb |
| Batch 3 intake infrastructure | 10b66f6; feature/p1-batch3-real-corpus |

Accepted integration history remains intact. The initial discovery handoff made no commit, merge or push. The user subsequently authorized a delivery commit and push of the current feature branch to origin; main is not merged. Origin remains the only permitted push destination; upstream push is DISABLED. Historical Phase 0 Maploom naming and license/provenance records are retained.

## Completed foundations

Batch 1 provides independent bounded ZIP32 inventory, namespace-aware XML element/attribute/path counts and deterministic normalization. Recognition is distinct from validity or preservation. CRCs are declared metadata, not validated integrity. [Batch 1 report](phase1-batch1-report.md).

Batch 2 provides 14 synthetic slots, 13 reproducible packages and an honestly pending Summary slot. Byte reproducibility, resource references and structural golden facts are tested; synthetic is not Oracle evidence. [Batch 2 report](phase1-batch2-report.md).

Batch 3 provides provenance schema/guards, private local intake, reduced structural candidates and opt-in current-import counts. The 2026-10-27 resumption used that unchanged intake on a genuine user-supplied sample and updated the public registry/status to consume reviewed sanitized observations. [Batch 3 report](phase1-batch3-report.md), [intake guide](docs/format/MMAP_REAL_CORPUS.md), [feature inventory](docs/compatibility/PHASE1_FEATURE_INVENTORY.md).

## First real evidence

**MM-01-minimal / REAL-001 is private-local-only.** The original contains identity and local document-path metadata. It was never overwritten. Only a byte-identical ignored private copy was inspected; source and copy bytes/mtime were verified unchanged. No raw .mmap, preview, bundled schema, identity, local path or private fingerprint enters public evidence.

Direct xml-client document metadata states MindManager, 20.1.231, Windows. These values agree with external review but do not establish independently observed MindManager execution or Oracle verification. Generation and synthetic-content status remain unknown.

The eight-entry package has Document.xml, Preview.png, empty bin/, xsd/ and four MindManager schema resources. Application/Core/Primitive 2003 and XSI namespaces are observed; two custom declarations are redacted. Value-free inventories retain **338 elements (23 known / 315 unrecognized)**, **1,201 attributes (35 known / 1,166 unrecognized)** and **192 path groups**. Recognition was not broadened. Known tree/text and selected view/style scaffolding coexist with extensive unrecognized defaults, catalogs, metadata and custom structures.

Current import succeeds with **3 topics, zero warnings and zero other selected feature/style counts**. Unknown XML and source package preservation remain absent. The writer was not run. Zero warnings do not mean no loss.

The closest three-topic hierarchy fixture, 02-three-level-tree, partially matches vocabulary/counts but has a three-level chain; the real tree has a root and two children. 01-root-only shares the minimal root scaffold but lacks both children. Both synthetic packages omit native preview/schema/default/catalog/metadata structures. This yields an analyst SYNTHETIC_PARTIAL_MATCH and REAL_HAS_EXTRA_STRUCTURE, respectively; other feature slots remain uncovered. No Summary representation is observed.

[Structural evidence](test/fixtures/mmap-corpus/real-public/evidence/REAL-001.json) and [privacy/provenance review](test/fixtures/mmap-corpus/real-public/reviews/REAL-001.md) document the publication boundary. The registry's sensitive-metadata flag applies to reduced evidence; rawSensitiveMetadataFound is separately true. Raw-publication permission is not established. These artifacts are agent-reviewed for this handoff; final user review remains pending.

## Validation and remaining gates

Focused baseline: 142 passed / 2 existing skipped. Updated focused checks: **144 passed / 2 existing skipped** across five files. An initial full gate hit the unchanged Brainstorm panel-toggle UI test; that failure is preserved. The unchanged isolated UI suite then passed **14/14**. Final full gate **passed (exit 0): 223 files, 2,573 passed / 3 existing skipped**, coverage statements/lines **90.62%**, branches **87.25%**, functions **78.79%**, first load **182.8 KiB gzip ?184 KiB**. Details are in [validation.json](docs/audit/phase1-batch3/validation.json), [gate log](docs/audit/phase1-batch3/gate.txt) and [baseline failure](docs/audit/phase1-batch3/baseline-gate.txt). No threshold, skip or existing loss witness was weakened.

| Phase 1 gate / evidence | Result |
|---|---|
| Inspector independent of editor | PASS, Batch 1 |
| Synthetic fixtures reproducible | PASS, Batch 2 |
| Provenance and private-public workflow | Available and used |
| At least one genuine real .mmap inspected | **MET: 1**, pending user review |
| Real package/XML inventory and producer observations | Captured, metadata only; no Oracle |
| Real-vs-synthetic comparison | Captured for minimal/tree structure |
| Current-import behavior/loss projection | Captured |
| Full real writer no-op/round-trip baseline | Not observed |
| Legacy/deep/wide/large/images/attachment/mixed targets | Pending |
| Summary format discovery | **pending-format-evidence** |

No importer, writer, canonical model, knowledge vocabulary or preservation behavior changed. No source snapshot, compatibility envelope, raw XML sidecar, stable ID mapping, dirty tracking, patch writer, generic mmap-diff, Oracle harness or REA was introduced. Existing Phase 0 loss witnesses remain applicable.

**Stopped for review. Do not begin Phase 2.** This evidence removes the first-acquisition blocker; it does not certify general compatibility, real writer fidelity or full Phase 1 completion.
