# Phase 0 evidence

Baseline commit: `65964ac06937514cf9805a2b1198cc20f1e83425`. Captured 2026-10-25 on Windows x64. No customer samples or MindManager binaries.

- `baseline-metadata.json`: exact source/toolchain identity and command outcomes.
- `install.txt`: frozen-lockfile installation output.
- `baseline-gate.txt`: full original gate output, before adding Maploom audit tests.
- `mmap-audit.txt` / `mmap-audit.junit.xml`: ten synthetic upstream-loss witness results.
- `dependency-licenses.json`: 523 installed package/version records, normalized from pnpm license metadata.
- `why-lightningcss.txt`: dependency-path evidence for MPL build tooling.
- `final-checks.txt`: typecheck/lint/deadcode validation after additive audit files.

Command logs preserve warnings, skipped tests and counts. Windows PowerShell wraps native stderr in a `NativeCommandError` display even when a command exits successfully; the original gate's exit code was independently captured as **0**. This display wrapper was retained to avoid concealing evidence.

For publication hygiene, archive paths are replaced with `<workspace>` / `<toolchain>` and the JUnit machine hostname with `<local-machine>` (XML escaped). Raw logs remain only under ignored `.tmp/phase0-toolchain/`. The normalized dependency inventory never contains local paths. Archive files are evidence snapshots, not acceptance certificates.

Re-run the original gate with `pnpm gate` (now includes the ten new tests), or the audit with `pnpm exec vitest run test/phase0-mmap-audit.test.ts`. Use the local `.cmd` helper documented in `phase0-report.md` if Node/pnpm are not on PATH.
