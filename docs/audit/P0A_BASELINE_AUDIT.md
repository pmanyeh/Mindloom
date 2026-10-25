# P0A — Baseline audit

Audit date: 2026-10-25 (Asia/Taipei). Result: **PASS WITH WARNINGS** for a local software baseline.

## Identity and integrity

- Upstream: https://github.com/dannbleeker/mindmap-studio, `main`.
- Commit: `65964ac06937514cf9805a2b1198cc20f1e83425` (2026-10-19, `chore(stats): refresh stats [skip ci]`).
- Local branch: `feature/p0-baseline`, tracking `upstream/main`.
- Root software license: Apache-2.0; separate book license: CC BY-NC 4.0.
- Original workspace contained only `MAPLOOM_MASTER_PLAN.md`. Initialized Git locally, fetched upstream, and checked out its history without replacing the plan. No GitHub fork/push/publish was performed.
- Verified upstream `src/`, existing tests, package/config files and lockfile were unchanged before running the original gate. Audit additions are separate files.

## Toolchain

Windows x64; Git 2.54.0.windows.1; Node 24.22.1; npm 11.19.1; pnpm 11.0.9 (matches `packageManager`). The shell initially had no Node/npm/pnpm. Downloaded the official portable Node archive into ignored `.tmp/phase0-toolchain`, verified SHA-256 against that release's official `SHASUMS256.txt`, and installed pnpm locally. No system installation or persistent PATH modification.

Node archive: `node-v24.22.1-win-x64.zip`. Release checksums: https://nodejs.org/dist/v24.22.1/SHASUMS256.txt. Exact observed archive hash is in [baseline-metadata.json](evidence/baseline-metadata.json).

Upstream CI uses Ubuntu and Node 22. Local Node 24/Windows results establish only the tested environment. Initial setup encountered a pnpm executable-path mistake and PowerShell's script execution restriction; corrected the helper to `.cmd` without changing execution policy or application code. Neither was an application build/test failure.

## Original gate evidence

Ran `pnpm install --frozen-lockfile`, then the unmodified `pnpm gate` before adding audit tests. Install: exit 0; 530 installed package instances. Gate: exit 0.

| Original gate stage | Observed result |
|---|---|
| `tsc --noEmit` | PASS |
| `biome check .` | PASS, 506 files, no fixes |
| `knip` | PASS |
| `check-feature-coverage.mjs` | PASS, 256 features, 470 changelog bullets |
| `vitest run --coverage` | PASS, 219 files, 2,484 passed, 3 skipped |
| Coverage thresholds | PASS: statements/lines 90.43%, branches 87.05%, functions 78.62% |
| `vite build` | PASS, production assets and PWA generated |
| `size-budget.mjs` | PASS, first-load 182.8 KiB gzip against 184 KiB |

Skipped tests are external-file integrations: two MMAP tests gated on `MMAP_FILE`, one SimpleMind sample test. No real file or MindManager execution was supplied. Existing synthetic MMAP tests: 55 passed, 2 skipped. Existing browser-facing tests use jsdom; this is not an interactive browser or visual audit.

Warnings retained: jsdom focus/print/navigation stubs; an ineffective dynamic import of `mermaid.ts`; a minified chunk over 500 KiB. They did not fail the gate. No thresholds, tests or source were changed to hide a failure.

Archived command output: [baseline-gate.txt](evidence/baseline-gate.txt), [install.txt](evidence/install.txt). Later audit additions are validated separately; see [final-checks.txt](evidence/final-checks.txt).

## Architecture locations

| Concern | Source | Finding |
|---|---|---|
| Canonical model | `src/model/types.ts` | `MindMapDoc`, `MapNode`, relationships, boundaries, task/style/image/attachment fields; no format XML in UI model |
| Defensive normalization | `src/model/normalize.ts` | Object spreads generally preserve extra properties, but safety coercion changes invalid values; not a proven preservation contract |
| React Flow projection | `src/mindmap/flow/project.ts`, `buildFlowState.ts`, `sync.ts` | Document → nodes/edges; editor sync back to canonical tree |
| Editor contract | `src/mindmap/contract.ts`, `src/mindmap/FlowMindMap.tsx` | Replaceable renderer boundary; editing/selection/layout are existing functionality |
| Native persistence | `src/io/json.ts`, `src/io/fileSystem.ts` | `.mmst`/JSON serialization; disk binding applies to native files |
| Browser library | `src/store/mapStore.ts`, `src/hooks/useIdbAutosave.ts` | IndexedDB maps, handles and versions; snapshot cloning |
| MMAP import | `src/import/mmap.ts` | ZIP/XML → selected canonical fields, lossy source conversion |
| MMAP export | `src/io/mmap.ts` | Regenerated XML/ZIP, not patch-oriented |
| XMind | `src/io/xmind.ts` | Modern JSON and legacy XML read; modern JSON write; independent adapter |
| Other formats | `src/io/importDispatch.ts`, `src/io/*` | OPML, Markdown, FreeMind, Mermaid, other interchange adapters |

MMAP opening is explicitly a one-way import in `src/io/fileSystem.ts`; it is not bound to automatic source-file overwrite. Existing native autosave is not an MMAP preservation engine.

## Feasibility

The model/renderer/adapter separation is a practical foundation. No architectural blocker to a separate MapBridge layer was found. However, source bytes, namespaces, unknown properties, identity mappings, dirty tracking and compatibility reports do not exist today. Preserve those through editor/undo/persistence paths in later work, backed by tests. Reusing the existing writer unchanged would fail Maploom's central requirement.

License scope and default-build book inclusion are documented separately in [P0C](P0C_LICENSE_PROVENANCE.md). No release is approved by this audit.
