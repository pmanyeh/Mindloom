# Mindloom working rules

Read `MINDLOOM_MASTER_PLAN.md` and the phase reports before changing scope. Batch 2 head `661c271e40ab4dc7d22391abea7d9db7f48b89cb` is integrated into `main`. The user has resumed Phase 1 Batch 3 discovery with MM-01-minimal (registry REAL-001), private-local-only. Use the existing intake workflow; publish sanitized structural evidence only, never the raw package, identities, local paths or private fingerprints. Producer/version/platform are observed document metadata, not Oracle verification. Do not modify importer/writer/model or broaden knowledge merely to reduce unknowns. Summary remains pending-format-evidence. Stop with updated `phase1-batch3-report.md`, `phase1-report.md` and focused/full gate evidence for review; do not begin Phase 2, preservation, writer fixes or a general Oracle harness. Historical Phase 0 documents retain the former Maploom name.

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
