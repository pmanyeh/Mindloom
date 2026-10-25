# ADR-001 — Retain MindMap Studio as Maploom's editor foundation

Date: 2026-10-25. Status: **Accepted for local development, with release conditions**.

## Decision

**KEEP MINDMAP STUDIO** at upstream commit `65964ac06937514cf9805a2b1198cc20f1e83425`. Use its React/TypeScript editor, canonical model and React Flow projection. Develop MapBridge as a distinct compatibility layer in subsequent authorized phases. Do not treat its current MMAP writer as a fidelity-preserving save path.

## Evidence

- Original frozen-lockfile install and full gate pass on Windows/Node 24.22.1: 219 files, 2,484 passed, 3 external-file tests skipped; typecheck/lint/deadcode/coverage/build/size checks passed.
- `MindMapDoc`/`MapNode`, pure projection, adapter modules, native JSON and IndexedDB storage already provide the separation required by the plan.
- Ten additional synthetic tests reproduce unknown XML/package loss, unstable source identity, attachment/style loss, notes flattening, namespace acceptance and task normalization.
- Software is Apache-2.0. Runtime graph uses permissive licenses. Separate book content is CC BY-NC and is copied into default build output. Toolchain includes MPL-2.0 components. See P0C for exact scope and evidence limits.

## Options

| Option | Assessment |
|---|---|
| A. MindMap Studio | Selected. Build/test evidence exists; editor, persistence and adapters are already separated; MMAP preservation still substantial work. |
| B. Mind Elixir Core | Deferred fallback. Not fetched/built/audited in this phase, so no unsupported license/technical comparison is used to reject it. It would still require MapBridge. |
| C. Fresh React Flow core | Deferred fallback. No evidence that replacing the working editor reduces the compatibility work; would add editor/persistence implementation scope. |

## Conditions and consequences

1. Retain upstream license/notice files and provenance; no AGPL implementation or proprietary binaries added.
2. Exclude CC BY-NC book source/PDF/EPUB from a future commercial/permissive Maploom release, or obtain appropriate permission. Current `dist/` is local audit output, not an approved distributable. Review MPL/build-data notices before distributing tooling/artifacts.
3. Establish corpus/inspection, unknown preservation, stable source identity, save-risk reporting and independent MindManager Oracle results before claiming round-trip safety.
4. Verify compatibility-envelope survival through JSON, IndexedDB, undo and edit operations. Current object-spread behavior is a useful hook, not a guarantee.
5. Keep current UI and adapters intact during Phase 0. No preservation implementation or UI redesign in this audit.

The decision is about a development foundation, not compatibility certification or blanket redistribution permission. If packaging/license scope cannot meet Maploom's chosen distribution model, revisit A before release.

## Phase boundary

Phase 0 deliverables are ready for review. Next recommended work is Phase 1 corpus/inspector after review, per `MAPLOOM_MASTER_PLAN.md` sections 20 and 30. No Phase 1 work is included.
