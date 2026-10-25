# P0C — License and provenance audit

Date: 2026-10-25. Baseline: `65964ac06937514cf9805a2b1198cc20f1e83425`.

**Result: acceptable for local software evaluation; conditional for a Maploom release.** This records inspected license declarations and file scope, not a legal opinion or blanket distribution clearance.

## First-party scope

| Material | Declared license | Use in this phase | Distribution impact / decision |
|---|---|---|---|
| `src/`, `test/`, `scripts/`, build configuration | Apache-2.0 (`LICENSE`, README license section) | Unmodified software baseline; isolated audit additions | Keep license, copyright/attribution and notices; identify modified files. Accepted for development. |
| `docs/guide/` and assembled book PDF/EPUB | CC BY-NC 4.0 (`LICENSE-BOOK`) | Local upstream inspection only | **Not approved as part of a permissively licensed/commercial Maploom release.** Exclude from that release or obtain permission; do not relabel Apache. |
| `public/Thinking-in-Maps.pdf`, `.epub` | Book license above | Existing upstream artifacts | Copied by default Vite build into `dist/`, confirmed locally. Current dist is not cleared for product redistribution. |
| Names/trademarks and third-party references | See `NOTICE.md` | Preserved notices | No affiliation/endorsement or rights in third-party works inferred. |

The two first-party license scopes are explicit and separable. This audit retains upstream files locally and does not deploy or distribute the build. Packaging must enforce the selected software-only product scope before release. No commercial-book use is authorized or assumed.

