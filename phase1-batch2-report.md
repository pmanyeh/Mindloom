# Mindloom — Phase 1 Batch 2 report

日期：2026-10-26（Asia/Taipei）。授權範圍：**P1C Synthetic Corpus only**。

**Overall result: PASS。** 14 槽已記錄，13 份套件可重現；`13-summary` 誠實保留 pending-format-evidence，符合本批次驗收規則。

## Baseline integration

- 起始狀態：本機與 `origin/main` 均為 `e2e3931664c45b476db75f7df9121035c8dc6654`；Batch 1 功能分支為接受的 `802d2b4190f267bd1dc07956c635a202962ea2fb`。
- 已 fetch `origin` 並驗證 `b9c1c99b26e5c7fe51b44afd50d2c775002a8e88` 是接受 head 的 ancestor；兩個指定提交完整保留。
- `main` 以 `--ff-only` 整合至 `802d2b4190f267bd1dc07956c635a202962ea2fb` 並推送至 `origin/main`，未 rewrite shared history、未 force-push、未推 upstream。
- 整合後的 [GitHub CI](https://github.com/pmanyeh/Mindloom/actions/runs/40217549245) 已成功；上游部署／Stats 流程依既有 guard 跳過。
- Batch 2 baseline commit：`802d2b4190f267bd1dc07956c635a202962ea2fb`。
- 新分支：`feature/p1-batch2-synthetic-corpus`，直接由上述 baseline 建立。

## Commits produced

本批次以 focused commit `test: add deterministic synthetic MMAP corpus` 交付，包含本報告與驗證證據。確切 SHA 於交付訊息提供，也可從功能分支執行 `git log -1 --format=%H` 取得；報告不嵌入自身 commit hash。基線整合採 fast-forward，沒有額外 merge commit。

## Implementation / files added or changed

| 檔案 | 用途 |
|---|---|
| `test/fixtures/mmap-corpus/synthetic/manifest.json` | 14 槽 machine-readable manifest、逐案例 provenance／source evidence／期望與限制 |
| `test/fixtures/mmap-corpus/synthetic/documents/*.xml` | 13 份可讀的最小 synthetic XML 定義；沒有 `13-summary.xml` |
| `tools/mmap-corpus/builder.ts` | Manifest 驗證、來源 containment、tiny PNG、固定 ZIP builder；不使用 application writer |
| `tools/mmap-corpus-cli.ts` | 固定輸出至 `.tmp/mmap-corpus/synthetic/` 的 generator；每個案例同時 inspect/normalize |
| `test/mmap-corpus.test.ts` | 完整 corpus／manifest／reference／安全性／可重現性與實際 CLI 驗證 |
| `package.json`, `tsconfig.json` | 新增 generation script 與 CLI typecheck entry；沒有依賴或 lockfile 變更 |
| `AGENTS.md` | 對齊本次 Batch 2 授權與停止邊界，保留 upstream 禁止推送規則 |
| `README.md`, `CHANGELOG.md` | 工具入口與內部測試基礎設施紀錄；保留上游來源歷史 |
| `docs/format/MMAP_SYNTHETIC_CORPUS.md` | 產生方法、fixture matrix、分類與限制 |
| `docs/audit/phase1-batch2/` | Focused/full gate、機器可讀驗證與 package fingerprints 證據 |

## Fixture matrix

所有案例均為 **synthetic**；known 代表 current-adapter vocabulary，不代表 MindManager validity。其完整 counts／paths／source evidence 以 manifest 為準。

| ID | Feature | Generated? | Provenance | Known additions to root | Unrecognized | Resources | Limitation |
|---|---|---|---|---|---|---|---|
| 01-root-only | root-only | yes | synthetic | Map/OneTopic/Topic/Text | none | none | 僅檢查基準，非 native template |
| 02-three-level-tree | three-level-tree | yes | synthetic | 三層 Topic/SubTopics | none | none | 無 layout 計算 |
| 03-notes | notes | yes | synthetic | NotesGroup/NotesXhtmlData/html/body/p | XHTML `b` | none | importer flatten；不保證 rich-note fidelity |
| 04-links | links | yes | synthetic | Hyperlink | none | none | 僅 example.invalid synthetic URL |
| 05-icons | icons | yes | synthetic | IconsGroup/Icons/Icon Flag | none | none | 單一 evidence-backed marker |
| 06-tags | tags | yes | synthetic | TextLabels/TextLabel | none | none | 單一固定 tag |
| 07-task | task | yes | synthetic | Task priority/percentage/dates/resources | none | none | 無 calculation/roll-up |
| 08-image | image | yes | synthetic | OneImage/Image/ImageData/ImageSize/Core Uri | none | `bin/synthetic-pixel.png` | 自製 1×1 PNG；mm display size 與 raster size 分開 |
| 09-relationship | relationship | yes | synthetic | Root/child 與兩個 ObjectReference | none | none | 只驗 fixture 內部參照 |
| 10-boundary | boundary | yes | synthetic | OneBoundary/Boundary | none | none | root subtree；無 span/geometry 推論 |
| 11-callout | callout | yes | synthetic | Parent FloatingTopics/Topic/CalloutFloatingTopicShape | none | none | 現有 writer 會遺失，測試明示 |
| 12-floating | floating | yes | synthetic | Map-level FloatingTopics/Topic | none | none | 不假裝保留位置 |
| 13-summary | summary | **no: pending-format-evidence** | synthetic | 未宣稱 | 未宣稱 | none | 缺 MMAP encoding 證據，不編造 payload |
| 14-mixed | mixed | yes | synthetic | 組合前列已證實的 tree、notes、link、icon、tag、task、image、relationship、boundary、callout、floating | XHTML `b` | `bin/synthetic-pixel.png` | coexistence only；沒有 summary |

`13-summary` pending 的依據為 accepted importer 的 dropped-summary 註解、writer 的 omitted-summaries 註解與 P0B audit；canonical/UI Summary 功能不足以建立 MMAP 編碼。這是本批次允許的缺證據結果。

## Commands

```powershell
pnpm --silent mmap-corpus:generate
pnpm mmap-inspect .tmp/mmap-corpus/synthetic/08-image.mmap
pnpm --silent mmap-normalize .tmp/mmap-corpus/synthetic/08-image.mmap
pnpm exec vitest run test/mmap-corpus.test.ts test/mmap-inspector.test.ts test/phase0-mmap-audit.test.ts test/mmap.test.ts
pnpm gate
```

本機以 `.\tools\phase0\pnpm-local.cmd` 取代 `pnpm`，使用已存在的 Node 24.22.1／pnpm 11.0.9。原始 XML 與 manifest 都在 repository 中；產生的 ZIP／inspect／normalize 結果在 ignored `.tmp/`，不提交不透明 binaries。

## Reproducibility and structural evidence

- ZIP entry 排序、IDs、resource paths、XML content 固定；LF/CRLF 來源統一為 LF。
- fflate 的 DOS timestamp 使用固定 local wall clock `1980-01-01 00:00:00`；避免固定 UTC instant 在不同 TZ 寫出不同時間欄位。
- Tests 比較兩次 generation 的完整 bytes、normalized JSON 與 SHA-256，並在 UTC / Asia-Taipei 子行程重跑。
- 每個 materialized fixture 都透過真實 Node `inspect` 與 `normalize` CLI 執行；完整元素／屬性 counts、selected paths、namespace、known/unknown、package entries 與 reference facts 對照手工審閱的 manifest。
- 全部 resource URIs 指向真實 package entries，relationship endpoints 指向 fixture 內唯一 Topic OIds。PNG 僅一個 opaque RGBA pixel；CRC 與 pixel bytes 另用 Node zlib 驗證。
- 沒有根據 inspector output 盲目更新 golden snapshots；manifest expected facts 是從可讀定義與 adapter 證據整理。

## Validation

- Focused：**4 個測試檔、121 passed、2 skipped（123 total）**；新增 corpus tests **24/24**，Batch 1 inspector **32/32**，Phase 0 loss witnesses **10/10**，原有 MMAP **55 passed、2 skipped**。
- Full `pnpm gate`：**exit 0；222 個測試檔、2,550 passed、3 skipped（2,553 total）**。Typecheck、Biome、Knip、feature catalogue、coverage、production/PWA build、size budget 均通過，未修改門檻。
- Coverage：statements/lines **90.62%**、branches **87.25%**、functions **78.79%**。First-load JS **182.8 KiB gzip ≤ 184 KiB**。
- Corpus package size 範圍 **329–1,040 bytes**。兩次 generation、跨 UTC / Asia-Taipei、LF / CRLF source 的 byte equality 與 normalized equality 全部通過；13 個 package fingerprints 已另存。
- 3 個 skipped tests 仍是原有的兩個 MMAP_FILE 與一個 SimpleMind 外部樣本案例；沒有新增 skip。
- 原有 jsdom focus/print/navigation、Vite dynamic-import/chunk-size 提醒仍保留在完整輸出中，未隱藏或放寬檢查。

證據：[focused.txt](docs/audit/phase1-batch2/focused.txt)、[focused.junit.xml](docs/audit/phase1-batch2/focused.junit.xml)、[gate.txt](docs/audit/phase1-batch2/gate.txt)、[validation.json](docs/audit/phase1-batch2/validation.json)、[corpus-index.json.txt](docs/audit/phase1-batch2/corpus-index.json.txt)、[baseline-integration.txt](docs/audit/phase1-batch2/baseline-integration.txt)。

完整 gate 輸出只去除本機絕對路徑／hostname、ANSI 色碼並統一換行；所有警告、skip、計數保留。原始本機 log 的 SHA-256 也記錄於 validation.json，原檔留在 ignored `.tmp/`。PowerShell 的 native stderr 顯示包裝不等於程序失敗；exit 0 已另行確認。測試環境為 Windows x64、Node 24.22.1、pnpm 11.0.9。

## Acceptance gate

| 驗收項目 | 結果 |
|---|---|
| Accepted Batch 1 整合 main、共享歷史完整 | PASS |
| 14 槽 manifest、逐案例 synthetic provenance | PASS |
| 13 個 evidence-backed fixtures 可重現產生 | PASS |
| 功能隔離、known/unknown、inspect/normalize golden facts | PASS |
| Byte／normalized regeneration、跨時區重現 | PASS |
| Resource／reference integrity 與安全性測試 | PASS |
| Summary encoding 不捏造，pending 明示 | PASS |
| 無 real/customer/proprietary corpus data | PASS |
| 既有回歸完整保留、full gate 通過 | PASS |
| 無 Batch 3／P1D／Oracle／Phase 2 工作 | PASS |

## Inspector regressions discovered/fixed

目前 corpus 未揭露需要修改 Batch 1 inspector 的 regression；`b` wrapper 的 unrecognized 分類為既有明確 vocabulary 邊界，不透過加白名單把它隱藏。Batch 1 inspector、inventory、normalizer 與既有測試均保持原樣。

## Dependencies / limitations / negative claims

無新 dependencies，無 lockfile 變更；沿用已稽核的 fflate，Node built-ins 用於檔案、hash 與測試驗證。Generator 只讀取 corpus 定義，限制來源 32 KiB、最多四個 tiny resources、嚴格限制 entry 路徑，禁止 DTD/ENTITY，避免 path traversal、任意 extraction 或網路存取。所有目前案例均小於 4 KiB。

Synthetic ≠ MindManager-generated；known ≠ Oracle verified；inspected ≠ round-trip-safe；writer-generated ≠ compatibility；unknown ≠ invalid。Manifest 的相關 claims 均明示為 false，並由測試防止誤標。既有 reader/writer callout loss 只作既有行為觀察，沒有建立新的 round-trip engine。

## Phase boundary confirmation / recommendation

**No Phase 2 preservation behavior was implemented.** 沒有 source snapshot、raw/unknown XML preservation、unknown ZIP save preservation、compatibility envelope、source-ID mapping、dirty tracking、patch writer、mmap-diff、Oracle harness 或 REA research。沒有加入 real/customer/proprietary data；沒有開始 Batch 3 / P1D。

Batch 2 完成後停止供審閱。建議下一步在另外授權的 Batch 3 建立具有明確授權、來源與去識別流程的 real corpus；先記錄真實版本差異與 inspection evidence，不先改 save behavior。此建議不是執行授權。
