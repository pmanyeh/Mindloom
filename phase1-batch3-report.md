# Mindloom — Phase 1 Batch 3 report

日期：2026-10-26（Asia/Taipei）。範圍：P1D real corpus intake 與 Phase 1 final evidence；**不含 Phase 2**。

**Result: BLOCKED ON REAL-CORPUS ACQUISITION。** 使用者已明確確認「暫無來源；完成 intake 流程後標示 BLOCKED」。本機常見安裝位置、uninstall/COM 登錄與專案中未找到可用來源；未據此斷言整台機器一定沒有 MindManager，也未假定安裝等於合法授權。沒有全磁碟蒐集私人檔案或下載來路不明樣本。

## Baseline and integration

- 已 fetch origin，驗證接受的 Batch 2 `661c271e40ab4dc7d22391abea7d9db7f48b89cb` 是 Batch 1 `802d2b4190f267bd1dc07956c635a202962ea2fb` 的 descendant。
- 本機與遠端 main 原為 `802d2b4`，以 `--ff-only` 整合到 `661c271`，只推 origin；沒有 history rewrite 或 force-push。
- 整合後 main [CI 已通過](https://github.com/pmanyeh/Mindloom/actions/runs/40266849726)，再建立 `feature/p1-batch3-real-corpus`。
- 本次提交為 `test: add provenance-controlled real corpus intake`（包含本報告；精確 SHA 於交付訊息提供）。

## Acquisition outcome

| 類別 | 真實樣本數 | 結果 |
|---|---|---|
| MindManager-generated synthetic content | 0 | 無已確認合法可用的產生來源 |
| Sanitized real-world | 0 | 未提供具有權限與 sanitization 證據的來源 |
| Public authorized sample | 0 | 未取得，亦未以「可下載」代替許可 |
| Private local-only | 0 | 使用者確認暫無來源 |

Modern-minimal、modern-feature-mixed、deep/wide/large、multiple-images、attachment、legacy 八個 target 全部 pending。Producer/version/platform/generation 沒有實際觀察值；不以 2003 namespace 推測版本。Real-public manifest 的 samples 為空，沒有 raw package 或 raw hash 被提交。

## Delivered intake infrastructure

- `test/fixtures/mmap-corpus/real-public/manifest.json`、`manifest.schema.json`：來源類別、權限、隱私、公私分離、nullable fingerprints 與完整 target matrix。
- `tools/mmap-real/manifest.ts`：required/extra fields、opaque IDs、safe relative paths、來源/發布政策與 cross-record consistency 檢查。
- `tools/mmap-real/intake.ts`：有界唯讀 local inspection、private-only 詳細輸出、匿名結構 candidate、選用 current-import counts；不執行 writer。
- `tools/mmap-real/legacy-ts-resolver.mjs`：僅供 opt-in 本機 baseline 載入既有 extensionless TS imports，不修改 production reader。
- `tools/mmap-real/status.ts`、`tools/mmap-real-cli.ts`：deterministic status、14 個 NO_REAL_SAMPLE comparison rows、feature inventory 與 local intake 命令。
- `tools/mmap-real/local-intake.example.json`：尚未填入來源路徑與權限的無效安全模板；必須在 ignored private copy 填入真實資料。
- `test/mmap-real-corpus.test.ts`：製造資料的流程／隱私／安全測試，**不是 genuine real-file validation**。
- `docs/format/MMAP_REAL_CORPUS.md`、`docs/compatibility/PHASE1_FEATURE_INVENTORY.md`、本報告與 `phase1-report.md`：政策、資料缺口、現有解析/寫出/保留能力與 Phase 1 consolidation。
- `AGENTS.md` 僅對齊本次授權及使用者的暫無來源結論；README/CHANGELOG 增加入口與阻塞狀態。無新依賴，無 lockfile 變更。

## Commands

```powershell
pnpm --silent mmap-real:status
pnpm --silent mmap-real:status --format markdown
pnpm mmap-real:intake .tmp/mmap-corpus/real-private/intake.json
pnpm exec vitest run test/mmap-real-corpus.test.ts test/mmap-corpus.test.ts test/mmap-inspector.test.ts test/phase0-mmap-audit.test.ts test/mmap.test.ts
pnpm gate
```

本機可用 `.\tools\phase0\pnpm-local.cmd` 取代 pnpm。Intake 只產生 ignored private/candidate JSON，不加入 Git、不覆寫來源；producer 資訊為 operator-declared，不等於已驗證的 genuine provenance。`status` 命令成功不代表 Phase 1 PASS。

## Observation matrix / synthetic vs real

完整 machine-readable status 與 comparison evidence 隨驗證輸出附上。14 個 synthetic slots 對應的真實證據皆為 **NO_REAL_SAMPLE**，real paths、namespaces、extra structure 都是 null。不得用 empty arrays 或零差異宣稱 match。不存在已觀察到的 SYNTHETIC_MATCH/PARTIAL_MATCH/REAL_HAS_EXTRA_STRUCTURE/ASSUMPTION_WRONG。

| High-value question | Answer in this batch |
|---|---|
| 真實 package paths 是否符合 synthetic assumptions？ | 未觀察；沒有真實 package |
| Document.xml 實際位置是否一致？ | 未觀察，不能宣稱 always at root |
| Namespace / version 出現哪些世代？ | 未觀察；版本不可由 namespace 推論 |
| MindManager 加入哪些額外 ZIP entries？ | 未觀察 |
| Preview/bin/xsd layout 是否一致？ | 未觀察 |
| Current known structures 是否符合真實檔？ | 未驗證，仍限 synthetic/static audit |
| 哪些 real structures unrecognized？ | 未觀察 |
| 哪些 synthetic assumptions 錯誤？ | 沒有真實對照，不自行修正 |
| Summary 真實 encoding？ | **pending-format-evidence**，尚非 DISCOVERED |
| Minimal real file 的未知 attrs/elements？ | 未觀察 |
| App / producer version metadata？ | 未觀察，沒有虛填版本 |
| IDs/refs 是否 stable-looking 或 regenerated？ | 沒有 real-input 跨存檔觀察；保留 Phase 0 已知換 ID 損失結論 |
| Resource URI forms？ | 未觀察；synthetic mmarch 不是實證 |
| Relations/boundaries/callouts 額外 wrappers？ | 未觀察 |
| Notes 是否符合 synthetic XHTML 假設？ | 未驗證 |

## No-op / loss baseline

**NOT OBSERVED ON REAL INPUT。** 沒有實際 real-file import success、topic/feature counts、warnings 或 writer output。製造測試資料只證明 opt-in current-import runner 可執行，不能補足這個 gate。Intake 沒有呼叫現有 writer；沒有 output 覆寫或 preservation 實作。

## Validation

- Focused：5 個測試檔通過，142 passed / 2 skipped（既有略過），包括 21 個新增 intake/privacy/security tests；全部輸入均為 manufactured probes，沒有 genuine real-file validation。
- 完整 `pnpm gate`：**PASS**。TypeScript、Biome、Knip、feature catalogue、coverage suite、Vite/PWA build 與 size budget 均完成；223 個測試檔、2,571 passed / 3 skipped（既有略過）。未降低 thresholds、修改既有 loss witnesses 或新增 skip。
- Coverage：statements/lines **90.59%**、branches **87.23%**、functions **78.79%**。首載 **182.8 kB gzip ≤184 kB**；保留既有 large-chunk warning。PowerShell log 中的 `NativeCommandError` 為 native stderr 重新導向的包裝，fail-fast gate 已完成最後的容量/CSS 檢查。
- 證據：[validation metadata](docs/audit/phase1-batch3/validation.json)、[full gate](docs/audit/phase1-batch3/gate.txt)、[focused output](docs/audit/phase1-batch3/focused.txt)、[focused JUnit](docs/audit/phase1-batch3/focused.junit.xml)、[status / comparison / inventory](docs/audit/phase1-batch3/status.json.txt)、[baseline integration](docs/audit/phase1-batch3/baseline-integration.txt)。公開 logs 已移除 workspace 路徑與機器名稱；私有原檔與其 fingerprints 均未納入。

以上為 **tooling validation PASS**；實際 real inspections 為 **0**，Batch 3 / Phase 1 結果仍是 **BLOCKED ON REAL-CORPUS ACQUISITION**。分支 CI 與交付 commit SHA 於交付時提供，不將尚未發生的遠端執行寫成通過。

## Acceptance / blockers

| Gate | Result |
|---|---|
| Accepted Batch 2 整合 main + CI | PASS |
| Provenance schema / workflow / public-private separation | Implemented |
| 至少一份 genuine `.mmap` 已檢查 | **BLOCKED** |
| 真實 package/XML inventory、real-vs-synthetic observed comparison | **BLOCKED** |
| Real-input current-behavior baseline | **BLOCKED** |
| 真實 Summary / versions / target coverage | Pending acquisition |
| Unsafe private raw packages committed | None |
| Existing importer/writer/model/knowledge/loss tests altered | None |
| Phase 2 started | No |

## Stop condition

依附件第 25 節，完成 intake/schema/separation/tooling/缺口紀錄後停止。Phase 1 **尚未完成**。需要可合法使用的真實來源與權限／隱私證據，才能繼續 P1D discovery；Phase 2 仍須另外明確授權。本批未建一般 Oracle harness、未作 REA、未修復 writer、未將新結構自動標 known。