Primary source files fixed to the audited commit: [LICENSE](https://github.com/dannbleeker/mindmap-studio/blob/65964ac06937514cf9805a2b1198cc20f1e83425/LICENSE), [LICENSE-BOOK](https://github.com/dannbleeker/mindmap-studio/blob/65964ac06937514cf9805a2b1198cc20f1e83425/LICENSE-BOOK), [NOTICE.md](https://github.com/dannbleeker/mindmap-studio/blob/65964ac06937514cf9805a2b1198cc20f1e83425/NOTICE.md).

## Direct dependencies (exact installed/locked versions)

Approval “dev” means accepted for this local development/audit scope. “Notice” means artifact redistribution still requires the corresponding third-party notices review. The development/runtime label is the manifest location, not proof of bundle exclusion: for example `pdf-lib` and Workbox may ship in browser output even though declared under devDependencies.

| Dependency | Version | Declared license | Use | Distribution impact | Approved? |
|---|---|---|---|---|---|
| @xyflow/react | 12.11.0 | MIT | Canvas | Notice | dev; notice before release |
| d3-hierarchy | 3.1.2 | ISC | Layout | Notice | dev; notice before release |
| fast-xml-parser | 4.5.6 | MIT | XML adapters | Notice | dev; notice before release |
| fflate | 0.8.3 | MIT | ZIP/package adapters | Notice | dev; notice before release |
| idb | 8.0.3 | ISC | IndexedDB | Notice | dev; notice before release |
| react | 19.2.7 | MIT | UI runtime | Notice | dev; notice before release |
| react-dom | 19.2.7 | MIT | UI runtime | Notice | dev; notice before release |
| @biomejs/biome | 1.9.4 | MIT OR Apache-2.0 | Lint/format | Choose MIT; tool-only | dev |
| @testing-library/dom | 10.4.1 | MIT | Tests | Tool-only | dev |
| @testing-library/react | 16.3.2 | MIT | Tests | Tool-only | dev |
| @testing-library/user-event | 14.6.1 | MIT | Tests | Tool-only | dev |
| @types/d3-hierarchy | 3.1.7 | MIT | Type definitions | Tool/source notices | dev |
| @types/node | 25.9.2 | MIT | Type definitions | Tool/source notices | dev |
| @types/react | 19.2.17 | MIT | Type definitions | Tool/source notices | dev |
| @types/react-dom | 19.2.3 | MIT | Type definitions | Tool/source notices | dev |
| @vitejs/plugin-react | 6.0.2 | MIT | Build | Tool-only | dev |
| @vitest/coverage-v8 | 2.1.9 | MIT | Coverage | Tool-only | dev |
| fake-indexeddb | 6.2.5 | Apache-2.0 | Tests | Tool-only | dev |
| jsdom | 29.1.1 | MIT | DOM tests | Tool-only | dev |
| jszip | 3.10.1 | MIT OR GPL-3.0-or-later | Book/test tooling | Explicitly choose MIT | dev under MIT |
| knip | 6.16.1 | ISC | Dead-code check | Tool-only | dev |
| marked | 18.0.5 | MIT | Manual generation | Tool-only; generated content separate | dev |
| pdf-lib | 1.17.1 | MIT | PDF generation/export | Notice; browser export chunk | dev; notice before release |
| typescript | 5.9.3 | Apache-2.0 | Compile/typecheck | Tool-only | dev |
| vite | 8.0.16 | MIT | Build/dev server | Tool-only | dev |
| vite-plugin-pwa | 1.3.0 | MIT | PWA build | Review generated runtime notices | dev; notice before release |
| vitest | 2.1.9 | MIT | Tests | Tool-only | dev |
| workbox-window | 7.4.1 | MIT | Service-worker runtime | Notice; generated browser chunk | dev; notice before release |

## Full installed graph and material exceptions

`pnpm licenses list --json` and `pnpm licenses list --prod --json` were collected after the frozen install. [dependency-licenses.json](evidence/dependency-licenses.json) contains **523 package/version records**, with exact names, versions, declarations, dependency-graph classification, direct dependency status, use, distribution impact and audit-scope decision. There are 31 production-graph and 492 development-only records. This differs from 530 installed instances because peer contexts/platform packages and package-version records are different counts.

This is a Windows-installed graph metadata inventory, **not a final artifact SBOM**. A development-only classification does not prove a module is absent from bundled/generated output. Optional packages for other platforms are not fully covered. Every installed package's license text has not received a manual legal review; the inventory is based on manifest declarations, with targeted text checks for exceptions below.

| Material exception | Version | Declaration | Finding / disposition |
|---|---|---|---|
| jszip | 3.10.1 | MIT OR GPL-3.0-or-later | Installed `LICENSE.markdown` explicitly offers choice; choose MIT, not mandatory GPL. |
| lightningcss | 1.32.0 | MPL-2.0 | Installed LICENSE checked. Build/test dependency through Vite 8 and Vitest's Vite 5; not in manifest production graph. Accepted as local tooling, not approved for unreviewed tooling redistribution. |
| lightningcss-win32-x64-msvc | 1.32.0 | MPL-2.0 | Native build-tool binding; same review boundary. |
| caniuse-lite | 1.0.30001797 | CC-BY-4.0 | Installed LICENSE checked; browser-support build data. Assess attribution in published/generated artifacts. |
| Transitive Vite | 5.4.21 | MIT | Vitest 2 uses a second Vite; not the direct application build version. |
| Transitive idb | 7.1.1 | ISC | Separate tooling graph version; application direct dependency remains 8.0.3. |

Other installed declaration families: MIT, ISC, Apache-2.0, BSD-2/3-Clause, 0BSD, MIT-0, BlueOak-1.0.0, CC0-1.0, MIT AND Zlib and offered permissive alternatives. Preserve their applicable terms. No unknown license group or AGPL declaration was reported in this installed graph. This does not certify an uninspected third-party binary or future dependency.

## Provenance boundaries

- The repository/commit and first-party license scopes were obtained from the actual upstream; no reliance on the master plan's Apache-only shorthand.
- No `mmap-tools` code was fetched or copied, and no AGPL project was added as a dependency.
- No MindManager proprietary DLL, executable, installer or customer `.mmap` was added. The tracked baseline contains no `.xsd`, `.mmap`, `.dll` or `.exe` files. Portable Node is official development tooling stored under ignored `.tmp/`, not a MindManager binary or product source asset.
- Upstream importer/README/NOTICE claim a bundled/publicly distributed MindManager XSD as provenance. No XSD file is present in this commit. This audit cannot independently substantiate that source claim; it records it as an evidence gap, not as proof of schema authority or proof of infringement. Do not import/relicense proprietary schema/code on that basis.
- Existing writer contains namespace/default metadata literals described upstream as coming from a real export. They were left unchanged; no new external sample/constants were copied.
- Added audit fixtures are small inline synthetic XML/byte strings authored for this audit. No real customer data was searched, copied or committed.
- Archived evidence omits local absolute paths, machine hostname and private package author details. No remote publication occurred.

## Reproduction

From the repository root after a frozen install:

```powershell
New-Item -ItemType Directory -Path .tmp/phase0-toolchain -Force | Out-Null
pnpm licenses list --json | Out-File .tmp/phase0-toolchain/licenses.json -Encoding utf8
pnpm licenses list --prod --json | Out-File .tmp/phase0-toolchain/licenses-prod.json -Encoding utf8
pnpm why lightningcss
pnpm exec node tools/phase0/license-inventory.mjs
```

Use `tools/phase0/pnpm-local.cmd` instead of `pnpm` to use the existing local audit toolchain on this machine. The generator strips machine paths and reads root package versions to distinguish direct dependencies from same-name transitive versions.

## Release conditions

Retain the software base. Before distributing Maploom, define an explicit software-only artifact set, exclude the NC book or obtain permission, generate artifact-accurate notices, and review any shipped tooling/native modules. If the product requires bundling the NC book without permission or requires blanket permissive licensing for shipped MPL tooling, that is a release blocker; stop rather than silently treating it as Apache/MIT. None of those distribution actions was undertaken in Phase 0.
