# Mindloom working rules

`MINDLOOM_MASTER_PLAN.md` v2.0 is authoritative: build on MindMap Studio, first reach MindManager functional/workflow parity, then deliberately improve into an independent Mindloom product. Product Parity is the active primary track; format compatibility is an important supporting track. Read the plan and phase reports before changing scope. Engineering order: Data Safety > Correctness > Workflow Fidelity > Compatibility > Performance > Visual Polish.

Current authorization (2026-10-28): preserve accepted Batch 3 head `c9f802d07bc7eece0b47b89f4d034934b67f4265` through the verified `661c271 → 10b66f6 → c9f802d` ancestry, fast-forward main with `--ff-only`, push only origin and verify CI; then use `feature/roadmap-v2-product-parity` for **Phase 2 — Product Parity Baseline, audit/planning only**. Deliver the v2 plan, parity matrix, UI surface map, MindMap Studio capability baseline, behavior protocol, `phase2-parity-baseline-report.md`, validation and one recommended first implementation batch; then stop for review. Do not implement UI features, redesign production source, start Summary reverse engineering, Compatibility Envelope, Preserve Unknown or Oracle implementation. No later phase or suggested batch is implicitly authorized. Old v1 Phase 2 meant Compatibility Envelope; that work now belongs to v2 Phase 9 and is still unauthorized.

Preserve Phase 0/1 reports and existing `docs/audit/` as historical evidence. Phase 1 is FOUNDATION COMPLETE in the v2 strategic sense, not a retroactive claim that all original fidelity/Oracle gates passed. Summary encoding remains pending-format-evidence. REAL-001 / MM-01-minimal stays private-local-only: never commit raw packages, identities, source paths or private fingerprints; producer/version/platform remain observed document metadata, not Oracle verification. The v1 master plan is archived unchanged under `docs/history/`. Historical Phase 0 documents retain the former Maploom name.

Before proposing implementation, inspect existing source/tests and classify KEEP / ADAPT / EXTEND / REPLACE / UNKNOWN. Do not guess MindManager behavior or treat “MindManager-style” source comments as reference evidence. Record unobserved behavior as UNKNOWN. Research only until decisions are clear; reuse the smallest existing capability. Replicate observable behavior, never proprietary source, binaries, branding or restricted assets.

## Remote policy (explicit user instruction)

Push changes only to `origin`, `https://github.com/pmanyeh/Mindloom.git`. Never push any changes to `upstream` (`dannbleeker/mindmap-studio`); use it only for reading/fetching. Keep `remote.pushDefault=origin` and `remote.upstream.pushurl=DISABLED` in this checkout. Verify remotes before any push; do not enable upstream pushes.

- Upstream baseline is `65964ac06937514cf9805a2b1198cc20f1e83425`; retain provenance, `LICENSE`, `LICENSE-BOOK` and `NOTICE.md`.
- Software is Apache-2.0; the book is separately CC BY-NC 4.0. Default build output contains that book. Resolve artifact scope before product redistribution.
- Inspect, document, then implement. Prefer additive changes and keep format preservation separate from UI projection.
- Never silently discard unknown XML/package resources. Current MMAP adapters are lossy; see `docs/audit/P0B_MMAP_AUDIT.md`.
- Original research `.mmap` files are read-only; write separate output files. Use synthetic or properly sanitized/licensed fixtures only.
- Do not add proprietary binaries or AGPL implementation to the core. Stop on actual legal/provenance blockers.
- Compatibility claims require tests; only an independently observed MindManager run can support an Oracle claim.
- `test/phase0-mmap-audit.test.ts` deliberately asserts current upstream losses. A passing loss witness is not a fidelity guarantee; update it when preservation is implemented.
- Use `pnpm install --frozen-lockfile` and required checks from `package.json`. Preserve/report baseline failures before fixes. Do not weaken tests or gates to manufacture a pass.
- Local audit tooling lives in ignored `.tmp/phase0-toolchain`; `tools/phase0/pnpm-local.cmd` uses it without changing machine PATH. No portable development binaries belong in source commits.
